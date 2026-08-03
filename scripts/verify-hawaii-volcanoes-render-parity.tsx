import { readFileSync } from "node:fs";

import React from "react";
import { renderToString } from "react-dom/server";

import { getToursByCityUnified } from "../src/data/tours";
import Engine6TourPage from "../src/engine6/components/Engine6TourPage";
import {
  buildEngine6CardDescription,
  resolveEngine6GovernedProductDescription,
} from "../src/engine6/governedEditorialDescriptions";
import { HAWAII_VOLCANOES_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/hawaiiVolcanoesViatorPublicRatings";
import { engine6ResolvedTours } from "../src/engine6/registry";
import { buildEngine6SchemaGraph } from "../src/engine6/schema/buildEngine6SchemaGraph";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const bleed =
  /\b(?:Chicago|Sedona|Monterey|Napa|Yellowstone|Zion|Yosemite|Glacier|Moab|Key West|Orlando|Maui|Road to Hana|Haleakala|Molokini|Honolulu|Oahu|Pearl Harbor|Waikiki|Great Smoky|Grand Canyon)\b/i;

const feed = readFileSync("data/merchantFeed.csv", "utf8");

let ok = 0;
for (const code of HAWAII_VOLCANOES_VIATOR_PUBLIC_PRODUCT_CODES) {
  const tour = engine6ResolvedTours.find(t => t.productCode === code);
  if (!tour) {
    console.log("FAIL", code, ["missing tour"]);
    continue;
  }

  const html = renderToString(<Engine6TourPage tour={tour} />);
  const graph = buildEngine6SchemaGraph(tour)["@graph"] as Array<
    Record<string, unknown>
  >;
  const product = graph.find(n => n["@type"] === "Product");
  const trip = graph.find(n => n["@type"] === "TouristTrip");
  const listing = getToursByCityUnified(
    "hawaii",
    "hawaii-volcanoes-national-park"
  ).find(e => e.tour.productCode === code);

  const fixture = JSON.parse(
    readFileSync(`data/engine6/viator/${code}.exact-product.json`, "utf8")
  );
  const fixtureHero =
    fixture.product.media.images[0].variants.FULL.url as string;
  const feedLine = feed.split(/\r?\n/).find(l => l.startsWith(`${code},`)) ?? "";
  const imageMatch = feedLine.match(/https:\/\/media\.tacdn\.com\/[^,"]+/);

  const heroes = [
    tour.heroImage,
    listing?.tour.heroImage,
    product?.image,
    trip?.image,
    fixtureHero,
    imageMatch?.[0],
  ];
  const unique = new Set(heroes.filter(Boolean));
  const gov = resolveEngine6GovernedProductDescription(tour);
  const card = buildEngine6CardDescription(tour);
  const issues: string[] = [];

  if (unique.size !== 1) {
    issues.push(`hero mismatch ${[...unique].join(" | ")}`);
  }
  if (
    bleed.test(gov) ||
    bleed.test(card) ||
    (listing && bleed.test(listing.tour.shortDescription))
  ) {
    issues.push("bleed");
  }
  if (!html.includes('data-testid="engine6-itinerary-timeline"')) {
    issues.push("no itinerary");
  }
  const htmlTitle = tour.title.replace(/&/g, "&amp;");
  if (!html.includes(tour.title) && !html.includes(htmlTitle)) {
    issues.push("title missing");
  }
  if (!listing) {
    issues.push("missing listing");
  }

  if (issues.length) {
    console.log("FAIL", code, issues);
  } else {
    ok += 1;
    console.log("OK", code, tour.canonicalPath);
  }
}

console.log(
  `rendered ${ok}/${HAWAII_VOLCANOES_VIATOR_PUBLIC_PRODUCT_CODES.length}`
);
process.exit(ok === HAWAII_VOLCANOES_VIATOR_PUBLIC_PRODUCT_CODES.length ? 0 : 1);
