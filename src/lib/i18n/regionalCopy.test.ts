import { describe, it, expect } from "vitest";
import { LANGUAGES, type LanguageCode } from "./dictionaries";
import { SERVER_MSGS, msgIn, showStored, storeMsg } from "./serverMsgs";
import { PAY_SETTINGS_UI, AI_AGENT_UI } from "./settingsCopy";
import { BILL_UI } from "./billUi";
import { BILL_IMPORT_UI } from "./billImportUi";
import { FOLLOW_UI } from "./followUi";
import { CUSTOMERS_UI } from "./customersUi";
import { CARE_UI } from "./careUi";
import { ITEMS_UI } from "./itemsUi";
import { ORDER_UI } from "./orderUi";
import { PAY_UI } from "./payUi";
import { CHAT_POSTER_COPY } from "./chatPosterCopy";
import { CHANNELS_UI } from "./channelsCopy";
import { REMINDERS_UI } from "./remindersCopy";
import { CONTACTS_UI } from "./contactsCopy";
import { BILLING_UI } from "./billingCopy";
import { SEGMENTS_UI } from "./segmentsCopy";

const SCRIPTS: Record<Exclude<LanguageCode, "en">, RegExp> = {
  hi: /[ऀ-ॿ]/, mr: /[ऀ-ॿ]/, gu: /[઀-૿]/, ta: /[஀-௿]/, te: /[ఀ-౿]/, kn: /[ಀ-೿]/,
};
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}|\{\{(\d)\}\}/g)].map((m) => m[0]).sort().join(",");

/** Every string in an object, depth first, with its path. */
function leaves(value: unknown, path = ""): Array<[string, string]> {
  if (typeof value === "string") return [[path, value]];
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k));
  return [];
}

const SETS: Array<[string, Record<LanguageCode, unknown>]> = [
  ["server messages", SERVER_MSGS], ["payments settings", PAY_SETTINGS_UI], ["AI agent settings", AI_AGENT_UI], ["quick bill", BILL_UI],
  ["bill import", BILL_IMPORT_UI], ["follow-ups", FOLLOW_UI], ["my customers", CUSTOMERS_UI], ["customer care", CARE_UI], ["my items", ITEMS_UI],
  ["order requests", ORDER_UI], ["pay page", PAY_UI], ["chat poster", CHAT_POSTER_COPY], ["channels", CHANNELS_UI], ["reminders", REMINDERS_UI], ["contacts", CONTACTS_UI], ["billing", BILLING_UI], ["segments", SEGMENTS_UI],
];

describe("every screen's words exist in all seven languages", () => {
  for (const [name, set] of SETS) {
    const en = leaves(set.en);
    for (const { code } of LANGUAGES) {
      it(`${name}: ${code} has every string, with the same placeholders`, () => {
        const got = new Map(leaves(set[code]));
        expect([...got.keys()].sort()).toEqual(en.map(([k]) => k).sort());
        for (const [k, enText] of en) {
          const text = got.get(k)!;
          expect(text.trim().length, `${name} ${code} ${k}`).toBeGreaterThan(0);
          expect(placeholders(text), `${name} ${code} ${k}`).toBe(placeholders(enText));
        }
      });
    }
  }

  it("is written in each language's own script, not English repeated", () => {
    for (const [name, set] of SETS) {
      for (const [code, script] of Object.entries(SCRIPTS)) {
        const text = leaves(set[code as LanguageCode]).map(([, v]) => v).join(" ");
        expect(text, `${name} ${code}`).toMatch(script);
      }
    }
  });
});

describe("server messages", () => {
  it("fills in the placeholders", () => {
    expect(msgIn("en", "pasteMax", { max: 40, n: 55 })).toBe("Paste at most 40 sales at a time. You pasted 55 from the last two days.");
    expect(msgIn("gu", "templateRejected", { reason: "x" })).toContain("x");
  });
  it("stores a notice as a code and shows it in the reader's language", () => {
    expect(storeMsg("needNumber")).toBe("code:needNumber");
    expect(showStored(storeMsg("needNumber"), "hi")).toBe(SERVER_MSGS.hi.needNumber);
    expect(showStored(storeMsg("templateRejected", "bad words"), "en")).toBe("WhatsApp did not accept the bill message: bad words");
  });
  it("leaves an older plain message, or a message from WhatsApp itself, as it is", () => {
    expect(showStored("The send failed.", "gu")).toBe("The send failed.");
    expect(showStored(null, "gu")).toBe("");
    expect(showStored("code:unknownKey", "gu")).toBe("code:unknownKey");
  });
});
