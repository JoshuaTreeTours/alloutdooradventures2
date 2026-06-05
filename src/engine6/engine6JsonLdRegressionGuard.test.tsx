import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import Engine6TourPage from "./components/Engine6TourPage";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import { buildEngine6Seo } from "./seo";
import type { Engine6ApiResponse } from "./types";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";

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
      upstreamContentType: "application/json fixture",
      upstreamOk: null,
      usedBundledFallbackBecause: "engine6-json-ld-regression-guard",
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

const getSchemaIds = (graph: Array<Record<string, unknown>>) =>
  graph
    .map(node => node["@id"])
    .filter((id): id is string => typeof id === "string");

const expectNoDuplicateSchemaIds = (graph: Array<Record<string, unknown>>) => {
  const ids = getSchemaIds(graph);
  expect(new Set(ids).size).toBe(ids.length);
};

const getFixture = (productCode: string) => {
  const fixture = ENGINE6_VALIDATION_FIXTURES.find(
    entry => entry.productCode === productCode
  );
  if (!fixture) {
    throw new Error(`Missing Engine6 fixture for ${productCode}`);
  }
  return fixture;
};

describe("Engine6 JSON-LD regression guard", () => {
  it("keeps representative detail pages rendering Product, TouristTrip, WebPage, canonical meta data, and hero", () => {
    const representativeProductCodes = ["118958P8", "63657P1", "6740P7"];

    representativeProductCodes.forEach(productCode => {
      const tour = mapViatorToEngine6Tour(toPayload(getFixture(productCode)));
      const html = renderToString(<Engine6TourPage tour={tour} />);
      const schema = buildEngine6SchemaGraph(tour);
      const graph = schema["@graph"] as Array<Record<string, unknown>>;
      const seo = buildEngine6Seo(tour);

      expect(html).not.toContain("Engine6 specimen unavailable");
      expect(graph.some(node => node["@type"] === "Product")).toBe(true);
      expect(graph.some(node => node["@type"] === "TouristTrip")).toBe(true);
      expect(graph.some(node => node["@type"] === "WebPage")).toBe(true);
      expect(graph.some(node => node["@type"] === "BreadcrumbList")).toBe(true);
      expectNoDuplicateSchemaIds(graph);
      expect(seo.url).toBe(tour.canonicalPath);
      expect(seo.title).toContain(tour.seoTitle);
      expect(seo.description.length).toBeGreaterThan(40);
      expect(seo.image).toBeTruthy();
      expect(html).toContain('data-testid="engine6-hero-banner"');
      expect(html).toContain(tour.title);
      expect(html).toContain(
        `src="${String(seo.image).replace(/&/g, "&amp;")}"`
      );
    });
  });
});
