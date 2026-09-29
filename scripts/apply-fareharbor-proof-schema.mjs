import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { tsImport } from "tsx/esm/api";

const DIST = path.resolve("dist");

try {
  const distStat = await stat(DIST);
  if (!distStat.isDirectory()) {
    console.log("[fareharbor-proof-schema] dist is not a directory; skipping");
    process.exit(0);
  }
} catch {
  console.log("[fareharbor-proof-schema] dist is missing; skipping");
  process.exit(0);
}

const proofModule = await tsImport(
  pathToFileURL(path.resolve("src/data/fareharborLeadToGoldProof.ts")).href,
  import.meta.url
);
const products = proofModule.getFareHarborProofProducts();
const bySlug = new Map(
  products.map(product => [product.publicPath.split("/").filter(Boolean).pop(), product])
);

const files = [];
const walk = async directory => {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else if (entry.name.endsWith(".html")) {
      files.push(full);
    }
  }
};
await walk(DIST);

const found = new Set();
let patched = 0;
for (const file of files) {
  const normalized = file.split(path.sep).join("/");
  if (normalized.includes("/book/")) {
    continue;
  }
  const parts = normalized.split("/");
  const product = [...bySlug.entries()].find(
    ([slug]) => parts.includes(slug) || parts.includes(`${slug}.html`)
  )?.[1];
  if (!product) {
    continue;
  }
  const html = await readFile(file, "utf8");
  const next = proofModule.applyFareHarborProofToHtml(html, product);
  if (next !== html) {
    await writeFile(file, next, "utf8");
  }
  found.add(product.itemId);
  patched += 1;
}

const missing = products.filter(product => !found.has(product.itemId));
if (missing.length) {
  console.error(
    `[fareharbor-proof-schema] missing built HTML for ${missing
      .map(product => product.publicPath)
      .join(", ")}`
  );
  process.exit(1);
}

console.log(
  `[fareharbor-proof-schema] patched ${patched} HTML file(s) for ${found.size} proof products`
);
