import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import Engine6TourPage from "./components/Engine6TourPage";
import { toEngine6Card } from "./cards";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import { buildEngine6ValidationReport } from "./validation";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";
import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import { buildEngine6ParentCityToursPath } from "./routeIntegrity";
import type { Engine6ApiResponse } from "./types";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const toPayload = (
  fixture: (typeof ENGINE6_VALIDATION_FIXTURES)[number]
): Engine6ApiResponse => {
  const extraction = extractEngine6Product(fixture.rawPayload);

  return {
    source: "live-api",
    rawProductCode: fixture.productCode,
    rawProduct: extraction.product,
    diagnostics: {
      source: "live-api",
      hasViatorApiKey: false,
      attemptedLiveFetch: false,
      upstreamStatus: null,
      upstreamContentType: "text/html fixture derived from public viator page",
      upstreamOk: null,
      usedBundledFallbackBecause: "validation-fixture-from-public-page",
      ...extraction.diagnostics,
      bookingUrlSource:
        extraction.diagnostics.productUrlFieldPath ??
        "generated:viator-search-product-code",
      fieldLevelFallbackUsed: false,
      fallbackFieldNames: [],
    },
    extracted: extraction.extracted,
  };
};

const countStructuredSourceStops = (rawPayload: Record<string, unknown>) => {
  const product = ((rawPayload as any).product ?? rawPayload) as any;
  const rows = Array.isArray(product.itineraryItems)
    ? product.itineraryItems
    : Array.isArray(product.itinerary?.itineraryItems)
      ? product.itinerary.itineraryItems
      : [];

  return rows.filter((item: unknown) => {
    if (!item || typeof item !== "object") return false;
    const row = item as Record<string, unknown>;
    return typeof row.title === "string" || typeof row.name === "string";
  }).length;
};

