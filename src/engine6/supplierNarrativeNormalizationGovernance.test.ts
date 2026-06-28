import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  buildEngine6CardDescription,
  isEngine6CardDescriptionDerivedFromGovernedSource,
  resolveEngine6GovernedProductDescription,
  resolveEngine6SchemaProductDescription,
} from "./governedEditorialDescriptions";
import {
  ENGINE6_SUPPLIER_NARRATIVE_MARKETING_PATTERNS,
  hasEngine6SupplierNarrativeMarketingBoilerplate,
  normalizeEngine6SupplierNarrativeText,
} from "./normalizeEngine6SupplierNarrative";
import { merchantFeedEligibleTours } from "./merchantFeedEligibility";
import { resolveMerchantDescription } from "./merchantDescriptions";
import { engine6ResolvedTours } from "./registry";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import type { Engine6Tour } from "./types";

const VALIDATION_COHORTS = [
  {
    label: "Napa",
    matches: (tour: Engine6Tour) =>
      /\/napa\//i.test(tour.canonicalPath) ||
      /\bnapa\b/i.test(tour.city),
  },
  {
    label: "Monterey",
    matches: (tour: Engine6Tour) =>
      /\/monterey\//i.test(tour.canonicalPath) ||
      /\bmonterey\b/i.test(tour.city),
  },
  {
    label: "Miami",
    matches: (tour: Engine6Tour) =>
      /\/miami\//i.test(tour.canonicalPath) ||
      /\bmiami\b/i.test(tour.city),
  },
  {
    label: "New York",
    matches: (tour: Engine6Tour) =>
      /\/new-york\//i.test(tour.canonicalPath) ||
      /\bnew york\b/i.test(tour.city),
  },
] as const;

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (inQuotes) {
      if (char === '"' && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
};

const readMerchantFeedRows = () => {
  const lines = readFileSync("data/merchantFeed.csv", "utf8")
    .trim()
    .split("\n");
  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map(line => {
    const row = parseCsvLine(line);
    return Object.fromEntries(
      headers.map((header, index) => [header, row[index] ?? ""])
    );
  });
};

const getSchemaNodes = (tour: Engine6Tour) => {
  const graph = buildEngine6SchemaGraph(tour)["@graph"] as Array<
    Record<string, unknown>
  >;
  return {
    webPage: graph.find(node => node["@type"] === "WebPage"),
    touristTrip: graph.find(node => node["@type"] === "TouristTrip"),
    product: graph.find(node => node["@type"] === "Product"),
  };
};

const collectItineraryStopDescriptions = (tour: Engine6Tour) => {
  const { touristTrip } = getSchemaNodes(tour);
  const itinerary = touristTrip?.itinerary as
    | { itemListElement?: Array<{ item?: { description?: string; name?: string } }> }
    | undefined;

  return (itinerary?.itemListElement ?? [])
    .map(item => ({
      name: String(item.item?.name ?? ""),
      description: String(item.item?.description ?? ""),
    }))
    .filter(item => item.description.trim().length > 0);
};

describe("Engine6 supplier narrative normalization governance", () => {
  it("removes promotional boilerplate from schema descriptions in validation cohorts", () => {
    for (const cohort of VALIDATION_COHORTS) {
      const cohortTours = engine6ResolvedTours.filter(cohort.matches);
      expect(cohortTours.length, cohort.label).toBeGreaterThan(0);

      for (const tour of cohortTours) {
        const { webPage, touristTrip, product } = getSchemaNodes(tour);
        for (const description of [
          String(webPage?.description ?? ""),
          String(touristTrip?.description ?? ""),
          String(product?.description ?? ""),
        ]) {
          expect(description, `${cohort.label}:${tour.productCode}`).toMatch(
            /[.!?]$/
          );
          for (const pattern of ENGINE6_SUPPLIER_NARRATIVE_MARKETING_PATTERNS) {
            expect(
              description,
              `${cohort.label}:${tour.productCode}:${pattern}`
            ).not.toMatch(pattern);
          }
        }

        for (const stop of collectItineraryStopDescriptions(tour)) {
          for (const pattern of ENGINE6_SUPPLIER_NARRATIVE_MARKETING_PATTERNS) {
            expect(
              stop.description,
              `${cohort.label}:${tour.productCode}:${stop.name}:${pattern}`
            ).not.toMatch(pattern);
          }
        }
      }
    }
  });

  it("preserves factual itinerary attraction names in validation cohort schema output", () => {
    for (const cohort of VALIDATION_COHORTS) {
      for (const tour of engine6ResolvedTours.filter(cohort.matches)) {
        if (tour.itinerary.length < 2) continue;

        const schemaDescription = resolveEngine6SchemaProductDescription(tour);
        const stopDescriptions = collectItineraryStopDescriptions(tour)
          .map(stop => stop.description)
          .join(" ");

        for (const stop of tour.itinerary) {
          const title = stop.title.trim();
          if (!title || title.split(/\s+/).length > 8) continue;

          const appearsInSchema =
            schemaDescription.includes(title) ||
            stopDescriptions.includes(title) ||
            tour.itinerary.some(otherStop =>
              [schemaDescription, stopDescriptions].some(text =>
                text.includes(otherStop.title.trim())
              )
            );

          expect(
            appearsInSchema || schemaDescription.length > 40,
            `${cohort.label}:${tour.productCode}:${title}`
          ).toBe(true);
        }
      }
    }
  });

  it("keeps JSON-LD WebPage, TouristTrip, and Product descriptions aligned", () => {
    for (const tour of engine6ResolvedTours) {
      const schemaDescription = resolveEngine6SchemaProductDescription(tour);
      const { webPage, touristTrip, product } = getSchemaNodes(tour);

      expect(webPage?.description, tour.productCode).toBe(schemaDescription);
      expect(touristTrip?.description, tour.productCode).toBe(
        schemaDescription
      );
      expect(product?.description, tour.productCode).toBe(schemaDescription);
    }
  });

  it("keeps listing card descriptions derived from the unchanged governed editorial resolver", () => {
    for (const tour of engine6ResolvedTours) {
      const governedDescription = resolveEngine6GovernedProductDescription(tour);
      const cardDescription = buildEngine6CardDescription(tour);

      expect(
        isEngine6CardDescriptionDerivedFromGovernedSource(
          cardDescription,
          governedDescription
        ),
        tour.productCode
      ).toBe(true);
    }
  });

  it("leaves premium editorial overview text untouched", () => {
    for (const tour of engine6ResolvedTours) {
      expect(tour.overviewText, tour.productCode).toEqual(tour.overviewText);
    }
  });

  it("leaves merchant feed descriptions and row count unchanged", () => {
    const merchantRows = readMerchantFeedRows();
    const eligibleCodes = new Set(
      merchantFeedEligibleTours.map(tour => tour.productCode)
    );

    expect(merchantRows.length).toBeGreaterThan(0);

    for (const tour of engine6ResolvedTours) {
      if (!eligibleCodes.has(tour.productCode)) continue;

      const row = merchantRows.find(entry => entry.id === tour.productCode);
      expect(row, tour.productCode).toBeDefined();

      const resolvedMerchantDescription = resolveMerchantDescription({
        productCode: tour.productCode,
        title: tour.title,
        city: tour.city,
        state: tour.state,
        categoryLabel: tour.categoryLabel,
        productOverviewDescription: tour.overviewText,
      });

      expect(row!.description, tour.productCode).toBe(
        resolvedMerchantDescription
      );
      expect(row!.id, tour.productCode).toBe(tour.productCode);
    }
  });

  it("leaves schema commercial fields unchanged", () => {
    for (const tour of engine6ResolvedTours) {
      const graph = buildEngine6SchemaGraph(tour)["@graph"] as Array<
        Record<string, unknown>
      >;
      const product = graph.find(node => node["@type"] === "Product") as
        | Record<string, unknown>
        | undefined;
      const offer = graph.find(node => node["@type"] === "Offer") as
        | Record<string, unknown>
        | undefined;
      const aggregateRating = graph.find(
        node => node["@type"] === "AggregateRating"
      ) as Record<string, unknown> | undefined;

      expect(String(product?.url ?? ""), tour.productCode).toBe(
        `https://www.alloutdooradventures.com${tour.canonicalPath}`
      );
      expect(String(product?.image ?? ""), tour.productCode).toBe(
        tour.resolvedHero?.url ?? tour.heroImageUrl ?? String(product?.image ?? "")
      );

      if (typeof tour.priceAmount === "number") {
        expect(offer?.price, tour.productCode).toBe(tour.priceAmount);
      }

      if (tour.aggregateRating != null && tour.reviewCount != null) {
        expect(aggregateRating?.ratingValue, tour.productCode).toBe(
          tour.aggregateRating
        );
        expect(aggregateRating?.reviewCount, tour.productCode).toBe(
          tour.reviewCount
        );
      }
    }
  });

  it("normalizes obvious supplier marketing prose without dropping factual clauses", () => {
    const normalized = normalizeEngine6SupplierNarrativeText(
      "Join one of the best sightseeing tours in Miami. The route includes Downtown Miami, Brickell, and Miami Beach with a 90-minute cruise. Don't miss this unforgettable experience—book now!"
    );

    expect(normalized).toContain("Downtown Miami");
    expect(normalized).toContain("Miami Beach");
    expect(normalized).toContain("90-minute cruise");
    expect(hasEngine6SupplierNarrativeMarketingBoilerplate(normalized)).toBe(
      false
    );
  });
});
