import { describe, expect, it } from "vitest";

import {
  ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE,
  hasViatorNonZeroPrice,
  isEngine4StrictEngine5BridgeProductCode,
  mapEngine5ProductPayloadToEngine4ApiTour,
  resolve421920P2BridgeApiTour,
} from "./engine5Bridge421920P2";
import { engine4ViatorApiFallbackByProductCode } from "../data/viatorTours";

describe("engine5 bridge for 421920P2", () => {
  it("marks 421920P2 and 163873P4 as strict engine5 bridge products", () => {
    expect(isEngine4StrictEngine5BridgeProductCode("421920P2")).toBe(true);
    expect(isEngine4StrictEngine5BridgeProductCode("163873P4")).toBe(true);
    expect(isEngine4StrictEngine5BridgeProductCode("36001P1")).toBe(false);
  });

  it("prefers live payload for 421920P2 when available", () => {
    const cached =
      engine4ViatorApiFallbackByProductCode[
        ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE
      ];

    const runtime = {
      ...cached,
      fromPrice: "$155.00",
      title: "Live runtime title",
    };

    const resolved = resolve421920P2BridgeApiTour({
      productCode: ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE,
      runtimeApiTour: runtime,
      runtimeSource: "live-api",
      cachedFallbackApiTour: cached,
    });

    expect(resolved.runtimeSource).toBe("live-api");
    expect(resolved.apiTour?.title).toBe("Live runtime title");
  });

  it("falls back safely when live payload fails or has invalid price", () => {
    const cached =
      engine4ViatorApiFallbackByProductCode[
        ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE
      ];

    const resolved = resolve421920P2BridgeApiTour({
      productCode: ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE,
      runtimeApiTour: {
        ...cached,
        fromPrice: "$0",
      },
      runtimeSource: "live-api",
      cachedFallbackApiTour: cached,
    });

    expect(resolved.runtimeSource).toBe("cached-engine4-fallback");
    expect(resolved.apiTour?.fromPrice).toBe(cached.fromPrice);
  });

  it("prefers live payload for 163873P4 when available", () => {
    const cached = engine4ViatorApiFallbackByProductCode["163873P4"];

    const runtime = {
      ...cached,
      fromPrice: "$189.00",
      title: "Live HALF-DAY CANYONEERING TOUR",
    };

    const resolved = resolve421920P2BridgeApiTour({
      productCode: "163873P4",
      runtimeApiTour: runtime,
      runtimeSource: "live-api",
      cachedFallbackApiTour: cached,
    });

    expect(resolved.runtimeSource).toBe("live-api");
    expect(resolved.apiTour?.title).toBe("Live HALF-DAY CANYONEERING TOUR");
  });

  it("falls back safely for 163873P4 when runtime price is zero", () => {
    const cached = engine4ViatorApiFallbackByProductCode["163873P4"];

    const resolved = resolve421920P2BridgeApiTour({
      productCode: "163873P4",
      runtimeApiTour: {
        ...cached,
        fromPrice: "$0",
      },
      runtimeSource: "live-api",
      cachedFallbackApiTour: cached,
    });

    expect(resolved.runtimeSource).toBe("cached-engine4-fallback");
    expect(resolved.apiTour?.fromPrice).toBe(cached.fromPrice);
  });

  it("never treats zero as valid price", () => {
    expect(hasViatorNonZeroPrice("$0")).toBe(false);
    expect(hasViatorNonZeroPrice("0.00")).toBe(false);
    expect(hasViatorNonZeroPrice("$139.00")).toBe(true);
  });

  it("keeps non-421920P2 behavior unchanged", () => {
    const cached = engine4ViatorApiFallbackByProductCode["36001P1"];
    const resolved = resolve421920P2BridgeApiTour({
      productCode: "36001P1",
      runtimeApiTour: { ...cached, fromPrice: "$999.00" },
      runtimeSource: "live-api",
      cachedFallbackApiTour: cached,
    });

    expect(resolved.runtimeSource).toBe("cached-engine4-fallback");
    expect(resolved.apiTour).toBe(cached);
  });

  it("maps engine5 payload into engine4 api tour shape", () => {
    const mapped = mapEngine5ProductPayloadToEngine4ApiTour({
      productCode: ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE,
      payload: {
        product: {
          title: "Epic Zipline Tour Over The Santa Ynez Valley",
          productUrl:
            "https://www.viator.com/tours/Santa-Barbara/Epic-Zipline-Tour-Over-The-Santa-Ynez-Valley/d4372-421920P2",
          priceFrom: "$139.00",
          currencyCode: "USD",
        },
      },
    });

    expect(mapped?.productCode).toBe(
      ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE
    );
    expect(mapped?.fromPrice).toBe("$139.00");
  });

  it("maps nested commercial pricing field into fromPrice so live source can win", () => {
    const mapped = mapEngine5ProductPayloadToEngine4ApiTour({
      productCode: ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE,
      payload: {
        product: {
          title: "Epic Zipline Tour Over The Santa Ynez Valley",
          productUrl:
            "https://www.viator.com/tours/Santa-Barbara/Epic-Zipline-Tour-Over-The-Santa-Ynez-Valley/d4372-421920P2",
          pricing: {
            summary: {
              fromPrice: 139,
            },
            currency: "USD",
          },
        },
      },
    });

    expect(mapped?.fromPrice).toBe("139");
    expect(mapped?.priceCurrency).toBe("USD");
    const diagnostics = mapped?.rawProductPayload?._engine5BridgeDiagnostics as
      | { commercialPriceFieldPath?: string }
      | undefined;
    expect(diagnostics?.commercialPriceFieldPath).toBe(
      "product.pricing.summary.fromPrice"
    );
  });
  it("uses shared extractors for 163873P4 hero/rating/review fields", () => {
    const mapped = mapEngine5ProductPayloadToEngine4ApiTour({
      productCode: "163873P4",
      payload: {
        product: {
          title: "HALF-DAY CANYONEERING TOUR",
          productUrl:
            "https://www.viator.com/tours/Utah/HALF-DAY-CANYONEERING-TOUR/d785-163873P4",
          bookingOptions: [{ price: { amount: 145 } }],
          reviews: { combinedAverageRating: 5, totalReviews: 412 },
          media: {
            images: [
              {
                isCover: true,
                variants: {
                  FULL: {
                    url: "https://dynamic-media.tacdn.com/media/photo-o/canyoneering-cover.jpg",
                  },
                },
              },
            ],
          },
        },
      },
    });

    expect(mapped?.primaryImageUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/canyoneering-cover.jpg"
    );
    expect(mapped?.rating).toBe(5);
    expect(mapped?.reviewCount).toBe(412);
    const diagnostics = mapped?.rawProductPayload?._engine5BridgeDiagnostics as
      | {
          ratingFieldPath?: string;
          reviewCountFieldPath?: string;
          heroImageFieldPath?: string;
        }
      | undefined;
    expect(diagnostics?.ratingFieldPath).toBe(
      "product.reviews.combinedAverageRating"
    );
    expect(diagnostics?.reviewCountFieldPath).toBe(
      "product.reviews.totalReviews"
    );
    expect(diagnostics?.heroImageFieldPath).toBe(
      "product.media.images[0].variants.FULL.url"
    );
  });

  it("maps bookingOptions price and shared extractor diagnostics", () => {
    const mapped = mapEngine5ProductPayloadToEngine4ApiTour({
      productCode: ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE,
      payload: {
        product: {
          title: "Epic Zipline Tour Over The Santa Ynez Valley",
          productUrl:
            "https://www.viator.com/tours/Santa-Barbara/Epic-Zipline-Tour-Over-The-Santa-Ynez-Valley/d4372-421920P2",
          bookingOptions: [{ price: { amount: 166 } }],
          reviews: { combinedAverageRating: 4.9, totalReviews: 250 },
          itinerary: {
            itineraryItems: [
              { name: "Launch", summary: "Safety", durationText: "20 min" },
            ],
          },
          media: {
            images: [
              {
                isCover: true,
                variants: {
                  FULL: {
                    url: "https://dynamic-media.tacdn.com/media/photo-o/zipline-cover.jpg",
                  },
                },
              },
            ],
          },
        },
      },
    });

    expect(mapped?.fromPrice).toBe("166");
    expect(mapped?.rating).toBe(4.9);
    expect(mapped?.reviewCount).toBe(250);
    expect(mapped?.primaryImageUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/zipline-cover.jpg"
    );
    const diagnostics = mapped?.rawProductPayload?._engine5BridgeDiagnostics as
      | {
          commercialPriceFieldPath?: string;
          ratingFieldPath?: string;
          reviewCountFieldPath?: string;
          itineraryFieldPath?: string;
          heroImageFieldPath?: string;
        }
      | undefined;
    expect(diagnostics?.commercialPriceFieldPath).toBe(
      "product.bookingOptions[0].price.amount"
    );
    expect(diagnostics?.ratingFieldPath).toBe(
      "product.reviews.combinedAverageRating"
    );
    expect(diagnostics?.reviewCountFieldPath).toBe(
      "product.reviews.totalReviews"
    );
    expect(diagnostics?.itineraryFieldPath).toBe(
      "product.itinerary.itineraryItems"
    );
    expect(diagnostics?.heroImageFieldPath).toBe(
      "product.media.images[0].variants.FULL.url"
    );
  });
});
