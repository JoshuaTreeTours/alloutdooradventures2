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
  SYDNEY_VIATOR_PUBLIC_PRODUCT_CODES,
  SYDNEY_VIATOR_PUBLIC_USD_FROM_PRICES,
} from "./sydneyViatorPublicRatings";

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

describe("Sydney Engine6 commercial USD listing prices", () => {
  const merchantPrices = readMerchantFeedPrices();

  it("covers all selected Sydney products with USD merchant-feed snapshot rows", () => {
    const snapshotByCode = new Map(
      snapshot.rows.map(row => [row.productCode, row])
    );

    SYDNEY_VIATOR_PUBLIC_PRODUCT_CODES.forEach(productCode => {
      const row = snapshotByCode.get(productCode);
      expect(row, productCode).toBeDefined();
      expect(parseMerchantPriceCurrency(row!.price)).toBe("USD");
      expect(row!.price).toBe(merchantPrices.get(productCode));
    });
  });

  it("does not render a local-currency amount as USD for any Sydney listing", () => {
    const sydneyListing = engine6ListingTours.filter(
      tour =>
        tour.destination.stateSlug === "australia" &&
        tour.destination.citySlug === "sydney"
    );

    sydneyListing.forEach(tour => {
      const expectedUsd = SYDNEY_VIATOR_PUBLIC_USD_FROM_PRICES[tour.productCode];
      expect(expectedUsd, tour.productCode).toBeDefined();
      expect(tour.currency).toBe("USD");
      expect(tour.startingPrice).toBeCloseTo(expectedUsd, 2);
      expect(tour.startingPrice).toBeLessThan(1000);
    });
  });

  it("rejects an AUD 95 live hydration as a USD listing price for 24058P1", () => {
    const listing = getToursByCityUnified("australia", "sydney").find(
      entry => entry.tour.productCode === "24058P1"
    );
    expect(listing).toBeDefined();
    expect(listing!.tour.startingPrice).toBeCloseTo(62.44, 2);

    const merged = mergeEngine6LiveFieldsIntoTour(listing!.tour, {
      priceAmount: 95,
      priceFormatted: "From $95.00",
      priceCurrency: "AUD",
      aggregateRating: 4.7,
      reviewCount: 1473,
      durationText: "10 hours",
    });

    expect(merged.currency).toBe("USD");
    expect(merged.startingPrice).toBeCloseTo(62.44, 2);
    expect(merged.startingPrice).toBeLessThan(100);
    expect(merged.startingPrice).not.toBe(95);
  });

  it.each(SYDNEY_VIATOR_PUBLIC_PRODUCT_CODES)(
    "lists %s with the USD merchant-feed commercial price",
    productCode => {
      const feedPrice = parsePrice(merchantPrices.get(productCode));
      const listing = getToursByCityUnified("australia", "sydney").find(
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
      expect(html).not.toMatch(/¥|JPY|€|£|A\$|AUD|Rp|IDR|฿|THB/);
    }
  );
});
