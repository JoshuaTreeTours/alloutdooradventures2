import { loadPuertoVallartaTours } from "../../data/international/puertoVallarta";
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
  `${tour.slug}|${tour.sourceCitySlug}|${tour.sourceCountrySlug}`;

export const getEngine2PuertoVallartaTours = (): Engine2Tour[] => {
  try {
    const byPrimary = new Map<string, Engine2Tour>();
    const byFallback = new Map<string, Engine2Tour>();

    for (const row of loadPuertoVallartaTours()) {
      try {
        const itemId = clean(row.item_id);
        const title = clean(row.item_name);

        if (!itemId || !title) {
          console.warn(
            `[puerto-vallarta] skipped adapter row: missing item_id or item_name (${itemId || "unknown"})`
          );
          continue;
        }

        const slugBase = slugify(clean(row.slug) || title) || "puerto-vallarta-tour";
        const slug = `${slugBase}-${itemId}`;
        const canonicalPath = `/destinations/mexico/puerto-vallarta/tours/${slug}`;
        const providerName = clean(row.providerName) || "Unknown provider";
        const copy = buildTourCopy({
          name: title,
          provider: providerName,
          city: "Puerto Vallarta",
          region: "Mexico",
        });

        const heroImage = clean(row.image) || ENGINE2_DEFAULT_IMAGE;

        const tour: Engine2Tour = {
          id: `puerto-vallarta-${itemId}`,
          sourceDatasetKey: "puerto-vallarta",
          sourceCountrySlug: "mexico",
          sourceProvinceSlug: undefined,
          sourceCitySlug: "puerto-vallarta",
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
            city: "Puerto Vallarta",
            lat: parseCoordinate(row.locationLat),
            lng: parseCoordinate(row.locationLong),
          },
          seo: {
            title: `${title} | Puerto Vallarta Tour`,
            description: `${title} in Puerto Vallarta, Mexico. Book guided experiences with local operators.`,
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
        if (byPrimary.has(itemId) || byFallback.has(fallbackKey)) {
          console.warn(`[puerto-vallarta] deduped tour item_id=${itemId}`);
          continue;
        }

        byPrimary.set(itemId, tour);
        byFallback.set(fallbackKey, tour);
      } catch (error) {
        console.warn("[puerto-vallarta] adapter skipped malformed row", error);
      }
    }

    return Array.from(byPrimary.values()).sort((a, b) =>
      a.seo.canonicalPath.localeCompare(b.seo.canonicalPath)
    );
  } catch (error) {
    console.warn("[puerto-vallarta] adapter failed", error);
    return [];
  }
};
