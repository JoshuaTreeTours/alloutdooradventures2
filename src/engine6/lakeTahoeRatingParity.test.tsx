import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import TourCard from "../components/TourCard";
import { getToursByCityUnified } from "../data/tours";
import Engine6TourPage from "./components/Engine6TourPage";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import {
  LAKE_TAHOE_VIATOR_PUBLIC_RATINGS,
  LAKE_TAHOE_VIATOR_PUBLIC_PRODUCT_CODES,
} from "./lakeTahoeViatorPublicRatings";
import { engine6ResolvedTours } from "./registry";
import { ENGINE6_LAKE_TAHOE_EMERALD_BAY_SCENIC_CRUISE_PRODUCT_CODE } from "./routes";
import { getEngine6ItineraryTitleOverride } from "../../api/engine6/itineraryTitleOverrides";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const readMerchantFeedRows = () => {
  const lines = readFileSync("data/merchantFeed.csv", "utf8")
    .split(/\r?\n/)
    .filter(Boolean);

  return new Map(
    lines.slice(1).map(line => {
      const id = line.split(",")[0];
      const match = line.match(
        /,Outdoor Adventures,([\d.]+),(\d+),(\d+)$/
      );

      return [
        id,
        match
          ? {
              averageRating: match[1],
              ratingCount: match[2],
              reviewCount: match[3],
            }
          : null,
      ] as const;
    })
  );
};

describe("Lake Tahoe Engine6 rating/review parity", () => {
  const merchantFeedRows = readMerchantFeedRows();

  it.each(LAKE_TAHOE_VIATOR_PUBLIC_PRODUCT_CODES)(
    "keeps %s aligned across registry, listing, detail, schema, and merchant feed",
    productCode => {
      const expected = LAKE_TAHOE_VIATOR_PUBLIC_RATINGS[productCode];
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );

      expect(tour).toBeDefined();
      expect(tour?.aggregateRating).toBe(expected.rating);
      expect(tour?.reviewCount).toBe(expected.reviewCount);

      const listingEntry = getToursByCityUnified(
        "california",
        "lake-tahoe"
      ).find(entry => entry.tour.productCode === productCode);
      expect(listingEntry).toBeDefined();
      expect(listingEntry?.tour.badges.rating).toBe(expected.rating);
      expect(listingEntry?.tour.badges.reviewCount).toBe(expected.reviewCount);

      const cardHtml = renderToString(
        <TourCard tour={listingEntry!.tour} href={listingEntry!.href} />
      );
      const normalizedCardHtml = cardHtml.replace(/<!-- -->/g, "");
      expect(normalizedCardHtml).toContain(`(${expected.reviewCount} reviews)`);
      expect(normalizedCardHtml).toContain(`★ ${expected.rating.toFixed(1)}`);

      const detailHtml = renderToString(<Engine6TourPage tour={tour!} />);
      const normalizedDetailHtml = detailHtml.replace(/<!-- -->/g, "");
      expect(normalizedDetailHtml).toContain(
        `${expected.rating.toFixed(1)} rating • ${expected.reviewCount} reviews`
      );

      const graph = buildEngine6SchemaGraph(tour!)["@graph"] as Array<
        Record<string, unknown>
      >;
      const aggregateRating = graph.find(
        node => node["@type"] === "AggregateRating"
      );
      expect(aggregateRating?.ratingValue).toBe(expected.rating);
      expect(aggregateRating?.reviewCount).toBe(expected.reviewCount);

      const merchantRow = merchantFeedRows.get(productCode);
      expect(merchantRow).not.toBeNull();
      expect(merchantRow?.averageRating).toBe(expected.rating.toFixed(1));
      expect(merchantRow?.ratingCount).toBe(String(expected.reviewCount));
      expect(merchantRow?.reviewCount).toBe(String(expected.reviewCount));
    }
  );

  it("matches the reported Emerald Bay Scenic Cruise Viator public values", () => {
    expect(
      LAKE_TAHOE_VIATOR_PUBLIC_RATINGS[
        ENGINE6_LAKE_TAHOE_EMERALD_BAY_SCENIC_CRUISE_PRODUCT_CODE
      ]
    ).toEqual({ rating: 4.5, reviewCount: 729 });
  });

  it("lists exactly nine Engine6 cards on the Lake Tahoe city index", () => {
    const engine6LakeTahoeTours = getToursByCityUnified(
      "california",
      "lake-tahoe"
    ).filter(entry => entry.tour.engine === "engine6");
    expect(engine6LakeTahoeTours).toHaveLength(9);
  });

  it("does not change non-Lake Tahoe merchant feed rows", () => {
    expect(merchantFeedRows.get("8647P594")).toEqual({
      averageRating: "4.9",
      ratingCount: "95",
      reviewCount: "95",
    });
    expect(merchantFeedRows.size).toBe(198);
  });

  it("keeps Lake Tahoe public itinerary titles clean on rendered detail pages", () => {
    const malformedTitlePattern =
      /^(?:This|These|That|It|They|inspiration point for photos)$/i;

    LAKE_TAHOE_VIATOR_PUBLIC_PRODUCT_CODES.forEach(productCode => {
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );

      expect(tour).toBeDefined();
      tour!.itinerary.forEach(item => {
        expect(item.title).not.toMatch(malformedTitlePattern);
        expect(item.title).not.toMatch(/\bfor photos$/i);
      });

      const detailHtml = renderToString(<Engine6TourPage tour={tour!} />);
      expect(detailHtml).toContain('data-testid="engine6-itinerary-timeline"');
      expect(detailHtml).not.toMatch(/<h3[^>]*>\s*This\s*<\/h3>/i);
      expect(detailHtml).not.toContain("inspiration point for photos");
    });
  });

  it("repairs the observed 6508TAHOE live itinerary title fragments only by product and row", () => {
    expect(
      getEngine6ItineraryTitleOverride({
        productCode: "6508TAHOE",
        rowIndex: 6,
        currentTitle: "inspiration point for photos",
      })
    ).toBe("Emerald Bay State Park");
    expect(
      getEngine6ItineraryTitleOverride({
        productCode: "6508TAHOE",
        rowIndex: 7,
        currentTitle: "This",
      })
    ).toBe("Tahoe City");
    expect(
      getEngine6ItineraryTitleOverride({
        productCode: "2535P4",
        rowIndex: 7,
        currentTitle: "This",
      })
    ).toBeNull();
  });
});
