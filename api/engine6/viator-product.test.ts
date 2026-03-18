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

  it("returns diagnostics-rich error when key is missing", async () => {
    const req = { method: "GET", query: { productCode: "163873P16" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect((res.body as any).diagnostics.hasViatorApiKey).toBe(false);
    expect((res.body as any).error).toContain("VIATOR_API_KEY");
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
          product: { productCode: "163873P16", title: "Tour" },
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

  it("returns the enforced 163873P16 section sources and paths", async () => {
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
                  { url: "https://img.test/specimen-root-hero-small.jpg", width: 360, height: 240 },
                  { url: "https://img.test/specimen-root-hero-large.jpg", width: 674, height: 446 },
                ],
              },
            ],
            media: {
              images: [
                {
                  isCover: true,
                  variants: { XXLARGE: { url: "https://img.test/wrong-media.jpg" } },
                },
              ],
            },
          },
        }),
    } as Response);

    const req = { method: "GET", query: { productCode: "163873P16" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any).rawProductCode).toBe("163873P16");
    expect((res.body as any).extracted.heroImageUrl).toBe(
      "https://img.test/specimen-root-hero-large.jpg"
    );
    expect((res.body as any).extracted.priceAmount).toBe(105.09);
    expect((res.body as any).extracted.highlights).not.toContain(
      "Not wheelchair accessible"
    );
    expect((res.body as any).extracted.requirements).toContain(
      "Not wheelchair accessible"
    );
    expect((res.body as any).diagnostics.heroImageFieldPath).toBe(
      "product.images[0].variants[1].url"
    );
    expect((res.body as any).diagnostics.heroVariantFieldPath).toBe(
      "product.images[0].variants[1]"
    );
    expect((res.body as any).diagnostics.selectedHeroWidth).toBe(674);
    expect((res.body as any).diagnostics.selectedHeroHeight).toBe(446);
    expect((res.body as any).diagnostics.imageSourceUsed).toBe(
      "live-product-image"
    );
    expect((res.body as any).diagnostics.commercialPriceFieldPath).toBe(
      "product.priceFrom"
    );
    expect((res.body as any).diagnostics.commercialPriceRawValue).toBe(
      "$105.09"
    );
    expect((res.body as any).diagnostics.priceSourceUsed).toBe("live-price");
    expect((res.body as any).diagnostics.overviewFieldPath).toBe(
      "product.description.text"
    );
    expect((res.body as any).diagnostics.highlightsFieldPath).toBe(
      "product.highlights"
    );
    expect((res.body as any).diagnostics.highlightClassificationReason).toContain(
      "product.highlights kept as selling-point bullets"
    );
    expect((res.body as any).diagnostics.itineraryFieldPath).toBe(
      "product.itineraryItems"
    );
    expect((res.body as any).diagnostics.itineraryItemCount).toBe(1);
    expect((res.body as any).diagnostics.itinerarySourceUsed).toBe(
      "product.itineraryItems"
    );
    expect((res.body as any).diagnostics.faqsFieldPath).toBe(
      "product.qAndA.items"
    );
    expect((res.body as any).diagnostics.faqFieldPath).toBe(
      "product.qAndA.items"
    );
    expect((res.body as any).diagnostics.faqCount).toBe(1);
    expect((res.body as any).diagnostics.faqSourceUsed).toBe(
      "product.qAndA.items"
    );
    expect((res.body as any).diagnostics.requirementsFieldPath).toBe(
      "product.additionalInfo"
    );
  });
});
