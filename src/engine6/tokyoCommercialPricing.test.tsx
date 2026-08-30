import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import TourCard from "../components/TourCard";
import { getToursByCityUnified } from "../data/tours";
import { formatStartingPrice } from "../lib/pricing";
import { parseMerchantPriceCurrency, parsePrice } from "../utils/merchantPricing";
import { engine6ListingTours } from "./listing";
import type { MerchantFeedCommercialSnapshot } from "./merchantFeedCommercialSnapshot";
import { TOKYO_VIATOR_PUBLIC_PRODUCT_CODES } from "./tokyoViatorPublicRatings";

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

describe("Tokyo Engine6 commercial USD listing prices", () => {
  const merchantPrices = readMerchantFeedPrices();

  it("covers all 11 Tokyo products with USD merchant-feed snapshot rows", () => {
    const snapshotByCode = new Map(
      snapshot.rows.map(row => [row.productCode, row])
    );

    TOKYO_VIATOR_PUBLIC_PRODUCT_CODES.forEach(productCode => {
      const row = snapshotByCode.get(productCode);
      expect(row, productCode).toBeDefined();
      expect(parseMerchantPriceCurrency(row!.price)).toBe("USD");
      expect(row!.price).toBe(merchantPrices.get(productCode));
    });
  });

  it("renders 33215P1 near its USD Viator commercial price instead of $16,500", () => {
    const listing = getToursByCityUnified("japan", "tokyo").find(
      entry => entry.tour.productCode === "33215P1"
    );
    expect(listing).toBeDefined();
    expect(listing!.tour.currency).toBe("USD");
    expect(listing!.tour.startingPrice).toBeCloseTo(106.77, 2);
    expect(listing!.tour.startingPrice).toBeLessThan(250);
    expect(listing!.tour.badges.priceFrom).toBe("From $106.77");

    const html = renderToString(
      <TourCard tour={listing!.tour} href={listing!.href} />
    ).replace(/<!-- -->/g, "");
    expect(html).toMatch(/From\s+\$106\.77/);
    expect(html).not.toContain("$16,500");
    expect(html).not.toContain("$16500");
  });

  it.each(TOKYO_VIATOR_PUBLIC_PRODUCT_CODES)(
    "lists %s with the USD merchant-feed commercial price",
    productCode => {
      const feedPrice = parsePrice(merchantPrices.get(productCode));
      const listing = getToursByCityUnified("japan", "tokyo").find(
        entry => entry.tour.productCode === productCode
      );

      expect(feedPrice).toBeGreaterThan(0);
      expect(listing).toBeDefined();
      expect(listing!.tour.currency).toBe("USD");
      expect(listing!.tour.startingPrice).toBeCloseTo(feedPrice!, 2);
      expect(listing!.tour.startingPrice).toBeLessThan(5000);
      expect(listing!.tour.badges.priceFrom).toBe(
        `From $${feedPrice!.toFixed(2)}`
      );

    const html = renderToString(
      <TourCard tour={listing!.tour} href={listing!.href} />
    ).replace(/<!-- -->/g, "");
    expect(html).toContain(
      `From ${formatStartingPrice(listing!.tour.startingPrice, listing!.tour.currency)}`
    );
      expect(html).not.toMatch(/From\s+\$16,500/);
      expect(html).not.toMatch(/From\s+\$9,800/);
      expect(html).not.toMatch(/From\s+\$69,865/);
    }
  );

  it("does not change commercial listing prices for existing Engine6 cities", () => {
    const snapshotByCode = new Map(
      snapshot.rows.map(row => [row.productCode, row.price])
    );
    const existingCityTours = engine6ListingTours.filter(
      tour =>
        tour.engine === "engine6" &&
        tour.productCode &&
        !(
          tour.destination.stateSlug === "japan" &&
          tour.destination.citySlug === "tokyo"
        ) &&
        snapshotByCode.has(tour.productCode)
    );

    expect(existingCityTours.length).toBeGreaterThan(50);

    existingCityTours.forEach(tour => {
      const snapshotPrice = parsePrice(snapshotByCode.get(tour.productCode!)!);
      expect(tour.currency, tour.productCode).toBe("USD");
      expect(tour.startingPrice, tour.productCode).toBeCloseTo(snapshotPrice!, 2);
    });

    const santaBarbara = existingCityTours.find(
      tour => tour.productCode === "63657P1"
    );
    expect(santaBarbara?.startingPrice).toBe(199);
    expect(snapshotByCode.get("63657P1")).toBe("199 USD");
  });
});
