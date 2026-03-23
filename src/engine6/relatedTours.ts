import type { Tour } from "../data/tours.types";
import { slugify } from "../utils/slugify";

import { engine6ListingTours } from "./listing";
import { getEngine6RouteSpecByProductCode } from "./routes";
import type { Engine6Tour } from "./types";

const hasUsableHeroImage = (tour: Tour) =>
  Boolean(tour.primaryImageUrl?.trim() || tour.heroImage?.trim());

export const getEngine6RelatedTours = (
  currentTour: Engine6Tour,
  options?: { maxCount?: number }
): Tour[] => getEngine6RelatedToursResult(currentTour, options).tours;

export const getEngine6RelatedToursResult = (
  currentTour: Engine6Tour,
  options?: { maxCount?: number }
) => {
  const routeSpec = getEngine6RouteSpecByProductCode(currentTour.productCode);
  const citySlug = routeSpec?.citySlug ?? slugify(currentTour.city);
  const stateSlug = routeSpec?.stateSlug ?? slugify(currentTour.state);
  const maxCount = options?.maxCount ?? 8;

  const engine6Candidates = engine6ListingTours.filter(
    tour => tour.engine === "engine6"
  );
  const sameCityCandidates = engine6Candidates.filter(
    tour =>
      tour.destination.citySlug === citySlug &&
      tour.destination.stateSlug === stateSlug
  );
  const sameStateCandidates = engine6Candidates.filter(
    tour => tour.destination.stateSlug === stateSlug
  );
  const sameCitySiblings = sameCityCandidates.filter(
    tour => tour.productCode !== currentTour.productCode
  );
  const finalTours = sameCitySiblings
    .sort((left, right) => {
      const leftHeroScore = hasUsableHeroImage(left) ? 1 : 0;
      const rightHeroScore = hasUsableHeroImage(right) ? 1 : 0;
      if (rightHeroScore !== leftHeroScore) {
        return rightHeroScore - leftHeroScore;
      }

      const leftReviewCount = left.badges.reviewCount ?? 0;
      const rightReviewCount = right.badges.reviewCount ?? 0;
      if (rightReviewCount !== leftReviewCount) {
        return rightReviewCount - leftReviewCount;
      }

      const leftRating = left.badges.rating ?? 0;
      const rightRating = right.badges.rating ?? 0;
      if (rightRating !== leftRating) {
        return rightRating - leftRating;
      }

      return left.title.localeCompare(right.title);
    })
    .slice(0, maxCount);

  return {
    tours: finalTours,
    debug: {
      templatePath: "Engine6ProductRoute>Engine6TourPage",
      sourceCollection: "engine6ListingTours",
      currentTourSlug:
        currentTour.pagePath.split("/").filter(Boolean).pop() ?? currentTour.pagePath,
      currentCitySlug: citySlug,
      currentStateSlug: stateSlug,
      siblingCandidateCountBeforeFiltering: sameCityCandidates.length,
      sameStateCandidateCount: sameStateCandidates.length,
      siblingCountAfterExcludingCurrent: sameCitySiblings.length,
      finalCardProductCodes: finalTours.map(tour => tour.productCode ?? tour.id),
      finalCardCount: finalTours.length,
    },
  };
};
