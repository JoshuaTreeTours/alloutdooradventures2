import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import TourCard from "../components/TourCard";
import { getToursByCityUnified } from "../data/tours";
import Engine6TourPage from "./components/Engine6TourPage";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import { engine6ListingTours } from "./listing";
import { engine6ResolvedTours } from "./registry";
import {
  ENGINE6_GLACIER_DRIVING_TOUR_GNP_PRODUCT_CODE,
  ENGINE6_GLACIER_DRIVING_TOUR_GNP_ROUTE,
  ENGINE6_GLACIER_DRIVING_TOUR_WEST_PRODUCT_CODE,
  ENGINE6_GLACIER_DRIVING_TOUR_WEST_ROUTE,
} from "./routes";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const LEGACY_RAFTING_HERO_URLS = [
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/72/f1/ad.jpg",
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/72/f1/ae.jpg",
] as const;

const GLACIER_DRIVING_TOUR_SYNDICATED_HEROES = {
  [ENGINE6_GLACIER_DRIVING_TOUR_GNP_PRODUCT_CODE]:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/1b/d1/77.jpg",
  [ENGINE6_GLACIER_DRIVING_TOUR_WEST_PRODUCT_CODE]:
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/r/33/15/32/ef/caption.jpg",
} as const;

const GLACIER_DRIVING_TOUR_ROUTES = {
  [ENGINE6_GLACIER_DRIVING_TOUR_GNP_PRODUCT_CODE]:
    ENGINE6_GLACIER_DRIVING_TOUR_GNP_ROUTE,
  [ENGINE6_GLACIER_DRIVING_TOUR_WEST_PRODUCT_CODE]:
    ENGINE6_GLACIER_DRIVING_TOUR_WEST_ROUTE,
} as const;

const readMerchantFeedImageLinks = () => {
  const lines = readFileSync("data/merchantFeed.csv", "utf8")
    .split(/\r?\n/)
    .filter(Boolean);

  return new Map(
    lines.slice(1).flatMap(line => {
      const match = line.match(
        /^([^,]+),.*?,(https:\/\/www\.alloutdooradventures\.com\/destinations\/[^,]+),(https:\/\/media\.tacdn\.com\/[^,]+),/
      );
      if (!match) {
        return [];
      }

      return [[match[1], { link: match[2], imageLink: match[3] }] as const];
    })
  );
};

describe("Glacier driving tour hero parity", () => {
  const merchantFeedImages = readMerchantFeedImageLinks();

  it.each([
    ENGINE6_GLACIER_DRIVING_TOUR_GNP_PRODUCT_CODE,
    ENGINE6_GLACIER_DRIVING_TOUR_WEST_PRODUCT_CODE,
  ] as const)(
    "uses the Viator syndicated hero for %s across listing, detail, schema, and merchant feed",
    productCode => {
      const expectedHero = GLACIER_DRIVING_TOUR_SYNDICATED_HEROES[productCode];
      const route = GLACIER_DRIVING_TOUR_ROUTES[productCode];

      const resolvedTour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );
      expect(resolvedTour, `missing resolved tour for ${productCode}`).toBeDefined();
      expect(resolvedTour!.canonicalPath).toBe(route);
      expect(resolvedTour!.heroImageUrl).toBe(expectedHero);
      expect(LEGACY_RAFTING_HERO_URLS).not.toContain(resolvedTour!.heroImageUrl);

      const listingTour = engine6ListingTours.find(
        entry => entry.productCode === productCode
      );
      expect(listingTour, `missing listing tour for ${productCode}`).toBeDefined();
      expect(listingTour!.heroImage).toBe(expectedHero);

      const unifiedListing = getToursByCityUnified(
        "montana",
        "glacier-national-park"
      ).find(entry => entry.tour.productCode === productCode);
      expect(unifiedListing).toBeDefined();
      expect(unifiedListing!.tour.heroImage).toBe(expectedHero);

      const cardHtml = renderToString(
        <TourCard tour={unifiedListing!.tour} href={unifiedListing!.href} />
      );
      expect(cardHtml).toContain(expectedHero);

      const detailHtml = renderToString(<Engine6TourPage tour={resolvedTour!} />);
      expect(detailHtml).toContain(expectedHero);

      const graph = buildEngine6SchemaGraph(resolvedTour!)["@graph"] as Array<
        Record<string, unknown>
      >;
      const productNode = graph.find(node => node["@type"] === "Product");
      const tripNode = graph.find(node => node["@type"] === "TouristTrip");
      expect(productNode?.image).toBe(expectedHero);
      expect(tripNode?.image).toBe(expectedHero);

      const merchantRow = merchantFeedImages.get(productCode);
      expect(merchantRow?.link).toBe(
        `https://www.alloutdooradventures.com${route}`
      );
      expect(merchantRow?.imageLink).toBe(expectedHero);
      expect(LEGACY_RAFTING_HERO_URLS).not.toContain(merchantRow?.imageLink);
    }
  );
});
