import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

/** Live og:image heroes verified HTTP 200 from public Viator product pages. */
const LIVE_PHILADELPHIA_HEROES: Record<string, string> = {
  "8841P1":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/15/72/67/c3.jpg",
  "8841P6":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/09/93/db/9f.jpg",
  "8841P70":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/0e/bf/b4/4b.jpg",
  "8841P10":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/15/71/9e/58.jpg",
  "102233P1":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/e5/e4/65.jpg",
  "102233P3":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/09/2d/f9/73.jpg",
  "255730P245":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/3b/f2/50.jpg",
  "255730P256":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/10/71/83/24.jpg",
  "86032P3":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/9f/48/5a.jpg",
  "8841P73":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/0e/f4/02/89.jpg",
  "153296P3":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/08/7e/9c/b1.jpg",
  "8841P82":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/46/33/9a.jpg",
  "86032P1":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/0c/06/4a/fc.jpg",
  "8841P34":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/d3/c9/c3.jpg",
  "5582660P3":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/15/b5/3e/ca.jpg",
  "6314PHILSEG":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/15/73/0b/cd.jpg",
  "5042PHLSPI":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/10/48/23/1e.jpg",
  "5042P61":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/10/48/1f/e2.jpg",
  "8841P27":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/68/d1/7b.jpg",
  "25140P1":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/11/d8/46/9c.jpg",
  "115692P1":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/10/45/1a/7f.jpg",
  "52886P6":
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/r/32/ea/ad/b3/caption.jpg",
};

for (const [productCode, heroUrl] of Object.entries(LIVE_PHILADELPHIA_HEROES)) {
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
