const ALLOWED_HOST_PATTERN =
  /(?:^|\.)media\.tacdn\.com$|(?:^|\.)dynamic-media\.tacdn\.com$|(?:^|\.)cache\.vtrcdn\.com$/i;

const ALLOWED_EXTENSION_PATTERN = /\.(jpg|jpeg|png|webp|gif)(?:$|[?#])/i;

const REJECT_PATH_PATTERN =
  /globalnav|orion\/images\/globalnav\/|globalnav\/fallback|fallback-|fallback-top-activities|logo|sprite|100x100|50x50|1x1|top-activities/i;

const normalizeUrl = (value?: string): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    return new URL(trimmed).toString();
  } catch {
    return undefined;
  }
};

export const isRejectedCandidate = (urlValue: string): boolean => {
  const normalized = normalizeUrl(urlValue);
  if (!normalized) {
    return true;
  }

  const parsed = new URL(normalized);
  const pathAndQuery = `${parsed.pathname}${parsed.search}`;

  if (!ALLOWED_HOST_PATTERN.test(parsed.hostname)) {
    return true;
  }

  if (REJECT_PATH_PATTERN.test(pathAndQuery)) {
    return true;
  }

  if (!ALLOWED_EXTENSION_PATTERN.test(pathAndQuery)) {
    return true;
  }

  return false;
};

const candidatePriority = (urlValue: string): number => {
  const parsed = new URL(urlValue);
  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.toLowerCase();

  if (host.includes("dynamic-media.tacdn.com") && path.includes("/photo-o/")) {
    return 1;
  }

  if (
    host.includes("media.tacdn.com") &&
    path.includes("attractions-splice-spp")
  ) {
    return 2;
  }

  if (host.includes("cache.vtrcdn.com")) {
    return 3;
  }

  return 4;
};

export const selectEngine3PrimaryImage = (input: {
  viatorImageCandidates?: string[];
  fallbackImageUrl?: string;
}): string | undefined => {
  const deduped = Array.from(
    new Set(
      (input.viatorImageCandidates ?? [])
        .map(candidate => normalizeUrl(candidate))
        .filter((candidate): candidate is string => Boolean(candidate))
    )
  );

  const valid = deduped.filter(candidate => !isRejectedCandidate(candidate));
  valid.sort((a, b) => candidatePriority(a) - candidatePriority(b));

  if (valid.length > 0) {
    return valid[0];
  }

  const normalizedFallback = normalizeUrl(input.fallbackImageUrl);
  if (!normalizedFallback || isRejectedCandidate(normalizedFallback)) {
    return undefined;
  }

  return normalizedFallback;
};
