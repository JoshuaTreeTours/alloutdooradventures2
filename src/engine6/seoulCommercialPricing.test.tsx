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
import type { MerchantFeedCommercialSnapshot } from "./merchantFeedCommercialSnapshot";
import {
  SEOUL_VIATOR_PUBLIC_PRODUCT_CODES,
  SEOUL_VIATOR_PUBLIC_USD_FROM_PRICES,
} from "./seoulViatorPublicRatings";

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

describe("Seoul Engine6 commercial USD listing prices", () => {
  const merchantPrices = readMerchantFeedPrices();

  it("covers all selected Seoul products with USD merchant-feed snapshot rows", () => {
    const snapshotByCode = new Map(
      snapshot.rows.map(row => [row.productCode, row])
    );

    SEOUL_VIATOR_PUBLIC_PRODUCT_CODES.forEach(productCode => {
      const row = snapshotByCode.get(productCode);
      expect(row, productCode).toBeDefined();
      expect(parseMerchantPriceCurrency(row!.price)).toBe("USD");
      expect(row!.price).toBe(merchantPrices.get(productCode));
    });
  });

  it("does not render a local-currency amount as USD for any Seoul listing", () => {
    const seoulListing = engine6ListingTours.filter(
      tour =>
        tour.destination.stateSlug === "south-korea" &&
        tour.destination.citySlug === "seoul"
    );

    seoulListing.forEach(tour => {
      const expectedUsd = SEOUL_VIATOR_PUBLIC_USD_FROM_PRICES[tour.productCode];
      expect(expectedUsd, tour.productCode).toBeDefined();
      expect(tour.currency).toBe("USD");
      expect(tour.startingPrice).toBeCloseTo(expectedUsd, 2);
      expect(tour.startingPrice).toBeLessThan(1000);
    });
  });

  it.each(SEOUL_VIATOR_PUBLIC_PRODUCT_CODES)(
    "lists %s with the USD merchant-feed commercial price",
    productCode => {
      const feedPrice = parsePrice(merchantPrices.get(productCode));
      const listing = getToursByCityUnified("south-korea", "seoul").find(
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
      expect(html).not.toMatch(/₩|KRW|¥|€|£|฿|THB|IDR/);
    }
  );
});
