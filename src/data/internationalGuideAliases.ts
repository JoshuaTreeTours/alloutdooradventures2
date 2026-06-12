export type InternationalGuideAlias = {
  countrySlug: string;
  aliasCitySlug: string;
  canonicalCitySlug: string;
  canonicalCityName: string;
};

export const INTERNATIONAL_GUIDE_CITY_ALIASES: InternationalGuideAlias[] = [
  {
    countrySlug: "austria",
    aliasCitySlug: "wien",
    canonicalCitySlug: "vienna",
    canonicalCityName: "Vienna",
  },
  {
    countrySlug: "germany",
    aliasCitySlug: "mnchen",
    canonicalCitySlug: "munich",
    canonicalCityName: "Munich",
  },
  {
    countrySlug: "netherlands",
    aliasCitySlug: "den-haag",
    canonicalCitySlug: "the-hague",
    canonicalCityName: "The Hague",
  },
  {
    countrySlug: "portugal",
    aliasCitySlug: "lisboa",
    canonicalCitySlug: "lisbon",
    canonicalCityName: "Lisbon",
  },
  {
    countrySlug: "spain",
    aliasCitySlug: "alcdia",
    canonicalCitySlug: "alcudia",
    canonicalCityName: "Alcudia",
  },
  {
    countrySlug: "spain",
    aliasCitySlug: "calvi",
    canonicalCitySlug: "calvia",
    canonicalCityName: "Calvia",
  },
  {
    countrySlug: "spain",
    aliasCitySlug: "dei",
    canonicalCitySlug: "deia",
    canonicalCityName: "Deia",
  },
  {
    countrySlug: "spain",
    aliasCitySlug: "l-estartit",
    canonicalCitySlug: "lestartit",
    canonicalCityName: "L'Estartit",
  },
  {
    countrySlug: "spain",
    aliasCitySlug: "pollena",
    canonicalCitySlug: "pollenca",
    canonicalCityName: "Pollenca",
  },
  {
    countrySlug: "spain",
    aliasCitySlug: "san-sebastin",
    canonicalCitySlug: "san-sebastian",
    canonicalCityName: "San Sebastian",
  },
  {
    countrySlug: "spain",
    aliasCitySlug: "sller",
    canonicalCitySlug: "soller",
    canonicalCityName: "Soller",
  },
  {
    countrySlug: "spain",
    aliasCitySlug: "valncia",
    canonicalCitySlug: "valencia",
    canonicalCityName: "Valencia",
  },
  {
    countrySlug: "spain",
    aliasCitySlug: "xbia",
    canonicalCitySlug: "xabia",
    canonicalCityName: "Xabia",
  },
  {
    countrySlug: "united-states",
    aliasCitySlug: "santa-brbara",
    canonicalCitySlug: "santa-barbara",
    canonicalCityName: "Santa Barbara",
  },
];

const aliasByKey = new Map(
  INTERNATIONAL_GUIDE_CITY_ALIASES.map(alias => [
    `${alias.countrySlug}/${alias.aliasCitySlug}`,
    alias,
  ])
);

const canonicalByKey = new Map(
  INTERNATIONAL_GUIDE_CITY_ALIASES.map(alias => [
    `${alias.countrySlug}/${alias.canonicalCitySlug}`,
    alias,
  ])
);

const canonicalGroupsByKey = INTERNATIONAL_GUIDE_CITY_ALIASES.reduce<
  Map<string, Set<string>>
>((groups, alias) => {
  const key = `${alias.countrySlug}/${alias.canonicalCitySlug}`;
  const group = groups.get(key) ?? new Set<string>([alias.canonicalCitySlug]);
  group.add(alias.aliasCitySlug);
  groups.set(key, group);
  return groups;
}, new Map());

export const getInternationalGuideCityAlias = (
  countrySlug: string,
  citySlug: string
) => aliasByKey.get(`${countrySlug}/${citySlug}`) ?? null;

export const getCanonicalInternationalGuideCitySlug = (
  countrySlug: string,
  citySlug: string
) =>
  getInternationalGuideCityAlias(countrySlug, citySlug)?.canonicalCitySlug ??
  citySlug;

export const getCanonicalInternationalGuideCityName = (
  countrySlug: string,
  citySlug: string,
  fallbackName: string
) =>
  canonicalByKey.get(
    `${countrySlug}/${getCanonicalInternationalGuideCitySlug(countrySlug, citySlug)}`
  )?.canonicalCityName ?? fallbackName;

export const getInternationalGuideCitySlugGroup = (
  countrySlug: string,
  citySlug: string
) => {
  const canonicalCitySlug = getCanonicalInternationalGuideCitySlug(
    countrySlug,
    citySlug
  );
  return Array.from(
    canonicalGroupsByKey.get(`${countrySlug}/${canonicalCitySlug}`) ??
      new Set([canonicalCitySlug])
  );
};

export const isInternationalGuideCityAlias = (
  countrySlug: string,
  citySlug: string
) => getCanonicalInternationalGuideCitySlug(countrySlug, citySlug) !== citySlug;
