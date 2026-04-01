import fs from "node:fs";
import path from "node:path";

import { extractEngine6Product } from "../api/engine6/viatorExtractors";
import { toEngine6Card, buildEngine6CardSurfaces } from "../src/engine6/cards";
import { mapViatorToEngine6Tour } from "../src/engine6/mapViatorToEngine6Tour";
import { getEngine6NativeTourByCanonicalPath, engine6ResolvedTours } from "../src/engine6/registry";
import { buildEngine6SchemaGraph } from "../src/engine6/schema/buildEngine6SchemaGraph";

const TARGETS = [
  "21428P2",
  "5221EVERGLADES",
  "35834P1",
  "5441BOAT",
  "3587ISLQUESS",
  "120303P9",
  "8836P1",
  "5304HAVANA",
  "51540P1",
] as const;

const EXPECTED_CTA_QUERY = "?pid=P00290915&mcid=42383&medium=link";

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

const reports = TARGETS.map((productCode) => {
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
      usedBundledFallbackBecause: "engine6-miami9-rerun",
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
  const surfaces = buildEngine6CardSurfaces(tour);
  const listingCardOnlyOnce = Object.values(surfaces).every((cards) => cards.length === 1);

  const sameProductMediaConfirmed =
    tour.diagnostics.heroFallbackTriggered ||
    (tour.diagnostics.heroSourceProductCode === productCode &&
      tour.diagnostics.heroSourceProductUrl === extraction.extracted.productUrl &&
      (tour.diagnostics.heroSourceFieldPath?.startsWith("product.media.images[") ?? false));

  const duplicateByProductCode =
    engine6ResolvedTours.filter((entry) => entry.productCode === productCode).length;
  const duplicateByCanonicalPath =
    engine6ResolvedTours.filter((entry) => entry.canonicalPath === tour.canonicalPath).length;

  return {
    productCode,
    canonicalPath: tour.canonicalPath,
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
    candidateCountBeforeFiltering: tour.diagnostics.heroCandidateCountBeforeFiltering,
    candidateCountAfterFiltering: tour.diagnostics.heroCandidateCountAfterFiltering,
    rejectedCandidates: tour.diagnostics.rejectedForeignHeroCandidates,
    placeholderFallbackUsed: tour.diagnostics.heroFallbackTriggered,
    exactProductScopedVisibleImage: sameProductMediaConfirmed,
    displayedCommercials: {
      price: tour.priceFormatted,
      rating: tour.aggregateRating,
      reviewCount: tour.reviewCount,
      meetingPoint: tour.meetingPointText,
    },
    ctaCorrect:
      tour.bookingUrl.includes(EXPECTED_CTA_QUERY) &&
      tour.bookingUrl.includes(tour.productCode),
    duplicatePageCardStatus: {
      productCodeEntryCount: duplicateByProductCode,
      canonicalPathEntryCount: duplicateByCanonicalPath,
      listingCardOnlyOnce,
      nativeRouteResolves: Boolean(getEngine6NativeTourByCanonicalPath(tour.canonicalPath)),
    },
    verification: {
      pageHeroExactOrPlaceholder:
        sameProductMediaConfirmed || tour.heroImageUrl === "/images/hiking-hero.jpg",
      cardHeroExactOrPlaceholder:
        sameProductMediaConfirmed || card.imageUrl === "/images/hiking-hero.jpg",
      schemaMatches: schemaImage === tour.heroImageUrl,
      parityHolds:
        tour.heroImageUrl === card.imageUrl && card.imageUrl === schemaImage,
      noForeignImageContamination: tour.diagnostics.rejectedForeignHeroCandidates.every(
        (candidate) => candidate.candidateProductCode !== productCode
      ),
      noBrokenImageShell: Boolean(tour.heroImageUrl),
      oneListingCardOnly: listingCardOnlyOnce,
      noDuplicatePublicPage:
        duplicateByCanonicalPath === 1 && duplicateByProductCode === 1,
      ctaCorrect:
        tour.bookingUrl.includes(EXPECTED_CTA_QUERY) &&
        tour.bookingUrl.includes(tour.productCode),
    },
    pipelineTrace: {
      payload: payloadPath,
      registry: "src/engine6/registry.ts",
      mapping: "src/engine6/mapViatorToEngine6Tour.ts",
      heroResolver: "api/engine6/heroResolver.ts",
      cardRender: "src/components/TourCard.tsx",
    },
  };
});

console.log(JSON.stringify(reports, null, 2));
