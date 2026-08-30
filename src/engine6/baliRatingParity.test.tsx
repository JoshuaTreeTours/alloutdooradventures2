import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import TourCard from "../components/TourCard";
import { getToursByCityUnified } from "../data/tours";
import Engine6TourPage from "./components/Engine6TourPage";
import {
  buildEngine6CardDescription,
  resolveEngine6GovernedProductDescription,
} from "./governedEditorialDescriptions";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import { engine6ListingTours } from "./listing";
import {
  BALI_VIATOR_PUBLIC_RATINGS,
  BALI_VIATOR_PUBLIC_PRODUCT_CODES,
  BALI_VIATOR_PUBLIC_USD_FROM_PRICES,
} from "./baliViatorPublicRatings";
import { ENGINE6_BALI_CANONICAL_CITY_HERO_URL } from "./displayHero";
import { formatStartingPrice } from "../lib/pricing";
import { formatEngine6StartingPriceLabel } from "./priceDisplay";
import { formatMerchantPrice } from "../utils/merchantPricing";
import { engine6ResolvedTours } from "./registry";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const readMerchantFeedRows = () => {
  const lines = readFileSync("data/merchantFeed.csv", "utf8")
    .split(/\r?\n/)
    .filter(Boolean);

  return new Map(
    lines.slice(1).map(line => {
      const id = line.split(",")[0];
      const match = line.match(
        /,Outdoor Adventures,([\d.]+),(\d+),(\d+)$/
      );

      const priceMatch = line.match(/,in stock,([\d.]+ USD),new,/);

      return [
        id,
        match
          ? {
              averageRating: match[1],
              ratingCount: match[2],
              reviewCount: match[3],
              price: priceMatch?.[1] ?? null,
            }
          : null,
      ] as const;
    })
  );
};

const baliListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "indonesia" &&
    tour.destination.citySlug === "bali" &&
    BALI_VIATOR_PUBLIC_PRODUCT_CODES.includes(tour.productCode)
);

const baliResolvedTours = engine6ResolvedTours.filter(
  tour =>
    tour.canonicalPath.includes("/indonesia/bali/") &&
    BALI_VIATOR_PUBLIC_PRODUCT_CODES.includes(tour.productCode)
);

const DESTINATION_BLEED_PATTERN =
  /Yellowstone|Yosemite|Zion National Park|Glacier National Park|Grand Canyon National Park|Great Smoky Mountains|Canyonlands|Acadia National Park|Bryce Canyon|Arches National Park|Sedona|Chicago|Boston|\bLondon\b|\bParis\b|\bRome\b|\bVenice\b|Washington, D\.C\.|Washington D\.C\.|\bEdinburgh\b|\bBarcelona\b|\bAmsterdam\b|\bDublin\b|Arthur's Seat|Royal Mile|\bHighlands\b|\bCancun\b|Mexico City|Chichen Itza|Isla Mujeres|Puerto Vallarta|Marietas|Yelapa|Banderas Bay|Cabo San Lucas|El Arco|Land's End|\bCusco\b|\bCuzco\b|Sacred Valley|Machu Picchu|Humantay|Rainbow Mountain|Vinicunca|Ollantaytambo|\bLima\b|Miraflores|Barranco|Rio de Janeiro|Christ the Redeemer|Sugar Loaf|Copacabana|Ipanema|Petrópolis|Petropolis|\bTokyo\b|Meiji Jingu|Asakusa|Shinjuku|Mount Fuji|Hakone|Kamakura|Nikko|\bKyoto\b|Kinkaku-ji|Kiyomizu-dera|Fushimi Inari|Arashiyama|\bGion\b|\bBangkok\b|Ayutthaya|Grand Palace|Wat Pho|Wat Arun|Damnoen Saduak|Thonburi|\bThailand\b|\bSingapore\b|Marina Bay|Chinatown MRT|Pulau Ubin|Kampong Glam/i;

