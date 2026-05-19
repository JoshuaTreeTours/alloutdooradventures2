import { loadHawaiiTours } from "../../data/states/hawaii";
import { slugify } from "../../utils/slugify";
import { ENGINE2_DEFAULT_IMAGE } from "../config/destinations";
import { buildTourCopy } from "../content/templates/buildTourCopy";
import type { Engine2Tour } from "./loadEngine2";

const clean = (value?: string) => (value ?? "").trim();

const HAWAII_PLACEHOLDER_IMAGE = "";

const toTitleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const parseCoordinate = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getBestImage = (row: ReturnType<typeof loadHawaiiTours>[number]) =>
  clean(row.image) ||
  clean(row.imageUrl) ||
  clean(row.photo) ||
  clean(row.thumbnail) ||
  clean(row.cover) ||
  HAWAII_PLACEHOLDER_IMAGE;

const buildSecondaryDedupKey = (tour: Engine2Tour) =>
  `${tour.slug}|${tour.sourceCitySlug}|${tour.geo.region.toLowerCase()}`;

export const getEngine2HawaiiTours = (): Engine2Tour[] => {
  try {
    const byId = new Map<string, Engine2Tour>();
    const bySecondary = new Map<string, Engine2Tour>();

    for (const row of loadHawaiiTours()) {
      try {
        const id = clean(row.sourceItemId || row.id);
        const name = clean(row.title);

        if (!id) {
          console.warn("[hawaii-engine2] skipping row with missing id", row);
          continue;
        }

        if (!name) {
          console.warn(`[hawaii-engine2] skipping row ${id}: missing title`);
          continue;
        }

        const cityName = clean(row.city) || "Hawaii";
        const citySlug = clean(row.citySlug) || slugify(cityName) || "hawaii";
        const slugBase = clean(row.slug) || slugify(name);
        if (!slugBase) {
          console.warn(
            `[hawaii-engine2] skipping row ${id}: missing slug/title`
          );
          continue;
        }

        const slug = `${slugBase}-${id}`;
        const canonicalPath = `/destinations/united-states/hawaii/${citySlug}/tours/${slug}`;
        const primaryImage = getBestImage(row) || ENGINE2_DEFAULT_IMAGE;
        const providerName = clean(row.providerName) || "Unknown provider";
        const copy = buildTourCopy({
          name,
          provider: providerName,
          city: toTitleCase(cityName),
          region: "Hawaii",
        });

        const tour: Engine2Tour = {
          id: `hawaii-${id}`,
          sourceDatasetKey: "hawaii",
          sourceCountrySlug: "united-states",
          sourceCitySlug: citySlug,
          slug,
          name,
          provider: {
            name: providerName,
            shortName: clean(row.providerShortName),
            email: clean(row.providerEmail) || undefined,
            phone: clean(row.providerPhone) || undefined,
          },
          geo: {
            country: "United States",
            region: "Hawaii",
            city: toTitleCase(cityName),
            lat: parseCoordinate(row.locationLat),
            lng: parseCoordinate(row.locationLong),
          },
          seo: {
            title: `${name} | Hawaii Tour`,
            description: `Book ${name} in Hawaii. Compare guided tours and outdoor experiences and reserve online.`,
            canonicalPath,
            ogImage: primaryImage,
          },
          content: {
            experienceText: clean(row.description) || copy.experienceText,
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
            currency: "USD",
          },
        };

        const secondaryKey = buildSecondaryDedupKey(tour);

        if (byId.has(tour.id) || bySecondary.has(secondaryKey)) {
          continue;
        }

        byId.set(tour.id, tour);
        bySecondary.set(secondaryKey, tour);
      } catch {
        continue;
      }
    }

    return Array.from(byId.values()).sort((a, b) =>
      a.seo.canonicalPath.localeCompare(b.seo.canonicalPath)
    );
  } catch (error) {
    console.warn("[hawaii-engine2] adapter failed", error);
    return [];
  }
};
