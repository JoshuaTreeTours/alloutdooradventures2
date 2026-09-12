import editorialRegistry from "../src/data/fareharborEditorial.generated.json";
import { tours as routeBackedTours } from "../src/data/tours";
import { getAllEngine2Tours } from "../src/engine2/data/loadEngine2";
import { getFareharborItemFromUrl } from "../src/lib/fareharbor";
import { getFareHarborEditorialByKey } from "../src/data/fareharborEditorial";
import {
  getExpandedTourDescription,
  getTourHighlights,
} from "../src/data/tourNarratives";
import { buildTourMetaDescription } from "../src/utils/seo";

const registry = editorialRegistry as {
  summary: {
    total: number;
    sourceBacked: number;
    metadataFallback: number;
  };
  items: Record<
    string,
    {
      overview: string;
      highlights: string[];
      metaDescription: string;
      sourceBacked: boolean;
    }
  >;
};

const failures: string[] = [];
const keys = Object.keys(registry.items);

if (keys.length === 0) failures.push("generated editorial registry is empty");
if (registry.summary.total !== keys.length) {
  failures.push(`summary total ${registry.summary.total} != registry keys ${keys.length}`);
}
if (registry.summary.sourceBacked + registry.summary.metadataFallback !== keys.length) {
  failures.push("sourceBacked + metadataFallback does not equal registry total");
}

const bannedPhrases = [
  "professional guidance and memorable outdoor moments",
  "keeps the logistics simple and the scenery front and center",
  "designed for travelers who want more than a quick photo stop",
  "delivers a guided outdoor adventure experience with a relaxed, scenic pace",
  "scenery and local insight are the highlights",
];

for (const [key, entry] of Object.entries(registry.items)) {
  if (!entry.overview.trim()) failures.push(`${key}: missing overview`);
  if (!entry.metaDescription.trim()) failures.push(`${key}: missing meta description`);
  if (!entry.highlights.length) failures.push(`${key}: missing highlights`);
  const combined = `${entry.overview} ${entry.metaDescription} ${entry.highlights.join(" ")}`.toLowerCase();
  for (const phrase of bannedPhrases) {
    if (combined.includes(phrase)) failures.push(`${key}: legacy boilerplate remains: ${phrase}`);
  }
}

const expectedKeys = new Set<string>();
const addExpected = (bookingUrl?: string) => {
  const ref = getFareharborItemFromUrl(bookingUrl);
  if (ref) expectedKeys.add(`${ref.companyShortname}:${ref.itemId}`);
};

for (const tour of routeBackedTours) {
  if (tour.bookingProvider === "fareharbor" && tour.engine !== "engine6") {
    addExpected(tour.bookingUrl);
  }
}
for (const tour of getAllEngine2Tours()) {
  if ((tour.bookingProvider ?? "fareharbor") === "fareharbor" && tour.engine !== "engine3") {
    addExpected(tour.bookingUrl ?? tour.booking.bookingUrl);
  }
}

for (const key of expectedKeys) {
  if (!registry.items[key]) failures.push(`${key}: missing registry entry`);
}
if (registry.summary.total !== expectedKeys.size) {
  failures.push(
    `registry total ${registry.summary.total} != deduped non-Engine6 FareHarbor universe ${expectedKeys.size}`
  );
}

const routeSample = routeBackedTours.find(tour => {
  if (tour.bookingProvider !== "fareharbor" || tour.engine === "engine6") return false;
  const ref = getFareharborItemFromUrl(tour.bookingUrl);
  return Boolean(ref && getFareHarborEditorialByKey(`${ref.companyShortname}:${ref.itemId}`));
});

if (routeSample) {
  const editorial = getFareHarborEditorialByKey(
    `${getFareharborItemFromUrl(routeSample.bookingUrl)!.companyShortname}:${getFareharborItemFromUrl(routeSample.bookingUrl)!.itemId}`
  )!;
  const paragraphs = getExpandedTourDescription(routeSample);
  if (paragraphs.join("\n\n") !== editorial.overview) {
    failures.push(`route sample ${routeSample.id}: visible narrative does not use editorial overview`);
  }
  if (getTourHighlights(routeSample).join("|") !== editorial.highlights.join("|")) {
    failures.push(`route sample ${routeSample.id}: highlights do not use editorial registry`);
  }
  if (buildTourMetaDescription(routeSample) !== editorial.metaDescription) {
    failures.push(`route sample ${routeSample.id}: meta description does not use editorial registry`);
  }
}

const engine2Sample = getAllEngine2Tours().find(tour => {
  if ((tour.bookingProvider ?? "fareharbor") !== "fareharbor" || tour.engine === "engine3") return false;
  const ref = getFareharborItemFromUrl(tour.bookingUrl ?? tour.booking.bookingUrl);
  return Boolean(ref && getFareHarborEditorialByKey(`${ref.companyShortname}:${ref.itemId}`));
});

if (engine2Sample) {
  const ref = getFareharborItemFromUrl(engine2Sample.bookingUrl ?? engine2Sample.booking.bookingUrl)!;
  const editorial = getFareHarborEditorialByKey(`${ref.companyShortname}:${ref.itemId}`)!;
  if (engine2Sample.content.experienceText !== editorial.overview) {
    failures.push(`Engine2 sample ${engine2Sample.id}: experienceText does not use editorial overview`);
  }
  if (engine2Sample.seo.description !== editorial.metaDescription) {
    failures.push(`Engine2 sample ${engine2Sample.id}: SEO description does not use editorial meta description`);
  }
  if (engine2Sample.content.highlights.join("|") !== editorial.highlights.join("|")) {
    failures.push(`Engine2 sample ${engine2Sample.id}: highlights do not use editorial registry`);
  }
}

const brusselsKeys = keys.filter(key => {
  const entry = registry.items[key];
  return /brussels/i.test(`${entry.overview} ${entry.metaDescription}`);
});

if (failures.length) {
  console.error(`[fh-editorial-verify] FAILURES=${failures.length}`);
  for (const failure of failures.slice(0, 100)) console.error(` - ${failure}`);
  process.exitCode = 1;
} else {
  console.info(
    `[fh-editorial-verify] PASS ${JSON.stringify({
      total: keys.length,
      sourceBacked: registry.summary.sourceBacked,
      metadataFallback: registry.summary.metadataFallback,
      brusselsMentions: brusselsKeys.length,
      routeSample: routeSample?.id ?? null,
      engine2Sample: engine2Sample?.id ?? null,
    })}`
  );
}
