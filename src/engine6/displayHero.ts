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

export const ENGINE6_BRYCE_CANYON_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/ff/99/2a.jpg";

export const ENGINE6_ARCHES_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/10/5e/d7/9e.jpg";

export const ENGINE6_CANYONLANDS_CANONICAL_CITY_HERO_URL =
  "https://dynamic-media.tacdn.com/media/photo-o/2f/b0/48/25/caption.jpg?w=700&h=500&s=1";

export const ENGINE6_ACADIA_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/1d/63/1d.jpg";

export const ENGINE6_OLYMPIC_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0a/78/b1/b5.jpg";

export const ENGINE6_GLACIER_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/photo-w/2d/67/82/0b/caption.jpg";

export const ENGINE6_GSM_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/photo-w/2f/0b/2f/15/caption.jpg";

export const ENGINE6_SEDONA_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0c/0d/63/85.jpg";

export const ENGINE6_CHICAGO_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/aa/41/ca.jpg";

export const ENGINE6_LONDON_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/38/74/00.jpg";

export const ENGINE6_EDINBURGH_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/7b/ac/f1.jpg";

export const ENGINE6_MEXICO_CITY_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/e4/d9/8e.jpg";

export const ENGINE6_CANCUN_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/13/e7/bd/55.jpg";

export const ENGINE6_PUERTO_VALLARTA_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/3b/38/d8.jpg";

export const ENGINE6_CABO_SAN_LUCAS_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/cf/9e/b2.jpg";

export const ENGINE6_CUSCO_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/74/81/07.jpg";

export const ENGINE6_LIMA_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/04/97/94.jpg";

export const ENGINE6_RIO_DE_JANEIRO_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/69/c1/75.jpg";

export const ENGINE6_TOKYO_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/09/5b/2a/70.jpg";

export const ENGINE6_KYOTO_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/09/5b/1c/e7.jpg";

export const ENGINE6_BANGKOK_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/1a/ed/f5.jpg";

export const ENGINE6_SINGAPORE_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0a/5a/2b/4b.jpg";

export const ENGINE6_BALI_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/88/6f/2b.jpg";

export const ENGINE6_PARIS_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/02/18/42.jpg";

export const ENGINE6_BARCELONA_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/fa/f1/fc.jpg";
export const ENGINE6_ROME_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/74/80/9d.jpg";

export const ENGINE6_VENICE_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/33/b1/01.jpg";

export const ENGINE6_AMSTERDAM_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/11/6c/b1/fa.jpg";

export const ENGINE6_DUBLIN_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0c/0b/6a/dc.jpg";

export const ENGINE6_BOSTON_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/94/3a/b2.jpg";

export const ENGINE6_PHILADELPHIA_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/3b/f2/57.jpg";

export const ENGINE6_RMNP_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/92/85/fc.jpg";

export const ENGINE6_DENVER_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/15/90/d7/e4.jpg";

export const ENGINE6_ASPEN_CANONICAL_CITY_HERO_URL =
  "https://dynamic-media.tacdn.com/media/photo-o/2e/ff/04/e3/caption.jpg?w=700&h=500&s=1";

export const ENGINE6_BOULDER_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/e7/3a/9d.jpg";

export const ENGINE6_AUSTIN_CANONICAL_CITY_HERO_URL =
  "https://dynamic-media.tacdn.com/media/photo-o/2f/10/17/ed/caption.jpg?w=700&h=500&s=1";

export const ENGINE6_HOUSTON_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/13/fb/83/03.jpg";

export const ENGINE6_MOAB_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/r/33/43/44/fa/caption.jpg";

export const ENGINE6_KEY_WEST_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/fb/bc/d8.jpg";

export const ENGINE6_ORLANDO_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/ad/2c/65.jpg";

export const ENGINE6_FORT_LAUDERDALE_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg";

export const ENGINE6_NAPLES_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/17/11/f3/09.jpg";

export const ENGINE6_HONOLULU_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/08/6c/5d/e9.jpg";

export const ENGINE6_MAUI_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/09/5b/de/c9.jpg";

export const ENGINE6_KAUAI_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/2c/e4/71.jpg";

export const ENGINE6_KONA_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/13/18/96/9c.jpg";

