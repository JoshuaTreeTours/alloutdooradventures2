import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import Engine6TourPage from "./components/Engine6TourPage";
import { toEngine6Card } from "./cards";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import { buildEngine6ValidationReport } from "./validation";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";
import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
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

describe("engine6 single-tour validation harness", () => {
  it.each(ENGINE6_VALIDATION_FIXTURES)(
    "validates %s end-to-end with product-scoped hero resolution",
    fixture => {
      const payload = toPayload(fixture);
      const tour = mapViatorToEngine6Tour(payload);
      const card = toEngine6Card(tour);
      const html = renderToString(<Engine6TourPage tour={tour} />);
      const schema = buildEngine6SchemaGraph(tour);
      const graph = schema["@graph"] as Array<Record<string, unknown>>;
      const offer = graph.find(node => node["@type"] === "Offer");

      expect(tour.productCode).toBe(fixture.productCode);
      expect(tour.heroImageUrl).toBe(
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg"
      );
      expect(tour.heroImageUrl).not.toContain("/hero.jpg");
      expect(tour.cardImageUrl).toBe(tour.heroImageUrl);
      expect(tour.diagnostics.heroSourceType).toBe("api-primary");
      expect(tour.diagnostics.heroFallbackTriggered).toBe(false);
      expect(tour.diagnostics.rejectedForeignHeroCandidates).toEqual([]);
      expect(tour.priceFormatted).toMatch(/^From \$/);
      expect(tour.aggregateRating).toBeGreaterThan(4);
      expect(tour.reviewCount).toBeGreaterThan(100);
      expect(tour.seoTitle).toContain(tour.title);
      expect(tour.metaDescription.length).toBeLessThanOrEqual(160);
      expect(tour.metaDescription).not.toContain("Best tour");
      expect(tour.bookingUrl).toContain("pid=P00290915");
      expect(tour.bookingUrl).toContain("mcid=42383");
      expect(tour.bookingUrl).toContain("medium=link");
      expect(tour.bookingUrl.startsWith(fixture.publicUrl)).toBe(true);
      expect(card.href).toBe(tour.pagePath);
      expect(card.imageUrl).toBe(tour.cardImageUrl);
      expect(card.description).toContain("Santa Ynez Valley");
      expect(html).toContain(tour.title);
      expect(html).toContain(`src="${tour.heroImageUrl}"`);
      expect(html).toContain(tour.priceFormatted);
      expect(html).toContain(tour.bookingUrl.replace(/&/g, "&amp;"));
      expect(html).not.toContain(">ENGINE6<");
      expect(html).not.toContain("img.test");
      expect(html).not.toContain("/hero.jpg");
      expect(graph.some(node => node["@type"] === "BreadcrumbList")).toBe(
        true
      );
      expect(graph.some(node => node["@type"] === "WebPage")).toBe(true);
      expect(graph.some(node => node["@type"] === "Product")).toBe(true);
      expect(graph.some(node => node["@type"] === "TouristTrip")).toBe(true);
      expect(graph.some(node => node["@type"] === "AggregateRating")).toBe(
        true
      );
      expect(graph.some(node => node["@type"] === "FAQPage")).toBe(true);
      expect(offer?.url).toBe(tour.bookingUrl);
      expect(tour.diagnostics.bookingUrlSource).toBe("product.productUrl");
      expect(tour.diagnostics.fieldLevelFallbackUsed).toBe(false);
      expect(tour.diagnostics.fallbackFieldNames).toEqual([]);
    }
  );

  it("emits a compact validation report for the single Engine6 tour", () => {
    const reports = ENGINE6_VALIDATION_FIXTURES.map(
      buildEngine6ValidationReport
    );

    expect(reports).toHaveLength(1);
    expect(reports.every(report => report.cardRenderSucceeded)).toBe(true);
    expect(reports.every(report => report.pageRenderSucceeded)).toBe(true);
    expect(
      reports.every(report =>
        report.bookingAttributionResult.startsWith(
          "https://www.viator.com/tours/"
        )
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
