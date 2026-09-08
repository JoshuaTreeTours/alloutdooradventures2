import type { GuidePageData } from "../loadGuide";
import { states } from "../../data/destinations";
import { isRetiredLowInventoryGuide } from "./retiredLowInventoryGuides";

type GuideRegistryRecord = {
  country: "us";
  stateSlug: string;
  citySlug: string;
  dataImport: GuidePageData;
};

const loadUsGuideModules = () => {
  if (!import.meta.env) {
    return {} as Record<string, GuidePageData>;
  }

  return import.meta.glob("../../data/guides/us/*/*.json", {
    eager: true,
    import: "default",
  }) as Record<string, GuidePageData>;
};

const usGuideModules = loadUsGuideModules();

const parseGuidePath = (path: string) => {
  const match = path.match(/\/us\/([^/]+)\/([^/]+)\.json$/);
  if (!match) {
    return null;
  }

  return {
    stateSlug: match[1],
    citySlug: match[2],
  };
};

export const usGuideRegistry: GuideRegistryRecord[] = Object.entries(
  usGuideModules
)
  .map(([path, dataImport]) => {
    const parsed = parseGuidePath(path);
    if (
      !parsed ||
      parsed.citySlug === "index" ||
      isRetiredLowInventoryGuide(parsed.stateSlug, parsed.citySlug)
    ) {
      return null;
    }

    return {
      country: "us" as const,
      stateSlug: parsed.stateSlug,
      citySlug: parsed.citySlug,
      dataImport,
    };
  })
  .filter((record): record is GuideRegistryRecord => Boolean(record));

// Vite expands import.meta.glob in the browser build, but Node-based SSR/build
// scripts intentionally do not have import.meta.env. State guide rendering still
// needs a real city inventory in that environment so copy never falls back to
// "0 cities". destinations.ts is the canonical server-safe city registry used
// elsewhere by the build, so use it only as the server summary fallback.
const serverGuideSummaryRegistry: GuideRegistryRecord[] = states.flatMap(state =>
  state.cities
    .filter(city => !isRetiredLowInventoryGuide(state.slug, city.slug))
    .map(city => ({
      country: "us" as const,
      stateSlug: state.slug,
      citySlug: city.slug,
      dataImport: {
        state: state.name,
        city: city.name,
      } as GuidePageData,
    }))
);

const getGuideSummaryRegistry = () =>
  usGuideRegistry.length ? usGuideRegistry : serverGuideSummaryRegistry;

const guideRegistryByKey = new Map(
  usGuideRegistry.map(record => [
    `${record.country}/${record.stateSlug}/${record.citySlug}`,
    record,
  ])
);

export const getGuideRecord = (stateSlug: string, citySlug: string) =>
  guideRegistryByKey.get(`us/${stateSlug}/${citySlug}`);

export const getGuideStates = () =>
  Array.from(
    new Set(getGuideSummaryRegistry().map(record => record.stateSlug))
  ).sort();

export const getGuidesByState = (stateSlug: string) =>
  getGuideSummaryRegistry()
    .filter(record => record.stateSlug === stateSlug)
    .sort((a, b) =>
      (a.dataImport.city ?? a.citySlug).localeCompare(
        b.dataImport.city ?? b.citySlug
      )
    );
