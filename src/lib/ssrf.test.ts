import { describe, it, expect, vi, beforeEach } from "vitest";

const dnsLookupMock = vi.fn();
vi.mock("node:dns/promises", () => ({ default: { lookup: dnsLookupMock }, lookup: dnsLookupMock }));

const { assertPublicHttpsUrl, UnsafeWebhookUrlError } = await import("./ssrf");

beforeEach(() => {
  dnsLookupMock.mockReset();
});

async function rejects(url: string) {
  await expect(assertPublicHttpsUrl(url)).rejects.toThrow(UnsafeWebhookUrlError);
}

describe("assertPublicHttpsUrl", () => {
  it("rejects a non-https URL", async () => {
    await rejects("http://example.com/hook");
  });

  it("rejects a malformed URL", async () => {
    await rejects("not a url");
  });

  it("rejects known-internal hostnames outright", async () => {
    await rejects("https://localhost/hook");
    await rejects("https://metadata.google.internal/hook");
    await rejects("https://service.internal/hook");
    await rejects("https://myapp.local/hook");
  });

  describe("literal IP hostnames (no DNS lookup needed)", () => {
    it("rejects loopback", async () => {
      await rejects("https://127.0.0.1/hook");
    });

    it("rejects RFC1918 private ranges", async () => {
      await rejects("https://10.0.0.5/hook");
      await rejects("https://172.16.0.5/hook");
      await rejects("https://172.31.255.255/hook");
      await rejects("https://192.168.1.1/hook");
    });

    it("rejects link-local, including the cloud metadata endpoint", async () => {
      await rejects("https://169.254.169.254/hook");
      await rejects("https://169.254.0.1/hook");
    });

    it("rejects multicast/reserved ranges", async () => {
      await rejects("https://224.0.0.1/hook");
    });

    it("accepts a public IPv4 literal without consulting DNS", async () => {
      await expect(assertPublicHttpsUrl("https://8.8.8.8/hook")).resolves.toBeUndefined();
      expect(dnsLookupMock).not.toHaveBeenCalled();
    });

    it("rejects IPv6 loopback, link-local, and unique-local", async () => {
      await rejects("https://[::1]/hook");
      await rejects("https://[fe80::1]/hook");
      await rejects("https://[fc00::1]/hook");
      await rejects("https://[fd00::1]/hook");
    });

    it("rejects an IPv4-mapped IPv6 address that maps to a private range", async () => {
      await rejects("https://[::ffff:127.0.0.1]/hook");
    });

    it("accepts an IPv4-mapped IPv6 address that maps to a public range", async () => {
      await expect(assertPublicHttpsUrl("https://[::ffff:8.8.8.8]/hook")).resolves.toBeUndefined();
    });
  });

  describe("hostnames resolved via DNS", () => {
    it("rejects a hostname that resolves to a private address", async () => {
      dnsLookupMock.mockResolvedValueOnce([{ address: "10.0.0.5", family: 4 }]);
      await rejects("https://internal-service.example.com/hook");
    });

    it("rejects a hostname where any resolved address is private, not just the first", async () => {
      dnsLookupMock.mockResolvedValueOnce([{ address: "8.8.8.8", family: 4 }, { address: "127.0.0.1", family: 4 }]);
      await rejects("https://flaky-dns.example.com/hook");
    });

    it("accepts a hostname whose every resolved address is public", async () => {
      dnsLookupMock.mockResolvedValueOnce([{ address: "8.8.8.8", family: 4 }]);
      await expect(assertPublicHttpsUrl("https://customer-endpoint.example.com/hook")).resolves.toBeUndefined();
    });

    it("rejects a hostname that fails to resolve", async () => {
      dnsLookupMock.mockRejectedValueOnce(new Error("ENOTFOUND"));
      await rejects("https://does-not-exist.example.com/hook");
    });
  });
});
