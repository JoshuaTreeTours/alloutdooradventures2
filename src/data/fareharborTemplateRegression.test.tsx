import { readFileSync } from "node:fs";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Router } from "wouter";

import FareHarborProductSummary from "../components/FareHarborProductSummary";
import FareHarborProofSnapshot from "../components/FareHarborProofSnapshot";
import TourCard from "../components/TourCard";
import CityTourDetailRoute from "../pages/destinations/states/tours/CityTourDetailRoute";
import { tours } from "./tours";
import {
  applyFareHarborProofToHtml,
  applyFareHarborProofToPrerender,
  buildFareHarborProofSchemaGraph,
  getFareHarborBostonLegacyProducts,
  getFareHarborProofFromTour,
  getFareHarborProofProducts,
} from "./fareharborLeadToGoldProof";
import {
  fareHarborPriceLabel,
  fareHarborRatingParityErrors,
  formatFareHarborRating,
} from "./fareharborPresentation";

vi.mock("../components/StructuredDataProvider", () => ({
  useStructuredData: () => undefined,
}));

const REUSABLE_TEMPLATE_FILES = [
  "src/components/FareHarborProductSummary.tsx",
  "src/components/FareHarborProofSnapshot.tsx",
  "src/components/TourCard.tsx",
  "src/data/fareharborPresentation.ts",
  "src/data/fareharborLeadToGoldProof.ts",
  "src/pages/destinations/states/tours/CityTourDetailRoute.tsx",
  "src/engine2/pages/Engine2TourPage.tsx",
  "scripts/apply-fareharbor-proof-schema.mjs",
];

const PILOT_ITEM_IDS = ["657142", "518095", "482166", "27344", "448094"];

const renderRoute = (path: string, node: ReactNode) =>
  renderToStaticMarkup(
    <Router hook={() => [path, () => undefined]}>{node}</Router>
  );

const typeNames = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(String) : value ? [String(value)] : [];