describe("Bali Engine6 rating/review parity", () => {
  const merchantFeedRows = readMerchantFeedRows();

  it.each(BALI_VIATOR_PUBLIC_PRODUCT_CODES)(
    "keeps %s aligned across registry, listing, detail, schema, and merchant feed",
    productCode => {
      const expected = BALI_VIATOR_PUBLIC_RATINGS[productCode];
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );

      expect(tour).toBeDefined();
      expect(tour?.aggregateRating).toBe(expected.rating);
      expect(tour?.reviewCount).toBe(expected.reviewCount);

      const listingEntry = getToursByCityUnified("indonesia", "bali").find(
        entry => entry.tour.productCode === productCode
      );
      expect(listingEntry).toBeDefined();
      expect(tour?.canonicalPath).toContain("/indonesia/bali/");
      expect(tour?.state).toBe("Indonesia");
      expect(listingEntry?.tour.destination.state).toBe("Indonesia");
      expect(listingEntry?.tour.destination.stateSlug).toBe("indonesia");
      expect(listingEntry?.tour.destination.country).toBe("Indonesia");
      expect(listingEntry?.tour.destination.countryCode).toBe("ID");
      expect(listingEntry?.href).toContain("/indonesia/bali/");
      expect(listingEntry?.tour.badges.rating).toBe(expected.rating);
      expect(listingEntry?.tour.badges.reviewCount).toBe(expected.reviewCount);

      const cardHtml = renderToString(
        <TourCard tour={listingEntry!.tour} href={listingEntry!.href} />
      );
      const normalizedCardHtml = cardHtml.replace(/<!-- -->/g, "");
      expect(normalizedCardHtml).toContain(`(${expected.reviewCount} reviews)`);
      expect(normalizedCardHtml).toContain(`★ ${expected.rating.toFixed(1)}`);

      const detailHtml = renderToString(<Engine6TourPage tour={tour!} />);
      const normalizedDetailHtml = detailHtml.replace(/<!-- -->/g, "");
      expect(normalizedDetailHtml).toContain(
        `${expected.rating.toFixed(1)} rating • ${expected.reviewCount} reviews`
      );

      const graph = buildEngine6SchemaGraph(tour!)["@graph"] as Array<
        Record<string, unknown>
      >;
      const aggregateRating = graph.find(
        node => node["@type"] === "AggregateRating"
      );
      expect(aggregateRating?.ratingValue).toBe(expected.rating);
      expect(aggregateRating?.reviewCount).toBe(expected.reviewCount);

      const productNode = graph.find(node => node["@type"] === "Product");
      const touristTripNode = graph.find(
        node => node["@type"] === "TouristTrip"
      );
      const placeNode = graph.find(node => node["@type"] === "Place") as {
        address?: { addressCountry?: string; addressRegion?: string };
      };
      const breadcrumbNode = graph.find(
        node => node["@type"] === "BreadcrumbList"
      ) as { itemListElement?: Array<{ name?: string; item?: string }> };
      expect(placeNode?.address?.addressCountry).toBe("ID");
      expect(placeNode?.address?.addressRegion).toBe("Indonesia");
      expect(breadcrumbNode?.itemListElement?.[1]?.name).toBe("Indonesia");
      expect(String(breadcrumbNode?.itemListElement?.[1]?.item ?? "")).toContain(
        "/destinations/indonesia"
      );
      expect(productNode?.image).toBe(tour!.heroImageUrl);
      expect(touristTripNode?.image).toBe(tour!.heroImageUrl);
      expect(listingEntry!.tour.heroImage).toBe(tour!.heroImageUrl);
      expect(listingEntry!.tour.resolvedImageUrl).toBe(tour!.heroImageUrl);

      const expectedUsd = BALI_VIATOR_PUBLIC_USD_FROM_PRICES[productCode];
      expect(expectedUsd).toBeDefined();
      expect(tour?.priceAmount).toBe(expectedUsd);
      expect(tour?.priceFormatted).toBe(
        formatEngine6StartingPriceLabel(expectedUsd)
      );
      expect(listingEntry!.tour.startingPrice).toBe(expectedUsd);
      expect(listingEntry!.tour.currency).toBe("USD");
      expect(listingEntry!.tour.badges.priceFrom).toBe(
        formatEngine6StartingPriceLabel(expectedUsd)
      );
      expect(normalizedCardHtml).toContain(
        `From ${formatStartingPrice(expectedUsd, "USD")}`
      );
      expect(normalizedDetailHtml).toContain(
        formatEngine6StartingPriceLabel(expectedUsd)
      );
      expect(tour?.bookingUrl).toContain("currency=USD");

      const offerNode = graph.find(node => node["@type"] === "Offer") as {
        price?: number;
        priceCurrency?: string;
        description?: string;
      };
      expect(offerNode?.price).toBe(expectedUsd);
      expect(offerNode?.priceCurrency).toBe("USD");
      expect(offerNode?.description).toBe(
        formatEngine6StartingPriceLabel(expectedUsd)
      );

      const merchantRow = merchantFeedRows.get(productCode);
      expect(merchantRow).not.toBeNull();
      expect(merchantRow?.averageRating).toBe(expected.rating.toFixed(1));
      expect(merchantRow?.ratingCount).toBe(String(expected.reviewCount));
      expect(merchantRow?.reviewCount).toBe(String(expected.reviewCount));
      expect(merchantRow?.price).toBe(formatMerchantPrice(expectedUsd, "USD"));
    }
  );

  it("covers USD From$ for every selected Bali product", () => {
    expect(Object.keys(BALI_VIATOR_PUBLIC_USD_FROM_PRICES).sort()).toEqual(
      [...BALI_VIATOR_PUBLIC_PRODUCT_CODES].sort()
    );
  });

  it("lists exactly the selected Engine6 cards for the Bali cohort", () => {
    const baliListing = getToursByCityUnified("indonesia", "bali");
    expect(baliListing).toHaveLength(
      BALI_VIATOR_PUBLIC_PRODUCT_CODES.length
    );
    expect(
      baliListing.every(entry => entry.tour.engine === "engine6")
    ).toBe(true);
    expect(baliListing.map(entry => entry.tour.productCode).sort()).toEqual(
      [...BALI_VIATOR_PUBLIC_PRODUCT_CODES].sort()
    );
  });

  it("does not change non-Bali merchant feed rows", () => {
    expect(merchantFeedRows.get("8647P594")).toEqual({
      averageRating: "4.9",
      ratingCount: "95",
      reviewCount: "95",
      price: "930 USD",
    });
  });

  it("keeps Bali listing and governed descriptions free of unrelated destination bleed", () => {
    BALI_VIATOR_PUBLIC_PRODUCT_CODES.forEach(productCode => {
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );
      const listingEntry = getToursByCityUnified("indonesia", "bali").find(
        entry => entry.tour.productCode === productCode
      );

      expect(tour).toBeDefined();
      expect(listingEntry).toBeDefined();

      const cardDescription = buildEngine6CardDescription(tour!);
      const governedDescription = resolveEngine6GovernedProductDescription(
        tour!
      );

      expect(cardDescription, productCode).not.toMatch(DESTINATION_BLEED_PATTERN);
      expect(governedDescription, productCode).not.toMatch(
        DESTINATION_BLEED_PATTERN
      );
      expect(listingEntry!.tour.shortDescription, productCode).not.toMatch(
        DESTINATION_BLEED_PATTERN
      );
      expect(governedDescription, productCode).toMatch(/\bBali\b/i);
      expect(cardDescription, productCode).toMatch(/\bBali\b/i);
      expect(listingEntry!.tour.shortDescription, productCode).toMatch(
        /\bBali\b/i
      );
    });
  });

  it("keeps Bali public itinerary titles clean on rendered detail pages", () => {
    const malformedTitlePattern =
      /^(?:This|These|That|It|They|inspiration point for photos)$/i;

    BALI_VIATOR_PUBLIC_PRODUCT_CODES.forEach(productCode => {
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );

      expect(tour).toBeDefined();
      tour!.itinerary.forEach(item => {
        expect(item.title).not.toMatch(malformedTitlePattern);
        expect(item.title).not.toMatch(/\bfor photos$/i);
      });

      const detailHtml = renderToString(<Engine6TourPage tour={tour!} />);
      expect(detailHtml).toContain('data-testid="engine6-itinerary-timeline"');
      expect(detailHtml).not.toMatch(/<h3[^>]*>\s*This\s*<\/h3>/i);
    });
  });
});

