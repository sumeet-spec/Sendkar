import { describe, it, expect } from "vitest";
import { canCollect, cleanPayLink, cleanUpiId, payPageUrl, upiUri, type PayWorkspace } from "./pay";

const base: PayWorkspace = { pay_mode: null, upi_id: null, upi_name: null, manual_pay_link: null, razorpay_key_id: null, razorpay_key_secret: null, payu_merchant_key: null, payu_salt: null };

describe("cleanUpiId", () => {
  it("accepts real-looking UPI ids and lowercases them", () => {
    expect(cleanUpiId("Sharma.Traders@okhdfcbank")).toBe("sharma.traders@okhdfcbank");
    expect(cleanUpiId(" 9876543210@paytm ")).toBe("9876543210@paytm");
    expect(cleanUpiId("shop-1_a@ybl")).toBe("shop-1_a@ybl");
  });
  it("refuses anything else", () => {
    for (const bad of ["", "sharma", "@ybl", "a@b", "sharma@", "sharma@@ybl", "sha rma@ybl", "javascript:alert(1)", "x".repeat(70) + "@ybl"]) {
      expect(cleanUpiId(bad), bad).toBeNull();
    }
  });
});

describe("cleanPayLink", () => {
  it("accepts https links only", () => {
    expect(cleanPayLink("https://rzp.io/i/abc123")).toBe("https://rzp.io/i/abc123");
    expect(cleanPayLink("http://rzp.io/i/abc123")).toBeNull();
    expect(cleanPayLink("javascript:alert(1)")).toBeNull();
    expect(cleanPayLink("upi://pay?pa=a@b")).toBeNull();
    expect(cleanPayLink("https://localhost/x")).toBeNull();
    expect(cleanPayLink("not a link")).toBeNull();
  });
});

describe("canCollect", () => {
  it("is false until the chosen way is set up", () => {
    expect(canCollect(base)).toBe(false);
    expect(canCollect({ ...base, pay_mode: "upi" })).toBe(false);
    expect(canCollect({ ...base, pay_mode: "gateway" })).toBe(false);
    expect(canCollect({ ...base, pay_mode: "link", manual_pay_link: "http://x.com" })).toBe(false);
  });
  it("is true when it is", () => {
    expect(canCollect({ ...base, pay_mode: "upi", upi_id: "sharma@ybl" })).toBe(true);
    expect(canCollect({ ...base, pay_mode: "gateway", razorpay_key_id: "k", razorpay_key_secret: "s" })).toBe(true);
    expect(canCollect({ ...base, pay_mode: "gateway", payu_merchant_key: "k", payu_salt: "s" })).toBe(true);
    expect(canCollect({ ...base, pay_mode: "link", manual_pay_link: "https://rzp.io/i/x" })).toBe(true);
  });
});

describe("upiUri and payPageUrl", () => {
  it("fills in payee, amount and bill number", () => {
    const u = new URL(upiUri({ upiId: "sharma@ybl", payeeName: "Sharma Traders", amount: 1328, note: "Bill B12" }));
    expect(u.protocol).toBe("upi:");
    expect(u.searchParams.get("pa")).toBe("sharma@ybl");
    expect(u.searchParams.get("am")).toBe("1328.00");
    expect(u.searchParams.get("cu")).toBe("INR");
    expect(u.searchParams.get("tn")).toBe("Bill B12");
  });
  it("builds the pay page address", () => {
    expect(payPageUrl("https://www.sendkar.shop/", "abc123")).toBe("https://www.sendkar.shop/p/abc123");
  });
});
