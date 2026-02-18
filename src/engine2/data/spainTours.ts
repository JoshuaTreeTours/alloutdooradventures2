import { loadSpainTours } from "../../data/international/spain";
import { slugify } from "../../utils/slugify";
import { ENGINE2_DEFAULT_IMAGE } from "../config/destinations";
import { buildTourCopy } from "../content/templates/buildTourCopy";
import type { Engine2Tour } from "./loadEngine2";

const clean = (value?: string) => (value ?? "").trim();

const parseCoordinate = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toTitle = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const buildFallbackKey = (tour: Engine2Tour) =>
  `${tour.slug}|${tour.sourceCitySlug}|${tour.sourceCountrySlug}`;

export const getEngine2SpainTours = (): Engine2Tour[] => {
  try {
    const byPrimary = new Map<string, Engine2Tour>();
    const byFallback = new Map<string, Engine2Tour>();

    for (const row of loadSpainTours()) {
      try {
        const id = clean(row.id);
        const title = clean(row.title);
        const cityName = clean(row.city);
        const citySlug = clean(row.citySlug);

        if (!id || !title || !cityName || !citySlug) {
          continue;
        }

        const regionName = clean(row.region) || "Spain";
        const providerName = clean(row.providerName) || "Unknown provider";
        const slugBase = slugify(title) || `spain-tour-${id}`;
        const slug = `${slugBase}-${id}`;
        const canonicalPath = `/destinations/spain/${citySlug}/tours/${slug}`;
        const copy = buildTourCopy({
          name: title,
          provider: providerName,
          city: cityName,
          region: toTitle(regionName),
        });

        const heroImage = clean(row.image) || ENGINE2_DEFAULT_IMAGE;

        const tour: Engine2Tour = {
          id: `spain-${id}`,
          sourceDatasetKey: "spain",
          sourceCountrySlug: "spain",
          sourceProvinceSlug: clean(row.region)
            ? slugify(clean(row.region))
            : undefined,
          sourceCitySlug: citySlug,
          slug,
          name: title,
          provider: {
            name: providerName,
            shortName: clean(row.providerShortName),
            email: clean(row.providerEmail) || undefined,
            phone: clean(row.providerPhone) || undefined,
          },
          geo: {
            country: "Spain",
            region: clean(row.region) || "Spain",
            city: cityName,
            lat: parseCoordinate(row.locationLat),
            lng: parseCoordinate(row.locationLong),
          },
          seo: {
            title: `${title} | ${cityName}, Spain Tour`,
            description: clean(row.description) || copy.metaDescription,
            canonicalPath,
            ogImage: heroImage,
          },
          content: {
            experienceText: clean(row.description) || copy.experienceText,
            highlights: copy.highlights,
          },
          images: {
            hero: heroImage,
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
        if (byPrimary.has(id) || byFallback.has(fallbackKey)) {
          continue;
        }

        byPrimary.set(id, tour);
        byFallback.set(fallbackKey, tour);
      } catch {
        continue;
      }
    }

    return Array.from(byPrimary.values()).sort((a, b) =>
      a.seo.canonicalPath.localeCompare(b.seo.canonicalPath)
    );
  } catch (error) {
    console.warn("[spain] adapter failed", error);
    return [];
  }
};
