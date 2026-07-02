const ENGINE6_CANONICAL_TOUR_PATH =
  /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/;

export const parseEngine6StateCityFromCanonicalPath = (canonicalPath: string) => {
  const [, stateSlug = "", citySlug = ""] =
    ENGINE6_CANONICAL_TOUR_PATH.exec(canonicalPath) ?? [];
  return { stateSlug, citySlug };
};

export const ENGINE6_GLOBAL_FALLBACK_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg";

export const ENGINE6_MONTEREY_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/6e/e7/f6.jpg";

export const ENGINE6_NAPA_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/72/f3/27.jpg";

export const ENGINE6_LAKE_TAHOE_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/d6/ce/fe.jpg";

export const ENGINE6_YOSEMITE_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/2b/0d/2c.jpg";

export const ENGINE6_GRAND_CANYON_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/47/d9/03.jpg";

export const ENGINE6_YELLOWSTONE_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/d9/ee/1d.jpg";

export const ENGINE6_ZION_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/13/1d/62/0b.jpg";

export const ENGINE6_GLACIER_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/photo-w/2d/67/82/0b/caption.jpg";

type Engine6HeroCandidateTour = {
  productCode: string;
  heroImageUrl?: string | null;
};

const CANONICAL_CITY_HEROES: Record<string, Record<string, string>> = {
  california: {
    monterey: ENGINE6_MONTEREY_CANONICAL_CITY_HERO_URL,
    napa: ENGINE6_NAPA_CANONICAL_CITY_HERO_URL,
    "lake-tahoe": ENGINE6_LAKE_TAHOE_CANONICAL_CITY_HERO_URL,
    yosemite: ENGINE6_YOSEMITE_CANONICAL_CITY_HERO_URL,
  },
  arizona: {
    "grand-canyon-national-park": ENGINE6_GRAND_CANYON_CANONICAL_CITY_HERO_URL,
  },
  wyoming: {
    "yellowstone-national-park": ENGINE6_YELLOWSTONE_CANONICAL_CITY_HERO_URL,
  },
  utah: {
    "zion-national-park": ENGINE6_ZION_CANONICAL_CITY_HERO_URL,
  },
  montana: {
    "glacier-national-park": ENGINE6_GLACIER_CANONICAL_CITY_HERO_URL,
  },
};

const CURATED_PRODUCT_HEROES: Record<string, string[]> = {
  "53254P8": [
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/0a/7f/49/38.jpg",
  ],
  "173135P2": [
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/11/f7/e9/9d.jpg",
  ],
  "434555P1": [
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/8d/68/f9.jpg",
  ],
};

const UNAVAILABLE_HERO_URLS = new Set([
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/2e/41/ec.jpg",
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/31/d9/f9/af.jpg",
]);

const FORBIDDEN_DISPLAY_HERO_URLS = new Set([
  "/hero.jpg",
  "/images/hiking-hero.jpg",
  "/logo.svg",
]);

export const isDisplayableEngine6HeroUrl = (
  url?: string | null
): url is string => {
  const normalized = (url ?? "").trim();
  if (!normalized || !/^https?:\/\//i.test(normalized)) {
    return false;
  }

  if (FORBIDDEN_DISPLAY_HERO_URLS.has(normalized)) {
    return false;
  }

  if (UNAVAILABLE_HERO_URLS.has(normalized)) {
    return false;
  }

  if (normalized.includes("/hero.jpg")) {
    return false;
  }

  return true;
};

export const resolveEngine6CanonicalCityHero = (
  stateSlug?: string,
  citySlug?: string
): string | undefined => {
  if (!stateSlug || !citySlug) {
    return undefined;
  }

  return CANONICAL_CITY_HEROES[stateSlug]?.[citySlug];
};

export const getEngine6CuratedProductHeroCandidates = (
  productCode?: string | null
) => CURATED_PRODUCT_HEROES[(productCode ?? "").trim().toUpperCase()] ?? [];

const firstDisplayableCandidate = (
  candidates: Array<string | null | undefined>,
  usedHeroes?: ReadonlySet<string>
) =>
  candidates.find(
    candidate =>
      isDisplayableEngine6HeroUrl(candidate) && !usedHeroes?.has(candidate)
  );

export const resolveEngine6DisplayHero = (args: {
  productHeroUrl?: string | null;
  productCode?: string | null;
  stateSlug?: string;
  citySlug?: string;
  usedHeroes?: ReadonlySet<string>;
}): string => {
  const productHero = firstDisplayableCandidate(
    [args.productHeroUrl],
    args.usedHeroes
  );
  if (productHero) {
    return productHero;
  }

  const curatedHero = firstDisplayableCandidate(
    getEngine6CuratedProductHeroCandidates(args.productCode),
    args.usedHeroes
  );
  if (curatedHero) {
    return curatedHero;
  }

  const cityHero = resolveEngine6CanonicalCityHero(
    args.stateSlug,
    args.citySlug
  );
  if (isDisplayableEngine6HeroUrl(cityHero)) {
    return cityHero;
  }

  return ENGINE6_GLOBAL_FALLBACK_HERO_URL;
};

export const resolveEngine6CityDisplayHeroes = (args: {
  tours: Engine6HeroCandidateTour[];
  stateSlug?: string;
  citySlug?: string;
}): Map<string, string> => {
  const usedHeroes = new Set<string>();
  const resolvedHeroesByProductCode = new Map<string, string>();

  for (const tour of args.tours) {
    const hero = resolveEngine6DisplayHero({
      productCode: tour.productCode,
      productHeroUrl: tour.heroImageUrl,
      stateSlug: args.stateSlug,
      citySlug: args.citySlug,
      usedHeroes,
    });
    resolvedHeroesByProductCode.set(tour.productCode, hero);
    usedHeroes.add(hero);
  }

  return resolvedHeroesByProductCode;
};

export const resolveEngine6DisplayHeroFallback = (args: {
  stateSlug?: string;
  citySlug?: string;
  excluding?: string;
}): string => {
  const cityHero = resolveEngine6CanonicalCityHero(
    args.stateSlug,
    args.citySlug
  );
  if (isDisplayableEngine6HeroUrl(cityHero) && cityHero !== args.excluding) {
    return cityHero;
  }

  if (
    isDisplayableEngine6HeroUrl(ENGINE6_GLOBAL_FALLBACK_HERO_URL) &&
    ENGINE6_GLOBAL_FALLBACK_HERO_URL !== args.excluding
  ) {
    return ENGINE6_GLOBAL_FALLBACK_HERO_URL;
  }

  return ENGINE6_GLOBAL_FALLBACK_HERO_URL;
};
