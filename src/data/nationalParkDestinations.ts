export type NationalParkDestination = {
  name: string;
  stateSlug: string;
  citySlug: string;
  npsUrl: string;
};

export const NATIONAL_PARK_DESTINATIONS = [
  { name: "Denali National Park and Preserve", stateSlug: "alaska", citySlug: "denali-national-park-and-preserve", npsUrl: "https://www.nps.gov/dena/" },
  { name: "Grand Canyon National Park", stateSlug: "arizona", citySlug: "grand-canyon-national-park", npsUrl: "https://www.nps.gov/grca/" },
  { name: "Yosemite National Park", stateSlug: "california", citySlug: "yosemite", npsUrl: "https://www.nps.gov/yose/" },
  { name: "Rocky Mountain National Park", stateSlug: "colorado", citySlug: "rocky-mountain-national-park", npsUrl: "https://www.nps.gov/romo/" },
  { name: "Hawaiʻi Volcanoes National Park", stateSlug: "hawaii", citySlug: "hawaii-volcanoes-national-park", npsUrl: "https://www.nps.gov/havo/" },
  { name: "Acadia National Park", stateSlug: "maine", citySlug: "acadia-national-park", npsUrl: "https://www.nps.gov/acad/" },
  { name: "Glacier National Park", stateSlug: "montana", citySlug: "glacier-national-park", npsUrl: "https://www.nps.gov/glac/" },
  { name: "Great Smoky Mountains National Park", stateSlug: "tennessee", citySlug: "great-smoky-mountains-national-park", npsUrl: "https://www.nps.gov/grsm/" },
  { name: "Arches National Park", stateSlug: "utah", citySlug: "arches-national-park", npsUrl: "https://www.nps.gov/arch/" },
  { name: "Bryce Canyon National Park", stateSlug: "utah", citySlug: "bryce-canyon-national-park", npsUrl: "https://www.nps.gov/brca/" },
  { name: "Canyonlands National Park", stateSlug: "utah", citySlug: "canyonlands-national-park", npsUrl: "https://www.nps.gov/cany/" },
  { name: "Zion National Park", stateSlug: "utah", citySlug: "zion-national-park", npsUrl: "https://www.nps.gov/zion/" },
  { name: "Olympic National Park", stateSlug: "washington", citySlug: "olympic-national-park", npsUrl: "https://www.nps.gov/olym/" },
  { name: "Yellowstone National Park", stateSlug: "wyoming", citySlug: "yellowstone-national-park", npsUrl: "https://www.nps.gov/yell/" },
] as const satisfies readonly NationalParkDestination[];

const nationalParkByRouteKey = new Map(
  NATIONAL_PARK_DESTINATIONS.map(park => [
    `${park.stateSlug}/${park.citySlug}`,
    park,
  ])
);

export const getNationalParkDestination = (
  stateSlug: string,
  citySlug: string
): NationalParkDestination | undefined =>
  nationalParkByRouteKey.get(`${stateSlug.trim().toLowerCase()}/${citySlug.trim().toLowerCase()}`);

export const getNationalParkDestinationsByState = (
  stateSlug: string
): NationalParkDestination[] =>
  NATIONAL_PARK_DESTINATIONS.filter(
    park => park.stateSlug === stateSlug.trim().toLowerCase()
  );

export const isNationalParkDestination = (stateSlug: string, citySlug: string) =>
  Boolean(getNationalParkDestination(stateSlug, citySlug));
