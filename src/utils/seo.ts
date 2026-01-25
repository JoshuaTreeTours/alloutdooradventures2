import { getActivityLabelFromSlug } from "../data/activityLabels";

export const SITE_URL = "https://www.alloutdooradventures.com";

export const DEFAULT_SEO = {
  title: "All Outdoor Adventures | Curated Tours & Experiences Worldwide",
  description:
    "Discover unforgettable outdoor adventures across the United States and beyond. From national park tours and desert safaris to sailing, hiking, and wildlife experiences, All Outdoor Adventures curates the world’s best outdoor tours in one place.",
  url: `${SITE_URL}/`,
  type: "website",
  image: "/hero.jpg",
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

const normalizeLocation = (city?: string, region?: string) => {
  if (city && region) {
    return `${city}, ${region}`;
  }

  return city ?? region ?? "";
};

const trimHookToFit = (hook: string, maxLength: number) => {
  if (hook.length <= maxLength) {
    return hook;
  }

  const trimmed = hook.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(" ");
  const safeTrim = lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed;
  const normalized = safeTrim.replace(/[\s,.]+$/, "");

  return normalized ? `${normalized}.` : "";
};

export const buildTourMetaDescription = (tour: {
  title?: string;
  destination?: { city?: string; state?: string; country?: string };
  activitySlugs?: string[];
  primaryCategory?: string;
}) => {
  const title = normalizeText(tour.title ?? "this tour");
  const city = normalizeText(tour.destination?.city ?? "");
  const region = normalizeText(
    tour.destination?.state ?? tour.destination?.country ?? "",
  );
  const location = normalizeLocation(city || undefined, region || undefined);
  const prefix = location
    ? `Discover ${title} in ${location}.`
    : `Discover ${title}.`;
  const suffix = "Book your outdoor adventure today.";
  const activitySlug = tour.activitySlugs?.[0] ?? tour.primaryCategory ?? "";
  const activityLabel = normalizeText(getActivityLabelFromSlug(activitySlug));
  const activityLower = activityLabel
    ? activityLabel.toLowerCase()
    : "guided outdoor";

  const hookOptions = activityLabel
    ? [
        `Enjoy a ${activityLower} experience with local guides and unforgettable scenery.`,
        `Enjoy a ${activityLower} experience with local guides and scenic highlights.`,
        `Enjoy a ${activityLower} experience with local guides.`,
        `Enjoy a ${activityLower} experience.`,
      ]
    : [
        "Enjoy a guided outdoor experience with local guides and unforgettable scenery.",
        "Enjoy a guided outdoor experience with local guides and scenic highlights.",
        "Enjoy a guided outdoor experience with local guides.",
        "Enjoy a guided outdoor experience.",
      ];

  const minLength = 120;
  const maxLength = 155;
  let hook = hookOptions[0];
  let composed = `${prefix} ${hook} ${suffix}`.trim();

  for (const option of hookOptions) {
    const candidate = `${prefix} ${option} ${suffix}`.trim();
    if (candidate.length <= maxLength) {
      hook = option;
      composed = candidate;
      break;
    }
  }

  if (composed.length < minLength) {
    const expansionOptions = [
      "perfect for travelers seeking fresh air and local insight",
      "ideal for travelers craving fresh air",
    ];
    for (const expansion of expansionOptions) {
      const expandedHook = hook.replace(/\.$/, `, ${expansion}.`);
      const candidate = `${prefix} ${expandedHook} ${suffix}`.trim();
      if (candidate.length >= minLength && candidate.length <= maxLength) {
        hook = expandedHook;
        composed = candidate;
        break;
      }
    }
  }

  if (composed.length > maxLength) {
    const available = maxLength - prefix.length - suffix.length - 2;
    const trimmedHook = trimHookToFit(hook, Math.max(0, available));
    composed = `${prefix} ${trimmedHook} ${suffix}`.trim();
  }

  if (composed.length < minLength) {
    composed = buildMetaDescription(composed, undefined, minLength);
  }

  return clampDescription(composed, maxLength);
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

export const buildImageUrl = (image?: string) => {
  if (!image) {
    return buildCanonicalUrl(DEFAULT_SEO.image);
  }

  if (image.startsWith("http")) {
    return image;
  }

  return buildCanonicalUrl(image);
};
