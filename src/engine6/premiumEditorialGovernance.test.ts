import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { getEngine6TargetedNarrativeDescription } from "./approvedNarrativeDescriptions";
import {
  ENGINE6_EDITORIAL_DESCRIPTION_MAX_CHARS,
  ENGINE6_EDITORIAL_DESCRIPTION_MIN_CHARS,
  ENGINE6_EDITORIAL_FORBIDDEN_PATTERNS,
  ENGINE6_EDITORIAL_METADATA_PATTERNS,
  classifyEngine6EditorialActivityKind,
  classifyEngine6WineExperienceProfile,
  extractEngine6EditorialOpeningPattern,
  isEngine6EditorialMetadataPhrase,
} from "./buildEngine6PremiumEditorialDescription";
import { resolveEngine6GovernedProductDescription } from "./governedEditorialDescriptions";
import { excerptEngine6CardDescription } from "./governedEditorialDescriptions";
import { merchantFeedEligibleTours } from "./merchantFeedEligibility";
import { engine6ListingTours } from "./listing";
import { engine6ResolvedTours } from "./registry";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import { toEngine6Card } from "./cards";
import { isEngine6CardDescriptionDerivedFromGovernedSource } from "./governedEditorialDescriptions";

const ENGINE6_EDITORIAL_TEMPLATE_OPENING_PATTERNS = [
  /^Spend your time in\b/i,
  /\bopens up on\b/i,
  /\bouting is built around\b/i,
  /,\s*beginning with\b/i,
  /\bputs the focus on\b/i,
  /\byou set out on\b/i,
] as const;

const ENGINE6_ACTIVITY_TYPE_ASSERTIONS: Array<{
  productCode: string;
  mustMatch: RegExp[];
  mustNotMatch: RegExp[];
}> = [
  {
    productCode: "69764P1",
    mustMatch: [/whale/i],
    mustNotMatch: [/^Cruise .* harbor/i, /^San Diego opens up on a harbor cruise/i],
  },
  {
    productCode: "6021MBA",
    mustMatch: [/aquarium/i],
    mustNotMatch: [/harbor cruise/i],
  },
  {
    productCode: "3097SDZSP_2VISIT",
    mustMatch: [/zoo|safari/i],
    mustNotMatch: [/harbor cruise/i, /park-focused day trip in/i],
  },
  {
    productCode: "6455NOLAAIR",
    mustMatch: [/airboat|swamp|bayou/i],
    mustNotMatch: [/harbor cruise/i],
  },
  {
    productCode: "5024MANSKY",
    mustMatch: [/helicopter|aerial|flight/i],
    mustNotMatch: [/harbor cruise/i, /two-wheeled/i],
  },
  {
    productCode: "163975P1",
    mustMatch: [/trolley/i],
    mustNotMatch: [/harbor cruise/i],
  },
  {
    productCode: "117409P1",
    mustMatch: [/wine|vineyard|tasting/i],
    mustNotMatch: [/harbor cruise/i],
  },
];

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

const merchantDescriptions = new Map(
  readFileSync("data/merchantFeed.csv", "utf8")
    .trim()
    .split("\n")
    .slice(1)
    .map(line => {
      const row = parseCsvLine(line);
      return [row[0], row[2]] as const;
    })
);

const ENGINE6_NAPA_PRODUCT_CODES = [
  "6938NAPATRLY",
  "6285P4",
  "339737P1",
  "148923P3",
  "17140_DWT",
  "6938CASTLE",
  "41114P2",
  "38386P1",
  "175643P1",
  "396101P2",
  "212180P2",
  "87617P1",
] as const;

const napaListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "california" &&
    tour.destination.citySlug === "napa"
);

