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
    const locationParts = clean(row.location)
      .split("/")
      .map(clean)
      .filter(Boolean);
    const cityRaw = clean(row.city) || locationParts[2] || getCityFromLocation(row.location);
    const hasContinentPrefix =
      locationParts.length >= 3 && locationParts[0].toLowerCase() === "africa";
    const countryRaw = hasContinentPrefix
      ? locationParts[1]
      : locationParts[0] || "United States";
    const regionRaw = hasContinentPrefix
      ? locationParts[1]
      : locationParts[1] || (countryRaw === "United States" ? "Alaska" : countryRaw);

    if (!id || !name) {
      console.warn("Skipping Alaska row with missing id/title", row);
      continue;
    }

    if (!cityRaw) {
      console.warn(`Alaska row ${id} missing city/location, using state-level fallback route`);
    }

    const citySlug = slugify(cityRaw);
    const countrySlug = slugify(countryRaw);
    const slugBase = clean(row.slug) || slugify(name);
    const slug = `${slugBase}-${id}`;
    const canonicalPath = citySlug
      ? `/destinations/${countrySlug}/${citySlug}/tours/${slug}`
      : `/destinations/${countrySlug}/tours/${slug}`;
    const primaryImage = clean(row.image) || ENGINE2_DEFAULT_IMAGE;
    const providerName = clean(row.operator) || "Unknown provider";
    const cityName = cityRaw ? toTitleCase(cityRaw) : "Alaska";
    const copy = buildTourCopy({
      name,
      provider: providerName,
      city: cityName,
      region: regionRaw,
    });
    const coords = parseLatLng(clean(row.location_lat), clean(row.location_long));

    byId.set(id, {
      id: `alaska-${id}`,
      sourceDatasetKey: "alaska",
      sourceCountrySlug: countrySlug,
      sourceCitySlug: citySlug || countrySlug,
      slug,
      name,
      provider: {
        name: providerName,
        shortName: "",
      },
      geo: {
        country: countryRaw,
        region: regionRaw,
        city: cityName,
        lat: coords.lat,
        lng: coords.lng,
      },
      seo: {
        title: `${name} | ${cityName}, ${regionRaw} Tour`,
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
