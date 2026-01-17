import type { Tour } from "./tours.types";
import {
  flagstaffTours,
  getFlagstaffTourBookingPath,
  getFlagstaffTourBySlug,
  getFlagstaffTourDetailPath,
  getFlagstaffTourSlug,
} from "./flagstaffTours";
import {
  getSedonaTourBookingPath,
  getSedonaTourBySlug,
  getSedonaTourDetailPath,
  getSedonaTourSlug,
  sedonaTours,
} from "./sedonaTours";

type CityTourConfig = {
  stateSlug: string;
  citySlug: string;
  tours: Tour[];
  getTourBySlug: (slug: string) => Tour | undefined;
  getTourSlug: (tour: Tour) => string;
  getTourDetailPath: (tour: Tour) => string;
  getTourBookingPath: (tour: Tour) => string;
};

const CITY_TOUR_REGISTRY: Record<string, CityTourConfig> = {
  flagstaff: {
    stateSlug: "arizona",
    citySlug: "flagstaff",
    tours: flagstaffTours,
    getTourBySlug: getFlagstaffTourBySlug,
    getTourSlug: getFlagstaffTourSlug,
    getTourDetailPath: getFlagstaffTourDetailPath,
    getTourBookingPath: getFlagstaffTourBookingPath,
  },
  sedona: {
    stateSlug: "arizona",
    citySlug: "sedona",
    tours: sedonaTours,
    getTourBySlug: getSedonaTourBySlug,
    getTourSlug: getSedonaTourSlug,
    getTourDetailPath: getSedonaTourDetailPath,
    getTourBookingPath: getSedonaTourBookingPath,
  },
};

export const getCityTourConfig = (citySlug: string) =>
  CITY_TOUR_REGISTRY[citySlug];
