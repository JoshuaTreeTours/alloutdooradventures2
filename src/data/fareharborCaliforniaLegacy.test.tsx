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
} from "./fareharborPresentation";
import { type FareHarborProofProduct } from "./fareharborLeadToGoldProof.generated";
import {
  buildFareHarborProofSchemaGraph,
  collectFareHarborMigratedRoutePaths,
  getFareHarborAvalonLegacyProducts,
  getFareHarborBostonLegacyProducts,
  getFareHarborCalistogaLegacyProducts,
  getFareHarborChicagoLegacyProducts,
  getFareHarborCoronadoLegacyProducts,
  getFareHarborDelMarLegacyProducts,
  getFareHarborHealdsburgLegacyProducts,
  getFareHarborJoshuaTreeLegacyProducts,
  getFareHarborLagunaBeachLegacyProducts,
  getFareHarborLosAngelesLegacyProducts,
  getFareHarborMarinaDelReyLegacyProducts,
  getFareHarborOakhurstLegacyProducts,
  getFareHarborProofByItemId,
  getFareHarborProofProducts,
  getFareHarborRedondoBeachLegacyProducts,
  getFareHarborSanDiegoLegacyProducts,
  getFareHarborSanFranciscoLegacyProducts,
  getFareHarborSantaMonicaLegacyProducts,
} from "./fareharborLeadToGoldProof";
import { isFareHarborGeographyReview } from "../utils/fareharbor/geographyReview";
import { isStageBBookingPageNotFound } from "../utils/fareharbor/stageBTerminalBookingPages";
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

const californiaBatches: FareHarborProofProduct[][] = [
  getFareHarborSanDiegoLegacyProducts(),
  getFareHarborSanFranciscoLegacyProducts(),
  getFareHarborJoshuaTreeLegacyProducts(),
  getFareHarborRedondoBeachLegacyProducts(),
  getFareHarborCoronadoLegacyProducts(),
  getFareHarborCalistogaLegacyProducts(),
  getFareHarborDelMarLegacyProducts(),
  getFareHarborSantaMonicaLegacyProducts(),
  getFareHarborMarinaDelReyLegacyProducts(),
  getFareHarborOakhurstLegacyProducts(),
  getFareHarborLagunaBeachLegacyProducts(),
  getFareHarborHealdsburgLegacyProducts(),
  getFareHarborAvalonLegacyProducts(),
];

const californiaProducts = californiaBatches.flat();

const routeParts = (publicPath: string) => {
  const match = publicPath.match(
    /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/
  );
  if (!match) {
    throw new Error(`unexpected path ${publicPath}`);
  }
  return { stateSlug: match[1], citySlug: match[2], tourSlug: match[3] };
};

