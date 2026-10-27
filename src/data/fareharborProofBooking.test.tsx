import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import { getFareHarborProofProducts, getFareHarborProofByPath } from "./fareharborLeadToGoldProof";
import { getFareHarborProofBookingUrl } from "./fareharborProofBooking";
import { getProofBackedFareHarborTourByCanonicalPath } from "../engine6/legacyFh/registry";
import CityTourBookingRoute from "../pages/destinations/states/tours/CityTourBookingRoute";
import CityTourDetailRoute from "../pages/destinations/states/tours/CityTourDetailRoute";
import { assertFareHarborGoldCtaIntegrity, assertEngine6CtaIntegrity } from "../engine6/hardening";

import {
  getAllRouteBackedTourEntries,
  getCityTourDetailPath,
  getTourDetailPath,
  getToursByCityUnified,
} from "./tours";
import { getFareHarborProofFromTour } from "./fareharborLeadToGoldProof";

const products = getFareHarborProofProducts();

describe("Lead-to-Gold FareHarbor link integrity across all locations", () => {
  it("gives every upgraded item a routable detail page and attributed checkout", () => {
    expect(products.length).toBeGreaterThan(100);
    const paths = new Set<string>();

    for (const product of products) {
      expect(paths.has(product.publicPath), `Duplicate: ${product.publicPath}`).toBe(false);
      paths.add(product.publicPath);
      expect(getFareHarborProofByPath(product.publicPath)?.itemId).toBe(product.itemId);

      const tour = getProofBackedFareHarborTourByCanonicalPath(product.publicPath);
      expect(tour, product.publicPath).not.toBeNull();
      expect(tour?.canonicalPath).toBe(product.publicPath);

      const booking = new URL(getFareHarborProofBookingUrl(product));
      expect(booking.protocol).toBe("https:");
      expect(booking.hostname).toBe("fareharbor.com");
      expect(booking.pathname).toBe(
        `/embeds/book/${product.company}/items/${product.itemId}/`
      );
      expect(booking.searchParams.get("asn")).toBe("fhdn");
      expect(booking.searchParams.get("asn-ref")).toBe("alloutdooradventures");
      expect(booking.searchParams.get("marketplace")).toBe("yes");
      expect(booking.searchParams.get("ref")).toBe("https://www.alloutdooradventures.com");
      expect(tour?.bookingUrl).toBe(booking.toString());
      expect(tour?.bookingUrl).not.toContain("/book?"); // Not AOA's old internal link
    }
  });

  it("links every promoted FareHarbor listing to its canonical built product page", () => {
    const routeEntries = getAllRouteBackedTourEntries();
    const upgraded = routeEntries.filter(
      entry =>
        entry.tour.bookingProvider === "fareharbor" &&
        Boolean(getFareHarborProofFromTour(entry.tour))
    );
    expect(upgraded.length).toBeGreaterThan(100);
    const locations = new Set<string>();

    for (const entry of upgraded) {
      const proof = getFareHarborProofFromTour(entry.tour)!;
      locations.add(`${entry.tour.destination.stateSlug}/${entry.tour.destination.citySlug}`);
      expect(entry.href, `Bad listing URL for ${proof.itemId}`).toBe(proof.publicPath);
      expect(getTourDetailPath(entry.tour)).toBe(proof.publicPath);
      expect(getCityTourDetailPath(entry.tour)).toBe(proof.publicPath);
    }
    console.log(
      `[Gold FH listing audit] ${upgraded.length} source cards in ${locations.size} locations have canonical destination URLs`
    );

    const sanDiegoEntries = getToursByCityUnified("california", "san-diego").filter(
      entry =>
        entry.tour.bookingProvider === "fareharbor" &&
        Boolean(getFareHarborProofFromTour(entry.tour))
    );
    expect(sanDiegoEntries.length).toBeGreaterThan(0);
    for (const entry of sanDiegoEntries) {
      expect(entry.href).toBe(getFareHarborProofFromTour(entry.tour)?.publicPath);
    }
  });

  it("validates every migrated checkout using FareHarbor rules without changing Viator strictness", () => {
    for (const product of products) {
      const tour = getProofBackedFareHarborTourByCanonicalPath(product.publicPath);
      expect(tour, product.publicPath).not.toBeNull();
      expect(() => assertFareHarborGoldCtaIntegrity({
        ctaOwner: tour!.ownership.ctaOwner,
        ctaUrl: tour!.bookingUrl,
      }), product.publicPath).not.toThrow();
    }
    expect(() => assertEngine6CtaIntegrity({
      ctaOwner: "fareharbor",
      ctaUrl: getFareHarborProofBookingUrl(products[0]),
    })).toThrow(/Viator CTA ownership/);
  });

  it("server-renders real Gold FareHarbor tour pages with clickable attributed booking links", () => {
    const sampleItemIds = ["439314", "145208", "181765"];
    for (const id of sampleItemIds) {
      const product = products.find(tour => tour.itemId === id);
      expect(product, id).toBeDefined();
      const fragments = product!.publicPath.split("/").filter(Boolean);
      const result = renderToString(
        <Router ssrPath={product!.publicPath}>
          <CityTourDetailRoute
            params={{
              stateSlug: fragments[1],
              citySlug: fragments[2],
              tourSlug: fragments[4],
            }}
          />
        </Router>
      );
      expect(result).not.toContain("Tour not found");
      expect(result).toContain("Check availability");
      expect(result).toContain(
        `fareharbor.com/embeds/book/${product!.company}/items/${id}/`
      );
    }
  });

  it("fixes the San Diego electric-bike example and its old /book deep link", () => {
    const path = "/destinations/california/san-diego/tours/private-san-diego-electric-bike-tour-439314";
    const product = getFareHarborProofByPath(path);
    expect(product?.company).toBe("unlimitedbiking");
    expect(product?.itemId).toBe("439314");

    const checkout = getFareHarborProofBookingUrl(product!);
    const result = renderToString(
      <Router ssrPath={`${path}/book`}>
        <CityTourBookingRoute
          params={{
            stateSlug: "california",
            citySlug: "san-diego",
            tourSlug: "private-san-diego-electric-bike-tour-439314",
          }}
        />
      </Router>
    );
    expect(result).toContain("Continue to FareHarbor");
    expect(result).toContain("unlimitedbiking/items/439314/");
    expect(result).not.toContain("Booking not found");
    expect(getProofBackedFareHarborTourByCanonicalPath(path)?.bookingUrl).toBe(checkout);
  });
});
