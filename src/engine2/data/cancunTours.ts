import { loadCancunTours } from "../../data/international/cancun";
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

export const getEngine2CancunTours = (): Engine2Tour[] => {
  try {
    const byPrimary = new Map<string, Engine2Tour>();
    const byFallback = new Map<string, Engine2Tour>();

    for (const row of loadCancunTours()) {
      try {
        if (!row.id) {
          continue;
        }

        const slugBase = clean(row.slug);
        if (!slugBase) {
          continue;
        }

        const slug = `${slugBase}-${row.id}`;
        const canonicalPath = `/destinations/mexico/cancun/tours/${slug}`;
        const providerName = clean(row.providerName) || "Unknown provider";
        const copy = buildTourCopy({
          name: row.title,
          provider: providerName,
          city: "Cancun",
          region: "Mexico",
        });

        const heroImage = clean(row.image) || ENGINE2_DEFAULT_IMAGE;

        const tour: Engine2Tour = {
          id: `cancun-${row.id}`,
          sourceDatasetKey: "cancun",
          sourceCountrySlug: "mexico",
          sourceProvinceSlug: undefined,
          sourceCitySlug: "cancun",
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
            city: "Cancun",
            lat: parseCoordinate(row.locationLat),
            lng: parseCoordinate(row.locationLong),
          },
          seo: {
            title: `${row.title} | Cancun Mexico Tour`,
            description: copy.metaDescription,
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
        if (byPrimary.has(row.id) || byFallback.has(fallbackKey)) {
          continue;
        }

        byPrimary.set(row.id, tour);
        byFallback.set(fallbackKey, tour);
      } catch (error) {
        console.warn("[cancun] adapter skipped row", error);
      }
    }

    return Array.from(byPrimary.values()).sort((a, b) =>
      a.seo.canonicalPath.localeCompare(b.seo.canonicalPath)
    );
  } catch (error) {
    console.warn("[cancun] adapter failed", error);
    return [];
  }
};
