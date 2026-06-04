import { slugify } from "./slugify";

type TourUrlRow = {
  source_url?: string;
  slug?: string;
  title?: string;
  tourId?: string;
  state?: string;
  state_slug?: string;
  city?: string;
  city_slug?: string;
};

const DOMAIN = "https://www.alloutdooradventures.com";

const normalize = (value?: string) => (value ?? "").trim();

const toSlug = (...values: Array<string | undefined>) => {
  for (const value of values) {
    const cleaned = normalize(value);
    if (cleaned) {
      return slugify(cleaned);
    }
  }

  return "";
};

export function buildTourUrl(row: TourUrlRow) {
  const sourceUrl = normalize(row.source_url);
  if (sourceUrl) {
    try {
      const parsed = new URL(sourceUrl, DOMAIN);
      const pathname = parsed.pathname.replace(/\/+$/, "") || "/";
      return `${DOMAIN}${pathname}`;
    } catch {
      return `${DOMAIN}${sourceUrl.startsWith("/") ? sourceUrl : `/${sourceUrl}`}`;
    }
  }

  const stateSlug = toSlug(row.state_slug, row.state);
  const citySlug = toSlug(row.city_slug, row.city);
  const tourSlug = row.slug || toSlug(row.title, row.tourId);

  if (stateSlug && citySlug && tourSlug) {
    return `${DOMAIN}/destinations/${stateSlug}/${citySlug}/tours/${tourSlug}`;
  }

  if (stateSlug && tourSlug) {
    return `${DOMAIN}/destinations/states/${stateSlug}/tours/${tourSlug}`;
  }

  return `${DOMAIN}/tours/${tourSlug}`;
}

export function buildTourUrlSafe(row: TourUrlRow) {
  if (row.source_url) return buildTourUrl(row);

  const slug = row.slug || slugify(row.title || row.tourId || "tour");

  return `${DOMAIN}/tours/${slug}`;
}
