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
  EDINBURGH_VIATOR_PUBLIC_RATINGS,
  EDINBURGH_VIATOR_PUBLIC_PRODUCT_CODES,
} from "./edinburghViatorPublicRatings";
import { ENGINE6_EDINBURGH_CANONICAL_CITY_HERO_URL } from "./displayHero";
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

const edinburghListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "united-kingdom" &&
    tour.destination.citySlug === "edinburgh" &&
    EDINBURGH_VIATOR_PUBLIC_PRODUCT_CODES.includes(
      tour.productCode
    )
);

const edinburghResolvedTours = engine6ResolvedTours.filter(
  tour =>
    tour.canonicalPath.includes("/united-kingdom/edinburgh/") &&
    EDINBURGH_VIATOR_PUBLIC_PRODUCT_CODES.includes(
      tour.productCode
    )
);

const DESTINATION_BLEED_PATTERN =
  /Yellowstone|Yosemite|Zion National Park|Glacier National Park|Grand Canyon National Park|Great Smoky Mountains|Canyonlands|Acadia National Park|Bryce Canyon|Arches National Park|Sedona|Chicago|Boston|\bLondon\b|\bParis\b|\bRome\b|\bVenice\b|Washington, D\.C\.|Washington D\.C\./i;

describe("Edinburgh Engine6 rating/review parity", () => {
  const merchantFeedRows = readMerchantFeedRows();

  it.each(EDINBURGH_VIATOR_PUBLIC_PRODUCT_CODES)(
    "keeps %s aligned across registry, listing, detail, schema, and merchant feed",
    productCode => {
      const expected =
        EDINBURGH_VIATOR_PUBLIC_RATINGS[productCode];
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );

      expect(tour).toBeDefined();
      expect(tour?.aggregateRating).toBe(expected.rating);
      expect(tour?.reviewCount).toBe(expected.reviewCount);

      const listingEntry = getToursByCityUnified(
        "united-kingdom",
        "edinburgh"
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

  it("lists exactly the selected Engine6 cards for the Edinburgh cohort", () => {
    const edinburghListing = getToursByCityUnified("united-kingdom", "edinburgh");
    expect(edinburghListing).toHaveLength(EDINBURGH_VIATOR_PUBLIC_PRODUCT_CODES.length);
    expect(
      edinburghListing.every(entry => entry.tour.engine === "engine6")
    ).toBe(true);
    expect(edinburghListing.map(entry => entry.tour.productCode).sort()).toEqual(
      [...EDINBURGH_VIATOR_PUBLIC_PRODUCT_CODES].sort()
    );
  });

  it("does not change non-Edinburgh merchant feed rows", () => {
    expect(merchantFeedRows.get("8647P594")).toEqual({
      averageRating: "4.9",
      ratingCount: "95",
      reviewCount: "95",
    });
  });

  it("keeps Edinburgh listing and governed descriptions free of unrelated destination bleed", () => {
    EDINBURGH_VIATOR_PUBLIC_PRODUCT_CODES.forEach(
      productCode => {
        const tour = engine6ResolvedTours.find(
          entry => entry.productCode === productCode
        );
        const listingEntry = getToursByCityUnified(
          "united-kingdom",
          "edinburgh"
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
        expect(governedDescription, productCode).toMatch(/\bEdinburgh\b/i);
        expect(cardDescription, productCode).toMatch(/\bEdinburgh\b/i);
        expect(listingEntry!.tour.shortDescription, productCode).toMatch(
          /\bEdinburgh\b/i
        );
      }
    );
  });

  it("keeps Edinburgh public itinerary titles clean on rendered detail pages", () => {
    const malformedTitlePattern =
      /^(?:This|These|That|It|They|inspiration point for photos)$/i;

    EDINBURGH_VIATOR_PUBLIC_PRODUCT_CODES.forEach(
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

describe("Edinburgh Engine6 hero diversity", () => {
  it("uses unique listing heroes with at most one canonical city fallback", () => {
    const listingEntries = getToursByCityUnified(
      "united-kingdom",
      "edinburgh"
    ).filter(
      entry =>
        entry.tour.engine === "engine6" &&
        EDINBURGH_VIATOR_PUBLIC_PRODUCT_CODES.includes(
          entry.tour.productCode
        )
    );
    expect(listingEntries.length).toBe(
      EDINBURGH_VIATOR_PUBLIC_PRODUCT_CODES.length
    );
    const heroes = listingEntries.map(entry => entry.tour.heroImage);
    const unique = new Set(heroes);
    expect(unique.size).toBe(heroes.length);

    const canonicalUses = heroes.filter(
      url => url === ENGINE6_EDINBURGH_CANONICAL_CITY_HERO_URL
    ).length;
    expect(canonicalUses).toBeLessThanOrEqual(1);
  });
});

describe("Edinburgh Engine6 itinerary title governance", () => {
  it("audits all Edinburgh listing products", () => {
    expect(edinburghListingTours).toHaveLength(
      EDINBURGH_VIATOR_PUBLIC_PRODUCT_CODES.length
    );
    expect(edinburghResolvedTours).toHaveLength(
      EDINBURGH_VIATOR_PUBLIC_PRODUCT_CODES.length
    );
    expect(edinburghResolvedTours.map(tour => tour.productCode).sort()).toEqual(
      [...EDINBURGH_VIATOR_PUBLIC_PRODUCT_CODES].sort()
    );
  });

  it.each(EDINBURGH_VIATOR_PUBLIC_PRODUCT_CODES)(
    "uses verified POI titles for resolved tour %s",
    productCode => {
      const tour = edinburghResolvedTours.find(
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
