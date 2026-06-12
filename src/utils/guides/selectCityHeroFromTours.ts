import { getToursByCity } from "../../data/tours";
import type { Tour } from "../../data/tours.types";
import { resolveTourHeroImage } from "../hero";

export type SelectedCityHero = {
  imageUrl: string;
  alt: string;
};

const isPlaceholderImage = (value: string) => {
  const normalized = value.toLowerCase();
  return (
    normalized.includes("default-tour.jpg") ||
    normalized.endsWith("/hero.jpg") ||
    normalized === "/hero.jpg" ||
    normalized.endsWith("hero.jpg")
  );
};

const getValidTourImage = (tour: Tour) => {
  const image = resolveTourHeroImage(tour);
  return image && !isPlaceholderImage(image) ? image : undefined;
};

const hasValidImage = (tour: Tour) => Boolean(getValidTourImage(tour));

const isFeaturedTour = (tour: Tour) => {
  const values = [
    tour.slug,
    tour.title,
    ...(tour.tags ?? []),
    ...(tour.categories ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return values.includes("featured");
};

const scoreTour = (tour: Tour) => {
  const ratingCount = tour.badges.reviewCount ?? 0;
  const ratingValue = tour.badges.rating ?? 0;
  return { ratingCount, ratingValue };
};

export const selectCityHeroFromTours = (
  stateSlug: string,
  citySlug: string,
  city: string,
  state: string
): SelectedCityHero | null => {
  const tours = getToursByCity(stateSlug, citySlug).filter(hasValidImage);
  if (!tours.length) {
    return null;
  }

  const featured = tours.filter(isFeaturedTour);
  const ranked = (featured.length ? featured : tours).sort((a, b) => {
    const aScore = scoreTour(a);
    const bScore = scoreTour(b);
    if (bScore.ratingValue !== aScore.ratingValue) {
      return bScore.ratingValue - aScore.ratingValue;
    }
    if (bScore.ratingCount !== aScore.ratingCount) {
      return bScore.ratingCount - aScore.ratingCount;
    }
    return a.id.localeCompare(b.id);
  });

  const selected = ranked[0];
  return {
    imageUrl: getValidTourImage(selected)!,
    alt: `${city}, ${state} — ${selected.title}`,
  };
};
