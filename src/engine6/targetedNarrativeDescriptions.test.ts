import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  ENGINE6_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES,
  ENGINE6_TARGETED_NARRATIVE_DESCRIPTIONS,
} from "./approvedNarrativeDescriptions";
import { resolveEngine6GovernedProductDescription } from "./governedEditorialDescriptions";
import { engine6ResolvedTours } from "./registry";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";

const parseCsv = (content: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  const [headers = [], ...bodyRows] = rows.filter(
    candidate => candidate.length > 1
  );
  return bodyRows.map(values =>
    Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""])
    )
  );
};

const merchantRowsById = new Map(
  parseCsv(readFileSync("data/merchantFeed.csv", "utf8")).map(row => [
    row.id,
    row,
  ])
);

const schemaNode = (
  productCode: string,
  type: "WebPage" | "TouristTrip" | "Product"
) => {
  const tour = engine6ResolvedTours.find(
    candidate => candidate.productCode === productCode
  );
  expect(tour, productCode).toBeDefined();
  const graph = buildEngine6SchemaGraph(tour!)["@graph"] as Array<
    Record<string, unknown>
  >;
  const node = graph.find(candidate => candidate["@type"] === type);
  expect(node, `${productCode} ${type}`).toBeDefined();
  return node!;
};

const machineGeneratedArtifactPattern =
  /Admission Ticket|visited over|Highlights include|Included elements cover|The route includes/i;

describe("Engine6 targeted narrative descriptions", () => {
  it("keeps the governed narrative override scoped to the approved product codes", () => {
    expect(Object.keys(ENGINE6_TARGETED_NARRATIVE_DESCRIPTIONS).sort()).toEqual(
      [...ENGINE6_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES].sort()
    );
    expect(ENGINE6_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES).toHaveLength(
      10
    );
  });

  it.each(ENGINE6_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)(
    "uses the governed editorial description for %s across JSON-LD and Merchant CSV",
    productCode => {
      const tour = engine6ResolvedTours.find(
        candidate => candidate.productCode === productCode
      );
      expect(tour, productCode).toBeDefined();

      const governedDescription = resolveEngine6GovernedProductDescription(tour!);
      const webPage = schemaNode(productCode, "WebPage");
      const trip = schemaNode(productCode, "TouristTrip");
      const product = schemaNode(productCode, "Product");
      const merchantRow = merchantRowsById.get(productCode);

      expect(governedDescription).toContain(
        ENGINE6_TARGETED_NARRATIVE_DESCRIPTIONS[productCode].slice(0, 40)
      );
      expect(product.description).toBe(governedDescription);
      expect(webPage.description).toBe(product.description);
      expect(trip.description).toBe(product.description);
      expect(merchantRow?.description).toBe(product.description);
      expect(product.description).not.toMatch(machineGeneratedArtifactPattern);
    }
  );

  it("does not apply the six approved descriptions to any other Engine6 product", () => {
    const targetedCodes = new Set<string>(
      ENGINE6_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES
    );
    const approvedDescriptions = new Set<string>(
      Object.values(ENGINE6_TARGETED_NARRATIVE_DESCRIPTIONS)
    );

    for (const tour of engine6ResolvedTours) {
      if (targetedCodes.has(tour.productCode)) continue;

      const product = schemaNode(tour.productCode, "Product");
      const merchantRow = merchantRowsById.get(tour.productCode);

      expect(
        approvedDescriptions.has(String(product.description ?? "")),
        tour.productCode
      ).toBe(false);
      expect(
        approvedDescriptions.has(merchantRow?.description ?? ""),
        tour.productCode
      ).toBe(false);
    }
  });
});
