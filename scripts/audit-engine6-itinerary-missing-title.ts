import { extractEngine6Product } from "../api/engine6/viatorExtractors";
import { mapViatorToEngine6Tour } from "../src/engine6/mapViatorToEngine6Tour";
import { engine6ResolvedTours } from "../src/engine6/registry";
import { ENGINE6_VALIDATION_FIXTURES } from "../src/engine6/validationFixtures";

type Rec = Record<string, any>;
type Seg = string | number;

const asRec = (v: unknown): Rec | null => v && typeof v === "object" && !Array.isArray(v) ? v as Rec : null;
const read = (root: unknown, path: Seg[]) => path.reduce((c: any, s) => c == null ? undefined : c[s as any], root as any);
const fp = (path: Seg[]) => `product${path.map(s => typeof s === "number" ? `[${s}]` : `.${s}`).join("")}`;
const clean = (v: unknown) => typeof v === "string" ? v.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ").trim() : "";
const nonEmpty = (v: unknown) => { const s = clean(v); return s ? s : null; };
const excerpt = (s?: string | null) => (s ?? "").replace(/\s+/g, " ").slice(0, 220);

const rawProduct = (raw: unknown) => asRec(asRec(raw)?.product) ?? asRec(raw) ?? {};
const productTitle = (product: Rec) => nonEmpty(product.title) ?? nonEmpty(product.productTitle) ?? nonEmpty(product.name) ?? "";
const explicitName = (row: Rec) => {
  const poi = asRec(row.pointOfInterest); const pil = asRec(row.pointOfInterestLocation); const stop = asRec(row.stop); const loc = asRec(row.location);
  return nonEmpty(pil?.locationName) ?? nonEmpty(pil?.title) ?? nonEmpty(pil?.name) ?? nonEmpty(row.name) ?? nonEmpty(row.label) ?? nonEmpty(poi?.title) ?? nonEmpty(poi?.name) ?? nonEmpty(stop?.name) ?? nonEmpty(stop?.title) ?? nonEmpty(loc?.name) ?? null;
};
const descInferredTitle = (row: Rec) => {
  const d = nonEmpty(row.description); if (!d) return null;
  const first = d.replace(/^he\s+(?=[A-Z])/, "The ").split(/(?<!\b\d)(?<=[.!?])\s+/)[0]?.trim() ?? "";
  if (!first) return null;
  const subject = first.match(/^((?:The\s+)?[A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ'&\-]*(?:[\s,/]+[A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ'&\-]*){0,7})\s+(?:is|are|offers?|provides?|features?)\b/);
  if (subject?.[1]) return subject[1].replace(/[.,:;]+$/, "").trim();
  const loc = first.match(/\b(?:arrive in|continue to|final stop[:\s]+|visit|return to|journey in)\s+([A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ'&\-]*(?:[\s,/]+[A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ'&\-]*){0,5})/);
  if (loc?.[1]) return loc[1].replace(/[.,:;]+$/, "").trim();
  return first.replace(/[.,:;]+$/, "").trim() || null;
};
const hasProseShape = (title: string) => /\b(is|are|will|you|we|your|tour|guide|enjoy|explore|experience|travel|visit|stop|return|continue|arrive)\b/i.test(title) || title.split(/\s+/).length >= 7;

const collectRows = (value: unknown, base: Seg[]): Array<{row: Rec; path: Seg[]}> => {
  if (Array.isArray(value)) return value.flatMap((v, i) => collectRows(v, [...base, i]));
  const row = asRec(value); if (!row) return [];
  const looks = nonEmpty(row.title) || nonEmpty(row.name) || nonEmpty(row.label) || nonEmpty(row.description) || asRec(row.pointOfInterestLocation) || asRec(row.pointOfInterest) || asRec(row.stop) || asRec(row.location);
  const nestedKeys = ["itineraryItems","items","stops","locations","dayItems","activities","pointsOfInterest","points","dayPlans","days","itineraryDays"];
  const nested = nestedKeys.flatMap(k => collectRows(row[k], [...base, k]));
  return looks ? [{row, path: base}, ...nested] : nested;
};
const sources: Seg[][] = [["itineraryItems"],["itinerary","itineraryItems"],["itinerary","items"],["itinerary","stops"],["itinerary","days"],["itinerary","dayPlans"],["itinerary","itineraryDays"],["itinerary","locations"],["whatToExpect","items"],["whatToExpect","stops"],["whatToExpect","days"],["whatToExpect","itineraryDays"],["structuredItinerary","days"],["structuredItinerary","items"],["itinerary"],["whatToExpect"]];

