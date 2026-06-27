export const ENGINE6_GLOBAL_FALLBACK_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg";

export const ENGINE6_MONTEREY_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/6e/e7/f6.jpg";

const CANONICAL_CITY_HEROES: Record<string, Record<string, string>> = {
  california: {
    monterey: ENGINE6_MONTEREY_CANONICAL_CITY_HERO_URL,
  },
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

export const resolveEngine6DisplayHero = (args: {
  productHeroUrl?: string | null;
  stateSlug?: string;
  citySlug?: string;
}): string => {
  if (isDisplayableEngine6HeroUrl(args.productHeroUrl)) {
    return args.productHeroUrl;
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
