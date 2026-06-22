import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "./viatorExtractors";
import { ENGINE6_VALIDATION_FIXTURES } from "../../src/engine6/validationFixtures";

const sourcePath = path.resolve("api/engine6/itineraryTitleOverrides.ts");
const source = readFileSync(sourcePath, "utf8");

const getOverrideBlockSource = () => {
  const start = source.indexOf("const PRODUCT_ROW_TITLE_OVERRIDES");
  expect(start).toBeGreaterThanOrEqual(0);

  const firstBrace = source.indexOf("{", start);
  expect(firstBrace).toBeGreaterThanOrEqual(0);

  let depth = 0;
  for (let index = firstBrace; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return source.slice(firstBrace + 1, index);
  }

  throw new Error("PRODUCT_ROW_TITLE_OVERRIDES block was not closed");
};

const getProductBlocks = () => {
  const blockSource = getOverrideBlockSource();
  const productBlocks: Array<{ productCode: string; body: string }> = [];
  const productStartPattern = /"([^"]+)"\s*:\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = productStartPattern.exec(blockSource))) {
    const productCode = match[1];
    const bodyStart = productStartPattern.lastIndex;
    let depth = 1;

    for (let index = bodyStart; index < blockSource.length; index += 1) {
      const char = blockSource[index];
      if (char === "{") depth += 1;
      if (char === "}") depth -= 1;
      if (depth === 0) {
        productBlocks.push({
          productCode,
          body: blockSource.slice(bodyStart, index),
        });
        productStartPattern.lastIndex = index + 1;
        break;
      }
    }
  }

  return productBlocks;
};

describe("Engine6 itinerary title override governance", () => {
  it("does not contain duplicate product row override keys", () => {
    const duplicates = getProductBlocks().flatMap(({ productCode, body }) => {
      const seen = new Set<string>();
      const rowDuplicates: string[] = [];
      const rowPattern = /(?:^|\n)\s*(\d+)\s*:/g;
      let match: RegExpExecArray | null;

      while ((match = rowPattern.exec(body))) {
        const rowIndex = match[1];
        if (seen.has(rowIndex)) {
          rowDuplicates.push(`${productCode}:${rowIndex}`);
        }
        seen.add(rowIndex);
      }

      return rowDuplicates;
    });

    expect(duplicates).toEqual([]);
  });

  it("keeps the reviewed final 5569HIKE row 18 title", () => {
    const hikeBlock = getProductBlocks().find(
      block => block.productCode === "5569HIKE"
    );

    expect(hikeBlock?.body.match(/(?:^|\n)\s*18\s*:/g)).toHaveLength(1);
    expect(hikeBlock?.body).toContain('18: "Autry Museum"');
  });

  it("preserves native explicit Central Park Pedicab titles for 414460P1", () => {
    const fixture = ENGINE6_VALIDATION_FIXTURES.find(
      item => item.productCode === "414460P1"
    );

    expect(fixture).toBeDefined();

    const extraction = extractEngine6Product(fixture?.rawPayload);

    expect(
      extraction.extracted.itinerary.map(item => ({
        title: item.title,
        titleSource: item.titleSource,
      }))
    ).toEqual([
      { title: "Bethesda Fountain", titleSource: "explicit" },
      { title: "Bow Bridge", titleSource: "explicit" },
      {
        title: "Strawberry Fields, John Lennon Memorial",
        titleSource: "explicit",
      },
    ]);
  });

  it("keeps reviewed title overrides for the four remaining bad published itinerary rows", () => {
    const block = getProductBlocks().find(
      entry => entry.productCode === "5559561P1"
    );
    expect(block?.body).toContain('0: "Check-in"');
    expect(block?.body).toContain('1: "Fort Lauderdale Waterways"');
    expect(
      getProductBlocks().find(entry => entry.productCode === "3156P13")?.body
    ).toContain('3: "Central Park South"');
    expect(
      getProductBlocks().find(entry => entry.productCode === "335698P13")?.body
    ).toContain('3: "Secondary Scrambling Zone"');
  });
});