describe("FareHarbor Phase C template", () => {
  it("keeps city and pilot-product constants out of the reusable template", () => {
    for (const file of REUSABLE_TEMPLATE_FILES) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/citySlug\s*===?\s*["']boston["']/);
      expect(source, file).not.toMatch(/Boston,\s*Massachusetts/);
      for (const itemId of PILOT_ITEM_IDS) {
        expect(source, `${file} ${itemId}`).not.toContain(itemId);
      }
    }
  });

  it("registers city batches as data and keeps proof item ids unique", () => {
    const products = getFareHarborProofProducts();
    const ids = products.map(product => product.itemId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(getFareHarborBostonLegacyProducts()).toHaveLength(221);
    expect(products.length).toBeGreaterThan(221);
  });

  it("emits one Product graph and omits rating or price when the source has none", () => {
    const boston = getFareHarborBostonLegacyProducts();
    expect(boston.filter(product => product.aggregateRating)).toHaveLength(47);
    expect(boston.filter(product => product.offer)).toHaveLength(93);
    expect(boston.filter(product => !product.offer)).toHaveLength(128);

    for (const product of boston) {
      const graph = buildFareHarborProofSchemaGraph(product, {
        canonicalUrl: `https://www.alloutdooradventures.com${product.publicPath}`,
      });
      const serialized = JSON.stringify(graph);
      const parsed = JSON.parse(serialized) as {
        "@context": string;
        "@graph": Array<Record<string, unknown>>;
      };
      expect(parsed["@context"], product.itemId).toBe("https://schema.org");
      const productNodes = parsed["@graph"].filter(node =>
        typeNames(node["@type"]).includes("Product")
      );
      const tripNodes = parsed["@graph"].filter(node =>
        typeNames(node["@type"]).includes("TouristTrip")
      );
      expect(productNodes, product.itemId).toHaveLength(1);
      expect(tripNodes, product.itemId).toHaveLength(1);
      const ratingHosts = parsed["@graph"].filter(
        node => node.aggregateRating != null
      );
      if (product.aggregateRating) {
        expect(ratingHosts, product.itemId).toHaveLength(1);
        expect(typeNames(ratingHosts[0]["@type"]), product.itemId).toContain(
          "Product"
        );
        expect(productNodes[0].aggregateRating, product.itemId).toMatchObject({
          "@type": "AggregateRating",
          ratingValue: product.aggregateRating.ratingValue,
          reviewCount: product.aggregateRating.reviewCount,
          author: { "@type": "Organization", name: "TripAdvisor" },
        });
        expect(tripNodes[0].aggregateRating, product.itemId).toBeUndefined();
      } else {
        expect(serialized, product.itemId).not.toContain("AggregateRating");
      }
      if (product.offer) {
        expect(productNodes[0].offers, product.itemId).toMatchObject({
          "@type": "Offer",
          price: product.offer.price,
          priceCurrency: product.offer.priceCurrency,
        });
      } else {
        expect(productNodes[0].offers, product.itemId).toBeUndefined();
      }
      expect(productNodes[0].description, product.itemId).toBe(
        product.schemaDescription
      );
      expect(serialized, product.itemId).not.toContain("129.00");
      expect(serialized, product.itemId).not.toContain("InStock");
      expect(
        fareHarborRatingParityErrors({
          proof: product,
          surfaces: [
            { name: "schema", aggregateRating: productNodes[0].aggregateRating },
          ],
        }),
        product.itemId
      ).toEqual([]);
    }
  });

  it("uses the same source fields on the card and the product page", () => {
    const cases = [
      {
        itemId: "657142",
        slug: "boston-history-harbor-tour-aboard-yacht-patriot-657142",
        rated: true,
        priced: true,
      },
      {
        itemId: "518095",
        slug: "half-day-driving-tour-of-boston-and-cambridge-518095",
        rated: false,
        priced: true,
      },
      {
        itemId: "482166",
        slug: "holiday-harbor-cruise-482166",
        rated: true,
        priced: false,
      },
    ] as const;
    for (const sample of cases) {
      const product = getFareHarborBostonLegacyProducts().find(
        entry => entry.itemId === sample.itemId
      )!;
      const tour = tours.find(entry => entry.slug === sample.slug)!;
      const card = renderRoute(
        product.publicPath,
        <TourCard tour={tour} href={product.publicPath} />
      );
      const page = renderRoute(
        product.publicPath,
        <CityTourDetailRoute
          params={{
            stateSlug: "massachusetts",
            citySlug: "boston",
            tourSlug: sample.slug,
          }}
        />
      );
      const header = page.slice(0, page.indexOf("What you’ll experience"));
      expect(card, sample.itemId).toContain(product.schemaDescription);
      expect(header, sample.itemId).toContain(product.schemaDescription);
      const price = fareHarborPriceLabel(product);
      if (sample.priced) {
        expect(price, sample.itemId).toBeTruthy();
        expect(card, sample.itemId).toContain(price!);
        expect(header, sample.itemId).toContain(price!);
      } else {
        expect(card, sample.itemId).not.toContain('data-testid="fareharbor-price"');
        expect(header, sample.itemId).not.toContain('data-testid="fareharbor-price"');
      }
      if (sample.rated) {
        const formatted = formatFareHarborRating(product.aggregateRating!);
        expect(card, sample.itemId).toContain(formatted);
        expect(header, sample.itemId).toContain(formatted);
      } else {
        expect(card, sample.itemId).not.toContain("fareharbor-rating");
        expect(header, sample.itemId).not.toContain("fareharbor-rating");
        expect(header, sample.itemId).not.toContain("★");
      }
      if (product.durationLabel) {
        expect(page, sample.itemId).toContain(product.durationLabel);
      }
      if (product.meetingLocation) {
        expect(page, sample.itemId).toContain(product.meetingLocation);
      }
      const prerender = applyFareHarborProofToPrerender(
        { description: "catalog description that must not win" },
        {
          "@graph": [
            {
              "@type": "WebPage",
              description: "catalog description that must not win",
            },
            {
              "@type": "Product",
              description: "catalog description that must not win",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: 3,
                reviewCount: 42,
              },
              offers: { "@type": "Offer", price: "129.00", priceCurrency: "USD" },
            },
          ],
        },
        tour
      );
      expect(prerender.seo.description, sample.itemId).toBe(
        product.schemaDescription
      );
      const html = applyFareHarborProofToHtml(
        `<meta name="description" content="catalog description that must not win" />
<meta property="og:description" content="catalog description that must not win" />
<script type="application/ld+json">${JSON.stringify(prerender.structuredData)}</script>`,
        product
      );
      const escapedDescription = product.schemaDescription
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
      expect(html, sample.itemId).toContain(`content="${escapedDescription}"`);
      const json = html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
      )?.[1];
      expect(json, sample.itemId).toBeTruthy();
      const parsed = JSON.parse(json!);
      const productNode = parsed["@graph"].find(
        (node: { "@type"?: string }) => node["@type"] === "Product"
      );
      expect(
        parsed["@graph"].filter(
          (node: { "@type"?: string }) => node["@type"] === "Product"
        )
      ).toHaveLength(1);
      if (product.aggregateRating) {
        expect(productNode.aggregateRating.ratingValue).toBe(
          product.aggregateRating.ratingValue
        );
        expect(productNode.aggregateRating.reviewCount).toBe(
          product.aggregateRating.reviewCount
        );
      } else {
        expect(productNode.aggregateRating).toBeUndefined();
        expect(json).not.toContain("AggregateRating");
      }
    }
  });

  it("omits an empty facts panel and does not invent a rating or price", () => {
    const proof = {
      ...getFareHarborBostonLegacyProducts()[0],
      aggregateRating: null,
      visiblePriceLabel: null,
      offer: null,
      durationLabel: null,
      meetingLocation: null,
      priceRows: [],
      pricingNotes: [],
    };
    const summary = renderToStaticMarkup(
      <FareHarborProductSummary proof={proof} tone="hero" />
    );
    const facts = renderToStaticMarkup(
      <FareHarborProofSnapshot proof={proof} />
    );
    expect(summary).not.toContain("fareharbor-rating");
    expect(summary).not.toContain("fareharbor-price");
    expect(summary).not.toContain("★");
    expect(facts).toBe("");
  });

  it("leaves Viator product cards on their own rating path", () => {
    const tour = tours.find(entry => entry.slug === "boston-duck-tour-3037DUCK");
    expect(tour).toBeTruthy();
    expect(getFareHarborProofFromTour(tour)).toBeNull();
    const card = renderRoute(
      "/destinations/massachusetts/boston/tours/boston-duck-tour-3037DUCK",
      <TourCard
        tour={tour!}
        href="/destinations/massachusetts/boston/tours/boston-duck-tour-3037DUCK"
      />
    );
    expect(card).not.toContain("fareharbor-rating");
    expect(card).not.toContain("data-rating-provider");
    expect(card).not.toContain("fareharbor-product-summary");
  });
});
