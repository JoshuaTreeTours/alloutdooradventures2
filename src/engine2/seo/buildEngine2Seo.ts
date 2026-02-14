import { buildCanonicalUrl, buildImageUrl } from "../../utils/seo";

import type { Engine2Tour } from "../data/loadEngine2";

export type Engine2Seo = {
  title: string;
  description: string;
  canonical: string;
  og: { title: string; description: string; image: string; url: string };
  twitter: {
    title: string;
    description: string;
    image: string;
    card: "summary_large_image";
  };
};

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const stripForbiddenSeoTokens = (value: string) =>
  normalizeWhitespace(value)
    .replace(/\bFood\s+Tour\b/gi, "Guided Tour")
    .replace(/\s*[·|]\s*ID\s*\w+/gi, "")
    .replace(/\bID\s*\w+\b/gi, "")
    .replace(/\b[a-z0-9]+(?:-[a-z0-9]+){1,}-\d{3,}\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

const clampDescription = (value: string, max = 170) => {
  if (value.length <= max) {
    return value;
  }

  const clipped = value.slice(0, max - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  const safe = lastSpace > 100 ? clipped.slice(0, lastSpace) : clipped;
  return `${safe.trim()}…`;
};

const buildDescription = (tour: Engine2Tour) => {
  const base =
    typeof tour.seo.description === "string" && tour.seo.description.trim().length > 0
      ? tour.seo.description
      : `${tour.name} in ${tour.geo.city}, ${tour.geo.region} with ${tour.provider.name}.`;

  const withoutForbidden = stripForbiddenSeoTokens(base);
  const withoutNameSlug = stripForbiddenSeoTokens(
    withoutForbidden.replace(new RegExp(tour.slug, "gi"), " "),
  );

  return clampDescription(withoutNameSlug);
};

export const buildEngine2Seo = (tour: Engine2Tour): Engine2Seo => {
  const location = [tour.geo.city, tour.geo.region].filter(Boolean).join(", ");
  const title = `${tour.name} | ${location} Outdoor Tour`;
  const description = buildDescription(tour);
  const canonical = buildCanonicalUrl(tour.seo.canonicalPath);
  const image = buildImageUrl(tour.images.hero || tour.seo.ogImage);

  return {
    title,
    description,
    canonical,
    og: {
      title,
      description,
      image,
      url: canonical,
    },
    twitter: {
      title,
      description,
      image,
      card: "summary_large_image",
    },
  };
};
