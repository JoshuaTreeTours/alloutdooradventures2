import type { GuidePageData } from "../loadGuide";
import { isRetiredLowInventoryGuide } from "./retiredLowInventoryGuides";
import { enhanceCaliforniaGuide } from "../../data/californiaGuideEnhancements";
import { enhanceCaliforniaMajorCityGuide } from "../../data/californiaMajorCityEnhancements";
import { enhanceSacramentoGuide } from "../../data/californiaSacramentoEnhancement";
import { enhanceCaliforniaSoCalRegionalGuide } from "../../data/californiaSoCalRegionalEnhancements";

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

const enhanceGuide = (stateSlug: string, citySlug: string, guide: GuidePageData) =>
  enhanceCaliforniaSoCalRegionalGuide(
    stateSlug,
    citySlug,
    enhanceSacramentoGuide(
      stateSlug,
      citySlug,
      enhanceCaliforniaMajorCityGuide(
        stateSlug,
        citySlug,
        enhanceCaliforniaGuide(stateSlug, citySlug, guide)
      )
    )
  );

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
      dataImport: enhanceGuide(parsed.stateSlug, parsed.citySlug, dataImport),
    };
  })
  .filter((record): record is GuideRegistryRecord => Boolean(record));

const guideRegistryByKey = new Map(
  usGuideRegistry.map(record => [
    `${record.country}/${record.stateSlug}/${record.citySlug}`,
    record,
  ])
);

export const getGuideRecord = (stateSlug: string, citySlug: string) =>
  guideRegistryByKey.get(`us/${stateSlug}/${citySlug}`);

export const getGuideStates = () =>
  Array.from(new Set(usGuideRegistry.map(record => record.stateSlug))).sort();

export const getGuidesByState = (stateSlug: string) =>
  usGuideRegistry
    .filter(record => record.stateSlug === stateSlug)
    .sort((a, b) => a.dataImport.city!.localeCompare(b.dataImport.city!));

export const loadUsCityGuide = (stateSlug: string, citySlug: string) =>
  getGuideRecord(stateSlug, citySlug)?.dataImport;
