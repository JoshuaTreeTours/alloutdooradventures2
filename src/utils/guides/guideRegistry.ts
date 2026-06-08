import type { GuidePageData } from "../loadGuide";
import { shouldRetainUsCityGuide } from "./guideRetentionPolicy";

type GuideRegistryRecord = {
  country: "us";
  stateSlug: string;
  citySlug: string;
  dataImport: GuidePageData;
};

const usGuideModules = import.meta.glob("../../data/guides/us/*/*.json", {
  eager: true,
  import: "default",
}) as Record<string, GuidePageData>;

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
    if (!parsed || parsed.citySlug === "index") {
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

export const retainedUsGuideRegistry = usGuideRegistry.filter(record =>
  shouldRetainUsCityGuide(record.stateSlug, record.citySlug, record.dataImport)
);

const guideRegistryByKey = new Map(
  retainedUsGuideRegistry.map(record => [
    `${record.country}/${record.stateSlug}/${record.citySlug}`,
    record,
  ])
);

export const getGuideRecord = (stateSlug: string, citySlug: string) =>
  guideRegistryByKey.get(`us/${stateSlug}/${citySlug}`);

export const getGuideStates = () =>
  Array.from(new Set(usGuideRegistry.map(record => record.stateSlug))).sort();

export const getRetainedGuideStates = () =>
  Array.from(
    new Set(retainedUsGuideRegistry.map(record => record.stateSlug))
  ).sort();

export const getGuidesByState = (stateSlug: string) =>
  retainedUsGuideRegistry
    .filter(record => record.stateSlug === stateSlug)
    .sort((a, b) => a.dataImport.city!.localeCompare(b.dataImport.city!));
