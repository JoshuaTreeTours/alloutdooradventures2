import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { engine6ResolvedTours } from "./registry";

const REMOVED_SUPERNATURAL_PRODUCT_CODES = [
  "129182P3",
  "61552P8",
  "5046BOS_GG",
  "7167P80",
  "66192P8",
] as const;

const UNRELATED_CONTROL_PRODUCT_CODES = [
  "18277P2",
  "343490P3",
  "3037DUCK",
] as const;

describe("Engine6 supernatural editorial governance published surface audit", () => {
  it("removes existing violating products without requiring replacements", () => {
    const publishedProductCodes = new Set(
      engine6ResolvedTours.map(tour => tour.productCode)
    );

    for (const productCode of REMOVED_SUPERNATURAL_PRODUCT_CODES) {
      expect(publishedProductCodes.has(productCode)).toBe(false);
    }

    for (const productCode of UNRELATED_CONTROL_PRODUCT_CODES) {
      expect(publishedProductCodes.has(productCode)).toBe(true);
    }
  });

  it("keeps removed products out of merchant feed and sitemap surfaces", () => {
    const merchantFeed = readFileSync("data/merchantFeed.csv", "utf8");
    const sitemap = readFileSync("public/sitemap-tours.xml", "utf8");

    for (const productCode of REMOVED_SUPERNATURAL_PRODUCT_CODES) {
      expect(merchantFeed).not.toContain(productCode);
      expect(sitemap).not.toContain(productCode);
    }

    for (const productCode of UNRELATED_CONTROL_PRODUCT_CODES) {
      expect(merchantFeed).toContain(productCode);
      expect(sitemap).toContain(productCode);
    }
  });
});
