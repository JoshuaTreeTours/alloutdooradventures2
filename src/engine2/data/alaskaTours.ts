import { loadAlaskaTours } from "../../data/us/alaska";
import { slugify } from "../../utils/slugify";
import { ENGINE2_DEFAULT_IMAGE } from "../config/destinations";
import { buildTourCopy } from "../content/templates/buildTourCopy";
import type { Engine2Tour } from "./loadEngine2";

const clean = (value?: string) => (value ?? "").trim();

const toTitleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const parseLatLng = (latRaw: string, lngRaw: string) => {
  let lat = Number.parseFloat(latRaw);
  let lng = Number.parseFloat(lngRaw);

  if (!Number.isFinite(lat)) lat = Number.NaN;
  if (!Number.isFinite(lng)) lng = Number.NaN;

  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
    [lat, lng] = [lng, lat];
  }

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  ) {
    return { lat: null, lng: null };
  }

  return { lat, lng };
};

export const loadAlaskaEngine2Tours = (): Engine2Tour[] => {
  const byKey = new Map<string, Engine2Tour>();

  for (const row of loadAlaskaTours()) {
    const sourceItemId = clean(row.sourceItemId || row.id);
    const name = clean(row.title);

    if (!sourceItemId && !name) {
      console.warn("Skipping Alaska row with missing sourceItemId/title", row);
      continue;
    }

    const cityName = clean(row.city) || "Alaska";
    const citySlug = slugify(cityName) || "alaska";
    const slugBase = clean(row.slug) || slugify(name || `alaska-tour-${sourceItemId}`);
    const stableId = sourceItemId || `${slugBase}-${citySlug}-alaska`;
    const slug = `${slugBase}-${stableId}`;
    const canonicalPath = `/destinations/united-states/alaska/${citySlug}/tours/${slug}`;
    const dedupeKey = sourceItemId || `${slugBase}:${citySlug}:alaska`;
    const primaryImage = clean(row.image) || ENGINE2_DEFAULT_IMAGE;
    const providerName = clean(row.operator) || "Unknown provider";
    const copy = buildTourCopy({
      name: name || `Alaska Tour ${stableId}`,
      provider: providerName,
      city: toTitleCase(cityName),
      region: "Alaska",
    });
    const coords = parseLatLng(clean(row.location_lat), clean(row.location_long));

    byKey.set(dedupeKey, {
      id: `alaska-${stableId}`,
      sourceDatasetKey: "alaska",
      sourceCountrySlug: "united-states",
      sourceCitySlug: citySlug,
      slug,
      name: name || `Alaska Tour ${stableId}`,
      provider: {
        name: providerName,
        shortName: clean(row.company_shortname),
        email: clean(row.company_email) || undefined,
        phone: clean(row.company_phone) || undefined,
      },
      geo: {
        country: "United States",
        region: "Alaska",
        city: toTitleCase(cityName),
        lat: coords.lat,
        lng: coords.lng,
      },
      seo: {
        title: `${name || `Alaska Tour ${stableId}`} | ${toTitleCase(cityName)}, Alaska Tour`,
        description: copy.metaDescription,
        canonicalPath,
        ogImage: primaryImage,
      },
      content: {
        experienceText: copy.experienceText,
        highlights: copy.highlights,
      },
      images: {
        hero: primaryImage,
        gallery: [],
      },
      booking: {
        bookingUrl: clean(row.bookingUrl),
      },
      pricing: {
        price: clean(row.price) || undefined,
        currency: "USD",
      },
    });
  }

  return Array.from(byKey.values()).sort((a, b) =>
    a.seo.canonicalPath.localeCompare(b.seo.canonicalPath)
  );
};
