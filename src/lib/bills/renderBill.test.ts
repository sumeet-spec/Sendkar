// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "fs";
import { renderBillPng, formatRupees } from "./renderBill";
import { LANGUAGES } from "@/lib/i18n/dictionaries";
import { BILL_LABELS } from "@/lib/i18n/billCopy";

describe("formatRupees", () => {
  it("uses Indian grouping and drops zero paise", () => {
    expect(formatRupees(1234567)).toBe("₹12,34,567");
    expect(formatRupees(999)).toBe("₹999");
    expect(formatRupees(1500.5)).toBe("₹1,500.50");
    expect(formatRupees(100000)).toBe("₹1,00,000");
  });
});

describe("bill labels", () => {
  const en = Object.keys(BILL_LABELS.en).sort();
  for (const { code } of LANGUAGES) {
    it(`${code}: every label present`, () => {
      expect(Object.keys(BILL_LABELS[code]).sort()).toEqual(en);
      for (const v of Object.values(BILL_LABELS[code])) expect(v.trim().length).toBeGreaterThan(0);
    });
  }
});

describe("renderBillPng", () => {
  const base = {
    shopName: "શર્મા ટ્રેડર્સ", shopLine: "98765 43210", billNo: "B12", dateText: "29 Oct 2026",
    customerName: "Ramesh Patel", customerPhone: "98765 00000", primaryColor: "#14532d",
    items: [{ name: "Basmati rice 5kg", qty: 2, rate: 640 }, { name: "ખાંડ 1 કિલો", qty: 1, rate: 48 }],
    amount: 1328,
  };
  for (const { code } of LANGUAGES) {
    it(`${code}: renders a PNG, paid and unpaid`, () => {
      for (const paid of [true, false]) {
        const png = renderBillPng({ ...base, lang: code, paid, dueText: "5 Nov 2026" });
        expect(png.subarray(0, 4).toString("hex")).toBe("89504e47");
        if (process.env.BILL_OUT) fs.writeFileSync(`${process.env.BILL_OUT}/bill-${code}-${paid ? "paid" : "due"}.png`, png);
      }
    }, 30_000);
  }
  it("renders with no items and a long shop name", () => {
    const png = renderBillPng({ ...base, lang: "en", items: [], shopName: "The Very Long Named General Merchants and Traders Association", paid: true });
    expect(png.length).toBeGreaterThan(2000);
  });
});
