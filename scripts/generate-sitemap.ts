// Generates public/sitemap.xml using tours, destinations, guides, and activity datasets.
// Datasets: src/data/tours.ts, src/data/flagstaffTours.ts, src/data/destinations.ts,
// src/data/guideData.ts, src/data/europeIndex.ts, src/data/worldIndex.ts,
// src/data/tourCatalog.ts. Routes: top-level nav pages, tours/activities, tour
// detail + booking, destinations (US states/cities + Europe/world hubs), and guides.
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { destinations, states } from "../src/data/destinations";
import { countriesWithTours, toursByCountry } from "../src/data/europeIndex";
import { getGuideCountries, getGuideStates } from "../src/data/guideData";
import { getFlagstaffTourBookingPath, getFlagstaffTourDetailPath } from "../src/data/flagstaffTours";
import { ACTIVITY_PAGES, ADVENTURE_ACTIVITY_PAGES, US_STATES, slugify } from "../src/data/tourCatalog";
import { getCityTourBookingPath, getTourDetailPath, tours } from "../src/data/tours";
import { worldCountriesWithTours, worldToursByCountry } from "../src/data/worldIndex";

const BASE_URL = "https://www.alloutdooradventures.com";
const OUTPUT_PATH = path.resolve(process.cwd(), "public", "sitemap.xml");

const normalizePath = (value: string) => {
  if (!value) {
    return "";
  }
  const withLeading = value.startsWith("/") ? value : `/${value}`;
  if (withLeading !== "/" && withLeading.endsWith("/")) {
    return withLeading.slice(0, -1);
  }
  return withLeading;
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

const urlSet = new Set<string>();
const counts = {
  static: 0,
  activities: 0,
  tours: 0,
  bookings: 0,
  destinations: 0,
  guides: 0,
};

type CountKey = keyof typeof counts;

const addPath = (value: string, key: CountKey) => {
  const normalized = normalizePath(value);
  if (!normalized) {
    return;
  }
  const sizeBefore = urlSet.size;
  urlSet.add(normalized);
  if (urlSet.size > sizeBefore) {
    counts[key] += 1;
  }
};

const addStaticRoutes = () => {
  [
    "/",
    "/about",
    "/contact",
    "/faqs",
    "/faq",
    "/journeys",
    "/tours",
    "/tours/catalog",
    "/tours/day",
    "/tours/day/cycling",
    "/tours/day/hiking",
    "/tours/day/paddle",
    "/tours/multi-day",
    "/tours/cycling",
    "/tours/hiking",
    "/tours/canoeing",
    "/guides",
    "/destinations",
    "/destinations/europe",
    "/united-kingdom",
    "/privacy",
    "/terms",
    "/cookies",
    "/disclosure",
  ].forEach((route) => addPath(route, "static"));
};

const addActivityRoutes = () => {
  const allActivities = new Map(
    [...ACTIVITY_PAGES, ...ADVENTURE_ACTIVITY_PAGES].map((activity) => [
      activity.slug,
      activity,
    ]),
  );

  allActivities.forEach((activity) => {
    addPath(`/tours/activities/${activity.slug}`, "activities");
  });

  ADVENTURE_ACTIVITY_PAGES.forEach((activity) => {
    addPath(`/tours/${activity.slug}`, "activities");
  });

  const usStateSlugs = new Set(US_STATES.map((state) => slugify(state)));

  ADVENTURE_ACTIVITY_PAGES.forEach((activity) => {
    const statesWithActivity = new Set<string>();

    tours.forEach((tour) => {
      if (!tour.destination.state) {
        return;
      }
      const stateSlug = slugify(tour.destination.state);
      if (!usStateSlugs.has(stateSlug)) {
        return;
      }
      if (!tour.activitySlugs.includes(activity.slug)) {
        return;
      }
      statesWithActivity.add(stateSlug);
    });

    statesWithActivity.forEach((stateSlug) => {
      addPath(`/tours/${activity.slug}/us/${stateSlug}`, "activities");
    });
  });
};

const addTourRoutes = () => {
  tours.forEach((tour) => {
    const isFlagstaff =
      tour.destination.stateSlug === "arizona" &&
      tour.destination.citySlug === "flagstaff";
    const detailPath = isFlagstaff
      ? getFlagstaffTourDetailPath(tour)
      : getTourDetailPath(tour);
    const bookingPath = isFlagstaff
      ? getFlagstaffTourBookingPath(tour)
      : getCityTourBookingPath(tour);

    addPath(detailPath, "tours");
    addPath(bookingPath, "bookings");
  });
};

const addDestinationRoutes = () => {
  destinations.forEach((destination) => {
    addPath(destination.href, "destinations");
  });

  states.forEach((state) => {
    addPath(`/destinations/states/${state.slug}/tours`, "destinations");

    state.cities.forEach((city) => {
      addPath(`/destinations/states/${state.slug}/cities/${city.slug}`, "destinations");
      addPath(`/destinations/${state.slug}/${city.slug}/tours`, "destinations");
    });
  });

  const countryFilterSlugs = ["cycling", "hiking", "paddle-sports", "canoeing"];

  countriesWithTours.forEach((country) => {
    addPath(`/destinations/europe/${country.slug}`, "destinations");
    countryFilterSlugs.forEach((filterSlug) => {
      addPath(`/destinations/europe/${country.slug}/${filterSlug}`, "destinations");
    });

    const countryTours = toursByCountry[country.slug] ?? [];
    const citySlugs = new Set(
      countryTours
        .map((tour) => tour.destination.citySlug)
        .filter((slug): slug is string => Boolean(slug)),
    );

    citySlugs.forEach((citySlug) => {
      addPath(`/destinations/europe/${country.slug}/cities/${citySlug}`, "destinations");
      addPath(`/destinations/europe/${country.slug}/cities/${citySlug}/tours`, "destinations");
    });
  });

  worldCountriesWithTours.forEach((country) => {
    addPath(`/destinations/world/${country.slug}`, "destinations");
    countryFilterSlugs.forEach((filterSlug) => {
      addPath(`/destinations/world/${country.slug}/${filterSlug}`, "destinations");
    });

    const countryTours = worldToursByCountry[country.slug] ?? [];
    const citySlugs = new Set(
      countryTours
        .map((tour) => tour.destination.citySlug)
        .filter((slug): slug is string => Boolean(slug)),
    );

    citySlugs.forEach((citySlug) => {
      addPath(`/destinations/world/${country.slug}/cities/${citySlug}`, "destinations");
      addPath(`/destinations/world/${country.slug}/cities/${citySlug}/tours`, "destinations");
    });
  });
};

const addGuideRoutes = () => {
  const guideStates = getGuideStates();
  const guideCountries = getGuideCountries();

  guideStates.forEach((state) => {
    addPath(`/guides/us/${state.slug}`, "guides");
    state.cities.forEach((city) => {
      addPath(`/guides/us/${state.slug}/${city.slug}`, "guides");
    });
  });

  guideCountries.forEach((country) => {
    addPath(`/guides/world/${country.slug}`, "guides");
    country.cities.forEach((city) => {
      addPath(`/guides/world/${country.slug}/${city.slug}`, "guides");
    });
  });
};

const buildSitemapXml = (urls: string[]) => {
  const entries = urls
    .map((value) => {
      const url = new URL(value, BASE_URL).href;
      return `  <url><loc>${escapeXml(url)}</loc></url>`;
    })
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
  );
};

