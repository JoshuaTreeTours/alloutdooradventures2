import { slugify } from "../../utils/slugify";
import { ENGINE2_DEFAULT_IMAGE } from "../config/destinations";
import { buildTourCopy } from "../content/templates/buildTourCopy";
import type { Engine2Tour } from "./loadEngine2";
import { alaskaRows } from "./alaska.rows";

const clean = (value?: string) => (value ?? "").trim();
const AFRICA_DESTINATIONS_BY_ITEM_ID: Record<
  string,
  { country: string; city: string }
> = {
  "517077": { country: "Kenya", city: "Nairobi" },
  "517088": { country: "Madagascar", city: "Antananarivo" },
  "517079": { country: "Ethiopia", city: "Addis Ababa" },
  "517094": { country: "Tanzania", city: "Zanzibar" },
  "520051": { country: "Tanzania", city: "Arusha" },
};

const toTitleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const getCityFromLocation = (location?: string) => {
  const parts = clean(location).split("/").map(clean).filter(Boolean);
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
    const africaDestination = AFRICA_DESTINATIONS_BY_ITEM_ID[id];
    const cityRaw =
      africaDestination?.city ||
      clean(row.city) ||
      getCityFromLocation(row.location);

    if (!id || !name) {
      console.warn("Skipping Alaska row with missing id/title", row);
      continue;
    }

    if (!cityRaw) {
      console.warn(
        `Alaska row ${id} missing city/location, using state-level fallback route`
      );
    }

    const citySlug = slugify(cityRaw);
    const slugBase = clean(row.slug) || slugify(name);
    const slug = `${slugBase}-${id}`;
    const countryName = africaDestination?.country ?? "United States";
    const regionName = africaDestination?.country ?? "Alaska";
    const countrySlug = slugify(countryName);
    const canonicalPath = citySlug
      ? `/destinations/${countrySlug}/${citySlug}/tours/${slug}`
      : `/destinations/${countrySlug}/tours/${slug}`;
    const primaryImage = clean(row.image) || ENGINE2_DEFAULT_IMAGE;
    const providerName = clean(row.operator) || "Unknown provider";
    const cityName = cityRaw ? toTitleCase(cityRaw) : regionName;
    const copy = buildTourCopy({
      name,
      provider: providerName,
      city: cityName,
      region: regionName,
    });
    const coords = parseLatLng(
      clean(row.location_lat),
      clean(row.location_long)
    );

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
        country: countryName,
        region: regionName,
        city: cityName,
        lat: coords.lat,
        lng: coords.lng,
      },
      seo: {
        title: `${name} | ${cityName}, ${regionName} Tour`,
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
