import { describe, it, expect } from "vitest";
import { PACK_TEMPLATES, PACK_LANGUAGES, VAR_KINDS, JOURNEY_STEPS, BILL_TEMPLATE, BILL_DUE_TEMPLATE, PAY_BUTTON_TEXT, billMessageLang, buildPackTemplate, selectPackTemplates, journeyMapping } from "./templatePack";
import { buildTemplateComponents } from "./templateBuild";

// The pack must suit ANY business. These are trade-specific words that belong in a business's own templates, not here.
const INDUSTRY_WORDS = /steel|utensil|thali|kadhai|tiffin|cooker|vessel|cutlery|saree|sari|lehenga|jewel|gold|silver|grocery|kirana|medicine|pharma|electronic|furniture/i;

const variableIndexes = (text: string) => [...text.matchAll(/\{\{(\d+)\}\}/g)].map((m) => Number(m[1]));

describe("starter template pack — Meta's rules", () => {
  it("contains no industry-specific wording, in any language, example or description", () => {
    for (const t of PACK_TEMPLATES) {
      const text = [t.title, t.when, ...Object.values(t.body), ...t.vars.flatMap((v) => Object.values(VAR_KINDS[v].example))].join(" ");
      expect(text, t.key).not.toMatch(INDUSTRY_WORDS);
    }
    for (const info of Object.values(VAR_KINDS)) {
      expect([info.label, ...Object.values(info.example)].join(" ")).not.toMatch(INDUSTRY_WORDS);
    }
  });

  it("has unique template keys", () => {
    const keys = PACK_TEMPLATES.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  for (const t of PACK_TEMPLATES) {
    for (const { code } of PACK_LANGUAGES) {
      const built = buildPackTemplate(t, code);
      const label = `${t.key} / ${code}`;

      it(`${label}: valid Meta name and sane lengths`, () => {
        expect(built.metaName).toMatch(/^[a-z0-9_]+$/);
        expect(built.metaName.length).toBeLessThanOrEqual(512);
        expect(built.bodyText.length).toBeLessThanOrEqual(1024);
        if (built.footerText) expect(built.footerText.length).toBeLessThanOrEqual(60);
        for (const b of built.buttons ?? []) expect(b.text.length).toBeLessThanOrEqual(25);
      });

      it(`${label}: variables are {{1}}..{{n}} in order and match the declared kinds`, () => {
        const unique = [...new Set(variableIndexes(built.bodyText))].sort((a, b) => a - b);
        expect(unique).toEqual(t.vars.map((_, i) => i + 1));
        expect(built.examples).toHaveLength(t.vars.length);
        for (const ex of built.examples) expect(ex.trim().length).toBeGreaterThan(0);
      });

      it(`${label}: no variable at the very start or end, none side by side`, () => {
        const body = built.bodyText.trim();
        expect(body.startsWith("{{")).toBe(false);
        expect(body.endsWith("}}")).toBe(false);
        expect(/\}\}\s*\{\{/.test(body)).toBe(false);
        expect(body).not.toMatch(/\n/);
      });

      it(`${label}: enough plain words around the variables`, () => {
        const words = built.bodyText.replace(/\{\{\d+\}\}/g, "").split(/\s+/).filter(Boolean).length;
        expect(words).toBeGreaterThanOrEqual(variableIndexes(built.bodyText).length * 3);
      });

      it(`${label}: marketing has an opt-out, utility does not need one`, () => {
        if (t.category === "MARKETING") {
          expect(built.buttons?.[0]?.text).toBe("Stop");
          expect(built.footerText).toBeTruthy();
        } else {
          expect(built.buttons).toBeUndefined();
        }
      });
    }

    it(`${t.key}: every language has the same variables`, () => {
      const sets = PACK_LANGUAGES.map(({ code }) => [...new Set(variableIndexes(t.body[code]))].sort().join(","));
      expect(new Set(sets).size).toBe(1);
    });

    it(`${t.key}: declared kinds exist`, () => {
      for (const v of t.vars) expect(VAR_KINDS[v]).toBeDefined();
    });
  }

  it("produces a Meta submission with variable examples", () => {
    const t = PACK_TEMPLATES.find((x) => x.key === "payment_reminder")!;
    const built = buildPackTemplate(t, "en");
    const [body] = buildTemplateComponents({ bodyText: built.bodyText, bodyExamples: built.examples });
    expect(body.example).toEqual({ body_text: [["Rajesh", "12,500", "15 Nov 2026", "https://rzp.io/i/abc123"]] });
  });

  it("matches what Payment reminders sends: name, amount, due date, payment link", () => {
    const t = PACK_TEMPLATES.find((x) => x.key === "payment_reminder")!;
    expect(t.vars).toEqual(["name", "amount", "date", "link"]);
  });

  it("selects by key and stage", () => {
    expect(selectPackTemplates({ keys: ["new_stock"] })).toHaveLength(1);
    expect(selectPackTemplates({ stages: ["nurture"] }).every((t) => t.stage === "nurture")).toBe(true);
    expect(selectPackTemplates()).toHaveLength(PACK_TEMPLATES.length);
  });
});

describe("thank-you journey", () => {
  it("uses templates that exist in the pack, in order, with growing delays", () => {
    for (const step of JOURNEY_STEPS) expect(PACK_TEMPLATES.some((t) => t.key === step.key)).toBe(true);
    const delays = JOURNEY_STEPS.map((x) => x.delayMinutes);
    expect(delays).toEqual([...delays].sort((a, b) => a - b));
    expect(delays[0]).toBe(0);
  });
  it("fills every variable of every step so nothing is sent blank", () => {
    for (const step of JOURNEY_STEPS) {
      const t = PACK_TEMPLATES.find((x) => x.key === step.key)!;
      for (const { code } of PACK_LANGUAGES) {
        const mapping = journeyMapping(t, { shop: "Sharma Traders" });
        expect(Object.keys(mapping).sort()).toEqual(t.vars.map((_, i) => String(i + 1)));
      }
    }
  });
  it("takes the customer's name from the contact and the amount and bill from the sale", () => {
    const t = PACK_TEMPLATES.find((x) => x.key === "purchase_thank_you")!;
    expect(journeyMapping(t, { shop: "Shop" })).toEqual({ "1": "name", "2": "text:Shop", "3": "ctx:amount_display", "4": "ctx:bill" });
  });
});

describe("bill message template", () => {
  it("is a UTILITY message with name, shop, bill and amount in every language", () => {
    expect(BILL_TEMPLATE.category).toBe("UTILITY");
    for (const { code } of PACK_LANGUAGES) {
      const built = buildPackTemplate(BILL_TEMPLATE, code);
      expect(built.metaName).toBe(`sk_bill_sent_${code}`);
      expect([...new Set(variableIndexes(built.bodyText))].sort()).toEqual(["1", "2", "3", "4"].map(Number));
      expect(built.bodyText.trim().endsWith("}}")).toBe(false);
      expect(built.buttons).toBeUndefined();
      expect(built.bodyText.replace(/\{\{\d+\}\}/g, "").split(/\s+/).filter(Boolean).length).toBeGreaterThanOrEqual(12);
    }
  });
  it("sends every language the best wording it has", () => {
    expect(billMessageLang("gu")).toBe("gu");
    expect(billMessageLang("mr")).toBe("hi");
    expect(billMessageLang("ta")).toBe("en");
  });
});

describe("bill message with a pay button", () => {
  it("has the same four variables as the plain bill message, in every language, and a button label that fits", () => {
    for (const { code } of PACK_LANGUAGES) {
      const built = buildPackTemplate(BILL_DUE_TEMPLATE, code);
      expect(built.metaName).toBe(`sk_bill_due_${code}`);
      expect([...new Set(variableIndexes(built.bodyText))].sort()).toEqual([1, 2, 3, 4]);
      expect(built.bodyText.trim().endsWith("}}")).toBe(false);
      expect(PAY_BUTTON_TEXT[code].length).toBeLessThanOrEqual(25);
    }
  });
});
