/**
 * Fills a template's {{n}} variables for one recipient.
 *
 * A campaign or sequence step maps each variable to a contact field ("name",
 * "phone", "email"), one fixed piece of text for everyone ("text:Diwali") —
 * how a festival name, shop name or offer line gets into a bulk message — or,
 * in a sequence, a detail of the sale that started it ("ctx:amount",
 * "ctx:bill").
 */

export interface ParamContact {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
}

const MAX_FIXED_TEXT = 200;

/** What to call a customer whose name we don't have, in the template's own language. */
const NAMELESS: Record<string, string> = {
  en: "there",
  hi: "ग्राहक",
  mr: "ग्राहक",
  gu: "ગ્રાહક",
  ta: "வாடிக்கையாளர்",
  te: "కస్టమర్",
  kn: "ಗ್ರಾಹಕ",
};

export function defaultCustomerName(language?: string | null): string {
  return NAMELESS[(language ?? "").toLowerCase().split("_")[0]] ?? "there";
}

/** Meta rejects parameters containing newlines, tabs or runs of 5+ spaces, so fixed text is flattened. */
export function cleanFixedText(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_FIXED_TEXT);
}

export function resolveTemplateParam(
  field: string | undefined,
  contact: ParamContact,
  language?: string | null,
  context?: Record<string, unknown>,
): string {
  const fallbackName = contact.name || defaultCustomerName(language);
  if (!field) return fallbackName;
  if (field.startsWith("text:")) return cleanFixedText(field.slice(5)) || fallbackName;
  if (field.startsWith("ctx:")) {
    const value = context?.[field.slice(4)];
    return value === undefined || value === null || String(value).trim() === "" ? "-" : cleanFixedText(String(value));
  }
  if (field === "phone") return contact.phone || "";
  if (field === "email") return contact.email || "";
  return fallbackName;
}
