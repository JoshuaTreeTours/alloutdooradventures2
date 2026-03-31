export const ENGINE6_APPROVED_PLACEHOLDER_IMAGE = "/images/hiking-hero.jpg";

export type Engine6HeroSourceType =
  | "api-primary"
  | "api-gallery"
  | "approved-placeholder";

export type Engine6HeroQualityClassification =
  | "caption"
  | "product-media"
  | "splice"
  | "placeholder";

export type Engine6HeroCandidate = {
  url: string;
  sourceType: Engine6HeroSourceType;
  candidateProductCode?: string | null;
  candidateSourceProductUrl?: string | null;
  fieldPath?: string | null;
  variantPath?: string | null;
  width?: number | null;
  height?: number | null;
};

export type Engine6RejectedHeroCandidate = {
  url: string;
  sourceType: Engine6HeroSourceType;
  reason:
    | "foreign-product-code"
    | "foreign-product-url"
    | "missing-product-scope"
    | "unverified-product-scope"
    | "invalid-url"
    | "static-hero-disallowed"
    | "untrusted-media-host";
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
};

const getEffectiveWidth = (candidate: Engine6HeroCandidate) => {
  if (typeof candidate.width === "number" && Number.isFinite(candidate.width)) {
    return candidate.width;
  }

  const match = candidate.url.match(/(\d{2,5})x(\d{2,5})/);
  if (!match) {
    return 0;
  }

  const width = Number(match[1]);
  return Number.isFinite(width) ? width : 0;
};

const getEffectiveHeight = (candidate: Engine6HeroCandidate) => {
  if (typeof candidate.height === "number" && Number.isFinite(candidate.height)) {
    return candidate.height;
  }

  const match = candidate.url.match(/(\d{2,5})x(\d{2,5})/);
  if (!match) {
    return 0;
  }

  const height = Number(match[2]);
  return Number.isFinite(height) ? height : 0;
};

const normalizeHeroMediaUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    const isTacdnOrTripadvisorHost =
      host.endsWith(".tacdn.com") ||
      host.endsWith(".tripadvisor.com") ||
      host === "tacdn.com" ||
      host === "tripadvisor.com";

    if (isTacdnOrTripadvisorHost) {
      parsed.pathname = parsed.pathname
        .replace(/\/photo-s\//i, "/photo-o/")
        .replace(/\/+$/, "");
      parsed.hash = "";
    }

    return parsed.toString();
  } catch {
    return value;
  }
};

