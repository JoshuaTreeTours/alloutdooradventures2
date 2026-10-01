import type { ReactNode } from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Router } from "wouter";

import FareHarborProductSummary from "../components/FareHarborProductSummary";
import TourCard from "../components/TourCard";
import CityTourDetailRoute from "../pages/destinations/states/tours/CityTourDetailRoute";
import { getTourBySlugs, tours } from "./tours";
import {
  fareHarborPriceLabel,
  fareHarborRatingParityErrors,
  fareHarborShortDescription,
  fareHarborShortDescriptionRepeatsExperience,
  formatFareHarborRating,
} from "./fareharborPresentation";
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
    const patriot = products.find(product => product.itemId === "657142");
    expect(patriot?.aggregateRating).toEqual({
      ratingValue: 4.7,
      reviewCount: 1645,
      provider: "TripAdvisor",
    });
    for (const product of products) {
      if (!product.aggregateRating) {
        continue;
      }
      expect(product.aggregateRating.provider, product.itemId).toBe(
        "TripAdvisor"
      );
      expect(product.aggregateRating.ratingValue, product.itemId).toBeGreaterThan(
        0
      );
      expect(
        product.aggregateRating.ratingValue,
        product.itemId
      ).toBeLessThanOrEqual(5);
      expect(
        Number.isInteger(product.aggregateRating.reviewCount),
        product.itemId
      ).toBe(true);
      expect(product.aggregateRating.reviewCount, product.itemId).toBeGreaterThan(
        0
      );
    }
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
      if (!product.aggregateRating) {
        expect(serialized, product.itemId).not.toContain("AggregateRating");
      } else {
        expect(productNode?.aggregateRating, product.itemId).toMatchObject({
          "@type": "AggregateRating",
          ratingValue: product.aggregateRating.ratingValue,
          reviewCount: product.aggregateRating.reviewCount,
          author: { "@type": "Organization", name: "TripAdvisor" },
        });
      }
      expect(
        fareHarborRatingParityErrors({
          proof: product,
          surfaces: [
            {
              name: "schema",
              aggregateRating: productNode?.aggregateRating,
            },
          ],
        }),
        product.itemId
      ).toEqual([]);
      expect(tripNode?.aggregateRating).toBeUndefined();
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

  it("presents Boston price and FareHarbor ratings consistently on cards and product pages", () => {
    const decode = (html: string) =>
      html
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
    const products = getFareHarborBostonLegacyProducts();
    let withPrice = 0;
    let withoutPrice = 0;
    let withRating = 0;
    for (const product of products) {
      const parts = product.publicPath.split("/").filter(Boolean);
      const tour = getTourBySlugs(parts[1], parts[2], parts[4]);
      expect(tour, product.itemId).toBeTruthy();
      const cardHtml = renderRoute(
        product.publicPath,
        <TourCard tour={tour!} href={product.publicPath} />
      );
      const summaryHtml = renderToStaticMarkup(
        <FareHarborProductSummary
          proof={product}
          tone="hero"
          showShortDescription={
            !fareHarborShortDescriptionRepeatsExperience(product)
          }
        />
      );
      const graph = buildFareHarborProofSchemaGraph(product, {
        canonicalUrl: `https://www.alloutdooradventures.com${product.publicPath}`,
      });
      const productNode = graph["@graph"].find(
        node => node["@type"] === "Product"
      );
      expect(
        fareHarborRatingParityErrors({
          proof: product,
          surfaces: [
            { name: "card", html: cardHtml },
            { name: "product page", html: summaryHtml },
            { name: "schema", aggregateRating: productNode?.aggregateRating },
          ],
        }),
        product.itemId
      ).toEqual([]);
      const cardText = decode(cardHtml);
      const shortDescription = fareHarborShortDescription(product);
      expect(shortDescription.length, product.itemId).toBeGreaterThan(0);
      expect(shortDescription.toLowerCase(), product.itemId).not.toBe(
        product.title.trim().toLowerCase()
      );
      expect(shortDescription.endsWith("…"), product.itemId).toBe(false);
      expect(cardText, product.itemId).toContain(product.title);
      expect(cardText, product.itemId).toContain(shortDescription);
      expect(cardText, product.itemId).toContain(
        `${tour!.destination.city}, ${tour!.destination.state}`
      );
      expect(cardHtml, product.itemId).toMatch(/View (?:Tour|Rental)/);
      expect(cardHtml, product.itemId).toContain(
        'data-testid="tour-card-category"'
      );
      expect(cardHtml, product.itemId).toContain("data-card-image-src=");
      if (tour!.heroImage) {
        expect(cardHtml, product.itemId).toContain(tour!.heroImage);
      }
      expect(cardHtml, product.itemId).not.toContain("keeps the logistics simple");
      if (
        !product.aggregateRating ||
        product.aggregateRating.reviewCount !== tour!.badges.reviewCount
      ) {
        expect(cardHtml, product.itemId).not.toContain(
          `${tour!.badges.reviewCount.toLocaleString("en-US")} reviews`
        );
      }
      if (product.aggregateRating) {
        expect(cardHtml, product.itemId).toContain("· TripAdvisor");
      } else {
        expect(cardHtml, product.itemId).not.toContain("★");
        expect(cardHtml, product.itemId).not.toContain("TripAdvisor");
      }
      const price = fareHarborPriceLabel(product);
      if (price) {
        withPrice += 1;
        expect(cardHtml, product.itemId).toContain(price);
        expect(cardHtml, product.itemId).not.toContain(`From ${price}`);
      } else {
        withoutPrice += 1;
        expect(cardHtml, product.itemId).not.toContain(
          'data-testid="fareharbor-price"'
        );
        expect(cardText, product.itemId).not.toMatch(/From \$/);
      }
      if (product.aggregateRating) {
        withRating += 1;
      }
    }
    expect(withPrice).toBe(93);
    expect(withoutPrice).toBe(128);
    expect(withRating).toBe(47);

    const priced = getFareHarborProofByItemId("518095");
    const unpriced = getFareHarborProofByItemId("482166");
    expect(priced?.visiblePriceLabel).toBe("From $620.10");
    expect(unpriced?.visiblePriceLabel).toBeNull();
    const pricedPage = renderRoute(
      priced!.publicPath,
      <CityTourDetailRoute
        params={{
          stateSlug: "massachusetts",
          citySlug: "boston",
          tourSlug: "half-day-driving-tour-of-boston-and-cambridge-518095",
        }}
      />
    );
    const pricedHeader = pricedPage.slice(
      0,
      pricedPage.indexOf("What you’ll experience")
    );
    expect(decode(pricedHeader)).toContain(fareHarborShortDescription(priced!));
    expect(pricedHeader).toContain("From $620.10");
    if (priced?.aggregateRating) {
      expect(pricedHeader).toContain("· TripAdvisor");
      expect(pricedHeader).toContain(
        `(${priced.aggregateRating.reviewCount.toLocaleString("en-US")} reviews)`
      );
    } else {
      expect(pricedHeader).not.toContain("fareharbor-rating");
      expect(pricedHeader).not.toContain("★");
    }
    expect(pricedHeader).not.toContain("(1,080 reviews)");
    expect(pricedHeader).not.toContain("★ 4.3");
    expect(decode(pricedPage)).toContain(priced!.paragraphs[2]);
    expect(fareHarborShortDescription(priced!)).not.toBe(
      priced!.paragraphs.join(" ")
    );

    const unpricedPage = renderRoute(
      unpriced!.publicPath,
      <CityTourDetailRoute
        params={{
          stateSlug: "massachusetts",
          citySlug: "boston",
          tourSlug: "holiday-harbor-cruise-482166",
        }}
      />
    );
    const unpricedHeader = unpricedPage.slice(
      0,
      unpricedPage.indexOf("What you’ll experience")
    );
    expect(decode(unpricedHeader)).toContain(
      fareHarborShortDescription(unpriced!)
    );
    expect(unpricedHeader).not.toContain('data-testid="fareharbor-price"');
    expect(unpricedHeader).not.toContain("From $");
    if (unpriced?.aggregateRating) {
      expect(unpricedHeader).toContain("· TripAdvisor");
    } else {
      expect(unpricedHeader).not.toContain("★");
    }
    expect(decode(unpricedPage)).toContain(unpriced!.paragraphs[0]);
  }, 120000);

  it("shows the FareHarbor TripAdvisor rating for the Yacht Patriot tour and not the catalog badge", () => {
    const product = getFareHarborProofByItemId("657142");
    expect(product?.aggregateRating).toEqual({
      ratingValue: 4.7,
      reviewCount: 1645,
      provider: "TripAdvisor",
    });
    const tour = tours.find(
      entry =>
        entry.slug === "boston-history-harbor-tour-aboard-yacht-patriot-657142"
    );
    expect(tour?.badges.rating).toBe(3);
    expect(tour?.badges.reviewCount).toBe(42);
    const card = renderRoute(
      product!.publicPath,
      <TourCard tour={tour!} href={product!.publicPath} />
    );
    const page = renderRoute(
      product!.publicPath,
      <CityTourDetailRoute
        params={{
          stateSlug: "massachusetts",
          citySlug: "boston",
          tourSlug: "boston-history-harbor-tour-aboard-yacht-patriot-657142",
        }}
      />
    );
    const header = page.slice(0, page.indexOf("What you’ll experience"));
    const formatted = formatFareHarborRating(product!.aggregateRating!);
    expect(card).toContain(formatted);
    expect(header).toContain(formatted);
    expect(card).not.toContain("(42 reviews)");
    expect(header).not.toContain("(42 reviews)");
    expect(card).not.toContain("★ 3.0");
    expect(header).not.toContain("★ 3.0");
    const graph = buildFareHarborProofSchemaGraph(product!, {
      canonicalUrl: `https://www.alloutdooradventures.com${product!.publicPath}`,
    });
    const productNode = graph["@graph"].find(node => node["@type"] === "Product");
    const tripNode = graph["@graph"].find(
      node => node["@type"] === "TouristTrip"
    );
    expect(productNode?.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: 4.7,
      reviewCount: 1645,
      bestRating: 5,
      worstRating: 1,
      author: { "@type": "Organization", name: "TripAdvisor" },
    });
    expect(tripNode?.aggregateRating).toBeUndefined();
    expect(JSON.stringify(graph)).not.toContain('"reviewCount":42');
    expect(JSON.stringify(graph)).not.toContain('"ratingValue":3');
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
