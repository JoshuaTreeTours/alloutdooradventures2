import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import { isEngine6ProseItineraryTitle } from "../../api/engine6/divergedItineraryTitle";
import {
  auditEngine6ItineraryGovernanceRow,
} from "./itineraryGovernanceAudit";
import { auditEngine6ItineraryTitle } from "./itineraryTitleIntegrityAudit";
import { engine6ListingTours } from "./listing";
import { engine6ResolvedTours } from "./registry";
import {
  getEngine6ItineraryMergeMode,
  mergeEngine6NativeItineraryWithLive,
  type Engine6LiveItineraryItem,
} from "./mergeEngine6LiveItinerary";

export const ENGINE6_YELLOWSTONE_PRODUCT_CODES = [
  "137381P3",
  "151830P1",
  "151830P3",
  "151830P8",
  "23667P1",
  "23667P10",
  "23667P2",
  "23667P3",
  "23667P4",
  "265766P66",
  "316119P3",
  "316119P4",
  "463268P1",
  "463268P2",
  "463268P4",
  "481298P1",
  "52661P26",
  "52661P40",
  "52661P41",
  "5584219P8",
  "5591554P17",
  "5591554P23",
  "5639875P7",
] as const;

const yellowstoneListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "wyoming" &&
    tour.destination.citySlug === "yellowstone-national-park"
);

const yellowstoneResolvedTours = engine6ResolvedTours.filter(tour =>
  tour.canonicalPath.includes("yellowstone-national-park")
);

const buildProseLiveItinerary = (
  descriptions: string[]
): Engine6LiveItineraryItem[] =>
  descriptions.map(description => ({
    title: description.split(/(?<=[.!?])\s+/)[0]?.replace(/[.!?]+$/, "").trim() ?? description,
    titleSource: "description-inferred" as const,
    description,
  }));

describe("Yellowstone Engine6 itinerary title governance", () => {
  it("audits all 23 Yellowstone listing products", () => {
    expect(yellowstoneListingTours).toHaveLength(23);
    expect(yellowstoneResolvedTours).toHaveLength(23);
    expect(
      yellowstoneResolvedTours.map(tour => tour.productCode).sort()
    ).toEqual([...ENGINE6_YELLOWSTONE_PRODUCT_CODES].sort());
  });

  it.each(ENGINE6_YELLOWSTONE_PRODUCT_CODES)(
    "uses non-prose governed titles for resolved tour %s",
    productCode => {
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );
      expect(tour, `missing resolved tour for ${productCode}`).toBeDefined();

      tour!.itinerary.forEach((item, index) => {
        const title = item.title?.trim() ?? "";
        expect(
          isEngine6ProseItineraryTitle(title),
          `${productCode}[${index}] prose title: ${title}`
        ).toBe(false);
        expect(title, `${productCode}[${index}] generic This title`).not.toMatch(
          /^this\b/i
        );
        expect(
          auditEngine6ItineraryTitle({
            title,
            description: item.description,
          }),
          `${productCode}[${index}] integrity audit`
        ).toEqual([]);
        expect(
          auditEngine6ItineraryGovernanceRow({ item, index })
            .filter(finding => finding.severity === "critical")
            .map(finding => finding.reason)
            .filter(
              reason =>
                reason !== "title-description-semantic-mismatch" &&
                reason !== "title-equals-description"
            ),
          `${productCode}[${index}] title governance audit`
        ).toEqual([]);
      });
    }
  );

  it.each(ENGINE6_YELLOWSTONE_PRODUCT_CODES)(
    "description-only Partner API extraction falls back to neutral stops for %s",
    productCode => {
      const fixturePath = path.join(
        "data/engine6/viator",
        `${productCode}.exact-product.json`
      );
      expect(fs.existsSync(fixturePath), fixturePath).toBe(true);

      const payload = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
      const descOnlyPayload = JSON.parse(JSON.stringify(payload));
      descOnlyPayload.product.itineraryItems =
        descOnlyPayload.product.itineraryItems.map(
          (row: { description?: string; duration?: string; stopType?: string }) => ({
            description: row.description,
            duration: row.duration,
            stopType: row.stopType,
          })
        );

      const extracted = extractEngine6Product(descOnlyPayload);
      extracted.extracted.itinerary.forEach((item, index) => {
        expect(item.titleSource).toBe("explicit");
        expect(item.title).toBe(`Itinerary Stop ${index + 1}`);
        expect(isEngine6ProseItineraryTitle(item.title)).toBe(false);
      });
    }
  );

  it("23667P3 diverged merge keeps native POI titles over live prose headings", () => {
    const tour = engine6ResolvedTours.find(t => t.productCode === "23667P3");
    expect(tour).toBeDefined();

    const liveItinerary = buildProseLiveItinerary([
      "Upper Geyser Basin boardwalk timed for an Old Faithful eruption.",
      "Midway Geyser Basin boardwalk at Grand Prismatic Spring.",
      "Wildlife stop in Hayden Valley meadows along the river.",
      "Rim walk to Artist Point above the Lower Falls.",
      "Photo time at Artist Point on the canyon's south rim.",
    ]);

    expect(getEngine6ItineraryMergeMode(tour!.itinerary, liveItinerary)).toBe(
      "aligned"
    );

    const merged = mergeEngine6NativeItineraryWithLive(
      tour!.itinerary,
      liveItinerary,
      { productCode: "23667P3" }
    );

    expect(merged.map(item => item.title)).toEqual([
      "Old Faithful",
      "Grand Prismatic Spring",
      "Hayden Valley",
      "Grand Canyon of the Yellowstone",
      "Artist Point",
    ]);
    expect(merged.some(item => /^this\b/i.test(item.title))).toBe(false);
    expect(merged.some(item => isEngine6ProseItineraryTitle(item.title))).toBe(
      false
    );
  });
});
