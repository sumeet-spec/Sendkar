/**
 * Payment-reminder logic that needs no database: turning a pasted Excel /
 * Tally / CSV outstanding list into rows, and deciding when a reminder is due.
 * Kept free of server imports so it can be unit-tested directly.
 */

export interface ParsedReceivable {
  partyName: string;
  phone: string; // digits only, country code included
  amount: number;
  dueDate: string; // YYYY-MM-DD
  invoiceRef: string | null;
}

export interface ParseResult {
  rows: ParsedReceivable[];
  errors: { line: number; message: string }[];
}

export const MAX_IMPORT_ROWS = 500;

// ── Schedule ─────────────────────────────────────────────────────────────
// Days relative to the due date. One reminder per stage, never more than one
// per cron run, so a bill imported long after it fell due gets a single
// catch-up reminder rather than five in a row.
export const REMINDER_OFFSETS_DAYS = [-3, 0, 3, 7, 14] as const;

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Today's date in India (YYYY-MM-DD) — due dates are calendar dates in IST. */
export function todayInIndia(now: Date = new Date()): string {
  return new Date(now.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

export function daysBetween(fromYmd: string, toYmd: string): number {
  const [fy, fm, fd] = fromYmd.split("-").map(Number);
  const [ty, tm, td] = toYmd.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000);
}

export interface ReminderDecision {
  send: boolean;
  /** What reminders_sent becomes if this send succeeds. */
  nextRemindersSent: number;
}

export function decideReminder(todayYmd: string, dueYmd: string, remindersSent: number): ReminderDecision {
  if (remindersSent >= REMINDER_OFFSETS_DAYS.length) return { send: false, nextRemindersSent: remindersSent };
  const daysFromDue = daysBetween(dueYmd, todayYmd);
  let latestDueStage = -1;
  for (let i = 0; i < REMINDER_OFFSETS_DAYS.length; i++) {
    if (daysFromDue >= REMINDER_OFFSETS_DAYS[i]) latestDueStage = i;
  }
  if (latestDueStage >= remindersSent) return { send: true, nextRemindersSent: latestDueStage + 1 };
  return { send: false, nextRemindersSent: remindersSent };
}

// ── Formatting ───────────────────────────────────────────────────────────

export function formatInr(amount: number): string {
  return amount.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDueDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

// ── Field parsers ────────────────────────────────────────────────────────

/** Indian mobile → 91XXXXXXXXXX. Other international numbers pass through; junk returns null. */
export function normalizePhone(raw: string): string | null {
  // A cell can hold several numbers ("98250 12345 / 98250 67890") — use the first usable one.
  for (const part of raw.split(/[/;,]/)) {
    let digits = part.replace(/\D/g, "");
    if (digits.startsWith("0091")) digits = digits.slice(2);
    if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    if (digits.length === 10 && /^[6-9]/.test(digits)) return `91${digits}`;
    if (digits.length === 12 && digits.startsWith("91") && /^[6-9]/.test(digits[2])) return digits;
    if (digits.length >= 11 && digits.length <= 15 && !digits.startsWith("0") && !digits.startsWith("91")) return digits;
  }
  return null;
}

/** "₹ 1,25,000.50", "Rs. 12500", "12,500.00 Dr" → number. Credit balances ("Cr") return null. */
export function parseAmount(raw: string): number | null {
  const s = raw.trim();
  if (/\bcr\b\.?$/i.test(s)) return null;
  const cleaned = s.replace(/₹|rs\.?|inr|\bdr\b\.?/gi, "").replace(/[,\s]/g, "");
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return n > 0 && n < 1_000_000_000 ? Math.round(n * 100) / 100 : null;
}

function isRealDate(y: number, m: number, d: number): boolean {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function ymd(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** ISO, dd/mm/yyyy, dd-Mon-yy (Tally), and Excel serial numbers → YYYY-MM-DD. */
export function parseDueDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;

  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return isRealDate(+m[1], +m[2], +m[3]) ? ymd(+m[1], +m[2], +m[3]) : null;

  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/);
  if (m) {
    const year = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    return isRealDate(year, +m[2], +m[1]) ? ymd(year, +m[2], +m[1]) : null;
  }

  m = s.match(/^(\d{1,2})[\s-]([A-Za-z]{3})[A-Za-z]*[\s,-]+(\d{2}|\d{4})$/);
  if (m) {
    const month = MONTHS.findIndex((x) => x.toLowerCase() === m![2].toLowerCase()) + 1;
    const year = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    return month > 0 && isRealDate(year, month, +m[1]) ? ymd(year, month, +m[1]) : null;
  }

  // Excel stores dates as day counts from 1899-12-30; a "General"-formatted cell pastes as that number.
  if (/^\d{5}$/.test(s) && +s >= 40_000 && +s <= 60_000) {
    const dt = new Date(Date.UTC(1899, 11, 30) + +s * 86_400_000);
    return ymd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
  }
  return null;
}

// ── Table parsing ────────────────────────────────────────────────────────

const HEADER_ALIASES: Record<"party" | "phone" | "amount" | "due" | "invoice", string[]> = {
  party: ["party", "party name", "name", "customer", "customer name", "ledger", "dealer", "client", "account", "particulars"],
  phone: ["phone", "phone number", "mobile", "mobile no", "mobile number", "whatsapp", "whatsapp number", "whatsapp no", "contact", "contact no", "mob", "number"],
  amount: ["amount", "outstanding", "balance", "pending", "pending amount", "due amount", "closing balance", "receivable", "outstanding amount", "total"],
  due: ["due", "due date", "duedate", "due on", "payment due", "pay by"],
  invoice: ["invoice", "invoice no", "invoice number", "bill", "bill no", "bill number", "ref", "ref no", "reference", "voucher", "voucher no"],
};

type Field = keyof typeof HEADER_ALIASES;

function norm(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function detectDelimiter(sample: string): string {
  if (sample.includes("\t")) return "\t"; // pasted from Excel / Tally
  const semis = (sample.match(/;/g) ?? []).length;
  const commas = (sample.match(/,/g) ?? []).length;
  return semis > commas ? ";" : ",";
}

function splitLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) { out.push(cur.trim()); cur = ""; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

export function parseReceivables(text: string, todayYmd: string = todayInIndia()): ParseResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const result: ParseResult = { rows: [], errors: [] };
  if (lines.length === 0) {
    result.errors.push({ line: 0, message: "Nothing to import — paste your outstanding list first." });
    return result;
  }

  const delim = detectDelimiter(lines[0]);
  const first = splitLine(lines[0], delim);

  const columns: Partial<Record<Field, number>> = {};
  first.forEach((cell, idx) => {
    const key = norm(cell);
    for (const field of Object.keys(HEADER_ALIASES) as Field[]) {
      if (columns[field] === undefined && HEADER_ALIASES[field].includes(key)) columns[field] = idx;
    }
  });

  const hasHeader = Object.keys(columns).length >= 2;
  let dataLines = lines;
  if (hasHeader) {
    dataLines = lines.slice(1);
    if (columns.party === undefined || columns.phone === undefined || columns.amount === undefined) {
      const missing = (["party", "phone", "amount"] as Field[]).filter((f) => columns[f] === undefined);
      result.errors.push({
        line: 1,
        message: `Couldn't find a ${missing.join(", ")} column. Use headers like Party, Mobile, Amount, Due date.`,
      });
      return result;
    }
  } else {
    // No recognisable header: assume the order Party, Mobile, Amount, Due date, Invoice.
    columns.party = 0; columns.phone = 1; columns.amount = 2; columns.due = 3; columns.invoice = 4;
  }

  const seen = new Set<string>();
  dataLines.forEach((line, i) => {
    const lineNo = i + (hasHeader ? 2 : 1);
    if (result.rows.length >= MAX_IMPORT_ROWS) {
      if (result.errors.at(-1)?.line !== -1) {
        result.errors.push({ line: -1, message: `Only the first ${MAX_IMPORT_ROWS} rows were read — import the rest in a second batch.` });
      }
      return;
    }
    const cells = splitLine(line, delim);
    const cell = (f: Field) => (columns[f] !== undefined ? (cells[columns[f]!] ?? "").trim() : "");

    const partyName = cell("party");
    if (!partyName) return void result.errors.push({ line: lineNo, message: "Missing party name." });

    const phone = normalizePhone(cell("phone"));
    if (!phone) return void result.errors.push({ line: lineNo, message: `${partyName}: no valid mobile number.` });

    const amount = parseAmount(cell("amount"));
    if (amount === null) return void result.errors.push({ line: lineNo, message: `${partyName}: amount isn't a positive number (credit balances are skipped).` });

    const dueRaw = cell("due");
    let dueDate = todayYmd; // no due date on the list → treated as due today
    if (dueRaw) {
      const parsed = parseDueDate(dueRaw);
      if (!parsed) return void result.errors.push({ line: lineNo, message: `${partyName}: couldn't read the due date "${dueRaw}".` });
      dueDate = parsed;
    }

    const invoiceRef = cell("invoice") || null;
    const key = [phone, amount, dueDate, invoiceRef ?? ""].join("|");
    if (seen.has(key)) return void result.errors.push({ line: lineNo, message: `${partyName}: duplicate of an earlier row.` });
    seen.add(key);

    result.rows.push({ partyName, phone, amount, dueDate, invoiceRef });
  });

  return result;
}
