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
  ARCHES_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS,
  ARCHES_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES,
} from "./archesNationalParkViatorPublicRatings";
import { ENGINE6_ARCHES_CANONICAL_CITY_HERO_URL } from "./displayHero";
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

const archesListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "utah" &&
    tour.destination.citySlug === "arches-national-park" &&
    ARCHES_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES.includes(
      tour.productCode
    )
);

const archesResolvedTours = engine6ResolvedTours.filter(
  tour =>
    tour.canonicalPath.includes("/utah/arches-national-park/") &&
    ARCHES_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES.includes(
      tour.productCode
    )
);

const DESTINATION_BLEED_PATTERN =
  /\b(?:Chicago|Illinois|Boston|Massachusetts|Philadelphia|Pennsylvania|Miami Beach|Miami|New York|Washington, D\.C\.|Washington D\.C\.|Sedona|Monterey|Napa|Jackson Hole|Wyoming|Yellowstone|Grand Teton|Zion(?:\s+National\s+Park)?|Yosemite|Glacier National Park|\bGlacier\b|Bryce Canyon(?:\s+National\s+Park)?|Key West|Orlando|Naples|Fort Lauderdale|Maui|Road to Hana|Haleakala|Molokini|Honolulu|Oahu|Pearl Harbor|Waikiki|Kauai|Waimea Canyon|Na Pali|Great Smoky|Grand Canyon|Hawaii Volcanoes|Kona|Hualalai|Kohala|Aspen|Hunter Creek|Roaring Fork|Wheeler Opera House|Boulder|Denver|Flatirons|Chautauqua|Pearl Street|Front Range|Austin|Lady Bird Lake|Texas State Capitol|Houston)\b/i;

describe("Arches National Park Engine6 rating/review parity", () => {
  const merchantFeedRows = readMerchantFeedRows();

  it.each(ARCHES_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES)(
    "keeps %s aligned across registry, listing, detail, schema, and merchant feed",
    productCode => {
      const expected =
        ARCHES_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS[productCode];
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );

      expect(tour).toBeDefined();
      expect(tour?.aggregateRating).toBe(expected.rating);
      expect(tour?.reviewCount).toBe(expected.reviewCount);

      const listingEntry = getToursByCityUnified(
        "utah",
        "arches-national-park"
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

      const productNode = graph.find(node => node["@type"] === "Product");
      const touristTripNode = graph.find(
        node => node["@type"] === "TouristTrip"
      );
      expect(productNode?.image).toBe(tour!.heroImageUrl);
      expect(touristTripNode?.image).toBe(tour!.heroImageUrl);
      expect(listingEntry!.tour.heroImage).toBe(tour!.heroImageUrl);
      expect(listingEntry!.tour.resolvedImageUrl).toBe(tour!.heroImageUrl);

      const merchantRow = merchantFeedRows.get(productCode);
      expect(merchantRow).not.toBeNull();
      expect(merchantRow?.averageRating).toBe(expected.rating.toFixed(1));
      expect(merchantRow?.ratingCount).toBe(String(expected.reviewCount));
      expect(merchantRow?.reviewCount).toBe(String(expected.reviewCount));
    }
  );

  it("lists exactly the selected Engine6 cards for the Arches cohort", () => {
    const engine6ArchesTours = getToursByCityUnified(
      "utah",
      "arches-national-park"
    ).filter(
      entry =>
        entry.tour.engine === "engine6" &&
        ARCHES_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES.includes(
          entry.tour.productCode
        )
    );
    expect(engine6ArchesTours).toHaveLength(
      ARCHES_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES.length
    );
  });

  it("does not change non-Arches merchant feed rows", () => {
    expect(merchantFeedRows.get("8647P594")).toEqual({
      averageRating: "4.9",
      ratingCount: "95",
      reviewCount: "95",
    });
  });

  it("keeps Arches listing and governed descriptions free of unrelated destination bleed", () => {
    ARCHES_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES.forEach(
      productCode => {
        const tour = engine6ResolvedTours.find(
          entry => entry.productCode === productCode
        );
        const listingEntry = getToursByCityUnified(
          "utah",
          "arches-national-park"
        ).find(entry => entry.tour.productCode === productCode);

        expect(tour).toBeDefined();
        expect(listingEntry).toBeDefined();

        const cardDescription = buildEngine6CardDescription(tour!);
        const governedDescription =
          resolveEngine6GovernedProductDescription(tour!);

        expect(cardDescription, productCode).not.toMatch(
          DESTINATION_BLEED_PATTERN
        );
        expect(governedDescription, productCode).not.toMatch(
          DESTINATION_BLEED_PATTERN
        );
        expect(listingEntry!.tour.shortDescription, productCode).not.toMatch(
          DESTINATION_BLEED_PATTERN
        );
        expect(governedDescription, productCode).toMatch(/\bArches(?: National Park)?\b/i);
        expect(cardDescription, productCode).toMatch(/\bArches(?: National Park)?\b/i);
        expect(listingEntry!.tour.shortDescription, productCode).toMatch(
          /\bArches(?: National Park)?\b/i
        );
      }
    );
  });

  it("keeps Arches public itinerary titles clean on rendered detail pages", () => {
    const malformedTitlePattern =
      /^(?:This|These|That|It|They|inspiration point for photos)$/i;

    ARCHES_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES.forEach(
      productCode => {
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
      }
    );
  });
});

describe("Arches National Park Engine6 hero diversity", () => {
  it("uses unique listing heroes with at most one canonical city fallback", () => {
    const listingEntries = getToursByCityUnified(
      "utah",
      "arches-national-park"
    ).filter(
      entry =>
        entry.tour.engine === "engine6" &&
        ARCHES_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES.includes(
          entry.tour.productCode
        )
    );
    expect(listingEntries.length).toBe(
      ARCHES_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES.length
    );
    const heroes = listingEntries.map(entry => entry.tour.heroImage);
    const unique = new Set(heroes);
    expect(unique.size).toBe(heroes.length);

    const canonicalUses = heroes.filter(
      url => url === ENGINE6_ARCHES_CANONICAL_CITY_HERO_URL
    ).length;
    expect(canonicalUses).toBeLessThanOrEqual(1);
  });
});

describe("Arches National Park Engine6 itinerary title governance", () => {
  it("audits all Arches listing products", () => {
    expect(archesListingTours).toHaveLength(
      ARCHES_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES.length
    );
    expect(archesResolvedTours).toHaveLength(
      ARCHES_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES.length
    );
    expect(archesResolvedTours.map(tour => tour.productCode).sort()).toEqual(
      [...ARCHES_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES].sort()
    );
  });

  it.each(ARCHES_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES)(
    "uses verified POI titles for resolved tour %s",
    productCode => {
      const tour = archesResolvedTours.find(
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
