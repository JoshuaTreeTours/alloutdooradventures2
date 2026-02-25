type SelectContentImageInput = {
  heroImageUrl?: string | null;
  preferredContentImageUrl?: string;
  wikiImageUrl?: string;
  fallbackImageUrl: string;
};

const normalizeUrl = (value?: string | null) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

export const selectContentImage = ({
  heroImageUrl,
  preferredContentImageUrl,
  wikiImageUrl,
  fallbackImageUrl,
}: SelectContentImageInput): string | null => {
  const hero = normalizeUrl(heroImageUrl);
  const preferred = normalizeUrl(preferredContentImageUrl);
  const wiki = normalizeUrl(wikiImageUrl);
  void fallbackImageUrl;

  if (preferred && preferred !== hero) {
    return preferred;
  }

  if (wiki && wiki !== hero) {
    return wiki;
  }

  return null;
};

