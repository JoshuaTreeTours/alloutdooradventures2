import { readFileSync } from "node:fs";
import React from "react";
import { renderToString } from "react-dom/server";
import { parse } from "csv-parse/sync";

import { getToursByCityUnified } from "../src/data/tours";
import Engine6TourPage from "../src/engine6/components/Engine6TourPage";
import {
  excerptEngine6CardDescription,
  resolveEngine6GovernedProductDescription,
} from "../src/engine6/governedEditorialDescriptions";
import { MAUI_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/mauiViatorPublicRatings";
import { engine6ResolvedTours } from "../src/engine6/registry";

const BLEED =
  /\b(Yellowstone|Yosemite|Zion|Glacier National Park|Grand Canyon|Great Smoky|Sedona|Napa Valley|Boston|Philadelphia|Key West|Orlando|Moab)\b/i;

const rows = parse(readFileSync("data/merchantFeed.csv", "utf8"), {
  columns: true,
  relax_column_count: true,
}) as Array<Record<string, string>>;

const listing = getToursByCityUnified("hawaii", "maui").filter(
  entry =>
    entry.tour.engine === "engine6" &&
    MAUI_VIATOR_PUBLIC_PRODUCT_CODES.includes(
      entry.tour.productCode as (typeof MAUI_VIATOR_PUBLIC_PRODUCT_CODES)[number]
    )
);

const issues: Array<{ productCode: string; issues: string[] }> = [];
const itineraries: Record<string, string[]> = {};

for (const productCode of MAUI_VIATOR_PUBLIC_PRODUCT_CODES) {
  const tour = engine6ResolvedTours.find(
    entry => entry.productCode === productCode
  );
  const row = rows.find(entry => entry.id === productCode);
  const productIssues: string[] = [];

  if (!tour) {
    productIssues.push("missing resolved tour");
    issues.push({ productCode, issues: productIssues });
    continue;
  }
  if (!row) {
    productIssues.push("missing merchant row");
  }

  const governed = resolveEngine6GovernedProductDescription(tour);
  const card = excerptEngine6CardDescription(governed);
  const html = renderToString(React.createElement(Engine6TourPage, { tour }));
  const scripts = [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
    ),
  ]
    .map(match => {
      try {
        return JSON.parse(match[1]!) as Record<string, unknown>;
      } catch {
        return null;
      }
    })
    .filter((value): value is Record<string, unknown> => Boolean(value));

  const product = scripts.find(script => script["@type"] === "Product");
  const trip = scripts.find(script => script["@type"] === "TouristTrip");

  if (!/\bMaui\b/i.test(governed) || !/\bMaui\b/i.test(card)) {
    productIssues.push("missing Maui in listing/governed narrative");
  }
  if (BLEED.test(governed) || BLEED.test(card) || BLEED.test(html)) {
    productIssues.push("destination-name bleed");
  }
  if (row && row.description !== governed) {
    productIssues.push("merchant description != governed");
  }
  if (product?.description && product.description !== governed) {
    productIssues.push("Product JSON-LD description != governed");
  }
  if (trip?.description && trip.description !== governed) {
    productIssues.push("TouristTrip JSON-LD description != governed");
  }
  if (row && product?.image && product.image !== row.image_link) {
    productIssues.push("Product JSON-LD image != merchant image_link");
  }
  if (row && trip?.image && trip.image !== row.image_link) {
    productIssues.push("TouristTrip JSON-LD image != merchant image_link");
  }
  if (!html.includes('data-testid="engine6-itinerary-timeline"')) {
    productIssues.push("missing itinerary timeline");
  }

  itineraries[productCode] = tour.itinerary.map(item => item.title);
  if (productIssues.length > 0) {
    issues.push({ productCode, issues: productIssues });
  }
}

console.log(
  JSON.stringify(
    {
      listingCount: listing.length,
      selectedCount: MAUI_VIATOR_PUBLIC_PRODUCT_CODES.length,
      issueCount: issues.length,
      issues,
      itineraries,
    },
    null,
    2
  )
);

process.exit(issues.length === 0 && listing.length === 20 ? 0 : 1);
