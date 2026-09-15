/**
 * HubSpot Private App token — same self-serve "paste your own key" pattern
 * as Klaviyo (lib/klaviyo.ts): no OAuth app or Marketplace review needed,
 * unlike Salesforce/Zoho which both require a registered OAuth app first
 * (not yet built — see the integrations page). A workspace creates a
 * Private App in their own HubSpot account (Settings -> Integrations ->
 * Private Apps) with the crm.objects.contacts.read/write scopes and pastes
 * the resulting token here.
 *
 * Every new WhatsApp contact is searched by phone first, then updated or
 * created — not a blind create, or every repeat contact would pile up as a
 * duplicate HubSpot record. HubSpot's own conditional "batch/upsert"
 * endpoint would avoid the extra search call, but it only works once phone
 * is manually configured as a unique identifier property in that HubSpot
 * account first — a setup step this integration can't do on the workspace's
 * behalf, so search-then-write is the version that works with zero HubSpot-
 * side configuration beyond creating the Private App token itself.
 *
 * NOTE: built and reviewed against HubSpot's current published CRM v3
 * Contacts API docs (developers.hubspot.com/docs/api/crm/contacts,
 * checked 2026-09-15) but not exercised against a real HubSpot account —
 * verify one real sync end-to-end before relying on this in production,
 * same as any new integration should be.
 */

const HUBSPOT_API_BASE = "https://api.hubapi.com";

function normalizePhone(phone: string): string {
  return phone.startsWith("+") ? phone : `+${phone}`;
}

async function findContactIdByPhone(apiKey: string, phone: string): Promise<string | null> {
  const res = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts/search`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: "phone", operator: "EQ", value: phone }] }],
      limit: 1,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { results?: Array<{ id: string }> };
  return json.results?.[0]?.id ?? null;
}

export async function syncHubspotContact(apiKey: string, phone: string, name?: string | null): Promise<void> {
  try {
    const normalizedPhone = normalizePhone(phone);
    const properties: Record<string, string> = { phone: normalizedPhone };
    if (name) properties.firstname = name;

    const existingId = await findContactIdByPhone(apiKey, normalizedPhone);
    const url = existingId
      ? `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${existingId}`
      : `${HUBSPOT_API_BASE}/crm/v3/objects/contacts`;

    await fetch(url, {
      method: existingId ? "PATCH" : "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ properties }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // Best-effort sync — same posture as Klaviyo's: a down/misconfigured
    // HubSpot key shouldn't break the WhatsApp webhook that triggered this.
  }
}
