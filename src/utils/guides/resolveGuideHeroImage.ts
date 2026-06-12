import { getCityBySlugs, getStateBySlug } from "../../data/destinations";
import { getToursByCity, getToursByState } from "../../data/tours";
import type { Tour } from "../../data/tours.types";
import {
  HOME_HERO_IMAGE,
  isActivityDefaultImage,
  isGenericHeroFallbackImage,
  normalizeHeroImage,
  resolveTourHeroImage,
} from "../hero";
import type { GuidePageData } from "../loadGuide";

export type ResolvedGuideHeroImage = {
  image: string;
  alt: string;
  source:
    | "dedicated"
    | "destination"
    | "city-tour"
    | "state-tour"
    | "state"
    | "generic";
};

export const GENERIC_OUTDOOR_GUIDE_HERO_IMAGE = "/images/hiking-hero.jpg";

const VALID_LOCAL_GUIDE_IMAGE_PATHS = new Set([
  GENERIC_OUTDOOR_GUIDE_HERO_IMAGE,
  "/images/hiking-hero2.jpg",
  "/images/hiking-hero3.jpg",
  "/images/cycling-hero.jpg",
  "/images/canoe-hero.jpg",
  "/images/arizona/arizona-hero.jpg",
  "/images/california/california-hero.jpg",
  "/images/colorado-hero.jpg",
  "/images/connecticut.webp",
  "/images/montana-hero.jpg",
  "/images/nevada/nevada-hero.png",
  "/images/utah/utah-hero.webp",
  "/images/washington/washington-hero.jpg",
  "/images/washington/Seattle.jpg",
  "/images/bozeman.jpg",
  "/images/whitefish.jpg",
  "/images/jerry-sybers.jpg",
]);

const INVALID_IMAGE_PATTERNS = [
  "placeholder",
  "no-image",
  "default-image",
  "default-tour.jpg",
  "example.com",
  "logo.svg",
];

export const isValidGuideHeroImage = (image?: string | null) => {
  const normalized = normalizeHeroImage(image);
  if (!normalized) {
    return false;
  }

  const lowered = normalized.toLowerCase();
  if (
    normalized === HOME_HERO_IMAGE ||
    lowered.endsWith("/hero.jpg") ||
    lowered === "hero.jpg" ||
    isGenericHeroFallbackImage(normalized) ||
    isActivityDefaultImage(normalized) ||
    INVALID_IMAGE_PATTERNS.some(pattern => lowered.includes(pattern))
  ) {
    return false;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return true;
  }

  if (normalized.startsWith("/")) {
    return VALID_LOCAL_GUIDE_IMAGE_PATHS.has(normalized);
  }

  return false;
};

const scoreTour = (tour: Tour) => ({
  rating: tour.badges.rating ?? 0,
  reviewCount: tour.badges.reviewCount ?? 0,
});

const compareToursForGuideHero = (a: Tour, b: Tour) => {
  const aScore = scoreTour(a);
  const bScore = scoreTour(b);

  if (bScore.rating !== aScore.rating) {
    return bScore.rating - aScore.rating;
  }

  if (bScore.reviewCount !== aScore.reviewCount) {
    return bScore.reviewCount - aScore.reviewCount;
  }

  return a.id.localeCompare(b.id);
};

const resolveTourImage = (tour: Tour) => {
  const image = resolveTourHeroImage(tour);
  return isValidGuideHeroImage(image) ? image : undefined;
};

const selectBestTourHero = (tours: Tour[]) => {
  const rankedTours = [...tours]
    .filter(tour => Boolean(resolveTourImage(tour)))
    .sort(compareToursForGuideHero);
  const selected = rankedTours[0];

  if (!selected) {
    return null;
  }

  const image = resolveTourImage(selected);
  return image
    ? {
        image,
        tour: selected,
      }
    : null;
};

export const selectGuideHeroFromTours = ({
  stateSlug,
  citySlug,
  includeStateTours = false,
}: {
  stateSlug: string;
  citySlug?: string;
  includeStateTours?: boolean;
}) => {
  const cityTourSelection = citySlug
    ? selectBestTourHero(getToursByCity(stateSlug, citySlug))
    : null;

  if (cityTourSelection) {
    return { ...cityTourSelection, source: "city-tour" as const };
  }

  if (!includeStateTours) {
    return null;
  }

  const stateTourSelection = selectBestTourHero(getToursByState(stateSlug));
  return stateTourSelection
    ? { ...stateTourSelection, source: "state-tour" as const }
    : null;
};

export const resolveGuideHeroImage = (
  guide: GuidePageData
): ResolvedGuideHeroImage => {
  const place = guide.city ?? guide.state;
  const dedicatedImage = normalizeHeroImage(guide.hero.image);

  if (isValidGuideHeroImage(dedicatedImage)) {
    return {
      image: dedicatedImage,
      alt: guide.hero.alt || `${place} outdoor adventure guide`,
      source: "dedicated",
    };
  }

  const city = guide.tours.citySlug
    ? getCityBySlugs(guide.tours.stateSlug, guide.tours.citySlug)
    : null;
  const destinationImage = city?.heroImages.find(isValidGuideHeroImage);

  if (destinationImage) {
    return {
      image: destinationImage,
      alt: `${city?.name ?? place}, ${guide.state} outdoor adventure scenery`,
      source: "destination",
    };
  }

  const cityTourSelection = selectGuideHeroFromTours({
    stateSlug: guide.tours.stateSlug,
    citySlug: guide.tours.citySlug,
  });

  if (cityTourSelection) {
    return {
      image: cityTourSelection.image,
      alt: `${place}, ${guide.state} — ${cityTourSelection.tour.title}`,
      source: "city-tour",
    };
  }

  const state = getStateBySlug(guide.tours.stateSlug);
  if (isValidGuideHeroImage(state?.heroImage)) {
    return {
      image: state!.heroImage,
      alt: `${guide.state} outdoor adventure scenery`,
      source: "state",
    };
  }

  const stateTourSelection = selectGuideHeroFromTours({
    stateSlug: guide.tours.stateSlug,
    includeStateTours: true,
  });

  if (stateTourSelection) {
    return {
      image: stateTourSelection.image,
      alt: `${guide.state} — ${stateTourSelection.tour.title}`,
      source: "state-tour",
    };
  }

  return {
    image: GENERIC_OUTDOOR_GUIDE_HERO_IMAGE,
    alt: `${place} outdoor adventure scenery`,
    source: "generic",
  };
};
