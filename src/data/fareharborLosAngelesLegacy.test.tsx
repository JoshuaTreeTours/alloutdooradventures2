import type { ReactNode } from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Router } from "wouter";

import TourCard from "../components/TourCard";
import CityTourDetailRoute from "../pages/destinations/states/tours/CityTourDetailRoute";
import { getTourBySlugs } from "./tours";
import {
  fareHarborPriceLabel,
  fareHarborRatingParityErrors,
  formatFareHarborRating,
} from "./fareharborPresentation";
import {
  buildFareHarborProofSchemaGraph,
  collectFareHarborMigratedRoutePaths,
  getFareHarborBostonLegacyProducts,
  getFareHarborChicagoLegacyProducts,
  getFareHarborLosAngelesLegacyProducts,
  getFareHarborProofByItemId,
  getFareHarborProofProducts,
} from "./fareharborLeadToGoldProof";
import { isStageBBookingPageNotFound } from "../utils/fareharbor/stageBTerminalBookingPages";
import { isFareHarborGeographyReview } from "../utils/fareharbor/geographyReview";
import { isUnpublishedUnpricedFareHarborProduct } from "../utils/fareharbor/unpublishedUnpricedProducts.generated";

vi.mock("../components/StructuredDataProvider", () => ({
  useStructuredData: () => undefined,
}));

const renderRoute = (path: string, node: ReactNode) =>
  renderToStaticMarkup(
    <Router hook={() => [path, () => undefined]}>{node}</Router>
  );

const typeNames = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(String) : value ? [String(value)] : [];

