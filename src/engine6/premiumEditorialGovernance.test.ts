import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  ENGINE6_EDITORIAL_DESCRIPTION_MAX_CHARS,
  ENGINE6_EDITORIAL_DESCRIPTION_MIN_CHARS,
  ENGINE6_EDITORIAL_FORBIDDEN_PATTERNS,
} from "./buildEngine6PremiumEditorialDescription";
import { resolveEngine6GovernedProductDescription } from "./governedEditorialDescriptions";
import { merchantFeedEligibleTours } from "./merchantFeedEligibility";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import { toEngine6Card } from "./cards";
import { isEngine6CardDescriptionDerivedFromGovernedSource } from "./governedEditorialDescriptions";

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
});
