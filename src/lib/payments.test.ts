import { describe, it, expect } from "vitest";
import { buildPayuPaymentRequest, verifyPayuResponseHash, PaymentsNotConfiguredError } from "./payments";

describe("buildPayuPaymentRequest", () => {
  const creds = { payu_merchant_key: "testkey", payu_salt: "testsalt" };

  it("throws PaymentsNotConfiguredError when credentials are missing", async () => {
    await expect(
      buildPayuPaymentRequest(
        { payu_merchant_key: null, payu_salt: null },
        { amountInRupees: 100, description: "order", contactPhoneE164Digits: "919999999999", referenceId: "ref1", successUrl: "https://x/s", failureUrl: "https://x/f" },
      ),
    ).rejects.toThrow(PaymentsNotConfiguredError);
  });

  it("produces fields whose hash a reverse verification accepts", async () => {
    const { action, fields } = await buildPayuPaymentRequest(creds, {
      amountInRupees: 250,
      description: "Order from Test Shop",
      contactPhoneE164Digits: "919999999999",
      referenceId: "txn-123",
      successUrl: "https://sendkar.shop/api/payu/return",
      failureUrl: "https://sendkar.shop/api/payu/return",
    });

    expect(action).toBe("https://secure.payu.in/_payment");
    expect(fields.txnid).toBe("txn-123");
    expect(fields.amount).toBe("250.00");
    expect(fields.key).toBe("testkey");

    // Simulate PayU echoing the transaction back on success — the reverse hash
    // must validate against the exact fields PayU would actually send back.
    const responseFields = {
      status: "success",
      email: fields.email,
      firstname: fields.firstname,
      productinfo: fields.productinfo,
      amount: fields.amount,
      txnid: fields.txnid,
      hash: "", // filled in below once we know what a valid one looks like
    };

    // Compute what PayU's reverse hash *should* be for this outcome, the same
    // way verifyPayuResponseHash does internally, to get a valid test hash
    // without needing a real PayU account.
    const crypto = await import("node:crypto");
    const hashString = [
      creds.payu_salt, "success",
      "", "", "", "", "", "", "", "", "", "",
      fields.email, fields.firstname, fields.productinfo, fields.amount, fields.txnid, creds.payu_merchant_key,
    ].join("|");
    const validHash = crypto.createHash("sha512").update(hashString).digest("hex");

    const valid = await verifyPayuResponseHash({ ...responseFields, hash: validHash }, creds.payu_salt, creds.payu_merchant_key);
    expect(valid).toBe(true);
  });
});

describe("verifyPayuResponseHash", () => {
  it("rejects a tampered or missing hash", async () => {
    const valid = await verifyPayuResponseHash(
      { status: "success", email: "a@b.com", firstname: "A", productinfo: "x", amount: "10.00", txnid: "t1", hash: "not-the-real-hash" },
      "salt",
      "key",
    );
    expect(valid).toBe(false);
  });

  it("rejects an empty hash rather than treating it as a false-negative that still passes", async () => {
    const valid = await verifyPayuResponseHash(
      { status: "success", email: "a@b.com", firstname: "A", productinfo: "x", amount: "10.00", txnid: "t1", hash: "" },
      "salt",
      "key",
    );
    expect(valid).toBe(false);
  });
});
