import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  applyAvailabilitySummaryPrice,
  applyLiveReviewsCommercial,
  fetchViatorLiveJson,
  readViatorPricingCurrency,
} from "./viatorLiveCommercialFetch";

vi.mock("../../lib/viator.js", () => ({
  fetchViatorWithCurl: vi.fn(),
}));

const { fetchViatorWithCurl } = await import("../../lib/viator.js");

const buildExtracted = (overrides = {}) => ({
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
  ...overrides,
});

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
      extracted: buildExtracted(),
    });

    expect(extracted.priceAmount).toBe(385);
    expect(extracted.priceFormatted).toBe("From $385.00");
    expect(fetchViatorWithCurl).toHaveBeenCalledTimes(2);
  });

  it("overlays USD availability search when the live product is in supplier currency", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("ENETUNREACH"));
    vi.mocked(fetchViatorWithCurl).mockResolvedValue({
      status: 200,
      body: JSON.stringify({
        bookableItems: [{ pricing: { recommendedRetailPrice: 156.6 } }],
      }),
    });

    const extracted = await applyAvailabilitySummaryPrice({
      apiKey: "test-key",
      baseUrl: "https://api.viator.com/partner",
      productCode: "92136P55",
      extracted: buildExtracted({
        priceAmount: 23000,
        priceFormatted: "From $23000.00",
      }),
      livePayload: {
        product: {
          productCode: "92136P55",
          pricing: { summary: { fromPrice: 23000 }, currency: "JPY" },
        },
      },
    });

    expect(extracted.priceAmount).toBe(156.6);
    expect(extracted.priceFormatted).toBe("From $156.60");
    expect(extracted.priceCurrency).toBe("USD");
    expect(fetchViatorWithCurl).toHaveBeenCalledTimes(1);
    expect(fetchViatorWithCurl).toHaveBeenCalledWith(
      "https://api.viator.com/partner/availability/schedules/search",
      "test-key",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"currency":"USD"'),
      })
    );
  });

  it("keeps an existing USD product price without an availability overlay", async () => {
    const extracted = await applyAvailabilitySummaryPrice({
      apiKey: "test-key",
      baseUrl: "https://api.viator.com/partner",
      productCode: "92136P55",
      extracted: buildExtracted({
        priceAmount: 156.6,
        priceFormatted: "From $156.60",
      }),
      livePayload: {
        product: {
          pricing: { summary: { fromPrice: 156.6 }, currency: "USD" },
        },
      },
    });

    expect(extracted.priceAmount).toBe(156.6);
    expect(extracted.priceFormatted).toBe("From $156.60");
    expect(fetchViatorWithCurl).not.toHaveBeenCalled();
  });

  it("overlays USD availability search when live product omits currency", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("ENETUNREACH"));
    vi.mocked(fetchViatorWithCurl).mockResolvedValue({
      status: 200,
      body: JSON.stringify({
        bookableItems: [{ pricing: { recommendedRetailPrice: 156.6 } }],
      }),
    });

    const extracted = await applyAvailabilitySummaryPrice({
      apiKey: "test-key",
      baseUrl: "https://api.viator.com/partner",
      productCode: "92136P55",
      extracted: buildExtracted({
        priceAmount: 16500,
        priceFormatted: "From $16500.00",
      }),
      livePayload: {
        product: {
          productCode: "92136P55",
          pricing: { summary: { fromPrice: 16500 } },
        },
      },
    });

    expect(extracted.priceAmount).toBe(156.6);
    expect(extracted.priceFormatted).toBe("From $156.60");
    expect(extracted.priceCurrency).toBe("USD");
  });

  it("replaces a non-USD extracted amount with the USD availability price", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("ENETUNREACH"));
    vi.mocked(fetchViatorWithCurl).mockResolvedValue({
      status: 200,
      body: JSON.stringify({ summary: { fromPrice: 106.77 } }),
    });

    const extracted = await applyAvailabilitySummaryPrice({
      apiKey: "test-key",
      baseUrl: "https://api.viator.com/partner",
      productCode: "33215P1",
      extracted: buildExtracted({
        priceAmount: 16500,
        priceCurrency: "JPY",
        priceFormatted: "From ¥16,500.00",
      }),
    });

    expect(extracted.priceAmount).toBe(106.77);
    expect(extracted.priceCurrency).toBe("USD");
    expect(extracted.priceFormatted).toBe("From $106.77");
  });
});

describe("readViatorPricingCurrency", () => {
  it("reads product.pricing.currency from a wrapped payload", () => {
    expect(
      readViatorPricingCurrency({
        product: { pricing: { currency: "jpy" } },
      })
    ).toBe("JPY");
  });
});

describe("applyLiveReviewsCommercial", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetchViatorWithCurl).mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("overrides stale product rating metadata with the live reviews endpoint", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("ENETUNREACH"));
    vi.mocked(fetchViatorWithCurl).mockResolvedValue({
      status: 200,
      body: JSON.stringify({
        totalReviewsSummary: {
          combinedAverageRating: 4.7,
          totalReviews: 575,
        },
      }),
    });

    const extracted = await applyLiveReviewsCommercial({
      apiKey: "test-key",
      baseUrl: "https://api.viator.com/partner",
      productCode: "6740P7",
      extracted: buildExtracted({
        aggregateRating: 4.7,
        reviewCount: 573,
      }),
    });

    expect(extracted.aggregateRating).toBe(4.7);
    expect(extracted.reviewCount).toBe(575);
    expect(fetchViatorWithCurl).toHaveBeenCalledOnce();
    expect(vi.mocked(fetchViatorWithCurl).mock.calls[0]?.[0]).toBe(
      "https://api.viator.com/partner/reviews/product"
    );
  });
});
