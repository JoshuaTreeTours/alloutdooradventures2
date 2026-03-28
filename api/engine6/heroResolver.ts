export const ENGINE6_APPROVED_PLACEHOLDER_IMAGE = "/images/hiking-hero.jpg";

export type Engine6HeroSourceType =
  | "api-primary"
  | "api-gallery"
  | "approved-placeholder";

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
  heroUrl: string;
  heroSourceType: Engine6HeroSourceType;
  fallbackTriggered: boolean;
  finalCandidate: Engine6HeroCandidate;
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
  placeholderUrl = ENGINE6_APPROVED_PLACEHOLDER_IMAGE,
}: {
  currentProductCode?: string | null;
  currentSourceProductUrl?: string | null;
  candidates: Engine6HeroCandidate[];
  placeholderUrl?: string;
}): Engine6ResolvedHero => {
  const normalizedCurrentProductCode = normalizeProductCode(currentProductCode);
  const normalizedCurrentSourceProductUrl = normalizeEngine6SourceProductUrl(
    currentSourceProductUrl
  );
  const rejectedForeignCandidates: Engine6RejectedHeroCandidate[] = [];
  let placeholderCandidate: Engine6HeroCandidate | null = null;

  for (const candidate of candidates) {
    if (!candidate?.url) {
      continue;
    }

    if (candidate.sourceType === "approved-placeholder") {
      if (candidate.url === placeholderUrl && !placeholderCandidate) {
        placeholderCandidate = {
          ...candidate,
          candidateProductCode: normalizeProductCode(currentProductCode),
          candidateSourceProductUrl:
            normalizeEngine6SourceProductUrl(currentSourceProductUrl),
        };
      }
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

    return {
      heroUrl: candidate.url,
      heroSourceType: candidate.sourceType,
      fallbackTriggered: false,
      finalCandidate: {
        ...candidate,
        candidateProductCode,
        candidateSourceProductUrl,
      },
      rejectedForeignCandidates,
    };
  }

  const fallbackCandidate =
    placeholderCandidate ??
    ({
      url: placeholderUrl,
      sourceType: "approved-placeholder",
      candidateProductCode: normalizedCurrentProductCode,
      candidateSourceProductUrl: normalizedCurrentSourceProductUrl,
      fieldPath: "engine6.approved-placeholder",
      variantPath: "engine6.approved-placeholder",
      width: null,
      height: null,
    } satisfies Engine6HeroCandidate);

  return {
    heroUrl: fallbackCandidate.url,
    heroSourceType: fallbackCandidate.sourceType,
    fallbackTriggered: true,
    finalCandidate: fallbackCandidate,
    rejectedForeignCandidates,
  };
};
