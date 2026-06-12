import { getAllEngine2Tours } from "../engine2/data/loadEngine2";
import { isUsCountryAlias } from "../utils/guides/usCountryAliases";
import { slugify } from "../utils/slugify";
import { states } from "./destinations";

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
  {
    countrySlug: "portugal",
    aliasCitySlug: "lisboa",
    canonicalCitySlug: "lisbon",
    canonicalCityName: "Lisbon",
    aliases: ["Lisboa"],
    signals: ["local-language slug", "same metro inventory"],
  },
  {
    countrySlug: "spain",
    aliasCitySlug: "alcdia",
    canonicalCitySlug: "alcudia",
    canonicalCityName: "Alcudia",
    aliases: ["Alcúdia"],
    signals: ["diacritic-stripped slug", "same metro inventory"],
  },
  {
    countrySlug: "spain",
    aliasCitySlug: "calvi",
    canonicalCitySlug: "calvia",
    canonicalCityName: "Calvia",
    aliases: ["Calvià"],
    signals: ["diacritic-stripped slug", "same metro inventory"],
  },
  {
    countrySlug: "spain",
    aliasCitySlug: "dei",
    canonicalCitySlug: "deia",
    canonicalCityName: "Deia",
    aliases: ["Deià"],
    signals: ["diacritic-stripped slug", "same metro inventory"],
  },
  {
    countrySlug: "spain",
    aliasCitySlug: "l-estartit",
    canonicalCitySlug: "lestartit",
    canonicalCityName: "L'Estartit",
    aliases: ["L'Estartit"],
    signals: ["punctuation variant", "same metro inventory"],
  },
  {
    countrySlug: "spain",
    aliasCitySlug: "pollena",
    canonicalCitySlug: "pollenca",
    canonicalCityName: "Pollenca",
    aliases: ["Pollença"],
    signals: ["diacritic-stripped slug", "same metro inventory"],
  },
  {
    countrySlug: "spain",
    aliasCitySlug: "san-sebastin",
    canonicalCitySlug: "san-sebastian",
    canonicalCityName: "San Sebastian",
    aliases: ["San Sebastián"],
    signals: ["diacritic-stripped slug", "same metro inventory"],
  },
  {
    countrySlug: "spain",
    aliasCitySlug: "sller",
    canonicalCitySlug: "soller",
    canonicalCityName: "Soller",
    aliases: ["Sóller"],
    signals: ["diacritic-stripped slug", "same metro inventory"],
  },
  {
    countrySlug: "spain",
    aliasCitySlug: "valncia",
    canonicalCitySlug: "valencia",
    canonicalCityName: "Valencia",
    aliases: ["València"],
    signals: ["diacritic-stripped slug", "same metro inventory"],
  },
  {
    countrySlug: "spain",
    aliasCitySlug: "xbia",
    canonicalCitySlug: "xabia",
    canonicalCityName: "Xabia",
    aliases: ["Xàbia"],
    signals: ["diacritic-stripped slug", "same metro inventory"],
  },
  {
    countrySlug: "united-states",
    aliasCitySlug: "santa-brbara",
    canonicalCitySlug: "santa-barbara",
    canonicalCityName: "Santa Barbara",
    aliases: ["Santa Bárbara"],
    signals: ["diacritic-stripped world-route duplicate"],
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
  return Array.from(
    canonicalGroupsByKey.get(`${countrySlug}/${canonicalCitySlug}`) ??
      new Set([canonicalCitySlug])
  );
};

const US_DESTINATION_FALLBACK = "/guides/us";

const getDomesticPathFromEngine2CanonicalPath = (canonicalPath: string) => {
  const countryQualifiedMatch = canonicalPath.match(
    /^\/destinations\/united-states\/([^/]+)\/([^/]+)(?:\/tours(?:\/.*)?)?\/?$/
  );
  if (countryQualifiedMatch) {
    const [, stateSlug, citySlug] = countryQualifiedMatch;
    return `/destinations/${stateSlug}/${citySlug}`;
  }

  const domesticMatch = canonicalPath.match(
    /^\/destinations\/([^/]+)\/([^/]+)(?:\/tours(?:\/.*)?)?\/?$/
  );
  if (!domesticMatch) {
    return null;
  }

  const [, stateSlug, citySlug] = domesticMatch;
  if (stateSlug === "world" || stateSlug === "europe") {
    return null;
  }

  return `/destinations/${stateSlug}/${citySlug}`;
};

export const resolveUsDestinationPath = (
  citySlug: string | null | undefined,
  suffix = ""
) => {
  const canonicalCitySlug = citySlug
    ? getCanonicalDestinationCitySlug("united-states", citySlug)
    : "";

  if (!canonicalCitySlug) {
    return US_DESTINATION_FALLBACK;
  }

  const staticState = states.find(state =>
    state.cities.some(city => city.slug === canonicalCitySlug)
  );
  if (staticState) {
    return `/destinations/${staticState.slug}/${canonicalCitySlug}${suffix}`;
  }

  const engine2Tour = getAllEngine2Tours().find(tour => {
    const tourCitySlug = tour.sourceCitySlug || slugify(tour.geo.city);
    const isUsTour =
      isUsCountryAlias(tour.geo.country) ||
      isUsCountryAlias(tour.sourceCountrySlug);

    return isUsTour && tourCitySlug === canonicalCitySlug;
  });

  const engine2DestinationPath = engine2Tour
    ? getDomesticPathFromEngine2CanonicalPath(engine2Tour.seo.canonicalPath)
    : null;

  return engine2DestinationPath
    ? `${engine2DestinationPath}${suffix}`
    : US_DESTINATION_FALLBACK;
};

export const canonicalizeDestinationPath = (pathname: string) => {
  const cityMatch = pathname.match(
    /^\/destinations\/(europe|world)\/([^/]+)\/cities\/([^/]+)(\/tours)?\/?$/
  );
  if (cityMatch) {
    const [, destinationScope, countrySlug, citySlug, toursSuffix = ""] =
      cityMatch;

    if (destinationScope === "world" && isUsCountryAlias(countrySlug)) {
      return resolveUsDestinationPath(citySlug, toursSuffix);
    }

    const canonicalCitySlug = getCanonicalDestinationCitySlug(
      countrySlug,
      citySlug
    );
    return `/destinations/${destinationScope}/${countrySlug}/cities/${canonicalCitySlug}${toursSuffix}`;
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
