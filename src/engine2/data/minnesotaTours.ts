import { slugify } from "../../utils/slugify";
import { ENGINE2_DEFAULT_IMAGE } from "../config/destinations";
import { buildTourCopy } from "../content/templates/buildTourCopy";
import type { Engine2Tour } from "./loadEngine2";
import { minnesotaRows } from "./minnesota.rows";

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

export const loadMinnesotaEngine2Tours = (): Engine2Tour[] => {
  const byId = new Map<string, Engine2Tour>();

  for (const row of minnesotaRows) {
    const parts = clean(row.location)
      .split("/")
      .map(clean)
      .filter(Boolean);

    if (parts.length < 3) {
      continue;
    }

    const [countryRaw, regionRaw, cityRaw] = parts;
    if (slugify(countryRaw) !== "united-states" || slugify(regionRaw) !== "minnesota") {
      continue;
    }

    const id = clean(row.item_id);
    const name = clean(row.item_name);
    if (!id || !name) {
      continue;
    }

    const citySlug = slugify(cityRaw);
    const slug = `${slugify(name)}-${id}`;
    const canonicalPath = `/destinations/united-states/minnesota/${citySlug}/tours/${slug}`;
    const primaryImage = clean(row.image_url) || ENGINE2_DEFAULT_IMAGE;
    const providerName = clean(row.company_name) || "Unknown provider";
    const copy = buildTourCopy({
      name,
      provider: providerName,
      city: toTitleCase(cityRaw),
      region: "Minnesota",
    });
    const coords = parseLatLng(clean(row.location_lat), clean(row.location_long));

    byId.set(id, {
      id: `minnesota-${id}`,
      sourceDatasetKey: "minnesota",
      sourceCountrySlug: "united-states",
      sourceCitySlug: citySlug,
      slug,
      name,
      provider: {
        name: providerName,
        shortName: clean(row.company_shortname),
        email: clean(row.company_email) || undefined,
        phone: clean(row.company_phone) || undefined,
      },
      geo: {
        country: "United States",
        region: "Minnesota",
        city: toTitleCase(cityRaw),
        lat: coords.lat,
        lng: coords.lng,
      },
      seo: {
        title: `${name} | ${toTitleCase(cityRaw)}, Minnesota Tour`,
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
        bookingUrl: clean(row.regular_link) || clean(row.calendar_link),
      },
      pricing: {
        currency: "USD",
      },
    });
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.seo.canonicalPath.localeCompare(b.seo.canonicalPath)
  );
};
