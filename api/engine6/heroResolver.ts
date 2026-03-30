export type Engine6HeroSourceType =
  | "api-primary"
  | "api-gallery"
  | "none";

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
    | "static-hero-disallowed";
  candidateProductCode: string | null;
  candidateSourceProductUrl: string | null;
  fieldPath: string | null;
};

export type Engine6ResolvedHero = {
  heroUrl: string | null;
  heroSourceType: Engine6HeroSourceType;
  fallbackTriggered: boolean;
  finalCandidate: Engine6HeroCandidate | null;
  rejectedForeignCandidates: Engine6RejectedHeroCandidate[];
};

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
const isSpliceImageUrl = (value: string) =>
  /attractions-splice-spp/i.test(value);
const TRUSTED_VIATOR_IMAGE_HOSTS = [
  "dynamic-media.tacdn.com",
  "media.tacdn.com",
] as const;

const isTrustedViatorImageHost = (value: string) => {
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    return TRUSTED_VIATOR_IMAGE_HOSTS.some(
      trustedHost => host === trustedHost || host.endsWith(`.${trustedHost}`)
    );
  } catch {
    return false;
  }
};

const getHeroQualityRank = (value: string): number => {
  let parsed: URL | null = null;
  try {
    parsed = new URL(value);
  } catch {
    return 0;
  }

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.toLowerCase();
  const splice = isSpliceImageUrl(path) || isSpliceImageUrl(host);

  if (host === "dynamic-media.tacdn.com") {
    return 3;
  }

  if (host === "media.tacdn.com" && !splice) {
    return 2;
  }

  if (splice) {
    return 1;
  }

  return 0;
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

    if (isStaticHeroDisallowed(candidate.url)) {
      rejectedForeignCandidates.push(
        toRejectedCandidate(candidate, "static-hero-disallowed")
      );
      continue;
    }
    if (!isTrustedViatorImageHost(candidate.url)) {
      rejectedForeignCandidates.push(
        toRejectedCandidate(candidate, "unverified-product-scope")
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

    validCandidates.push({
      ...candidate,
      candidateProductCode,
      candidateSourceProductUrl,
    });
  }

  if (validCandidates.length > 0) {
    const selectedCandidate = [...validCandidates].sort((a, b) => {
      const qualityDiff = getHeroQualityRank(b.url) - getHeroQualityRank(a.url);
      if (qualityDiff !== 0) {
        return qualityDiff;
      }

      const areaDiff = (b.width ?? 0) * (b.height ?? 0) - (a.width ?? 0) * (a.height ?? 0);
      if (areaDiff !== 0) {
        return areaDiff;
      }

      const widthDiff = (b.width ?? 0) - (a.width ?? 0);
      if (widthDiff !== 0) {
        return widthDiff;
      }

      return (b.height ?? 0) - (a.height ?? 0);
    })[0]!;

    return {
      heroUrl: selectedCandidate.url,
      heroSourceType: selectedCandidate.sourceType,
      fallbackTriggered: false,
      finalCandidate: selectedCandidate,
      rejectedForeignCandidates,
    };
  }

  return {
    heroUrl: null,
    heroSourceType: "none",
    fallbackTriggered: true,
    finalCandidate: null,
    rejectedForeignCandidates,
  };
};
