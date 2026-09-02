import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { resolveEngine6GovernedProductDescription } from "./governedEditorialDescriptions";
import { engine6ResolvedTours } from "./registry";

const FIRST_AUDITED_LINE = 500;

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

const tailRows = readFileSync("data/merchantFeed.csv", "utf8")
  .trimEnd()
  .split(/\r?\n/)
  .slice(FIRST_AUDITED_LINE - 1)
  .map(parseCsvLine);
const tourByProductCode = new Map(
  engine6ResolvedTours.map(tour => [tour.productCode, tour])
);

describe("merchant feed line 500+ natural-prose governance", () => {
  it("keeps every tail row aligned with the governed Engine6 description", () => {
    for (const row of tailRows) {
      const tour = tourByProductCode.get(row[0]);
      expect(tour, row[0]).toBeDefined();
      expect(row[2], row[0]).toBe(
        resolveEngine6GovernedProductDescription(tour!)
      );
    }
  });

  it("removes database-like editorial scaffolding and clipped endings", () => {
    const forbidden = [
      /\bThe published format\b/i,
      /\bThe format suits visitors\b/i,
      /\bIdeal for visitors basing\b/i,
      /\bRoutes stay oriented\b/i,
      /\bpublished\b/i,
      /\bpublic page\b/i,
      /\bexperience itself focuses\b.+\brather than\b/i,
      /\bmaximum of \d+ your\b/i,
      /(?:^|\s)(?:the|a|an|with|on|to|of|and|or|rather than)\.$/i,
    ];
    const line500To800Forbidden = [
      /\bIdeal for guests basing\b/i,
      /\bIdeal for [A-Z][^.]+ guests who\b/,
      /\bChoose this option if you're (?:basing|touring)\b/i,
      /\bTour activity as described on Viator\b/i,
      /\bSee Naples's landmark neighborhoods\b/i,
      /\b(?:c|wildl|fro|picku|max|no)\. Ideal\b/i,
      /\.[A-Z]/,
    ];

    for (const [index, row] of tailRows.entries()) {
      expect(row, row[0]).toHaveLength(12);
      expect(
        row[2].length,
        `${row[0]} description length`
      ).toBeGreaterThanOrEqual(500);
      expect(row[2].length, `${row[0]} description length`).toBeLessThanOrEqual(
        800
      );
      expect(row[2], `${row[0]} ending`).toMatch(/[.!?]$/);
      const physicalLine = FIRST_AUDITED_LINE + index;
      const applicablePatterns =
        physicalLine <= 800
          ? [...forbidden, ...line500To800Forbidden]
          : forbidden;
      for (const pattern of applicablePatterns) {
        expect(row[2], `${row[0]} matched ${pattern}`).not.toMatch(pattern);
      }
    }
  });
});
