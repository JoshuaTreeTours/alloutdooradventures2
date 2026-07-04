/**
 * One-off: patch Chicago exact-product fixture hero URLs with live tacdn images.
 * Run: npx tsx scripts/apply-chicago-fixture-hero-patches.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

const PREFIX =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/";

const patches: Record<string, string> = {
  "76126P2": "07/68/d8/75.jpg",
  "5580SKY": "15/d8/49/3b.jpg",
  "35169P12": "0f/7a/2d/3f.jpg",
  "5680NIGHT": "06/71/95/01.jpg",
  "5680DAY": "06/71/95/00.jpg",
  "7812P133": "0f/70/a1/b9.jpg",
  "8841P19": "0b/a5/24/c4.jpg",
  "188341P1": "08/8a/ea/2c.jpg",
  "130651P13": "15/52/5f/b2.jpg",
  "3397P10": "07/75/24/1f.jpg",
  "3332BITE": "07/36/9c/ba.jpg",
  "316128P3": "0b/e8/50/77.jpg",
  "5042P100": "07/1f/50/4b.jpg",
  "46250P9": "0e/b6/eb/1b.jpg",
  "68189P1": "07/84/87/25.jpg",
  "61552P8": "06/71/e6/1a.jpg",
  "3332DAY": "10/07/60/e9.jpg",
  "191307P3": "11/ef/57/70.jpg",
  "338277P2": "11/8c/72/b2.jpg",
  "7812P19": "0f/70/a1/b4.jpg",
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
