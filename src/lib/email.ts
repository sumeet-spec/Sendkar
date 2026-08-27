const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Thin fetch wrapper instead of the `resend` SDK — matches how this codebase
 * already calls Meta's Graph API directly, and one endpoint doesn't earn a
 * dependency. Returns an error string instead of throwing so callers can
 * treat email as best-effort (e.g. an invite record should still exist even
 * if the email bounces or Resend is unreachable).
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<{ error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { error: "Email isn't configured on this server yet." };

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Sendkar <hello@sendkar.shop>", to, subject, html }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      return { error: body.message ?? `Resend rejected the email (${res.status}).` };
    }
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not reach Resend." };
  }
}
