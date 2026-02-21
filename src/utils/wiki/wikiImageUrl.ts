const WIKIMEDIA_UPLOAD_HOST = "upload.wikimedia.org";

export const isValidWikiImageUrl = (value?: string | null): value is string => {
  if (!value?.trim()) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === WIKIMEDIA_UPLOAD_HOST
    );
  } catch {
    return false;
  }
};

export const pickWikiImageUrl = (args: {
  originalImageUrl?: string | null;
  thumbnailUrl?: string | null;
}): string | null => {
  const { originalImageUrl, thumbnailUrl } = args;

  if (isValidWikiImageUrl(originalImageUrl)) {
    return originalImageUrl;
  }

  if (isValidWikiImageUrl(thumbnailUrl)) {
    return thumbnailUrl;
  }

  return null;
};
