import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { tours } from "../src/data/tours";
import { getAllEngine2Tours } from "../src/engine2/data/loadEngine2";
import { getViatorRegistry } from "../src/data/viatorRegistry";
import { buildTourImagePrompts } from "../src/utils/images/buildTourImagePrompts";

type ManifestEntry = {
  heroUrl: string;
  bottomUrl: string;
  prompts: {
    heroPrompt: string;
    bottomPrompt: string;
  };
  generatedAt: string;
};

type Manifest = Record<string, ManifestEntry>;

const OUT_DIR = path.resolve("public/images/tours/generated");
const MANIFEST_PATH = path.resolve("data/generatedImages/tourImages.json");
const MODEL_BASE =
  process.env.TOUR_IMAGE_MODEL_BASE ?? "https://image.pollinations.ai/prompt";

const readManifest = (): Manifest => {
  if (!fs.existsSync(MANIFEST_PATH)) return {};
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8")) as Manifest;
};

const writeManifest = (manifest: Manifest) => {
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
};

const buildImageId = (
  tourId: string,
  title: string,
  destination: string,
  kind: string
) =>
  crypto
    .createHash("sha1")
    .update(`${tourId}::${title}::${destination}::${kind}`)
    .digest("hex");

const parseLimit = () => {
  const arg = process.argv.find(item => item.startsWith("--limit="));
  if (!arg) return null;
  const value = Number(arg.split("=")[1]);
  return Number.isFinite(value) ? value : null;
};

const buildPromptUrl = (prompt: string, seed: string) => {
  const query = new URLSearchParams({
    width: "1536",
    height: "864",
    model: "flux",
    nologo: "true",
    seed,
  });
  return `${MODEL_BASE}/${encodeURIComponent(prompt)}?${query.toString()}`;
};

const fetchAndSave = async (
  prompt: string,
  seed: string,
  outputPath: string
) => {
  if (fs.existsSync(outputPath)) return;
  const url = buildPromptUrl(prompt, seed);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Image generation failed ${response.status} for ${outputPath}`
    );
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
};

const collectTours = () => {
  const engine1 = tours.map(t => ({
    tourId: t.id,
    title: t.title,
    destination: `${t.destination.city}, ${t.destination.state}`,
    activity: t.primaryCategory,
    keyFacts: [t.badges.duration ?? ""],
  }));

  const engine2 = getAllEngine2Tours().map(t => ({
    tourId: `engine2-${t.id}`,
    title: t.name,
    destination: `${t.geo.city}, ${t.geo.region}`,
    activity: t.sourceActivitySlug,
    keyFacts: [t.content.logistics?.durationText ?? ""],
  }));

  const viator = getViatorRegistry().map(item => ({
    tourId: `viator-${item.slug}`,
    title: item.parsed?.title ?? item.slug,
    destination: item.parsed?.destinationText ?? item.destinationSlug,
    activity: "viator",
    keyFacts: [
      item.parsed?.durationText ?? "",
      item.parsed?.operatorName ?? "",
    ],
  }));

  const seen = new Set<string>();
  return [...engine1, ...engine2, ...viator].filter(item => {
    if (seen.has(item.tourId)) return false;
    seen.add(item.tourId);
    return true;
  });
};

async function run() {
  const limit = parseLimit();
  const allTours = collectTours();
  const tourList =
    typeof limit === "number" ? allTours.slice(0, limit) : allTours;
  const manifest = readManifest();

  for (const tour of tourList) {
    const { heroPrompt, bottomPrompt } = buildTourImagePrompts({
      title: tour.title,
      destinationName: tour.destination,
      activityCategory: tour.activity,
      keyFacts: tour.keyFacts,
    });

    const heroId = buildImageId(
      tour.tourId,
      tour.title,
      tour.destination,
      "hero"
    );
    const bottomId = buildImageId(
      tour.tourId,
      tour.title,
      tour.destination,
      "bottom"
    );

    const heroFilename = `${heroId}-hero.webp`;
    const bottomFilename = `${bottomId}-bottom.webp`;

    const heroPath = path.join(OUT_DIR, heroFilename);
    const bottomPath = path.join(OUT_DIR, bottomFilename);

    await fetchAndSave(heroPrompt, heroId, heroPath);
    await fetchAndSave(bottomPrompt, bottomId, bottomPath);

    manifest[tour.tourId] = {
      heroUrl: `/images/tours/generated/${heroFilename}`,
      bottomUrl: `/images/tours/generated/${bottomFilename}`,
      prompts: { heroPrompt, bottomPrompt },
      generatedAt: new Date().toISOString(),
    };
    console.log(`generated images for ${tour.tourId}`);
  }

  writeManifest(manifest);
  console.log(`wrote manifest for ${Object.keys(manifest).length} tours`);
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
