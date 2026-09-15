import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const sendNotificationMock = vi.fn();
const setVapidDetailsMock = vi.fn();
vi.mock("web-push", () => ({
  default: { sendNotification: sendNotificationMock, setVapidDetails: setVapidDetailsMock },
}));

const { isWebPushConfigured, sendPushNotification, truncateForNotification } = await import("./webPush");

const originalEnv = { pub: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, priv: process.env.VAPID_PRIVATE_KEY };
const SUB = { endpoint: "https://push.example.com/abc", p256dh: "key1", auth_key: "key2" };
const PAYLOAD = { title: "New message", body: "Hi there", url: "/inbox/c1" };

beforeEach(() => {
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "pub-key";
  process.env.VAPID_PRIVATE_KEY = "priv-key";
  sendNotificationMock.mockReset();
  setVapidDetailsMock.mockReset();
});

afterEach(() => {
  if (originalEnv.pub !== undefined) process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = originalEnv.pub; else delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (originalEnv.priv !== undefined) process.env.VAPID_PRIVATE_KEY = originalEnv.priv; else delete process.env.VAPID_PRIVATE_KEY;
});

describe("isWebPushConfigured", () => {
  it("is false when either VAPID key is missing", () => {
    delete process.env.VAPID_PRIVATE_KEY;
    expect(isWebPushConfigured()).toBe(false);
    process.env.VAPID_PRIVATE_KEY = "priv-key";
    delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    expect(isWebPushConfigured()).toBe(false);
  });

  it("is true once both keys are set", () => {
    expect(isWebPushConfigured()).toBe(true);
  });
});

describe("sendPushNotification", () => {
  it("no-ops without throwing when web push isn't configured", async () => {
    delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const result = await sendPushNotification(SUB, PAYLOAD);
    expect(result).toEqual({ delivered: false, expired: false });
    expect(sendNotificationMock).not.toHaveBeenCalled();
  });

  it("reports delivered on success", async () => {
    sendNotificationMock.mockResolvedValueOnce({ statusCode: 201 });
    const result = await sendPushNotification(SUB, PAYLOAD);
    expect(result).toEqual({ delivered: true, expired: false });
  });

  it("sends the endpoint and keys in the shape the push service expects", async () => {
    sendNotificationMock.mockResolvedValueOnce({ statusCode: 201 });
    await sendPushNotification(SUB, PAYLOAD);
    expect(sendNotificationMock).toHaveBeenCalledWith(
      { endpoint: SUB.endpoint, keys: { p256dh: SUB.p256dh, auth: SUB.auth_key } },
      JSON.stringify(PAYLOAD),
    );
  });

  it("treats a 410 (Gone) as an expired subscription, not an error", async () => {
    sendNotificationMock.mockRejectedValueOnce({ statusCode: 410 });
    const result = await sendPushNotification(SUB, PAYLOAD);
    expect(result).toEqual({ delivered: false, expired: true });
  });

  it("treats a 404 the same as a 410", async () => {
    sendNotificationMock.mockRejectedValueOnce({ statusCode: 404 });
    const result = await sendPushNotification(SUB, PAYLOAD);
    expect(result.expired).toBe(true);
  });

  it("re-throws a genuine failure (e.g. a 500 from the push service) instead of swallowing it", async () => {
    sendNotificationMock.mockRejectedValueOnce({ statusCode: 500 });
    await expect(sendPushNotification(SUB, PAYLOAD)).rejects.toBeTruthy();
  });
});

describe("truncateForNotification", () => {
  it("leaves a short body untouched", () => {
    expect(truncateForNotification("Hi there")).toBe("Hi there");
  });

  it("trims surrounding whitespace", () => {
    expect(truncateForNotification("  Hi there  ")).toBe("Hi there");
  });

  it("truncates a long body with an ellipsis at the given length", () => {
    const long = "a".repeat(200);
    const result = truncateForNotification(long, 50);
    expect(result.length).toBe(50);
    expect(result.endsWith("…")).toBe(true);
  });
});