describe("Engine6 premium editorial governance", () => {
  it("keeps merchant-eligible governed descriptions within editorial length targets", () => {
    for (const tour of merchantFeedEligibleTours) {
      const description = resolveEngine6GovernedProductDescription(tour);

      expect(description.length, tour.productCode).toBeGreaterThanOrEqual(
        ENGINE6_EDITORIAL_DESCRIPTION_MIN_CHARS
      );
      expect(description.length, tour.productCode).toBeLessThanOrEqual(
        ENGINE6_EDITORIAL_DESCRIPTION_MAX_CHARS
      );
    }
  });

  it("keeps merchant feed, JSON-LD, and card excerpts on the same governed source", () => {
    for (const tour of merchantFeedEligibleTours) {
      const governedDescription = resolveEngine6GovernedProductDescription(tour);
      const graph = buildEngine6SchemaGraph(tour)["@graph"] as Array<
        Record<string, unknown>
      >;
      const product = graph.find(node => node["@type"] === "Product");
      const card = toEngine6Card(tour);
      const merchantDescription = merchantDescriptions.get(tour.productCode) ?? "";

      expect(String(product?.description ?? ""), tour.productCode).toBe(
        governedDescription
      );
      expect(merchantDescription, tour.productCode).toBe(governedDescription);
      expect(
        isEngine6CardDescriptionDerivedFromGovernedSource(
          card.description,
          governedDescription
        ),
        tour.productCode
      ).toBe(true);
    }
  });

  it("contains no forbidden legacy template phrases in governed descriptions", () => {
    for (const tour of merchantFeedEligibleTours) {
      const description = resolveEngine6GovernedProductDescription(tour);

      for (const pattern of ENGINE6_EDITORIAL_FORBIDDEN_PATTERNS) {
        expect(description, `${tour.productCode}: ${pattern}`).not.toMatch(
          pattern
        );
      }
    }
  });

  it("avoids repetitive template openings in generated editorial descriptions", () => {
    for (const tour of merchantFeedEligibleTours) {
      if (getEngine6TargetedNarrativeDescription(tour.productCode)) {
        continue;
      }

      const description = resolveEngine6GovernedProductDescription(tour);
      const opening =
        description.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? description;

      for (const pattern of ENGINE6_EDITORIAL_TEMPLATE_OPENING_PATTERNS) {
        expect(opening, `${tour.productCode}: ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("classifies primary activity types without cross-product confusion", () => {
    for (const assertion of ENGINE6_ACTIVITY_TYPE_ASSERTIONS) {
      const tour = engine6ResolvedTours.find(
        candidate => candidate.productCode === assertion.productCode
      );
      expect(tour, assertion.productCode).toBeDefined();

      const description = resolveEngine6GovernedProductDescription(tour!);
      const activityKind = classifyEngine6EditorialActivityKind({
        title: tour!.title,
        categoryLabel: tour!.categoryLabel,
        overviewText: tour!.overviewText ?? "",
      });

      for (const pattern of assertion.mustMatch) {
        expect(description, assertion.productCode).toMatch(pattern);
      }
      for (const pattern of assertion.mustNotMatch) {
        expect(description, assertion.productCode).not.toMatch(pattern);
      }

      expect(activityKind, assertion.productCode).not.toBe("generic-tour");
    }
  });

  it("keeps Napa listing-card openings diverse without destination-first wine templates", () => {
    expect(napaListingTours).toHaveLength(12);

    const openingPatterns = napaListingTours.map(tour => {
      const resolvedTour = merchantFeedEligibleTours.find(
        candidate => candidate.productCode === tour.productCode
      );
      expect(resolvedTour, tour.productCode ?? "").toBeDefined();

      const cardOpening = excerptEngine6CardDescription(
        resolveEngine6GovernedProductDescription(resolvedTour!)
      );

      expect(cardOpening, tour.productCode ?? "").not.toMatch(
        /^Sample .+ wine country on a tasting-day route/i
      );

      return extractEngine6EditorialOpeningPattern(cardOpening);
    });

    const patternCounts = openingPatterns.reduce<Map<string, number>>(
      (counts, pattern) => {
        counts.set(pattern, (counts.get(pattern) ?? 0) + 1);
        return counts;
      },
      new Map()
    );

    for (const [pattern, count] of patternCounts) {
      expect(count, `opening pattern "${pattern}"`).toBeLessThanOrEqual(2);
    }
  });

  it("assigns activity-specific wine experience profiles for Napa cohort products", () => {
    const expectedProfiles: Record<
      (typeof ENGINE6_NAPA_PRODUCT_CODES)[number],
      ReturnType<typeof classifyEngine6WineExperienceProfile>
    > = {
      "6938NAPATRLY": "wine-trolley",
      "6285P4": "join-in-group",
      "339737P1": "hot-air-balloon",
      "148923P3": "private-suv",
      "17140_DWT": "join-in-group",
      "6938CASTLE": "wine-trolley",
      "41114P2": "e-bike",
      "38386P1": "private-chauffeur",
      "175643P1": "private-chauffeur",
      "396101P2": "private-chauffeur",
      "212180P2": "private-suv",
      "87617P1": "sprinter-bus",
    };

    for (const productCode of ENGINE6_NAPA_PRODUCT_CODES) {
      const tour = merchantFeedEligibleTours.find(
        candidate => candidate.productCode === productCode
      );
      expect(tour, productCode).toBeDefined();

      const profile = classifyEngine6WineExperienceProfile({
        title: tour!.title,
        categoryLabel: tour!.categoryLabel,
        overviewText: tour!.overviewText ?? "",
      });

      expect(profile, productCode).toBe(expectedProfiles[productCode]);
    }
  });

  it("never incorporates operational metadata into governed editorial copy", () => {
    for (const tour of merchantFeedEligibleTours) {
      const description = resolveEngine6GovernedProductDescription(tour);

      for (const pattern of ENGINE6_EDITORIAL_METADATA_PATTERNS) {
        expect(description, `${tour.productCode}: ${pattern}`).not.toMatch(
          pattern
        );
      }

      expect(
        isEngine6EditorialMetadataPhrase(description),
        tour.productCode
      ).toBe(false);
    }
  });

  it("preserves merchant feed row count after editorial regeneration scope", () => {
    const merchantFeedLines = readFileSync("data/merchantFeed.csv", "utf8")
      .trim()
      .split("\n");

    expect(merchantFeedLines.length - 1).toBe(198);
    expect(merchantFeedEligibleTours).toHaveLength(198);
  });
});
