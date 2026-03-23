import { extractEngine6Product } from "./viatorExtractors.js";

const normalizeProductCode = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0
    ? value.trim().toUpperCase()
    : null;

const readScopedHeroIdentity = (
  extraction?: ReturnType<typeof extractEngine6Product> | null
) => {
  const product = extraction?.product;
  const productRecord =
    product && typeof product === "object" && !Array.isArray(product)
      ? (product as Record<string, unknown>)
      : null;

  return {
    productCode:
      normalizeProductCode(productRecord?.productCode) ??
      normalizeProductCode(
        extraction?.extracted.productUrl?.match(/-([A-Z0-9]+)$/i)?.[1]
      ),
    productUrl: extraction?.extracted.productUrl ?? null,
    heroImageUrl: extraction?.extracted.heroImageUrl ?? null,
    imageSourceUsed: extraction?.diagnostics.imageSourceUsed ?? null,
  };
};

export const resolveScopedEngine6Hero = (args: {
  productCode: string;
  baseExtraction: ReturnType<typeof extractEngine6Product>;
  preferredHeroExtraction?: ReturnType<typeof extractEngine6Product> | null;
  fallbackHeroExtraction?: ReturnType<typeof extractEngine6Product> | null;
}) => {
  const getPriority = (source: string | null | undefined) => {
    switch (source) {
      case "viator-api-primary":
        return 4;
      case "viator-api-gallery":
        return 3;
      case "trusted-scraped-page-hero":
        return 2;
      case "fallback-image":
        return 1;
      default:
        return 0;
    }
  };
  const getArea = (
    extraction?: ReturnType<typeof extractEngine6Product> | null
  ) =>
    (extraction?.diagnostics.selectedHeroWidth ?? 0) *
    (extraction?.diagnostics.selectedHeroHeight ?? 0);
  const expectedProductCode = normalizeProductCode(args.productCode);
  const rejectedForeignHeroCandidates: Array<{
    productCode: string | null;
    productUrl: string | null;
    heroImageUrl: string | null;
    imageSourceUsed: string | null;
    reason: string;
  }> = [];
  const eligibleExtractions = [
    args.preferredHeroExtraction,
    args.fallbackHeroExtraction,
    args.baseExtraction,
  ].filter(
    (extraction): extraction is ReturnType<typeof extractEngine6Product> =>
      Boolean(extraction?.extracted.heroImageUrl)
  );
  const scopedExtractions = eligibleExtractions.filter(extraction => {
    const identity = readScopedHeroIdentity(extraction);

    if (!identity.productCode || identity.productCode === expectedProductCode) {
      return true;
    }

    rejectedForeignHeroCandidates.push({
      ...identity,
      reason: `hero candidate product ${identity.productCode} does not match requested product ${expectedProductCode}`,
    });
    return false;
  });
  const heroSource =
    scopedExtractions.sort((left, right) => {
      const bySource =
        getPriority(right.diagnostics.imageSourceUsed) -
        getPriority(left.diagnostics.imageSourceUsed);
      if (bySource !== 0) {
        return bySource;
      }

      return getArea(right) - getArea(left);
    })[0] ?? args.baseExtraction;
  const winnerIdentity = readScopedHeroIdentity(heroSource);

  return {
    extracted: {
      ...args.baseExtraction.extracted,
      heroImageUrl: heroSource.extracted.heroImageUrl,
      cardImageUrl:
        heroSource.extracted.cardImageUrl ?? heroSource.extracted.heroImageUrl,
    },
    diagnostics: {
      ...args.baseExtraction.diagnostics,
      heroImageFieldPath: heroSource.diagnostics.heroImageFieldPath,
      heroVariantFieldPath: heroSource.diagnostics.heroVariantFieldPath,
      selectedHeroWidth: heroSource.diagnostics.selectedHeroWidth,
      selectedHeroHeight: heroSource.diagnostics.selectedHeroHeight,
      imageSourceUsed: heroSource.diagnostics.imageSourceUsed,
      heroResolverName: heroSource.diagnostics.heroResolverName,
      apiPrimaryImageCandidate: heroSource.diagnostics.apiPrimaryImageCandidate,
      apiGalleryImageCandidates:
        heroSource.diagnostics.apiGalleryImageCandidates,
      scrapedImageCandidates: heroSource.diagnostics.scrapedImageCandidates,
      fallbackImageCandidates: heroSource.diagnostics.fallbackImageCandidates,
      finalSelectedHero: heroSource.diagnostics.finalSelectedHero,
      heroScopedProductCode: expectedProductCode,
      heroScopedProductUrl:
        winnerIdentity.productUrl ??
        args.baseExtraction.extracted.productUrl ??
        null,
      sourceProductUrl:
        winnerIdentity.productUrl ??
        args.baseExtraction.extracted.productUrl ??
        null,
      heroScopeConfirmed: winnerIdentity.productCode === expectedProductCode,
      rejectedForeignHeroCandidates,
    },
  };
};