const run = async () => {
  addStaticRoutes();
  addActivityRoutes();
  addTourRoutes();
  addDestinationRoutes();
  addGuideRoutes();

  const urls = Array.from(urlSet).sort();
  const sitemapXml = buildSitemapXml(urls);

  const publicDir = path.resolve(process.cwd(), "public");
  if (!OUTPUT_PATH.startsWith(publicDir)) {
    console.warn(
      `[sitemap] output path (${OUTPUT_PATH}) is outside ${publicDir}; skipping write.`,
    );
    return;
  }

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, sitemapXml, "utf8");

  const total = urlSet.size;
  console.log(
    `[sitemap] total URLs: ${total} (static: ${counts.static}, activities: ${counts.activities}, tours: ${counts.tours}, bookings: ${counts.bookings}, destinations: ${counts.destinations}, guides: ${counts.guides})`,
  );
  if (!total) {
    console.warn("[sitemap] no URLs found; wrote empty sitemap.");
  } else {
    const sampleUrls = urls.slice(0, 5).join(", ");
    console.log(`[sitemap] sample URLs: ${sampleUrls}`);
  }
  console.log(`[sitemap] wrote ${OUTPUT_PATH}`);
};

run().catch((error) => {
  console.error("[sitemap] failed to generate sitemap", error);
  process.exitCode = 1;
});
