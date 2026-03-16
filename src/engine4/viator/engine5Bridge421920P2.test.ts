import { describe, expect, it } from "vitest";

import {
  ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE,
  hasViatorNonZeroPrice,
  mapEngine5ProductPayloadToEngine4ApiTour,
  resolve421920P2BridgeApiTour,
} from "./engine5Bridge421920P2";
import { engine4ViatorApiFallbackByProductCode } from "../data/viatorTours";

describe("engine5 bridge for 421920P2", () => {
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
});