describe("FareHarbor California statewide rollout", () => {
  it("keeps Boston, Chicago, and Los Angeles counts unchanged", () => {
    const boston = getFareHarborBostonLegacyProducts();
    const chicago = getFareHarborChicagoLegacyProducts();
    const losAngeles = getFareHarborLosAngelesLegacyProducts();
    const products = getFareHarborProofProducts();
    const ids = products.map(product => product.itemId);
    expect(boston).toHaveLength(221);
    expect(boston.filter(product => product.aggregateRating)).toHaveLength(47);
    expect(boston.filter(product => product.offer)).toHaveLength(93);
    expect(chicago).toHaveLength(17);
    expect(chicago.every(product => product.offer && product.visiblePriceLabel)).toBe(
      true
    );
    expect(losAngeles).toHaveLength(6);
    expect(losAngeles.every(product => product.offer && product.visiblePriceLabel)).toBe(
      true
    );
    expect(
      losAngeles.filter(product => product.aggregateRating?.provider === "Google")
    ).toHaveLength(3);
    expect(losAngeles.some(product => product.aggregateRating?.provider === "TripAdvisor")).toBe(
      false
    );
    expect(new Set(ids).size).toBe(ids.length);
    expect(products.filter(product => product.itemId === "34849")).toHaveLength(1);
    expect(products.filter(product => product.itemId === "73240")).toHaveLength(0);
    expect(isFareHarborGeographyReview("73240")).toBe(true);
    expect(isUnpublishedUnpricedFareHarborProduct("296848")).toBe(true);
    expect(getFareHarborProofByItemId("296848")).toBeNull();
    expect(californiaProducts.length).toBeGreaterThan(100);
  });

  it("publishes only priced California products on their resolved destinations", () => {
    expect(getFareHarborSanDiegoLegacyProducts()).toHaveLength(77);
    expect(getFareHarborSanFranciscoLegacyProducts()).toHaveLength(14);
    expect(getFareHarborJoshuaTreeLegacyProducts()).toHaveLength(12);
    expect(getFareHarborRedondoBeachLegacyProducts()).toHaveLength(8);
    expect(getFareHarborCoronadoLegacyProducts()).toHaveLength(6);
    expect(getFareHarborCalistogaLegacyProducts()).toHaveLength(6);
    expect(getFareHarborDelMarLegacyProducts()).toHaveLength(5);
    expect(getFareHarborSantaMonicaLegacyProducts()).toHaveLength(3);
    expect(getFareHarborMarinaDelReyLegacyProducts()).toHaveLength(2);
    expect(getFareHarborOakhurstLegacyProducts()).toHaveLength(1);
    expect(getFareHarborLagunaBeachLegacyProducts()).toHaveLength(1);
    expect(getFareHarborHealdsburgLegacyProducts()).toHaveLength(1);
    expect(getFareHarborAvalonLegacyProducts()).toHaveLength(1);

    const sitemap = readFileSync("public/sitemap-tours.xml", "utf8");
    const merchantFeed = readFileSync("data/merchantFeed.csv", "utf8");
    const routes = collectFareHarborMigratedRoutePaths();
    for (const product of californiaProducts) {
      expect(product.offer, product.itemId).toBeTruthy();
      expect(product.visiblePriceLabel, product.itemId).toBeTruthy();
      expect(product.publicPath.startsWith("/destinations/california/"), product.itemId).toBe(
        true
      );
      expect(routes, product.itemId).toContain(product.publicPath);
      expect(sitemap, product.itemId).toContain(product.publicPath);
      expect(merchantFeed, product.itemId).not.toContain(product.itemId);
      const provider = product.aggregateRating?.provider;
      if (product.aggregateRating) {
        expect(["TripAdvisor", "Google"], product.itemId).toContain(provider);
        expect(product.aggregateRating.ratingValue, product.itemId).toBeGreaterThan(0);
        expect(product.aggregateRating.reviewCount, product.itemId).toBeGreaterThan(0);
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
      expect(productNodes, product.itemId).toHaveLength(1);
      const ratingHosts = parsed["@graph"].filter(node => node.aggregateRating != null);
      expect(productNodes[0].offers, product.itemId).toMatchObject({
        "@type": "Offer",
        price: product.offer!.price,
        priceCurrency: product.offer!.priceCurrency,
      });
      if (product.aggregateRating) {
        expect(ratingHosts, product.itemId).toHaveLength(1);
        expect(productNodes[0].aggregateRating, product.itemId).toMatchObject({
          "@type": "AggregateRating",
          ratingValue: product.aggregateRating.ratingValue,
          reviewCount: product.aggregateRating.reviewCount,
          author: { "@type": "Organization", name: product.aggregateRating.provider },
        });
      } else {
        expect(ratingHosts, product.itemId).toHaveLength(0);
      }
      expect(JSON.stringify(graph), product.itemId).not.toContain("undefined");
    }

    expect(
      getFareHarborSanFranciscoLegacyProducts().every(
        product => product.aggregateRating?.provider === "TripAdvisor"
      )
    ).toBe(true);
    expect(
      getFareHarborJoshuaTreeLegacyProducts().filter(
        product => product.aggregateRating?.provider === "Google"
      ).length
    ).toBeGreaterThan(0);
    expect(
      getFareHarborMarinaDelReyLegacyProducts().every(product =>
        product.publicPath.includes("/marina-del-rey/")
      )
    ).toBe(true);
    expect(sitemap).not.toContain("/destinations/california/rey/");
  });

  it("keeps terminal, unpriced, and unsupported-geography products out of the catalog", () => {
    const sitemap = readFileSync("public/sitemap-tours.xml", "utf8");
    const excluded = ["324799", "382848", "547525", "205984", "349518", "629071", "109487", "459584"];
    for (const itemId of excluded) {
      expect(getFareHarborProofByItemId(itemId), itemId).toBeNull();
      expect(sitemap, itemId).not.toContain(`-${itemId}<`);
    }
    expect(isStageBBookingPageNotFound("324799")).toBe(true);
    expect(isUnpublishedUnpricedFareHarborProduct("205984")).toBe(true);
    expect(isFareHarborGeographyReview("629071")).toBe(true);
    expect(isFareHarborGeographyReview("109487")).toBe(true);
    expect(isFareHarborGeographyReview("459584")).toBe(true);
    expect(sitemap).toContain(
      "/destinations/california/los-angeles/tours/california-coast-and-canyons-helicopter-tour-53931"
    );
    expect(sitemap).toContain(
      "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849"
    );
    expect(sitemap).toContain(
      "/destinations/massachusetts/boston/tours/boston-history-harbor-tour-aboard-yacht-patriot-657142"
    );
  });

  it("shows the same price and rating on the card, the page, and AggregateRating", () => {
    const samples = [
      californiaProducts.find(product => product.aggregateRating?.provider === "TripAdvisor")!,
      californiaProducts.find(product => product.aggregateRating?.provider === "Google")!,
      californiaProducts.find(product => product.aggregateRating == null)!,
    ];
    for (const product of samples) {
      const parts = routeParts(product.publicPath);
      const tour = getTourBySlugs(parts.stateSlug, parts.citySlug, parts.tourSlug);
      expect(tour, product.itemId).toBeTruthy();
      const card = renderRoute(
        product.publicPath,
        <TourCard tour={tour!} href={product.publicPath} />
      );
      const page = renderRoute(
        product.publicPath,
        <CityTourDetailRoute
          params={{
            stateSlug: parts.stateSlug,
            citySlug: parts.citySlug,
            tourSlug: parts.tourSlug,
          }}
        />
      );
      const header = page.slice(0, page.indexOf("What you’ll experience"));
      const price = fareHarborPriceLabel(product);
      expect(price, product.itemId).toBe(product.visiblePriceLabel);
      expect(card, product.itemId).toContain(price!);
      expect(header, product.itemId).toContain(price!);
      const graph = buildFareHarborProofSchemaGraph(product, {
        canonicalUrl: `https://www.alloutdooradventures.com${product.publicPath}`,
      });
      const parsed = JSON.parse(JSON.stringify(graph)) as {
        "@graph": Array<Record<string, unknown>>;
      };
      const productNodes = parsed["@graph"].filter(node =>
        typeNames(node["@type"]).includes("Product")
      );
      expect(
        fareHarborRatingParityErrors({
          proof: product,
          surfaces: [
            { name: "card", html: card },
            { name: "page", html: header },
            { name: "schema", aggregateRating: productNodes[0].aggregateRating },
          ],
        }),
        product.itemId
      ).toEqual([]);
      if (product.aggregateRating?.provider === "Google") {
        expect(card, product.itemId).toContain("· Google");
        expect(card, product.itemId).not.toContain("TripAdvisor");
      }
      if (product.aggregateRating?.provider === "TripAdvisor") {
        expect(card, product.itemId).toContain("· TripAdvisor");
        expect(card, product.itemId).not.toContain("· Google");
      }
    }
  });
});
