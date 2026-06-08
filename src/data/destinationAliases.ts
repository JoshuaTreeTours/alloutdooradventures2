export type DestinationAlias = {
  countrySlug: string;
  aliasCitySlug: string;
  canonicalCitySlug: string;
  canonicalCityName: string;
  aliases: string[];
  signals: string[];
};

export const DESTINATION_CITY_ALIASES: DestinationAlias[] = [
  {
    countrySlug: "austria",
    aliasCitySlug: "wien",
    canonicalCitySlug: "vienna",
    canonicalCityName: "Vienna",
    aliases: ["Wien"],
    signals: [
      "local-language slug",
      "same metro inventory",
      "same coordinates",
    ],
  },
  {
    countrySlug: "italy",
    aliasCitySlug: "firenze",
    canonicalCitySlug: "florence",
    canonicalCityName: "Florence",
    aliases: ["Firenze"],
    signals: [
      "local-language slug",
      "same metro inventory",
      "same coordinates",
    ],
  },
  {
    countrySlug: "italy",
    aliasCitySlug: "roma",
    canonicalCitySlug: "rome",
    canonicalCityName: "Rome",
    aliases: ["Roma"],
    signals: [
      "local-language slug",
      "same metro inventory",
      "same coordinates",
    ],
  },
  {
    countrySlug: "germany",
    aliasCitySlug: "mnchen",
    canonicalCitySlug: "munich",
    canonicalCityName: "Munich",
    aliases: ["München", "Munchen"],
    signals: [
      "diacritic-stripped slug",
      "same metro inventory",
      "same coordinates",
    ],
  },
  {
    countrySlug: "netherlands",
    aliasCitySlug: "den-haag",
    canonicalCitySlug: "the-hague",
    canonicalCityName: "The Hague",
    aliases: ["Den Haag"],
    signals: [
      "local-language slug",
      "same metro inventory",
      "same coordinates",
    ],
  },
];

const aliasByKey = new Map(
  DESTINATION_CITY_ALIASES.map(alias => [
    `${alias.countrySlug}/${alias.aliasCitySlug}`,
    alias,
  ])
);

const canonicalGroupsByKey = DESTINATION_CITY_ALIASES.reduce<
  Map<string, Set<string>>
>((groups, alias) => {
  const key = `${alias.countrySlug}/${alias.canonicalCitySlug}`;
  const group = groups.get(key) ?? new Set<string>([alias.canonicalCitySlug]);
  group.add(alias.aliasCitySlug);
  groups.set(key, group);
  return groups;
}, new Map());

export const getDestinationCityAlias = (
  countrySlug: string,
  citySlug: string
) => aliasByKey.get(`${countrySlug}/${citySlug}`) ?? null;

export const getCanonicalDestinationCitySlug = (
  countrySlug: string,
  citySlug: string
) =>
  getDestinationCityAlias(countrySlug, citySlug)?.canonicalCitySlug ?? citySlug;

export const isDestinationCityAlias = (countrySlug: string, citySlug: string) =>
  getCanonicalDestinationCitySlug(countrySlug, citySlug) !== citySlug;

export const getDestinationCitySlugGroup = (
  countrySlug: string,
  citySlug: string
) => {
  const canonicalCitySlug = getCanonicalDestinationCitySlug(
    countrySlug,
    citySlug
  );
  return [
    ...(canonicalGroupsByKey.get(`${countrySlug}/${canonicalCitySlug}`) ??
      new Set([canonicalCitySlug])),
  ];
};

export const canonicalizeDestinationPath = (pathname: string) => {
  const cityMatch = pathname.match(
    /^\/destinations\/europe\/([^/]+)\/cities\/([^/]+)(\/tours)?\/?$/
  );
  if (cityMatch) {
    const [, countrySlug, citySlug, toursSuffix = ""] = cityMatch;
    const canonicalCitySlug = getCanonicalDestinationCitySlug(
      countrySlug,
      citySlug
    );
    return `/destinations/europe/${countrySlug}/cities/${canonicalCitySlug}${toursSuffix}`;
  }

  const tourMatch = pathname.match(
    /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)(\/book)?\/?$/
  );
  if (tourMatch) {
    const [, countrySlug, citySlug, tourSlug, bookSuffix = ""] = tourMatch;
    const canonicalCitySlug = getCanonicalDestinationCitySlug(
      countrySlug,
      citySlug
    );
    return `/destinations/${countrySlug}/${canonicalCitySlug}/tours/${tourSlug}${bookSuffix}`;
  }

  const legacyTourMatch = pathname.match(
    /^\/tours\/([^/]+)\/([^/]+)\/([^/]+)\/?$/
  );
  if (legacyTourMatch) {
    const [, countrySlug, citySlug, tourSlug] = legacyTourMatch;
    const canonicalCitySlug = getCanonicalDestinationCitySlug(
      countrySlug,
      citySlug
    );
    return `/tours/${countrySlug}/${canonicalCitySlug}/${tourSlug}`;
  }

  return pathname;
};
