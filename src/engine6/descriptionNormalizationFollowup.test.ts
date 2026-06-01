import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { engine6ResolvedTours } from "./registry";
import { buildEngine6Seo } from "./seo";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import { resolveMerchantDescription } from "./merchantDescriptions";

const MALFORMED_ENGINE6_DESCRIPTION_PATTERNS = [
  /^(?:Visit Explore|Explore Discover|See View)\b/i,
  /\bAdmission Ticket Free\b/i,
  /\bAdmission Ticket Included\b/i,
  /\bAdmission Ticket Not Included\b/i,
  /\bFree admission\b/i,
  /\bTicket included\b/i,
  /\bTicket not included\b/i,
  /\bvisited over\b/i,
  /\bpassed along the route over\b/i,
  /\.\.\.|…/,
  /\bYosemite stop\b/i,
  /\blandscape context\b/i,
];

const NEW_ORLEANS_AIRBOAT_PRODUCT_CODE = "6455NOLAAIR";
const NEW_ORLEANS_AIRBOAT_RICH_DESCRIPTION =
  "Ride by airboat through cypress swamp and bayou waterways near Jean Lafitte National Historical Park and Preserve. This New Orleans-area tour focuses on marsh scenery, local wildlife, and captain-led interpretation, with optional hotel transportation on selected bookings and a direct meeting point in Lafitte. The route is water-based rather than a city sightseeing loop, so the experience centers on the airboat launch, swamp channels, and wildlife viewing conditions on the day of travel. Guests depart from Lafitte, south of New Orleans, for a bayou outing shaped by water level, weather, and seasonal wildlife activity.";
const NEW_ORLEANS_AIRBOAT_SERP_DESCRIPTION =
  "Ride by airboat through Lafitte-area cypress swamp near New Orleans, with wildlife viewing, captain commentary, and optional hotel transportation.";

const GENERIC_FALLBACK_PATTERNS = [
  /\bguided experience\b/i,
  /\bclear logistics\b/i,
  /\bmemorable local stops\b/i,
  /\btraveler-friendly pace\b/i,
  /\beasy logistics\b/i,
];

const REPAIRED_ENGINE6_PRODUCT_CODES = new Set([
  "2630SUN",
  "6007P5",
  "415653P2",
  "173946P1",
  "69764P1",
  "5569HIKE",
  "354611P1",
  "23068P2",
  "2660SFOWIN",
  "304471P122",
  "333016P3",
  "53474P8",
  "233384P2",
  "7081NYCDAY",
  "43656P1",
  "5024MANSKY",
]);

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

