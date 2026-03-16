import { describe, expect, it } from "vitest";

import {
  ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE,
  ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE_9640P2,
  hasViatorNonZeroPrice,
  mapEngine5ProductPayloadToEngine4ApiTour,
  resolve421920P2BridgeApiTour,
} from "./engine5Bridge421920P2";
import { engine4ViatorApiFallbackByProductCode, engine4ViatorTours } from "../data/viatorTours";
import { mapViatorToEngine4Tour } from "./mapViatorToEngine4Tour";

describe("engine5 bridge strict products", () => {
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

    expect(mapped?.productCode).toBe(ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE);
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
          itinerary: { itineraryItems: [{ name: "Launch", summary: "Safety", durationText: "20 min" }] },
        },
      },
    });

    expect(mapped?.fromPrice).toBe("166");
    expect(mapped?.rating).toBe(4.9);
    expect(mapped?.reviewCount).toBe(250);
    const diagnostics = mapped?.rawProductPayload?._engine5BridgeDiagnostics as
      | {
          commercialPriceFieldPath?: string;
          ratingFieldPath?: string;
          reviewCountFieldPath?: string;
          itineraryFieldPath?: string;
        }
      | undefined;
    expect(diagnostics?.commercialPriceFieldPath).toBe("product.bookingOptions[0].price.amount");
    expect(diagnostics?.ratingFieldPath).toBe("product.reviews.combinedAverageRating");
    expect(diagnostics?.reviewCountFieldPath).toBe("product.reviews.totalReviews");
    expect(diagnostics?.itineraryFieldPath).toBe("product.itinerary.itineraryItems");
  });

  it("supports strict live-first behavior for 9640P2", () => {
    const cached =
      engine4ViatorApiFallbackByProductCode[
        ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE_9640P2
      ];

    const runtime = {
      ...cached,
      fromPrice: "$355.00",
      title: "Live Antelope Canyon and Horseshoe Bend Day Tour",
    };

    const resolved = resolve421920P2BridgeApiTour({
      productCode: ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE_9640P2,
      runtimeApiTour: runtime,
      runtimeSource: "live-api",
      cachedFallbackApiTour: cached,
    });

    expect(resolved.runtimeSource).toBe("live-api");
    expect(resolved.apiTour?.title).toContain("Live Antelope");
  });


  it("maps 9640P2 hero/rating/reviews from live payload before fallback", () => {
    const mapped = mapEngine5ProductPayloadToEngine4ApiTour({
      productCode: ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE_9640P2,
      payload: {
        product: {
          title: "Antelope Canyon and Horseshoe Bend Day Tour",
          productUrl:
            "https://www.viator.com/tours/Flagstaff/Antelope-Canyon-and-Horseshoe-Bend-Day-Tour/d21450-9640P2",
          priceFrom: "$299.00",
          media: {
            images: [
              {
                variants: {
                  FULL: {
                    url: "https://dynamic-media.tacdn.com/media/photo-o/live/antelope-full.jpg?w=1100&h=800&s=1",
                  },
                  LARGE: {
                    url: "https://dynamic-media.tacdn.com/media/photo-o/live/antelope-large.jpg?w=800&h=600&s=1",
                  },
                },
              },
            ],
          },
          reviewSummary: {
            averageRating: "4.9",
            totalReviews: "2,710",
          },
        },
      },
    });

    expect(mapped?.productCode).toBe("9640P2");
    expect(mapped?.fromPrice).toBe("$299.00");
    expect(mapped?.exactProductImages?.[0]?.variants?.[0]?.url).toContain(
      "/live/antelope-full.jpg"
    );
    expect(mapped?.rating).toBe(4.9);
    expect(mapped?.reviewCount).toBe(2710);
  });

  it("uses fallback hero only when live media is absent", () => {
    const mapped = mapEngine5ProductPayloadToEngine4ApiTour({
      productCode: ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE_9640P2,
      payload: {
        product: {
          title: "Antelope Canyon and Horseshoe Bend Day Tour",
          productUrl:
            "https://www.viator.com/tours/Flagstaff/Antelope-Canyon-and-Horseshoe-Bend-Day-Tour/d21450-9640P2",
          priceFrom: "$299.00",
          reviewCount: 2700,
          rating: 4.9,
        },
      },
    });

    expect(mapped?.exactProductImages).toEqual([]);
  });


  it("uses live normalized 9640P2 media/rating/reviews as final winning source", () => {
    const record = engine4ViatorTours.find(tour => tour.productCode === "9640P2");
    const mappedLive = mapEngine5ProductPayloadToEngine4ApiTour({
      productCode: ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE_9640P2,
      payload: {
        product: {
          title: "Antelope Canyon and Horseshoe Bend Day Tour",
          productUrl:
            "https://www.viator.com/tours/Flagstaff/Antelope-Canyon-and-Horseshoe-Bend-Day-Tour/d21450-9640P2",
          priceFrom: "$299.00",
          media: {
            images: [
              {
                variants: {
                  FULL: {
                    url: "https://dynamic-media.tacdn.com/media/photo-o/wrong/living-room.jpg?w=1100&h=800&s=1",
                    width: 1100,
                    height: 800,
                  },
                },
              },
              {
                isCover: true,
                variants: {
                  FULL: {
                    url: "https://dynamic-media.tacdn.com/media/photo-o/right/antelope-canyon.jpg?w=1100&h=800&s=1",
                    width: 1100,
                    height: 800,
                  },
                },
              },
            ],
          },
          reviewSummary: {
            averageRating: 4.95,
            totalReviews: 3141,
          },
        },
      },
    });

    const vm = mapViatorToEngine4Tour({
      record: record!,
      apiTour: mappedLive,
    });

    expect(vm.heroImage).toContain("/right/antelope-canyon.jpg");
    expect(vm.facts.ratingValue).toBe(4.95);
    expect(vm.facts.reviewCount).toBe(3141);
  });

});
