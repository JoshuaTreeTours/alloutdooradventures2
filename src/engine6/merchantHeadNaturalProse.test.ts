import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { resolveEngine6GovernedProductDescription } from "./governedEditorialDescriptions";
import { engine6ResolvedTours } from "./registry";

const FIRST_PRODUCT_LINE = 2;
const LAST_PRODUCT_LINE = 501;

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

const headRows = readFileSync("data/merchantFeed.csv", "utf8")
  .trimEnd()
  .split(/\r?\n/)
  .slice(FIRST_PRODUCT_LINE - 1, LAST_PRODUCT_LINE)
  .map(parseCsvLine);
const tourByProductCode = new Map(
  engine6ResolvedTours.map(tour => [tour.productCode, tour])
);

describe("first 500 merchant products natural-prose governance", () => {
  it("keeps every audited row aligned with its governed Engine6 description", () => {
    expect(headRows).toHaveLength(500);
    for (const row of headRows) {
      const tour = tourByProductCode.get(row[0]);
      expect(tour, row[0]).toBeDefined();
      expect(row[2], row[0]).toBe(
        resolveEngine6GovernedProductDescription(tour!)
      );
    }
  });

  it("removes supplier references, database scaffolding, and clipped prose", () => {
    const forbidden = [
      /\bViator\b/i,
      /\bTour activity as described\b/i,
      /\bThe published format\b/i,
      /\bThe format suits visitors\b/i,
      /\bIdeal for visitors basing\b/i,
      /\bIdeal for guests basing\b/i,
      /\bRoutes stay oriented\b/i,
      /\bpublished\b/i,
      /\bpublic page\b/i,
      /\bmaximum of \d+ your\b/i,
      /\bRemains the reviewed focus for this itinerary row\b/i,
      /\bCoastal waters around Jackson, Wyoming\b/i,
      /\bClimb into rugged backcountry near Moab, reaching Moab\b/i,
      /\bThe outing keeps focus on place, route structure, and destination context\b/i,
      /\bVisit .+ during the .+ stop\b/i,
      /\blandmark neighborhoods\b/i,
      /\bstructure the wildlife outside\b/i,
      /\bTogether, these elements describe\b/i,
      /\bYEARS IN BUSINESS\b/i,
      /(?:^|\s)(?:the|a|an|with|on|to|of|and|or|rather than)\.$/i,
      /[a-z0-9][.!?][A-Z][a-z]/,
    ];

    for (const row of headRows) {
      expect(row, row[0]).toHaveLength(12);
      expect(
        row[2].length,
        `${row[0]} description length`
      ).toBeGreaterThanOrEqual(500);
      expect(row[2].length, `${row[0]} description length`).toBeLessThanOrEqual(
        800
      );
      expect(row[2], `${row[0]} ending`).toMatch(/[.!?]$/);
      for (const pattern of forbidden) {
        expect(row[2], `${row[0]} matched ${pattern}`).not.toMatch(pattern);
      }
      if (/boats, gear, or launch times/i.test(row[2])) {
        expect(row[1], `${row[0]} has water-logistics prose`).toMatch(
          /\b(?:airboat|beach|boat|catamaran|cruise|dolphin|ferry|fish|fishing|jet ski|kayak(?:ing)?|parasail(?:ing)?|paddle|sandbar|sail(?:ing)?|snorkel(?:ing)?|watersports?|wildlife)\b/i
        );
      }
    }
  });

  it("keeps all 500 audited descriptions distinct", () => {
    expect(new Set(headRows.map(row => row[2])).size).toBe(headRows.length);
  });
});
