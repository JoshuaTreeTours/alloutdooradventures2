import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { getEngine6TargetedNarrativeDescription } from "./approvedNarrativeDescriptions";
import {
  ENGINE6_EDITORIAL_DESCRIPTION_MAX_CHARS,
  ENGINE6_EDITORIAL_DESCRIPTION_MIN_CHARS,
  ENGINE6_EDITORIAL_FORBIDDEN_PATTERNS,
  classifyEngine6EditorialActivityKind,
} from "./buildEngine6PremiumEditorialDescription";
import { resolveEngine6GovernedProductDescription } from "./governedEditorialDescriptions";
import { merchantFeedEligibleTours } from "./merchantFeedEligibility";
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
});
