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
  ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS,
  ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES,
} from "./rockyMountainNationalParkViatorPublicRatings";
import { engine6ResolvedTours } from "./registry";
import { ENGINE6_RMNP_CANONICAL_CITY_HERO_URL } from "./displayHero";
import { ENGINE6_RMNP_366391P1_PRODUCT_CODE } from "./routes";

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

const rmnpListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "colorado" &&
    tour.destination.citySlug === "rocky-mountain-national-park" &&
    ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES.includes(
      tour.productCode
    )
);

const rmnpResolvedTours = engine6ResolvedTours.filter(
  tour =>
    tour.canonicalPath.includes("/colorado/rocky-mountain-national-park/") &&
    ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES.includes(
      tour.productCode
    )
);

const DESTINATION_BLEED_PATTERN =
  /Chicago|Illinois|Boston|Massachusetts|Philadelphia|Pennsylvania|Miami|New York|Washington, D\.C\.|Washington D\.C\.|Sedona|Monterey|Napa|Jackson Hole|Wyoming|Yellowstone|Grand Teton/i;

describe("Rocky Mountain National Park Engine6 rating/review parity", () => {
  const merchantFeedRows = readMerchantFeedRows();

  it.each(ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES)(
    "keeps %s aligned across registry, listing, detail, schema, and merchant feed",
    productCode => {
      const expected =
        ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS[productCode];
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );

      expect(tour).toBeDefined();
      expect(tour?.aggregateRating).toBe(expected.rating);
      expect(tour?.reviewCount).toBe(expected.reviewCount);

      const listingEntry = getToursByCityUnified(
        "colorado",
        "rocky-mountain-national-park"
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

  it("matches the reported private wildlife driving tour Viator public values", () => {
    expect(
      ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_RATINGS[
        ENGINE6_RMNP_366391P1_PRODUCT_CODE
      ]
    ).toEqual({ rating: 5, reviewCount: 85 });
  });

  it("lists exactly twenty-five Engine6 cards for the RMNP cohort on the city index", () => {
    const engine6RmnpTours = getToursByCityUnified(
      "colorado",
      "rocky-mountain-national-park"
    ).filter(
      entry =>
        entry.tour.engine === "engine6" &&
        ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES.includes(
          entry.tour.productCode
        )
    );
    expect(engine6RmnpTours).toHaveLength(25);
  });

  it("does not change non-RMNP merchant feed rows", () => {
    expect(merchantFeedRows.get("8647P594")).toEqual({
      averageRating: "4.9",
      ratingCount: "95",
      reviewCount: "95",
    });
  });

  it("keeps RMNP listing and governed descriptions free of unrelated destination bleed", () => {
    ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES.forEach(
      productCode => {
        const tour = engine6ResolvedTours.find(
          entry => entry.productCode === productCode
        );
        const listingEntry = getToursByCityUnified(
          "colorado",
          "rocky-mountain-national-park"
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
        expect(governedDescription, productCode).toMatch(
          /\b(Rocky Mountain|Estes Park|Colorado|RMNP)\b/i
        );
      }
    );
  });

  it("keeps RMNP public itinerary titles clean on rendered detail pages", () => {
    const malformedTitlePattern =
      /^(?:This|These|That|It|They|inspiration point for photos)$/i;

    ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES.forEach(
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

describe("Rocky Mountain National Park Engine6 itinerary title governance", () => {
  it("audits all 25 RMNP listing products", () => {
    expect(rmnpListingTours).toHaveLength(25);
    expect(rmnpResolvedTours).toHaveLength(25);
    expect(rmnpResolvedTours.map(tour => tour.productCode).sort()).toEqual(
      [...ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES].sort()
    );
  });

  it.each(ROCKY_MOUNTAIN_NATIONAL_PARK_VIATOR_PUBLIC_PRODUCT_CODES)(
    "uses verified POI titles for resolved tour %s",
    productCode => {
      const tour = rmnpResolvedTours.find(
        entry => entry.productCode === productCode
      );
      expect(tour, `missing resolved tour for ${productCode}`).toBeDefined();

      const titles = tour!.itinerary.map(item => item.title);
      expect(titles.length).toBeGreaterThan(0);
      titles.forEach(title => {
        expect(title.trim().length).toBeGreaterThan(2);
        expect(title).not.toMatch(/^(This|These|That|It|They)$/i);
      });
    }
  );
});

describe("Rocky Mountain National Park Engine6 hero diversity governance", () => {
  it("uses unique listing-card heroes across all 25 RMNP products", () => {
    expect(rmnpListingTours).toHaveLength(25);

    const heroCounts = rmnpListingTours.reduce<Map<string, number>>(
      (counts, tour) => {
        counts.set(tour.heroImage, (counts.get(tour.heroImage) ?? 0) + 1);
        return counts;
      },
      new Map()
    );

    expect(heroCounts.size).toBe(rmnpListingTours.length);
  });

  it("documents listing-card hero sources for the first 15 visible cards", () => {
    const canonicalHero = ENGINE6_RMNP_CANONICAL_CITY_HERO_URL;
    const audit = rmnpListingTours.slice(0, 15).map(tour => ({
      productCode: tour.productCode,
      title: tour.title,
      heroImage: tour.heroImage,
      usesCanonicalFallback: tour.heroImage === canonicalHero,
    }));

    const canonicalFallbacks = audit.filter(entry => entry.usesCanonicalFallback);
    expect(
      canonicalFallbacks,
      `canonical destination hero reused on listing cards: ${JSON.stringify(canonicalFallbacks, null, 2)}`
    ).toEqual([]);
    expect(audit.length).toBeGreaterThanOrEqual(12);
  });
});
