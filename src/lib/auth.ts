/**
 * Login identity is a WhatsApp number, not an email — but under the hood
 * this still rides Supabase's proven email/password auth rather than its
 * Phone provider, which needs an SMS provider (Twilio etc.) configured and
 * billed per message just to send OTPs. A synthetic, never-delivered email
 * derived from the number sidesteps that cost entirely while keeping every
 * existing auth code path (signUp/signInWithPassword, confirmation
 * handling) exactly as proven.
 */
export function normalizePhone(input: string): string {
  return input.replace(/[^\d]/g, "");
}

export function phoneToAuthEmail(phone: string): string {
  return `wa${normalizePhone(phone)}@sendkar.internal`;
}
