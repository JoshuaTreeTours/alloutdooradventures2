const normalizeImageCandidate = (value?: string): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const stripQueryString = (url: string): string => {
  const queryIndex = url.indexOf("?");
  return queryIndex >= 0 ? url.slice(0, queryIndex) : url;
};

export const selectSecondaryImage = ({
  primaryImageUrl,
  images,
  fallbackImageUrl,
}: {
  primaryImageUrl?: string;
  images?: string[];
  fallbackImageUrl: string;
}): string | null => {
  const normalizedPrimary = normalizeImageCandidate(primaryImageUrl);
  const normalizedFallback = normalizeImageCandidate(fallbackImageUrl);
  const primaryForComparison = normalizedPrimary
    ? stripQueryString(normalizedPrimary)
    : null;
  const fallbackForComparison = normalizedFallback
    ? stripQueryString(normalizedFallback)
    : null;

  const uniqueGalleryImages: string[] = [];
  const dedupeSet = new Set<string>();

  for (const image of images ?? []) {
    const normalizedImage = normalizeImageCandidate(image);
    if (!normalizedImage) {
      continue;
    }

    const compareValue = stripQueryString(normalizedImage);
    if (dedupeSet.has(compareValue)) {
      continue;
    }

    dedupeSet.add(compareValue);
    uniqueGalleryImages.push(normalizedImage);
  }

  return (
    uniqueGalleryImages.find(image => {
      const compareValue = stripQueryString(image);
      if (compareValue === primaryForComparison) {
        return false;
      }

      if (
        fallbackForComparison !== null &&
        primaryForComparison !== null &&
        fallbackForComparison === primaryForComparison &&
        compareValue === fallbackForComparison
      ) {
        return false;
      }

      return true;
    }) ?? null
  );
};
