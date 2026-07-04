import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { CHICAGO_VIATOR_PUBLIC_PRODUCT_CODES } from "./chicagoViatorPublicRatings";
import { validateEngine6MerchantFeedImageUrl } from "./merchantFeedImageGovernance";

const readChicagoFixtureHeroUrl = (productCode: string) => {
  const payload = JSON.parse(
    readFileSync(
      `data/engine6/viator/${productCode}.exact-product.json`,
      "utf8"
    )
  ) as {
    product: {
      media: {
        images: Array<{
          variants: {
            FULL: {
              url: string;
            };
          };
        }>;
      };
    };
  };

  return payload.product.media.images[0].variants.FULL.url;
};

describe("Chicago Engine6 fixture hero governance", () => {
  it.each(CHICAGO_VIATOR_PUBLIC_PRODUCT_CODES)(
    "keeps %s fixture hero URL displayable and reachable",
    async productCode => {
      const heroUrl = readChicagoFixtureHeroUrl(productCode);
      const result = await validateEngine6MerchantFeedImageUrl(heroUrl);

      expect(result, `${productCode} hero ${heroUrl}`).toMatchObject({
        valid: true,
      });
    },
    60_000
  );
});
