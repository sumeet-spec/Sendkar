import crypto from "node:crypto";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const outboundWebhooksQueryMock = vi.fn();
const deliveriesInsertMock = vi.fn();
const deliveriesSingleMock = vi.fn();
const deliveriesUpdateEqMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === "outbound_webhooks") {
        return { select: () => ({ eq: () => ({ eq: () => outboundWebhooksQueryMock() }) }) };
      }
      if (table === "webhook_deliveries") {
        return {
          insert: (row: Record<string, unknown>) => {
            deliveriesInsertMock(row);
            return { select: () => ({ single: deliveriesSingleMock }) };
          },
          update: (fields: Record<string, unknown>) => ({ eq: (col: string, val: unknown) => deliveriesUpdateEqMock(fields, col, val) }),
        };
      }
      throw new Error(`outboundWebhooks.test.ts: no mock wired for table "${table}"`);
    },
  }),
}));

const assertPublicHttpsUrlMock = vi.fn().mockResolvedValue(undefined);
class MockUnsafeWebhookUrlError extends Error {}
vi.mock("@/lib/ssrf", () => ({
  assertPublicHttpsUrl: assertPublicHttpsUrlMock,
  UnsafeWebhookUrlError: MockUnsafeWebhookUrlError,
}));

const captureExceptionMock = vi.fn();
vi.mock("@sentry/nextjs", () => ({ captureException: captureExceptionMock }));

const { dispatchOutboundWebhooks } = await import("./outboundWebhooks");

const WEBHOOK = { id: "wh-1", url: "https://customer-endpoint.example.com/hook", secret: "wh-secret", events: ["contact.created"] };

beforeEach(() => {
  outboundWebhooksQueryMock.mockReset().mockResolvedValue({ data: [WEBHOOK] });
  deliveriesInsertMock.mockReset();
  deliveriesSingleMock.mockReset().mockResolvedValue({ data: { id: "delivery-1" } });
  deliveriesUpdateEqMock.mockReset().mockResolvedValue({ data: null, error: null });
  assertPublicHttpsUrlMock.mockReset().mockResolvedValue(undefined);
  captureExceptionMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("dispatchOutboundWebhooks", () => {
  it("does nothing when no active webhook is subscribed to this event", async () => {
    outboundWebhooksQueryMock.mockResolvedValueOnce({ data: [{ ...WEBHOOK, events: ["message.received"] }] });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await dispatchOutboundWebhooks("ws-1", "contact.created", { contactId: "c1" });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(deliveriesInsertMock).not.toHaveBeenCalled();
  });

  it("signs the delivered payload with the webhook's own secret", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    await dispatchOutboundWebhooks("ws-1", "contact.created", { contactId: "c1", phone: "919999999999" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(WEBHOOK.url);
    const sentBody = init.body as string;
    const parsed = JSON.parse(sentBody);
    expect(parsed).toMatchObject({ event: "contact.created", data: { contactId: "c1", phone: "919999999999" } });

    const expectedSignature = crypto.createHmac("sha256", WEBHOOK.secret).update(sentBody).digest("hex");
    expect(init.headers["X-Sendkar-Signature"]).toBe(`sha256=${expectedSignature}`);
  });

  it("marks the delivery successful on the first try", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    await dispatchOutboundWebhooks("ws-1", "contact.created", {});
    expect(deliveriesUpdateEqMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "success", attempts: 1, response_status: 200 }),
      "id",
      "delivery-1",
    );
  });

  it("retries with backoff (0s, 2s, 8s) and succeeds once the endpoint recovers", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    const promise = dispatchOutboundWebhooks("ws-1", "contact.created", {});
    await vi.runAllTimersAsync();
    await promise;

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(deliveriesUpdateEqMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "success", attempts: 3, response_status: 200 }),
      "id",
      "delivery-1",
    );
  });

  it("marks the delivery failed after exhausting all 3 attempts", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    const promise = dispatchOutboundWebhooks("ws-1", "contact.created", {});
    await vi.runAllTimersAsync();
    await promise;

    expect(deliveriesUpdateEqMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "failed", attempts: 3, last_error: "HTTP 503" }),
      "id",
      "delivery-1",
    );
  });

  it("never sends the request and reports it to Sentry when the URL fails the SSRF re-check", async () => {
    assertPublicHttpsUrlMock.mockRejectedValueOnce(new MockUnsafeWebhookUrlError("This address isn't allowed for outbound webhooks."));
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await dispatchOutboundWebhooks("ws-1", "contact.created", {});

    expect(fetchMock).not.toHaveBeenCalled();
    expect(captureExceptionMock).toHaveBeenCalledTimes(1);
    // Not retried — a blocked destination won't become safe on attempt 2 or 3.
    expect(deliveriesUpdateEqMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "failed", attempts: 1 }),
      "id",
      "delivery-1",
    );
  });
});
