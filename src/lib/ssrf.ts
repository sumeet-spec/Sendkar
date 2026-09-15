import dns from "node:dns/promises";
import net from "node:net";

/**
 * SSRF guard for anything a workspace admin can point at an arbitrary URL —
 * today that's outbound webhooks. Blocks https-only bypass attempts,
 * internal-looking hostnames, and any hostname that resolves to a private/
 * loopback/link-local/reserved IP (including the 169.254.169.254 cloud
 * metadata endpoint that every cloud provider exposes to instances).
 *
 * Not a complete defense against DNS-rebinding: this resolves and checks the
 * hostname, but the actual fetch() call re-resolves DNS itself and isn't
 * pinned to the IP we validated, so a hostname with a very short TTL could
 * in principle flip to an internal address in the gap between this check and
 * the real request. Call this immediately before each delivery attempt (not
 * just once at webhook-creation time) to keep that gap as small as
 * practical — closing it completely would need a custom fetch dispatcher
 * that connects to the pre-resolved IP directly, which is more machinery
 * than this endpoint's risk level justifies right now.
 */
export class UnsafeWebhookUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeWebhookUrlError";
  }
}

const BLOCKED_HOSTNAME_SUFFIXES = [".local", ".internal", ".localhost"];
const BLOCKED_HOSTNAMES = new Set(["localhost", "metadata.google.internal"]);

/**
 * Recovers the embedded IPv4 address from an IPv4-mapped IPv6 address
 * (::ffff:0:0/96). The WHATWG URL parser canonicalizes a dotted-decimal
 * form like "::ffff:127.0.0.1" into pure hex groups ("::ffff:7f00:1")
 * before this code ever sees it, so both forms need handling here.
 */
function ipv4FromMappedIpv6(ip: string): string | null {
  const dotted = ip.match(/::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i);
  if (dotted) return dotted[1];

  const hex = ip.match(/::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
  if (hex) {
    const hi = parseInt(hex[1], 16);
    const lo = parseInt(hex[2], 16);
    return [(hi >> 8) & 0xff, hi & 0xff, (lo >> 8) & 0xff, lo & 0xff].join(".");
  }
  return null;
}

function isPrivateOrReservedIp(ip: string): boolean {
  const type = net.isIP(ip);
  if (type === 4) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 127) return true; // loopback
    if (a === 10) return true; // RFC1918
    if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
    if (a === 192 && b === 168) return true; // RFC1918
    if (a === 169 && b === 254) return true; // link-local — includes cloud metadata (169.254.169.254)
    if (a === 0) return true; // "this network"
    if (a >= 224) return true; // multicast / reserved
    return false;
  }
  if (type === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1") return true; // loopback
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local, fc00::/7
    if (lower.startsWith("fe80")) return true; // link-local
    if (lower.startsWith("::ffff:")) {
      const v4 = ipv4FromMappedIpv6(lower);
      if (v4) return isPrivateOrReservedIp(v4);
    }
    return false;
  }
  return true; // not a recognizable IP literal — don't trust it
}

/** Throws UnsafeWebhookUrlError if the URL isn't a safe https destination. */
export async function assertPublicHttpsUrl(rawUrl: string): Promise<void> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UnsafeWebhookUrlError("Not a valid URL.");
  }
  if (url.protocol !== "https:") throw new UnsafeWebhookUrlError("URL must be https://");

  // WHATWG URL.hostname keeps the [brackets] around an IPv6 literal (e.g.
  // "[::1]") — net.isIP and dns.lookup both expect the bare address.
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (BLOCKED_HOSTNAMES.has(hostname) || BLOCKED_HOSTNAME_SUFFIXES.some((s) => hostname.endsWith(s))) {
    throw new UnsafeWebhookUrlError("This hostname isn't allowed for outbound webhooks.");
  }

  // A literal IP in the URL — validate it directly, no DNS involved.
  if (net.isIP(hostname)) {
    if (isPrivateOrReservedIp(hostname)) throw new UnsafeWebhookUrlError("This address isn't allowed for outbound webhooks.");
    return;
  }

  let addresses: string[];
  try {
    addresses = (await dns.lookup(hostname, { all: true })).map((a) => a.address);
  } catch {
    throw new UnsafeWebhookUrlError("Couldn't resolve this hostname.");
  }
  if (addresses.length === 0 || addresses.some(isPrivateOrReservedIp)) {
    throw new UnsafeWebhookUrlError("This hostname resolves to an address that isn't allowed for outbound webhooks.");
  }
}
