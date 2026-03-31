import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import { extractLegacyFhProductRecord } from "./extractor";
import {
  CENTRAL_PARK_BIKE_TOURS_BOOK_PATH,
  CENTRAL_PARK_BIKE_TOURS_PUBLIC_PATH,
  centralParkBikeToursMigratedRecord,
} from "./fixtures/centralParkBikeTours";
import { mapLegacyFhRecordToEngine6Tour } from "./mapLegacyFhRecordToEngine6Tour";
import { getLegacyFhMigratedTourBySlugs } from "./registry";
import CityTourDetailRoute from "../../pages/destinations/states/tours/CityTourDetailRoute";
import { buildEngine6SchemaGraph } from "../schema/buildEngine6SchemaGraph";
import { getTourBySlugs } from "../../data/tours";

describe("legacy FH -> Engine6 converter", () => {
  it("extracts stable fields from legacy public + book HTML fixtures", () => {
    const record = extractLegacyFhProductRecord({
      slug: "central-park-bike-tours-16628",
      canonicalPath: CENTRAL_PARK_BIKE_TOURS_PUBLIC_PATH,
      bookingPath: CENTRAL_PARK_BIKE_TOURS_BOOK_PATH,
      operator: "Unlimited Biking",
      publicHtml: `<main><h1>Central Park Bike Tours</h1><section data-legacy="overview"><p>Guided bike ride across Central Park landmarks.</p></section><section data-legacy="highlights"><ul><li>Bethesda Terrace photo stop</li></ul></section><section data-legacy="meeting"><p>Meeting point: Midtown Manhattan</p></section></main>`,
      bookingHtml: `<main><section data-fh="pricing"><ul><li>Adults: $85</li></ul></section></main>`,
      fallback: {
        title: "Central Park Bike Tours",
      },
    });

    expect(record.title).toBe("Central Park Bike Tours");
    expect(record.overview).toContain("Guided bike ride");
    expect(record.highlights).toContain("Bethesda Terrace photo stop");
    expect(record.priceSnapshot.amount).toBe(85);
    expect(record.priceSnapshot.options[0]?.amount).toBe(85);
    expect(record.meetingInfo).toBe("Midtown Manhattan");
  });

  it("selects lowest extracted bookable price and cleans meeting point prefix", () => {
    const record = extractLegacyFhProductRecord({
      slug: "central-park-bike-tours-16628",
      canonicalPath: CENTRAL_PARK_BIKE_TOURS_PUBLIC_PATH,
      bookingPath: CENTRAL_PARK_BIKE_TOURS_BOOK_PATH,
      operator: "Unlimited Biking",
      publicHtml:
        "<main><h1>Central Park Bike Tours</h1><section data-legacy=\"meeting\"><p>Meeting point: 56 W 56th St, New York, NY 10019</p></section></main>",
      bookingHtml:
        "<main><section data-fh=\"pricing\"><ul><li>Adults: $95</li><li>Youth: $75</li><li>VIP: $120</li></ul></section></main>",
      fallback: { title: "Central Park Bike Tours" },
    });

    expect(record.priceSnapshot.amount).toBe(75);
    expect(record.priceSnapshot.label).toBe("From $75");
    expect(record.meetingInfo).toBe("56 W 56th St, New York, NY 10019");
  });

  it("uses deterministic hero selection priority", () => {
    const record = extractLegacyFhProductRecord({
      slug: "central-park-bike-tours-16628",
      canonicalPath: CENTRAL_PARK_BIKE_TOURS_PUBLIC_PATH,
      bookingPath: CENTRAL_PARK_BIKE_TOURS_BOOK_PATH,
      operator: "Unlimited Biking",
      publicHtml:
        "<main><h1>Central Park Bike Tours</h1><img src=\"https://cdn.example.com/z-bike-action.jpg\" /><img src=\"https://cdn.example.com/a-cover-primary.jpg\" /><img src=\"https://cdn.example.com/m-gallery.jpg\" /></main>",
      fallback: { title: "Central Park Bike Tours" },
    });

    expect(record.heroImageUrl).toBe("https://cdn.example.com/a-cover-primary.jpg");
  });

  it("normalizes the migrated specimen into a reusable record", () => {
    expect(centralParkBikeToursMigratedRecord.sourceType).toBe(
      "legacy_fh_migrated"
    );
    expect(centralParkBikeToursMigratedRecord.slug).toBe(
      "central-park-bike-tours-16628"
    );
    expect(centralParkBikeToursMigratedRecord.bookingPath).toBe(
      "/destinations/new-york/new-york/tours/central-park-bike-tours-16628/book"
    );
    expect(centralParkBikeToursMigratedRecord.durationText).toBe("2 hours");
    expect(centralParkBikeToursMigratedRecord.itinerary.length).toBeGreaterThan(
      1
    );
  });

  it("maps normalized record into Engine6 page data without runtime scraping", () => {
    const tour = mapLegacyFhRecordToEngine6Tour(centralParkBikeToursMigratedRecord);

    expect(tour.bookingUrl).toBe(
      "/destinations/new-york/new-york/tours/central-park-bike-tours-16628/book"
    );
    expect(tour.durationText).toBe("2 hours");
    expect(tour.canonicalPath).toBe(CENTRAL_PARK_BIKE_TOURS_PUBLIC_PATH);
    expect(tour.diagnostics.source).toBe("legacy-fh-migrated");
    expect(tour.itinerary.length).toBeGreaterThan(1);
    expect(tour.priceAmount).toBe(52);
    expect(tour.aggregateRating).toBe(4.7);
    expect(tour.reviewCount).toBe(5060);
    expect(tour.ownership.routeOwner).toBe("fareharbor");
    expect(tour.ownership.ctaOwner).toBe("fareharbor");
    expect(tour.ownership.presentationOwner).toBe("engine6");
    expect(tour.ownership.commercialOwner).toBe("viator");
    expect(tour.ownership.commercialFallbackReason).toBe("none");
    expect(tour.diagnostics.commercialPriceFieldPath).toContain(
      "matchedViatorCommercial"
    );
  });

  it("falls back to migrated FH commercial fields when no confident Viator match exists", () => {
    const tour = mapLegacyFhRecordToEngine6Tour({
      ...centralParkBikeToursMigratedRecord,
      matchedViatorCommercial: {
        productCode: "233384P2",
        confidentMatch: false,
        priceAmount: 52,
        aggregateRating: 4.7,
        reviewCount: 5060,
      },
    });

    expect(tour.priceAmount).toBe(75);
    expect(tour.aggregateRating).toBe(4.3);
    expect(tour.reviewCount).toBe(390);
    expect(tour.ownership.commercialOwner).toBe("fareharbor");
    expect(tour.ownership.commercialFallbackReason).toBe(
      "no-confident-viator-match"
    );
    expect(tour.diagnostics.commercialPriceFieldPath).toBe("legacy.price");
    expect(tour.diagnostics.ratingFieldPath).toBe("legacy.rating");
  });

  it("falls back to legacy commercial values when Viator match is confident but missing commercial values", () => {
    const tour = mapLegacyFhRecordToEngine6Tour({
      ...centralParkBikeToursMigratedRecord,
      matchedViatorCommercial: {
        productCode: "233384P2",
        confidentMatch: true,
        priceAmount: null,
        aggregateRating: null,
        reviewCount: null,
      },
    });

    expect(tour.priceAmount).toBe(75);
    expect(tour.aggregateRating).toBe(4.3);
    expect(tour.reviewCount).toBe(390);
    expect(tour.ownership.commercialFallbackReason).toBe(
      "viator-commercial-unavailable"
    );
  });

  it("enforces /book preservation for migrated records", () => {
    expect(() =>
      mapLegacyFhRecordToEngine6Tour({
        ...centralParkBikeToursMigratedRecord,
        bookingPath:
          "/destinations/new-york/new-york/tours/central-park-bike-tours-16628/checkout",
      })
    ).toThrow(/must preserve \/book endpoint/i);
  });

  it("renders the migrated slug in Engine6 layout instead of legacy template", () => {
    const migratedTour = getLegacyFhMigratedTourBySlugs(
      "new-york",
      "new-york",
      "central-park-bike-tours-16628"
    );

    expect(migratedTour).toBeTruthy();

    Object.assign(globalThis, {
      location: {
        pathname: CENTRAL_PARK_BIKE_TOURS_PUBLIC_PATH,
        search: "",
        hash: "",
      },
    });

    const html = renderToString(
      <CityTourDetailRoute
        params={{
          stateSlug: "new-york",
          citySlug: "new-york",
          tourSlug: "central-park-bike-tours-16628",
        }}
      />
    );

    expect(html).toContain('data-testid="engine6-hero-banner"');
    expect(html).toContain('data-testid="engine6-bottom-cta"');
    expect(html).toContain(
      'href="/destinations/new-york/new-york/tours/central-park-bike-tours-16628/book"'
    );
    expect(html).toContain("Duration:");
    expect(html).toContain("data-testid=\"engine6-itinerary-timeline\"");
    expect(html).not.toContain("Prices starting at");
    expect(html).toContain("Price:</strong>");
    expect(html).toContain("$52");
    expect(html).toContain("5060");

    const listingTour = getTourBySlugs(
      "new-york",
      "new-york",
      "central-park-bike-tours-16628"
    );
    expect(listingTour?.engine).toBe("engine6");
    expect(listingTour?.startingPrice).toBe(52);
    expect(listingTour?.heroImage).toBe(migratedTour?.heroImageUrl);

    const schema = buildEngine6SchemaGraph(migratedTour!);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const productNode = graph.find(node => node["@type"] === "Product");
    const offerNode = graph.find(node => node["@type"] === "Offer");
    const aggregateRatingNode = graph.find(
      node => node["@type"] === "AggregateRating"
    );

    expect((offerNode as { price?: number } | undefined)?.price).toBe(52);
    expect(
      (aggregateRatingNode as { ratingValue?: number } | undefined)?.ratingValue
    ).toBe(4.7);
    expect(
      (aggregateRatingNode as { reviewCount?: number } | undefined)?.reviewCount
    ).toBe(5060);
    expect(
      (productNode as { aggregateRating?: { "@id"?: string } } | undefined)
        ?.aggregateRating?.["@id"]
    ).toBe(
      (aggregateRatingNode as { "@id"?: string } | undefined)?.["@id"]
    );
  });
});
