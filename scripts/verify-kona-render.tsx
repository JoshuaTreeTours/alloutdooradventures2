import { readFileSync } from "node:fs";

import React from "react";
import { renderToString } from "react-dom/server";

import { getToursByCityUnified } from "../src/data/tours";
import Engine6TourPage from "../src/engine6/components/Engine6TourPage";
import {
  buildEngine6CardDescription,
  resolveEngine6GovernedProductDescription,
} from "../src/engine6/governedEditorialDescriptions";
import { KONA_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/konaViatorPublicRatings";
import { engine6ResolvedTours } from "../src/engine6/registry";
import { buildEngine6SchemaGraph } from "../src/engine6/schema/buildEngine6SchemaGraph";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const bleed =
  /\b(?:Yellowstone|Yosemite|Zion|Glacier|Grand Canyon|Great Smoky|Maui|Kauai|Honolulu|Oahu|Waikiki|Pearl Harbor|Hawaii Volcanoes)\b/i;

const merchant = readFileSync("data/merchantFeed.csv", "utf8")
  .split(/\r?\n/)
  .filter(Boolean);
const merchantById = new Map(
  merchant.slice(1).map(line => [line.split(",")[0], line])
);

const codes = [...KONA_VIATOR_PUBLIC_PRODUCT_CODES];
let ok = 0;
const issues: string[] = [];
const rendered: string[] = [];

for (const code of codes) {
  const tour = engine6ResolvedTours.find(t => t.productCode === code)!;
  const listing = getToursByCityUnified("hawaii", "kona").find(
    e => e.tour.productCode === code
  )!;
  const html = renderToString(<Engine6TourPage tour={tour} />);
  const graph = buildEngine6SchemaGraph(tour)["@graph"] as Array<
    Record<string, unknown>
  >;
  const product = graph.find(n => n["@type"] === "Product");
  const trip = graph.find(n => n["@type"] === "TouristTrip");
  const gov = resolveEngine6GovernedProductDescription(tour);
  const card = buildEngine6CardDescription(tour);
  const row = merchantById.get(code) || "";
  const hero = tour.heroImageUrl;
  const listingHero = listing.tour.heroImage;
  const productImage = Array.isArray(product?.image)
    ? product?.image[0]
    : product?.image;
  const tripImage = Array.isArray(trip?.image) ? trip?.image[0] : trip?.image;
  const fixture = JSON.parse(
    readFileSync(`data/engine6/viator/${code}.exact-product.json`, "utf8")
  ) as {
    product: {
      media: { images: Array<{ variants: { FULL: { url: string } } }> };
    };
  };
  const fixtureHero =
    fixture.product.media.images[0].variants.FULL.url;

  const checks: Array<[string, boolean]> = [
    ["has timeline", html.includes('data-testid="engine6-itinerary-timeline"')],
    ["listing kona signal", /\bKona\b/i.test(listing.tour.shortDescription)],
    ["card kona signal", /\bKona\b/i.test(card)],
    ["gov kona signal", /\bKona\b/i.test(gov)],
    ["no bleed listing", !bleed.test(listing.tour.shortDescription)],
    ["no bleed card", !bleed.test(card)],
    ["no bleed gov", !bleed.test(gov)],
    ["hero listing", listingHero === hero],
    ["hero product jsonld", productImage === hero],
    ["hero trip jsonld", tripImage === hero],
    ["hero fixture", fixtureHero === hero],
    ["merchant image", row.includes(hero ?? "")],
    [
      "merchant desc matches gov",
      row.includes(gov.slice(0, 40)) || row.includes(gov.slice(0, 80)),
    ],
  ];
  const failed = checks.filter(([, v]) => !v).map(([k]) => k);
  if (failed.length) issues.push(`${code}: ${failed.join(", ")}`);
  else ok++;
  rendered.push(
    `${code} ${tour.canonicalPath} itineraryStops=${tour.itinerary.length}`
  );
}

console.log("RENDERED", rendered.length);
console.log(rendered.join("\n"));
console.log("OK", ok, "ISSUES", issues.length);
if (issues.length) console.log(issues.join("\n"));

const listingCodes = getToursByCityUnified("hawaii", "kona")
  .filter(e => e.tour.engine === "engine6")
  .map(e => e.tour.productCode)
  .sort();
console.log("LISTING_CODES", listingCodes.join(","));
console.log("EXPECTED", [...codes].sort().join(","));
console.log(
  "LISTING_MATCH",
  JSON.stringify(listingCodes) === JSON.stringify([...codes].sort())
);
