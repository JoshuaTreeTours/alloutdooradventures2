import { readFileSync } from "node:fs";

import { renderToString } from "react-dom/server";

import {
  buildEngine6CardDescription,
  resolveEngine6GovernedProductDescription,
  resolveEngine6SchemaProductDescription,
} from "../src/engine6/governedEditorialDescriptions";
import { buildEngine6SchemaGraph } from "../src/engine6/schema/buildEngine6SchemaGraph";
import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import { engine6ResolvedTours } from "../src/engine6/registry";
import { SEDONA_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/sedonaViatorPublicRatings";
import { validateEngine6CreationContract } from "../src/engine6/creationValidation";
import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import { mapViatorToEngine6Tour } from "../src/engine6/mapViatorToEngine6Tour";
import { ENGINE6_VALIDATION_FIXTURES } from "../src/engine6/validationFixtures";

const BLEED =
  /Yellowstone|Yosemite|Zion National Park|Glacier National Park|Grand Canyon National Park|Great Smoky Mountains/i;

const failures: string[] = [];

for (const productCode of SEDONA_VIATOR_PUBLIC_PRODUCT_CODES) {
  const tour = engine6ResolvedTours.find(entry => entry.productCode === productCode);
  if (!tour) {
    failures.push(`${productCode}: missing resolved tour`);
    continue;
  }

  const surfaces = [
    ["card", buildEngine6CardDescription(tour)],
    ["governed", resolveEngine6GovernedProductDescription(tour)],
    ["schema", resolveEngine6SchemaProductDescription(tour)],
    ["overview", tour.overviewText ?? ""],
    ["description", tour.description ?? ""],
  ] as const;

  for (const [label, text] of surfaces) {
    if (text && BLEED.test(text)) {
      failures.push(`${productCode}: ${label} destination bleed`);
    }
    if (label !== "overview" && text && !/Sedona/i.test(text)) {
      failures.push(`${productCode}: ${label} missing Sedona mention`);
    }
  }

  const graph = buildEngine6SchemaGraph(tour)["@graph"] as Array<
    Record<string, unknown>
  >;
  for (const node of graph) {
    const description = String(node.description ?? "");
    if (description && BLEED.test(description)) {
      failures.push(`${productCode}: JSON-LD ${node["@type"]} destination bleed`);
    }
  }

  const merchantRow = buildMerchantFeedRowFromProductSchema(tour);
  if (BLEED.test(merchantRow.description)) {
    failures.push(`${productCode}: merchant feed destination bleed`);
  }
  if (!/Sedona/i.test(merchantRow.description)) {
    failures.push(`${productCode}: merchant feed missing Sedona`);
  }

  const fixture = ENGINE6_VALIDATION_FIXTURES.find(
    entry => entry.productCode === productCode
  );
  const fixtureText = JSON.stringify(fixture?.rawPayload ?? {});
  if (BLEED.test(fixtureText)) {
    failures.push(`${productCode}: fixture destination bleed`);
  }

  if (fixture) {
    const extraction = extractEngine6Product(fixture.rawPayload);
    const payload = {
      source: "live-api" as const,
      rawProductCode: productCode,
      rawProduct: extraction.product,
      diagnostics: extraction.diagnostics,
      extracted: extraction.extracted,
    };
    const mapped = mapViatorToEngine6Tour(payload);
    const report = validateEngine6CreationContract({
      tour: mapped,
      rawPayload: fixture.rawPayload,
    });
    if (report.violations.length > 0) {
      failures.push(
        `${productCode}: creation contract -> ${report.violations.join(" | ")}`
      );
    }
  }
}

console.log(`Sedona bleed/contract check failures: ${failures.length}`);
for (const failure of failures) {
  console.log(failure);
}

process.exit(failures.length > 0 ? 1 : 0);
