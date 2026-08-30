import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import TourCard from "../components/TourCard";
import { getToursByCityUnified } from "../data/tours";
import { formatStartingPrice } from "../lib/pricing";
import {
  parseMerchantPriceCurrency,
  parsePrice,
} from "../utils/merchantPricing";
import { engine6ListingTours } from "./listing";
import { mergeEngine6LiveFieldsIntoTour } from "./liveProductFields";
import type { MerchantFeedCommercialSnapshot } from "./merchantFeedCommercialSnapshot";
import {
  OSAKA_VIATOR_PUBLIC_PRODUCT_CODES,
  OSAKA_VIATOR_PUBLIC_USD_FROM_PRICES,
} from "./osakaViatorPublicRatings";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const snapshot = JSON.parse(
  readFileSync("data/merchantFeed-commercial-snapshot.json", "utf8")
) as MerchantFeedCommercialSnapshot;

const readMerchantFeedPrices = () => {
  const content = readFileSync("data/merchantFeed.csv", "utf8");
  const rows = new Map<string, string>();
  for (const line of content.split(/\r?\n/).filter(Boolean).slice(1)) {
    const id = line.split(",")[0];
    const match = line.match(/,in stock,([^,]+),new,/);
    if (id && match?.[1]) {
      rows.set(id, match[1]);
    }
  }
  return rows;
};

describe("Osaka Engine6 commercial USD listing prices", () => {
  const merchantPrices = readMerchantFeedPrices();

  it("covers all selected Osaka products with USD merchant-feed snapshot rows", () => {
    const snapshotByCode = new Map(
      snapshot.rows.map(row => [row.productCode, row])
    );

    OSAKA_VIATOR_PUBLIC_PRODUCT_CODES.forEach(productCode => {
      const row = snapshotByCode.get(productCode);
      expect(row, productCode).toBeDefined();
      expect(parseMerchantPriceCurrency(row!.price)).toBe("USD");
      expect(row!.price).toBe(merchantPrices.get(productCode));
    });
  });

  it("does not render a local-currency amount as USD for any Osaka listing", () => {
    const osakaListing = engine6ListingTours.filter(
      tour =>
        tour.destination.stateSlug === "japan" &&
        tour.destination.citySlug === "osaka"
    );

    osakaListing.forEach(tour => {
      const expectedUsd = OSAKA_VIATOR_PUBLIC_USD_FROM_PRICES[tour.productCode];
      expect(expectedUsd, tour.productCode).toBeDefined();
      expect(tour.currency).toBe("USD");
      expect(tour.startingPrice).toBeCloseTo(expectedUsd, 2);
      expect(tour.startingPrice).toBeLessThan(1000);
    });
  });

  it("rejects a JPY 16,500 live hydration as a USD listing price", () => {
    const listing = getToursByCityUnified("japan", "osaka").find(
      entry => entry.tour.productCode === "92136P45"
    );
    expect(listing).toBeDefined();
    expect(listing!.tour.startingPrice).toBeCloseTo(106.77, 2);

    const merged = mergeEngine6LiveFieldsIntoTour(listing!.tour, {
      priceAmount: 16500,
      priceFormatted: "From $16,500.00",
      priceCurrency: "JPY",
      aggregateRating: 4.9,
      reviewCount: 300,
      durationText: "4 hours",
    });

    expect(merged.currency).toBe("USD");
    expect(merged.startingPrice).toBeCloseTo(106.77, 2);
    expect(merged.startingPrice).toBeLessThan(250);
    expect(merged.startingPrice).not.toBe(16500);
  });

  it.each(OSAKA_VIATOR_PUBLIC_PRODUCT_CODES)(
    "lists %s with the USD merchant-feed commercial price",
    productCode => {
      const feedPrice = parsePrice(merchantPrices.get(productCode));
      const listing = getToursByCityUnified("japan", "osaka").find(
        entry => entry.tour.productCode === productCode
      );

      expect(feedPrice).toBeGreaterThan(0);
      expect(listing).toBeDefined();
      expect(listing!.tour.currency).toBe("USD");
      expect(listing!.tour.startingPrice).toBeCloseTo(feedPrice!, 2);

      const html = renderToString(
        <TourCard tour={listing!.tour} href={listing!.href} />
      ).replace(/<!-- -->/g, "");
      expect(html).toContain(`From ${formatStartingPrice(feedPrice!, "USD")}`);
      expect(html).not.toMatch(/¥|JPY|€|£|Rp|IDR|฿|THB/);
    }
  );
});
