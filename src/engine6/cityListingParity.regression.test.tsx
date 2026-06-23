import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import TourCard from "../components/TourCard";
import Engine6TourPage, {
  hydrateRelatedTourCommercialFields,
} from "./components/Engine6TourPage";
import { toEngine6Card } from "./cards";
import { engine6ListingTours } from "./listing";
import { engine6ResolvedTours } from "./registry";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import { getToursByCityUnified } from "../data/tours";
import {
  fetchEngine6LiveProductFields,
  mergeEngine6LiveFieldsIntoTour,
} from "./liveProductFields";

describe("engine6 city listing parity regression", () => {
  it("renders 335698P13 ratings from the same normalized Engine6 source on page, city card, related card, schema, and fixture card", () => {
    const previousWindow = (globalThis as { window?: Window }).window;
    const previousLocation = (globalThis as { location?: Location }).location;
    (globalThis as { window?: Window }).window = {
      location: {
        pathname: "/destinations/california/joshua-tree/tours",
        search: "",
      },
      history: { pushState: () => undefined },
    } as unknown as Window;
    (globalThis as { location?: Location }).location = (
      globalThis as {
        window?: Window;
      }
    ).window!.location as unknown as Location;

    const tour = engine6ResolvedTours.find(
      candidate => candidate.productCode === "335698P13"
    );
    expect(tour).toBeDefined();

    const expectedRating = tour!.aggregateRating?.toFixed(1);
    const expectedReviewCount = tour!.reviewCount;
    expect(expectedRating).toBe("5.0");
    expect(expectedReviewCount).toBe(86);

    const pageHtml = renderToString(<Engine6TourPage tour={tour!} />);
    expect(pageHtml).toContain(expectedRating);
    expect(pageHtml).toContain(String(expectedReviewCount));
    expect(pageHtml).toContain("rating");
    expect(pageHtml).toContain("reviews");

    const fixtureCard = toEngine6Card(tour!);
    expect(fixtureCard.ratingLabel).toBe(
      `★ ${expectedRating} (${expectedReviewCount})`
    );

    const cityListingTour = engine6ListingTours.find(
      candidate => candidate.productCode === "335698P13"
    );
    expect(cityListingTour?.badges.rating).toBe(tour!.aggregateRating);
    expect(cityListingTour?.badges.reviewCount).toBe(tour!.reviewCount);

    const cityCardHtml = renderToString(
      <TourCard tour={cityListingTour!} href={tour!.canonicalPath} />
    );
    expect(cityCardHtml).toContain("★");
    expect(cityCardHtml).toContain(expectedRating);
    expect(cityCardHtml).toContain(String(expectedReviewCount));
    expect(cityCardHtml).toContain("reviews");

    const relatedEntry = { tour: cityListingTour!, href: tour!.canonicalPath };
    const hydratedRelatedEntry = hydrateRelatedTourCommercialFields(
      relatedEntry,
      {
        aggregateRating: tour!.aggregateRating,
        reviewCount: tour!.reviewCount,
      }
    );
    const relatedCardHtml = renderToString(
      <TourCard
        tour={hydratedRelatedEntry.tour}
        href={hydratedRelatedEntry.href}
      />
    );
    expect(relatedCardHtml).toContain("★");
    expect(relatedCardHtml).toContain(expectedRating);
    expect(relatedCardHtml).toContain(String(expectedReviewCount));
    expect(relatedCardHtml).toContain("reviews");

    const aggregateRating = (
      buildEngine6SchemaGraph(tour!)["@graph"] as Array<Record<string, unknown>>
    ).find(node => node["@type"] === "AggregateRating");
    expect(aggregateRating?.ratingValue).toBe(tour!.aggregateRating);
    expect(aggregateRating?.reviewCount).toBe(tour!.reviewCount);

    (globalThis as { window?: Window }).window = previousWindow;
    (globalThis as { location?: Location }).location = previousLocation;
  });
  it("hydrates rendered San Francisco Napa/Sonoma card to match detail commercial values", async () => {
    const previousWindow = (globalThis as { window?: Window }).window;
    const previousLocation = (globalThis as { location?: Location }).location;
    (globalThis as { window?: Window }).window = {
      location: {
        pathname: "/destinations/california/san-francisco/tours",
        search: "",
      },
      history: { pushState: () => undefined },
    } as unknown as Window;
    (globalThis as { location?: Location }).location = (
      globalThis as { window?: Window }
    ).window!.location as unknown as Location;
    const cityEntry = getToursByCityUnified("california", "san-francisco").find(
      entry =>
        entry.tour.engine === "engine6" &&
        entry.tour.productCode === "2660SFOWIN"
    );
    expect(cityEntry).toBeDefined();

    const fields = await fetchEngine6LiveProductFields(
      "2660SFOWIN",
      (async () =>
        ({
          ok: true,
          json: async () => ({
            extracted: {
              priceAmount: 156.75,
              priceFormatted: "From $156.75",
              aggregateRating: 4.3,
              reviewCount: 4512,
              durationText: "9 hours",
              meetingPointText: "Union Square",
            },
          }),
        }) as Response) as typeof fetch
    );

    const hydrated = mergeEngine6LiveFieldsIntoTour(
      cityEntry!.tour,
      fields ?? undefined
    );
    const html = renderToString(
      <TourCard tour={hydrated} href={cityEntry!.href} />
    );

    expect(html).toContain("$156.75");
    expect(html).toContain("4512");
    expect(html).toContain("4.3");

    (globalThis as { window?: Window }).window = previousWindow;
    (globalThis as { location?: Location }).location = previousLocation;
  });

  it("hydrates San Francisco related-tour card render with live Engine6 values", async () => {
    const previousWindow = (globalThis as { window?: Window }).window;
    const previousLocation = (globalThis as { location?: Location }).location;
    (globalThis as { window?: Window }).window = {
      location: {
        pathname: "/destinations/california/san-francisco/tours",
        search: "",
      },
      history: { pushState: () => undefined },
    } as unknown as Window;
    (globalThis as { location?: Location }).location = (
      globalThis as { window?: Window }
    ).window!.location as unknown as Location;
    const relatedEntry = getToursByCityUnified(
      "california",
      "san-francisco"
    ).find(
      entry =>
        entry.tour.engine === "engine6" && entry.tour.productCode === "36001P14"
    );
    expect(relatedEntry).toBeDefined();

    const fields = await fetchEngine6LiveProductFields(
      "36001P14",
      (async () =>
        ({
          ok: true,
          json: async () => ({
            extracted: {
              priceAmount: 219,
              priceFormatted: "From $219.00",
              aggregateRating: 4.7,
              reviewCount: 1880,
              durationText: "14 hours",
              meetingPointText: "San Francisco",
            },
          }),
        }) as Response) as typeof fetch
    );

    const hydrated = mergeEngine6LiveFieldsIntoTour(
      relatedEntry!.tour,
      fields ?? undefined
    );
    const html = renderToString(
      <TourCard tour={hydrated} href={relatedEntry!.href} />
    );

    expect(html).toContain("$219");
    expect(html).toContain("1880");
    expect(html).toContain("4.7");
    expect(html).toContain(relatedEntry!.href);
    expect(html).toContain(
      (relatedEntry!.tour.heroImage ?? "").replaceAll("&", "&amp;")
    );

    (globalThis as { window?: Window }).window = previousWindow;
    (globalThis as { location?: Location }).location = previousLocation;
  });
});
