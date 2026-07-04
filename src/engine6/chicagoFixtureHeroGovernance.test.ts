import { describe, expect, it } from "vitest";

import {
  resolveEngine6AuthoritativeHeroCandidates,
  selectEngine6AuthoritativeProductHero,
} from "./engine6ExactProductFixtureGovernance";

describe("Chicago fixture hero governance", () => {
  it("requires hero URLs to originate from live product media images", () => {
    const heroUrl =
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/8d/68/f9.jpg";
    const payload = {
      product: {
        productCode: "3332DAY",
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
      productCode: "3332DAY",
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
      productCode: "3332DAY",
      rawPayload: {
        product: {
          productCode: "3332DAY",
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
});
