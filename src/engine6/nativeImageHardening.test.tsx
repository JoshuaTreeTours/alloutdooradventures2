import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import { toEngine6Card, buildEngine6CardSurfaces } from "./cards";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import type { Engine6ApiResponse } from "./types";

const toPayload = (rawPayload: Record<string, unknown>, productCode = "NATIVE1"): Engine6ApiResponse => {
  const extraction = extractEngine6Product(rawPayload);
  return {
    source: "live-api",
    rawProductCode: productCode,
    rawProduct: extraction.product,
    diagnostics: {
      source: "live-api",
      hasViatorApiKey: false,
      attemptedLiveFetch: false,
      upstreamStatus: null,
      upstreamContentType: "application/json",
      upstreamOk: null,
      usedBundledFallbackBecause: "test-fixture",
      ...extraction.diagnostics,
      bookingUrlSource: extraction.diagnostics.productUrlFieldPath ?? "generated:viator-search-product-code",
      fieldLevelFallbackUsed: false,
      fallbackFieldNames: [],
    },
    extracted: extraction.extracted,
  };
};

describe("engine6 native canonical image hardening", () => {
  it("enforces one canonical trusted Viator image across hero, cards, related cards, and schema", () => {
    const tour = mapViatorToEngine6Tour(
      toPayload({
        product: {
          productCode: "PARITY1",
          productUrl: "https://www.viator.com/tours/City/Tour/d100-PARITY1",
          title: "Canonical Parity Tour",
          description: { text: "A parity specimen tour." },
          location: { city: "Austin", state: "Texas" },
          priceFrom: "$149.00",
          media: {
            images: [
              {
                isCover: true,
                variants: {
                  FULL: {
                    url: "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/bb/cc/dd.jpg",
                    width: 674,
                    height: 446,
                  },
                },
              },
            ],
          },
        },
      }, "PARITY1")
    );

    const card = toEngine6Card(tour);
    const surfaces = buildEngine6CardSurfaces(tour);
    const schema = buildEngine6SchemaGraph(tour);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const product = graph.find(node => node["@type"] === "Product") as
      | Record<string, unknown>
      | undefined;

    expect(tour.heroImageUrl).toBe(tour.resolvedImageUrl);
    expect(card.imageUrl).toBe(tour.heroImageUrl);
    expect(surfaces.search[0]?.imageUrl).toBe(tour.heroImageUrl);
    expect(surfaces.city[0]?.imageUrl).toBe(tour.heroImageUrl);
    expect(product?.image).toBe(tour.heroImageUrl);
  });

  it("rejects non-trusted and unrelated hosts and fails closed without placeholders", () => {
    const tour = mapViatorToEngine6Tour(
      toPayload({
        product: {
          productCode: "FAILCLOSED1",
          productUrl: "https://www.viator.com/tours/City/Tour/d100-FAILCLOSED1",
          title: "Fail Closed Tour",
          description: { text: "A fail-closed specimen tour." },
          location: { city: "Boston", state: "Massachusetts" },
          priceFrom: "$89.00",
          media: {
            images: [
              {
                isCover: true,
                variants: {
                  FULL: {
                    url: "https://cdn.example.com/untrusted.jpg",
                    width: 1200,
                    height: 800,
                  },
                },
              },
            ],
          },
        },
      }, "FAILCLOSED1")
    );

    const card = toEngine6Card(tour);
    const schema = buildEngine6SchemaGraph(tour);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const product = graph.find(node => node["@type"] === "Product") as
      | Record<string, unknown>
      | undefined;

    expect(tour.heroImageUrl).toBeNull();
    expect(tour.resolvedImageUrl).toBeNull();
    expect(card.imageUrl).toBe("");
    expect(product?.image).toBeUndefined();
    expect(tour.diagnostics.heroSourceType).toBe("none");
  });

  it("regression: ignores previously wrong gallery image and uses the canonical Viator media hero", () => {
    const tour = mapViatorToEngine6Tour(
      toPayload({
        product: {
          productCode: "REGRESSION1",
          productUrl: "https://www.viator.com/tours/City/Tour/d100-REGRESSION1",
          title: "Regression Specimen Tour",
          description: { text: "A regression specimen for image drift." },
          location: { city: "Seattle", state: "Washington" },
          imageUrl: "https://cdn.example.com/wrong-related-tour.jpg",
          media: {
            images: [
              {
                isCover: true,
                variants: {
                  FULL: {
                    url: "https://dynamic-media.tacdn.com/media/photo-o/12/34/56/78.jpg",
                    width: 1200,
                    height: 800,
                  },
                },
              },
            ],
          },
        },
      }, "REGRESSION1")
    );

    const card = toEngine6Card(tour);
    expect(tour.heroImageUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/12/34/56/78.jpg"
    );
    expect(tour.heroImageUrl).not.toBe("https://cdn.example.com/wrong-related-tour.jpg");
    expect(card.imageUrl).toBe(tour.heroImageUrl);
  });
});
