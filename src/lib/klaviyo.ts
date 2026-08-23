/**
 * Klaviyo's private API keys need no OAuth app/review — a user pastes one
 * from their own Klaviyo account and Sendkar can push profiles/events
 * immediately, unlike Salesforce/HubSpot/Zoho which all require a
 * registered OAuth app first (not yet built — see the integrations page).
 */

const API_REVISION = "2024-10-15";

export async function syncKlaviyoProfile(apiKey: string, phone: string, name?: string | null): Promise<void> {
  await fetch("https://a.klaviyo.com/api/profiles/", {
    method: "POST",
    headers: {
      Authorization: `Klaviyo-API-Key ${apiKey}`,
      "Content-Type": "application/json",
      revision: API_REVISION,
    },
    body: JSON.stringify({
      data: {
        type: "profile",
        attributes: {
          phone_number: phone.startsWith("+") ? phone : `+${phone}`,
          ...(name ? { first_name: name } : {}),
        },
      },
    }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => {
    // Best-effort sync — a down/misconfigured Klaviyo key shouldn't break the WhatsApp webhook that triggered this.
  });
}
