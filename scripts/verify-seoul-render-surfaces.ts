import { writeFileSync } from "node:fs";

import { SEOUL_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/seoulViatorPublicRatings";
import {
  excerptEngine6CardDescription,
  resolveEngine6GovernedProductDescription,
} from "../src/engine6/governedEditorialDescriptions";
import { engine6ResolvedTours } from "../src/engine6/registry";
import { buildEngine6SchemaGraph } from "../src/engine6/schema/buildEngine6SchemaGraph";

const codes = [...SEOUL_VIATOR_PUBLIC_PRODUCT_CODES];
const bleed = [
  /Yellowstone/i,
  /Yosemite/i,
  /\bZion\b/i,
  /Glacier National/i,
  /Grand Canyon/i,
  /Great Smoky/i,
  /Bryce Canyon/i,
  /Arches National/i,
  /Canyonlands/i,
  /Acadia National/i,
  /Sedona/i,
  /Las Vegas/i,
  /\bChicago\b/i,
  /\bBoston\b/i,
  /\bKona\b/i,
  /\bMaui\b/i,
  /\bAspen\b/i,
  /Hunter Creek/i,
  /Roaring Fork/i,
  /\bAustin\b/i,
  /\bHouston\b/i,
  /\bLondon\b/i,
  /\bParis\b/i,
  /\bRome\b/i,
  /\bVenice\b/i,
  /\bCancun\b/i,
  /Mexico City/i,
  /Chichen Itza/i,
  /Isla Mujeres/i,
  /Puerto Vallarta/i,
  /Marietas/i,
  /Yelapa/i,
  /Banderas Bay/i,
  /Cabo San Lucas/i,
  /El Arco/i,
  /\bCusco\b/i,
  /\bCuzco\b/i,
  /Sacred Valley/i,
  /Machu Picchu/i,
  /Humantay/i,
  /Rainbow Mountain/i,
  /Vinicunca/i,
  /Ollantaytambo/i,
  /\bLima\b/i,
  /Miraflores/i,
  /Barranco/i,
  /Rio de Janeiro/i,
  /Christ the Redeemer/i,
  /Sugar Loaf/i,
  /Copacabana/i,
  /Ipanema/i,
  /Petr[oó]polis/i,
  /\bTokyo\b/i,
  /Meiji Jingu/i,
  /\bAsakusa\b/i,
  /\bShinjuku\b/i,
  /Mount Fuji/i,
  /\bHakone\b/i,
  /\bKamakura\b/i,
  /\bNikko\b/i,
  /\bKyoto\b/i,
  /Kinkaku-ji/i,
  /Kiyomizu-dera/i,
  /Fushimi Inari/i,
  /\bArashiyama\b/i,
  /\bGion\b/i,
  /\bBangkok\b/i,
  /Ayutthaya/i,
  /Grand Palace/i,
  /Wat Pho/i,
  /Wat Arun/i,
  /Damnoen Saduak/i,
  /Thonburi/i,
  /\bThailand\b/i,
  /\bSingapore\b/i,
  /Marina Bay/i,
  /Pulau Ubin/i,
  /Kampong Glam/i,
  /\bBali\b/i,
  /\bIndonesia\b/i,
  /\bUbud\b/i,
  /Tegalalang/i,
  /Tirta Empul/i,
  /Tanah Lot/i,
  /Nusa Penida/i,
  /Ayung River/i,
];

const results: Array<Record<string, unknown>> = [];

for (const code of codes) {
  const tour = engine6ResolvedTours.find(entry => entry.productCode === code);
  if (!tour) {
    results.push({ code, ok: false, error: "missing tour" });
    continue;
  }

  const governed = resolveEngine6GovernedProductDescription(tour);
  const card = excerptEngine6CardDescription(governed);
  const issues: string[] = [];
  const graph = buildEngine6SchemaGraph(tour)["@graph"] as Array<
    Record<string, unknown>
  >;
  const productLd = graph.find(node => node["@type"] === "Product");
  const tripLd = graph.find(node => node["@type"] === "TouristTrip");

  const heroCandidates = [
    (tour as { heroImageUrl?: string }).heroImageUrl,
    (tour as { imageUrl?: string }).imageUrl,
    productLd?.image,
    tripLd?.image,
  ]
    .flat()
    .filter(Boolean)
    .map(String);

  const heroSet = new Set(heroCandidates);
  if (!tour.canonicalPath.includes("/south-korea/seoul/")) {
    issues.push("bad path");
  }
  if (!/Seoul/i.test(governed)) {
    issues.push("no Seoul in governed");
  }
  if (!/Seoul/i.test(card)) {
    issues.push("no Seoul in card excerpt");
  }
  for (const re of bleed) {
    if (re.test(governed) && !re.test(tour.title)) {
      issues.push(`bleed ${String(re)}`);
    }
  }
  if (heroSet.size > 1) {
    issues.push(`hero mismatch surfaces ${[...heroSet].join(" | ")}`);
  }
  if (productLd?.description && productLd.description !== governed) {
    issues.push("Product JSON-LD description mismatch");
  }
  if (tripLd?.description && tripLd.description !== governed) {
    issues.push("TouristTrip JSON-LD description mismatch");
  }

  const titles = (tour.itinerary || [])
    .map(item => item.title)
    .filter((title): title is string => Boolean(title));
  for (const title of titles) {
    if (/^(this|that|it|they|we|you)\b/i.test(title) || title.length < 3) {
      issues.push(`weak itinerary title: ${title}`);
    }
  }

  results.push({
    code,
    ok: issues.length === 0,
    path: tour.canonicalPath,
    title: tour.title,
    hero: heroCandidates[0] ?? null,
    card: card.slice(0, 140),
    itineraryTitles: titles,
    issues,
  });
}

const listingCodes = engine6ResolvedTours
  .filter(tour => tour.canonicalPath.includes("/south-korea/seoul/"))
  .map(tour => tour.productCode)
  .sort();

const summary = {
  selectedCount: codes.length,
  listingCount: listingCodes.length,
  listingMatchesSelection:
    JSON.stringify(listingCodes) === JSON.stringify([...codes].sort()),
  okCount: results.filter(result => result.ok).length,
  failCount: results.filter(result => result.ok === false).length,
  results,
};

writeFileSync(
  "scripts/seoul-render-surface-report.json",
  `${JSON.stringify(summary, null, 2)}\n`
);

console.log(
  JSON.stringify(
    {
      selectedCount: summary.selectedCount,
      listingCount: summary.listingCount,
      listingMatchesSelection: summary.listingMatchesSelection,
      okCount: summary.okCount,
      failCount: summary.failCount,
      failures: results.filter(result => result.ok === false),
    },
    null,
    2
  )
);

if (
  summary.failCount > 0 ||
  !summary.listingMatchesSelection ||
  summary.listingCount !== summary.selectedCount
) {
  process.exit(1);
}
