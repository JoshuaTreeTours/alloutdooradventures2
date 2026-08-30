import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import TourCard from "../components/TourCard";
import { getToursByCityUnified } from "../data/tours";
import { formatStartingPrice } from "../lib/pricing";
import { parseMerchantPriceCurrency, parsePrice } from "../utils/merchantPricing";
import { engine6ListingTours } from "./listing";
import { mergeEngine6LiveFieldsIntoTour } from "./liveProductFields";
import type { MerchantFeedCommercialSnapshot } from "./merchantFeedCommercialSnapshot";
import { SINGAPORE_VIATOR_PUBLIC_PRODUCT_CODES } from "./singaporeViatorPublicRatings";

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

describe("Singapore Engine6 commercial USD listing prices", () => {
  const merchantPrices = readMerchantFeedPrices();

  it("covers all selected Singapore products with USD merchant-feed snapshot rows", () => {
    const snapshotByCode = new Map(
      snapshot.rows.map(row => [row.productCode, row])
    );

    SINGAPORE_VIATOR_PUBLIC_PRODUCT_CODES.forEach(productCode => {
      const row = snapshotByCode.get(productCode);
      expect(row, productCode).toBeDefined();
      expect(parseMerchantPriceCurrency(row!.price)).toBe("USD");
      expect(row!.price).toBe(merchantPrices.get(productCode));
    });
  });

  it("renders 57811P2 near its USD Viator commercial price instead of SGD $60 or $16,500", () => {
    const listing = getToursByCityUnified("singapore", "singapore").find(
      entry => entry.tour.productCode === "57811P2"
    );
    expect(listing).toBeDefined();
    expect(listing!.tour.currency).toBe("USD");
    expect(listing!.tour.startingPrice).toBeCloseTo(47.01, 2);
    expect(listing!.tour.startingPrice).toBeLessThan(80);
    expect(listing!.tour.badges.priceFrom).toBe("From $47.01");

    const html = renderToString(
      <TourCard tour={listing!.tour} href={listing!.href} />
    ).replace(/<!-- -->/g, "");
    expect(html).toMatch(/From\s+\$47\.01/);
    expect(html).not.toContain("$16,500");
    expect(html).not.toContain("$16500");
  });

  it("keeps the Singapore detail/listing price at $47.01 when live Viator hydration returns SGD 60", () => {
    const listing = getToursByCityUnified("singapore", "singapore").find(
      entry => entry.tour.productCode === "57811P2"
    );
    expect(listing).toBeDefined();

    const merged = mergeEngine6LiveFieldsIntoTour(listing!.tour, {
      priceAmount: 60,
      priceFormatted: "From $60.00",
      priceCurrency: "SGD",
      aggregateRating: 4.9,
      reviewCount: 545,
      durationText: "120 minutes",
    });

    expect(merged.startingPrice).toBeCloseTo(47.01, 2);
    expect(merged.currency).toBe("USD");
    expect(merged.badges.priceFrom).toBe("From $47.01");
    expect(merged.badges.priceFrom).not.toContain("$60.00");
  });

  it("does not treat hawker From $87.36 as a $9,800 local-currency mislabel", () => {
    const listing = getToursByCityUnified("singapore", "singapore").find(
      entry => entry.tour.productCode === "45610P13"
    );
    expect(listing).toBeDefined();
    expect(listing!.tour.startingPrice).toBeCloseTo(87.36, 2);
    expect(listing!.tour.startingPrice).toBeLessThan(200);
    expect(listing!.tour.badges.priceFrom).toBe("From $87.36");
  });

  it.each(SINGAPORE_VIATOR_PUBLIC_PRODUCT_CODES)(
    "lists %s with the USD merchant-feed commercial price",
    productCode => {
      const feedPrice = parsePrice(merchantPrices.get(productCode));
      const listing = getToursByCityUnified("singapore", "singapore").find(
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
          tour.destination.stateSlug === "singapore" &&
          tour.destination.citySlug === "singapore"
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
