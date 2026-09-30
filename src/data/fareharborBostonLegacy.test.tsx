import type { ReactNode } from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Router } from "wouter";

import CityTourDetailRoute from "../pages/destinations/states/tours/CityTourDetailRoute";
import { getTourBySlugs, tours } from "./tours";
import {
  FAREHARBOR_PROOF_PRIMARY_CTA_LABEL,
  getFareHarborBostonLegacyProducts,
  getFareHarborProofByItemId,
  getFareHarborProofFromTour,
} from "./fareharborLeadToGoldProof";
import { isStageBBookingPageNotFound } from "../utils/fareharbor/stageBTerminalBookingPages";
import { isHardDeletedLegacyTour } from "../utils/tours/hardDeleteLegacyTours";
import { isRemovedTourSlug } from "../utils/tours/isTourRemoved";
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
    expect(products).toHaveLength(222);
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
    expect(priced).toHaveLength(103);
    expect(unpriced).toHaveLength(119);
    for (const product of priced) {
      expect(product.offer?.price).toBeTruthy();
      expect(product.visiblePriceLabel).toMatch(/^From /);
      expect(product.offer?.price).not.toBe("129.00");
    }
    for (const product of unpriced) {
      expect(product.offer).toBeNull();
      expect(product.visiblePriceLabel).toBeNull();
    }
    expect(JSON.stringify(products)).not.toContain("InStock");
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
});
