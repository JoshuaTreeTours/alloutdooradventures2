import { describe, expect, it } from "vitest";
import { getTourBySlugs } from "../../data/tours";
import { fetchFareHarborHtml } from "../fh/fetchFareHarborHtml";
import { parseFareHarborHtml } from "../fh/parseFareHarborHtml";
import { resolveFareHarborUrlFromBookPage } from "../fh/resolveFareHarborUrlFromBookPage";
import { buildHikeClimbTemplateModel } from "./buildHikeClimbTemplateModel";

describe("buildHikeClimbTemplateModel", () => {
  it("builds authoritative model fields from booking data", () => {
    const tour = getTourBySlugs("california", "joshua-tree", "hike-and-climb-459591");
    expect(tour).toBeTruthy();

    const canonicalPath = "/destinations/california/joshua-tree/tours/hike-and-climb-459591";
    const fareHarborUrl = resolveFareHarborUrlFromBookPage(`${canonicalPath}/book`);
    const html = fareHarborUrl ? fetchFareHarborHtml(fareHarborUrl) : null;
    const parsed = html ? parseFareHarborHtml(html) : null;

    const model = buildHikeClimbTemplateModel({
      tour: tour!,
      fareHarborItem: parsed,
    });

    expect(model.priceLabel).toContain("From $");
    expect(model.highlights.length).toBeLessThanOrEqual(8);
    expect(model.itinerarySteps.length).toBeGreaterThanOrEqual(4);
    expect(model.faqs).toHaveLength(5);
    expect(model.descriptionBlocks.join(" ").includes("I ")).toBe(false);
  });
});
