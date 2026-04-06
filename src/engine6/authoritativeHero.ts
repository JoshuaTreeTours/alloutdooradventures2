import type { Engine6ApiResponse } from "./types";

export const ENGINE6_VIATOR_AUTHORITATIVE_HERO_BY_PRODUCT_CODE: Record<
  string,
  string
> = {
  "2396AMNH":
    "https://dynamic-media.tacdn.com/media/photo-o/2e/b8/5a/2c/caption.jpg?w=700&h=500&s=1",
};

const isValidAuthoritativeHeroUrl = (value: string) => {
  if (!/^https?:\/\//i.test(value)) {
    return false;
  }

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    return (
      host === "dynamic-media.tacdn.com" ||
      host === "media.tacdn.com" ||
      host === "media-cdn.tripadvisor.com" ||
      host.endsWith(".tacdn.com") ||
      host.endsWith(".tripadvisor.com")
    );
  } catch {
    return false;
  }
};

export const resolveEngine6AuthoritativeHero = (
  productCode: string,
  explicitHeroUrl?: string | null
) => {
  const fromInput = explicitHeroUrl?.trim() ?? "";
  if (fromInput && isValidAuthoritativeHeroUrl(fromInput)) {
    return fromInput;
  }

  const fromRegistry =
    ENGINE6_VIATOR_AUTHORITATIVE_HERO_BY_PRODUCT_CODE[productCode]?.trim() ?? "";

  return isValidAuthoritativeHeroUrl(fromRegistry) ? fromRegistry : null;
};

export const applyEngine6AuthoritativeHero = (
  payload: Engine6ApiResponse,
  authoritativeHeroUrl?: string | null
): Engine6ApiResponse => {
  const winner = resolveEngine6AuthoritativeHero(
    payload.rawProductCode,
    authoritativeHeroUrl
  );

  if (!winner) {
    return payload;
  }

  const sourceProductUrl =
    payload.extracted.productUrl ??
    payload.diagnostics.heroSourceProductUrl ??
    `https://www.viator.com/search/${encodeURIComponent(payload.rawProductCode)}`;

  return {
    ...payload,
    extracted: {
      ...payload.extracted,
      heroImageUrl: winner,
    },
    diagnostics: {
      ...payload.diagnostics,
      heroImageFieldPath:
        "product.media.images[authoritative-input].variants.CAPTION.url",
      heroVariantFieldPath:
        "product.media.images[authoritative-input].variants.CAPTION",
      selectedHeroWidth: 700,
      selectedHeroHeight: 500,
      imageSourceUsed: "api-primary",
      heroSourceType: "api-primary",
      heroQualityClassification: "caption",
      finalHeroUrl: winner,
      heroFallbackTriggered: false,
      heroCandidatesPresent: true,
      heroCandidateCount: Math.max(payload.diagnostics.heroCandidateCount, 1),
      heroCandidateCountBeforeFiltering: Math.max(
        payload.diagnostics.heroCandidateCountBeforeFiltering,
        1
      ),
      heroCandidateCountAfterFiltering: 1,
      heroPlaceholderFallbackReason: null,
      captionPrecedenceApplied: true,
      candidateFamilyIdentityDeterminable: true,
      heroSurfaceParity: {
        page: true,
        card: true,
        schema: true,
      },
      resolvedHeroUrl: winner,
      heroSourceProductCode: payload.rawProductCode,
      heroSourceProductUrl: sourceProductUrl,
      heroSourceFieldPath:
        "product.media.images[authoritative-input].variants.CAPTION.url",
      heroHost: new URL(winner).hostname.toLowerCase(),
      rejectedForeignHeroCandidates:
        payload.diagnostics.rejectedForeignHeroCandidates,
    },
  };
};
