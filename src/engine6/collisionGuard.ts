import { toursGenerated } from "../data/tours.generated";
import { manualTours } from "../data/tours.manual";
import { flagstaffTours } from "../data/flagstaffTours";
import { sedonaTours } from "../data/sedonaTours";
import { europeTours } from "../data/europeTours";
import { australiaTours } from "../data/australiaTours";
import { buildEngine4TourPath } from "../engine4/buildEngine4TourPath";
import { engine4ViatorTours } from "../engine4/data/viatorTours";
import {
  ENGINE6_EXPLICIT_ROUTE_REPLACEMENTS,
  engine6ReplacementModeConfigs,
} from "./routes";
import {
  evaluateEngine6ReplacementEligibility,
  type Engine6ReplacementModeConfig,
} from "./replacementMode";
import type { Engine6Tour } from "./types";

const legacyTourPath = (tour: {
  destination: { stateSlug: string; citySlug: string };
  slug: string;
}) =>
  `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`;

const LEGACY_TOUR_PATHS = new Set<string>([
  ...toursGenerated.map(legacyTourPath),
  ...manualTours.map(legacyTourPath),
  ...flagstaffTours.map(legacyTourPath),
  ...sedonaTours.map(legacyTourPath),
  ...europeTours.map(legacyTourPath),
  ...australiaTours.map(legacyTourPath),
]);

const LEGACY_FAREHARBOR_BOOK_PATHS = new Set<string>(
  [
    ...toursGenerated,
    ...manualTours,
    ...flagstaffTours,
    ...sedonaTours,
    ...europeTours,
    ...australiaTours,
  ]
    .filter(tour => tour.bookingProvider === "fareharbor")
    .map(tour => `${legacyTourPath(tour)}/book`)
);

const LEGACY_ENGINE4_PATHS = new Set<string>(
  engine4ViatorTours.map(record => buildEngine4TourPath(record))
);

export const detectEngine6LegacyCollisions = (tours: Engine6Tour[]) =>
  tours
    .map(tour => ({
      tour,
      collidesWithEngine4: LEGACY_ENGINE4_PATHS.has(tour.canonicalPath),
      collidesWithLegacyContent: LEGACY_TOUR_PATHS.has(tour.canonicalPath),
      explicitlyReplaced: ENGINE6_EXPLICIT_ROUTE_REPLACEMENTS.has(
        tour.canonicalPath
      ),
    }))
    .filter(entry => entry.collidesWithEngine4 || entry.collidesWithLegacyContent);

export const assertEngine6CollisionPolicy = (tours: Engine6Tour[]) => {
  const unmanagedCollisions = detectEngine6LegacyCollisions(tours).filter(
    entry => !entry.explicitlyReplaced
  );

  if (unmanagedCollisions.length > 0) {
    const details = unmanagedCollisions
      .map(
        entry =>
          `${entry.tour.productCode}:${entry.tour.canonicalPath} [engine4=${entry.collidesWithEngine4} legacy=${entry.collidesWithLegacyContent}]`
      )
      .join("; ");

    throw new Error(
      `Engine6 route collision detected without explicit replacement: ${details}`
    );
  }
};

export const assertEngine6ReplacementModePolicy = (
  tours: Engine6Tour[],
  replacementModeConfigs: Engine6ReplacementModeConfig[] = engine6ReplacementModeConfigs
) => {
  for (const config of replacementModeConfigs) {
    const matchingTour = tours.find(tour => tour.productCode === config.productCode);

    if (!matchingTour) {
      throw new Error(
        `Engine6 replacement mode misconfigured: missing Engine6 tour for product ${config.productCode}`
      );
    }


    const eligibility = evaluateEngine6ReplacementEligibility({
      title: matchingTour.title,
      priceAmount: matchingTour.priceAmount,
      meetingPointText: matchingTour.meetingPointText,
      config,
    });

    if (!eligibility.titlePassed || !eligibility.pricePassed || !eligibility.meetingPointPassed) {
      throw new Error(
        `Engine6 replacement mode eligibility failed for ${config.productCode}: title=${eligibility.titlePassed} price=${eligibility.pricePassed} meetingPoint=${eligibility.meetingPointPassed}`
      );
    }

    if (!LEGACY_TOUR_PATHS.has(config.canonicalPath)) {
      throw new Error(
        `Engine6 replacement mode requires a known legacy page, but none was found for ${config.canonicalPath}`
      );
    }

    if (!LEGACY_FAREHARBOR_BOOK_PATHS.has(config.bookingPath)) {
      throw new Error(
        `Engine6 replacement mode requires a known FareHarbor /book path, but none was found for ${config.bookingPath}`
      );
    }

    if (config.bookingPath !== `${config.canonicalPath}/book`) {
      throw new Error(
        `Engine6 replacement mode booking path must be canonicalPath + /book for ${config.productCode}`
      );
    }

    if (matchingTour.canonicalPath !== config.canonicalPath) {
      throw new Error(
        `Engine6 replacement mode changed public slug for ${config.productCode}: expected ${config.canonicalPath}, got ${matchingTour.canonicalPath}`
      );
    }

    if (matchingTour.bookingUrl !== config.bookingPath) {
      throw new Error(
        `Engine6 replacement mode changed /book path for ${config.productCode}: expected ${config.bookingPath}, got ${matchingTour.bookingUrl}`
      );
    }
  }
};