describe("Engine6-only description normalization follow-up", () => {
  it("keeps Engine6 page, meta, social, and JSON-LD descriptions free of malformed legacy fragments", () => {
    for (const tour of engine6ResolvedTours) {
      const seo = buildEngine6Seo(tour);
      const graph = buildEngine6SchemaGraph(tour)["@graph"] as Array<
        Record<string, unknown>
      >;
      const webPage = graph.find(node => node["@type"] === "WebPage");
      const touristTrip = graph.find(node => node["@type"] === "TouristTrip");
      const product = graph.find(node => node["@type"] === "Product");
      const descriptions = [
        tour.description,
        tour.metaDescription,
        tour.seoDescription,
        seo.description,
        String(webPage?.description ?? ""),
        String(touristTrip?.description ?? ""),
        String(product?.description ?? ""),
      ];

      for (const description of descriptions) {
        expect(description, tour.productCode).toMatch(/[.!?]$/);
        for (const pattern of MALFORMED_ENGINE6_DESCRIPTION_PATTERNS) {
          expect(description, `${tour.productCode}: ${pattern}`).not.toMatch(
            pattern
          );
        }
      }

      for (const description of [
        tour.description,
        tour.metaDescription,
        tour.seoDescription,
      ]) {
        for (const pattern of GENERIC_FALLBACK_PATTERNS) {
          expect(description, `${tour.productCode}: ${pattern}`).not.toMatch(
            pattern
          );
        }
      }

      expect(webPage?.description, tour.productCode).toBe(product?.description);
      expect(product?.description, tour.productCode).toBe(
        touristTrip?.description
      );

      const touristTripItinerary = touristTrip?.itinerary as
        | { itemListElement?: Array<{ item?: { description?: string } }> }
        | undefined;
      for (const listItem of touristTripItinerary?.itemListElement ?? []) {
        const description = listItem.item?.description ?? "";
        for (const pattern of MALFORMED_ENGINE6_DESCRIPTION_PATTERNS) {
          expect(
            description,
            `${tour.productCode} itinerary: ${pattern}`
          ).not.toMatch(pattern);
        }
      }
    }
  });

  it("keeps New Orleans Airboat SERP copy concise while JSON-LD uses the richer governed description", () => {
    const tour = engine6ResolvedTours.find(
      candidate => candidate.productCode === NEW_ORLEANS_AIRBOAT_PRODUCT_CODE
    );
    expect(tour).toBeDefined();

    const seo = buildEngine6Seo(tour!);
    const graph = buildEngine6SchemaGraph(tour!)["@graph"] as Array<
      Record<string, unknown>
    >;
    const webPage = graph.find(node => node["@type"] === "WebPage");
    const touristTrip = graph.find(node => node["@type"] === "TouristTrip");
    const product = graph.find(node => node["@type"] === "Product");
    const richWordCount =
      NEW_ORLEANS_AIRBOAT_RICH_DESCRIPTION.split(/\s+/).length;

    expect(richWordCount).toBeGreaterThanOrEqual(75);
    expect(richWordCount).toBeLessThanOrEqual(120);
    expect(webPage?.description).toBe(NEW_ORLEANS_AIRBOAT_RICH_DESCRIPTION);
    expect(touristTrip?.description).toBe(NEW_ORLEANS_AIRBOAT_RICH_DESCRIPTION);
    expect(product?.description).toBe(NEW_ORLEANS_AIRBOAT_RICH_DESCRIPTION);
    expect(seo.description).toBe(NEW_ORLEANS_AIRBOAT_SERP_DESCRIPTION);
    expect(tour!.metaDescription).toBe(NEW_ORLEANS_AIRBOAT_SERP_DESCRIPTION);
    expect(seo.description).not.toBe(product?.description);
    const resolvedMerchantDescription = resolveMerchantDescription({
      productCode: NEW_ORLEANS_AIRBOAT_PRODUCT_CODE,
      title: tour!.title,
      city: tour!.city,
      categoryLabel: tour!.categoryLabel,
      productOverviewDescription: tour!.overviewText,
      pageMetadataDescription: tour!.metaDescription || tour!.seoDescription,
      jsonLdProductDescription: String(product?.description ?? ""),
      viatorApiDescription: tour!.overviewText,
      itineraryStops: tour!.itinerary,
      highlights: tour!.highlights,
      included: tour!.included,
      durationText: tour!.durationText,
    });

    expect(resolvedMerchantDescription).toBe(
      NEW_ORLEANS_AIRBOAT_RICH_DESCRIPTION
    );
    expect(JSON.stringify(touristTrip)).not.toMatch(/Admission Ticket Free/i);
  });

  it("keeps repaired Engine6 Merchant descriptions aligned with governed JSON-LD source", () => {
    const merchantDescriptions = readMerchantDescriptions();

    for (const productCode of REPAIRED_ENGINE6_PRODUCT_CODES) {
      const tour = engine6ResolvedTours.find(
        candidate => candidate.productCode === productCode
      );
      expect(tour, productCode).toBeDefined();

      const graph = buildEngine6SchemaGraph(tour!)["@graph"] as Array<
        Record<string, unknown>
      >;
      const product = graph.find(node => node["@type"] === "Product");
      const jsonLdDescription = String(product?.description ?? "");
      const resolvedMerchantDescription = resolveMerchantDescription({
        productCode,
        title: tour!.title,
        city: tour!.city,
        categoryLabel: tour!.categoryLabel,
        productOverviewDescription: tour!.overviewText,
        pageMetadataDescription: tour!.metaDescription || tour!.seoDescription,
        jsonLdProductDescription: jsonLdDescription,
        viatorApiDescription: tour!.overviewText,
        itineraryStops: tour!.itinerary,
        highlights: tour!.highlights,
        included: tour!.included,
        durationText: tour!.durationText,
      });
      const merchantDescription = merchantDescriptions.get(productCode) ?? "";

      expect(merchantDescription, productCode).toBe(
        resolvedMerchantDescription
      );
      for (const description of [
        jsonLdDescription,
        resolvedMerchantDescription,
        merchantDescription,
      ]) {
        expect(description, productCode).toMatch(/[.!?]$/);
        for (const pattern of [
          ...MALFORMED_ENGINE6_DESCRIPTION_PATTERNS,
          ...GENERIC_FALLBACK_PATTERNS,
        ]) {
          expect(description, `${productCode}: ${pattern}`).not.toMatch(
            pattern
          );
        }
      }
    }
  });
});
