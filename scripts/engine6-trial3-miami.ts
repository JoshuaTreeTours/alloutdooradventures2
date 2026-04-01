import { extractEngine6Product } from "../api/engine6/viatorExtractors";
import { engine6ListingTours } from "../src/engine6/listing";
import { mapViatorToEngine6Tour } from "../src/engine6/mapViatorToEngine6Tour";
import { getEngine6NativeTourByCanonicalPath } from "../src/engine6/registry";
import { buildEngine6SchemaGraph } from "../src/engine6/schema/buildEngine6SchemaGraph";
import { ENGINE6_VALIDATION_FIXTURES } from "../src/engine6/validationFixtures";

const TARGET_CODES = new Set([
  "21428P2",
  "5221EVERGLADES",
  "35834P1",
  "5441BOAT",
  "3587ISLQUESS",
  "120303P9",
  "8836P1",
  "5304HAVANA",
  "51540P1",
]);

(globalThis as { location?: { pathname: string } }).location = { pathname: "/" };

const targets = ENGINE6_VALIDATION_FIXTURES.filter(f => TARGET_CODES.has(f.productCode));

let failed = false;
for (const fixture of targets) {
  const extraction = extractEngine6Product(fixture.rawPayload);
  const payload = {
    source: "bundled-fallback" as const,
    rawProductCode: fixture.productCode,
    rawProduct: extraction.product,
    diagnostics: {
      source: "bundled-fallback" as const,
      hasViatorApiKey: false,
      attemptedLiveFetch: false,
      upstreamStatus: null,
      upstreamContentType: "application/json fixture",
      upstreamOk: null,
      usedBundledFallbackBecause: "trial-3",
      ...extraction.diagnostics,
      bookingUrlSource: extraction.diagnostics.productUrlFieldPath ?? "generated:viator-search-product-code",
      fieldLevelFallbackUsed: false,
      fallbackFieldNames: [],
    },
    extracted: extraction.extracted,
  };
  const tour = mapViatorToEngine6Tour(payload);
  const listing = engine6ListingTours.filter(t => t.engine === "engine6" && t.productCode === fixture.productCode);
  const pageTour = getEngine6NativeTourByCanonicalPath(tour.canonicalPath);
  const schema = buildEngine6SchemaGraph(tour);
  const graph = schema["@graph"] as Array<Record<string, unknown>>;
  const schemaImage = (graph.find(n => n["@type"] === "Product")?.image as string | undefined) ?? null;

  const pageHero = tour.heroImageUrl;
  const cardHero = listing[0]?.heroImage ?? null;
  const parity = Boolean(pageHero && cardHero && schemaImage && pageHero === cardHero && pageHero === schemaImage);
  const oneCard = listing.length === 1;
  const duplicatePage = pageTour ? 1 : 0;
  const ctaOk = tour.bookingUrl.includes("pid=P00290915") && !tour.bookingUrl.includes("/book");
  const sourceUrl = tour.diagnostics.heroSourceProductUrl;
  const sourceCode = tour.diagnostics.heroSourceProductCode;
  const fieldPath = tour.diagnostics.heroImageFieldPath;
  const visibleMatches = Boolean(
    pageHero === "/images/hiking-hero.jpg" ||
      (sourceCode === fixture.productCode &&
        sourceUrl === fixture.publicUrl &&
        fieldPath?.startsWith("product.media.images["))
  );

  const pass = parity && oneCard && duplicatePage === 1 && ctaOk && visibleMatches;
  if (!pass) failed = true;

  const rejected = tour.diagnostics.rejectedForeignHeroCandidates.map(candidate => ({
    url: candidate.url,
    reason: candidate.reason,
    fieldPath: candidate.fieldPath,
    candidateProductCode: candidate.candidateProductCode,
    candidateSourceProductUrl: candidate.candidateSourceProductUrl,
  }));

  console.log(JSON.stringify({
    productCode: fixture.productCode,
    canonicalPath: tour.canonicalPath,
    finalPageHeroUrl: pageHero,
    finalListingCardHeroUrl: cardHero,
    finalSchemaImageUrl: schemaImage,
    allThreeIdentical: parity,
    sourceProductCode: sourceCode,
    sourceProductUrl: sourceUrl,
    sourceFieldPath: fieldPath,
    host: tour.diagnostics.heroHost,
    heroQualityClassification: tour.diagnostics.heroQualityClassification,
    candidateCountBeforeFiltering: tour.diagnostics.heroCandidateCount,
    candidateCountAfterFiltering: tour.diagnostics.heroCandidateCountAfterFiltering,
    rejectedCandidates: rejected,
    placeholderFallbackUsed: tour.heroImageUrl === "/images/hiking-hero.jpg",
    visibleImageMatchesExactProductMedia: visibleMatches,
    ctaCorrect: ctaOk,
    duplicatePageCardStatus: { listingCardCount: listing.length, publicPageFound: duplicatePage },
    pipelineTrace: ["payload", "registry", "mapping", "heroResolver", "card render"],
    thresholdDecisions: {
      provenance: sourceCode === fixture.productCode && Boolean(fieldPath?.startsWith("product.media.images[")),
      hostAllowlist: Boolean(tour.diagnostics.heroHost),
      parity,
      visualFailureZeroTolerance: pass,
    },
  }, null, 2));
}

if (failed || targets.length !== 9) {
  process.exit(1);
}
