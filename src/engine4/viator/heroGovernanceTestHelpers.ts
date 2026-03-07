import { expect } from "vitest";

import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "../data/viatorTours";
import { getEngine4ListingEntries } from "../listing/getEngine4ListingEntries";
import { getEngine4TourBySlugs } from "../routing";
import { buildEngine4ViatorSchemaGraph } from "../schema/buildEngine4ViatorSchemaGraph";
import { mapViatorToEngine4Tour } from "./mapViatorToEngine4Tour";
import { resolveEngine4ViatorHeroWithDiagnostics } from "./resolveEngine4ViatorHero";

export const assertHeroConsistencyForProduct = (input: {
  productCode: string;
  stateSlug: string;
  citySlug: string;
  tourSlug: string;
  expectedHeroUrl: string;
}) => {
  const record = engine4ViatorTours.find(
    tour => tour.productCode === input.productCode
  );
  expect(record).toBeDefined();

  const pageTour = mapViatorToEngine4Tour({
    record: record!,
    apiTour: engine4ViatorApiFallbackByProductCode[input.productCode],
  });

  const listingTour = getEngine4ListingEntries(
    input.stateSlug,
    input.citySlug
  ).find(entry => entry.tour.productCode === input.productCode)?.tour;
  const routeTour = getEngine4TourBySlugs(
    input.stateSlug,
    input.citySlug,
    input.tourSlug
  );

  const schema = buildEngine4ViatorSchemaGraph(pageTour);
  const productNode = (schema["@graph"] as Array<Record<string, unknown>>).find(
    node => node["@type"] === "Product"
  ) as Record<string, unknown>;
  const touristTripNode = (
    schema["@graph"] as Array<Record<string, unknown>>
  ).find(node => node["@type"] === "TouristTrip") as Record<string, unknown>;

  expect(pageTour.heroImage).toBe(input.expectedHeroUrl);
  expect(pageTour.primaryImage).toBe(input.expectedHeroUrl);
  expect(listingTour?.heroImage).toBe(input.expectedHeroUrl);
  expect(listingTour?.primaryImageUrl).toBe(input.expectedHeroUrl);
  expect(routeTour?.seo.ogImage).toBe(input.expectedHeroUrl);
  expect(productNode.image).toBe(input.expectedHeroUrl);
  expect(touristTripNode.image).toBe(input.expectedHeroUrl);

  return pageTour;
};

export const assertHeroSelectionSource = (input: {
  productCode: string;
  expectedSource: "api" | "override" | "missing";
}) => {
  const diagnostics = resolveEngine4ViatorHeroWithDiagnostics({
    productCode: input.productCode,
    apiTour: engine4ViatorApiFallbackByProductCode[input.productCode],
  });

  expect(diagnostics.selectionSource).toBe(input.expectedSource);
  expect(diagnostics.productCode).toBe(input.productCode);

  return diagnostics;
};

export const assertContaminationRejected = (input: {
  productCode: string;
  apiTourProductCode: string;
}) => {
  const diagnostics = resolveEngine4ViatorHeroWithDiagnostics({
    productCode: input.productCode,
    apiTour: {
      productCode: input.apiTourProductCode,
      title: "Injected unrelated product",
      sourceUrl: "https://www.viator.com/tours/Other/Injected/d123-1111",
      primaryImageUrl:
        "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
    },
  });

  expect(diagnostics.contaminationBlocked).toBe(true);
  expect(diagnostics.selectionSource).toBe("missing");
  expect(diagnostics.finalSelectedHeroUrl).toBeUndefined();

  return diagnostics;
};
