import { loadMexicoTours } from "../../data/international/mexico";
import { slugify } from "../../utils/slugify";
import { ENGINE2_DEFAULT_IMAGE } from "../config/destinations";
import { buildTourCopy } from "../content/templates/buildTourCopy";
import type { Engine2Tour } from "./loadEngine2";

const clean = (value?: string) => (value ?? "").trim();

const parseCoordinate = (value: string) => {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
};

const toTitle = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const buildFallbackKey = (tour: Engine2Tour) =>
  `${tour.slug}|${tour.sourceCitySlug}|${tour.sourceCountrySlug}`;


const normalizeSearch = (value: string) =>
  clean(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const resolveMexicoCityIdentity = (city: string) => {
  const normalized = normalizeSearch(city);
  const isMexicoCity =
    normalized === "ciudad de mexico" ||
    normalized === "mexico city" ||
    normalized === "cdmx";

  if (isMexicoCity) {
    return {
      cityName: "Mexico City",
      citySlug: "mexico-city",
    };
  }

  return {
    cityName: toTitle(city),
    citySlug: slugify(city),
  };
};

export default function getMexicoTours(): Engine2Tour[] {
  try {
    const byPrimary = new Map<string, Engine2Tour>();
    const byFallback = new Map<string, Engine2Tour>();

    for (const row of loadMexicoTours()) {
      try {
        const cityIdentity = resolveMexicoCityIdentity(row.city);
        const citySlug = cityIdentity.citySlug;
        if (!citySlug) {
          continue;
        }

        const regionSlug = clean(row.region) ? slugify(row.region) : undefined;
        const tourSlug = slugify(row.title);
        if (!tourSlug) {
          continue;
        }

        const slug = `${tourSlug}-${row.id}`;
        const canonicalPath = `/destinations/mexico/${citySlug}/tours/${slug}`;
        const providerName = clean(row.providerName) || "Unknown provider";
        const cityName = cityIdentity.cityName;
        const regionName = clean(row.region) ? toTitle(row.region) : "Mexico";
        const copy = buildTourCopy({
          name: row.title,
          provider: providerName,
          city: cityName,
          region: regionName,
        });

        const tour: Engine2Tour = {
          id: `mexico-${row.id}`,
          sourceDatasetKey: "mexico",
          sourceCountrySlug: "mexico",
          sourceProvinceSlug: regionSlug,
          sourceCitySlug: citySlug,
          slug,
          name: row.title,
          provider: {
            name: providerName,
            shortName: clean(row.providerShortName),
            email: clean(row.providerEmail) || undefined,
            phone: clean(row.providerPhone) || undefined,
          },
          geo: {
            country: "Mexico",
            region: regionName,
            city: cityName,
            lat: parseCoordinate(row.locationLat),
            lng: parseCoordinate(row.locationLong),
          },
          seo: {
            title: `${row.title} | ${cityName}, Mexico Tour`,
            description: copy.metaDescription,
            canonicalPath,
            ogImage: clean(row.image) || ENGINE2_DEFAULT_IMAGE,
          },
          content: {
            experienceText: clean(row.description) || copy.experienceText,
            highlights: copy.highlights,
          },
          images: {
            hero: clean(row.image) || ENGINE2_DEFAULT_IMAGE,
            gallery: [],
          },
          booking: {
            bookingUrl: clean(row.bookingUrl),
          },
          pricing: {
            price: clean(row.price) || undefined,
            currency: "USD",
          },
        };

        const fallbackKey = buildFallbackKey(tour);
        if (byPrimary.has(row.id) || byFallback.has(fallbackKey)) {
          continue;
        }

        byPrimary.set(row.id, tour);
        byFallback.set(fallbackKey, tour);
      } catch {
        continue;
      }
    }

    return Array.from(byPrimary.values()).sort((a, b) =>
      a.seo.canonicalPath.localeCompare(b.seo.canonicalPath)
    );
  } catch (error) {
    console.warn("[mexico] adapter failed", error);
    return [];
  }
}
