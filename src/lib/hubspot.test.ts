import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { syncHubspotContact } from "./hubspot";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("syncHubspotContact", () => {
  it("creates a new HubSpot contact when the search finds no match", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) }) // search
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "new-1" }) }); // create
    vi.stubGlobal("fetch", fetchMock);

    await syncHubspotContact("hs-token", "919876543210", "Priya");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [searchUrl, searchInit] = fetchMock.mock.calls[0];
    expect(searchUrl).toBe("https://api.hubapi.com/crm/v3/objects/contacts/search");
    expect(JSON.parse(searchInit.body).filterGroups[0].filters[0]).toEqual({ propertyName: "phone", operator: "EQ", value: "+919876543210" });

    const [createUrl, createInit] = fetchMock.mock.calls[1];
    expect(createUrl).toBe("https://api.hubapi.com/crm/v3/objects/contacts");
    expect(createInit.method).toBe("POST");
    expect(JSON.parse(createInit.body).properties).toEqual({ phone: "+919876543210", firstname: "Priya" });
  });

  it("updates the existing contact by id when the search finds a match, instead of creating a duplicate", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [{ id: "existing-42" }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "existing-42" }) });
    vi.stubGlobal("fetch", fetchMock);

    await syncHubspotContact("hs-token", "919876543210", "Priya");

    const [updateUrl, updateInit] = fetchMock.mock.calls[1];
    expect(updateUrl).toBe("https://api.hubapi.com/crm/v3/objects/contacts/existing-42");
    expect(updateInit.method).toBe("PATCH");
  });

  it("normalizes a phone number with no leading + before searching and writing", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    await syncHubspotContact("hs-token", "919876543210", null);
    const searchBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(searchBody.filterGroups[0].filters[0].value).toBe("+919876543210");
  });

  it("omits firstname entirely when no name is given, rather than sending an empty string", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    await syncHubspotContact("hs-token", "919876543210");
    const createBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(createBody.properties).toEqual({ phone: "+919876543210" });
  });

  it("treats a failed search as no match, falling back to create rather than throwing", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 401 })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    await expect(syncHubspotContact("bad-token", "919876543210")).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[1][0]).toBe("https://api.hubapi.com/crm/v3/objects/contacts");
  });

  it("never throws — a down or misconfigured HubSpot key must not break the caller", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    await expect(syncHubspotContact("hs-token", "919876543210")).resolves.toBeUndefined();
  });
});
