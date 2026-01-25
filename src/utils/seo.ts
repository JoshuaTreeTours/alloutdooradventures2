export const SITE_URL = "https://www.alloutdooradventures.com";

export const DEFAULT_SEO = {
  title: "All Outdoor Adventures | Curated Tours & Experiences Worldwide",
  description:
    "Discover unforgettable outdoor adventures across the United States and beyond. From national park tours and desert safaris to sailing, hiking, and wildlife experiences, All Outdoor Adventures curates the world’s best outdoor tours in one place.",
  url: `${SITE_URL}/`,
  type: "website",
} as const;

const normalizeText = (text: string) => text.replace(/\s+/g, " ").trim();

const clampDescription = (text: string, maxLength = 160) => {
  if (text.length <= maxLength) {
    return text;
  }

  const trimmed = text.slice(0, maxLength - 1);
  const lastSpace = trimmed.lastIndexOf(" ");
  const safeTrim = lastSpace > 90 ? trimmed.slice(0, lastSpace) : trimmed;

  return `${safeTrim.trim()}…`;
};

export const buildMetaDescription = (
  primary: string,
  fallback?: string,
  minLength = 140,
) => {
  const base = normalizeText(primary);
  let composed = base;

  if (composed.length < minLength && fallback) {
    composed = `${composed} ${normalizeText(fallback)}`.trim();
  }

  if (composed.length < minLength) {
    composed = `${composed} Explore curated tours, local guides, and outdoor experiences.`.trim();
  }

  return clampDescription(composed);
};

export const buildCanonicalUrl = (path: string) => {
  if (!path) {
    return DEFAULT_SEO.url;
  }

  if (path.startsWith("http")) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;

  return `${SITE_URL}${normalized}`;
};
