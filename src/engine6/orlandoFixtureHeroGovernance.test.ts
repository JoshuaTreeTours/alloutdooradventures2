import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  resolveEngine6AuthoritativeHeroCandidates,
  selectEngine6AuthoritativeProductHero,
} from "./engine6ExactProductFixtureGovernance";
import { ORLANDO_VIATOR_PUBLIC_PRODUCT_CODES } from "./orlandoViatorPublicRatings";
import { validateEngine6MerchantFeedImageUrl } from "./merchantFeedImageGovernance";

const readOrlandoFixtureHeroUrl = (productCode: string) => {
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

describe("Orlando fixture hero governance", () => {
  it("requires hero URLs to originate from live product media images", () => {
    const heroUrl = readOrlandoFixtureHeroUrl("3170P78");
    const payload = {
      product: {
        productCode: "3170P78",
        media: {
          images: [
            {
              isCover: true,
              variants: {
                FULL: { url: heroUrl },
                LARGE: { url: heroUrl },
              },
            },
          ],
        },
      },
    };

    const candidates = resolveEngine6AuthoritativeHeroCandidates(payload);
    const selection = selectEngine6AuthoritativeProductHero({
      productCode: "3170P78",
      rawPayload: payload,
    });

    expect(candidates.candidates).toContain(heroUrl);
    expect(selection.ok).toBe(true);
    if (selection.ok) {
      expect(selection.heroUrl).toBe(heroUrl);
      expect(selection.heroSourceFieldPath).toMatch(/^product\.media\.images/);
    }
  });

  it.each(ORLANDO_VIATOR_PUBLIC_PRODUCT_CODES)(
    "keeps %s fixture hero URL displayable and reachable",
    async productCode => {
      const heroUrl = readOrlandoFixtureHeroUrl(productCode);
      const result = await validateEngine6MerchantFeedImageUrl(heroUrl);

      expect(result, `${productCode} hero ${heroUrl}`).toMatchObject({
        valid: true,
      });
    },
    60_000
  );
});
