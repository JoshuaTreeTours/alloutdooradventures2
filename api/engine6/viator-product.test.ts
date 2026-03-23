import { afterEach, describe, expect, it, vi } from "vitest";

import handler from "./viator-product";
import * as viatorExtractors from "./viatorExtractors";

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

  it("returns bundled normalized specimen response when key is missing", async () => {
    const req = { method: "GET", query: { productCode: "163873P16" } };
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
        upstreamStatus: null,
        upstreamContentType: null,
        upstreamOk: null,
        usedBundledFallbackBecause: "missing-api-key",
      })
    );
    expect((res.body as any).extracted.heroImageUrl).toBeNull();
    expect((res.body as any).extracted.priceAmount).toBe(105.09);
    expect((res.body as any).extracted.aggregateRating).toBe(5);
    expect((res.body as any).extracted.reviewCount).toBe(154);
    expect((res.body as any).extracted.itinerary).toHaveLength(1);
  });

  it("returns normalized error envelope when key is missing for a non-bundled product", async () => {
    const req = { method: "GET", query: { productCode: "999999P001" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect((res.body as any).source).toBe("live-api");
    expect((res.body as any).error).toBe("VIATOR_API_KEY is not configured");
    expect((res.body as any).rawProductCode).toBe("999999P001");
    expect((res.body as any).rawProduct).toBeNull();
    expect((res.body as any).extracted.heroImageUrl).toBeNull();
  });

  it("uses VIATOR_API_BASE_URL precedence", async () => {
    process.env.VIATOR_API_KEY = "k";
    process.env.VIATOR_API_BASE_URL = "https://primary.viator.test/partner";
    process.env.VIATOR_BASE_URL = "https://secondary.viator.test/partner";

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () =>
        JSON.stringify({
          product: {
            productCode: "163873P16",
            title: "Tour",
            priceFrom: "$88",
          },
        }),
    } as Response);

    const req = { method: "GET", query: { productCode: "163873P16" } };
    const res = createRes();

    await handler(req, res);

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://primary.viator.test/partner/products/163873P16",
      expect.objectContaining({
        headers: expect.objectContaining({
          "exp-api-key": "k",
          Accept: "application/json;version=2.0",
        }),
      })
    );
    expect(res.statusCode).toBe(200);
    expect((res.body as any).source).toBe("live-api");
  });

  it("falls back to the bundled specimen when upstream is not ok", async () => {
    process.env.VIATOR_API_KEY = "server-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      headers: new Headers({ "content-type": "application/json" }),
      text: async () => "upstream error",
    } as Response);

    const req = { method: "GET", query: { productCode: "163873P16" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any).source).toBe("bundled-fallback");
    expect((res.body as any).diagnostics).toEqual(
      expect.objectContaining({
        source: "bundled-fallback",
        hasViatorApiKey: true,
        attemptedLiveFetch: true,
        upstreamStatus: 502,
        upstreamOk: false,
        usedBundledFallbackBecause: "upstream-not-ok",
      })
    );
    expect((res.body as any).extracted.priceAmount).toBe(105.09);
  });

  it("returns normalized non-json errors for non-bundled products", async () => {
    process.env.VIATOR_API_KEY = "server-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "text/html" }),
      text: async () => "<html>not-json</html>",
    } as Response);

    const req = { method: "GET", query: { productCode: "999999P001" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(502);
    expect((res.body as any).source).toBe("live-api");
    expect((res.body as any).error).toBe(
      "Viator API returned non-JSON payload"
    );
    expect((res.body as any).details).toContain("not-json");
  });

  it("falls back to bundled specimen when live price extraction fails", async () => {
    process.env.VIATOR_API_KEY = "server-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () =>
        JSON.stringify({
          product: {
            productCode: "163873P16",
            title: "East Zion Top of the World Jeep Tour",
            media: {
              images: [
                {
                  isCover: true,
                  variants: {
                    FULL: {
                      url: "https://dynamic-media.tacdn.com/media/photo-o/specimen-cover.jpg",
                    },
                  },
                },
              ],
            },
            reviews: { combinedAverageRating: 4.9, totalReviews: 101 },
          },
        }),
    } as Response);

    const req = { method: "GET", query: { productCode: "163873P16" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any).source).toBe("bundled-fallback");
    expect((res.body as any).diagnostics).toEqual(
      expect.objectContaining({
        source: "bundled-fallback",
        usedBundledFallbackBecause: "live-price-missing-or-zero",
        upstreamStatus: 200,
        upstreamOk: true,
        heroImageFieldPath: "product.media.images[0].variants.FULL.url",
        heroVariantFieldPath: "product.media.images[0].variants.FULL",
        imageSourceUsed: "live-product-image",
      })
    );
    expect((res.body as any).extracted.priceAmount).toBe(105.09);
    expect((res.body as any).extracted.heroImageUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/specimen-cover.jpg"
    );
  });

  it("returns the normalized live envelope with exact Engine5-style field winners", async () => {
    process.env.VIATOR_API_KEY = "k";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () =>
        JSON.stringify({
          product: {
            productCode: "163873P16",
            title: "East Zion Top of the World Jeep Tour",
            description: {
              text: "<p>Grab bird’s-eye views of Zion National Park on this Jeep tour.</p>",
            },
            highlights: [
              "Easy meetup at at Zion Ponderosa Ranch Resort",
              "See Zion National Park and its environs from above",
            ],
            additionalInfo: [
              "Confirmation will be received at time of booking",
              "Not wheelchair accessible",
            ],
            itineraryItems: [
              {
                title: "Zion National Park",
                description: "Admission Ticket Free",
                duration: "30 minutes",
              },
            ],
            qAndA: {
              items: [{ q: "What should I bring?", a: "Bring water." }],
            },
            priceFrom: "$105.09",
            pricing: { summary: { fromPrice: 999 } },
            images: [
              {
                isCover: true,
                variants: [
                  {
                    url: "https://img.test/specimen-root-hero-small.jpg",
                    width: 360,
                    height: 240,
                  },
                  {
                    url: "https://img.test/specimen-root-hero-large.jpg",
                    width: 674,
                    height: 446,
                  },
                ],
              },
            ],
            media: {
              images: [
                {
                  isCover: true,
                  variants: {
                    XXLARGE: {
                      url: "https://img.test/specimen-media-hero-xxlarge.jpg",
                      width: 1600,
                      height: 1067,
                    },
                  },
                },
              ],
            },
            reviews: { combinedAverageRating: 5, totalReviews: 154 },
            logistics: {
              start: { description: "Meet us at Zion Mountain Ranch!" },
            },
            location: { city: "Springdale", state: "Utah" },
          },
        }),
    } as Response);

    const req = { method: "GET", query: { productCode: "163873P16" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any).source).toBe("live-api");
    expect((res.body as any).rawProductCode).toBe("163873P16");
    expect((res.body as any).extracted.heroImageUrl).toBe(
      "https://img.test/specimen-media-hero-xxlarge.jpg"
    );
    expect((res.body as any).extracted.priceAmount).toBe(105.09);
    expect((res.body as any).extracted.aggregateRating).toBe(5);
    expect((res.body as any).extracted.reviewCount).toBe(154);
    expect((res.body as any).extracted.itinerary).toHaveLength(1);
    expect((res.body as any).extracted.faqs).toHaveLength(2);
    expect((res.body as any).diagnostics.heroImageFieldPath).toBe(
      "product.media.images[0].variants.XXLARGE.url"
    );
    expect((res.body as any).diagnostics.heroVariantFieldPath).toBe(
      "product.media.images[0].variants.XXLARGE"
    );
    expect((res.body as any).diagnostics.commercialPriceFieldPath).toBe(
      "product.priceFrom"
    );
    expect((res.body as any).diagnostics.ratingFieldPath).toBe(
      "product.reviews.combinedAverageRating"
    );
    expect((res.body as any).diagnostics.reviewCountFieldPath).toBe(
      "product.reviews.totalReviews"
    );
    expect((res.body as any).diagnostics.itineraryFieldPath).toBe(
      "product.itineraryItems"
    );
    expect((res.body as any).diagnostics.overviewFieldPath).toBe(
      "product.description.text"
    );
    expect((res.body as any).diagnostics.highlightsFieldPath).toBe(
      "product.highlights"
    );
    expect((res.body as any).diagnostics.faqFieldPath).toBe(
      "merged:product.qAndA.items+product.additionalInfo"
    );
    expect((res.body as any).diagnostics.requirementsFieldPath).toBe(
      "product.additionalInfo"
    );
  });

  it("returns valid JSON when upstream rating fields are missing or invalid", async () => {
    process.env.VIATOR_API_KEY = "server-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () =>
        JSON.stringify({
          product: {
            productCode: "777777P7",
            title: "Ratingless Tour",
            description: { text: "Tour without a usable rating." },
            reviews: {
              combinedAverageRating: "not-a-number",
              totalReviews: 12,
            },
            priceFrom: "$49.00",
          },
        }),
    } as Response);

    const req = { method: "GET", query: { productCode: "777777P7" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(() => JSON.stringify(res.body)).not.toThrow();
    expect((res.body as any).extracted.aggregateRating).toBeNull();
    expect((res.body as any).extracted.reviewCount).toBe(12);
  });

  it("still returns a JSON error envelope when extraction throws unexpectedly", async () => {
    process.env.VIATOR_API_KEY = "server-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () =>
        JSON.stringify({
          product: {
            productCode: "888888P8",
            title: "Exploding Tour",
          },
        }),
    } as Response);

    vi.spyOn(viatorExtractors, "extractEngine6Product").mockImplementation(
      () => {
        throw new Error("forced extraction failure");
      }
    );

    const req = { method: "GET", query: { productCode: "888888P8" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(() => JSON.stringify(res.body)).not.toThrow();
    expect((res.body as any).extracted).toBeDefined();
    expect((res.body as any).extracted.aggregateRating).toBeNull();
  });
});