const routeByCode = new Map(engine6ResolvedTours.map(t => [t.productCode, t.canonicalPath]));
const rows: any[] = [];
for (const fixture of ENGINE6_VALIDATION_FIXTURES) {
  const product = rawProduct(fixture.rawPayload);
  const extraction = extractEngine6Product(fixture.rawPayload);
  let tour: any = null;
  try { tour = mapViatorToEngine6Tour({source:"bundled-fallback", rawProductCode: fixture.productCode, rawProduct: extraction.product, diagnostics: {source:"bundled-fallback", hasViatorApiKey:false, attemptedLiveFetch:false, upstreamStatus:null, upstreamContentType:"fixture", upstreamOk:null, usedBundledFallbackBecause:"audit", bookingUrlSource: extraction.diagnostics.productUrlFieldPath ?? "generated", fieldLevelFallbackUsed:false, fallbackFieldNames:[], ...extraction.diagnostics}, extracted: extraction.extracted} as any); } catch {}
  const sourcePath = sources.find(p => collectRows(read(product, p), p).length)?.slice() ?? [];
  const rawRows = sourcePath.length ? collectRows(read(product, sourcePath), sourcePath) : [];
  rawRows.forEach(({row, path}, idx) => {
    const rawTitle = nonEmpty(row.title);
    if (rawTitle) return;
    if (explicitName(row)) return;
    const inferred = descInferredTitle(row);
    if (!inferred) return;
    const rendered = tour?.itinerary?.[idx]?.title ?? extraction.extracted.itinerary[idx]?.title ?? inferred;
    if (!hasProseShape(rendered)) return;
    const pil = asRec(row.pointOfInterestLocation);
    const loc = asRec(pil?.location);
    rows.push({ productCode: fixture.productCode, productTitle: productTitle(product), route: routeByCode.get(fixture.productCode) ?? tour?.canonicalPath ?? "", rawItineraryFieldPath: fp(path), rawTitle: rawTitle ?? null, rawDescriptionExcerpt: excerpt(nonEmpty(row.description)), locationRef: nonEmpty(loc?.ref) ?? null, attractionId: nonEmpty(row.attractionId) ?? nonEmpty(asRec(row.pointOfInterest)?.attractionId) ?? null, extractedTitle: extraction.extracted.itinerary[idx]?.title ?? null, renderedTitle: rendered, safeLandmarkNameCanBeInferred: Boolean(nonEmpty(loc?.ref) || nonEmpty(row.attractionId) || nonEmpty(asRec(row.pointOfInterest)?.attractionId)) ? "lookup-needed; not from current fields alone" : "no" });
  });
}
const products = new Set(rows.map(r => r.productCode));
const locationRefs = [...new Set(rows.map(r => r.locationRef).filter(Boolean))];
const attractionIds = [...new Set(rows.map(r => r.attractionId).filter(Boolean))];
const lines = [
  "# Engine6 itinerary missing-title audit",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## Scope and method",
  "- Audited bundled Engine6 Viator exact-product fixtures through the current Engine6 extractor and renderer mapping.",
  "- Flagged itinerary rows where the raw row title is null/empty, no explicit stop/location/landmark name field exists, the extractor falls back to description-derived text, and the rendered title has prose-like shape.",
  "- Live/API-enriched paths were not fetched by this script; no Viator API key is assumed in local validation.",
  "",
  "## Totals",
  `- Total affected products: **${products.size}**`,
  `- Total affected itinerary rows: **${rows.length}**`,
  `- Distinct pointOfInterestLocation.location.ref values present on affected rows: **${locationRefs.length}**${locationRefs.length ? ` (${locationRefs.join(", ")})` : ""}`,
  `- Distinct attractionId values present on affected rows: **${attractionIds.length}**${attractionIds.length ? ` (${attractionIds.join(", ")})` : ""}`,
  "",
  "## Key question",
  locationRefs.length || attractionIds.length ? "Affected rows include IDs that may support a lookup-table solution, but the audit does not prove stable landmark names without an authoritative ID-to-name source." : "Affected rows do not include attractionId or pointOfInterestLocation.location.ref values, so the current bundled data cannot map them to stable landmark names such as Wollman Rink, Central Park Carousel, Chess & Checkers House, Literary Walk, The Dairy, Bow Bridge, or Bethesda Fountain without adding an external/source-backed lookup or product-specific data.",
  "",
  "## Recommended resolution path",
  rows.length === 0 ? "4. Leave description-derived titles unchanged for now; no affected bundled rows matched this audit." : "2. Use an attractionId/location.ref lookup table only where IDs are present and source-backed; otherwise use product-specific overrides for confirmed landmarks. Do not invent landmarks from prose.",
  "",
  "## Top 20 examples",
  "",
  "| # | Product code | Product title | Route | Raw itinerary field path | Raw title | Description excerpt | location.ref | attractionId | Extracted title | Rendered title | Safe landmark inference |",
  "|---:|---|---|---|---|---|---|---|---|---|---|---|",
  ...rows.slice(0,20).map((r,i) => `| ${i+1} | ${r.productCode} | ${r.productTitle.replace(/\|/g,"\\|")} | ${r.route || "—"} | ${r.rawItineraryFieldPath} | ${r.rawTitle ?? "null"} | ${r.rawDescriptionExcerpt.replace(/\|/g,"\\|")} | ${r.locationRef ?? "—"} | ${r.attractionId ?? "—"} | ${(r.extractedTitle ?? "—").replace(/\|/g,"\\|")} | ${(r.renderedTitle ?? "—").replace(/\|/g,"\\|")} | ${r.safeLandmarkNameCanBeInferred} |`),
  "",
  "## Full affected rows (JSON)",
  "```json",
  JSON.stringify(rows, null, 2),
  "```",
  "",
];
await import("node:fs/promises").then(fs => fs.writeFile("artifacts/engine6-itinerary-missing-title-audit.md", lines.join("\n")));
console.log(`Affected products: ${products.size}`);
console.log(`Affected rows: ${rows.length}`);
console.log("Wrote artifacts/engine6-itinerary-missing-title-audit.md");
