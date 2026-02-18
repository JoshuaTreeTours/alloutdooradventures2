import { loadAmsterdamTours } from "../../data/international/amsterdam";
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

export const getEngine2AmsterdamTours = (): Engine2Tour[] => {
  try {
    const byPrimary = new Map<string, Engine2Tour>();
    const byFallback = new Map<string, Engine2Tour>();

    for (const row of loadAmsterdamTours()) {
      try {
        const id = clean(row.id);
        const title = clean(row.title);

        if (!id || !title) {
          console.warn(`[amsterdam] skipped adapter row: missing id or title (${id || "unknown"})`);
          continue;
        }

        const slugBase = slugify(clean(row.slug) || title) || "amsterdam-tour";
        const slug = `${slugBase}-${id}`;
        const canonicalPath = `/destinations/netherlands/amsterdam/tours/${slug}`;
        const providerName = clean(row.providerName) || "Unknown provider";
        const copy = buildTourCopy({
          name: title,
          provider: providerName,
          city: "Amsterdam",
          region: "Netherlands",
        });
        const heroImage = clean(row.image) || ENGINE2_DEFAULT_IMAGE;

        const tour: Engine2Tour = {
          id: `amsterdam-${id}`,
          sourceDatasetKey: "amsterdam",
          sourceCountrySlug: "netherlands",
          sourceProvinceSlug: undefined,
          sourceCitySlug: "amsterdam",
          slug,
          name: title,
          provider: {
            name: providerName,
            shortName: clean(row.providerShortName),
            email: clean(row.providerEmail) || undefined,
            phone: clean(row.providerPhone) || undefined,
          },
          geo: {
            country: "Netherlands",
            region: "Netherlands",
            city: "Amsterdam",
            lat: parseCoordinate(row.locationLat),
            lng: parseCoordinate(row.locationLong),
          },
          seo: {
            title: `${title} | Amsterdam Tour`,
            description: `Book ${title} in Amsterdam, Netherlands. Guided tours and curated experiences with local operators.`,
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
          console.warn(`[amsterdam] deduped tour id=${id}`);
          continue;
        }

        byPrimary.set(id, tour);
        byFallback.set(fallbackKey, tour);
      } catch (error) {
        console.warn("[amsterdam] adapter skipped malformed row", error);
      }
    }

    return Array.from(byPrimary.values()).sort((a, b) =>
      a.seo.canonicalPath.localeCompare(b.seo.canonicalPath)
    );
  } catch (error) {
    console.warn("[amsterdam] adapter failed", error);
    return [];
  }
};
