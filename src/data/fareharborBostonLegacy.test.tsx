import type { ReactNode } from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Router } from "wouter";

import CityTourDetailRoute from "../pages/destinations/states/tours/CityTourDetailRoute";
import { getTourBySlugs, tours } from "./tours";
import {
  FAREHARBOR_PROOF_PRIMARY_CTA_LABEL,
  applyFareHarborProofDestination,
  buildFareHarborProofSchemaGraph,
  collectFareHarborMigratedRoutePaths,
  getFareHarborBostonLegacyProducts,
  getFareHarborProofByItemId,
  getFareHarborProofByPath,
  getFareHarborProofFromTour,
  getFareHarborProofProducts,
} from "./fareharborLeadToGoldProof";
import { isStageBBookingPageNotFound } from "../utils/fareharbor/stageBTerminalBookingPages";
import { isHardDeletedLegacyTour } from "../utils/tours/hardDeleteLegacyTours";
import { isRemovedTourSlug } from "../utils/tours/isTourRemoved";
import { isFareHarborGeographyReview } from "../utils/fareharbor/geographyReview";
import { ENGINE6_BOSTON_3037DUCK_ROUTE } from "../engine6/routes";

vi.mock("../components/StructuredDataProvider", () => ({
  useStructuredData: () => undefined,
}));

const BOSTON_TERMINALS = [
  {
    itemId: "481940",
    slug: "protest-to-freedom-boston-black-heritage-tour-481940",
  },
  {
    itemId: "481941",
    slug: "the-protest-to-freedom-walking-tour-481941",
  },
  {
    itemId: "677691",
    slug: "boston-small-group-freedom-trail-walking-tour-677691",
  },
  {
    itemId: "677692",
    slug: "boston-highlights-private-walking-tour-677692",
  },
  {
    itemId: "379532",
    slug: "boston-harbor-cruise-byob---legacy-motor-yacht-379532",
  },
  {
    itemId: "463302",
    slug: "nubian-square-walking-tour-463302",
  },
  {
    itemId: "288303",
    slug: "full-moon-paddle---charles-river-boston-288303",
  },
  {
    itemId: "361872",
    slug: "the-bostoner-cannabis-and-cannoli-tour-361872",
  },
] as const;

const renderRoute = (path: string, node: ReactNode) =>
  renderToStaticMarkup(
    <Router hook={() => [path, () => undefined]}>{node}</Router>
  );

