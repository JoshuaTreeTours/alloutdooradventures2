const ALLOWED_HOST_PATTERN =
  /(?:^|\.)media\.tacdn\.com$|(?:^|\.)dynamic-media\.tacdn\.com$|(?:^|\.)cache\.vtrcdn\.com$|(?:^|\.)cdn\.filestackcontent\.com$/i;

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
  const host = parsed.hostname.toLowerCase();
  const pathAndQuery = `${parsed.pathname}${parsed.search}`;

  if (!ALLOWED_HOST_PATTERN.test(parsed.hostname)) {
    return true;
  }

  if (REJECT_PATH_PATTERN.test(pathAndQuery)) {
    return true;
  }

  const hasAllowedExtension = ALLOWED_EXTENSION_PATTERN.test(pathAndQuery);
  const isFilestackAsset =
    host.includes("cdn.filestackcontent.com") && parsed.pathname.length > 1;

  if (!hasAllowedExtension && !isFilestackAsset) {
    return true;
  }

  return false;
};

export const collectEngine3ImageCandidates = (input: {
  viatorImageCandidates?: string[];
}): string[] => {
  const deduped = Array.from(
    new Set(
      (input.viatorImageCandidates ?? [])
        .map(candidate => normalizeUrl(candidate))
        .filter((candidate): candidate is string => Boolean(candidate))
    )
  );

  return deduped.filter(candidate => !isRejectedCandidate(candidate));
};

export const selectEngine3PrimaryImage = (input: {
  viatorImageCandidates?: string[];
  fallbackImageUrl?: string;
}): string | undefined => {
  const valid = collectEngine3ImageCandidates({
    viatorImageCandidates: input.viatorImageCandidates,
  });

  if (valid.length > 0) {
    return valid[0];
  }

  const normalizedFallback = normalizeUrl(input.fallbackImageUrl);
  if (!normalizedFallback || isRejectedCandidate(normalizedFallback)) {
    return undefined;
  }

  return normalizedFallback;
};
