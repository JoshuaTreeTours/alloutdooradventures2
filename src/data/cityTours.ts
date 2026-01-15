export type CityTour = {
  slug: string;
  name: string;
  summary: string;
  duration: string;
  operator: string;
  itemId: string;
  highlights: string[];
};

const AFFILIATE_SHORT_NAME = "alloutdooradventures";

const tourSeeds: Array<Omit<CityTour, "name"> & { nameTemplate: string }> = [
  {
    slug: "sunrise-summit-hike",
    nameTemplate: "{city} Sunrise Summit Hike",
    summary:
      "Start early for the best light, with steady climbs and sweeping overlooks.",
    duration: "4 hours",
    operator: "red-jeep",
    itemId: "34849",
    highlights: [
      "Golden-hour summit views",
      "Small group pace",
      "Snacks + water included",
    ],
  },
  {
    slug: "canyon-scenic-drive",
    nameTemplate: "{city} Canyon Scenic Drive",
    summary:
      "Ride with a local guide to the best lookout points and photo stops.",
    duration: "3 hours",
    operator: "red-jeep",
    itemId: "44821",
    highlights: [
      "Multiple photo stops",
      "Local geology stories",
      "Easy access viewpoints",
    ],
  },
  {
    slug: "river-paddle-adventure",
    nameTemplate: "{city} River Paddle Adventure",
    summary:
      "Float calm stretches, spot wildlife, and cool off with a guide.",
    duration: "2.5 hours",
    operator: "red-jeep",
    itemId: "51207",
    highlights: [
      "All gear provided",
      "Beginner-friendly",
      "Wildlife spotting",
    ],
  },
  {
    slug: "sunset-wildlife-tour",
    nameTemplate: "{city} Sunset Wildlife Tour",
    summary:
      "Chase golden light with easy walks and a naturalist guide.",
    duration: "2 hours",
    operator: "red-jeep",
    itemId: "60412",
    highlights: [
      "Golden hour vistas",
      "Short easy walks",
      "Wildlife tracking tips",
    ],
  },
];

export const getCityTours = (cityName: string): CityTour[] =>
  tourSeeds.map((seed) => ({
    slug: seed.slug,
    name: seed.nameTemplate.replace("{city}", cityName),
    summary: seed.summary,
    duration: seed.duration,
    operator: seed.operator,
    itemId: seed.itemId,
    highlights: seed.highlights,
  }));

export const getTourBySlug = (cityName: string, slug: string) =>
  getCityTours(cityName).find((tour) => tour.slug === slug);

export const buildFareharborEmbedUrl = (tour: CityTour) =>
  `https://fareharbor.com/embeds/book/${tour.operator}/items/${tour.itemId}/?asn=${AFFILIATE_SHORT_NAME}&asn-ref=${AFFILIATE_SHORT_NAME}&ref=${AFFILIATE_SHORT_NAME}&full-items=yes&flow=no&branding=yes&bookable-only=yes`;
