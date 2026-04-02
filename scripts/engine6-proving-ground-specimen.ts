import fs from "node:fs";
import path from "node:path";

import { extractEngine6Product } from "../api/engine6/viatorExtractors";
import { toEngine6Card } from "../src/engine6/cards";
import { mapViatorToEngine6Tour } from "../src/engine6/mapViatorToEngine6Tour";
import { buildEngine6SchemaGraph } from "../src/engine6/schema/buildEngine6SchemaGraph";

const PRODUCT_CODE = "3587ISLQUESS";
const payloadPath = path.join(
  process.cwd(),
  "data",
  "engine6",
  "viator",
  `${PRODUCT_CODE}.exact-product.json`
);

const getSchemaImage = (schema: ReturnType<typeof buildEngine6SchemaGraph>) => {
  const graph = Array.isArray(schema["@graph"]) ? schema["@graph"] : [];
  const product = graph.find(node => node?.["@type"] === "Product") as
    | { image?: string }
    | undefined;
  return product?.image ?? null;
};

const rawPayload = JSON.parse(fs.readFileSync(payloadPath, "utf8"));
const extraction = extractEngine6Product(rawPayload);

const envelope = {
  source: "bundled-fallback" as const,
  rawProductCode: PRODUCT_CODE,
  rawProduct: extraction.product,
  diagnostics: {
    source: "bundled-fallback" as const,
    hasViatorApiKey: false,
    attemptedLiveFetch: false,
    upstreamStatus: null,
    upstreamContentType: "application/json fixture",
    upstreamOk: null,
    usedBundledFallbackBecause: "engine6-proving-ground",
    ...extraction.diagnostics,
    bookingUrlSource:
      extraction.diagnostics.productUrlFieldPath ??
      "generated:viator-search-product-code",
    fieldLevelFallbackUsed: false,
    fallbackFieldNames: [] as string[],
  },
  extracted: extraction.extracted,
};

let canonicalRoute: string | null = null;
let finalPageHeroUrl: string | null = null;
let finalCardHeroUrl: string | null = null;
let finalSchemaImageUrl: string | null = null;
let allThreeIdentical = false;
let validationPassed = false;
let failureReason: string | null = null;

try {
  const tour = mapViatorToEngine6Tour(envelope);
  const card = toEngine6Card(tour);
  const schema = buildEngine6SchemaGraph(tour);

  canonicalRoute = tour.canonicalPath;
  finalPageHeroUrl = tour.resolvedHero?.url ?? null;
  finalCardHeroUrl = card.imageUrl || null;
  finalSchemaImageUrl = getSchemaImage(schema);
  allThreeIdentical =
    Boolean(finalPageHeroUrl) &&
    finalPageHeroUrl === finalCardHeroUrl &&
    finalPageHeroUrl === finalSchemaImageUrl;
  validationPassed = Boolean(allThreeIdentical);
} catch (error) {
  failureReason = error instanceof Error ? error.message : String(error);
}

const report = {
  productCode: PRODUCT_CODE,
  validationPassed,
  failureReason,
  canonicalRoute,
  finalPageHeroUrl,
  finalCardHeroUrl,
  finalSchemaImageUrl,
  allThreeIdentical,
  sourceProductCode: extraction.diagnostics.heroSourceProductCode,
  sourceProductUrl: extraction.diagnostics.heroSourceProductUrl,
  sourceFieldPath: extraction.diagnostics.heroSourceFieldPath,
  host: extraction.diagnostics.heroHost,
  heroQualityClassification: extraction.diagnostics.heroQualityClassification,
  candidateCountBeforeFiltering:
    extraction.diagnostics.heroCandidateCountBeforeFiltering,
  candidateCountAfterFiltering:
    extraction.diagnostics.heroCandidateCountAfterFiltering,
  rejectedCandidates: extraction.diagnostics.rejectedForeignHeroCandidates,
  noDefaultHeroPathUsed:
    !(extraction.extracted.heroImageUrl ?? "").includes("/hero.jpg") &&
    !(extraction.extracted.heroImageUrl ?? "").includes(
      "/images/hiking-hero.jpg"
    ) &&
    !(extraction.extracted.heroImageUrl ?? "").includes(
      "/images/cycling-hero.jpg"
    ),
  noForeignImagePathUsed:
    extraction.diagnostics.heroSourceProductCode === PRODUCT_CODE ||
    extraction.diagnostics.heroSourceProductCode === null,
  directMonetizedViatorCta: extraction.extracted.productUrl,
};

console.log(JSON.stringify(report, null, 2));
