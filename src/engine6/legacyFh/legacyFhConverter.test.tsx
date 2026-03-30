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
import {
  MIAMI_MIGRATION_SLUGS,
  miamiLegacyMigratedRecords,
} from "./fixtures/miamiLegacyBatch";
import { getToursByCity, getToursByCityUnified } from "../../data/tours";
import { toEngine6Card } from "../cards";
import { buildEngine6SchemaGraph } from "../schema/buildEngine6SchemaGraph";
import Engine6TourPage from "../components/Engine6TourPage";
import TourCard from "../../components/TourCard";

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
        '<main><h1>Central Park Bike Tours</h1><section data-legacy="meeting"><p>Meeting point: 56 W 56th St, New York, NY 10019</p></section></main>',
      bookingHtml:
        '<main><section data-fh="pricing"><ul><li>Adults: $95</li><li>Youth: $75</li><li>VIP: $120</li></ul></section></main>',
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
        '<main><h1>Central Park Bike Tours</h1><img src="https://cdn.example.com/z-bike-action.jpg" /><img src="https://cdn.example.com/a-cover-primary.jpg" /><img src="https://cdn.example.com/m-gallery.jpg" /></main>',
      fallback: { title: "Central Park Bike Tours" },
    });

    expect(record.heroImageUrl).toBe(
      "https://cdn.example.com/a-cover-primary.jpg"
    );
  });

  it("flags low-confidence overview when minimum length cannot be met", () => {
    const record = extractLegacyFhProductRecord({
      slug: "minimal-overview-specimen",
      canonicalPath:
        "/destinations/florida/miami/tours/minimal-overview-specimen",
      bookingPath:
        "/destinations/florida/miami/tours/minimal-overview-specimen/book",
      operator: "Test Operator",
      publicHtml:
        '<main><h1>Minimal Overview Specimen</h1><section data-legacy="overview"><p>Short overview.</p></section></main>',
      bookingHtml:
        '<main><section data-fh="overview"><p>Tiny description only.</p></section></main>',
      fallback: { title: "Minimal Overview Specimen" },
    });

    expect(record.overviewWordCount).toBeLessThan(100);
    expect(record.overviewLowConfidence).toBe(true);
    expect(record.ratingSnapshot.rating).toBeNull();
    expect(record.ratingSnapshot.reviewCount).toBeNull();
  });

  it("omits rating from card/page/schema when rating extraction is missing", () => {
    const record = extractLegacyFhProductRecord({
      slug: "no-rating-specimen",
      canonicalPath: "/destinations/florida/miami/tours/no-rating-specimen",
      bookingPath: "/destinations/florida/miami/tours/no-rating-specimen/book",
      operator: "No Rating Operator",
      publicHtml:
        '<main><h1>No Rating Specimen</h1><section data-legacy="overview"><p>Overview text without rating.</p></section></main>',
      bookingHtml:
        '<main><section data-fh="overview"><p>Booking content also does not include rating metadata or review totals.</p></section></main>',
      fallback: {
        title: "No Rating Specimen",
        ratingSnapshot: { rating: 4.8, reviewCount: 1200 },
      },
    });
    const tour = mapLegacyFhRecordToEngine6Tour(record);
    const card = toEngine6Card(tour);
    const schema = buildEngine6SchemaGraph(tour);
    const schemaJson = JSON.stringify(schema);
    Object.assign(globalThis, {
      location: {
        pathname: "/destinations/florida/miami/tours/no-rating-specimen",
        search: "",
        hash: "",
      },
    });
    const html = renderToString(<Engine6TourPage tour={tour} />);

    expect(record.ratingSnapshot.rating).toBeNull();
    expect(record.ratingSnapshot.reviewCount).toBeNull();
    expect(tour.aggregateRating).toBeNull();
    expect(tour.reviewCount).toBeNull();
    expect(card.ratingLabel).toBeNull();
    expect(schemaJson).not.toContain("AggregateRating");
    expect(html).not.toContain("No ratings yet");
  });

  it("omits product-page/schema rating when extracted rating is below 4.5", () => {
    const tour = mapLegacyFhRecordToEngine6Tour(
      centralParkBikeToursMigratedRecord
    );
    const card = toEngine6Card(tour);
    const schema = JSON.stringify(buildEngine6SchemaGraph(tour));

    expect(tour.aggregateRating).toBeNull();
    expect(tour.reviewCount).toBeNull();
    expect(card.ratingLabel).toBeNull();
    expect(schema).not.toContain('"AggregateRating"');
  });

  it("shows product-page/schema rating only when rating is >= 4.5 with review count", () => {
    const miamiRecord = miamiLegacyMigratedRecords.find(
      record => record.slug === "miami-downtown-private-airplane-tour-371933"
    );
    expect(miamiRecord).toBeTruthy();
    const tour = mapLegacyFhRecordToEngine6Tour(miamiRecord!);
    const schema = JSON.stringify(buildEngine6SchemaGraph(tour));
    Object.assign(globalThis, {
      location: {
        pathname:
          "/destinations/florida/miami/tours/miami-downtown-private-airplane-tour-371933",
        search: "",
        hash: "",
      },
    });
    const html = renderToString(<Engine6TourPage tour={tour} />);

    expect(tour.aggregateRating).toBeGreaterThanOrEqual(4.5);
    expect(tour.reviewCount).toBeGreaterThan(0);
    expect(html).toContain('data-testid="engine6-rating-summary"');
    expect(schema).toContain('"AggregateRating"');
  });

  it("renders city cards without rating/review display", () => {
    const miamiRecord = miamiLegacyMigratedRecords.find(
      record => record.slug === "miami-downtown-private-airplane-tour-371933"
    );
    const tour = mapLegacyFhRecordToEngine6Tour(miamiRecord!);
    const listingTour = {
      id: `engine6-${tour.productCode}`,
      engine: "engine6" as const,
      slug: miamiRecord!.slug,
      title: tour.title,
      shortDescription: tour.overviewText ?? tour.description,
      categories: tour.categories,
      primaryCategory: tour.primaryCategory,
      destination: {
        state: "Florida",
        stateSlug: "florida",
        city: "Miami",
        citySlug: "miami",
      },
      heroImage: tour.resolvedImageUrl ?? "",
      resolvedImageUrl: tour.resolvedImageUrl,
      badges: {
        rating: tour.aggregateRating ?? undefined,
        reviewCount: tour.reviewCount ?? undefined,
      },
      activitySlugs: ["adventure"],
      bookingProvider: "fareharbor" as const,
      bookingUrl: tour.bookingUrl,
      longDescription: tour.overviewText ?? tour.description,
    };
    const html = renderToString(<TourCard tour={listingTour} />);

    expect(html).not.toContain("reviews");
    expect(html).not.toContain("★");
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
    const tour = mapLegacyFhRecordToEngine6Tour(
      centralParkBikeToursMigratedRecord
    );

    expect(tour.bookingUrl).toBe(
      "/destinations/new-york/new-york/tours/central-park-bike-tours-16628/book"
    );
    expect(tour.durationText).toBe("2 hours");
    expect(tour.canonicalPath).toBe(CENTRAL_PARK_BIKE_TOURS_PUBLIC_PATH);
    expect(tour.diagnostics.source).toBe("legacy-fh-migrated");
    expect(tour.itinerary.length).toBeGreaterThan(1);
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
    expect(html).toContain('data-testid="engine6-itinerary-timeline"');
    expect(html).not.toContain("Prices starting at");
  });

  it("migrates the entire Miami FH batch in replacement mode", () => {
    expect(miamiLegacyMigratedRecords.length).toBe(
      MIAMI_MIGRATION_SLUGS.length
    );
    expect(miamiLegacyMigratedRecords.length).toBeGreaterThan(0);

    for (const record of miamiLegacyMigratedRecords) {
      const tourSlug = record.slug;
      const migrated = getLegacyFhMigratedTourBySlugs(
        "florida",
        "miami",
        tourSlug
      );
      expect(migrated, `missing migrated Miami slug ${tourSlug}`).toBeTruthy();
      expect(migrated?.canonicalPath).toBe(
        `/destinations/florida/miami/tours/${tourSlug}`
      );
      expect(migrated?.bookingUrl).toBe(
        `/destinations/florida/miami/tours/${tourSlug}/book`
      );
      expect(record.overviewWordCount).toBeGreaterThanOrEqual(100);
      expect(record.overviewLowConfidence).toBe(false);
    }
  });

  it("dedupes Miami listings so Engine6 wins canonical collisions", () => {
    const cityTours = getToursByCity("florida", "miami");
    const unifiedTours = getToursByCityUnified("florida", "miami");

    for (const slug of MIAMI_MIGRATION_SLUGS) {
      const cityMatches = cityTours.filter(tour => tour.slug === slug);
      expect(cityMatches, `duplicate city listing for ${slug}`).toHaveLength(1);
      expect(cityMatches[0]?.engine).toBe("engine6");

      const canonicalPath = `/destinations/florida/miami/tours/${slug}`;
      const unifiedMatches = unifiedTours.filter(
        entry => entry.href === canonicalPath
      );
      expect(
        unifiedMatches,
        `duplicate unified listing for ${slug}`
      ).toHaveLength(1);
      expect(unifiedMatches[0]?.tour.engine).toBe("engine6");
    }
  });

  it("spot-checks Miami migrated route parity for price, hero, and CTA /book preservation", () => {
    const slugsToCheck = MIAMI_MIGRATION_SLUGS.slice(0, 3);

    for (const slug of slugsToCheck) {
      const routePath = `/destinations/florida/miami/tours/${slug}`;
      Object.assign(globalThis, {
        location: {
          pathname: routePath,
          search: "",
          hash: "",
        },
      });

      const html = renderToString(
        <CityTourDetailRoute
          params={{
            stateSlug: "florida",
            citySlug: "miami",
            tourSlug: slug,
          }}
        />
      );

      expect(html).toContain('data-testid="engine6-hero-banner"');
      expect(html).toContain('data-testid="engine6-bottom-cta"');
      expect(html).toContain(`href="${routePath}/book"`);
      expect(html).not.toContain("Meeting point: Meeting point:");
    }
  });
});
