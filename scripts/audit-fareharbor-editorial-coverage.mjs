#!/usr/bin/env node
/** Read-only, catalog-wide quality report for Lead-to-Gold FareHarbor copy. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getFareHarborProofProducts } from "../src/data/fareharborLeadToGoldProof.ts";

const root = resolve(import.meta.dirname, "..");
const directory = resolve(root, "src/data");
const wordCount = text => text.match(/\b[\w]+(?:['’-][\w]+)*\b/g)?.length ?? 0;
const editorial = readFileSync(resolve(directory, "fareharborEditorialOverviews.ts"), "utf8");
const authoredIds = new Set([...editorial.matchAll(/^\s*"(\d+)":\s*"/gm)].map(match => match[1]));
// This uses the exact suppression and geography rules used by the site.
const active = getFareHarborProofProducts();
const unedited = active.filter(product => !authoredIds.has(product.itemId));
const short = unedited.filter(product => wordCount(product.paragraphs.join(" ")) < 100);
const long = unedited.filter(product => wordCount(product.paragraphs.join(" ")) > 150);
const insufficient = unedited.filter(product => product.exceptionStatus === "INSUFFICIENT_SOURCE_CONTENT");
const genericHighlights = unedited.filter(product => product.highlights.some(highlight =>
  /^(food\s*(?:&|and)\s*beverages?|(?:\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?\s*(?:hours?|minutes?|days?)\s*)?guided outing|meeting point|duration)$/i.test(highlight.trim())
));
const duplicates = active.filter((product, index) => active.findIndex(other => other.itemId === product.itemId) !== index);

const cityArg = process.argv.find(arg => arg.startsWith("--city="))?.slice(7);
const limitArg = Number(process.argv.find(arg => arg.startsWith("--limit="))?.slice(8) ?? 35);
const priority = short.filter(product => !cityArg || product.publicPath.split("/")[3] === cityArg).sort((a, b) => {
  const aCount = wordCount(a.paragraphs.join(" "));
  const bCount = wordCount(b.paragraphs.join(" "));
  return aCount - bCount || a.itemId.localeCompare(b.itemId);
});

console.log(JSON.stringify({
  active: active.length,
  authored: [...authoredIds].filter(id => active.some(product => product.itemId === id)).length,
  pending: unedited.length,
  pendingShort: short.length,
  pendingLong: long.length,
  pendingInsufficient: insufficient.length,
  pendingGenericHighlights: genericHighlights.length,
  duplicateIds: [...new Set(duplicates.map(product => product.itemId))],
  priority: priority.slice(0, Number.isFinite(limitArg) ? limitArg : 35).map(product => ({
    itemId: product.itemId,
    title: product.title,
    city: product.publicPath.split("/")[3],
    words: wordCount(product.paragraphs.join(" ")),
    status: product.exceptionStatus,
  })),
}, null, 2));
