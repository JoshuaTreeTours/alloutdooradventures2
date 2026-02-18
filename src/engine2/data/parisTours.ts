import { parisEngine2Rows } from "./paris.rows";
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

export const getEngine2ParisTours = (): Engine2Tour[] => {
  try {
    const byPrimary = new Map<string, Engine2Tour>();
    const byFallback = new Map<string, Engine2Tour>();

    for (const row of parisEngine2Rows) {
      const id = clean(row.id);
      const title = clean(row.title);
      if (!id || !title) {
        continue;
      }

      const providerName = clean(row.providerName) || "Unknown provider";
      const slugBase = slugify(title) || "paris-tour";
      const slug = `${slugBase}-${id}`;
      const canonicalPath = `/destinations/france/paris/tours/${slug}`;
      const copy = buildTourCopy({
        name: title,
        provider: providerName,
        city: "Paris",
        region: "Île-de-France",
      });
      const heroImage = clean(row.image) || ENGINE2_DEFAULT_IMAGE;

      const tour: Engine2Tour = {
        id: `paris-${id}`,
        sourceDatasetKey: "paris",
        sourceCountrySlug: "france",
        sourceProvinceSlug: "ile-de-france",
        sourceCitySlug: "paris",
        slug,
        name: title,
        provider: {
          name: providerName,
          shortName: clean(row.providerShortName),
          email: clean(row.providerEmail) || undefined,
          phone: clean(row.providerPhone) || undefined,
        },
        geo: {
          country: "France",
          region: "Île-de-France",
          city: "Paris",
          lat: parseCoordinate(row.locationLat),
          lng: parseCoordinate(row.locationLong),
        },
        seo: {
          title: `${title} | Paris, France Tour`,
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
      };

      const fallbackKey = buildFallbackKey(tour);
      if (byPrimary.has(id) || byFallback.has(fallbackKey)) {
        continue;
      }

      byPrimary.set(id, tour);
      byFallback.set(fallbackKey, tour);
    }

    return Array.from(byPrimary.values()).sort((a, b) =>
      a.seo.canonicalPath.localeCompare(b.seo.canonicalPath),
    );
  } catch (error) {
    console.warn("[paris] adapter failed", error);
    return [];
  }
};
