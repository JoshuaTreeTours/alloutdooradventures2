import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import handler from "./viator-product";

const createRes = () => {
  const res: any = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(name: string, value: string) {
      this.headers[name] = value;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

describe("/api/engine6/viator-product", () => {
  beforeEach(() => {
    delete process.env.VIATOR_API_KEY;
    delete process.env.ENGINE6_VIATOR_API_KEY;
    delete process.env.VIATOR_PARTNER_API_KEY;
    delete process.env.VIATOR_API_BASE_URL;
    delete process.env.VIATOR_BASE_URL;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.VIATOR_API_KEY;
    delete process.env.ENGINE6_VIATOR_API_KEY;
    delete process.env.VIATOR_PARTNER_API_KEY;
    delete process.env.VIATOR_API_BASE_URL;
    delete process.env.VIATOR_BASE_URL;
  });

  it("returns the bundled clean specimen response when the API key is missing", async () => {
    const req = { method: "GET", query: { productCode: "63657P1" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.headers["X-Engine6-Source"]).toBe(
      "bundled-exact-product-payload"
    );
    expect((res.body as any).source).toBe("bundled-fallback");
    expect((res.body as any).diagnostics).toEqual(
      expect.objectContaining({
        source: "bundled-fallback",
        hasViatorApiKey: false,
        attemptedLiveFetch: false,
        usedBundledFallbackBecause: "missing-api-key",
        heroSourceType: "api-primary",
        heroCandidatesPresent: true,
        heroCandidateCount: 1,
        finalHeroUrl:
          "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg",
        heroFallbackTriggered: false,
        heroPlaceholderFallbackReason: null,
      })
    );
    expect((res.body as any).extracted.heroImageUrl).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg"
    );
    expect((res.body as any).extracted.heroImageUrl).not.toContain("/hero.jpg");
  });

  it("strips contaminated itinerary content from the happy hour yacht API envelope", async () => {
    const req = { method: "GET", query: { productCode: "447486P2" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any).extracted.itinerary).toEqual([]);
    expect((res.body as any).extracted.itinerarySummaryText).toBeNull();
    expect((res.body as any).extracted.overviewText).toBeNull();
    expect((res.body as any).rawProduct.itinerary).toBeUndefined();
    expect((res.body as any).rawProduct.itineraryItems).toBeUndefined();
    expect(JSON.stringify((res.body as any).extracted)).not.toMatch(
      /Stearns Wharf|Andrée Clark Bird Refuge|Santa Barbara Trolley Tour/i
    );
  });

  it("falls back when bundled payload lacks product.media.images candidates", async () => {
    const req = { method: "GET", query: { productCode: "36001P1" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(422);
    expect((res.body as any).source).toBe("bundled-fallback");
    expect((res.body as any).error).toBe(
      "Engine6 strict exact-product hero validation failed"
    );
    expect((res.body as any).details).toBe("null resolved hero");
    expect((res.body as any).diagnostics).toEqual(
      expect.objectContaining({
        heroSourceType: "none",
        heroCandidatesPresent: false,
        heroCandidateCount: 0,
        finalHeroUrl: null,
        heroFallbackTriggered: true,
        heroPlaceholderFallbackReason: "no-candidates",
      })
    );
    expect((res.body as any).extracted.heroImageUrl).toBeNull();
  });

  it("returns the normalized live envelope with product-scoped hero diagnostics", async () => {
    process.env.VIATOR_API_KEY = "k";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () =>
        JSON.stringify({
          product: {
            productCode: "63657P1",
            productUrl:
              "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
            title: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
            description: {
              text: "Ride through the towns and vineyards of the Santa Ynez Valley wine region on this e-bike tour with transport from Santa Barbara.",
            },
            highlights: ["Bike and helmet provided"],
            additionalInfo: ["Not wheelchair accessible"],
            itineraryItems: [
              {
                title: "I Bike Santa Barbara Wine Tours",
                description: "Admission Ticket Included",
                duration: "40 minutes",
              },
            ],
            priceFrom: "$199.00",
            media: {
              images: [
                {
                  isCover: true,
                  variants: {
                    FULL: {
                      url: "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg",
                      width: 674,
                      height: 446,
                    },
                    CAPTION: {
                      url: "https://media.tacdn.com/media/attractions-content--1x-1/0f/56/92/caption.jpg",
                      width: 1200,
                      height: 900,
                    },
                  },
                },
              ],
            },
            reviews: { combinedAverageRating: 4.9, totalReviews: 177 },
            logistics: {
              start: {
                description:
                  "3850 State St, Santa Barbara, CA 93105, USA. Peppertree Inn with free parking.",
              },
            },
            location: { city: "Santa Barbara", state: "California" },
          },
        }),
    } as Response);

    const req = { method: "GET", query: { productCode: "63657P1" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any).source).toBe("live-api");
    expect((res.body as any).diagnostics).toEqual(
      expect.objectContaining({
        heroImageFieldPath: "product.media.images[0].variants.CAPTION.url",
        heroVariantFieldPath: "product.media.images[0].variants.CAPTION",
        imageSourceUsed: "api-primary",
        heroSourceType: "api-primary",
        heroCandidatesPresent: true,
        heroCandidateCount: 2,
        finalHeroUrl:
          "https://media.tacdn.com/media/attractions-content--1x-1/0f/56/92/caption.jpg",
        heroFallbackTriggered: false,
        heroPlaceholderFallbackReason: null,
        rejectedForeignHeroCandidates: [],
      })
    );
    expect((res.body as any).extracted.heroImageUrl).toBe(
      "https://media.tacdn.com/media/attractions-content--1x-1/0f/56/92/caption.jpg"
    );
    expect(
      (res.body as any).diagnostics.selectedHeroWidth
    ).toBeGreaterThanOrEqual(800);
  });

  it("accepts Engine6-specific Viator API key aliases before using snapshots", async () => {
    process.env.ENGINE6_VIATOR_API_KEY = "alias-key";

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () =>
        JSON.stringify({
          product: {
            productCode: "63657P1",
            productUrl:
              "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
            title: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
            priceFrom: "$201.00",
            media: {
              images: [
                {
                  variants: {
                    FULL: {
                      url: "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg",
                      width: 674,
                      height: 446,
                    },
                  },
                },
              ],
            },
          },
        }),
    } as Response);

    const req = { method: "GET", query: { productCode: "63657P1" } };
    const res = createRes();

    await handler(req, res);

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/products/63657P1"),
      expect.objectContaining({
        headers: expect.objectContaining({ "exp-api-key": "alias-key" }),
      })
    );
    expect((res.body as any).source).toBe("live-api");
    expect((res.body as any).extracted.priceAmount).toBe(201);
  });

  it("keeps live commercial fields when only the live hero needs a safe product-scoped snapshot override", async () => {
    process.env.VIATOR_API_KEY = "server-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () =>
        JSON.stringify({
          product: {
            productCode: "63657P1",
            productUrl:
              "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
            title: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
            priceFrom: "$222.00",
            reviews: { combinedAverageRating: 4.7, totalReviews: 2222 },
            duration: "6 hours",
          },
        }),
    } as Response);

    const req = { method: "GET", query: { productCode: "63657P1" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any).source).toBe("live-api");
    expect(res.headers["X-Engine6-Source"]).toBe("live-api");
    expect(res.headers["X-Engine6-Hero-Authority"]).toBe(
      "safe-product-scoped-override"
    );
    expect((res.body as any).extracted.priceAmount).toBe(222);
    expect((res.body as any).extracted.aggregateRating).toBe(4.7);
    expect((res.body as any).extracted.reviewCount).toBe(2222);
    expect((res.body as any).extracted.durationText).toBe("6 hours");
    expect((res.body as any).extracted.heroImageUrl).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg"
    );
    expect((res.body as any).diagnostics.usedBundledFallbackBecause).toBe("");
  });

  it("rejects a foreign live hero candidate and keeps the bundled product-scoped hero", async () => {
    process.env.VIATOR_API_KEY = "server-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () =>
        JSON.stringify({
          product: {
            productCode: "OTHER123",
            productUrl:
              "https://www.viator.com/tours/Other-City/Other-Tour/d999-OTHER123",
            title: "Sibling Tour",
            priceFrom: "$199.00",
            media: {
              images: [
                {
                  isCover: true,
                  variants: {
                    FULL: {
                      url: "https://cdn.example.com/foreign-sibling-tour.jpg",
                      width: 1200,
                      height: 800,
                    },
                  },
                },
              ],
            },
          },
        }),
    } as Response);

    const req = { method: "GET", query: { productCode: "63657P1" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any).source).toBe("bundled-fallback");
    expect((res.body as any).diagnostics.finalHeroUrl).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg"
    );
    expect((res.body as any).diagnostics.heroSourceType).toBe("api-primary");
    expect((res.body as any).diagnostics.heroFallbackTriggered).toBe(false);
    expect((res.body as any).extracted.heroImageUrl).not.toContain("/hero.jpg");
  });

  it("returns no image only when the product has no valid API hero", async () => {
    process.env.VIATOR_API_KEY = "server-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () =>
        JSON.stringify({
          product: {
            productCode: "NOIMAGE1",
            productUrl:
              "https://www.viator.com/tours/Santa-Barbara/No-Image/d4372-NOIMAGE1",
            title: "No Image Tour",
            description: { text: "No image but valid tour." },
            priceFrom: "$49.00",
            location: { city: "Santa Barbara", state: "California" },
          },
        }),
    } as Response);

    const req = { method: "GET", query: { productCode: "NOIMAGE1" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(422);
    expect((res.body as any).error).toBe(
      "Engine6 strict exact-product hero validation failed"
    );
    expect((res.body as any).details).toBe("null resolved hero");
    expect((res.body as any).extracted.heroImageUrl).toBeNull();
    expect((res.body as any).diagnostics.heroSourceType).toBe("none");
    expect((res.body as any).diagnostics.heroFallbackTriggered).toBe(true);
    expect((res.body as any).diagnostics.heroCandidatesPresent).toBe(false);
    expect((res.body as any).diagnostics.heroCandidateCount).toBe(0);
    expect((res.body as any).diagnostics.heroPlaceholderFallbackReason).toBe(
      "no-candidates"
    );
    expect((res.body as any).diagnostics.finalHeroUrl).toBeNull();
  });

  it("keeps exact-product caption hero when caption + product-media are both available", async () => {
    const req = { method: "GET", query: { productCode: "5584233P1" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any).source).toBe("bundled-fallback");
    expect((res.body as any).diagnostics.heroQualityClassification).toBe(
      "caption"
    );
    expect(
      (res.body as any).diagnostics.heroCandidateCount
    ).toBeGreaterThanOrEqual(1);
    expect((res.body as any).extracted.heroImageUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/30/39/1f/1e/caption.jpg?w=700&h=500&s=1"
    );
  });

  it("keeps exact-product splice hero when splice is the only same-product candidate", async () => {
    const req = { method: "GET", query: { productCode: "26719P8" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any).source).toBe("bundled-fallback");
    expect((res.body as any).diagnostics.heroQualityClassification).toBe(
      "splice"
    );
    expect(
      (res.body as any).diagnostics.heroCandidateCount
    ).toBeGreaterThanOrEqual(1);
    expect((res.body as any).extracted.heroImageUrl).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-360x240/0a/29/a2/f4.jpg"
    );
  });

  it("selects same-product caption for 6331BAHA when caption and splice candidates coexist", async () => {
    const req = { method: "GET", query: { productCode: "6331BAHA" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any).source).toBe("bundled-fallback");
    expect((res.body as any).diagnostics.heroQualityClassification).toBe(
      "caption"
    );
    expect((res.body as any).diagnostics.heroSourceProductCode).toBe(
      "6331BAHA"
    );
    expect((res.body as any).diagnostics.rejectedForeignCandidateCount).toBe(0);
    expect((res.body as any).extracted.heroImageUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/30/7a/ae/ce/caption.jpg?w=1400&h=1000&s=1"
    );
  });

  it("locks 89173P10 to the exact user-supplied same-product caption hero", async () => {
    const req = { method: "GET", query: { productCode: "89173P10" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any).source).toBe("bundled-fallback");
    expect((res.body as any).diagnostics.heroQualityClassification).toBe(
      "caption"
    );
    expect((res.body as any).diagnostics.heroSourceProductCode).toBe(
      "89173P10"
    );
    expect((res.body as any).diagnostics.finalHeroUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/2f/0c/e5/f4/caption.jpg?w=700&h=500&s=1"
    );
    expect((res.body as any).extracted.heroImageUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/2f/0c/e5/f4/caption.jpg?w=700&h=500&s=1"
    );
  });

  it("keeps hero/card/schema parity and emits same-product diagnostics", async () => {
    const req = { method: "GET", query: { productCode: "63657P1" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any).diagnostics.activeProductCode).toBe("63657P1");
    expect((res.body as any).diagnostics.resolvedHeroUrl).toBe(
      (res.body as any).extracted.heroImageUrl
    );
    expect((res.body as any).diagnostics.finalHeroUrl).toBe(
      (res.body as any).extracted.heroImageUrl
    );
    expect((res.body as any).diagnostics.heroSurfaceParity).toEqual({
      page: true,
      card: true,
      schema: true,
    });
    expect((res.body as any).diagnostics.heroSourceProductCode).toBe("63657P1");
    expect((res.body as any).diagnostics.rejectedForeignCandidateCount).toBe(
      (res.body as any).diagnostics.rejectedForeignHeroCandidates.length
    );
    expect(
      Array.isArray(
        (res.body as any).diagnostics.rejectedForeignCandidateExamples
      )
    ).toBe(true);
  });

  it("ignores non-product root image pools and only trusts product.media.images", async () => {
    process.env.VIATOR_API_KEY = "server-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () =>
        JSON.stringify({
          product: {
            productCode: "ROOT1",
            productUrl:
              "https://www.viator.com/tours/Miami/Root-Pool-Test/d662-ROOT1",
            title: "Root Pool Test",
            imageUrl:
              "https://dynamic-media.tacdn.com/media/photo-o/ff/00/foreign.jpg",
            images: [
              {
                url: "https://dynamic-media.tacdn.com/media/photo-o/ff/11/foreign-array.jpg",
              },
            ],
            thumbnailURL:
              "https://dynamic-media.tacdn.com/media/photo-o/ff/22/foreign-thumb.jpg",
            priceFrom: "$10.00",
            location: { city: "Miami", state: "Florida" },
          },
        }),
    } as Response);

    const req = { method: "GET", query: { productCode: "ROOT1" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(422);
    expect((res.body as any).error).toBe(
      "Engine6 strict exact-product hero validation failed"
    );
    expect((res.body as any).details).toBe("null resolved hero");
    expect((res.body as any).diagnostics.heroCandidatesPresent).toBe(false);
    expect(
      (res.body as any).diagnostics.heroCandidateCountBeforeFiltering
    ).toBe(0);
    expect((res.body as any).diagnostics.heroFallbackTriggered).toBe(true);
    expect((res.body as any).extracted.heroImageUrl).toBeNull();
  });
});
