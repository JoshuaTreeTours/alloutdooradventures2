import type { Tour } from "../../data/tours.types";
import { buildEngine5TourPath } from "../buildEngine5TourPath";
import {
  engine5ViatorApiFallbackByProductCode,
  engine5ViatorTours,
} from "../data/viatorTours";
import { mapViatorToEngine5Tour } from "../viator/mapViatorToEngine5Tour";

type Engine5ListingEntry = {
  tour: Tour;
  href: string;
};

export const getEngine5ListingEntries = (
  stateSlug: string,
  citySlug: string
): Engine5ListingEntry[] =>
  engine5ViatorTours
    .filter(
      tour =>
        tour.destination.stateSlug === stateSlug &&
        tour.destination.citySlug === citySlug
    )
    .map(record => {
      const mapped = mapViatorToEngine5Tour(
        record,
        engine5ViatorApiFallbackByProductCode[record.productCode]
      );

      return {
        href: buildEngine5TourPath(record),
        tour: mapped.listing,
      };
    });
