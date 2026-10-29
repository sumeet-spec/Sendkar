import { describe, it, expect } from "vitest";
import {
  decideReminder, daysBetween, todayInIndia, normalizePhone, parseAmount, parseDueDate,
  parseReceivables, formatInr, formatDueDate, MAX_IMPORT_ROWS,
} from "./reminders";

describe("normalizePhone", () => {
  it("adds 91 to a 10-digit Indian mobile", () => expect(normalizePhone("98250 12345")).toBe("919825012345"));
  it("keeps an already-prefixed number", () => expect(normalizePhone("+91 98250-12345")).toBe("919825012345"));
  it("drops a leading 0 and a 0091 prefix", () => {
    expect(normalizePhone("09825012345")).toBe("919825012345");
    expect(normalizePhone("00919825012345")).toBe("919825012345");
  });
  it("uses the first usable number in a multi-number cell", () => {
    expect(normalizePhone("12345 / 98250 12345")).toBe("919825012345");
  });
  it("passes through international numbers", () => expect(normalizePhone("+1 415 555 0132")).toBe("14155550132"));
  it("rejects junk and landline-looking numbers", () => {
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone("abc")).toBeNull();
    expect(normalizePhone("2212345678")).toBeNull();
  });
});

describe("parseAmount", () => {
  it("reads Indian digit grouping and currency marks", () => {
    expect(parseAmount("₹ 1,25,000.50")).toBe(125000.5);
    expect(parseAmount("Rs. 12500")).toBe(12500);
    expect(parseAmount("12,500.00 Dr")).toBe(12500);
  });
  it("skips credit balances, zero and junk", () => {
    expect(parseAmount("5,000.00 Cr")).toBeNull();
    expect(parseAmount("0")).toBeNull();
    expect(parseAmount("-500")).toBeNull();
    expect(parseAmount("n/a")).toBeNull();
  });
});

describe("parseDueDate", () => {
  it("reads ISO, dd/mm/yyyy and two-digit years", () => {
    expect(parseDueDate("2026-11-05")).toBe("2026-11-05");
    expect(parseDueDate("05/11/2026")).toBe("2026-11-05");
    expect(parseDueDate("5-11-26")).toBe("2026-11-05");
    expect(parseDueDate("05.11.2026")).toBe("2026-11-05");
  });
  it("reads Tally-style dd-Mon-yy", () => {
    expect(parseDueDate("1-Apr-26")).toBe("2026-04-01");
    expect(parseDueDate("15 Nov 2026")).toBe("2026-11-15");
  });
  it("reads an Excel serial number", () => expect(parseDueDate("46331")).toBe("2026-11-05"));
  it("rejects impossible dates", () => {
    expect(parseDueDate("31/02/2026")).toBeNull();
    expect(parseDueDate("soon")).toBeNull();
  });
});

describe("decideReminder", () => {
  const due = "2026-11-10";
  it("waits until 3 days before the due date", () => {
    expect(decideReminder("2026-11-06", due, 0).send).toBe(false);
    expect(decideReminder("2026-11-07", due, 0)).toEqual({ send: true, nextRemindersSent: 1 });
  });
  it("sends the due-date reminder next, not again the same stage", () => {
    expect(decideReminder("2026-11-08", due, 1).send).toBe(false);
    expect(decideReminder("2026-11-10", due, 1)).toEqual({ send: true, nextRemindersSent: 2 });
  });
  it("follows the overdue cadence", () => {
    expect(decideReminder("2026-11-13", due, 2)).toEqual({ send: true, nextRemindersSent: 3 });
    expect(decideReminder("2026-11-17", due, 3)).toEqual({ send: true, nextRemindersSent: 4 });
    expect(decideReminder("2026-11-24", due, 4)).toEqual({ send: true, nextRemindersSent: 5 });
  });
  it("sends only one catch-up reminder for a bill imported long after it fell due", () => {
    const d = decideReminder("2026-12-31", due, 0);
    expect(d).toEqual({ send: true, nextRemindersSent: 5 });
    expect(decideReminder("2027-01-01", due, d.nextRemindersSent).send).toBe(false);
  });
  it("stops after the last stage", () => expect(decideReminder("2027-06-01", due, 5).send).toBe(false));
});

