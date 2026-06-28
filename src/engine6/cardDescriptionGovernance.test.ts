import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import { toEngine6Card } from "./cards";
import {
  buildEngine6CardDescription,
  hasEngine6CardForbiddenTemplatePhrase,
  isEngine6CardDescriptionDerivedFromGovernedSource,
  resolveEngine6GovernedProductDescription,
} from "./governedEditorialDescriptions";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import { merchantFeedEligibleTours } from "./merchantFeedEligibility";
import { resolveMerchantDescription } from "./merchantDescriptions";
import { engine6ResolvedTours } from "./registry";
import { ENGINE6_ORIGINAL_MERCHANT_APPROVED_PRODUCT_CODES } from "./routes";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import type { Engine6ApiResponse } from "./types";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";

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

const readMerchantDescriptions = () => {
  const lines = readFileSync("data/merchantFeed.csv", "utf8")
    .trim()
    .split("\n");
  const headers = parseCsvLine(lines[0]);
  const idIndex = headers.indexOf("id");
  const descriptionIndex = headers.indexOf("description");

  return new Map(
    lines.slice(1).map(line => {
      const row = parseCsvLine(line);
      return [row[idIndex], row[descriptionIndex]] as const;
    })
  );
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
      usedBundledFallbackBecause: "card-description-governance-test",
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

describe("Engine6 card description governance", () => {
  it("derives every published card description from the governed overview pipeline", () => {
    for (const tour of engine6ResolvedTours) {
      const governedDescription = resolveEngine6GovernedProductDescription(tour);
      const card = toEngine6Card(tour);

      expect(governedDescription.length, tour.productCode).toBeGreaterThan(40);
      expect(card.description.length, tour.productCode).toBeGreaterThan(40);
      expect(
        isEngine6CardDescriptionDerivedFromGovernedSource(
          card.description,
          governedDescription
        ),
        tour.productCode
      ).toBe(true);
      expect(
        hasEngine6CardForbiddenTemplatePhrase(card.description),
        tour.productCode
      ).toBe(false);
    }
  });

  it("keeps card helper output aligned with the governed editorial resolver", () => {
    for (const tour of engine6ResolvedTours) {
      const card = toEngine6Card(tour);
      expect(card.description, tour.productCode).toBe(
        buildEngine6CardDescription(tour)
      );
    }
  });

  it("keeps listing cards aligned with Product JSON-LD governed descriptions", () => {
    for (const tour of engine6ResolvedTours) {
      const graph = buildEngine6SchemaGraph(tour)["@graph"] as Array<
        Record<string, unknown>
      >;
      const product = graph.find(node => node["@type"] === "Product");
      const productDescription = String(product?.description ?? "");
      const card = toEngine6Card(tour);

      expect(productDescription, tour.productCode).toBe(
        resolveEngine6GovernedProductDescription(tour)
      );
      expect(
        isEngine6CardDescriptionDerivedFromGovernedSource(
          card.description,
          productDescription
        ),
        tour.productCode
      ).toBe(true);
    }
  });

  it("maintains editorial parity between merchant-eligible rows and listing cards", () => {
    const merchantDescriptions = readMerchantDescriptions();
    const eligibleProductCodes = new Set(
      merchantFeedEligibleTours.map(tour => tour.productCode)
    );

    for (const tour of engine6ResolvedTours) {
      if (!eligibleProductCodes.has(tour.productCode)) {
        continue;
      }

      if (
        ENGINE6_ORIGINAL_MERCHANT_APPROVED_PRODUCT_CODES.has(tour.productCode)
      ) {
        continue;
      }

      const graph = buildEngine6SchemaGraph(tour)["@graph"] as Array<
        Record<string, unknown>
      >;
      const product = graph.find(node => node["@type"] === "Product");
      const productDescription = String(product?.description ?? "");
      const resolvedMerchantDescription = resolveMerchantDescription({
        productCode: tour.productCode,
        title: tour.title,
        city: tour.city,
        categoryLabel: tour.categoryLabel,
        productOverviewDescription: tour.overviewText,
        pageMetadataDescription: tour.metaDescription || tour.seoDescription,
        jsonLdProductDescription: productDescription,
        viatorApiDescription: tour.overviewText,
        itineraryStops: tour.itinerary,
        highlights: tour.highlights,
        included: tour.included,
        durationText: tour.durationText,
      });
      const merchantDescription =
        merchantDescriptions.get(tour.productCode) ?? "";
      const card = toEngine6Card(tour);

      expect(resolvedMerchantDescription, tour.productCode).toBe(
        productDescription
      );
      expect(merchantDescription, tour.productCode).toBe(productDescription);
      expect(
        isEngine6CardDescriptionDerivedFromGovernedSource(
          card.description,
          productDescription
        ),
        tour.productCode
      ).toBe(true);
    }
  });

  it("inherits governed card descriptions for newly mapped Engine6 products", () => {
    for (const fixture of ENGINE6_VALIDATION_FIXTURES.slice(0, 5)) {
      const tour = mapViatorToEngine6Tour(toPayload(fixture));
      const card = toEngine6Card(tour);
      const governedDescription = resolveEngine6GovernedProductDescription(tour);

      expect(card.description.length, fixture.productCode).toBeGreaterThan(40);
      expect(
        isEngine6CardDescriptionDerivedFromGovernedSource(
          card.description,
          governedDescription
        ),
        fixture.productCode
      ).toBe(true);
      expect(
        hasEngine6CardForbiddenTemplatePhrase(card.description),
        fixture.productCode
      ).toBe(false);
    }
  });
});
