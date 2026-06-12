import { getCanonicalInternationalGuideCitySlug } from "../../data/internationalGuideAliases";

export const INTERNATIONAL_CITY_GUIDE_MIN_ACTIVE_TOURS = 5 as const;

export type ProtectedInternationalGuideRecord = {
  countrySlug: string;
  citySlug: string;
  reason: string;
};

export const PROTECTED_INTERNATIONAL_CITY_GUIDES: ProtectedInternationalGuideRecord[] =
  [
    {
      countrySlug: "netherlands",
      citySlug: "amsterdam",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "greece",
      citySlug: "athens",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "spain",
      citySlug: "barcelona",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "germany",
      citySlug: "berlin",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "hungary",
      citySlug: "budapest",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "denmark",
      citySlug: "copenhagen",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "ireland",
      citySlug: "dublin",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "united-kingdom",
      citySlug: "edinburgh",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "italy",
      citySlug: "florence",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "portugal",
      citySlug: "lisbon",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "united-kingdom",
      citySlug: "london",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "germany",
      citySlug: "munich",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "france",
      citySlug: "paris",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "portugal",
      citySlug: "porto",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "czech-republic",
      citySlug: "prague",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "iceland",
      citySlug: "reykjavik",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "italy",
      citySlug: "rome",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "australia",
      citySlug: "sydney",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "italy",
      citySlug: "venice",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "austria",
      citySlug: "vienna",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "switzerland",
      citySlug: "zurich",
      reason: "flagship-international-city",
    },
    {
      countrySlug: "netherlands",
      citySlug: "the-hague",
      reason: "audited-alias-canonical-guide",
    },
    {
      countrySlug: "spain",
      citySlug: "alcudia",
      reason: "audited-alias-canonical-guide",
    },
    {
      countrySlug: "spain",
      citySlug: "calvia",
      reason: "audited-alias-canonical-guide",
    },
    {
      countrySlug: "spain",
      citySlug: "deia",
      reason: "audited-alias-canonical-guide",
    },
    {
      countrySlug: "spain",
      citySlug: "lestartit",
      reason: "audited-alias-canonical-guide",
    },
    {
      countrySlug: "spain",
      citySlug: "pollenca",
      reason: "audited-alias-canonical-guide",
    },
    {
      countrySlug: "spain",
      citySlug: "san-sebastian",
      reason: "audited-alias-canonical-guide",
    },
    {
      countrySlug: "spain",
      citySlug: "soller",
      reason: "audited-alias-canonical-guide",
    },
    {
      countrySlug: "spain",
      citySlug: "valencia",
      reason: "audited-alias-canonical-guide",
    },
    {
      countrySlug: "spain",
      citySlug: "xabia",
      reason: "audited-alias-canonical-guide",
    },
  ];

const normalizeSlug = (value: string) => value.trim().toLowerCase();

const protectedGuideKeys = new Set(
  PROTECTED_INTERNATIONAL_CITY_GUIDES.map(
    record =>
      `${normalizeSlug(record.countrySlug)}/${normalizeSlug(record.citySlug)}`
  )
);

export const getCanonicalInternationalGuideKey = (
  countrySlug: string,
  citySlug: string
) => {
  const normalizedCountrySlug = normalizeSlug(countrySlug);
  const normalizedCitySlug = getCanonicalInternationalGuideCitySlug(
    normalizedCountrySlug,
    normalizeSlug(citySlug)
  );

  return `${normalizedCountrySlug}/${normalizedCitySlug}`;
};

export const isProtectedInternationalCityGuide = (
  countrySlug: string,
  citySlug: string
) =>
  protectedGuideKeys.has(
    getCanonicalInternationalGuideKey(countrySlug, citySlug)
  );

export const shouldRetainInternationalCityGuide = ({
  countrySlug,
  citySlug,
  activeTourCount,
}: {
  countrySlug: string;
  citySlug: string;
  activeTourCount: number;
}) =>
  isProtectedInternationalCityGuide(countrySlug, citySlug) ||
  activeTourCount >= INTERNATIONAL_CITY_GUIDE_MIN_ACTIVE_TOURS;
