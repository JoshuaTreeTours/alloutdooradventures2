import { loadCaboTours } from "../../data/international/cabo";
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
  [tour.slug, tour.sourceCitySlug, tour.provider.shortName || "unknown"].join("|");

const seoCityLabel = (citySlug: string) =>
  citySlug === "san-jose-del-cabo" ? "San José del Cabo" : "Cabo San Lucas";

export const getEngine2CaboTours = (): Engine2Tour[] => {
  try {
    const byId = new Map<string, Engine2Tour>();
    const byFallback = new Map<string, Engine2Tour>();

    for (const row of loadCaboTours()) {
      try {
        const title = clean(row.item_name) || "Cabo Tour";
        const itemId = clean(row.item_id);
        const citySlug = row.citySlug || "cabo-san-lucas";
        const cityName = seoCityLabel(citySlug);
        const slugBase = slugify(clean(row.slug) || title) || "cabo-tour";
        const slug = itemId ? `${slugBase}-${itemId}` : slugBase;
        const canonicalPath = `/destinations/mexico/${citySlug}/tours/${slug}`;
        const providerName = clean(row.providerName) || "Unknown provider";
        const cityTourLabel = cityName === "San José del Cabo" ? "San José del Cabo Tour" : "Cabo San Lucas Tour";
        const copy = buildTourCopy({
          name: title,
          provider: providerName,
          city: cityName,
          region: "Mexico",
        });

        const heroImage = clean(row.image) || ENGINE2_DEFAULT_IMAGE;
        const stableId = itemId || `${citySlug}-${slugBase}`;

        const tour: Engine2Tour = {
          id: `cabo-${stableId}`,
          sourceDatasetKey: "cabo",
          sourceCountrySlug: "mexico",
          sourceProvinceSlug: undefined,
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
            country: "Mexico",
            region: "Mexico",
            city: cityName,
            lat: parseCoordinate(row.locationLat),
            lng: parseCoordinate(row.locationLong),
          },
          seo: {
            title: `${title} | ${cityTourLabel}`,
            description: `Book ${title} in ${cityName}, Mexico. Curated guided experiences with local operators.`,
            canonicalPath,
            ogImage: heroImage,
          },
          content: {
            experienceText: copy.experienceText,
            highlights: copy.highlights,
          },
          images: {
            hero: heroImage,
            gallery: [heroImage],
          },
          booking: {
            bookingUrl: clean(row.bookingUrl),
          },
          pricing: {
            currency: "USD",
          },
        };

        const primaryKey = itemId || tour.id;
        const fallbackKey = buildFallbackKey(tour);

        if (byId.has(primaryKey) || byFallback.has(fallbackKey)) {
          continue;
        }

        byId.set(primaryKey, tour);
        byFallback.set(fallbackKey, tour);
      } catch (error) {
        console.warn("[cabo] adapter skipped row", error);
      }
    }

    return Array.from(byId.values()).sort((a, b) =>
      a.seo.canonicalPath.localeCompare(b.seo.canonicalPath)
    );
  } catch (error) {
    console.warn("[cabo] adapter failed", error);
    return [];
  }
};
