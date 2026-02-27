import { getCityBySlugs, getStateBySlug } from "../../data/destinations";

const GENERIC_TOUR_PLACEHOLDER = "/images/california/cities/hero.jpg";

export function getDestinationFallbackImages(
  regionSlug: string,
  destinationSlug: string
): { hero: string; secondary: string } {
  const city = getCityBySlugs(regionSlug, destinationSlug);
  const state = getStateBySlug(regionSlug);

  const hero =
    city?.heroImages.find(Boolean) ??
    state?.heroImage ??
    GENERIC_TOUR_PLACEHOLDER;
  const secondary =
    city?.heroImages.find(image => image && image !== hero) ??
    state?.heroImage ??
    GENERIC_TOUR_PLACEHOLDER;

  return { hero, secondary };
}
