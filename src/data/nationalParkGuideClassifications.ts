import type { GuidePlaceClassification } from "./guidePlaceClassification";
import {
  NATIONAL_PARK_DESTINATIONS,
  getNationalParkDestination,
} from "./nationalParkDestinations";

export const NATIONAL_PARK_GUIDE_CLASSIFICATIONS = Object.fromEntries(
  NATIONAL_PARK_DESTINATIONS.map(park => [
    `us/${park.stateSlug}/${park.citySlug}`,
    {
      placeType: "national-park",
      verified: true,
      associatedProtectedArea: {
        name: park.name,
        type: "national-park",
        managingAuthority: "National Park Service",
      },
      verificationSources: [park.npsUrl],
      notes: `${park.name} is a federally managed National Park Service destination and must be represented as a national park rather than a city, neighborhood, or gateway community.`,
    } satisfies GuidePlaceClassification,
  ])
) as Record<string, GuidePlaceClassification>;

export const getNationalParkGuideClassification = (
  stateSlug: string,
  citySlug: string
): GuidePlaceClassification | undefined => {
  const park = getNationalParkDestination(stateSlug, citySlug);
  if (!park) return undefined;

  return NATIONAL_PARK_GUIDE_CLASSIFICATIONS[
    `us/${park.stateSlug}/${park.citySlug}`
  ];
};
