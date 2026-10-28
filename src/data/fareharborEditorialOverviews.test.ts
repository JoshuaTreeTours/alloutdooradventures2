import { describe, expect, it } from "vitest";
import { getFareHarborProofProducts } from "./fareharborLeadToGoldProof";
import {
  fareHarborEditorialOverviews,
  fareHarborEditorialHighlights,
  getFareHarborEditorialHighlights,
  getFareHarborEditorialOverview,
  getFareHarborEditorialSchemaDescription,
} from "./fareharborEditorialOverviews";
import { applyFareHarborProofToHtml } from "./fareharborLeadToGoldProof";
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

  it("renders verified highlights independently from full overview rewrites", () => {
    for (const [id, highlights] of Object.entries(fareHarborEditorialHighlights)) {
      const proof = getFareHarborProofProducts().find(product => product.itemId === id);
      expect(proof, `missing source product: ${id}`).toBeDefined();
      if (!fareHarborEditorialOverviews[id]) {
        expect(wordCount(proof!.paragraphs.join(" ")), `insufficient source for ${id}`).toBeGreaterThanOrEqual(100);
      }
      expect(highlights.length, id).toBeGreaterThanOrEqual(2);
      expect(highlights.length, id).toBeLessThanOrEqual(3);
      expect(highlights.join(" "), id).not.toMatch(/^(food\s*&\s*beverages|guided outing)$/i);
      const rendered = getProofBackedFareHarborTourByCanonicalPath(proof!.publicPath);
      expect(rendered?.highlights).toEqual(highlights);
      expect(getFareHarborEditorialHighlights(id, proof!.highlights)).toEqual(highlights);
    }
  });

  it("keeps mixed FareHarbor tours in their own activity categories", () => {
    const whale = getProofBackedFareHarborTourByCanonicalPath(
      "/destinations/california/san-diego/tours/whale-watching-34415"
    );
    const sailing = getProofBackedFareHarborTourByCanonicalPath(
      "/destinations/california/san-diego/tours/private-sailing-lessons-516845"
    );
    const cycling = getProofBackedFareHarborTourByCanonicalPath(
      "/destinations/california/san-diego/tours/private-san-diego-electric-bike-tour-439314"
    );
    expect(whale?.primaryCategory).toBe("wildlife");
    expect(sailing?.primaryCategory).toBe("sailing");
    expect(cycling?.primaryCategory).toBe("cycling");
    for (const tour of [whale, sailing]) {
      expect(tour?.categories).not.toContain("cycling");
    }
    expect(whale?.overviewText).toContain("138-foot sailing yacht");
    expect(whale?.highlights).toContain("Water, soda, chips, and granola bars included");
    expect(whale?.bookingUrl).toMatch(/^https:\/\//);
  });

  it("keeps the edited San Diego yacht overview and final SEO schema aligned", () => {
    const proof = getFareHarborProofProducts().find(product => product.itemId === "34415")!;
    const summary = getFareHarborEditorialSchemaDescription(proof.itemId, proof.schemaDescription);
    expect(summary).toContain("138-foot sailing yacht");
    expect(summary).not.toContain("Whale-watching trip of about");
    const html = `<html><head><meta name="description" content="Old description" /><script type="application/ld+json">{"@graph":[{"@type":"Product","description":"Old description","offers":{"@type":"Offer","price":"129.00"}}]}</script></head></html>`;
    const updated = applyFareHarborProofToHtml(html, proof);
    expect(updated).toContain(`content="${summary}"`);
    expect(updated).toContain(`"description":"${summary}"`);
    expect(updated).toContain(`"price":"${proof.offer?.price}"`);
    expect(applyFareHarborProofToHtml(updated, proof)).toBe(updated);
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
