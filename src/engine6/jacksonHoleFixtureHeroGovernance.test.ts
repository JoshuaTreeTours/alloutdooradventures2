import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  resolveEngine6AuthoritativeHeroCandidates,
  selectEngine6AuthoritativeProductHero,
} from "./engine6ExactProductFixtureGovernance";
import { JACKSON_HOLE_VIATOR_PUBLIC_PRODUCT_CODES } from "./jacksonHoleViatorPublicRatings";
import { validateEngine6MerchantFeedImageUrl } from "./merchantFeedImageGovernance";

const readJacksonHoleFixtureHeroUrl = (productCode: string) => {
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

describe("Jackson Hole fixture hero governance", () => {
  it("requires hero URLs to originate from live product media images", () => {
    const heroUrl =
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/20/01/01/01.jpg";
    const payload = {
      product: {
        productCode: "6029YOFWILD",
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
      productCode: "6029YOFWILD",
      rawPayload: payload,
    });

    expect(candidates.candidates).toContain(heroUrl);
    expect(selection.ok).toBe(true);
    if (selection.ok) {
      expect(selection.heroUrl).toBe(heroUrl);
      expect(selection.heroSourceFieldPath).toMatch(/^product\.media\.images/);
    }
  });

  it("reports products with no authoritative hero instead of writing placeholders", () => {
    const selection = selectEngine6AuthoritativeProductHero({
      productCode: "6029YOFWILD",
      rawPayload: {
        product: {
          productCode: "6029YOFWILD",
          media: {
            images: [],
          },
        },
      },
    });

    expect(selection.ok).toBe(false);
    if (!selection.ok) {
      expect(selection.message).toContain("product.media.images");
    }
  });

  it.each(JACKSON_HOLE_VIATOR_PUBLIC_PRODUCT_CODES)(
    "keeps %s fixture hero URL displayable and reachable",
    async productCode => {
      const heroUrl = readJacksonHoleFixtureHeroUrl(productCode);
      const result = await validateEngine6MerchantFeedImageUrl(heroUrl);

      expect(result, `${productCode} hero ${heroUrl}`).toMatchObject({
        valid: true,
      });
    },
    60_000
  );
});
