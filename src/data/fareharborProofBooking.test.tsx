import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import { getFareHarborProofProducts, getFareHarborProofByPath } from "./fareharborLeadToGoldProof";
import { getFareHarborProofBookingUrl } from "./fareharborProofBooking";
import { getProofBackedFareHarborTourByCanonicalPath } from "../engine6/legacyFh/registry";
import CityTourBookingRoute from "../pages/destinations/states/tours/CityTourBookingRoute";

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
