import fs from "node:fs";
import path from "node:path";

import { extractEngine6Product } from "../api/engine6/viatorExtractors";
import { toEngine6Card } from "../src/engine6/cards";
import { mapViatorToEngine6Tour } from "../src/engine6/mapViatorToEngine6Tour";
import { buildEngine6SchemaGraph } from "../src/engine6/schema/buildEngine6SchemaGraph";

const TARGETS = ["35834P1", "120303P9", "5304HAVANA"] as const;

const getSchemaImage = (schema: ReturnType<typeof buildEngine6SchemaGraph>) => {
  const graph = Array.isArray(schema["@graph"]) ? schema["@graph"] : [];
  for (const node of graph) {
    if (node && typeof node === "object" && "@type" in node) {
      const typedNode = node as Record<string, unknown>;
      if (typedNode["@type"] === "Product" && typeof typedNode.image === "string") {
        return typedNode.image;
      }
    }
  }
  return null;
};

for (const productCode of TARGETS) {
  const payloadPath = path.join(
    process.cwd(),
    "data",
    "engine6",
    "viator",
    `${productCode}.exact-product.json`
  );
  const rawPayload = JSON.parse(fs.readFileSync(payloadPath, "utf8"));
  const extraction = extractEngine6Product(rawPayload);
  const envelope = {
    source: "bundled-fallback" as const,
    rawProductCode: productCode,
    rawProduct: extraction.product,
    diagnostics: {
      source: "bundled-fallback" as const,
      hasViatorApiKey: false,
      attemptedLiveFetch: false,
      upstreamStatus: null,
      upstreamContentType: "application/json fixture",
      upstreamOk: null,
      usedBundledFallbackBecause: "engine6-image-isolation",
      ...extraction.diagnostics,
      bookingUrlSource:
        extraction.diagnostics.productUrlFieldPath ??
        "generated:viator-search-product-code",
      fieldLevelFallbackUsed: false,
      fallbackFieldNames: [] as string[],
    },
    extracted: extraction.extracted,
  };
  const tour = mapViatorToEngine6Tour(envelope);
  const card = toEngine6Card(tour);
  const schema = buildEngine6SchemaGraph(tour);
  const schemaImage = getSchemaImage(schema);

  const report = {
    productCode,
    pipelineTrace: {
      payload: payloadPath,
      registry: "n/a for isolation script (direct fixture)",
      mapping: "src/engine6/mapViatorToEngine6Tour.ts",
      heroResolver: "api/engine6/heroResolver.ts",
      cardRender: "src/components/TourCard.tsx (uses mapped hero only)",
    },
    finalPageHeroUrl: tour.heroImageUrl,
    finalCardHeroUrl: card.imageUrl,
    finalSchemaImageUrl: schemaImage,
    allThreeIdentical:
      Boolean(tour.heroImageUrl) &&
      tour.heroImageUrl === card.imageUrl &&
      tour.heroImageUrl === schemaImage,
    sourceProductCode: tour.diagnostics.heroSourceProductCode,
    sourceProductUrl: tour.diagnostics.heroSourceProductUrl,
    sourceFieldPath: tour.diagnostics.heroSourceFieldPath,
    host: tour.diagnostics.heroHost,
    heroQualityClassification: tour.diagnostics.heroQualityClassification,
    candidateCountBeforeFiltering:
      tour.diagnostics.heroCandidateCountBeforeFiltering,
    candidateCountAfterFiltering: tour.diagnostics.heroCandidateCountAfterFiltering,
    rejectedCandidates: tour.diagnostics.rejectedForeignHeroCandidates,
    placeholderFallbackUsed: tour.diagnostics.heroFallbackTriggered,
    exactProductScopedVisibleImage:
      tour.diagnostics.heroSourceProductCode === productCode &&
      tour.diagnostics.heroSourceProductUrl === extraction.extracted.productUrl &&
      (tour.diagnostics.heroSourceFieldPath?.startsWith("product.media.images[") ??
        false),
  };

  console.log(JSON.stringify(report, null, 2));
}
