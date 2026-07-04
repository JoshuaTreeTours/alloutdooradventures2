import type { Engine6Tour } from "./types.js";

export type Engine6DestinationValidationCohort = {
  label: string;
  matches: (tour: Engine6Tour) => boolean;
  /** When set, every listing-card hero in the cohort must be unique. */
  requireUniqueListingHeroes?: boolean;
};

export const ENGINE6_DESTINATION_VALIDATION_COHORTS: Engine6DestinationValidationCohort[] =
  [
    {
      label: "Monterey",
      matches: tour =>
        /\/monterey\//i.test(tour.canonicalPath) ||
        /\bmonterey\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Napa",
      matches: tour =>
        /\/napa\//i.test(tour.canonicalPath) || /\bnapa\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Lake Tahoe",
      matches: tour =>
        /\/lake-tahoe\//i.test(tour.canonicalPath) ||
        /\blake tahoe\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Yosemite",
      matches: tour =>
        /\/yosemite\//i.test(tour.canonicalPath) ||
        /\byosemite\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Grand Canyon",
      matches: tour =>
        /\/grand-canyon-national-park\//i.test(tour.canonicalPath) ||
        /\bgrand canyon\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Yellowstone",
      matches: tour =>
        /\/yellowstone-national-park\//i.test(tour.canonicalPath) ||
        /\byellowstone\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Zion",
      matches: tour =>
        /\/zion-national-park\//i.test(tour.canonicalPath) ||
        /\bzion\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Glacier",
      matches: tour =>
        /\/glacier-national-park\//i.test(tour.canonicalPath) ||
        /\bglacier\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Great Smoky Mountains",
      matches: tour =>
        /\/great-smoky-mountains-national-park\//i.test(tour.canonicalPath) ||
        /\bgreat smoky\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Sedona",
      matches: tour =>
        /\/sedona\//i.test(tour.canonicalPath) || /\bsedona\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Washington, D.C.",
      matches: tour =>
        /\/district-of-columbia\/washington\//i.test(tour.canonicalPath) ||
        (/\bwashington\b/i.test(tour.city) &&
          /\bdistrict of columbia\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Chicago",
      matches: tour =>
        /\/illinois\/chicago\//i.test(tour.canonicalPath) ||
        (/\bchicago\b/i.test(tour.city) && /\billinois\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Boston",
      matches: tour =>
        /\/massachusetts\/boston\//i.test(tour.canonicalPath) ||
        (/\bboston\b/i.test(tour.city) && /\bmassachusetts\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Philadelphia",
      matches: tour =>
        /\/pennsylvania\/philadelphia\//i.test(tour.canonicalPath) ||
        (/\bphiladelphia\b/i.test(tour.city) &&
          /\bpennsylvania\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Napa editorial narrative",
      matches: tour =>
        /\/napa\//i.test(tour.canonicalPath) || /\bnapa\b/i.test(tour.city),
    },
    {
      label: "Monterey editorial narrative",
      matches: tour =>
        /\/monterey\//i.test(tour.canonicalPath) ||
        /\bmonterey\b/i.test(tour.city),
    },
    {
      label: "Miami editorial narrative",
      matches: tour =>
        /\/miami\//i.test(tour.canonicalPath) || /\bmiami\b/i.test(tour.city),
    },
    {
      label: "New York editorial narrative",
      matches: tour =>
        /\/new-york\//i.test(tour.canonicalPath) ||
        /\bnew york\b/i.test(tour.city),
    },
  ];
