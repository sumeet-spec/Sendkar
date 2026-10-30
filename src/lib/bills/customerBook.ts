/**
 * Splits a shop's contact list into customers (has been billed) and leads (on the list, never billed),
 * with what each customer has bought and still owes. Pure, so it can be tested without a database.
 */

export interface BookContact { id: string; phone: string; name: string | null; opted_out: boolean | null; consent_at?: string | null; auto_tags?: string[] | null; source?: string | null; created_at: string }
export interface BookBill { id: string; contact_id: string | null; bill_no: string; amount: number | string; paid: boolean; created_at: string }

export interface BookEntry {
  contact: BookContact;
  bills: BookBill[];
  total: number;
  owes: number;
  lastBillAt: string | null;
}

export interface Book {
  entries: BookEntry[];
  customers: number;
  leads: number;
  owingCount: number;
  owingTotal: number;
  billedThisMonth: number;
}

/** `monthPrefix` is the IST year-month, like "2026-10". */
export function buildBook(contacts: BookContact[], bills: BookBill[], monthPrefix: string, istMonthOf: (iso: string) => string): Book {
  const byContact = new Map<string, BookBill[]>();
  for (const b of bills) {
    if (!b.contact_id) continue;
    const list = byContact.get(b.contact_id) ?? [];
    list.push(b);
    byContact.set(b.contact_id, list);
  }

  const entries: BookEntry[] = contacts.map((contact) => {
    const mine = (byContact.get(contact.id) ?? []).slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
    return {
      contact,
      bills: mine,
      total: mine.reduce((s, b) => s + Number(b.amount), 0),
      owes: mine.filter((b) => !b.paid).reduce((s, b) => s + Number(b.amount), 0),
      lastBillAt: mine[0]?.created_at ?? null,
    };
  });

  const customers = entries.filter((e) => e.bills.length > 0);
  const owing = entries.filter((e) => e.owes > 0);
  return {
    entries,
    customers: customers.length,
    leads: entries.length - customers.length,
    owingCount: owing.length,
    owingTotal: owing.reduce((s, e) => s + e.owes, 0),
    billedThisMonth: bills.filter((b) => istMonthOf(b.created_at) === monthPrefix).reduce((s, b) => s + Number(b.amount), 0),
  };
}

export type BookTab = "all" | "customers" | "leads" | "owing";

export function filterBook(entries: BookEntry[], tab: BookTab): BookEntry[] {
  if (tab === "customers") return entries.filter((e) => e.bills.length > 0);
  if (tab === "leads") return entries.filter((e) => e.bills.length === 0);
  if (tab === "owing") return entries.filter((e) => e.owes > 0).sort((a, b) => b.owes - a.owes);
  return entries;
}
