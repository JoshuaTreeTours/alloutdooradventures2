import { describe, expect, it } from "vitest";

import {
  ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODES,
  ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE,
  ENGINE5_CLEAN_SPECIMEN_PRODUCT_CODE,
  hasViatorNonZeroPrice,
  mapEngine5ProductPayloadToEngine4ApiTour,
  resolve421920P2BridgeApiTour,
} from "./engine5Bridge421920P2";
import { engine4ViatorApiFallbackByProductCode } from "../data/viatorTours";

describe("engine5 bridge for 421920P2", () => {
  it("marks 6896MOABCPARK as strict Engine5 bridge product", () => {
    expect(
      ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODES.has(
        ENGINE5_CLEAN_SPECIMEN_PRODUCT_CODE
      )
    ).toBe(true);
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
          media: {
            images: [
              { isCover: true, variants: { FULL: { url: "https://dynamic-media.tacdn.com/media/photo-o/zipline-cover.jpg" } } },
            ],
          },
        },
      },
    });

    expect(mapped?.fromPrice).toBe("166");
    expect(mapped?.rating).toBe(4.9);
    expect(mapped?.reviewCount).toBe(250);
    expect(mapped?.primaryImageUrl).toBe("https://dynamic-media.tacdn.com/media/photo-o/zipline-cover.jpg");
    const diagnostics = mapped?.rawProductPayload?._engine5BridgeDiagnostics as
      | {
          commercialPriceFieldPath?: string;
          titleFieldPath?: string;
          sourceUrlFieldPath?: string;
          ratingFieldPath?: string;
          reviewCountFieldPath?: string;
          itineraryFieldPath?: string;
          heroImageFieldPath?: string;
        }
      | undefined;
    expect(diagnostics?.commercialPriceFieldPath).toBe("product.bookingOptions[0].price.amount");
    expect(diagnostics?.ratingFieldPath).toBe("product.reviews.combinedAverageRating");
    expect(diagnostics?.reviewCountFieldPath).toBe("product.reviews.totalReviews");
    expect(diagnostics?.itineraryFieldPath).toBe("product.itinerary.itineraryItems");
    expect(diagnostics?.heroImageFieldPath).toBe("product.media.images[0].variants.FULL.url");
  });

  it("captures canonical 6896MOABCPARK source paths from Engine5 payload", () => {
    const mapped = mapEngine5ProductPayloadToEngine4ApiTour({
      productCode: ENGINE5_CLEAN_SPECIMEN_PRODUCT_CODE,
      payload: {
        product: {
          title: "Canyonlands National Park Half-Day Tour from Moab",
          productUrl:
            "https://www.viator.com/tours/Moab/Canyonlands-National-Park-Half-Day-Tour-from-Moab/d5600-6896MOABCPARK",
          pricing: { summary: { fromPrice: 189 } },
          reviews: { combinedAverageRating: 4.8, totalReviews: 512 },
          meetingAndPickup: {
            meetingPoint: {
              name: "Moab Tourism Center",
              address: "606 S Main St",
              city: "Moab",
              state: "UT",
              country: "USA",
            },
          },
          media: {
            images: [
              {
                isCover: true,
                variants: {
                  FULL: {
                    url: "https://dynamic-media.tacdn.com/media/photo-o/moab-cover.jpg",
                  },
                },
              },
            ],
          },
          itinerary: {
            itineraryItems: [
              { name: "Island in the Sky", summary: "Mesa viewpoints" },
            ],
          },
        },
      },
    });

    expect(mapped?.title).toBe("Canyonlands National Park Half-Day Tour from Moab");
    expect(mapped?.fromPrice).toBe("189");
    expect(mapped?.rating).toBe(4.8);
    expect(mapped?.reviewCount).toBe(512);
    expect(mapped?.meetingPoint).toBe(
      "Moab Tourism Center, 606 S Main St, Moab, UT, USA"
    );
    expect(mapped?.primaryImageUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/moab-cover.jpg"
    );

    const diagnostics = mapped?.rawProductPayload?._engine5BridgeDiagnostics as
      | {
          commercialPriceFieldPath?: string;
          ratingFieldPath?: string;
          reviewCountFieldPath?: string;
          meetingPointFieldPath?: string;
          heroImageFieldPath?: string;
          itineraryFieldPath?: string;
        }
      | undefined;

    expect(diagnostics?.titleFieldPath).toBe("product.title");
    expect(diagnostics?.sourceUrlFieldPath).toBe("product.productUrl");
    expect(diagnostics?.commercialPriceFieldPath).toBe(
      "product.pricing.summary.fromPrice"
    );
    expect(diagnostics?.ratingFieldPath).toBe(
      "product.reviews.combinedAverageRating"
    );
    expect(diagnostics?.reviewCountFieldPath).toBe(
      "product.reviews.totalReviews"
    );
    expect(diagnostics?.meetingPointFieldPath).toBe(
      "product.meetingAndPickup.meetingPoint"
    );
    expect(diagnostics?.heroImageFieldPath).toBe(
      "product.media.images[0].variants.FULL.url"
    );
    expect(diagnostics?.itineraryFieldPath).toBe(
      "product.itinerary.itineraryItems"
    );
  });

  it("resolves 6896MOABCPARK price from bookingOptions fallback path", () => {
    const mapped = mapEngine5ProductPayloadToEngine4ApiTour({
      productCode: ENGINE5_CLEAN_SPECIMEN_PRODUCT_CODE,
      payload: {
        product: {
          title: "Canyonlands National Park Half-Day Tour from Moab",
          productUrl:
            "https://www.viator.com/tours/Moab/Canyonlands-National-Park-Half-Day-Tour-from-Moab/d5600-6896MOABCPARK",
          bookingOptions: [{ price: { amount: 0 } }, { price: 189 }],
        },
      },
    });

    expect(mapped?.fromPrice).toBe("189");

    const diagnostics = mapped?.rawProductPayload?._engine5BridgeDiagnostics as
      | { commercialPriceFieldPath?: string }
      | undefined;
    expect(diagnostics?.commercialPriceFieldPath).toBe(
      "product.bookingOptions[1].price"
    );

    const resolved = resolve421920P2BridgeApiTour({
      productCode: ENGINE5_CLEAN_SPECIMEN_PRODUCT_CODE,
      runtimeApiTour: mapped,
      runtimeSource: "live-api",
      cachedFallbackApiTour: undefined,
    });

    expect(resolved.runtimeSource).toBe("live-api");
    expect(resolved.apiTour?.fromPrice).toBe("189");
  });

});
