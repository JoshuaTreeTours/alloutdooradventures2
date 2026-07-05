/**
 * Process Browser MCP / Glass DOM extracts for Naples Viator products.
 * Append objects to scripts/naples-browser-extracts.json, then run:
 *   npx tsx scripts/extract-naples-products-browser-mcp.ts
 *
 * Each extract should be the JSON from EXTRACT_MOAB_PRODUCT_JS in lib/moabBrowserExtract.ts.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";

import { EXTRACT_MOAB_PRODUCT_JS } from "./lib/moabBrowserExtract";

export { EXTRACT_MOAB_PRODUCT_JS };

type CatalogEntry = { productCode: string; sourceUrl: string };

const REJECT_TITLE_PATTERN =
  /audio|self[- ]?guided|gps|app[- ]?based|smartphone|download|scavenger hunt|admission ticket|entry ticket|transfer only|airport transfer|port transfer|paranormal|ghost|haunted|murder mystery/i;

const WEAK_COMMERCIAL_PATTERN =
  /transfer only|airport shuttle|one-way transfer|roundtrip transfer|parking pass|rental car|scavenger hunt|frenzy hunt/i;

const PREFERRED_PATTERN =
  /everglades|ten thousand islands|private boat|dolphin|manatee|wildlife|kayak|shelling|fishing|sunset|eco|food|cultural|premium|luxury|small group|guided|day trip|airboat|swamp|boat|sail|catamaran|cruise|paddle|snorkel|shell|island|marco|rookery|mangrove|biologist|naturalist|charter|private/i;

const priceNum = (record: Record<string, unknown>) =>
  record.priceFrom
    ? parseFloat(String(record.priceFrom).replace(/[^\d.]/g, ""))
    : 0;

export const classifyNaplesExtract = (
  entry: CatalogEntry,
  parsed: Record<string, unknown>
) => {
  const titleText = String(parsed.title ?? "");
  const titleRejected =
    titleText &&
    (REJECT_TITLE_PATTERN.test(titleText) ||
      WEAK_COMMERCIAL_PATTERN.test(titleText));
  const preferred = PREFERRED_PATTERN.test(
    `${parsed.title ?? ""} ${(parsed.categories as string[])?.join(" ") ?? ""}`
  );
  const record = {
    ...parsed,
    productCode: entry.productCode,
    productUrl: entry.sourceUrl,
    preferred,
  };
  const ok =
    Boolean(parsed.title) &&
    priceNum(record) > 50 &&
    Boolean(parsed.heroUrl) &&
    !titleRejected &&
    !/unavailable|similar experiences/i.test(titleText);
  return { record, ok, titleRejected, price: priceNum(record) };
};

const main = () => {
  const catalog = JSON.parse(
    readFileSync("scripts/naples-catalog-products.json", "utf8")
  ) as CatalogEntry[];
  const byCode = new Map(catalog.map(entry => [entry.productCode.toUpperCase(), entry]));

  const extractsPath = "scripts/naples-browser-extracts.json";
  if (!existsSync(extractsPath)) {
    console.error(`Missing ${extractsPath}. Save Browser MCP evaluate results there first.`);
    process.exit(1);
  }

  const extracts = JSON.parse(readFileSync(extractsPath, "utf8")) as Record<string, unknown>[];
  const results: Record<string, unknown>[] = [];
  const rejected: Record<string, unknown>[] = [];

  for (const parsed of extracts) {
    const code = String(parsed.productCode ?? "").toUpperCase();
    const entry = byCode.get(code);
    if (!entry) {
      rejected.push({ ...parsed, error: "Unknown catalog productCode" });
      continue;
    }
    const { record, ok, titleRejected, price } = classifyNaplesExtract(entry, parsed);
    if (ok) results.push(record);
    else rejected.push({ ...record, priceNum: price, titleRejected });
  }

  results.sort((a, b) => {
    const preferredA = (a.preferred as boolean) ? 1 : 0;
    const preferredB = (b.preferred as boolean) ? 1 : 0;
    if (preferredB !== preferredA) return preferredB - preferredA;
    if (priceNum(b) !== priceNum(a)) return priceNum(b) - priceNum(a);
    return ((b.reviewCount as number) ?? 0) - ((a.reviewCount as number) ?? 0);
  });

  writeFileSync("scripts/naples-live-product-data.json", `${JSON.stringify(results, null, 2)}\n`);
  writeFileSync(
    "scripts/naples-viator-discovery-results.json",
    `${JSON.stringify({ available: results, rejected }, null, 2)}\n`
  );

  const premiumCount = results.filter(r => priceNum(r) > 100).length;
  console.log(`Available: ${results.length}, Rejected: ${rejected.length}, Over $100: ${premiumCount}`);
};

main();
