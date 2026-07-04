import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const TACDN = "https://media.tacdn.com/media/attractions-splice-spp-674x446";

/** Verified from live Viator Philadelphia product pages and catalog listings. */
const VERIFIED_HERO_PATHS: Record<string, string> = {
  "255730P245": `${TACDN}/12/3b/f2/57.jpg`,
  "255730P256": `${TACDN}/12/57/30/d2.jpg`,
  "86032P1": `${TACDN}/0c/06/4a/fc.jpg`,
  "86032P3": `${TACDN}/0b/d3/c9/c3.jpg`,
  "8841P34": `${TACDN}/0f/0d/36/1f.jpg`,
  "8841P73": `${TACDN}/0e/f4/02/89.jpg`,
  "8841P70": `${TACDN}/0e/bf/b4/4b.jpg`,
  "6314PHILSEG": `${TACDN}/15/73/0b/cd.jpg`,
  "52886P6": `${TACDN}/13/63/dc/41.jpg`,
  "5582660P3": `${TACDN}/30/02/c9/57.jpg`,
  "115692P1": `${TACDN}/07/ab/c6/e2.jpg`,
  "5042PHLSPI": `${TACDN}/0f/c0/bd/bd.jpg`,
};

for (const [productCode, heroUrl] of Object.entries(VERIFIED_HERO_PATHS)) {
  const fixturePath = path.join(
    process.cwd(),
    "data",
    "engine6",
    "viator",
    `${productCode}.exact-product.json`
  );
  const payload = JSON.parse(readFileSync(fixturePath, "utf8")) as {
    product: {
      media: { images: Array<{ variants: { FULL: { url: string } } }> };
    };
  };
  payload.product.media.images[0].variants.FULL.url = heroUrl;
  writeFileSync(fixturePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Patched hero for ${productCode}`);
}
