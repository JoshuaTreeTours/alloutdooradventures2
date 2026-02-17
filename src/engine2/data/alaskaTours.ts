import { slugify } from "../../utils/slugify";
import { ENGINE2_DEFAULT_IMAGE } from "../config/destinations";
import { buildTourCopy } from "../content/templates/buildTourCopy";
import type { Engine2Tour } from "./loadEngine2";
import { alaskaRows } from "./alaska.rows";

const clean = (value?: string) => (value ?? "").trim();

const toTitleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const getCityFromLocation = (location?: string) => {
  const parts = clean(location)
    .split("/")
    .map(clean)
    .filter(Boolean);
  return parts[parts.length - 1] ?? "";
};

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
  const byId = new Map<string, Engine2Tour>();

  for (const row of alaskaRows) {
    const id = clean(row.id);
    const name = clean(row.title);
    const cityRaw = clean(row.city) || getCityFromLocation(row.location);

    if (!id || !name) {
      console.warn("Skipping Alaska row with missing id/title", row);
      continue;
    }

    if (!cityRaw) {
      console.warn(`Alaska row ${id} missing city/location, using state-level fallback route`);
    }

    const citySlug = slugify(cityRaw);
    const slugBase = clean(row.slug) || slugify(name);
    const slug = `${slugBase}-${id}`;
    const canonicalPath = citySlug
      ? `/destinations/united-states/alaska/${citySlug}/tours/${slug}`
      : `/destinations/united-states/alaska/tours/${slug}`;
    const primaryImage = clean(row.image) || ENGINE2_DEFAULT_IMAGE;
    const providerName = clean(row.operator) || "Unknown provider";
    const cityName = cityRaw ? toTitleCase(cityRaw) : "Alaska";
    const copy = buildTourCopy({
      name,
      provider: providerName,
      city: cityName,
      region: "Alaska",
    });
    const coords = parseLatLng(clean(row.location_lat), clean(row.location_long));

    byId.set(id, {
      id: `alaska-${id}`,
      sourceDatasetKey: "alaska",
      sourceCountrySlug: "united-states",
      sourceCitySlug: citySlug || "alaska",
      slug,
      name,
      provider: {
        name: providerName,
        shortName: "",
      },
      geo: {
        country: "United States",
        region: "Alaska",
        city: cityName,
        lat: coords.lat,
        lng: coords.lng,
      },
      seo: {
        title: `${name} | ${cityName}, Alaska Tour`,
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

  return Array.from(byId.values()).sort((a, b) =>
    a.seo.canonicalPath.localeCompare(b.seo.canonicalPath)
  );
};
