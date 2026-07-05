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
  FORT_LAUDERDALE_VIATOR_PUBLIC_RATINGS,
  FORT_LAUDERDALE_VIATOR_PUBLIC_PRODUCT_CODES,
  NEW_FORT_LAUDERDALE_PRODUCT_CODES,
} from "./fortLauderdaleViatorPublicRatings";
import { engine6ResolvedTours } from "./registry";
import { ENGINE6_FORT_LAUDERDALE_CANONICAL_CITY_HERO_URL } from "./displayHero";

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

const fortLauderdaleListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "florida" &&
    tour.destination.citySlug === "fort-lauderdale" &&
    FORT_LAUDERDALE_VIATOR_PUBLIC_PRODUCT_CODES.includes(tour.productCode)
);

const fortLauderdaleResolvedTours = engine6ResolvedTours.filter(
  tour =>
    tour.canonicalPath.includes("/florida/fort-lauderdale/") &&
    FORT_LAUDERDALE_VIATOR_PUBLIC_PRODUCT_CODES.includes(tour.productCode)
);

const DESTINATION_BLEED_PATTERN =
  /Chicago|Illinois|Boston|Massachusetts|Philadelphia|Pennsylvania|New York|Washington, D\.C\.|Washington D\.C\.|Sedona|Monterey|Napa|Jackson Hole|Wyoming|Yellowstone|Grand Teton|Zion|Yosemite|Glacier|Moab|Bryce|Arches|Canyonlands|Orlando|Central Florida/i;

describe("Fort Lauderdale Engine6 rating/review parity", () => {
  const merchantFeedRows = readMerchantFeedRows();

  it.each(NEW_FORT_LAUDERDALE_PRODUCT_CODES)(
    "keeps new product %s aligned across registry, listing, detail, schema, and merchant feed",
    productCode => {
      const expected = FORT_LAUDERDALE_VIATOR_PUBLIC_RATINGS[productCode];
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );

      expect(tour).toBeDefined();
      expect(tour?.aggregateRating).toBe(expected.rating);
      expect(tour?.reviewCount).toBe(expected.reviewCount);

      const listingEntry = getToursByCityUnified(
        "florida",
        "fort-lauderdale"
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

  it.each(
    FORT_LAUDERDALE_VIATOR_PUBLIC_PRODUCT_CODES.filter(
      code =>
        !NEW_FORT_LAUDERDALE_PRODUCT_CODES.includes(
          code as (typeof NEW_FORT_LAUDERDALE_PRODUCT_CODES)[number]
        )
    )
  )(
    "keeps legacy product %s aligned across registry, listing, detail, and schema",
    productCode => {
      const expected = FORT_LAUDERDALE_VIATOR_PUBLIC_RATINGS[productCode];
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );

      expect(tour).toBeDefined();
      expect(tour?.aggregateRating).toBe(expected.rating);
      expect(tour?.reviewCount).toBe(expected.reviewCount);

      const listingEntry = getToursByCityUnified(
        "florida",
        "fort-lauderdale"
      ).find(entry => entry.tour.productCode === productCode);
      expect(listingEntry).toBeDefined();
      expect(listingEntry?.tour.badges.rating).toBe(expected.rating);
      expect(listingEntry?.tour.badges.reviewCount).toBe(expected.reviewCount);

      const graph = buildEngine6SchemaGraph(tour!)["@graph"] as Array<
        Record<string, unknown>
      >;
      const aggregateRating = graph.find(
        node => node["@type"] === "AggregateRating"
      );
      expect(aggregateRating?.ratingValue).toBe(expected.rating);
      expect(aggregateRating?.reviewCount).toBe(expected.reviewCount);
    }
  );

  it("matches the reported private yacht Viator public values", () => {
    expect(FORT_LAUDERDALE_VIATOR_PUBLIC_RATINGS["155077P1"]).toEqual({
      rating: 5.0,
      reviewCount: 111,
    });
  });

  it("lists exactly twenty-five Engine6 cards for the Fort Lauderdale cohort on the city index", () => {
    const engine6FortLauderdaleTours = getToursByCityUnified(
      "florida",
      "fort-lauderdale"
    ).filter(
      entry =>
        entry.tour.engine === "engine6" &&
        FORT_LAUDERDALE_VIATOR_PUBLIC_PRODUCT_CODES.includes(
          entry.tour.productCode
        )
    );
    expect(engine6FortLauderdaleTours).toHaveLength(25);
  });

  it("does not change non-Fort-Lauderdale merchant feed rows", () => {
    expect(merchantFeedRows.get("8647P594")).toEqual({
      averageRating: "4.9",
      ratingCount: "95",
      reviewCount: "95",
    });
  });

  it("keeps new Fort Lauderdale listing and governed descriptions free of unrelated destination bleed", () => {
    NEW_FORT_LAUDERDALE_PRODUCT_CODES.forEach(productCode => {
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );
      const listingEntry = getToursByCityUnified(
        "florida",
        "fort-lauderdale"
      ).find(entry => entry.tour.productCode === productCode);

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
      expect(governedDescription, productCode).toMatch(/\bFort Lauderdale\b/i);
    });
  });

  it("keeps Fort Lauderdale public itinerary titles clean on rendered detail pages", () => {
    const malformedTitlePattern =
      /^(?:This|These|That|It|They|inspiration point for photos)$/i;

    FORT_LAUDERDALE_VIATOR_PUBLIC_PRODUCT_CODES.forEach(productCode => {
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

describe("Fort Lauderdale Engine6 itinerary title governance", () => {
  it("audits all 25 Fort Lauderdale listing products", () => {
    expect(fortLauderdaleListingTours).toHaveLength(25);
    expect(fortLauderdaleResolvedTours).toHaveLength(25);
    expect(
      fortLauderdaleResolvedTours.map(tour => tour.productCode).sort()
    ).toEqual([...FORT_LAUDERDALE_VIATOR_PUBLIC_PRODUCT_CODES].sort());
  });

  it.each(FORT_LAUDERDALE_VIATOR_PUBLIC_PRODUCT_CODES)(
    "uses verified POI titles for resolved tour %s",
    productCode => {
      const tour = fortLauderdaleResolvedTours.find(
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

describe("Fort Lauderdale Engine6 hero diversity governance", () => {
  it("uses unique listing-card heroes across all 25 Fort Lauderdale products", () => {
    expect(fortLauderdaleListingTours).toHaveLength(25);

    const heroCounts = fortLauderdaleListingTours.reduce<Map<string, number>>(
      (counts, tour) => {
        counts.set(tour.heroImage, (counts.get(tour.heroImage) ?? 0) + 1);
        return counts;
      },
      new Map()
    );

    expect(heroCounts.size).toBe(fortLauderdaleListingTours.length);
  });

  it("does not reuse the canonical city hero on the first 15 visible listing cards", () => {
    const visibleCards = getToursByCityUnified("florida", "fort-lauderdale")
      .filter(entry =>
        FORT_LAUDERDALE_VIATOR_PUBLIC_PRODUCT_CODES.includes(
          entry.tour.productCode
        )
      )
      .slice(0, 15);

    visibleCards.forEach(entry => {
      expect(entry.tour.heroImage).not.toBe(
        ENGINE6_FORT_LAUDERDALE_CANONICAL_CITY_HERO_URL
      );
    });
  });
});
