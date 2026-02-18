import { loadPuertoVallartaTours } from "../../data/international/puertoVallarta";
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

const buildFallbackKey = (tour: Engine2Tour) =>
  `${tour.slug}|${tour.sourceCitySlug}|${tour.sourceCountrySlug}`;

export const getEngine2PuertoVallartaTours = (): Engine2Tour[] => {
  try {
    const byPrimary = new Map<string, Engine2Tour>();
    const byFallback = new Map<string, Engine2Tour>();

    for (const row of loadPuertoVallartaTours()) {
      try {
        const itemId = clean(row.sourceItemId || row.id);
        if (!itemId) {
          continue;
        }

        const baseSlug = clean(row.slug);
        if (!baseSlug) {
          continue;
        }

        const slug = `${baseSlug}-${itemId}`;
        const canonicalPath = `/destinations/mexico/puerto-vallarta/tours/${slug}`;
        const providerName = clean(row.providerName) || "Unknown provider";
        const image = clean(row.image) || ENGINE2_DEFAULT_IMAGE;
        const copy = buildTourCopy({
          name: row.title,
          provider: providerName,
          city: "Puerto Vallarta",
          region: "Mexico",
        });

        const tour: Engine2Tour = {
          id: `mexico-puerto-vallarta-${itemId}`,
          sourceDatasetKey: "puerto-vallarta",
          sourceCountrySlug: "mexico",
          sourceCitySlug: "puerto-vallarta",
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
            region: "Mexico",
            city: "Puerto Vallarta",
            lat: parseCoordinate(row.locationLat),
            lng: parseCoordinate(row.locationLong),
          },
          seo: {
            title: `${row.title} | Puerto Vallarta, Mexico Tour`,
            description: clean(row.description) || copy.metaDescription,
            canonicalPath,
            ogImage: image,
          },
          content: {
            experienceText: clean(row.description) || copy.experienceText,
            highlights: copy.highlights,
          },
          images: {
            hero: image,
            gallery: [image],
          },
          booking: {
            bookingUrl: clean(row.bookingUrl),
          },
          pricing: {
            price: clean(row.price) || undefined,
            currency: "USD",
          },
        };

        const primaryKey = itemId;
        const fallbackKey = buildFallbackKey(tour);
        if (byPrimary.has(primaryKey) || byFallback.has(fallbackKey)) {
          continue;
        }

        byPrimary.set(primaryKey, tour);
        byFallback.set(fallbackKey, tour);
      } catch {
        continue;
      }
    }

    const tours = Array.from(byPrimary.values()).sort((a, b) =>
      a.seo.canonicalPath.localeCompare(b.seo.canonicalPath)
    );

    console.warn(`[puerto-vallarta] engine2 tours ready: ${tours.length}`);
    return tours;
  } catch (error) {
    console.warn("[puerto-vallarta] adapter failed", error);
    return [];
  }
};
