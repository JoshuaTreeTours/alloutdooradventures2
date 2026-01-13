export const PLACEHOLDER_IMAGE = "/images/placeholder.jpg";
export const SITE_HERO_IMAGE = "/images/hero.jpg";

export const STATE_IMAGES: Record<string, string> = {
  california: "/images/california/hero.jpg",
  arizona: "/images/arizona/hero.jpg",
  nevada: "/images/nevada/hero.jpg",
  utah: "/images/utah/hero.jpg",
  oregon: "/images/oregon/hero.jpg",
  washington: "/images/washington/hero.jpg",
};

export const CITY_IMAGES: Record<string, Record<string, string[]>> = {
  california: {
    "san-diego": [
      "/images/california/san-diego-1.jpg",
      "/images/california/san-diego-2.jpg",
      "/images/california/san-diego-3.jpg",
    ],
    "lake-tahoe": [
      "/images/california/lake-tahoe-1.jpg",
      "/images/california/lake-tahoe-2.jpg",
      "/images/california/lake-tahoe-3.jpg",
    ],
    "joshua-tree": [
      "/images/california/joshua-tree-1.jpg",
      "/images/california/joshua-tree-2.jpg",
      "/images/california/joshua-tree-3.jpg",
    ],
    "san-francisco": [
      "/images/california/san-francisco-1.jpg",
      "/images/california/san-francisco-2.jpg",
      "/images/california/san-francisco-3.jpg",
    ],
    "los-angeles": [
      "/images/california/los-angeles-1.jpg",
      "/images/california/los-angeles-2.jpg",
      "/images/california/los-angeles-3.jpg",
    ],
    "palm-springs": [
      "/images/california/palm-springs-1.jpg",
      "/images/california/palm-springs-2.jpg",
      "/images/california/palm-springs-3.jpg",
    ],
    yosemite: [
      "/images/california/yosemite-1.jpg",
      "/images/california/yosemite-2.jpg",
      "/images/california/yosemite-3.jpg",
    ],
    "big-sur": [
      "/images/california/big-sur-1.jpg",
      "/images/california/big-sur-2.jpg",
      "/images/california/big-sur-3.jpg",
    ],
    "mammoth-lakes": [
      "/images/california/mammoth-lakes-1.jpg",
      "/images/california/mammoth-lakes-1.jpg",
      "/images/california/mammoth-lakes-1.jpg",
    ],
  },
  arizona: {
    sedona: [
      "/images/arizona/sedona-1.jpg",
      "/images/arizona/sedona-2.jpg",
      "/images/arizona/sedona-3.jpg",
    ],
    flagstaff: [
      "/images/arizona/flagstaff-1.jpg",
      "/images/arizona/flagstaff-2.jpg",
      "/images/arizona/flagstaff-3.jpg",
    ],
    tucson: [
      "/images/arizona/tucson-1.jpg",
      "/images/arizona/tucson-2.jpg",
      "/images/arizona/tucson-3.jpg",
    ],
  },
  nevada: {
    reno: [
      "/images/nevada/reno-1.jpg",
      "/images/nevada/reno-2.jpg",
      "/images/nevada/reno-3.jpg",
    ],
    "las-vegas": [
      "/images/nevada/las-vegas-1.jpg",
      "/images/nevada/las-vegas-2.jpg",
      "/images/nevada/las-vegas-3.jpg",
    ],
    baker: [
      "/images/nevada/baker-1.jpg",
      "/images/nevada/baker-2.jpg",
      "/images/nevada/baker-3.jpg",
    ],
  },
  utah: {
    moab: [
      "/images/utah/moab-1.jpg",
      "/images/utah/moab-2.jpg",
      "/images/utah/moab-3.jpg",
    ],
    springdale: [
      "/images/utah/springdale-1.jpg",
      "/images/utah/springdale-2.jpg",
      "/images/utah/springdale-3.jpg",
    ],
    "park-city": [
      "/images/utah/park-city-1.jpg",
      "/images/utah/park-city-2.jpg",
      "/images/utah/park-city-3.jpg",
    ],
  },
  oregon: {
    portland: [
      "/images/oregon/portland-1.jpg",
      "/images/oregon/portland-2.jpg",
      "/images/oregon/portland-3.jpg",
    ],
    bend: [
      "/images/oregon/bend-1.jpg",
      "/images/oregon/bend-2.jpg",
      "/images/oregon/bend-3.jpg",
    ],
    "cannon-beach": [
      "/images/oregon/cannon-beach-1.jpg",
      "/images/oregon/cannon-beach-2.jpg",
      "/images/oregon/cannon-beach-3.jpg",
    ],
  },
  washington: {
    "olympic-peninsula": [
      "/images/washington/olympic-peninsula-1.jpg",
      "/images/washington/olympic-peninsula-2.jpg",
      "/images/washington/olympic-peninsula-3.jpg",
    ],
    leavenworth: [
      "/images/washington/leavenworth-1.jpg",
      "/images/washington/leavenworth-2.jpg",
      "/images/washington/leavenworth-3.jpg",
    ],
    seattle: [
      "/images/washington/seattle-1.jpg",
      "/images/washington/seattle-2.jpg",
      "/images/washington/seattle-3.jpg",
    ],
  },
};

const DEFAULT_CITY_IMAGES = [
  PLACEHOLDER_IMAGE,
  PLACEHOLDER_IMAGE,
  PLACEHOLDER_IMAGE,
];

export const getStateHeroImage = (stateSlug: string) =>
  STATE_IMAGES[stateSlug] ?? PLACEHOLDER_IMAGE;

export const getCityHeroImages = (stateSlug: string, citySlug: string) =>
  CITY_IMAGES[stateSlug]?.[citySlug] ?? DEFAULT_CITY_IMAGES;

export const getBackgroundImage = (imageUrl?: string) =>
  imageUrl
    ? `url(${imageUrl}), url(${PLACEHOLDER_IMAGE})`
    : `url(${PLACEHOLDER_IMAGE})`;
