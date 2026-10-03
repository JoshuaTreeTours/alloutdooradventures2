import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  getFareHarborBostonLegacyProducts,
  getFareHarborEvergladesCityLegacyProducts,
  getFareHarborFortLauderdaleLegacyProducts,
  getFareHarborGoodlandLegacyProducts,
  getFareHarborHomesteadLegacyProducts,
  getFareHarborKeyWestLegacyProducts,
  getFareHarborMiamiBeachLegacyProducts,
  getFareHarborMiamiLegacyProducts,
  getFareHarborNaplesLegacyProducts,
  getFareHarborOrlandoLegacyProducts,
  getFareHarborProofProducts,
  getFareHarborSarasotaLegacyProducts,
  getFareHarborStPetersburgLegacyProducts,
  getFareHarborStockIslandLegacyProducts,
  getFareHarborTampaLegacyProducts,
  collectFareHarborMigratedRoutePaths,
} from "./fareharborLeadToGoldProof";

const floridaBatches = [
  getFareHarborMiamiLegacyProducts(),
  getFareHarborMiamiBeachLegacyProducts(),
  getFareHarborFortLauderdaleLegacyProducts(),
  getFareHarborKeyWestLegacyProducts(),
  getFareHarborStockIslandLegacyProducts(),
  getFareHarborOrlandoLegacyProducts(),
  getFareHarborTampaLegacyProducts(),
  getFareHarborStPetersburgLegacyProducts(),
  getFareHarborNaplesLegacyProducts(),
  getFareHarborSarasotaLegacyProducts(),
  getFareHarborEvergladesCityLegacyProducts(),
  getFareHarborHomesteadLegacyProducts(),
  getFareHarborGoodlandLegacyProducts(),
];

describe("FareHarbor Florida winter cohort", () => {
  it("publishes the priority winter markets without changing Boston", () => {
    expect(getFareHarborBostonLegacyProducts()).toHaveLength(221);
    expect(getFareHarborMiamiLegacyProducts()).toHaveLength(4);
    expect(getFareHarborMiamiBeachLegacyProducts()).toHaveLength(9);
    expect(getFareHarborFortLauderdaleLegacyProducts()).toHaveLength(0);
    expect(getFareHarborKeyWestLegacyProducts()).toHaveLength(15);
    expect(getFareHarborStockIslandLegacyProducts()).toHaveLength(9);
    expect(getFareHarborOrlandoLegacyProducts()).toHaveLength(0);
    expect(getFareHarborTampaLegacyProducts()).toHaveLength(0);
    expect(getFareHarborStPetersburgLegacyProducts()).toHaveLength(3);
    expect(getFareHarborNaplesLegacyProducts()).toHaveLength(3);
    expect(getFareHarborSarasotaLegacyProducts()).toHaveLength(1);
    expect(getFareHarborEvergladesCityLegacyProducts()).toHaveLength(1);
    expect(getFareHarborHomesteadLegacyProducts()).toHaveLength(0);
    expect(getFareHarborGoodlandLegacyProducts()).toHaveLength(18);

    const florida = floridaBatches.flat();
    expect(florida).toHaveLength(63);
    const all = getFareHarborProofProducts();
    const ids = all.map(product => product.itemId);
    expect(new Set(ids).size).toBe(ids.length);
    const routes = collectFareHarborMigratedRoutePaths();
    const sitemap = readFileSync("public/sitemap-tours.xml", "utf8");
    for (const product of florida) {
      expect(product.publicPath.startsWith("/destinations/florida/"), product.itemId).toBe(
        true
      );
      expect(product.offer, product.itemId).toBeTruthy();
      expect(product.visiblePriceLabel, product.itemId).toBeTruthy();
      expect(product.exceptionStatus, product.itemId).toBe("OK");
      expect(routes, product.itemId).toContain(product.publicPath);
      expect(sitemap, product.itemId).toContain(product.publicPath);
      const body = [...product.paragraphs, ...product.highlights, product.schemaDescription]
        .join(" ")
        .toLowerCase();
      expect(body, product.itemId).not.toContain("this is a airboat");
      expect(body, product.itemId).not.toContain("optional exploration");
      expect(body, product.itemId).not.toContain("id meeting");
      if (product.aggregateRating) {
        expect(["TripAdvisor", "Google"], product.itemId).toContain(
          product.aggregateRating.provider
        );
      }
    }
  });
});
