import { describe, expect, it } from "vitest";

import {
  diagnoseEngine6ViatorProductCommercialExtract,
  passesMerchantFeedLiveCommercialGuard,
} from "./resolveEngine6ViatorProductCommercialExtract";

const TARGET_CODES = ["191303P1", "5559561P1", "44152P18", "5396BOEING"];

const hasViatorApiKey = Boolean(
  process.env.VIATOR_API_KEY ||
    process.env.ENGINE6_VIATOR_API_KEY ||
    process.env.VIATOR_PARTNER_API_KEY
);

describe.skipIf(!hasViatorApiKey)(
  "merchant feed commercial resolver live guard",
  () => {
    it.each(TARGET_CODES)(
      "resolves %s as live-api when Viator API key is configured",
      async productCode => {
        const diagnostic =
          await diagnoseEngine6ViatorProductCommercialExtract(productCode);
        const guard = passesMerchantFeedLiveCommercialGuard(diagnostic);

        expect(guard.pass, `${productCode}: ${guard.reason ?? "ok"}`).toBe(
          true
        );
        expect(diagnostic.commercial.source).toBe("live-api");
        expect(diagnostic.failureReason).toBe("live-api-success");
        expect(typeof diagnostic.commercial.priceAmount).toBe("number");
      },
      120_000
    );
  }
);
