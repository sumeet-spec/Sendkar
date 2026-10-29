import { describe, it, expect } from "vitest";
import { resolveTemplateParam, defaultCustomerName, cleanFixedText } from "./templateVars";

describe("defaultCustomerName", () => {
  it("speaks the template's language", () => {
    expect(defaultCustomerName("hi")).toBe("ग्राहक");
    expect(defaultCustomerName("gu")).toBe("ગ્રાહક");
    expect(defaultCustomerName("en_US")).toBe("there");
  });
  it("falls back to English for unknown languages", () => expect(defaultCustomerName("xx")).toBe("there"));
});

describe("resolveTemplateParam", () => {
  const contact = { name: "Rajesh", phone: "919825012345", email: "r@x.in" };
  it("maps contact fields", () => {
    expect(resolveTemplateParam("name", contact, "hi")).toBe("Rajesh");
    expect(resolveTemplateParam("phone", contact)).toBe("919825012345");
    expect(resolveTemplateParam("email", contact)).toBe("r@x.in");
  });
  it("uses the same fixed text for everyone", () => {
    expect(resolveTemplateParam("text:Diwali", contact, "en")).toBe("Diwali");
    expect(resolveTemplateParam("text:Diwali", { name: null }, "en")).toBe("Diwali");
  });
  it("flattens newlines in fixed text", () => expect(cleanFixedText("Festive combo\n  set   at ₹999")).toBe("Festive combo set at ₹999"));
  it("falls back to a language-aware name when the contact has none", () => {
    expect(resolveTemplateParam("name", { name: null }, "hi")).toBe("ग्राहक");
    expect(resolveTemplateParam(undefined, { name: "" }, "gu")).toBe("ગ્રાહક");
  });
  it("reads details of the sale that started a sequence", () => {
    const ctx = { amount: "12,500", bill: "1042", empty: "  " };
    expect(resolveTemplateParam("ctx:amount", contact, "en", ctx)).toBe("12,500");
    expect(resolveTemplateParam("ctx:bill", contact, "en", ctx)).toBe("1042");
  });
  it("uses a dash when the sale has no such detail, instead of a blank or the customer's name", () => {
    expect(resolveTemplateParam("ctx:bill", contact, "en", {})).toBe("-");
    expect(resolveTemplateParam("ctx:empty", contact, "en", { empty: "  " })).toBe("-");
    expect(resolveTemplateParam("ctx:bill", contact, "en")).toBe("-");
  });
  it("falls back to the name for an empty fixed text", () => expect(resolveTemplateParam("text:   ", { name: "Anil" })).toBe("Anil"));
});
