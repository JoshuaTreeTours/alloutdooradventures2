import { readFileSync, writeFileSync } from "node:fs";

import {
  MELBOURNE_VIATOR_PUBLIC_PRODUCT_CODES,
  MELBOURNE_VIATOR_PUBLIC_RATINGS,
  MELBOURNE_VIATOR_PUBLIC_USD_FROM_PRICES,
} from "../src/engine6/melbourneViatorPublicRatings";
import {
  excerptEngine6CardDescription,
  resolveEngine6GovernedProductDescription,
} from "../src/engine6/governedEditorialDescriptions";
import { engine6ResolvedTours } from "../src/engine6/registry";
import { buildEngine6SchemaGraph } from "../src/engine6/schema/buildEngine6SchemaGraph";
import { formatEngine6StartingPriceLabel } from "../src/engine6/priceDisplay";
import { formatMerchantPrice } from "../src/utils/merchantPricing";
import type { MerchantFeedCommercialSnapshot } from "../src/engine6/merchantFeedCommercialSnapshot";

const codes = [...MELBOURNE_VIATOR_PUBLIC_PRODUCT_CODES];
const snapshot = JSON.parse(
  readFileSync("data/merchantFeed-commercial-snapshot.json", "utf8")
) as MerchantFeedCommercialSnapshot;
const snapshotByCode = new Map(
  snapshot.rows.map(row => [row.productCode, row])
);
const merchantByCode = new Map(
  readFileSync("data/merchantFeed.csv", "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(1)
    .map(line => {
      const id = line.split(",")[0];
      const priceMatch = line.match(/,in stock,([^,]+),new,/);
      return [id, { line, price: priceMatch?.[1] ?? "" }] as const;
    })
);
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
  /\bOsaka\b/i,
  /Dotonbori/i,
  /Kuromon/i,
  /Shinsekai/i,
  /\bKyoto\b/i,
  /Kinkaku-ji/i,
  /Kiyomizu-dera/i,
  /Fushimi Inari/i,
  /Arashiyama/i,
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
  /\bUbud\b/i,
  /Nusa Penida/i,
  /Tanah Lot/i,
  /\bSeoul\b/i,
  /Gyeongbokgung/i,
  /\bNamsan\b/i,
  /Han River/i,
  /Nami Island/i,
  /Bukhansan/i,
  /Gwangjang/i,
  /\bSydney\b/i,
  /Circular Quay/i,
  /Bondi Beach/i,
  /Blue Mountains/i,
  /Sydney Opera House/i,
  /Harbour Bridge/i,
  /The Rocks/i,
  /\bCairns\b/i,
  /Great Barrier Reef/i,
  /\bDaintree\b/i,
  /\bKuranda\b/i,
  /Green Island/i,
  /Fitzroy Island/i,
  /Atherton Tablelands/i,
  /Cape Tribulation/i,
  /\bQueenstown\b/i,
  /\bGlenorchy\b/i,
  /Fiordland/i,
  /Milford Sound/i,
  /Doubtful Sound/i,
  /\bNew Zealand\b/i,
  /Melbourne Beach/i,
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
  if (!tour.canonicalPath.includes("/australia/melbourne/")) {
    issues.push("bad path");
  }
  if (!/Melbourne/i.test(governed)) {
    issues.push("no Melbourne in governed");
  }
  if (!/Melbourne/i.test(card)) {
    issues.push("no Melbourne in card excerpt");
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

  const expectedUsd = MELBOURNE_VIATOR_PUBLIC_USD_FROM_PRICES[code];
  const expectedRating = MELBOURNE_VIATOR_PUBLIC_RATINGS[code];
  const offerLd = graph.find(node => node["@type"] === "Offer") as
    | { price?: number; priceCurrency?: string }
    | undefined;
  const merchant = merchantByCode.get(code);
  const snapshotRow = snapshotByCode.get(code);
  if (tour.priceAmount !== expectedUsd) {
    issues.push(`priceAmount ${tour.priceAmount} != ${expectedUsd}`);
  }
  if (tour.priceFormatted !== formatEngine6StartingPriceLabel(expectedUsd)) {
    issues.push(`priceFormatted ${tour.priceFormatted}`);
  }
  if (offerLd?.price !== expectedUsd || offerLd?.priceCurrency !== "USD") {
    issues.push(
      `Offer JSON-LD ${offerLd?.price} ${offerLd?.priceCurrency}`
    );
  }
  if (!tour.bookingUrl?.includes("currency=USD")) {
    issues.push("booking URL missing currency=USD");
  }
  if (tour.aggregateRating !== expectedRating.rating) {
    issues.push(`rating ${tour.aggregateRating}`);
  }
  if (tour.reviewCount !== expectedRating.reviewCount) {
    issues.push(`reviews ${tour.reviewCount}`);
  }
  if (!merchant?.price || merchant.price !== formatMerchantPrice(expectedUsd, "USD")) {
    issues.push(`merchant price ${merchant?.price}`);
  }
  if (!snapshotRow || snapshotRow.price !== merchant?.price) {
    issues.push(`snapshot price ${snapshotRow?.price}`);
  }
  if (snapshotRow && !/ USD$/i.test(snapshotRow.price)) {
    issues.push(`snapshot currency ${snapshotRow.price}`);
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
  .filter(tour => tour.canonicalPath.includes("/australia/melbourne/"))
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
  "scripts/melbourne-render-surface-report.json",
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
