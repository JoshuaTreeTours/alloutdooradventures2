import fs from "node:fs";
import path from "node:path";

import { slugify } from "../src/utils/slugify";
import {
  readViatorCachedHtml,
  writeViatorCachedHtml,
} from "../src/utils/viator/cache";
import {
  deriveHighlights,
  deriveLongDescription,
} from "../src/utils/viator/deriveContent";
import { fetchViatorHtml } from "../src/utils/viator/fetchViatorHtml";
import { parseViatorTour } from "../src/utils/viator/parseViatorTour";
import { getViatorMedia } from "../src/utils/viator/getViatorMedia";
import { getDestinationFallbackImages } from "../src/utils/images/destinationFallback";
import { selectHeroImage } from "../src/utils/viator/selectHeroImage";
import type { ViatorRegistryEntry } from "../src/utils/viator/types";

type ViatorSeed = {
  viatorUrl: string;
  destinationSlug: string;
  regionSlug: string;
};

const seedsPath = path.resolve("data/viatorSeeds.json");
const outputPath = path.resolve("data/generated/viatorRegistry.json");

const extractProductCode = (url: string) => {
  const match = url.match(/\/d\d+-([A-Za-z0-9]+)/);
  return match?.[1]?.toLowerCase();
};

async function run() {
  const enabled = process.env.ENABLE_VIATOR_AGGREGATE === "true";
  if (!enabled) {
    console.log(
      "ENABLE_VIATOR_AGGREGATE is not true; skipping viator registry generation."
    );
    return;
  }

  const seeds = JSON.parse(fs.readFileSync(seedsPath, "utf-8")) as ViatorSeed[];
  const output: ViatorRegistryEntry[] = [];

  for (const seed of seeds) {
    const cached = readViatorCachedHtml(seed.viatorUrl);
    const html = cached ?? (await fetchViatorHtml(seed.viatorUrl));
    if (!cached) {
      writeViatorCachedHtml(seed.viatorUrl, html);
    }

    const parsed = parseViatorTour(html, seed.viatorUrl);
    const media = await getViatorMedia(seed.viatorUrl);
    const fallback = getDestinationFallbackImages(
      seed.regionSlug,
      seed.destinationSlug
    );
    const heroImageUrl = selectHeroImage({
      title: parsed.title ?? "Viator tour",
      destinationSlug: seed.destinationSlug,
      images: media.images,
      destinationFallbackHero: fallback.hero,
      genericOffroadFallback:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    });
    const bottomImageUrl =
      media.images.find(image => image !== heroImageUrl) ?? undefined;

    const titleSlug = slugify(parsed.title ?? "viator-tour");
    const productCode = extractProductCode(seed.viatorUrl);
    const slug = productCode ? `${titleSlug}-${productCode}` : titleSlug;

    output.push({
      slug,
      pagePath: `/destinations/${seed.regionSlug}/${seed.destinationSlug}/tours/${slug}`,
      regionSlug: seed.regionSlug,
      destinationSlug: seed.destinationSlug,
      viatorUrl: seed.viatorUrl,
      source: "viator",
      parsed,
      media,
      heroImageUrl,
      bottomImageUrl,
      derived: {
        highlights: deriveHighlights(parsed),
        description: deriveLongDescription(parsed),
      },
    });
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Generated ${output.length} viator registry entries.`);
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
