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
import {
  YOSEMITE_VIATOR_PUBLIC_RATINGS,
  YOSEMITE_VIATOR_PUBLIC_PRODUCT_CODES,
} from "./yosemiteViatorPublicRatings";
import { engine6ResolvedTours } from "./registry";
import { ENGINE6_YOSEMITE_HIGHLIGHTS_SMALL_GROUP_TOUR_PRODUCT_CODE } from "./routes";

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

describe("Yosemite Engine6 rating/review parity", () => {
  const merchantFeedRows = readMerchantFeedRows();

  it.each(YOSEMITE_VIATOR_PUBLIC_PRODUCT_CODES)(
    "keeps %s aligned across registry, listing, detail, schema, and merchant feed",
    productCode => {
      const expected = YOSEMITE_VIATOR_PUBLIC_RATINGS[productCode];
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );

      expect(tour).toBeDefined();
      expect(tour?.aggregateRating).toBe(expected.rating);
      expect(tour?.reviewCount).toBe(expected.reviewCount);

      const listingEntry = getToursByCityUnified(
        "california",
        "yosemite"
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

  it("matches the reported Yosemite Highlights Small Group Tour Viator public values", () => {
    expect(
      YOSEMITE_VIATOR_PUBLIC_RATINGS[
        ENGINE6_YOSEMITE_HIGHLIGHTS_SMALL_GROUP_TOUR_PRODUCT_CODE
      ]
    ).toEqual({ rating: 4.9, reviewCount: 415 });
  });

  it("lists exactly seven Engine6 cards on the Yosemite city index", () => {
    const engine6YosemiteTours = getToursByCityUnified(
      "california",
      "yosemite"
    ).filter(entry => entry.tour.engine === "engine6");
    expect(engine6YosemiteTours).toHaveLength(7);
  });

  it("does not change non-Yosemite merchant feed rows", () => {
    expect(merchantFeedRows.get("8647P594")).toEqual({
      averageRating: "4.9",
      ratingCount: "95",
      reviewCount: "95",
    });
    expect(merchantFeedRows.size).toBe(205);
  });

  it("keeps Yosemite merchant and listing-card descriptions free of template bleed", () => {
    const forbiddenPatterns = [
      /guided city circuit/i,
      /aerial course/i,
      /Coastal waters around Yosemite/i,
      /\bCalifornia Tunnel\b(?! Tree)/i,
    ];

    YOSEMITE_VIATOR_PUBLIC_PRODUCT_CODES.forEach(productCode => {
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );
      expect(tour).toBeDefined();

      const governedDescription = resolveEngine6GovernedProductDescription(tour!);
      const cardDescription = buildEngine6CardDescription(tour!);

      for (const pattern of forbiddenPatterns) {
        expect(governedDescription).not.toMatch(pattern);
        expect(cardDescription).not.toMatch(pattern);
      }
    });
  });

  it("keeps Yosemite public itinerary titles clean on rendered detail pages", () => {
    const malformedTitlePattern =
      /^(?:This|These|That|It|They|inspiration point for photos)$/i;

    YOSEMITE_VIATOR_PUBLIC_PRODUCT_CODES.forEach(productCode => {
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
});
