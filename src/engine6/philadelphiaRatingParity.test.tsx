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
  PHILADELPHIA_VIATOR_PUBLIC_RATINGS,
  PHILADELPHIA_VIATOR_PUBLIC_PRODUCT_CODES,
} from "./philadelphiaViatorPublicRatings";
import { engine6ResolvedTours } from "./registry";
import { ENGINE6_PHILADELPHIA_8841P1_PRODUCT_CODE } from "./routes";

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

const philadelphiaListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "pennsylvania" &&
    tour.destination.citySlug === "philadelphia"
);

const philadelphiaResolvedTours = engine6ResolvedTours.filter(tour =>
  tour.canonicalPath.includes("/pennsylvania/philadelphia/")
);

const DESTINATION_BLEED_PATTERN =
  /Yellowstone|Yosemite|Zion National Park|Glacier National Park|Grand Canyon National Park|Great Smoky Mountains|Sedona|Washington, D\.C\.|Washington D\.C\.|Chicago|Boston/i;

const VINEYARD_BLEED_PATTERN =
  /\b(?:vineyard country|valley cellars|distinct wineries|estate wineries)\b/i;

describe("Philadelphia Engine6 rating/review parity", () => {
  const merchantFeedRows = readMerchantFeedRows();

  it.each(PHILADELPHIA_VIATOR_PUBLIC_PRODUCT_CODES)(
    "keeps %s aligned across registry, listing, detail, schema, and merchant feed",
    productCode => {
      const expected = PHILADELPHIA_VIATOR_PUBLIC_RATINGS[productCode];
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );

      expect(tour).toBeDefined();
      expect(tour?.aggregateRating).toBe(expected.rating);
      expect(tour?.reviewCount).toBe(expected.reviewCount);

      const listingEntry = getToursByCityUnified(
        "pennsylvania",
        "philadelphia"
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

  it("matches the reported private full-day driving tour Viator public values", () => {
    expect(
      PHILADELPHIA_VIATOR_PUBLIC_RATINGS[ENGINE6_PHILADELPHIA_8841P1_PRODUCT_CODE]
    ).toEqual({ rating: 5, reviewCount: 142 });
  });

  it("lists exactly twenty-two Engine6 cards on the Philadelphia city index", () => {
    const engine6PhiladelphiaTours = getToursByCityUnified(
      "pennsylvania",
      "philadelphia"
    ).filter(entry => entry.tour.engine === "engine6");
    expect(engine6PhiladelphiaTours).toHaveLength(22);
  });

  it("does not change non-Philadelphia merchant feed rows", () => {
    expect(merchantFeedRows.get("8647P594")).toEqual({
      averageRating: "4.9",
      ratingCount: "95",
      reviewCount: "95",
    });
  });

  it("keeps Philadelphia listing and governed descriptions free of unrelated destination bleed", () => {
    PHILADELPHIA_VIATOR_PUBLIC_PRODUCT_CODES.forEach(productCode => {
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );
      const listingEntry = getToursByCityUnified(
        "pennsylvania",
        "philadelphia"
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
      expect(governedDescription, productCode).not.toMatch(VINEYARD_BLEED_PATTERN);
      expect(governedDescription, productCode).toMatch(/\bPhiladelphia\b/i);
    });
  });

  it("keeps Philadelphia public itinerary titles clean on rendered detail pages", () => {
    const malformedTitlePattern =
      /^(?:This|These|That|It|They|inspiration point for photos)$/i;

    PHILADELPHIA_VIATOR_PUBLIC_PRODUCT_CODES.forEach(productCode => {
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

describe("Philadelphia Engine6 itinerary title governance", () => {
  it("audits all 22 Philadelphia listing products", () => {
    expect(philadelphiaListingTours).toHaveLength(22);
    expect(philadelphiaResolvedTours).toHaveLength(22);
    expect(
      philadelphiaResolvedTours.map(tour => tour.productCode).sort()
    ).toEqual([...PHILADELPHIA_VIATOR_PUBLIC_PRODUCT_CODES].sort());
  });

  it.each(PHILADELPHIA_VIATOR_PUBLIC_PRODUCT_CODES)(
    "uses verified POI titles for resolved tour %s",
    productCode => {
      const tour = philadelphiaResolvedTours.find(
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

describe("Philadelphia Engine6 hero diversity governance", () => {
  it("uses unique listing-card heroes across all 22 Philadelphia products", () => {
    expect(philadelphiaListingTours).toHaveLength(22);

    const heroCounts = philadelphiaListingTours.reduce<Map<string, number>>(
      (counts, tour) => {
        counts.set(tour.heroImage, (counts.get(tour.heroImage) ?? 0) + 1);
        return counts;
      },
      new Map()
    );

    expect(heroCounts.size).toBe(philadelphiaListingTours.length);
  });
});
