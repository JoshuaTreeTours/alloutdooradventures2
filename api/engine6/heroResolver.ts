export type Engine6HeroSourceType = "api-primary" | "api-gallery" | "none";

export type Engine6HeroQualityClassification =
  | "caption"
  | "product-media"
  | "splice"
  | "none";

export type Engine6HeroCandidate = {
  url: string;
  sourceType: Engine6HeroSourceType;
  sourceProductCode?: string | null;
  sourceProductUrl?: string | null;
  sourceFieldPath?: string | null;
  host?: string | null;
  qualityClassification?: Engine6HeroQualityClassification | null;
  candidateProductCode?: string | null;
  candidateSourceProductUrl?: string | null;
  fieldPath?: string | null;
  variantPath?: string | null;
  width?: number | null;
  height?: number | null;
  isLive?: boolean;
};

export type Engine6RejectedHeroCandidate = {
  url: string;
  sourceType: Engine6HeroSourceType;
  reason:
    | "foreign-product-code"
    | "foreign-product-url"
    | "missing-product-scope"
    | "missing-source-field-path"
    | "non-product-source"
    | "invalid-url"
    | "untrusted-media-host"
    | "not-live";
  candidateProductCode: string | null;
  candidateSourceProductUrl: string | null;
  fieldPath: string | null;
};

export type Engine6ResolvedHero = {
  heroUrl: string | null;
  heroSourceType: Engine6HeroSourceType;
  heroQualityClassification: Engine6HeroQualityClassification;
  fallbackTriggered: boolean;
  finalCandidate: Engine6HeroCandidate | null;
  rejectedForeignCandidates: Engine6RejectedHeroCandidate[];
  captionPrecedenceApplied: boolean;
  candidateFamilyIdentityDeterminable: boolean;
};

const normalizeProductCode = (value: string | null | undefined) => {
  const normalized = value?.trim().toUpperCase() ?? "";
  return normalized || null;
};

export const normalizeEngine6SourceProductUrl = (value: string | null | undefined) => {
  const normalized = value?.trim();
  if (!normalized) return null;
  try {
    const parsed = new URL(normalized);
    parsed.hash = "";
    parsed.search = "";
    parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
    return parsed.toString();
  } catch {
    return null;
  }
};

const getHeroQualityClassification = (url: string): Engine6HeroQualityClassification => {
  if (/\/caption\.jpg(?:$|[?#])/i.test(url)) return "caption";
  if (/\/attractions-splice-spp-(?:\d+x\d+)\//i.test(url)) return "splice";
  return "product-media";
};

const isTrustedViatorMediaHost = (value: string) => {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return (
      host === "cdn.filestackcontent.com" ||
      host === "www.filepicker.io" ||
      host === "dynamic-media.tacdn.com" ||
      host === "media.tacdn.com" ||
      host === "media-cdn.tripadvisor.com" ||
      host === "dynamic-media-cdn.tripadvisor.com" ||
      (host.includes("media") && host.endsWith(".tacdn.com")) ||
      (host.includes("media") && host.endsWith(".tripadvisor.com"))
    );
  } catch {
    return false;
  }
};

const toRejectedCandidate = (
  candidate: Engine6HeroCandidate,
  reason: Engine6RejectedHeroCandidate["reason"]
): Engine6RejectedHeroCandidate => ({
  url: candidate.url,
  sourceType: candidate.sourceType,
  reason,
  candidateProductCode: normalizeProductCode(candidate.sourceProductCode),
  candidateSourceProductUrl: normalizeEngine6SourceProductUrl(candidate.sourceProductUrl),
  fieldPath: candidate.sourceFieldPath ?? candidate.fieldPath ?? null,
});

const precedenceRank = (quality: Engine6HeroQualityClassification) => {
  if (quality === "caption") return 0;
  if (quality === "product-media") return 1;
  return 2;
};

export const resolveProductScopedHero = ({
  currentProductCode,
  currentSourceProductUrl,
  candidates,
}: {
  currentProductCode?: string | null;
  currentSourceProductUrl?: string | null;
  candidates: Engine6HeroCandidate[];
}): Engine6ResolvedHero => {
  const currentCode = normalizeProductCode(currentProductCode);
  const currentUrl = normalizeEngine6SourceProductUrl(currentSourceProductUrl);
  const rejectedForeignCandidates: Engine6RejectedHeroCandidate[] = [];
  const eligible: Engine6HeroCandidate[] = [];

  for (const candidate of candidates) {
    if (!candidate?.url || !/^https?:\/\//i.test(candidate.url)) {
      rejectedForeignCandidates.push(toRejectedCandidate(candidate, "invalid-url"));
      continue;
    }
    const sourceCode = normalizeProductCode(candidate.sourceProductCode);
    const sourceUrl = normalizeEngine6SourceProductUrl(candidate.sourceProductUrl);
    const sourceFieldPath = candidate.sourceFieldPath ?? candidate.fieldPath ?? null;

    if (!sourceCode || !sourceUrl) {
      rejectedForeignCandidates.push(toRejectedCandidate(candidate, "missing-product-scope"));
      continue;
    }
    if (sourceCode !== currentCode) {
      rejectedForeignCandidates.push(toRejectedCandidate(candidate, "foreign-product-code"));
      continue;
    }
    if (sourceUrl !== currentUrl) {
      rejectedForeignCandidates.push(toRejectedCandidate(candidate, "foreign-product-url"));
      continue;
    }
    if (!sourceFieldPath) {
      rejectedForeignCandidates.push(toRejectedCandidate(candidate, "missing-source-field-path"));
      continue;
    }
    if (!sourceFieldPath.startsWith("product.media.images")) {
      rejectedForeignCandidates.push(toRejectedCandidate(candidate, "non-product-source"));
      continue;
    }
    if (!isTrustedViatorMediaHost(candidate.url)) {
      rejectedForeignCandidates.push(toRejectedCandidate(candidate, "untrusted-media-host"));
      continue;
    }
    if (candidate.isLive !== true) {
      rejectedForeignCandidates.push(toRejectedCandidate(candidate, "not-live"));
      continue;
    }

    const quality = candidate.qualityClassification ?? getHeroQualityClassification(candidate.url);
    eligible.push({
      ...candidate,
      sourceProductCode: sourceCode,
      sourceProductUrl: sourceUrl,
      sourceFieldPath,
      host: candidate.host ?? new URL(candidate.url).hostname.toLowerCase(),
      qualityClassification: quality,
      fieldPath: sourceFieldPath,
    });
  }

  const winner = [...eligible].sort(
    (a, b) => precedenceRank(a.qualityClassification!) - precedenceRank(b.qualityClassification!)
  )[0];

  if (!winner) {
    return {
      heroUrl: null,
      heroSourceType: "none",
      heroQualityClassification: "none",
      fallbackTriggered: true,
      finalCandidate: null,
      rejectedForeignCandidates,
      captionPrecedenceApplied: false,
      candidateFamilyIdentityDeterminable: false,
    };
  }

  return {
    heroUrl: winner.url,
    heroSourceType: winner.sourceType,
    heroQualityClassification: winner.qualityClassification!,
    fallbackTriggered: false,
    finalCandidate: winner,
    rejectedForeignCandidates,
    captionPrecedenceApplied: winner.qualityClassification === "caption",
    candidateFamilyIdentityDeterminable: false,
  };
};
