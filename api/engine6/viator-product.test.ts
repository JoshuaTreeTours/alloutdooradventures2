import { afterEach, describe, expect, it, vi } from "vitest";

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
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.VIATOR_API_KEY;
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

  it("falls back when bundled payload lacks product.media.images candidates", async () => {
    const req = { method: "GET", query: { productCode: "36001P1" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any).source).toBe("bundled-fallback");
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
        heroCandidateCount: 1,
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
    expect((res.body as any).diagnostics.selectedHeroWidth).toBeGreaterThanOrEqual(
      800
    );
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

    expect(res.statusCode).toBe(200);
    expect((res.body as any).extracted.heroImageUrl).toBeNull();
    expect((res.body as any).diagnostics.heroSourceType).toBe(
      "none"
    );
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
    expect((res.body as any).diagnostics.heroQualityClassification).toBe("caption");
    expect((res.body as any).diagnostics.heroCandidateCount).toBeGreaterThanOrEqual(
      1
    );
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
    expect((res.body as any).diagnostics.heroQualityClassification).toBe("splice");
    expect((res.body as any).diagnostics.heroCandidateCount).toBeGreaterThanOrEqual(
      1
    );
    expect((res.body as any).extracted.heroImageUrl).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-360x240/0a/29/a2/f4.jpg"
    );
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
            productUrl: "https://www.viator.com/tours/Miami/Root-Pool-Test/d662-ROOT1",
            title: "Root Pool Test",
            imageUrl: "https://dynamic-media.tacdn.com/media/photo-o/ff/00/foreign.jpg",
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

    expect(res.statusCode).toBe(200);
    expect((res.body as any).diagnostics.heroCandidatesPresent).toBe(false);
    expect((res.body as any).diagnostics.heroCandidateCountBeforeFiltering).toBe(0);
    expect((res.body as any).diagnostics.heroFallbackTriggered).toBe(true);
    expect((res.body as any).extracted.heroImageUrl).toBeNull();
  });
});
