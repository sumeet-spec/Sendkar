import { describe, it, expect } from "vitest";
import { buildBook, filterBook } from "./customerBook";

const c = (id: string, name: string, opted = false) => ({ id, phone: "91" + id, name, opted_out: opted, created_at: "2026-10-01T00:00:00Z" });
const b = (id: string, contact: string | null, amount: number, paid: boolean, at: string) => ({ id, contact_id: contact, bill_no: "B" + id, amount, paid, created_at: at });
const month = (iso: string) => iso.slice(0, 7);

describe("customer book", () => {
  const contacts = [c("1", "Asha"), c("2", "Ravi"), c("3", "Lead One"), c("4", "Lead Two")];
  const bills = [
    b("a", "1", 500, true, "2026-10-05T10:00:00Z"),
    b("b", "1", 700, false, "2026-10-20T10:00:00Z"),
    b("c", "2", 300, true, "2026-09-10T10:00:00Z"),
    b("d", null, 999, true, "2026-10-21T10:00:00Z"),
  ];
  const book = buildBook(contacts, bills, "2026-10", month);

  it("counts customers and leads", () => {
    expect(book.customers).toBe(2);
    expect(book.leads).toBe(2);
  });
  it("adds up what each customer bought and owes, newest bill first", () => {
    const asha = book.entries.find((e) => e.contact.id === "1")!;
    expect(asha.total).toBe(1200);
    expect(asha.owes).toBe(700);
    expect(asha.bills[0].id).toBe("b");
    expect(asha.lastBillAt).toBe("2026-10-20T10:00:00Z");
  });
  it("totals what is owed and what was billed this month, including bills with no saved customer", () => {
    expect(book.owingCount).toBe(1);
    expect(book.owingTotal).toBe(700);
    expect(book.billedThisMonth).toBe(500 + 700 + 999);
  });
  it("filters by tab", () => {
    expect(filterBook(book.entries, "customers")).toHaveLength(2);
    expect(filterBook(book.entries, "leads").map((e) => e.contact.name)).toEqual(["Lead One", "Lead Two"]);
    expect(filterBook(book.entries, "owing").map((e) => e.contact.name)).toEqual(["Asha"]);
  });
});
