import type { Engine2Tour } from "../../engine2/data/loadEngine2";
import { getAlaskaFareHarborRecord } from "../../engine2/data/alaskaFareHarborContent";
import type { AOAEnrichedTourContent } from "./transformFareHarborToAOAContent";

const productIdForTour = (tour: Engine2Tour) => {
  const explicit = tour.id.replace(/^alaska-/, "").trim();
  if (/^\d+$/.test(explicit)) return explicit;

  const routeMatch = tour.seo.canonicalPath.match(/-(\d+)\/?$/);
  return routeMatch?.[1] ?? "";
};

export const isAlaskaEngine2Tour = (tour: Engine2Tour) =>
  tour.sourceDatasetKey === "alaska" ||
  /\/destinations\/united-states\/alaska\//.test(tour.seo.canonicalPath);

export const getAlaskaFareHarborContent = (
  tour: Engine2Tour
): AOAEnrichedTourContent | null => {
  if (!isAlaskaEngine2Tour(tour)) return null;

  const productId = productIdForTour(tour);
  if (!productId) return null;

  const source = getAlaskaFareHarborRecord(productId);
  if (!source) return null;

  const minimumDetails = [
    source.minimumAge ? `Minimum age: ${source.minimumAge}` : "",
    source.maxGroupSize ? `Maximum group size: ${source.maxGroupSize}` : "",
  ].filter(Boolean);

  const requirements = Array.from(
    new Set([...minimumDetails, ...(source.requirements ?? [])])
  );
  const pickup =
    source.pickup && source.pickup !== "unknown" ? source.pickup : undefined;

  return {
    quickFacts: {
      duration: source.duration,
      startLocationArea: source.meetingLocation,
      pickup,
      difficulty: source.difficulty,
      ageOrMinimumRequirements: source.minimumAge
        ? `Minimum age: ${source.minimumAge}`
        : requirements.find(item => /age|minimum|child|height|weight/i.test(item)),
    },
    itineraryOutline: source.itinerary,
    included: source.included,
    notIncluded: source.notIncluded,
    rulesAndRequirements: requirements,
    cancellationSummary: source.cancellation,
    faq: source.faq,
  };
};