const isCaptionHeroUrl = (value: string) => /\/caption\.jpg(?:$|[?#])/i.test(value);

const isSpliceHeroUrl = (value: string) =>
  /\/attractions-splice-spp-(?:\d+x\d+)\//i.test(value);

const getHeroQualityClassification = (
  candidate: Pick<Engine6HeroCandidate, "sourceType" | "url">
): Engine6HeroQualityClassification => {
  if (candidate.sourceType === "approved-placeholder") {
    return "placeholder";
  }
  if (isCaptionHeroUrl(candidate.url)) {
    return "caption";
  }
  if (isSpliceHeroUrl(candidate.url)) {
    return "splice";
  }
  return "product-media";
};

const getQualityRank = (candidate: Engine6HeroCandidate) => {
  const quality = getHeroQualityClassification(candidate);
  if (quality === "caption") return 0;
  if (quality === "product-media") return 1;
  if (quality === "splice") return 2;
  return 3;
};

const rankHeroCandidates = (candidates: Engine6HeroCandidate[]) =>
  [...candidates].sort((a, b) => {
    const aQualityRank = getQualityRank(a);
    const bQualityRank = getQualityRank(b);
    const aWidth = getEffectiveWidth(a);
    const bWidth = getEffectiveWidth(b);
    const aHeight = getEffectiveHeight(a);
    const bHeight = getEffectiveHeight(b);
    const aArea = aWidth * aHeight;
    const bArea = bWidth * bHeight;
    const aPreferredWidthBucket = aWidth >= 1000 ? 2 : aWidth >= 800 ? 1 : 0;
    const bPreferredWidthBucket = bWidth >= 1000 ? 2 : bWidth >= 800 ? 1 : 0;
    if (aQualityRank !== bQualityRank) {
      return aQualityRank - bQualityRank;
    }

    if (bPreferredWidthBucket !== aPreferredWidthBucket) {
      return bPreferredWidthBucket - aPreferredWidthBucket;
    }
    if (bWidth !== aWidth) {
      return bWidth - aWidth;
    }
    if (bArea !== aArea) {
      return bArea - aArea;
    }
    return bHeight - aHeight;
  });

const normalizeProductCode = (value: string | null | undefined) => {
  const normalized = value?.trim().toUpperCase() ?? "";
  return normalized.length > 0 ? normalized : null;
};

export const normalizeEngine6SourceProductUrl = (
  value: string | null | undefined
) => {
  const normalized = value?.trim();
  if (!normalized) {
    return null;
  }

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

const isStaticHeroDisallowed = (value: string) => /(^|\/)hero\.jpg(?:$|[?#])/i.test(value);

const isValidHttpImageUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const isTrustedViatorMediaHost = (value: string) => {
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
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
  candidateProductCode: normalizeProductCode(candidate.candidateProductCode),
  candidateSourceProductUrl: normalizeEngine6SourceProductUrl(
    candidate.candidateSourceProductUrl
  ),
  fieldPath: candidate.fieldPath ?? null,
});

export const resolveProductScopedHero = ({
  currentProductCode,
  currentSourceProductUrl,
  candidates,
}: {
  currentProductCode?: string | null;
  currentSourceProductUrl?: string | null;
  candidates: Engine6HeroCandidate[];
}): Engine6ResolvedHero => {
  const normalizedCurrentProductCode = normalizeProductCode(currentProductCode);
  const normalizedCurrentSourceProductUrl = normalizeEngine6SourceProductUrl(
    currentSourceProductUrl
  );
  const rejectedForeignCandidates: Engine6RejectedHeroCandidate[] = [];
  const validCandidates: Engine6HeroCandidate[] = [];

  for (const candidate of candidates) {
    if (!candidate?.url) {
      continue;
    }

    if (candidate.sourceType === "approved-placeholder") {
      continue;
    }

    if (!isValidHttpImageUrl(candidate.url)) {
      rejectedForeignCandidates.push(
        toRejectedCandidate(candidate, "invalid-url")
      );
      continue;
    }

    if (isStaticHeroDisallowed(candidate.url)) {
      rejectedForeignCandidates.push(
        toRejectedCandidate(candidate, "static-hero-disallowed")
      );
      continue;
    }
    const candidateProductCode = normalizeProductCode(
      candidate.candidateProductCode
    );
    const candidateSourceProductUrl = normalizeEngine6SourceProductUrl(
      candidate.candidateSourceProductUrl
    );

    if (!candidateProductCode && !candidateSourceProductUrl) {
      rejectedForeignCandidates.push(
        toRejectedCandidate(candidate, "missing-product-scope")
      );
      continue;
    }

    if (
      normalizedCurrentProductCode &&
      candidateProductCode &&
      normalizedCurrentProductCode !== candidateProductCode
    ) {
      rejectedForeignCandidates.push(
        toRejectedCandidate(candidate, "foreign-product-code")
      );
      continue;
    }

    if (
      normalizedCurrentSourceProductUrl &&
      candidateSourceProductUrl &&
      normalizedCurrentSourceProductUrl !== candidateSourceProductUrl
    ) {
      rejectedForeignCandidates.push(
        toRejectedCandidate(candidate, "foreign-product-url")
      );
      continue;
    }

    const verifiedByProductCode =
      normalizedCurrentProductCode &&
      candidateProductCode &&
      normalizedCurrentProductCode === candidateProductCode;
    const verifiedByProductUrl =
      normalizedCurrentSourceProductUrl &&
      candidateSourceProductUrl &&
      normalizedCurrentSourceProductUrl === candidateSourceProductUrl;

    if (!verifiedByProductCode && !verifiedByProductUrl) {
      rejectedForeignCandidates.push(
        toRejectedCandidate(candidate, "unverified-product-scope")
      );
      continue;
    }
    if (!isTrustedViatorMediaHost(candidate.url)) {
      rejectedForeignCandidates.push(
        toRejectedCandidate(candidate, "untrusted-media-host")
      );
      continue;
    }

    validCandidates.push({
      ...candidate,
      candidateProductCode,
      candidateSourceProductUrl,
    });
  }

  if (validCandidates.length > 0) {
    const selectedCandidate = rankHeroCandidates(validCandidates)[0]!;
    const normalizedUrl = normalizeHeroMediaUrl(selectedCandidate.url);

    return {
      heroUrl: normalizedUrl,
      heroSourceType: selectedCandidate.sourceType,
      heroQualityClassification: getHeroQualityClassification(selectedCandidate),
      fallbackTriggered: false,
      finalCandidate: {
        ...selectedCandidate,
        url: normalizedUrl,
        width: selectedCandidate.width ?? getEffectiveWidth(selectedCandidate),
        height: selectedCandidate.height ?? getEffectiveHeight(selectedCandidate),
      },
      rejectedForeignCandidates,
    };
  }

  return {
    heroUrl: null,
    heroSourceType: "approved-placeholder",
    heroQualityClassification: "placeholder",
    fallbackTriggered: true,
    finalCandidate: null,
    rejectedForeignCandidates,
  };
};
