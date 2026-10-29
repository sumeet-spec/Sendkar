import { describe, it, expect } from "vitest";
import { parseSales, isRecent, matchContact } from "./salesParse";

const tally = [
  "Date\tParticulars\tVch Type\tVch No.\tDebit Amount",
  "29-Oct-26\tPatel Textiles\tSales\t1042\t12,500.00",
  "29-Oct-26\tRamesh & Co.\tSales\t1043\t₹ 800",
  "28-Oct-26\tShah Traders\tSales\t1041\t5,000.00",
  "Grand Total\t\t\t\t18,300.00",
].join("\n");

describe("parseSales", () => {
  it("reads a Tally sales list and skips the total row", () => {
    const r = parseSales(tally);
    expect(r.errors).toEqual([]);
    expect(r.rows.map((x) => [x.partyName, x.amount, x.date, x.voucher])).toEqual([
      ["Patel Textiles", 12500, "2026-10-29", "1042"],
      ["Ramesh & Co.", 800, "2026-10-29", "1043"],
      ["Shah Traders", 5000, "2026-10-28", "1041"],
    ]);
  });
  it("uses a Mobile column when the sheet has one", () => {
    const r = parseSales("Date,Customer,Mobile,Amount,Bill No\n29/10/2026,Asha Stores,98250 12345,450,B9");
    expect(r.rows[0].phone).toBe("919825012345");
  });
  it("explains a missing column", () => {
    expect(parseSales("Foo\tBar\nx\ty").errors[0].message).toMatch(/date, party, amount/);
  });
  it("reports bad rows without stopping", () => {
    const r = parseSales("Date\tParticulars\tAmount\nxx\tA\t10\n29-Oct-26\tB\tabc\n29-Oct-26\tC\t20");
    expect(r.rows).toHaveLength(1);
    expect(r.errors).toHaveLength(2);
  });
});

describe("isRecent", () => {
  it("accepts today and yesterday only", () => {
    expect(isRecent("2026-10-29", "2026-10-29")).toBe(true);
    expect(isRecent("2026-10-28", "2026-10-29")).toBe(true);
    expect(isRecent("2026-10-27", "2026-10-29")).toBe(false);
    expect(isRecent("2026-10-30", "2026-10-29")).toBe(false);
  });
});

describe("matchContact", () => {
  const contacts = [
    { name: "Patel Textiles", phone: "919825011111" },
    { name: "Shah Traders", phone: "919825022222" },
    { name: "Shah Traders", phone: "919825033333" },
  ];
  it("matches an exact name ignoring case and punctuation", () => {
    expect(matchContact("PATEL  textiles.", contacts)).toBe("919825011111");
  });
  it("refuses a name that two customers share, or none", () => {
    expect(matchContact("Shah Traders", contacts)).toBeNull();
    expect(matchContact("Unknown", contacts)).toBeNull();
  });
});