export const ENGINE6_HAWAII_VOLCANOES_CANONICAL_CITY_HERO_URL =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/12/54/58.jpg";

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
    sedona: ENGINE6_SEDONA_CANONICAL_CITY_HERO_URL,
  },
  wyoming: {
    "yellowstone-national-park": ENGINE6_YELLOWSTONE_CANONICAL_CITY_HERO_URL,
  },
  utah: {
    "zion-national-park": ENGINE6_ZION_CANONICAL_CITY_HERO_URL,
    "bryce-canyon-national-park": ENGINE6_BRYCE_CANYON_CANONICAL_CITY_HERO_URL,
    "arches-national-park": ENGINE6_ARCHES_CANONICAL_CITY_HERO_URL,
    "canyonlands-national-park": ENGINE6_CANYONLANDS_CANONICAL_CITY_HERO_URL,
    moab: ENGINE6_MOAB_CANONICAL_CITY_HERO_URL,
  },
  washington: {
    "olympic-national-park": ENGINE6_OLYMPIC_CANONICAL_CITY_HERO_URL,
  },
  montana: {
    "glacier-national-park": ENGINE6_GLACIER_CANONICAL_CITY_HERO_URL,
  },
  maine: {
    "acadia-national-park": ENGINE6_ACADIA_CANONICAL_CITY_HERO_URL,
  },
  tennessee: {
    "great-smoky-mountains-national-park": ENGINE6_GSM_CANONICAL_CITY_HERO_URL,
  },
  illinois: {
    chicago: ENGINE6_CHICAGO_CANONICAL_CITY_HERO_URL,
  },
  "united-kingdom": {
    london: ENGINE6_LONDON_CANONICAL_CITY_HERO_URL,
  },
  scotland: {
    edinburgh: ENGINE6_EDINBURGH_CANONICAL_CITY_HERO_URL,
  },
  mexico: {
    "mexico-city": ENGINE6_MEXICO_CITY_CANONICAL_CITY_HERO_URL,
    cancun: ENGINE6_CANCUN_CANONICAL_CITY_HERO_URL,
    "puerto-vallarta": ENGINE6_PUERTO_VALLARTA_CANONICAL_CITY_HERO_URL,
    "cabo-san-lucas": ENGINE6_CABO_SAN_LUCAS_CANONICAL_CITY_HERO_URL,
  },
  peru: {
    cusco: ENGINE6_CUSCO_CANONICAL_CITY_HERO_URL,
    lima: ENGINE6_LIMA_CANONICAL_CITY_HERO_URL,
  },
  brazil: {
    "rio-de-janeiro": ENGINE6_RIO_DE_JANEIRO_CANONICAL_CITY_HERO_URL,
  },
  japan: {
    tokyo: ENGINE6_TOKYO_CANONICAL_CITY_HERO_URL,
    kyoto: ENGINE6_KYOTO_CANONICAL_CITY_HERO_URL,
  },
  thailand: {
    bangkok: ENGINE6_BANGKOK_CANONICAL_CITY_HERO_URL,
  },
  singapore: {
    singapore: ENGINE6_SINGAPORE_CANONICAL_CITY_HERO_URL,
  },
  indonesia: {
    bali: ENGINE6_BALI_CANONICAL_CITY_HERO_URL,
  },
  france: {
    paris: ENGINE6_PARIS_CANONICAL_CITY_HERO_URL,
  },
  spain: {
    barcelona: ENGINE6_BARCELONA_CANONICAL_CITY_HERO_URL,
  },
  italy: {
    rome: ENGINE6_ROME_CANONICAL_CITY_HERO_URL,
    venice: ENGINE6_VENICE_CANONICAL_CITY_HERO_URL,
  },
  netherlands: {
    amsterdam: ENGINE6_AMSTERDAM_CANONICAL_CITY_HERO_URL,
  },
  ireland: {
    dublin: ENGINE6_DUBLIN_CANONICAL_CITY_HERO_URL,
  },
  massachusetts: {
    boston: ENGINE6_BOSTON_CANONICAL_CITY_HERO_URL,
  },
  pennsylvania: {
    philadelphia: ENGINE6_PHILADELPHIA_CANONICAL_CITY_HERO_URL,
  },
  colorado: {
    "rocky-mountain-national-park": ENGINE6_RMNP_CANONICAL_CITY_HERO_URL,
    denver: ENGINE6_DENVER_CANONICAL_CITY_HERO_URL,
    aspen: ENGINE6_ASPEN_CANONICAL_CITY_HERO_URL,
    boulder: ENGINE6_BOULDER_CANONICAL_CITY_HERO_URL,
  },
  texas: {
    austin: ENGINE6_AUSTIN_CANONICAL_CITY_HERO_URL,
    houston: ENGINE6_HOUSTON_CANONICAL_CITY_HERO_URL,
  },
  florida: {
    orlando: ENGINE6_ORLANDO_CANONICAL_CITY_HERO_URL,
    "fort-lauderdale": ENGINE6_FORT_LAUDERDALE_CANONICAL_CITY_HERO_URL,
    naples: ENGINE6_NAPLES_CANONICAL_CITY_HERO_URL,
    "key-west": ENGINE6_KEY_WEST_CANONICAL_CITY_HERO_URL,
  },
  hawaii: {
    honolulu: ENGINE6_HONOLULU_CANONICAL_CITY_HERO_URL,
    maui: ENGINE6_MAUI_CANONICAL_CITY_HERO_URL,
    kauai: ENGINE6_KAUAI_CANONICAL_CITY_HERO_URL,
    kona: ENGINE6_KONA_CANONICAL_CITY_HERO_URL,
    "hawaii-volcanoes-national-park":
      ENGINE6_HAWAII_VOLCANOES_CANONICAL_CITY_HERO_URL,
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
