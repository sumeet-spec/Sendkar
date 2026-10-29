import { detectDelimiter, norm, parseAmount, parseDueDate, normalizePhone, splitLine, todayInIndia, daysBetween } from "@/lib/reminders";

/**
 * Turns a pasted sales list (a Tally Sales Register or Day Book, or an Excel sheet) into bills to send.
 * Tally's own reports carry no mobile numbers, so a row without one is matched to a customer the shop already has, by name.
 */

export interface SalesRow {
  partyName: string;
  /** From a Mobile column, when the sheet has one. */
  phone: string | null;
  amount: number;
  /** YYYY-MM-DD */
  date: string;
  voucher: string | null;
}

export interface SalesParse {
  rows: SalesRow[];
  errors: { line: number; message: string }[];
}

export const MAX_SALES_ROWS = 40;

const ALIASES = {
  date: ["date", "voucher date", "bill date", "invoice date"],
  party: ["party", "party name", "particulars", "customer", "customer name", "name", "ledger", "account"],
  phone: ["phone", "mobile", "mobile no", "mobile number", "whatsapp", "whatsapp number", "contact", "contact no"],
  amount: ["debit", "debit amount", "amount", "gross total", "grand total", "invoice amount", "bill amount", "value", "sales", "total"],
  voucher: ["voucher no", "voucher number", "vch no", "vch no.", "invoice no", "invoice number", "bill no", "bill number", "ref no", "voucher"],
} as const;
type Field = keyof typeof ALIASES;

const TOTAL_ROW = /^(grand\s+)?total\b|^opening|^closing|^carried|^brought/i;

export function parseSales(text: string): SalesParse {
  const out: SalesParse = { rows: [], errors: [] };
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    out.errors.push({ line: 0, message: "Paste the sales list with its heading row first." });
    return out;
  }
  const delim = detectDelimiter(lines[0]);
  const head = splitLine(lines[0], delim);
  const col: Partial<Record<Field, number>> = {};
  head.forEach((cell, i) => {
    const key = norm(cell);
    (Object.keys(ALIASES) as Field[]).forEach((f) => {
      if (col[f] === undefined && (ALIASES[f] as readonly string[]).includes(key)) col[f] = i;
    });
  });
  if (col.party === undefined || col.amount === undefined || col.date === undefined) {
    const missing = (["date", "party", "amount"] as Field[]).filter((f) => col[f] === undefined);
    out.errors.push({ line: 1, message: `Could not find the ${missing.join(", ")} column. The first row should have headings like Date, Particulars, Voucher No., Amount.` });
    return out;
  }

  lines.slice(1).forEach((line, i) => {
    const lineNo = i + 2;
    const cells = splitLine(line, delim);
    const cell = (f: Field) => (col[f] !== undefined ? (cells[col[f]!] ?? "").trim() : "");
    const party = cell("party");
    if (!party || TOTAL_ROW.test(party)) return;
    const date = parseDueDate(cell("date"));
    if (!date) return void out.errors.push({ line: lineNo, message: `${party}: could not read the date "${cell("date")}".` });
    const amount = parseAmount(cell("amount"));
    if (amount === null) return void out.errors.push({ line: lineNo, message: `${party}: the amount is not a positive number.` });
    out.rows.push({ partyName: party, phone: col.phone !== undefined ? normalizePhone(cell("phone")) : null, amount, date, voucher: cell("voucher") || null });
  });
  return out;
}

/** Only the last two days' sales are billed from a paste: an old sale should not suddenly arrive on a customer's phone. */
export function isRecent(date: string, today: string = todayInIndia()): boolean {
  const age = daysBetween(date, today);
  return age >= 0 && age <= 1;
}

const key = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

/** Finds the customer for a Tally party name among the shop's contacts. Only an exact (case and punctuation blind) match counts, so a bill never goes to the wrong person. */
export function matchContact(name: string, contacts: Array<{ name: string | null; phone: string }>): string | null {
  const k = key(name);
  if (!k) return null;
  const hits = contacts.filter((c) => c.name && key(c.name) === k);
  return hits.length === 1 ? hits[0].phone : null;
}
