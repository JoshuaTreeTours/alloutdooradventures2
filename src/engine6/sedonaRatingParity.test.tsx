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
import { ENGINE6_SEDONA_CANONICAL_CITY_HERO_URL } from "./displayHero";
import { engine6ListingTours } from "./listing";
import {
  SEDONA_VIATOR_PUBLIC_RATINGS,
  SEDONA_VIATOR_PUBLIC_PRODUCT_CODES,
} from "./sedonaViatorPublicRatings";
import { engine6ResolvedTours } from "./registry";
import { ENGINE6_SEDONA_162351P6_PRODUCT_CODE } from "./routes";

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

const sedonaListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "arizona" &&
    tour.destination.citySlug === "sedona"
);

const sedonaResolvedTours = engine6ResolvedTours.filter(tour =>
  tour.canonicalPath.includes("/arizona/sedona/")
);

const SEDONA_SUMMARY_ONLY_ITINERARY_PRODUCT_CODES = new Set([
  "321860P2",
  "320003P1",
  "32242P1",
]);

const DESTINATION_BLEED_PATTERN =
  /Yellowstone|Yosemite|Zion National Park|Glacier National Park|Grand Canyon National Park|Great Smoky Mountains/i;

describe("Sedona Engine6 rating/review parity", () => {
  const merchantFeedRows = readMerchantFeedRows();

  it.each(SEDONA_VIATOR_PUBLIC_PRODUCT_CODES)(
    "keeps %s aligned across registry, listing, detail, schema, and merchant feed",
    productCode => {
      const expected = SEDONA_VIATOR_PUBLIC_RATINGS[productCode];
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );

      expect(tour).toBeDefined();
      expect(tour?.aggregateRating).toBe(expected.rating);
      expect(tour?.reviewCount).toBe(expected.reviewCount);

      const listingEntry = getToursByCityUnified("arizona", "sedona").find(
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

  it("matches the reported stargazing Viator public values", () => {
    expect(
      SEDONA_VIATOR_PUBLIC_RATINGS[ENGINE6_SEDONA_162351P6_PRODUCT_CODE]
    ).toEqual({ rating: 4.3, reviewCount: 955 });
  });

  it("lists exactly twenty-two Engine6 cards on the Sedona city index", () => {
    const engine6SedonaTours = getToursByCityUnified("arizona", "sedona").filter(
      entry => entry.tour.engine === "engine6"
    );
    expect(engine6SedonaTours).toHaveLength(22);
  });

  it("keeps Sedona listing and governed descriptions free of unrelated destination bleed", () => {
    SEDONA_VIATOR_PUBLIC_PRODUCT_CODES.forEach(productCode => {
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );
      const listingEntry = getToursByCityUnified("arizona", "sedona").find(
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
      expect(governedDescription, productCode).toMatch(/Sedona/i);
      expect(listingEntry!.tour.shortDescription, productCode).toMatch(/Sedona/i);
    });
  });

  it("keeps Sedona public itinerary titles clean on rendered detail pages", () => {
    const malformedTitlePattern =
      /^(?:This|These|That|It|They|inspiration point for photos)$/i;

    SEDONA_VIATOR_PUBLIC_PRODUCT_CODES.forEach(productCode => {
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );

      expect(tour).toBeDefined();

      if (SEDONA_SUMMARY_ONLY_ITINERARY_PRODUCT_CODES.has(productCode)) {
        expect(tour!.itinerary).toHaveLength(0);
        expect(tour!.itinerarySummaryText?.trim().length ?? 0).toBeGreaterThan(
          0
        );

        const detailHtml = renderToString(<Engine6TourPage tour={tour!} />);
        expect(detailHtml).toContain(
          'data-testid="engine6-itinerary-summary-only"'
        );
        expect(detailHtml).not.toContain(
          'data-testid="engine6-itinerary-timeline"'
        );
        return;
      }

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

describe("Sedona Engine6 itinerary title governance", () => {
  it("audits all 22 Sedona listing products", () => {
    expect(sedonaListingTours).toHaveLength(22);
    expect(sedonaResolvedTours).toHaveLength(22);
    expect(
      sedonaResolvedTours.map(tour => tour.productCode).sort()
    ).toEqual([...SEDONA_VIATOR_PUBLIC_PRODUCT_CODES].sort());
  });

  it.each(SEDONA_VIATOR_PUBLIC_PRODUCT_CODES)(
    "uses verified POI titles for resolved tour %s",
    productCode => {
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );
      expect(tour, `missing resolved tour for ${productCode}`).toBeDefined();

      if (SEDONA_SUMMARY_ONLY_ITINERARY_PRODUCT_CODES.has(productCode)) {
        expect(tour!.itinerary).toHaveLength(0);
        expect(tour!.itinerarySummaryText?.trim().length ?? 0).toBeGreaterThan(
          0
        );
        return;
      }

      const titles = tour!.itinerary.map(item => item.title);
      expect(titles.length).toBeGreaterThan(0);
      titles.forEach(title => {
        expect(title.trim().length).toBeGreaterThan(2);
        expect(title).not.toMatch(/^(This|These|That|It|They)$/i);
      });
    }
  );
});

describe("Sedona Engine6 hero diversity governance", () => {
  it("uses unique listing-card heroes across all 22 Sedona products", () => {
    expect(sedonaListingTours).toHaveLength(22);

    const heroCounts = sedonaListingTours.reduce<Map<string, number>>(
      (counts, tour) => {
        counts.set(tour.heroImage, (counts.get(tour.heroImage) ?? 0) + 1);
        return counts;
      },
      new Map()
    );

    expect(
      heroCounts.get(ENGINE6_SEDONA_CANONICAL_CITY_HERO_URL) ?? 0
    ).toBeLessThanOrEqual(1);
    expect(heroCounts.size).toBe(sedonaListingTours.length);
  });
});
