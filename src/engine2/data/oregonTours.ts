import { loadOregonTours } from "../../data/us/oregon";
import { slugify } from "../../utils/slugify";
import { ENGINE2_DEFAULT_IMAGE } from "../config/destinations";
import { buildTourCopy } from "../content/templates/buildTourCopy";
import type { Engine2Tour } from "./loadEngine2";

const toTitleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export const loadOregonEngine2Tours = (): Engine2Tour[] => {
  const byId = new Map<string, Engine2Tour>();

  for (const row of loadOregonTours()) {
    const id = row.id?.trim();
    const name = row.title?.trim();
    if (!id || !name) {
      continue;
    }

    const citySlug = slugify(row.city);
    if (!citySlug) {
      continue;
    }

    const cityName = toTitleCase(row.city);
    const slug = `${slugify(name)}-${id}`;
    const canonicalPath = `/destinations/united-states/oregon/${citySlug}/tours/${slug}`;
    const primaryImage = row.image || ENGINE2_DEFAULT_IMAGE;
    const providerName = row.operator || "Unknown provider";
    const copy = buildTourCopy({
      name,
      provider: providerName,
      city: cityName,
      region: "Oregon",
    });

    byId.set(id, {
      id: `oregon-${id}`,
      sourceItemId: id,
      sourceDatasetKey: "oregon",
      sourceCountrySlug: "united-states",
      sourceStateSlug: "oregon",
      sourceCitySlug: citySlug,
      slug,
      name,
      provider: {
        name: providerName,
        shortName: slugify(providerName),
      },
      geo: {
        country: "United States",
        region: "Oregon",
        city: cityName,
        lat: null,
        lng: null,
      },
      seo: {
        title: `${name} | ${cityName}, Oregon Tour`,
        description: row.description || copy.metaDescription,
        canonicalPath,
        ogImage: primaryImage,
      },
      content: {
        experienceText: row.description || copy.experienceText,
        highlights: copy.highlights,
      },
      images: {
        hero: primaryImage,
        gallery: [],
      },
      booking: {
        bookingUrl: row.bookingUrl || "",
      },
      pricing: {
        price: row.price,
        currency: "USD",
      },
    });
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.seo.canonicalPath.localeCompare(b.seo.canonicalPath)
  );
};
