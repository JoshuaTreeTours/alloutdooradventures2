import sanAndreasFault2335P1 from "./san-andreas-fault-2335P1.cache.json";
import {
  mapViatorToEngine3Model,
  type Engine3ViatorTour,
} from "../../utils/viator/mapViatorToEngine3Model";

export type Engine3TourRecord = {
  source: "viator";
  stateSlug: string;
  citySlug: string;
  tourSlug: string;
  viatorProductCode: string;
  bookingUrl: string;
  fallbackHeroImage: string;
  cachedSource: unknown;
  mapped: Engine3ViatorTour;
};

const SAN_ANDREAS_TOUR: Engine3TourRecord = {
  source: "viator",
  stateSlug: "california",
  citySlug: "palm-springs",
  tourSlug: "san-andreas-fault-jeep-tour-from-palm-springs-2335p1",
  viatorProductCode: "2335P1",
  bookingUrl:
    "https://www.viator.com/tours/Palm-Springs/San-Andreas-Fault-Jeep-Tour-from-Palm-Springs/d648-2335P1",
  fallbackHeroImage: "/images/california/california-hero.jpg",
  cachedSource: sanAndreasFault2335P1,
  mapped: mapViatorToEngine3Model(
    sanAndreasFault2335P1,
    "San Andreas Fault Jeep Tour from Palm Springs"
  ),
};

export const engine3ViatorTours: Engine3TourRecord[] = [SAN_ANDREAS_TOUR];

export const getEngine3ViatorTour = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string,
  viatorProductCode?: string
) =>
  engine3ViatorTours.find(
    tour =>
      tour.source === "viator" &&
      tour.stateSlug === stateSlug &&
      tour.citySlug === citySlug &&
      tour.tourSlug === tourSlug &&
      (!viatorProductCode ||
        tour.viatorProductCode.toLowerCase() === viatorProductCode.toLowerCase())
  );
