import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type HarvestRecord = {
  source: string;
  id: string;
  title: string;
  route: string;
};
type HarvestItem = {
  key: string;
  headline?: string;
  description?: string;
  supplemental?: Record<string, string>;
  images?: string[];
  rewriteReady?: boolean;
  records: HarvestRecord[];
};
type Harvest = { summary: Record<string, unknown>; items: HarvestItem[] };

const harvestPath = process.argv[2] ?? path.resolve("/tmp/fareharbor-rebuild-harvest.json");
const root = process.cwd();
const clean = (value: string | undefined) => (value ?? "")
  .replace(/<[^>]+>/g, " ")
  .replace(/\[[^\]]+\]\([^)]*\)/g, " ")
  .replace(/[#*_>`~]+/g, " ")
  .replace(/\s+/g, " ")
  .trim();
const stripPrices = (value: string) => value
  .replace(/(?:starting\s+at\s+)?\$\s?\d+(?:\.\d{1,2})?/gi, "")
  .replace(/\bfrom\s+\d+(?:\.\d{1,2})?\s*(?:usd|dollars?)\b/gi, "")
  .replace(/\s+([,.;:])/g, "$1")
  .replace(/\s{2,}/g, " ")
  .trim();
const sentenceCase = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const durationFrom = (s: string) => s.match(/\b(?:about\s+|approximately\s+)?\d+(?:\.\d+)?(?:\s*(?:-|–|to)\s*\d+(?:\.\d+)?)?\s*(?:hours?|hrs?|minutes?|mins?|days?)\b/i)?.[0] ?? "";
const capacityFrom = (s: string) => s.match(/\b(?:holds?|capacity(?:\s+of)?|up to)\s+(?:up to\s+)?\d+[^.;]{0,45}/i)?.[0] ?? "";
const includesFrom = (s: string) => {
  const m = s.match(/\b(?:includes?|included)\s*[:\-]?\s*([^.;]{8,110})/i);
  return m?.[1]?.trim() ?? "";
};
const compactFacts = (item: HarvestItem) => {
  const headline = stripPrices(clean(item.headline));
  const description = stripPrices(clean(item.description));
  const supplemental = Object.values(item.supplemental ?? {}).map(clean).filter(Boolean).join(" ");
  const combined = `${headline} ${description} ${supplemental}`;
  const facts: string[] = [];
  const duration = durationFrom(combined);
  if (duration) facts.push(`a ${duration.toLowerCase()} format`);
  const capacity = capacityFrom(combined);
  if (capacity) facts.push(capacity.toLowerCase());
  const included = includesFrom(combined);
  if (included) facts.push(`included details such as ${included.toLowerCase()}`);
  const headlineBits = headline
    .split(/[•|·]/)
    .map(s => stripPrices(s.trim()))
    .filter(s => s.length >= 8 && s.length <= 95 && !/\$|starting\s+at|per\s+person/i.test(s));
  for (const bit of headlineBits) {
    if (facts.length >= 3) break;
    const normalized = bit.replace(/^[\-–—:]+\s*/, "").trim();
    if (!normalized) continue;
    if (!facts.some(f => f.toLowerCase().includes(normalized.toLowerCase()))) facts.push(normalized.toLowerCase());
  }
  if (!facts.length) {
    const first = description.split(/(?<=[.!?])\s+/)[0]?.trim() ?? "";
    const safe = first
      .replace(/\bwe\b/gi, "the operator")
      .replace(/\bour\b/gi, "the operator's")
      .replace(/\byou(?:'ll| will)?\b/gi, "guests")
      .replace(/\byour\b/gi, "guest")
      .replace(/\s+/g, " ")
      .trim();
    if (safe.length >= 20) facts.push(safe.slice(0, 180));
  }
  return facts.slice(0, 3).map(sentenceCase);
};

const harvest = JSON.parse(await readFile(harvestPath, "utf8")) as Harvest;
const rows: Record<string, { facts: string[]; images: string[] }> = {};
for (const item of harvest.items) {
  if (!item.rewriteReady) continue;
  const facts = compactFacts(item);
  const images = Array.from(new Set((item.images ?? []).filter(Boolean))).slice(0, 4);
  if (!facts.length && !images.length) continue;
  rows[item.key] = { facts, images };
}

const generated = `// Generated from the completed FareHarbor source harvest. Do not hand-edit.\nexport type FareHarborRebuildRecord = { facts: string[]; images: string[] };\nexport const fareHarborRebuildByKey: Record<string, FareHarborRebuildRecord> = ${JSON.stringify(rows)};\n`;
await writeFile(path.join(root, "src/data/fareharborRebuild.generated.ts"), generated, "utf8");

const helper = `import type { Tour } from "./tours.types";\nimport type { Engine2Tour } from "../engine2/data/loadEngine2";\nimport { getFareharborItemFromUrl } from "../lib/fareharbor";\nimport { fareHarborRebuildByKey } from "./fareharborRebuild.generated";\n\nconst resolve = (url: string) => {\n  const ref = getFareharborItemFromUrl(url);\n  return ref ? fareHarborRebuildByKey[\\\`${"${ref.companyShortname}:${ref.itemId}"}\\\`] ?? null : null;\n};\nconst prose = (title: string, operator: string | undefined, city: string, facts: string[]) => {\n  const who = operator ? \\\` with ${"${operator}"}\\\` : "";\n  const lead = \\\`${"${title}"} is an experience in ${"${city}"}${"${who}"}.\\\`;\n  const details = facts.length ? \\\` Operator-published details indicate ${"${facts.join(\"; \").replace(/; ([A-Z])/g, (_, c) => `; ${c.toLowerCase()}`)}"}.\\\` : "";\n  return \\\`${"${lead}${details}"} Use Learn More for current availability, exact departure details, and live terms.\\\`;\n};\n\nexport const applyFareHarborRebuildToTour = (tour: Tour): Tour => {\n  if (tour.bookingProvider !== "fareharbor") return tour;\n  const source = resolve(tour.bookingUrl);\n  if (!source) return tour;\n  const images = Array.from(new Set(source.images));\n  const description = prose(tour.title, tour.operator, tour.destination.city, source.facts);\n  const unresolvedPrice = tour.pricing?.isReliable !== true;\n  return {\n    ...tour,\n    shortDescription: description,\n    longDescription: description,\n    heroImage: images[0] ?? tour.heroImage,\n    primaryImageUrl: images[0] ?? tour.primaryImageUrl,\n    galleryImages: images.length >= 2 ? images : tour.galleryImages,\n    startingPrice: unresolvedPrice ? undefined : tour.startingPrice,\n    badges: unresolvedPrice ? { ...tour.badges, priceFrom: undefined } : tour.badges,\n  };\n};\n\nexport const applyFareHarborRebuildToEngine2Tour = (tour: Engine2Tour): Engine2Tour => {\n  if ((tour.bookingProvider ?? "fareharbor") !== "fareharbor") return tour;\n  const source = resolve(tour.bookingUrl ?? tour.booking.bookingUrl);\n  if (!source) return tour;\n  const images = Array.from(new Set(source.images));\n  const description = prose(tour.name, tour.provider.name, tour.geo.city, source.facts);\n  const unresolvedPrice = !tour.pricing?.price || Number.parseFloat(String(tour.pricing.price).replace(/[^0-9.]/g, "")) === 129;\n  return {\n    ...tour,\n    seo: { ...tour.seo, description, ogImage: images[0] ?? tour.seo.ogImage },\n    content: { ...tour.content, experienceText: description, overview: description },\n    images: { hero: images[0] ?? tour.images.hero, gallery: images.length >= 2 ? images : tour.images.gallery },\n    pricing: unresolvedPrice ? undefined : tour.pricing,\n  };\n};\n`;
await writeFile(path.join(root, "src/data/fareharborRebuild.ts"), helper, "utf8");

const patchFile = async (rel: string, mutator: (s: string) => string) => {
  const p = path.join(root, rel);
  const before = await readFile(p, "utf8");
  const after = mutator(before);
  if (after === before) throw new Error(`Patch produced no change for ${rel}`);
  await writeFile(p, after, "utf8");
};

await patchFile("src/engine2/data/loadEngine2.ts", s => {
  if (!s.includes('applyFareHarborRebuildToEngine2Tour')) {
    s = s.replace('import { isHardDeletedLegacyTour } from "../../utils/tours/hardDeleteLegacyTours";', 'import { isHardDeletedLegacyTour } from "../../utils/tours/hardDeleteLegacyTours";\nimport { applyFareHarborRebuildToEngine2Tour } from "../../data/fareharborRebuild";');
  }
  s = s.replace('const engine2Tours: Engine2Tour[] = allGeneratedTours', 'const baseEngine2Tours: Engine2Tour[] = allGeneratedTours');
  if (!s.includes('const engine2Tours: Engine2Tour[] = baseEngine2Tours.map')) {
    s = s.replace('\nconst byPath = new Map(', '\nconst engine2Tours: Engine2Tour[] = baseEngine2Tours.map(applyFareHarborRebuildToEngine2Tour);\n\nconst byPath = new Map(');
  }
  return s;
});

await patchFile("src/data/tours.ts", s => {
  if (!s.includes('applyFareHarborRebuildToTour')) {
    s = s.replace('import type { BookingProvider, Tour } from "./tours.types";', 'import type { BookingProvider, Tour } from "./tours.types";\nimport { applyFareHarborRebuildToTour } from "./fareharborRebuild";');
  }
  s = s.replace('export const tours: Tour[] = [', 'const baseTours: Tour[] = [');
  if (!s.includes('export const tours: Tour[] = baseTours.map')) {
    s = s.replace('\nexport const getLegacyTourBySlugs =', '\nexport const tours: Tour[] = baseTours.map(applyFareHarborRebuildToTour);\n\nexport const getLegacyTourBySlugs =');
  }
  return s;
});

await patchFile("src/pages/tours/TourDetail.tsx", s => {
  s = s.replace('price: applyPriceFloor(tour.startingPrice ?? null),', 'price: tour.bookingProvider === "fareharbor" && tour.pricing?.isReliable !== true ? null : applyPriceFloor(tour.startingPrice ?? null),');
  s = s.replace('  const heroStartingPriceLabel = formatStartingPrice(\n    fareHarborHeroStartingPrice ?? tour.startingPrice,\n    tour.currency\n  );', '  const hasVerifiedFareHarborPrice = tour.bookingProvider !== "fareharbor" || tour.pricing?.isReliable === true || Number.isFinite(fareHarborHeroStartingPrice);\n  const heroStartingPriceLabel = hasVerifiedFareHarborPrice\n    ? formatStartingPrice(fareHarborHeroStartingPrice ?? tour.startingPrice, tour.currency)\n    : null;');
  s = s.replace('  const isPriceFallbackApplied =\n    tour.startingPrice === undefined ||\n    tour.startingPrice === null ||\n    !Number.isFinite(tour.startingPrice) ||\n    tour.startingPrice < PRICE_MIN_THRESHOLD_USD;', '  const isPriceFallbackApplied =\n    tour.startingPrice === undefined ||\n    tour.startingPrice === null ||\n    !Number.isFinite(tour.startingPrice) ||\n    tour.startingPrice < PRICE_MIN_THRESHOLD_USD;\n  const unresolvedFareHarborPrice = tour.bookingProvider === "fareharbor" && !hasVerifiedFareHarborPrice;');
  s = s.replace('<h2 className="text-lg font-semibold text-[#1f2a1f]">\n                Ready to book?\n              </h2>', '<h2 className="text-lg font-semibold text-[#1f2a1f]">\n                {unresolvedFareHarborPrice ? "Explore this experience" : "Ready to book?"}\n              </h2>');
  s = s.replace('Book instantly through our {providerLabel} partner link. You’ll\n                be taken to the official booking page for availability and\n                pricing.', '{unresolvedFareHarborPrice\n                  ? `See current availability, exact details, and live terms on the official ${providerLabel} page.`\n                  : `Book instantly through our ${providerLabel} partner link. You’ll be taken to the official booking page for availability and pricing.`}');
  s = s.replace('<p className="mt-4 text-sm font-semibold text-[#1f2a1f]">\n                {isPriceFallbackApplied\n                  ? "From $129 per person"\n                  : `From ${startingPriceLabel} per person`}\n              </p>', '{!unresolvedFareHarborPrice ? (\n                <p className="mt-4 text-sm font-semibold text-[#1f2a1f]">\n                  {isPriceFallbackApplied ? "Price shown by provider" : `From ${startingPriceLabel} per person`}\n                </p>\n              ) : null}');
  s = s.replace('>\n                  BOOK\n                </a>', '>\n                  {unresolvedFareHarborPrice ? "Learn More" : "BOOK"}\n                </a>');
  s = s.replace('>\n                Book This Tour\n              </a>', '>\n                {unresolvedFareHarborPrice ? "Learn More" : "Book This Tour"}\n              </a>');
  return s;
});

const counts = {
  generatedRecords: Object.keys(rows).length,
  withTwoPlusImages: Object.values(rows).filter(r => r.images.length >= 2).length,
};
await writeFile(path.join(root, "reports/fareharbor-content-rebuild-summary.json"), JSON.stringify(counts, null, 2) + "\n", "utf8");
console.info(JSON.stringify(counts));
