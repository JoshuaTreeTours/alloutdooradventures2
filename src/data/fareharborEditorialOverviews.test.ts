import { describe, expect, it } from "vitest";
import { getFareHarborProofProducts } from "./fareharborLeadToGoldProof";
import {
  fareHarborEditorialOverviews,
  getFareHarborEditorialOverview,
} from "./fareharborEditorialOverviews";
import { getProofBackedFareHarborTourByCanonicalPath } from "../engine6/legacyFh/registry";

const wordCount = (text: string) =>
  text.match(/\b[\w]+(?:['’-][\w]+)*\b/g)?.length ?? 0;

describe("Lead-to-Gold authored editorial overviews", () => {
  it("keeps all authored overviews in the 100-150 word band", () => {
    const active = getFareHarborProofProducts();
    expect(active.length).toBeGreaterThan(400);
    for (const [id, overview] of Object.entries(fareHarborEditorialOverviews)) {
      const proof = active.find(product => product.itemId === id);
      expect(proof, `missing source product: ${id}`).toBeDefined();
      expect(wordCount(overview), id).toBeGreaterThanOrEqual(100);
      expect(wordCount(overview), id).toBeLessThanOrEqual(150);
      expect(overview, id).not.toMatch(/the operator lists|the stops exist|the guest comes|book now/i);
      expect(overview, id).not.toMatch(/riders need to be \d+|\d+\s*(?:to|-)\s*\d+ pounds/i);
      const rendered = getProofBackedFareHarborTourByCanonicalPath(proof!.publicPath);
      expect(rendered?.overviewText).toBe(overview);
    }
  });

  it("moves San Diego e-bike restrictions out of the narrative", () => {
    const tour = getProofBackedFareHarborTourByCanonicalPath(
      "/destinations/california/san-diego/tours/private-san-diego-electric-bike-tour-439314"
    );
    expect(tour?.overviewText).toContain("Gaslamp Quarter");
    expect(tour?.overviewText).toContain("Balboa Park");
    expect(tour?.overviewText).not.toMatch(/100 to 260 pounds|riders need to be 16/i);
    expect(tour?.requirements.join(" ")).toContain("Age and rider-size requirements apply");
  });

  it("keeps unresearched product descriptions grounded instead of fabricating copy", () => {
    const insufficient = getFareHarborProofProducts().filter(
      product => product.exceptionStatus === "INSUFFICIENT_SOURCE_CONTENT"
    );
    expect(insufficient.length).toBeGreaterThan(0);
    for (const product of insufficient) {
      if (fareHarborEditorialOverviews[product.itemId]) continue;
      const original = product.paragraphs.join("\n\n") || product.schemaDescription;
      expect(getFareHarborEditorialOverview(product.itemId, original)).toBe(original);
    }
  });

  it("reports catalog-wide editorial gaps for prioritizing verified rewrites", () => {
    const active = getFareHarborProofProducts();
    const pending = active.filter(
      product => !fareHarborEditorialOverviews[product.itemId]
    );
    const short = pending.filter(
      product => wordCount(product.paragraphs.join(" ")) < 100
    );
    const long = pending.filter(
      product => wordCount(product.paragraphs.join(" ")) > 150
    );
    const weak = pending.filter(
      product => product.exceptionStatus === "INSUFFICIENT_SOURCE_CONTENT"
    );
    console.log(
      `[FH editorial audit] ${active.length} active; ${active.length - pending.length} individually rewritten; ${short.length} under 100 words; ${long.length} over 150; ${weak.length} explicitly insufficient source`
    );
    expect(pending.length + Object.keys(fareHarborEditorialOverviews).length)
      .toBe(active.length);
  });
});
