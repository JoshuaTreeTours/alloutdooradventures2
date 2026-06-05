import { isExcludedProductCode } from "../../data/excludedProductCodes";
import {
  buildWebPageStructuredData,
  getSiteStructuredDataNodes,
} from "../../utils/structuredData";
import { buildEngine4TourPath } from "../buildEngine4TourPath";
import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "../data/viatorTours";
import type { Engine4TourViewModel } from "../types";
import { mapViatorToEngine4Tour } from "../viator/mapViatorToEngine4Tour";
import { buildEngine4ViatorSchemaGraph } from "./buildEngine4ViatorSchemaGraph";

export const getEngine4ViatorTourViewModelByPath = (
  pathname: string
): Engine4TourViewModel | null => {
  const record = engine4ViatorTours.find(
    tour =>
      buildEngine4TourPath(tour) === pathname &&
      !isExcludedProductCode(tour.productCode)
  );

  if (!record) {
    return null;
  }

  return mapViatorToEngine4Tour({
    record,
    apiTour: engine4ViatorApiFallbackByProductCode[record.productCode],
  });
};

export const buildEngine4ViatorStructuredDataNodesForPath = (
  pathname: string
) => {
  const tour = getEngine4ViatorTourViewModelByPath(pathname);

  if (!tour) {
    return null;
  }

  const schema = buildEngine4ViatorSchemaGraph(tour);
  const graph = schema["@graph"] as Array<Record<string, unknown>>;

  return [
    ...getSiteStructuredDataNodes(),
    buildWebPageStructuredData({
      url: tour.canonicalPath,
      name: tour.title,
      description: tour.content.overview,
      image: tour.primaryImage ?? tour.heroImage ?? undefined,
    }),
    ...graph,
  ];
};
