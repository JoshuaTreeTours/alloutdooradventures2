import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "./viatorExtractors";
import { resolveEngine6ViatorProductCommercialExtract } from "./resolveEngine6ViatorProductCommercialExtract";

describe("resolveEngine6ViatorProductCommercialExtract", () => {
  it("reads bundled Santa Barbara trolley commercial fields when no API key is configured", async () => {
    const previousApiKey = process.env.VIATOR_API_KEY;
    const previousEngine6ApiKey = process.env.ENGINE6_VIATOR_API_KEY;
    const previousPartnerApiKey = process.env.VIATOR_PARTNER_API_KEY;

    delete process.env.VIATOR_API_KEY;
    delete process.env.ENGINE6_VIATOR_API_KEY;
    delete process.env.VIATOR_PARTNER_API_KEY;

    try {
      const commercial =
        await resolveEngine6ViatorProductCommercialExtract("163975P1");

      expect(commercial.source).toBe("bundled-fallback");
      expect(commercial.priceAmount).toBe(37);
      expect(commercial.aggregateRating).toBe(4.6);
      expect(commercial.reviewCount).toBe(853);
    } finally {
      if (previousApiKey === undefined) {
        delete process.env.VIATOR_API_KEY;
      } else {
        process.env.VIATOR_API_KEY = previousApiKey;
      }
      if (previousEngine6ApiKey === undefined) {
        delete process.env.ENGINE6_VIATOR_API_KEY;
      } else {
        process.env.ENGINE6_VIATOR_API_KEY = previousEngine6ApiKey;
      }
      if (previousPartnerApiKey === undefined) {
        delete process.env.VIATOR_PARTNER_API_KEY;
      } else {
        process.env.VIATOR_PARTNER_API_KEY = previousPartnerApiKey;
      }
    }
  });

  it("matches bundled fixture extraction for 163975P1 commercial fields", () => {
    const payloadPath = path.join(
      process.cwd(),
      "data/engine6/viator/163975P1.exact-product.json"
    );
    const payload = JSON.parse(readFileSync(payloadPath, "utf8")) as Record<
      string,
      unknown
    >;
    const extracted = extractEngine6Product(payload).extracted;

    expect(extracted.priceAmount).toBe(37);
    expect(extracted.reviewCount).toBe(853);
    expect(extracted.aggregateRating).toBe(4.6);
  });
});
