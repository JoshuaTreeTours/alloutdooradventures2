import { toursGenerated } from "../data/tours.generated";
import { manualTours } from "../data/tours.manual";
import { flagstaffTours } from "../data/flagstaffTours";
import { sedonaTours } from "../data/sedonaTours";
import { europeTours } from "../data/europeTours";
import { australiaTours } from "../data/australiaTours";
import { buildEngine4TourPath } from "../engine4/buildEngine4TourPath";
import { engine4ViatorTours } from "../engine4/data/viatorTours";
import { ENGINE6_EXPLICIT_ROUTE_REPLACEMENTS } from "./routes";
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