describe("Bali Engine6 hero diversity", () => {
  it("uses unique listing heroes with at most one canonical city fallback", () => {
    const listingEntries = getToursByCityUnified("indonesia", "bali").filter(
      entry =>
        entry.tour.engine === "engine6" &&
        BALI_VIATOR_PUBLIC_PRODUCT_CODES.includes(entry.tour.productCode)
    );
    expect(listingEntries.length).toBe(
      BALI_VIATOR_PUBLIC_PRODUCT_CODES.length
    );
    const heroes = listingEntries.map(entry => entry.tour.heroImage);
    const unique = new Set(heroes);
    expect(unique.size).toBe(heroes.length);

    const canonicalUses = heroes.filter(
      url => url === ENGINE6_BALI_CANONICAL_CITY_HERO_URL
    ).length;
    expect(canonicalUses).toBeLessThanOrEqual(1);
  });
});

describe("Bali Engine6 itinerary title governance", () => {
  it("audits all Bali listing products", () => {
    expect(baliListingTours).toHaveLength(
      BALI_VIATOR_PUBLIC_PRODUCT_CODES.length
    );
    expect(baliResolvedTours).toHaveLength(
      BALI_VIATOR_PUBLIC_PRODUCT_CODES.length
    );
    expect(baliResolvedTours.map(tour => tour.productCode).sort()).toEqual(
      [...BALI_VIATOR_PUBLIC_PRODUCT_CODES].sort()
    );
  });

  it.each(BALI_VIATOR_PUBLIC_PRODUCT_CODES)(
    "uses verified POI titles for resolved tour %s",
    productCode => {
      const tour = baliResolvedTours.find(
        entry => entry.productCode === productCode
      );
      expect(tour).toBeDefined();
      expect(tour!.itinerary.length).toBeGreaterThan(0);
      tour!.itinerary.forEach(item => {
        expect(item.title.trim().length).toBeGreaterThan(2);
        expect(item.title).not.toMatch(/^(?:This|These|That|It|They)\b/i);
      });
    }
  );
});
