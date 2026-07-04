/**
 * Patch Boston exact-product fixture hero URLs with live Viator tacdn images.
 * Run: npx tsx scripts/apply-boston-fixture-hero-patches.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

const PREFIX =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/";

/** Verified from live Viator product pages (browser, Jul 2026). */
const patches: Record<string, string> = {
  "7167P68": "15/7d/a2/84.jpg",
  "5046BOS_OTT": "0a/59/cf/3e.jpg",
  "8647P466": "0d/0b/f0/cd.jpg",
  "400049P5": "12/4c/65/1e.jpg",
  "385595P5": "12/5b/b5/7d.jpg",
  "66111P3": "r/33/0a/2f/3b/caption.jpg",
  "26797P4": "10/6e/6c/d4.jpg",
  "8841P14": "12/89/5f/5e.jpg",
  "400049P3": "10/7d/7a/ff.jpg",
};

for (const [code, suffix] of Object.entries(patches)) {
  const fixturePath = `data/engine6/viator/${code}.exact-product.json`;
  const content = readFileSync(fixturePath, "utf8");
  const nextUrl = `${PREFIX}${suffix}`;
  const match = content.match(
    /"url": "(https:\/\/media\.tacdn\.com\/media\/attractions-splice-spp-674x446\/[^"]+)"/
  );

  if (!match) {
    throw new Error(`No hero URL in ${code}`);
  }

  const previousUrl = match[1];
  if (previousUrl === nextUrl) {
    console.log(`${code}: unchanged`);
    continue;
  }

  writeFileSync(fixturePath, content.replace(previousUrl, nextUrl));
  console.log(`${code}: patched -> ${suffix}`);
}