describe("FareHarbor Los Angeles legacy rollout", () => {
  it("appends Los Angeles without changing Boston or Chicago", () => {
    const boston = getFareHarborBostonLegacyProducts();
    const chicago = getFareHarborChicagoLegacyProducts();
    const losAngeles = getFareHarborLosAngelesLegacyProducts();
    const products = getFareHarborProofProducts();
    const ids = products.map(product => product.itemId);
    expect(boston).toHaveLength(221);
    expect(boston.filter(product => product.aggregateRating)).toHaveLength(47);
    expect(boston.filter(product => product.offer)).toHaveLength(93);
    expect(chicago).toHaveLength(17);
    expect(chicago.every(product => product.offer && product.visiblePriceLabel)).toBe(true);
    expect(losAngeles).toHaveLength(6);
    expect(
      losAngeles.filter(product => product.publicPath.includes("/los-angeles/"))
    ).toHaveLength(6);
    expect(losAngeles.every(product => product.offer && product.visiblePriceLabel)).toBe(true);
    expect(losAngeles.filter(product => product.aggregateRating)).toHaveLength(3);
    expect(
      losAngeles
        .filter(product => product.aggregateRating)
        .every(product => product.aggregateRating?.provider === "Google")
    ).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
    expect(products.filter(product => product.itemId === "73240")).toHaveLength(0);
    expect(isFareHarborGeographyReview("73240")).toBe(true);
    expect(isUnpublishedUnpricedFareHarborProduct("296848")).toBe(true);
    expect(getFareHarborProofByItemId("296848")).toBeNull();
  });

  it("keeps priced pages in the sitemap and out of the merchant feed", () => {
    const sitemap = readFileSync("public/sitemap-tours.xml", "utf8");
    const merchantFeed = readFileSync("data/merchantFeed.csv", "utf8");
    for (const product of getFareHarborLosAngelesLegacyProducts()) {
      expect(merchantFeed, product.itemId).not.toContain(product.itemId);
      expect(collectFareHarborMigratedRoutePaths()).toContain(product.publicPath);
      expect(sitemap, product.itemId).toContain(product.publicPath);
      expect(product.publicPath.startsWith("/destinations/california/los-angeles/tours/")).toBe(
        true
      );
    }
    expect(sitemap).toContain(
      "/destinations/california/los-angeles/tours/california-coast-and-canyons-helicopter-tour-53931"
    );
    expect(sitemap).toContain(
      "/destinations/massachusetts/boston/tours/boston-history-harbor-tour-aboard-yacht-patriot-657142"
    );
  });

  it("renders Google ratings on priced pages and cards, and omits them when FareHarbor has none", () => {
    const cases = [
      {
        itemId: "333382",
        slug: "a-taste-of-la-half-day-tour-of-the-best-of-los-angeles-333382",
        ratingValue: 4.9,
        reviewCount: 9992,
      },
      {
        itemId: "168579",
        slug: "la-essential-star-homes-tour-168579",
        ratingValue: 4.9,
        reviewCount: 1335,
      },
      {
        itemId: "518084",
        slug: "private-los-angeles-tour-beverly-hills-518084",
        ratingValue: 4.9,
        reviewCount: 1335,
      },
      {
        itemId: "680527",
        slug: "manson-family-murders-funeral-limo-tour-of-la-680527",
        ratingValue: null,
        reviewCount: null,
      },
    ] as const;

    for (const sample of cases) {
      const product = getFareHarborLosAngelesLegacyProducts().find(
        entry => entry.itemId === sample.itemId
      )!;
      const tour = getTourBySlugs("california", "los-angeles", sample.slug)!;
      expect(tour, sample.itemId).toBeTruthy();
      expect(tour.destination.citySlug, sample.itemId).toBe("los-angeles");
      expect(tour.destination.state, sample.itemId).toBe("California");
      expect(tour.destination.city, sample.itemId).toBe("Los Angeles");
      expect(tour.heroImage, sample.itemId).toBeTruthy();
      const card = renderRoute(
        product.publicPath,
        <TourCard tour={tour} href={product.publicPath} />
      );
      const page = renderRoute(
        product.publicPath,
        <CityTourDetailRoute
          params={{
            stateSlug: "california",
            citySlug: "los-angeles",
            tourSlug: sample.slug,
          }}
        />
      );
      const header = page.slice(0, page.indexOf("What you’ll experience"));
      const price = fareHarborPriceLabel(product);
      expect(price, sample.itemId).toBe(product.visiblePriceLabel);
      expect(card, sample.itemId).toContain(price!);
      expect(header, sample.itemId).toContain(price!);
      if (sample.ratingValue !== null && sample.reviewCount !== null) {
        expect(product.aggregateRating, sample.itemId).toEqual({
          ratingValue: sample.ratingValue,
          reviewCount: sample.reviewCount,
          provider: "Google",
        });
        const formatted = formatFareHarborRating(product.aggregateRating!);
        expect(formatted, sample.itemId).toContain("· Google");
        expect(formatted, sample.itemId).not.toContain("TripAdvisor");
        expect(card, sample.itemId).toContain(formatted);
        expect(header, sample.itemId).toContain(formatted);
        expect(card, sample.itemId).toContain('data-rating-provider="Google"');
      } else {
        expect(product.aggregateRating, sample.itemId).toBeNull();
        expect(card, sample.itemId).not.toContain("fareharbor-rating");
        expect(header, sample.itemId).not.toContain("fareharbor-rating");
      }
      expect(header, sample.itemId).toContain("California");
      expect(header, sample.itemId).toContain("Los Angeles");
      expect(page, sample.itemId).toContain(product.publicPath);
      const graph = buildFareHarborProofSchemaGraph(product, {
        canonicalUrl: `https://www.alloutdooradventures.com${product.publicPath}`,
      });
      const parsed = JSON.parse(JSON.stringify(graph)) as {
        "@graph": Array<Record<string, unknown>>;
      };
      const productNodes = parsed["@graph"].filter(node =>
        typeNames(node["@type"]).includes("Product")
      );
      expect(productNodes, sample.itemId).toHaveLength(1);
      expect(
        fareHarborRatingParityErrors({
          proof: product,
          surfaces: [
            { name: "card", html: card },
            { name: "page", html: header },
            { name: "schema", aggregateRating: productNodes[0].aggregateRating },
          ],
        }),
        sample.itemId
      ).toEqual([]);
      expect(productNodes[0].offers, sample.itemId).toMatchObject({
        "@type": "Offer",
        price: product.offer!.price,
        priceCurrency: product.offer!.priceCurrency,
      });
      expect(JSON.stringify(graph), sample.itemId).not.toContain("129.00");
      expect(header, sample.itemId).not.toContain("TBD");
      expect(header, sample.itemId).not.toContain("Lorem ipsum");
      expect(header, sample.itemId).not.toContain("Best Way To See");
      expect(page, sample.itemId).not.toContain("film or television scene was shot");
    }
  });

  it("drops no-price, terminal, placeholder, and geography-mismatch products", () => {
    const sitemap = readFileSync("public/sitemap-tours.xml", "utf8");
    const merchantFeed = readFileSync("data/merchantFeed.csv", "utf8");
    const excluded = [
      {
        itemId: "324799",
        slug: "beverly-hills-tour-1h15-minutes-324799",
        terminal: true,
        unpriced: false,
        geography: false,
      },
      {
        itemId: "382848",
        slug: "the-beach-tour-4-hours-382848",
        terminal: true,
        unpriced: false,
        geography: false,
      },
      {
        itemId: "547525",
        slug: "1-hour-walk-of-fame-guided-tour-547525",
        terminal: true,
        unpriced: false,
        geography: false,
      },
      {
        itemId: "471721",
        slug: "the-official-hollywood-sign-walking-tour-in-los-angeles-free-waters-471721",
        terminal: false,
        unpriced: true,
        geography: false,
      },
      {
        itemId: "205984",
        slug: "1-hr---real-hollywood-sign-tour-205984",
        terminal: false,
        unpriced: true,
        geography: false,
      },
      {
        itemId: "349518",
        slug: "sightseeing-hollywood-tours-349518",
        terminal: false,
        unpriced: true,
        geography: false,
      },
      {
        itemId: "629071",
        slug: "venices-finest-a-daytime-experience-629071",
        terminal: false,
        unpriced: false,
        geography: true,
      },
    ] as const;

    for (const sample of excluded) {
      expect(isStageBBookingPageNotFound(sample.itemId), sample.itemId).toBe(sample.terminal);
      expect(isUnpublishedUnpricedFareHarborProduct(sample.itemId), sample.itemId).toBe(
        sample.unpriced
      );
      expect(isFareHarborGeographyReview(sample.itemId), sample.itemId).toBe(sample.geography);
      expect(getFareHarborProofByItemId(sample.itemId), sample.itemId).toBeNull();
      expect(
        getTourBySlugs("california", "los-angeles", sample.slug),
        sample.itemId
      ).toBeUndefined();
      expect(sitemap, sample.itemId).not.toContain(sample.slug);
      expect(merchantFeed, sample.itemId).not.toContain(sample.itemId);
    }
    expect(getTourBySlugs("california", "venice", "venices-finest-a-daytime-experience-629071")).toBeUndefined();
  });
});
