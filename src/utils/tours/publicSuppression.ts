import type { Tour } from "../../data/tours.types";
import { resolveTourHeroImage } from "../hero";

const HARD_SUPPRESSED_PRODUCT_IDS = new Set(["301378", "301379"]);
const INVALID_HERO_PATTERNS = ["placeholder", "no-image", "default-image"];

const getEngine1FareHarborItemId = (tour: Tour) => {
  if (tour.bookingProvider !== "fareharbor") {
    return null;
  }
  const match = tour.bookingUrl.match(/\/items\/(\d+)/);
  return match?.[1] ?? null;
};

export const getPublicSuppressionProductId = (tour: Tour) =>
  getEngine1FareHarborItemId(tour) ?? tour.id.replace(/^engine2-/, "");

export const isHardSuppressedProduct = (tour: Tour) =>
  HARD_SUPPRESSED_PRODUCT_IDS.has(getPublicSuppressionProductId(tour));

export const hasValidPublicCardHero = (tour: Tour) => {
  const hero = resolveTourHeroImage(tour)?.trim() ?? "";
  if (!hero) {
    return false;
  }
  const normalized = hero.toLowerCase();
  return !INVALID_HERO_PATTERNS.some(pattern => normalized.includes(pattern));
};

export const isPubliclyListableTour = (tour: Tour) =>
  !isHardSuppressedProduct(tour) && hasValidPublicCardHero(tour);
