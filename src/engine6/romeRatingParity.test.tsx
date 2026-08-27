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
  ROME_VIATOR_PUBLIC_RATINGS,
  ROME_VIATOR_PUBLIC_PRODUCT_CODES,
} from "./romeViatorPublicRatings";
import { ENGINE6_ROME_CANONICAL_CITY_HERO_URL } from "./displayHero";
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

const romeListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "italy" &&
    tour.destination.citySlug === "rome" &&
    ROME_VIATOR_PUBLIC_PRODUCT_CODES.includes(
      tour.productCode
    )
);

const romeResolvedTours = engine6ResolvedTours.filter(
  tour =>
    tour.canonicalPath.includes("/italy/rome/") &&
    ROME_VIATOR_PUBLIC_PRODUCT_CODES.includes(
      tour.productCode
    )
);

const DESTINATION_BLEED_PATTERN =
  /Yellowstone|Yosemite|Zion National Park|Glacier National Park|Grand Canyon National Park|Great Smoky Mountains|Canyonlands|Acadia National Park|Bryce Canyon|Arches National Park|Sedona|Chicago|Boston|London|Paris|Washington, D\.C\.|Washington D\.C\./i;

describe("Rome Engine6 rating/review parity", () => {
  const merchantFeedRows = readMerchantFeedRows();

  it.each(ROME_VIATOR_PUBLIC_PRODUCT_CODES)(
    "keeps %s aligned across registry, listing, detail, schema, and merchant feed",
    productCode => {
      const expected =
        ROME_VIATOR_PUBLIC_RATINGS[productCode];
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );

      expect(tour).toBeDefined();
      expect(tour?.aggregateRating).toBe(expected.rating);
      expect(tour?.reviewCount).toBe(expected.reviewCount);

      const listingEntry = getToursByCityUnified(
        "italy",
        "rome"
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

  it("lists exactly the selected Engine6 cards for the Rome cohort", () => {
    const romeListing = getToursByCityUnified("italy", "rome");
    expect(romeListing).toHaveLength(ROME_VIATOR_PUBLIC_PRODUCT_CODES.length);
    expect(
      romeListing.every(entry => entry.tour.engine === "engine6")
    ).toBe(true);
    expect(romeListing.map(entry => entry.tour.productCode).sort()).toEqual(
      [...ROME_VIATOR_PUBLIC_PRODUCT_CODES].sort()
    );
  });

  it("does not change non-Rome merchant feed rows", () => {
    expect(merchantFeedRows.get("8647P594")).toEqual({
      averageRating: "4.9",
      ratingCount: "95",
      reviewCount: "95",
    });
  });

  it("keeps Rome listing and governed descriptions free of unrelated destination bleed", () => {
    ROME_VIATOR_PUBLIC_PRODUCT_CODES.forEach(
      productCode => {
        const tour = engine6ResolvedTours.find(
          entry => entry.productCode === productCode
        );
        const listingEntry = getToursByCityUnified(
          "italy",
          "rome"
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
        expect(governedDescription, productCode).toMatch(/\bRome\b/i);
        expect(cardDescription, productCode).toMatch(/\bRome\b/i);
        expect(listingEntry!.tour.shortDescription, productCode).toMatch(
          /\bRome\b/i
        );
      }
    );
  });

  it("keeps Rome public itinerary titles clean on rendered detail pages", () => {
    const malformedTitlePattern =
      /^(?:This|These|That|It|They|inspiration point for photos)$/i;

    ROME_VIATOR_PUBLIC_PRODUCT_CODES.forEach(
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

describe("Rome Engine6 hero diversity", () => {
  it("uses unique listing heroes with at most one canonical city fallback", () => {
    const listingEntries = getToursByCityUnified(
      "italy",
      "rome"
    ).filter(
      entry =>
        entry.tour.engine === "engine6" &&
        ROME_VIATOR_PUBLIC_PRODUCT_CODES.includes(
          entry.tour.productCode
        )
    );
    expect(listingEntries.length).toBe(
      ROME_VIATOR_PUBLIC_PRODUCT_CODES.length
    );
    const heroes = listingEntries.map(entry => entry.tour.heroImage);
    const unique = new Set(heroes);
    expect(unique.size).toBe(heroes.length);

    const canonicalUses = heroes.filter(
      url => url === ENGINE6_ROME_CANONICAL_CITY_HERO_URL
    ).length;
    expect(canonicalUses).toBeLessThanOrEqual(1);
  });
});

describe("Rome Engine6 itinerary title governance", () => {
  it("audits all Rome listing products", () => {
    expect(romeListingTours).toHaveLength(
      ROME_VIATOR_PUBLIC_PRODUCT_CODES.length
    );
    expect(romeResolvedTours).toHaveLength(
      ROME_VIATOR_PUBLIC_PRODUCT_CODES.length
    );
    expect(romeResolvedTours.map(tour => tour.productCode).sort()).toEqual(
      [...ROME_VIATOR_PUBLIC_PRODUCT_CODES].sort()
    );
  });

  it.each(ROME_VIATOR_PUBLIC_PRODUCT_CODES)(
    "uses verified POI titles for resolved tour %s",
    productCode => {
      const tour = romeResolvedTours.find(
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
