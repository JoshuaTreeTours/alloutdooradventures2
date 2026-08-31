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
  QUEENSTOWN_VIATOR_PUBLIC_PRODUCT_CODES,
  QUEENSTOWN_VIATOR_PUBLIC_USD_FROM_PRICES,
} from "./queenstownViatorPublicRatings";

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

describe("Queenstown Engine6 commercial USD listing prices", () => {
  const merchantPrices = readMerchantFeedPrices();

  it("covers all selected Queenstown products with USD merchant-feed snapshot rows", () => {
    const snapshotByCode = new Map(
      snapshot.rows.map(row => [row.productCode, row])
    );

    QUEENSTOWN_VIATOR_PUBLIC_PRODUCT_CODES.forEach(productCode => {
      const row = snapshotByCode.get(productCode);
      expect(row, productCode).toBeDefined();
      expect(parseMerchantPriceCurrency(row!.price)).toBe("USD");
      expect(row!.price).toBe(merchantPrices.get(productCode));
    });
  });

  it("does not render a local-currency amount as USD for any Queenstown listing", () => {
    const queenstownListing = engine6ListingTours.filter(
      tour =>
        tour.destination.stateSlug === "new-zealand" &&
        tour.destination.citySlug === "queenstown"
    );

    queenstownListing.forEach(tour => {
      const expectedUsd =
        QUEENSTOWN_VIATOR_PUBLIC_USD_FROM_PRICES[tour.productCode];
      expect(expectedUsd, tour.productCode).toBeDefined();
      expect(tour.currency).toBe("USD");
      expect(tour.startingPrice).toBeCloseTo(expectedUsd, 2);
    });
  });

  it("rejects an NZD 189 live hydration as a USD listing price for 76369P1", () => {
    const listing = getToursByCityUnified("new-zealand", "queenstown").find(
      entry => entry.tour.productCode === "76369P1"
    );
    expect(listing).toBeDefined();
    expect(listing!.tour.startingPrice).toBeCloseTo(120.07, 2);

    const merged = mergeEngine6LiveFieldsIntoTour(listing!.tour, {
      priceAmount: 189,
      priceFormatted: "From $189.00",
      priceCurrency: "NZD",
      aggregateRating: 4.9,
      reviewCount: 1389,
      durationText: "4 hours 30 minutes",
    });

    expect(merged.currency).toBe("USD");
    expect(merged.startingPrice).toBeCloseTo(120.07, 2);
    expect(merged.startingPrice).toBeLessThan(189);
    expect(merged.startingPrice).not.toBe(189);
  });

  it.each(QUEENSTOWN_VIATOR_PUBLIC_PRODUCT_CODES)(
    "lists %s with the USD merchant-feed commercial price",
    productCode => {
      const feedPrice = parsePrice(merchantPrices.get(productCode));
      const listing = getToursByCityUnified("new-zealand", "queenstown").find(
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
      expect(html).not.toMatch(/¥|JPY|€|£|A\$|AUD|NZ\$|NZD|Rp|IDR|฿|THB/);
    }
  );
});
