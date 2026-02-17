import { loadColoradoTours } from "../../data/us/colorado";
import { loadMontanaTours } from "../../data/us/montana";
import { loadUtahTours } from "../../data/us/utah";
import { slugify } from "../../utils/slugify";
import { ENGINE2_DEFAULT_IMAGE } from "../config/destinations";
import { buildTourCopy } from "../content/templates/buildTourCopy";
import type { Engine2Tour } from "./loadEngine2";

const TITLE_CASE_OVERRIDES: Record<string, string> = {
  "st-george": "St. George",
};

const toTitleCase = (value: string) => {
  const slug = slugify(value);
  if (TITLE_CASE_OVERRIDES[slug]) {
    return TITLE_CASE_OVERRIDES[slug];
  }

  return value
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

const toEngine2Tour = ({
  stateSlug,
  stateName,
  id,
  title,
  city,
  image,
  bookingUrl,
}: {
  stateSlug: "utah" | "colorado" | "montana";
  stateName: "Utah" | "Colorado" | "Montana";
  id: string;
  title: string;
  city: string;
  image?: string;
  bookingUrl?: string;
}): Engine2Tour => {
  const citySlug = slugify(city);
  const slug = `${slugify(title)}-${id}`;
  const canonicalPath = `/destinations/united-states/${stateSlug}/${citySlug}/tours/${slug}`;
  const primaryImage = image || ENGINE2_DEFAULT_IMAGE;
  const copy = buildTourCopy({
    name: title,
    provider: "Local operator",
    city: toTitleCase(city),
    region: stateName,
  });

  return {
    id: `${stateSlug}-${id}`,
    sourceDatasetKey: stateSlug,
    sourceCountrySlug: "united-states",
    sourceCitySlug: citySlug,
    slug,
    name: title,
    provider: {
      name: "Local operator",
      shortName: "",
    },
    geo: {
      country: "United States",
      region: stateName,
      city: toTitleCase(city),
      lat: null,
      lng: null,
    },
    seo: {
      title: `${title} | ${toTitleCase(city)}, ${stateName} Tour`,
      description: copy.metaDescription,
      canonicalPath,
      ogImage: primaryImage,
    },
    content: {
      experienceText: copy.experienceText,
      highlights: copy.highlights,
    },
    images: {
      hero: primaryImage,
      gallery: [],
    },
    booking: {
      bookingUrl: bookingUrl ?? "",
    },
    pricing: {
      currency: "USD",
    },
  };
};

export const loadHeartlandEngine2Tours = (): Engine2Tour[] => {
  const tours: Engine2Tour[] = [];
  const dedupe = new Set<string>();

  const pushTour = (tour: Engine2Tour) => {
    if (!tour.booking.bookingUrl) {
      return;
    }

    if (dedupe.has(tour.id)) {
      return;
    }

    dedupe.add(tour.id);
    tours.push(tour);
  };

  loadUtahTours().forEach(tour => {
    if (slugify(tour.state ?? "") !== "utah") {
      return;
    }
    const next = toEngine2Tour({
      stateSlug: "utah",
      stateName: "Utah",
      id: tour.id,
      title: tour.title,
      city: tour.city,
      image: tour.image,
      bookingUrl: tour.bookingUrl,
    });
    pushTour(next);
  });

  loadColoradoTours().forEach(tour => {
    if (slugify(tour.state ?? "") !== "colorado") {
      return;
    }
    const next = toEngine2Tour({
      stateSlug: "colorado",
      stateName: "Colorado",
      id: tour.id,
      title: tour.title,
      city: tour.city,
      image: tour.image,
      bookingUrl: tour.bookingUrl,
    });
    pushTour(next);
  });

  loadMontanaTours().forEach(tour => {
    if (slugify(tour.state ?? "") !== "montana") {
      return;
    }
    const next = toEngine2Tour({
      stateSlug: "montana",
      stateName: "Montana",
      id: tour.id,
      title: tour.title,
      city: tour.city,
      image: tour.image,
      bookingUrl: tour.bookingUrl,
    });
    pushTour(next);
  });

  return tours.sort((a, b) => a.seo.canonicalPath.localeCompare(b.seo.canonicalPath));
};
