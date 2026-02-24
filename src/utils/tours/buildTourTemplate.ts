import { buildFirstPersonExperienceDescription } from "./buildFirstPersonExperienceDescription";
import { buildItinerarySteps } from "./buildItinerarySteps";
import { buildTourFaqs, type TourFaq } from "./buildTourFaqs";
import { dedupeHighlights } from "./dedupeHighlights";
import { getDisplayPriceLabel } from "./getDisplayPriceLabel";

export type TourTemplateModel = {
  displayPriceLabel: string | null;
  descriptionLong: string;
  highlights: string[];
  itinerarySteps: string[];
  faqs: TourFaq[];
  logistics: {
    durationLabel: string;
    meetingPointLabel: string;
    ageLabel: string;
    groupSizeLabel: string;
    cancellationLabel: string;
  };
};

export const buildTourTemplate = (input: {
  title: string;
  city: string;
  categories?: string[];
  highlights?: string[];
  duration?: string | null;
  meetingPoint?: string | null;
  age?: string | null;
  groupSize?: string | null;
  cancellation?: string | null;
  lowPrice?: number | string | null;
  price?: number | string | null;
}): TourTemplateModel => {
  const logistics = {
    durationLabel: input.duration?.trim() || "Check booking page",
    meetingPointLabel: input.meetingPoint?.trim() || "Check booking page",
    ageLabel: input.age?.trim() || "Check booking page",
    groupSizeLabel: input.groupSize?.trim() || "Check booking page",
    cancellationLabel: input.cancellation?.trim() || "Check booking page",
  };

  const highlights = dedupeHighlights(
    input.highlights?.length
      ? input.highlights
      : [
          `Guided ${input.title.toLowerCase()} in ${input.city}`,
          `Local interpretation and route guidance in Joshua Tree`,
          "Pacing adjusted to current conditions and group comfort",
          "Photo stops and scenic desert viewpoints",
        ]
  );

  return {
    displayPriceLabel: getDisplayPriceLabel({
      lowPrice: input.lowPrice,
      price: input.price,
    }),
    descriptionLong: buildFirstPersonExperienceDescription({
      title: input.title,
      city: input.city,
      duration: input.duration,
      categories: input.categories,
      highlights,
    }),
    highlights,
    itinerarySteps: buildItinerarySteps({
      title: input.title,
      city: input.city,
      duration: input.duration,
      highlights,
    }),
    faqs: buildTourFaqs({
      title: input.title,
      duration: input.duration,
      age: input.age,
      cancellation: input.cancellation,
    }),
    logistics,
  };
};

export const isJoshuaTreeTemplateRoute = (args: {
  citySlug?: string;
  canonicalPath?: string;
}) =>
  args.citySlug === "joshua-tree" ||
  (args.canonicalPath ?? "").startsWith(
    "/destinations/california/joshua-tree/tours/"
  );
