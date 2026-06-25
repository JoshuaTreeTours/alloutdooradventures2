import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  applyAvailabilitySummaryPrice,
  fetchViatorLiveJson,
} from "./viatorLiveCommercialFetch";

vi.mock("../../lib/viator.js", () => ({
  fetchViatorWithCurl: vi.fn(),
}));

const { fetchViatorWithCurl } = await import("../../lib/viator.js");

describe("fetchViatorLiveJson", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetchViatorWithCurl).mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("falls back to curl when native fetch throws", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("ENETUNREACH"));
    vi.mocked(fetchViatorWithCurl).mockResolvedValue({
      status: 200,
      body: JSON.stringify({ summary: { fromPrice: 89 } }),
    });

    const result = await fetchViatorLiveJson({
      apiKey: "test-key",
      url: "https://api.viator.com/partner/availability/schedules/191303P1?currency=USD",
    });

    expect(result.status).toBe(200);
    expect(result.payload).toEqual({ summary: { fromPrice: 89 } });
    expect(fetchViatorWithCurl).toHaveBeenCalledOnce();
  });

  it("falls back to curl when native fetch returns non-json", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => "text/plain",
      },
      text: async () => "not-json",
    } as unknown as Response);
    vi.mocked(fetchViatorWithCurl).mockResolvedValue({
      status: 200,
      body: JSON.stringify({
        bookableItems: [{ pricing: { recommendedRetailPrice: 199 } }],
      }),
    });

    const result = await fetchViatorLiveJson({
      apiKey: "test-key",
      url: "https://api.viator.com/partner/availability/schedules/search",
      method: "POST",
      body: "{}",
    });

    expect(result.status).toBe(200);
    expect(fetchViatorWithCurl).toHaveBeenCalledOnce();
  });
});

describe("applyAvailabilitySummaryPrice", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetchViatorWithCurl).mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses availability search when schedule summary has no price", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("ENETUNREACH"));
    vi.mocked(fetchViatorWithCurl)
      .mockResolvedValueOnce({
        status: 200,
        body: JSON.stringify({ summary: {} }),
      })
      .mockResolvedValueOnce({
        status: 200,
        body: JSON.stringify({
          bookableItems: [{ pricing: { recommendedRetailPrice: 385 } }],
        }),
      });

    const extracted = await applyAvailabilitySummaryPrice({
      apiKey: "test-key",
      baseUrl: "https://api.viator.com/partner",
      productCode: "44152P18",
      extracted: {
        title: "Test",
        seoTitle: null,
        seoDescription: null,
        city: null,
        state: null,
        heroImageUrl: null,
        productUrl: null,
        priceAmount: null,
        priceFormatted: null,
        durationText: null,
        aggregateRating: null,
        reviewCount: null,
        meetingPointText: null,
        overviewText: null,
        highlights: [],
        itinerary: [],
        itinerarySummaryText: null,
        faqs: [],
        included: [],
        requirements: [],
        primaryCategory: null,
        categories: [],
        primaryDisplayCategory: null,
        activityCategories: [],
      },
    });

    expect(extracted.priceAmount).toBe(385);
    expect(extracted.priceFormatted).toBe("From $385.00");
    expect(fetchViatorWithCurl).toHaveBeenCalledTimes(2);
  });
});
