import type { Engine4TourViewModel } from "../../engine4/types";
import type { Tour } from "../../data/tours.types";
import type { Engine5NormalizedTour, Engine5ProductRecord } from "../types";
import { getEngine5ViatorTourData } from "./getEngine5ViatorTourData";
import { mapViatorToEngine5Tour } from "./mapViatorToEngine5Tour";

export const resolveEngine5Tour = async (
  record: Engine5ProductRecord
): Promise<{
  tour: Engine4TourViewModel;
  normalized: Engine5NormalizedTour;
  listing: Tour;
}> => {
  const apiTour = await getEngine5ViatorTourData(record.productCode);
  const mapped = mapViatorToEngine5Tour(record, apiTour);

  const tour: Engine4TourViewModel = {
    ...mapped.page,
    facts: {
      ...mapped.page.facts,
      priceFrom: apiTour.fromPrice,
      meetingPointFull: apiTour.meetingPoint,
      meetingPointShort: apiTour.meetingPoint?.split(",")[0],
      duration: apiTour.duration,
    },
    content: {
      ...mapped.page.content,
      itinerary: apiTour.itinerary,
      faqs: apiTour.faqs,
    },
  };

  return {
    tour,
    normalized: mapped.normalized,
    listing: mapped.listing,
  };
};
