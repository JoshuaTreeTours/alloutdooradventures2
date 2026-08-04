import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import TourCard from "../components/TourCard";
import { getToursByCityUnified } from "../data/tours";
import Engine6TourPage from "./components/Engine6TourPage";
import {
  buildEngine6CardDescription,
  resolveEngine6GovernedProductDescription,
} from "./governedEditorialDescriptions";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import { engine6ListingTours } from "./listing";
import {
  ASPEN_VIATOR_PUBLIC_RATINGS,
  ASPEN_VIATOR_PUBLIC_PRODUCT_CODES,
} from "./aspenViatorPublicRatings";
import { engine6ResolvedTours } from "./registry";

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

const aspenListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "colorado" &&
    tour.destination.citySlug === "aspen" &&
    ASPEN_VIATOR_PUBLIC_PRODUCT_CODES.includes(tour.productCode)
);

const aspenResolvedTours = engine6ResolvedTours.filter(
  tour =>
    tour.canonicalPath.includes("/colorado/aspen/") &&
    ASPEN_VIATOR_PUBLIC_PRODUCT_CODES.includes(tour.productCode)
);

// John Denver Sanctuary is an Aspen POI; do not treat "Denver" alone as bleed for this cohort.
const DESTINATION_BLEED_PATTERN =
  /\b(?:Chicago|Illinois|Boston|Massachusetts|Philadelphia|Pennsylvania|Miami Beach|Miami|New York|Washington, D\.C\.|Washington D\.C\.|Sedona|Monterey|Napa|Jackson Hole|Wyoming|Yellowstone|Grand Teton|Zion|Yosemite|Glacier National Park|\bGlacier\b|Moab|Bryce|Arches|Canyonlands|Key West|Orlando|Naples|Fort Lauderdale|Maui|Road to Hana|Haleakala|Molokini|Honolulu|Oahu|Pearl Harbor|Waikiki|Kauai|Waimea Canyon|Na Pali|Great Smoky|Grand Canyon|Hawaii Volcanoes|Kona|Hualalai|Kohala)\b/i;

describe("Aspen Engine6 rating/review parity", () => {
  const merchantFeedRows = readMerchantFeedRows();

  it.each(ASPEN_VIATOR_PUBLIC_PRODUCT_CODES)(
    "keeps %s aligned across registry, listing, detail, schema, and merchant feed",
    productCode => {
      const expected = ASPEN_VIATOR_PUBLIC_RATINGS[productCode];
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );

      expect(tour).toBeDefined();
      expect(tour?.aggregateRating).toBe(expected.rating);
      expect(tour?.reviewCount).toBe(expected.reviewCount);

      const listingEntry = getToursByCityUnified("colorado", "aspen").find(
        entry => entry.tour.productCode === productCode
      );
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

  it("lists exactly six Engine6 cards for the Aspen cohort on the Aspen city index", () => {
    const engine6AspenTours = getToursByCityUnified("colorado", "aspen").filter(
      entry =>
        entry.tour.engine === "engine6" &&
        ASPEN_VIATOR_PUBLIC_PRODUCT_CODES.includes(entry.tour.productCode)
    );
    expect(engine6AspenTours).toHaveLength(6);
  });

  it("does not change non-Aspen merchant feed rows", () => {
    expect(merchantFeedRows.get("8647P594")).toEqual({
      averageRating: "4.9",
      ratingCount: "95",
      reviewCount: "95",
    });
  });

  it("keeps Aspen listing and governed descriptions free of unrelated destination bleed", () => {
    ASPEN_VIATOR_PUBLIC_PRODUCT_CODES.forEach(productCode => {
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );
      const listingEntry = getToursByCityUnified("colorado", "aspen").find(
        entry => entry.tour.productCode === productCode
      );

      expect(tour).toBeDefined();
      expect(listingEntry).toBeDefined();

      const cardDescription = buildEngine6CardDescription(tour!);
      const governedDescription = resolveEngine6GovernedProductDescription(tour!);

      expect(cardDescription, productCode).not.toMatch(DESTINATION_BLEED_PATTERN);
      expect(governedDescription, productCode).not.toMatch(
        DESTINATION_BLEED_PATTERN
      );
      expect(listingEntry!.tour.shortDescription, productCode).not.toMatch(
        DESTINATION_BLEED_PATTERN
      );
      expect(governedDescription, productCode).toMatch(/\bAspen\b/i);
      expect(cardDescription, productCode).toMatch(/\bAspen\b/i);
      expect(listingEntry!.tour.shortDescription, productCode).toMatch(
        /\bAspen\b/i
      );
    });
  });

  it("keeps Aspen public itinerary titles clean on rendered detail pages", () => {
    const malformedTitlePattern =
      /^(?:This|These|That|It|They|inspiration point for photos)$/i;

    ASPEN_VIATOR_PUBLIC_PRODUCT_CODES.forEach(productCode => {
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
    });
  });
});

describe("Aspen Engine6 itinerary title governance", () => {
  it("audits all 6 Aspen listing products", () => {
    expect(aspenListingTours).toHaveLength(6);
    expect(aspenResolvedTours).toHaveLength(6);
    expect(aspenResolvedTours.map(tour => tour.productCode).sort()).toEqual(
      [...ASPEN_VIATOR_PUBLIC_PRODUCT_CODES].sort()
    );
  });

  it.each(ASPEN_VIATOR_PUBLIC_PRODUCT_CODES)(
    "uses verified POI titles for resolved tour %s",
    productCode => {
      const tour = aspenResolvedTours.find(
        entry => entry.productCode === productCode
      );
      expect(tour).toBeDefined();
      expect(tour!.itinerary.length).toBeGreaterThan(0);
      tour!.itinerary.forEach(item => {
        expect(item.title.trim().length).toBeGreaterThan(2);
        expect(item.title).not.toMatch(/^(?:This|These|That|It|They)\b/i);
      });
    }
  );
});
