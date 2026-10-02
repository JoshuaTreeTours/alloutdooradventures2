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
  getFareHarborProofByItemId,
  getFareHarborProofProducts,
} from "./fareharborLeadToGoldProof";
import { isStageBBookingPageNotFound } from "../utils/fareharbor/stageBTerminalBookingPages";
import { isFareHarborGeographyReview } from "../utils/fareharbor/geographyReview";

vi.mock("../components/StructuredDataProvider", () => ({
  useStructuredData: () => undefined,
}));

const renderRoute = (path: string, node: ReactNode) =>
  renderToStaticMarkup(
    <Router hook={() => [path, () => undefined]}>{node}</Router>
  );

const typeNames = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(String) : value ? [String(value)] : [];

describe("FareHarbor Chicago legacy rollout", () => {
  it("appends Chicago without changing the Boston batch", () => {
    const boston = getFareHarborBostonLegacyProducts();
    const chicago = getFareHarborChicagoLegacyProducts();
    const products = getFareHarborProofProducts();
    const ids = products.map(product => product.itemId);
    expect(boston).toHaveLength(221);
    expect(boston.filter(product => product.aggregateRating)).toHaveLength(47);
    expect(boston.filter(product => product.offer)).toHaveLength(93);
    expect(chicago).toHaveLength(28);
    expect(chicago.filter(product => product.publicPath.includes("/chicago/"))).toHaveLength(27);
    expect(new Set(ids).size).toBe(ids.length);
    expect(products.filter(product => product.itemId === "73240")).toHaveLength(0);
    expect(isFareHarborGeographyReview("73240")).toBe(true);
  });

  it("keeps terminal Chicago booking pages out of the public set", () => {
    const sitemap = readFileSync("public/sitemap-tours.xml", "utf8");
    const merchantFeed = readFileSync("data/merchantFeed.csv", "utf8");
    const terminal = {
      itemId: "656890",
      slug: "hamilton-in-chicago-656890",
    };
    expect(isStageBBookingPageNotFound(terminal.itemId)).toBe(true);
    expect(getFareHarborProofByItemId(terminal.itemId)).toBeNull();
    expect(
      getTourBySlugs("illinois", "chicago", terminal.slug)
    ).toBeUndefined();
    expect(sitemap).not.toContain(terminal.slug);
    expect(merchantFeed).not.toContain(terminal.itemId);
    for (const product of getFareHarborChicagoLegacyProducts()) {
      expect(merchantFeed).not.toContain(product.itemId);
      expect(collectFareHarborMigratedRoutePaths()).toContain(product.publicPath);
      expect(sitemap).toContain(product.publicPath);
    }
  });

  it("renders price, rating, and omission cases through the shared template", () => {
    const cases = [
      {
        itemId: "296843",
        stateSlug: "illinois",
        citySlug: "chicago",
        slug: "art-institute-of-chicago-skip-the-line-tour-semi-private-296843",
        priced: true,
        rated: true,
        stateName: "Illinois",
        cityName: "Chicago",
      },
      {
        itemId: "148284",
        stateSlug: "illinois",
        citySlug: "chicago",
        slug: "private-luxury-yacht-rental-12-person-max-148284",
        priced: true,
        rated: false,
        stateName: "Illinois",
        cityName: "Chicago",
      },
      {
        itemId: "296848",
        stateSlug: "illinois",
        citySlug: "chicago",
        slug: "art-institute-of-chicago-skip-the-line-tour-private-296848",
        priced: false,
        rated: true,
        stateName: "Illinois",
        cityName: "Chicago",
      },
      {
        itemId: "687115",
        stateSlug: "illinois",
        citySlug: "chicago",
        slug: "37ft-sea-ray-sundancer--4-hours-test-687115",
        priced: false,
        rated: false,
        stateName: "Illinois",
        cityName: "Chicago",
      },
    ] as const;

    for (const sample of cases) {
      const product = getFareHarborChicagoLegacyProducts().find(
        entry => entry.itemId === sample.itemId
      )!;
      const tour = getTourBySlugs(sample.stateSlug, sample.citySlug, sample.slug)!;
      expect(tour, sample.itemId).toBeTruthy();
      expect(tour.destination.citySlug, sample.itemId).toBe(sample.citySlug);
      expect(tour.destination.state, sample.itemId).toBe(sample.stateName);
      const card = renderRoute(
        product.publicPath,
        <TourCard tour={tour} href={product.publicPath} />
      );
      const page = renderRoute(
        product.publicPath,
        <CityTourDetailRoute
          params={{
            stateSlug: sample.stateSlug,
            citySlug: sample.citySlug,
            tourSlug: sample.slug,
          }}
        />
      );
      const header = page.slice(0, page.indexOf("What you’ll experience"));
      expect(header, sample.itemId).toContain(sample.stateName);
      expect(header, sample.itemId).toContain(sample.cityName);
      expect(page, sample.itemId).toContain(product.publicPath);
      const price = fareHarborPriceLabel(product);
      if (sample.priced) {
        expect(price, sample.itemId).toBeTruthy();
        expect(card, sample.itemId).toContain(price!);
        expect(header, sample.itemId).toContain(price!);
      } else {
        expect(product.offer, sample.itemId).toBeNull();
        expect(card, sample.itemId).not.toContain('data-testid="fareharbor-price"');
        expect(header, sample.itemId).not.toContain('data-testid="fareharbor-price"');
      }
      if (sample.rated) {
        const formatted = formatFareHarborRating(product.aggregateRating!);
        expect(card, sample.itemId).toContain(formatted);
        expect(header, sample.itemId).toContain(formatted);
      } else {
        expect(product.aggregateRating, sample.itemId).toBeNull();
        expect(card, sample.itemId).not.toContain("fareharbor-rating");
        expect(header, sample.itemId).not.toContain("fareharbor-rating");
      }
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
            { name: "schema", aggregateRating: productNodes[0].aggregateRating },
          ],
        }),
        sample.itemId
      ).toEqual([]);
      if (product.offer) {
        expect(productNodes[0].offers, sample.itemId).toMatchObject({
          "@type": "Offer",
          price: product.offer.price,
          priceCurrency: product.offer.priceCurrency,
        });
      } else {
        expect(productNodes[0].offers, sample.itemId).toBeUndefined();
      }
      expect(JSON.stringify(graph), sample.itemId).not.toContain("129.00");
      expect(header, sample.itemId).not.toContain("TBD");
      expect(header, sample.itemId).not.toContain("Lorem ipsum");
    }
  });

  it("moves the Miami Beach bike tour off the Chicago route", () => {
    const product = getFareHarborProofByItemId("584698");
    expect(product?.publicPath).toBe(
      "/destinations/florida/miami-beach/tours/miami-beach-ultimate-city-bike-tour-584698"
    );
    expect(
      getTourBySlugs(
        "illinois",
        "chicago",
        "miami-beach-ultimate-city-bike-tour-584698"
      )
    ).toBeUndefined();
    const tour = getTourBySlugs(
      "florida",
      "miami-beach",
      "miami-beach-ultimate-city-bike-tour-584698"
    );
    expect(tour?.destination).toMatchObject({
      stateSlug: "florida",
      citySlug: "miami-beach",
      state: "Florida",
      city: "Miami Beach",
    });
  });
});