describe("engine6 single-tour validation harness", () => {
  const strictHeroFixtures = ENGINE6_VALIDATION_FIXTURES.filter(fixture => {
    const extraction = extractEngine6Product(fixture.rawPayload);
    return Boolean(extraction.extracted.heroImageUrl?.trim());
  });

  it.each(strictHeroFixtures)(
    "validates %s end-to-end with product-scoped hero resolution",
    fixture => {
      const payload = toPayload(fixture);
      const tour = mapViatorToEngine6Tour(payload);
      const card = toEngine6Card(tour);
      const html = renderToString(<Engine6TourPage tour={tour} />);
      const schema = buildEngine6SchemaGraph(tour);
      const graph = schema["@graph"] as Array<Record<string, unknown>>;
      const offer = graph.find(node => node["@type"] === "Offer");
      const product = graph.find(node => node["@type"] === "Product") as
        | Record<string, unknown>
        | undefined;
      const trip = graph.find(node => node["@type"] === "TouristTrip") as
        | Record<string, unknown>
        | undefined;
      const webPage = graph.find(node => node["@type"] === "WebPage") as
        | Record<string, unknown>
        | undefined;
      const rawPayload = fixture.rawPayload as any;
      const parentCityToursPath = buildEngine6ParentCityToursPath(
        tour.canonicalPath
      );
      const expectedHero = (rawPayload.product?.media?.images?.[0]?.variants
        ?.FULL?.url ??
        rawPayload.product?.media?.images?.[0]?.url ??
        rawPayload.media?.images?.[0]?.variants?.FULL?.url ??
        rawPayload.media?.images?.[0]?.url ??
        rawPayload.media?.images?.[0]?.variants?.[0]?.url ??
        rawPayload.images?.[0]?.variants?.[0]?.url ??
        rawPayload.images?.[0]?.url ??
        null) as string | null;

      expect(tour.productCode).toBe(fixture.productCode);
      expect(tour.heroImageUrl).toBe(expectedHero);
      expect(tour.heroImageUrl).not.toContain("/hero.jpg");
      expect(["api-primary", "api-gallery"]).toContain(
        tour.diagnostics.heroSourceType
      );
      expect(tour.diagnostics.heroFallbackTriggered).toBe(false);
      expect(tour.diagnostics.rejectedForeignHeroCandidates).toEqual([]);
      const structuredStops = countStructuredSourceStops(fixture.rawPayload);
      if (structuredStops >= 2) {
        expect(tour.itinerary.length).toBeGreaterThanOrEqual(2);
        expect(html).toContain('data-testid="engine6-itinerary-timeline"');
      }
      expect(tour.priceFormatted).toMatch(/^(Starting at|From) \$/);
      expect(tour.aggregateRating).toBeGreaterThan(4);
      expect(tour.reviewCount).toBeGreaterThan(0);
      expect(tour.seoTitle).toContain(tour.title);
      expect(tour.metaDescription.length).toBeLessThanOrEqual(160);
      expect(tour.metaDescription).not.toContain("Best tour");
      if (tour.bookingUrl.startsWith("/destinations/")) {
        expect(tour.bookingUrl).toContain("/book");
      } else {
        expect(tour.bookingUrl).toContain("pid=P00290915");
        expect(tour.bookingUrl).toContain("mcid=42383");
        expect(tour.bookingUrl).toContain("medium=link");
        expect(tour.bookingUrl.startsWith(fixture.publicUrl)).toBe(true);
      }
      expect(card.href).toBe(tour.pagePath);
      expect(card.href).toBe(tour.canonicalPath);
      expect(card.imageUrl).toBe(tour.heroImageUrl);
      expect(card.description.length).toBeGreaterThan(40);
      expect(html).toContain(tour.title);
      expect(html).toContain(
        `src="${tour.heroImageUrl.replace(/&/g, "&amp;")}"`
      );
      expect(html).toContain(tour.priceFormatted);
      expect(html).toContain(tour.bookingUrl.replace(/&/g, "&amp;"));
      expect(html).not.toContain(">ENGINE6<");
      expect(html).not.toContain("img.test");
      expect(tour.canonicalPath.includes("/united-states/")).toBe(false);
      expect(parentCityToursPath).toBeTruthy();
      expect(html).toContain('data-testid="engine6-breadcrumbs"');
      expect(html).toContain('data-testid="engine6-back-to-tours"');
      expect(html).toContain(`href="${parentCityToursPath}"`);
      expect(graph.some(node => node["@type"] === "BreadcrumbList")).toBe(true);
      expect(graph.some(node => node["@type"] === "WebPage")).toBe(true);
      expect(graph.some(node => node["@type"] === "Product")).toBe(true);
      expect(graph.some(node => node["@type"] === "TouristTrip")).toBe(true);
      expect(graph.some(node => node["@type"] === "AggregateRating")).toBe(
        true
      );
      expect(graph.some(node => node["@type"] === "FAQPage")).toBe(
        tour.faqs.length > 0
      );
      expect(offer?.url).toBe(tour.bookingUrl);
      expect(offer?.price).toBe(tour.priceAmount ?? undefined);
      expect(
        String((offer as { priceValidUntil?: string }).priceValidUntil)
      ).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(product?.image).toBe(tour.heroImageUrl);
      expect(trip?.image).toBe(tour.heroImageUrl);
      expect(product?.name).toBe(trip?.name);
      expect(webPage?.name).toBe(product?.name);
      expect(String(product?.description ?? "").length).toBeGreaterThan(40);
      expect(product?.url).toBe(
        `https://www.alloutdooradventures.com${tour.canonicalPath}`
      );
      const breadcrumbList = graph.find(node => node["@type"] === "BreadcrumbList") as
        | {
            itemListElement?: Array<{ position?: number; item?: string }>;
          }
        | undefined;
      const schemaParentCityItem = breadcrumbList?.itemListElement?.find(
        entry => entry.position === 3
      )?.item;
      expect(schemaParentCityItem).toBe(
        `https://www.alloutdooradventures.com${parentCityToursPath}`
      );
      expect(tour.diagnostics.bookingUrlSource).toBe("product.productUrl");
      if (!tour.diagnostics.fieldLevelFallbackUsed) {
        expect(tour.diagnostics.fallbackFieldNames).toEqual([]);
      }

      const openingSentence = tour.description.split(".")[0] ?? "";
      expect(openingSentence).toContain(tour.city);
      expect(
        /^(Join|Discover|Experience|Explore)\b/.test(openingSentence.trim())
      ).toBe(true);
    }
  );

  it("fails strict image validation when no exact-product image exists", () => {
    const fixture = ENGINE6_VALIDATION_FIXTURES.find(
      entry => entry.productCode === "36001P1"
    );
    expect(fixture).toBeDefined();
    const payload = toPayload(fixture!);
    const tour = mapViatorToEngine6Tour(payload);

    expect(tour.heroImageUrl).toBeNull();
    expect(tour.diagnostics.heroFallbackTriggered).toBe(true);
    expect(tour.diagnostics.heroPlaceholderFallbackReason).toBe("no-candidates");
  });

  it("rotates standardized SEO openings across multiple tours", () => {
    const tours = ENGINE6_VALIDATION_FIXTURES.map(fixture =>
      mapViatorToEngine6Tour(toPayload(fixture))
    );
    const openings = tours.map(tour =>
      (tour.description.split(".")[0] ?? "").trim()
    );
    const uniqueOpenings = new Set(openings);

    expect(uniqueOpenings.size).toBeGreaterThanOrEqual(3);
  });

  it("emits a compact validation report for each Engine6 tour fixture", () => {
    const reports = ENGINE6_VALIDATION_FIXTURES.map(
      buildEngine6ValidationReport
    );

    expect(reports).toHaveLength(ENGINE6_VALIDATION_FIXTURES.length);
    expect(reports.every(report => report.cardRenderSucceeded)).toBe(true);
    expect(reports.every(report => report.pageRenderSucceeded)).toBe(true);
    expect(
      reports.every(
        report =>
          report.bookingAttributionResult.startsWith(
            "https://www.viator.com/tours/"
          ) || report.bookingAttributionResult.startsWith("/destinations/")
      )
    ).toBe(true);
    expect(
      reports.every(report => report.jsonLdEntityCoverage.includes("Offer"))
    ).toBe(true);
    expect(
      reports.every(report => report.remainingEngineWideIssue === null)
    ).toBe(true);
  });
});