describe("FareHarbor Stage C Boston legacy tranche", () => {
  it("migrates the active Boston set through the shared proof lookup", () => {
    const products = getFareHarborBostonLegacyProducts();
    expect(products).toHaveLength(221);
    expect(
      products.every(product => product.aggregateRating === null)
    ).toBe(true);
    expect(
      products.every(
        product => product.exceptionStatus !== "BOOKING_PAGE_NOT_FOUND"
      )
    ).toBe(true);
    const priced = products.filter(product => product.exceptionStatus === "OK");
    const unpriced = products.filter(
      product => product.exceptionStatus === "PRICE_NOT_FOUND"
    );
    const insufficient = products.filter(
      product => product.exceptionStatus === "INSUFFICIENT_SOURCE_CONTENT"
    );
    expect(priced).toHaveLength(93);
    expect(unpriced).toHaveLength(108);
    expect(insufficient).toHaveLength(20);
    for (const product of priced) {
      expect(product.offer?.price).toBeTruthy();
      expect(product.visiblePriceLabel).toMatch(/^From /);
      expect(product.offer?.price).not.toBe("129.00");
    }
    for (const product of [...unpriced, ...insufficient]) {
      expect(product.offer).toBeNull();
      expect(product.visiblePriceLabel).toBeNull();
    }
    expect(JSON.stringify(products)).not.toContain("InStock");
    const sitemap = readFileSync("public/sitemap-tours.xml", "utf8");
    const inventory = new Set(collectFareHarborMigratedRoutePaths());
    for (const product of products) {
      expect(inventory.has(product.publicPath)).toBe(true);
      const parts = product.publicPath.split("/").filter(Boolean);
      const stateSlug = parts[1];
      const citySlug = parts[2];
      const slug = parts[4];
      expect(slug).toBeTruthy();
      expect(getTourBySlugs(stateSlug, citySlug, slug)).toMatchObject({
        slug,
        destination: { stateSlug, citySlug },
      });
      expect(sitemap).toContain(product.publicPath);
    }
    expect(
      tours.filter(
        tour =>
          tour.destination.citySlug === "boston" &&
          tour.slug === "adventures-at-sea-455620"
      )
    ).toHaveLength(0);
  });

  it("removes terminal Boston booking pages from public surfaces", () => {
    const sitemap = readFileSync("public/sitemap-tours.xml", "utf8");
    const merchantFeed = readFileSync("data/merchantFeed.csv", "utf8");
    for (const item of BOSTON_TERMINALS) {
      const path = `/destinations/massachusetts/boston/tours/${item.slug}`;
      expect(isStageBBookingPageNotFound(item.itemId)).toBe(true);
      expect(isRemovedTourSlug(item.slug)).toBe(true);
      expect(
        isHardDeletedLegacyTour({
          productId: item.itemId,
          slug: item.slug,
          canonicalPath: path,
        })
      ).toBe(true);
      expect(
        getTourBySlugs("massachusetts", "boston", item.slug)
      ).toBeUndefined();
      expect(getFareHarborProofByItemId(item.itemId)).toBeNull();
      expect(sitemap).not.toContain(item.itemId);
      expect(merchantFeed).not.toContain(item.itemId);
    }
  });

  it("renders a priced Boston page with Check availability and the facts panel", () => {
    const proof = getFareHarborProofByItemId("27344");
    expect(proof?.exceptionStatus).toBe("OK");
    expect(proof?.meetingLocation).toMatch(/Atlantic/);
    const html = renderRoute(
      "/destinations/massachusetts/boston/tours/city-view-tour-27344",
      <CityTourDetailRoute
        params={{
          stateSlug: "massachusetts",
          citySlug: "boston",
          tourSlug: "city-view-tour-27344",
        }}
      />
    );
    expect(html).toContain(FAREHARBOR_PROOF_PRIMARY_CTA_LABEL);
    expect(html).toContain("fareharbor-proof-facts");
    expect(html).toContain("Meeting point");
    expect(html).toContain(proof!.meetingLocation);
    expect(html).toContain(proof!.visiblePriceLabel);
    expect(html).not.toContain(">BOOK<");
    expect(html).not.toContain("From $129");
    const experienceStart = Math.max(
      html.indexOf("What you’ll experience"),
      html.indexOf("What you'll experience")
    );
    const factsAt = html.indexOf('data-testid="fareharbor-proof-facts"');
    const body = html.slice(experienceStart, factsAt);
    expect(body).toContain("Urban Adventours");
    expect(body).not.toContain("keeps the logistics simple");
    expect(body).not.toContain("103 Atlantic");
    expect(body).not.toContain("facts panel");
    expect(body).not.toContain("Guest ratings are omitted");
    expect(body).not.toContain("promotional inclusion");
    expect(body).not.toMatch(/\$\d/);
  });

  it("keeps PRICE_NOT_FOUND Boston pages unpriced and leaves Engine 6 Boston Viator alone", () => {
    const proof = getFareHarborProofByItemId("482166");
    expect(proof?.exceptionStatus).toBe("PRICE_NOT_FOUND");
    expect(proof?.offer).toBeNull();
    expect(
      getFareHarborProofFromTour({ slug: "boston-duck-tour-3037DUCK" })
    ).toBeNull();
    expect(ENGINE6_BOSTON_3037DUCK_ROUTE).toContain("3037DUCK");
    expect(
      tours.some(tour => tour.slug === "boston-duck-tour-3037DUCK")
    ).toBe(true);
    expect(getFareHarborProofByItemId("145208")?.offer?.price).toBe("59.95");
  });

  it("uses the shared proof record as the Product/TouristTrip schema source", () => {
    const products = getFareHarborBostonLegacyProducts();
    let withOffer = 0;
    let withoutOffer = 0;
    for (const product of products) {
      expect(getFareHarborProofByPath(product.publicPath)?.itemId).toBe(
        product.itemId
      );
      const canonicalUrl = `https://www.alloutdooradventures.com${product.publicPath}`;
      const graph = buildFareHarborProofSchemaGraph(product, { canonicalUrl });
      const serialized = JSON.stringify(graph);
      const productNode = graph["@graph"].find(node => node["@type"] === "Product");
      const tripNode = graph["@graph"].find(
        node => node["@type"] === "TouristTrip"
      );
      expect(productNode).toMatchObject({
        url: canonicalUrl,
        name: product.title,
        description: product.schemaDescription,
      });
      expect(tripNode).toMatchObject({
        name: product.title,
        description: product.schemaDescription,
      });
      expect(serialized).not.toContain("129.00");
      expect(serialized).not.toContain("InStock");
      expect(serialized).not.toContain("AggregateRating");
      if (product.offer) {
        expect(product.offer.price).toBeTruthy();
        expect(productNode?.offers).toMatchObject({
          "@type": "Offer",
          price: product.offer.price,
          priceCurrency: product.offer.priceCurrency,
        });
        expect(tripNode?.offers).toMatchObject({
          "@type": "Offer",
          price: product.offer.price,
          priceCurrency: product.offer.priceCurrency,
        });
        withOffer += 1;
      } else {
        expect(product.offer).toBeNull();
        expect(productNode?.offers).toBeUndefined();
        expect(tripNode?.offers).toBeUndefined();
        withoutOffer += 1;
      }
    }
    expect(withOffer).toBe(93);
    expect(withoutOffer).toBe(128);
    for (const item of BOSTON_TERMINALS) {
      expect(
        getFareHarborProofByPath(
          `/destinations/massachusetts/boston/tours/${item.slug}`
        )
      ).toBeNull();
    }
    expect(
      getFareHarborProofByPath(
        "/destinations/massachusetts/boston/tours/boston-duck-tour-3037DUCK"
      )
    ).toBeNull();
  });

  it("excludes Hardwick Vermont from Boston and moves Portland Maine", () => {
    expect(getFareHarborProofByItemId("73240")).toBeNull();
    expect(isFareHarborGeographyReview("73240")).toBe(true);
    expect(isRemovedTourSlug("wheels-in-the-woods-73240")).toBe(true);
    expect(
      getTourBySlugs("massachusetts", "boston", "wheels-in-the-woods-73240")
    ).toBeUndefined();
    expect(
      getTourBySlugs("vermont", "hardwick", "wheels-in-the-woods-73240")
    ).toBeUndefined();

    const portland = getFareHarborProofByItemId("448094");
    expect(portland?.publicPath).toBe(
      "/destinations/maine/portland/tours/portland-maine-highlights-448094"
    );
    expect(portland?.paragraphs.join(" ")).toContain("Portland, Maine");
    expect(portland?.paragraphs.join(" ")).not.toContain("takes place in Boston");
    expect(
      getTourBySlugs(
        "massachusetts",
        "boston",
        "portland-maine-highlights-448094"
      )
    ).toBeUndefined();
    expect(
      getTourBySlugs("maine", "portland", "portland-maine-highlights-448094")
    ).toMatchObject({
      slug: "portland-maine-highlights-448094",
      destination: { stateSlug: "maine", citySlug: "portland" },
    });
    expect(
      applyFareHarborProofDestination({
        id: "luxury-new-england-tours-448094",
        slug: "portland-maine-highlights-448094",
        bookingUrl:
          "https://fareharbor.com/embeds/book/bostonprivateguide/items/448094/",
        destination: {
          state: "Massachusetts",
          stateSlug: "massachusetts",
          city: "Boston",
          citySlug: "boston",
        },
      }).destination
    ).toMatchObject({ stateSlug: "maine", citySlug: "portland" });
  });

  it("rewrites Boston FareHarbor copy in guest-centered editorial voice", () => {
    const implementationPhrases = [
      "named places",
      "short route labels",
      "short listed inclusions",
      "published cancellation note",
      "source-backed",
      "facts panel",
      "product-level",
      "price not found",
      "listed operator",
      "takes place in",
      "this guided outing",
      "this harbor outing",
      "the guide leads in",
      "packing notes",
    ];
    const mechanical = [
      /\buses the\b/i,
      /\btakes in\b/i,
      /\bpoint(?:s|ing) out\b/i,
      /\bcontinues toward\b/i,
    ];
    for (const product of getFareHarborBostonLegacyProducts()) {
      const visible = [
        ...product.paragraphs,
        ...product.highlights,
        product.schemaDescription,
      ]
        .join(" ")
        .toLowerCase();
      for (const phrase of implementationPhrases) {
        expect(visible, `${product.itemId} ${phrase}`).not.toContain(phrase);
      }
      for (const pattern of mechanical) {
        expect(visible, `${product.itemId} ${pattern}`).not.toMatch(pattern);
      }
      expect(product.paragraphs.length).toBeGreaterThanOrEqual(1);
      expect(product.paragraphs.length).toBeLessThanOrEqual(4);
    }
    const cityView = getFareHarborProofByItemId("27344");
    expect(cityView?.paragraphs.join(" ")).toContain("Urban Adventours");
    expect(cityView?.paragraphs.join(" ")).toMatch(/pass|come into view|ride/i);
    expect(cityView?.exceptionStatus).toBe("OK");
    expect(getFareHarborProofByItemId("482166")?.exceptionStatus).toBe(
      "PRICE_NOT_FOUND"
    );
    const sunset = getFareHarborProofByItemId("26483");
    expect(sunset?.paragraphs.join(" ").toLowerCase()).not.toContain("uses the");
    expect(sunset?.paragraphs.join(" ").toLowerCase()).not.toContain("takes in");
    expect(sunset?.paragraphs.join(" ")).toMatch(/sail passes|come into view/i);
  });

  it("keeps customer-facing FareHarbor copy free of process commentary and heading fragments", () => {
    const processPhrases = [
      "facts panel",
      "guest ratings are omitted",
      "promotional inclusion lists are omitted",
      "promotional claims are omitted",
      "schema/pricing",
      "source-backed",
      "migration logic",
      "about nestled",
      "for this boston product",
    ];
    for (const product of getFareHarborProofProducts()) {
      const visible = [
        ...product.paragraphs,
        ...product.highlights,
        product.schemaDescription,
      ]
        .join(" ")
        .toLowerCase();
      for (const phrase of processPhrases) {
        expect(visible, `${product.itemId} ${phrase}`).not.toContain(phrase);
      }
    }
  });
});
