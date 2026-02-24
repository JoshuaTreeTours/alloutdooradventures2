const DISALLOWED_IMAGE_URLS = new Set([
  "https://www.alloutdooradventures.com/default-tour.jpg",
]);

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);

const isFilestackResizeBaseUrl = (value: string) =>
  /^https?:\/\/cdn\.filestackcontent\.com\/resize\/?$/i.test(value);

export const cleanImageUrls = (
  values: Array<string | null | undefined>,
  limit = 10
): string[] => {
  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    const trimmed = value.trim();
    if (!trimmed || !isHttpUrl(trimmed)) {
      continue;
    }

    if (DISALLOWED_IMAGE_URLS.has(trimmed) || isFilestackResizeBaseUrl(trimmed)) {
      continue;
    }

    if (seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    cleaned.push(trimmed);

    if (cleaned.length >= limit) {
      break;
    }
  }

  return cleaned;
};

export const toSchemaImageValue = (images: string[]): string | string[] | undefined => {
  if (!images.length) {
    return undefined;
  }

  return images.length === 1 ? images[0] : images;
};