describe("dates", () => {
  it("counts days across month and leap boundaries", () => {
    expect(daysBetween("2026-02-27", "2026-03-02")).toBe(3);
    expect(daysBetween("2028-02-28", "2028-03-01")).toBe(2);
  });
  it("uses the Indian calendar date", () => {
    // 20:00 UTC on the 9th is already 01:30 on the 10th in India.
    expect(todayInIndia(new Date("2026-11-09T20:00:00Z"))).toBe("2026-11-10");
    expect(todayInIndia(new Date("2026-11-09T10:00:00Z"))).toBe("2026-11-09");
  });
  it("formats rupees and dates for the template", () => {
    expect(formatInr(125000)).toBe("1,25,000");
    expect(formatInr(12500.5)).toBe("12,500.5");
    expect(formatDueDate("2026-11-05")).toBe("5 Nov 2026");
  });
});

describe("parseReceivables", () => {
  const today = "2026-11-01";

  it("reads a tab-separated Excel paste with headers", () => {
    const text = "Party Name\tMobile\tOutstanding\tDue Date\tBill No\nPatel Textiles\t98250 12345\t1,25,000\t05/11/2026\tINV-88\nShah Traders\t9825099999\t₹ 8,400\t10-Nov-26\t";
    const r = parseReceivables(text, today);
    expect(r.errors).toEqual([]);
    expect(r.rows).toEqual([
      { partyName: "Patel Textiles", phone: "919825012345", amount: 125000, dueDate: "2026-11-05", invoiceRef: "INV-88" },
      { partyName: "Shah Traders", phone: "919825099999", amount: 8400, dueDate: "2026-11-10", invoiceRef: null },
    ]);
  });

  it("reads a quoted CSV where the party name contains a comma", () => {
    const r = parseReceivables('name,phone,amount\n"Mehta, Rao & Sons",9825012345,5000', today);
    expect(r.rows[0].partyName).toBe("Mehta, Rao & Sons");
    expect(r.rows[0].dueDate).toBe(today);
  });

  it("assumes Party, Mobile, Amount, Due date when there is no header", () => {
    const r = parseReceivables("Patel,9825012345,5000,2026-11-20", today);
    expect(r.rows).toEqual([{ partyName: "Patel", phone: "919825012345", amount: 5000, dueDate: "2026-11-20", invoiceRef: null }]);
  });

  it("reports bad rows with line numbers and still imports the good ones", () => {
    const text = "party,mobile,amount,due date\nA,9825012345,100,05/11/2026\nB,123,100,05/11/2026\nC,9825012346,abc,05/11/2026\nD,9825012347,100,someday";
    const r = parseReceivables(text, today);
    expect(r.rows).toHaveLength(1);
    expect(r.errors.map((e) => e.line)).toEqual([3, 4, 5]);
  });

  it("flags a missing required column instead of guessing", () => {
    const r = parseReceivables("party,amount\nA,100", today);
    expect(r.rows).toEqual([]);
    expect(r.errors[0].message).toMatch(/phone/);
  });

  it("drops exact duplicate rows but keeps different bills for the same party", () => {
    const text = "party,mobile,amount,due date,invoice\nA,9825012345,100,05/11/2026,1\nA,9825012345,100,05/11/2026,1\nA,9825012345,100,05/11/2026,2";
    const r = parseReceivables(text, today);
    expect(r.rows).toHaveLength(2);
    expect(r.errors).toHaveLength(1);
  });

  it("caps a single import", () => {
    const lines = ["party,mobile,amount"];
    for (let i = 0; i < MAX_IMPORT_ROWS + 20; i++) lines.push(`P${i},98250${String(10000 + i)},100`);
    const r = parseReceivables(lines.join("\n"), today);
    expect(r.rows).toHaveLength(MAX_IMPORT_ROWS);
    expect(r.errors.filter((e) => e.line === -1)).toHaveLength(1);
  });

  it("rejects an empty paste", () => expect(parseReceivables("  \n ", today).errors).toHaveLength(1));
});
