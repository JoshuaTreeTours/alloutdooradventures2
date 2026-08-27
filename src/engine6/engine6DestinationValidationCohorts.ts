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
      label: "Bryce Canyon",
      matches: tour =>
        /\/bryce-canyon-national-park\//i.test(tour.canonicalPath) ||
        /\bbryce canyon\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Arches",
      matches: tour =>
        /\/arches-national-park\//i.test(tour.canonicalPath) ||
        /\barches national park\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Canyonlands",
      matches: tour =>
        /\/canyonlands-national-park\//i.test(tour.canonicalPath) ||
        /\bcanyonlands national park\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Acadia",
      matches: tour =>
        /\/acadia-national-park\//i.test(tour.canonicalPath) ||
        /\bacadia national park\b/i.test(tour.city),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Olympic",
      matches: tour =>
        /\/olympic-national-park\//i.test(tour.canonicalPath) ||
        /\bolympic national park\b/i.test(tour.city),
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
      label: "London",
      matches: tour =>
        /\/united-kingdom\/london\//i.test(tour.canonicalPath) ||
        (/\blondon\b/i.test(tour.city) &&
          /\bunited kingdom\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Edinburgh",
      matches: tour =>
        /\/united-kingdom\/edinburgh\//i.test(tour.canonicalPath) ||
        (/\bedinburgh\b/i.test(tour.city) &&
          /\bunited kingdom\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Paris",
      matches: tour =>
        /\/france\/paris\//i.test(tour.canonicalPath) ||
        (/\bparis\b/i.test(tour.city) && /\bfrance\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Barcelona",
      matches: tour =>
        /\/spain\/barcelona\//i.test(tour.canonicalPath) ||
        (/\bbarcelona\b/i.test(tour.city) && /\bspain\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Rome",
      matches: tour =>
        /\/italy\/rome\//i.test(tour.canonicalPath) ||
        (/\brome\b/i.test(tour.city) && /\bitaly\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Venice",
      matches: tour =>
        /\/italy\/venice\//i.test(tour.canonicalPath) ||
        (/\bvenice\b/i.test(tour.city) && /\bitaly\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Amsterdam",
      matches: tour =>
        /\/netherlands\/amsterdam\//i.test(tour.canonicalPath) ||
        (/\bamsterdam\b/i.test(tour.city) &&
          /\bnetherlands\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Dublin",
      matches: tour =>
        /\/ireland\/dublin\//i.test(tour.canonicalPath) ||
        (/\bdublin\b/i.test(tour.city) && /\bireland\b/i.test(tour.state)),
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
      label: "Jackson Hole",
      matches: tour =>
        /\/wyoming\/jackson\//i.test(tour.canonicalPath) ||
        (/\bjackson\b/i.test(tour.city) && /\bwyoming\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Rocky Mountain National Park",
      matches: tour =>
        /\/colorado\/rocky-mountain-national-park\//i.test(tour.canonicalPath) ||
        (/\brocky mountain national park\b/i.test(tour.city) &&
          /\bcolorado\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Denver",
      matches: tour =>
        /\/colorado\/denver\//i.test(tour.canonicalPath) ||
        (/\bdenver\b/i.test(tour.city) && /\bcolorado\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Aspen",
      matches: tour =>
        /\/colorado\/aspen\//i.test(tour.canonicalPath) ||
        (/\baspen\b/i.test(tour.city) && /\bcolorado\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Boulder",
      matches: tour =>
        /\/colorado\/boulder\//i.test(tour.canonicalPath) ||
        (/\bboulder\b/i.test(tour.city) && /\bcolorado\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Austin",
      matches: tour =>
        /\/texas\/austin\//i.test(tour.canonicalPath) ||
        (/\baustin\b/i.test(tour.city) && /\btexas\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Houston",
      matches: tour =>
        /\/texas\/houston\//i.test(tour.canonicalPath) ||
        (/\bhouston\b/i.test(tour.city) && /\btexas\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Moab",
      matches: tour =>
        /\/utah\/moab\//i.test(tour.canonicalPath) ||
        (/\bmoab\b/i.test(tour.city) && /\butah\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Key West",
      matches: tour =>
        /\/florida\/key-west\//i.test(tour.canonicalPath) ||
        (/\bkey west\b/i.test(tour.city) && /\bflorida\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Honolulu",
      matches: tour =>
        /\/hawaii\/honolulu\//i.test(tour.canonicalPath) ||
        (/\bhonolulu\b/i.test(tour.city) && /\bhawaii\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Maui",
      matches: tour =>
        /\/hawaii\/maui\//i.test(tour.canonicalPath) ||
        (/\bmaui\b/i.test(tour.city) && /\bhawaii\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Kauai",
      matches: tour =>
        /\/hawaii\/kauai\//i.test(tour.canonicalPath) ||
        (/\bkauai\b/i.test(tour.city) && /\bhawaii\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Kona",
      matches: tour =>
        /\/hawaii\/kona\//i.test(tour.canonicalPath) ||
        (/\bkona\b/i.test(tour.city) && /\bhawaii\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Hawaii Volcanoes National Park",
      matches: tour =>
        /\/hawaii\/hawaii-volcanoes-national-park\//i.test(tour.canonicalPath) ||
        (/\bhawaii volcanoes national park\b/i.test(tour.city) &&
          /\bhawaii\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Orlando",
      matches: tour =>
        /\/florida\/orlando\//i.test(tour.canonicalPath) ||
        (/\borlando\b/i.test(tour.city) && /\bflorida\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Fort Lauderdale",
      matches: tour =>
        /\/florida\/fort-lauderdale\//i.test(tour.canonicalPath) ||
        (/\bfort lauderdale\b/i.test(tour.city) && /\bflorida\b/i.test(tour.state)),
      requireUniqueListingHeroes: true,
    },
    {
      label: "Naples",
      matches: tour =>
        /\/florida\/naples\//i.test(tour.canonicalPath) ||
        (/\bnaples\b/i.test(tour.city) &&
          /\bflorida\b/i.test(tour.state) &&
          !/\bitaly\b/i.test(tour.state)),
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
