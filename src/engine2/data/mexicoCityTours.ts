import { loadMexicoCityTours } from "../../data/international/mexicoCity";
import { slugify } from "../../utils/slugify";
import { ENGINE2_DEFAULT_IMAGE } from "../config/destinations";
import { buildTourCopy } from "../content/templates/buildTourCopy";
import type { Engine2Tour } from "./loadEngine2";

const clean = (value?: string) => (value ?? "").trim();

const parseCoordinate = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildFallbackKey = (tour: Engine2Tour) =>
  [tour.sourceCitySlug, tour.provider.shortName || "unknown", tour.slug].join("|");

export const getEngine2MexicoCityTours = (): Engine2Tour[] => {
  try {
    const byPrimary = new Map<string, Engine2Tour>();
    const byFallback = new Map<string, Engine2Tour>();

    for (const row of loadMexicoCityTours()) {
      try {
        const itemId = clean(row.item_id);
        const title = clean(row.item_name);
        if (!itemId || !title) {
          continue;
        }

        const slugBase = slugify(clean(row.slug) || title) || "ciudad-de-mexico-tour";
        const slug = `${slugBase}-${itemId}`;
        const canonicalPath = `/destinations/mexico/ciudad-de-mexico/tours/${slug}`;
        const providerName = clean(row.providerName) || "Unknown provider";
        const copy = buildTourCopy({
          name: title,
          provider: providerName,
          city: "Ciudad De México",
          region: "Mexico",
        });

        const heroImage = clean(row.image) || ENGINE2_DEFAULT_IMAGE;
        const primaryKey = `${clean(row.providerShortName) || "unknown"}:${itemId}`;

        const tour: Engine2Tour = {
          id: `mexico-city-${primaryKey}`,
          sourceDatasetKey: "mexico-city",
          sourceCountrySlug: "mexico",
          sourceProvinceSlug: undefined,
          sourceCitySlug: "ciudad-de-mexico",
          slug,
          name: title,
          provider: {
            name: providerName,
            shortName: clean(row.providerShortName),
            email: clean(row.providerEmail) || undefined,
            phone: clean(row.providerPhone) || undefined,
          },
          geo: {
            country: "Mexico",
            region: "Mexico",
            city: "Ciudad De México",
            lat: parseCoordinate(row.locationLat),
            lng: parseCoordinate(row.locationLong),
          },
          seo: {
            title: `${title} | Ciudad De México Tour`,
            description: copy.metaDescription,
            canonicalPath,
            ogImage: heroImage,
          },
          content: {
            experienceText: copy.experienceText,
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
            currency: "USD",
          },
        };

        const fallbackKey = buildFallbackKey(tour);
        if (byPrimary.has(primaryKey) || byFallback.has(fallbackKey)) {
          continue;
        }

        byPrimary.set(primaryKey, tour);
        byFallback.set(fallbackKey, tour);
      } catch (error) {
        console.warn("[mexico-city] adapter skipped malformed row", error);
      }
    }

    return Array.from(byPrimary.values()).sort((a, b) =>
      a.seo.canonicalPath.localeCompare(b.seo.canonicalPath)
    );
  } catch (error) {
    console.warn("[mexico-city] adapter failed", error);
    return [];
  }
};
