import { getTourBySlugs } from "../../data/tours";
import { buildHikeClimbTemplateModel } from "../tours/buildHikeClimbTemplateModel";
import { isJTreeHikeTemplate } from "../tours/isJTreeHikeTemplate";
import { fetchFareHarborHtml } from "./fetchFareHarborHtml";
import { parseFareHarborHtml } from "./parseFareHarborHtml";
import { resolveFareHarborUrlFromBookPage } from "./resolveFareHarborUrlFromBookPage";
import type { TourRewriteV3_1 } from "./transformToAOAContent";

export type Jt459591Override = TourRewriteV3_1 & {
  logistics: {
    duration?: string;
    meetingPoint?: string;
    age?: string;
    groupSize?: string;
    cancellation?: string;
  };
  itinerarySteps: string[];
};

export const getJoshuaTree459591Override = (
  canonicalPath: string
): Jt459591Override | null => {
  const slug = canonicalPath.split("/").pop();
  if (!isJTreeHikeTemplate({ slug })) {
    return null;
  }

  const tour = getTourBySlugs("california", "joshua-tree", "hike-and-climb-459591");
  if (!tour) {
    return null;
  }

  const fareHarborUrl = resolveFareHarborUrlFromBookPage(`${canonicalPath}/book`);
  const fareHarborHtml = fareHarborUrl ? fetchFareHarborHtml(fareHarborUrl) : null;
  const parsed = fareHarborHtml ? parseFareHarborHtml(fareHarborHtml) : null;
  const template = buildHikeClimbTemplateModel({
    tour,
    fareHarborItem: parsed,
  });

  return {
    heroPriceText: template.heroPriceText,
    schemaPrice: template.lowPrice,
    priceCurrency: "USD",
    pricing: {
      currency: "USD",
      low: template.lowPrice,
      high: template.highPrice,
      displayText: template.heroPriceText,
      isAggregate:
        typeof template.lowPrice === "number" &&
        typeof template.highPrice === "number" &&
        template.lowPrice !== template.highPrice,
    },
    durationLabel: template.durationLabel,
    durationISO: template.durationISO,
    meetingPoint: template.meetingPoint,
    whatYoullExperience: template.descriptionBlocks,
    highlights: template.highlights,
    itinerarySteps: template.itinerarySteps,
    faqs: template.faqs,
    schemaDescription: template.schemaDescription,
    logistics: {
      duration: template.durationLabel,
      meetingPoint: template.meetingPointLabel,
      age: template.ageLabel,
      groupSize: template.groupSizeLabel,
      cancellation: template.cancellationLabel,
    },
  };
};
