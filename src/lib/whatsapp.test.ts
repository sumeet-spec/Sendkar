import { describe, it, expect } from "vitest";
import { isWhatsAppConfigured } from "./whatsapp";

describe("isWhatsAppConfigured", () => {
  it("is false with no credentials", () => {
    expect(isWhatsAppConfigured({ whatsapp_phone_number_id: null, whatsapp_access_token: null })).toBe(false);
  });

  it("is false with only one of the two credentials set", () => {
    expect(isWhatsAppConfigured({ whatsapp_phone_number_id: "123", whatsapp_access_token: null })).toBe(false);
    expect(isWhatsAppConfigured({ whatsapp_phone_number_id: null, whatsapp_access_token: "token" })).toBe(false);
  });

  it("is true once both credentials are present", () => {
    expect(isWhatsAppConfigured({ whatsapp_phone_number_id: "123", whatsapp_access_token: "token" })).toBe(true);
  });
});
