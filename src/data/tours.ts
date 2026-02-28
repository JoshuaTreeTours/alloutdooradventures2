import type { BookingProvider, Tour } from "./tours.types";
import { flagstaffTours } from "./flagstaffTours";
import { sedonaTours } from "./sedonaTours";
import { manualTours } from "./tours.manual";
import { toursGenerated } from "./tours.generated";
import { europeTours } from "./europeTours";
import { australiaTours } from "./australiaTours";
import { applyTourPricing } from "./tourPricing";
import {
  getAllEngine2Tours,
  getEngine2ToursByStateSlug,
  getEngine2ToursBySourceCity,
  type Engine2Tour,
} from "../engine2/data/loadEngine2";
import {
  extractTourBaseDescription,
  normalizeDescriptionForDedupe,
} from "../utils/tourDescription";
import { slugify } from "../utils/slugify";
import { isTourRemoved } from "../utils/tours/isTourRemoved";
import { getEngine3ListingEntries } from "../engine3/listing/getEngine3ListingEntries";
export { getTourBookingPath } from "./tourPaths";

export { australiaTours } from "./australiaTours";

type ProviderConfig = {
  label: string;
  requiresDisclosure: boolean;
  affiliateDisclosure?: string;
};

const PROVIDER_CONFIG: Record<BookingProvider, ProviderConfig> = {
  fareharbor: {
    label: "FareHarbor",
    requiresDisclosure: true,
    affiliateDisclosure:
      "Affiliate disclosure: This booking link is an affiliate link. If you book, we may earn a commission at no extra cost to you.",
  },
  viator: {
    label: "Viator",
    requiresDisclosure: true,
    affiliateDisclosure:
      "Affiliate disclosure: We may receive a commission when you book through our Viator partner link.",
  },
};

// TODO: Remaining Montana tours in data/heartland/montana.csv not yet added.
// Bozeman: Death in Wonderland; Temple of Abyss; Dracula; KTM 350 XC-F; Honda CRF250F;
// Polaris RZR PRO XP4 Ultimate; Husqvarna 300; Honda Rancher 420 ATV Rental;
// Polaris Razor XP 4 1000 Rentals; Honda Pioneer 500 Rentals; Polaris RZR 900 Trail Ultimate Rentals;
// Honda Pioneer 1000 Rentals; Yamaha Kodiak 450; Polaris Sportsman 450;
// Arctic Cat Mountain Cat Snowmobile Rentals; Polaris Khaos 850; Lynx Turbo R Shredder (3900 Track);
// Lynx Turbo R Shredder (3700 Track); Ski Doo Summit 850 (154 Track);
// Ski Doo Summit 850 (165 Track); Ski Doo Grand Touring 550;
// Ski-Doo 600 Grand Touring ACE; Electric Golf Cart Rentals; Gas Golf Cart Rentals;
// Johnson Boats Outboard Motor Rentals; Seadoo Rentals; Smith River Fishing Package;
// Meadow Creek BBQ Trailer Rentals; Vertical Log Splitter Rentals; Large Champion 4500 Generator Rentals;
// Small Generator Rentals; 2-Place ATV Trailer Rentals; 2-Place Snowmobile Trailer;
// 4-Place Snowmobile Trailer Rentals; 24' Deck Over Tilt Trailer;
// 20' Deck Over Trailer Rentals; 18' Double Axel Trailer; 83x16 Utility Trailer Rentals;
// 77″ x 12′ Utility Trailer Rentals; Single Tube Rentals; Double Tube Rentals; Triple Tube Rentals;
// Quad Tube Rentals; 20' Car Hauler Trailer; Closed Cell Foldable Pad; The Lightkeeper's Secret;
// General Admission; Tent (2 Person) Rentals; REI Half Dome Plus backpack tent (4 person);
// REI Flexlite Macro Camping Chair Rentals; Folding Camping Chair Rentals; Canyon Cooler Rentals.
// Missoula: Polaris RZR XP 4 1000; 14' Utility Trailer; JAYCO JAY FLIGHT SLX 174BHW;
// 7'x16' Car Trailer; 7'x14' Utility Trailer; Ball Hitch; 1 Day Camping Rentals;
// 7'x18' Car Trailer; 8.5'x24' Deckover Equipment Trailer; 2 Day Camping Rentals;
// 4 Day Camping Rentals; 5 Day Camping Rentals; 6 Day Camping Rentals; 7 Day Camping Rentals;
// 2 Day Fishing Rentals; 3 Day Fishing Rentals; 4 Day Fishing Rentals; 5 Day Fishing Rentals;
// 6 Day Fishing Rentals; 7 Day Fishing Rentals; 3 Day Watersport Rentals; 4 Day Watersport Rentals;
// 5 Day Watersport Rentals; 6 Day Watersport Rentals; 7 Day Watersport Rentals;
// 1 Day Tool Rentals; 2 Day Tool Rentals; 3 Day Tool Rentals; 4 Day Tool Rentals;
// 5 Day Tool Rentals; 6 Day Tool Rentals; 7 Day Tool Rentals.
// Whitefish: Polaris Indy 650 (Single Rider).
// TODO: Remaining Colorado tours in data/heartland/colorado.csv not yet added.
// Denver: Explore the Museum on Your Own!; Field Trips at the Molly Brown House Museum;
// Private Denver Foothills Tour; Private Tour of Pike's Peak & Garden of the Gods;
// Denver History & Highlights; Denver Step on Guide Service; Denver Cocktails Tour;
// Hunk-O-Mania Male Revue Show - Denver; Classroom Programs; Denver Foothills Tour;
// Rocky Mountain National Park Tour; Guided Tours; Diva Royale - Drag Queen Show Denver;
// Denver Graffiti Original Tour; Clock Tower Self-Guided Tours; Boneless Bodies: Outreach Program;
// Private Mount Blue Sky & Red Rocks Tour; Denver City Private Driving Tour;
// Pikes Peak & Garden of the Gods Tour; Colorado: Gateway to the Rockies Driving Tour;
// Denver Graffiti Happy Hour Tour.
// Colorado Springs: Foothills and Garden of the Gods Jeep Tour; Holly Jolly Christmas Trolley;
// Garden of the Gods Segway Tour; 2.5-Hour Downtown Brewery & Bites Tour;
// Ski Shuttle to Breckenridge; Sunrise Hot Air Balloon Adventure;
// Pikes Peak and Garden of the Gods Jeep Tour; Cozy Coach Ride;
// Scenic Tour of the Pikes Peak Highway; Private Red Rocks Concert Transportation;
// South Platte Classic Climbs; Colorado Springs Regular Climb; Colorado Springs Full Day Climb;
// Denver/Golden Regular Climb; Red Rocks Amphitheatre Shuttle;
// Introduction to Rock Climbing/Gym To Crag Class; Boulder Half Day Climbs;
// Boulder Regular Day Climbs; Eldorado Canyon Classic Climbs; Flatiron Classic Climbs;
// Denver/Golden Half Day Climb; Clear Creek Classic Climbs; Garden of the Gods Classic Climbs;
// Cheyenne Canyon Classic Climbs; Grand Junction Half Day Climb; Grand Junction Regular Climb;
// Gunnison Half Day Climb; Gunnison Regular Climb; Gunnison Full Day Climb;
// San Juan Half Day Climb; Grand Junction Full Day Climb;
// Colorado National Monument Classic Climbs; Unaweep Canyon Classic Climbs;
// Lake City Classic Descents; Lake City Full Day Backcountry Ski/Splitboard Touring;
// Silverton Regular Day Ski/Splitboard Touring; Silverton Full Day Backcountry Ski/Splitboard Touring;
// Silverton Classic Backcountry Areas; Ouray Regular Day Ski/Splitboard touring;
// Rocky Mountain NP Regular Day Backcountry Skiing/Splitboarding;
// Rocky Mountain NP Full Day Backcountry Skiing/Splitboarding;
// Huerfano Valley Climbs (Blanca and Ellingwood); Denver/Golden Area Half Day Guided Ice Climbing;
// Denver/Golden Area Regular Day Guided Ice Climbing; Denver/Golden Area Full Day Guided Ice Climbing;
// Colorado Springs Area Half Day Guided Ice Climbing; Colorado Springs Regular Day Guided Ice Climbing;
// Colorado Springs Full Day Guided Ice Climbing; Lake City Half Day Guided Ice Climbing;
// Lake City Regular Day Guided Ice Climbing; Lake City Full Day Guided Ice Climbing;
// Silverton Half Day Guided Ice Climbing; Silverton Regular Day Guided Ice Climbing;
// Silverton Full Day Guided Ice Climbing; Telluride Half Day Guided Ice Climbing;
// Telluride Regular Day Guided Ice Climbing; Telluride Full Day Guided Ice Climbing;
// Silverton Classic Ice Climbs; Telluride Classic Ice Climbs; Lake City Classic Ice Climbs;
// Scenic Ride to the Shrine; Crack and Slab Technique Instruction;
// Introduction to Snow Climbing Skills; Crevasse Rescue and Glacier Travel;
// Expedition Preparation and Climbing Skills; Intro to Ice Climbing;
// Steep Ice and Mixed Technique; Learn to Lead Ice; Learn to Lead Traditional Climbs;
// Multipitch Skills and Self Rescue Skills; Big Wall and Aid Climbing Instruction;
// Denver/Golden Full Day Climb; Colorado Springs Half Day Climb; Black Canyon NP Classic Climbs;
// San Juan Regular Climb; San Juan Full Day Climb; Silverton Classic Climbs;
// Private Custom Avalanche Instructions; Boulder/ Estes Park Half Day Guided Ice Climbing;
// Boulder/Estes Park Regular Day Guided Ice Climbing; Boulder/Estes Park Full Day Guided Ice Climbing;
// Ouray Half Day Guided Ice Climbing; Ouray Regular Day Guided Ice Climbing;
// Ouray Full Day Guided Ice Climbing; Rocky Mountain National Park Classic Ice Climbs;
// Ouray Classic Ice Climbs; Denali National Park Ice Climbing; Moab: 1/2 Day Rock Climbing;
// Private Pikes Peak Highway Tour; Ski Shuttle to Keystone and Arapahoe Basin;
// Introduction to Alpine Climbing Skills; Multipitch and Backcountry Ice;
// Toprope and Anchor Building Class; Learn to Lead Sport Climb Outdoors;
// North Cascades Backcountry Skiing; Intro To Back Country Skiing and Splitboarding.
// Boulder: Private Rocky Mountain National Park Tour; Private Boulder Explorer Tour.
// Durango: River Walk + Picnic + SUP Package | 3 Hrs.; Snow Sled Rentals;
// Durango "Splash & Dash" Raft Trip; Scenic Waterfall Jeep Tour; Moab Daily Half-Day Trip;
// La Plata Canyon Half-Day Jeep Tour; Custom Safari Jeep Trail Tour ~ 5 Hours;
// Mesa Verde Express Tour with Cliff Palace Tickets; Day-long SUP Rental; Mid Week Flight;
// PRIVATE ~ Ultimate Mesa Verde Experience National Park Tour; Private Tour of Canyons of the Ancients;
// Sunset Flight; Durango Half-Day Raft Trip; Jeep Wrangler Rental Seats 5 (4 Door);
// Durango Snowdown Fight.

export const tours: Tour[] = [
  ...toursGenerated,
  ...manualTours,
  ...flagstaffTours,
  ...sedonaTours,
  ...europeTours,
  ...australiaTours,
]
  .filter(
    tour =>
      !isTourRemoved({
        tourId: getEngine1FareHarborItemId(tour),
        operatorName: tour.operator,
      })
  )
  .map(tour =>
    applyTourPricing({
      ...tour,
      destination: {
        ...tour.destination,
        country: tour.destination.country || "United States",
      },
    })
  );

const tourDescriptionCounts = tours.reduce<Map<string, number>>(
  (counts, tour) => {
    const key = normalizeDescriptionForDedupe(extractTourBaseDescription(tour));
    if (!key) {
      return counts;
    }
    counts.set(key, (counts.get(key) ?? 0) + 1);
    return counts;
  },
  new Map()
);

export const isTourDescriptionDuplicate = (tour: Tour) => {
  const key = normalizeDescriptionForDedupe(extractTourBaseDescription(tour));
  return key ? (tourDescriptionCounts.get(key) ?? 0) > 1 : false;
};

const getEngine2ToursForLocation = (stateSlug: string, citySlug?: string) => {
  const engine2Tours = citySlug
    ? getEngine2ToursByStateSlug(stateSlug, citySlug)
    : getEngine2ToursByStateSlug(stateSlug);

  return engine2Tours.map(toEngine2ListingTour);
};

const dedupeToursById = (entries: Tour[]) => {
  const byId = new Map<string, Tour>();
  for (const entry of entries) {
    byId.set(entry.id, entry);
  }
  return [...byId.values()];
};

export const getToursByState = (stateSlug: string) =>
  dedupeToursById([
    ...tours.filter(tour => tour.destination.stateSlug === stateSlug),
    ...getEngine2ToursForLocation(stateSlug),
  ]);

export const getToursByCity = (stateSlug: string, citySlug: string) =>
  dedupeToursById([
    ...tours.filter(
      tour =>
        tour.destination.stateSlug === stateSlug &&
        tour.destination.citySlug === citySlug
    ),
    ...getEngine2ToursForLocation(stateSlug, citySlug),
  ]);

export const getTourBySlugs = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string
) =>
  getToursByCity(stateSlug, citySlug).find(
    tour =>
      tour.destination.stateSlug === stateSlug &&
      tour.destination.citySlug === citySlug &&
      tour.slug === tourSlug
  );

export const getToursByActivity = (activitySlug: string) =>
  tours.filter(tour => {
    if (activitySlug === "hiking") {
      return tour.primaryCategory === "hiking";
    }

    return tour.activitySlugs.includes(activitySlug);
  });

export const getTourDetailPath = (tour: Tour) =>
  `/tours/${tour.destination.stateSlug}/${tour.destination.citySlug}/${tour.slug}`;

export const getCityTourDetailPath = (tour: Tour) =>
  `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`;

export type UnifiedCityTour = {
  tour: Tour;
  href: string;
};

function getEngine1FareHarborItemId(tour: Tour) {
  if (tour.bookingProvider !== "fareharbor") {
    return null;
  }

  const match = tour.bookingUrl.match(/\/items\/(\d+)/);
  return match?.[1] ?? null;
}

const toUnifiedEngine1Tour = (tour: Tour): UnifiedCityTour => ({
  tour,
  href: getCityTourDetailPath(tour),
});

const getEngine2StateSlug = (tour: Engine2Tour) => {
  const parts = tour.seo.canonicalPath.split("/").filter(Boolean);
  if (parts[0] !== "destinations") {
    return "california";
  }

  if (parts[1] === "world") {
    return slugify(tour.geo.region || "california");
  }

  if (parts[1] === "united-states") {
    return parts[2] || slugify(tour.geo.region || "california");
  }

  return parts[1] || slugify(tour.geo.region || "california");
};

const toEngine2ListingTour = (tour: Engine2Tour): Tour => ({
  id: `engine2-${tour.id}`,
  slug: tour.slug,
  title: tour.name,
  shortDescription: tour.content.highlights[0],
  operator: tour.provider.name,
  categories: ["adventure"],
  primaryCategory: "adventure",
  destination: {
    country: tour.geo.country || "United States",
    state: tour.geo.region,
    stateSlug: getEngine2StateSlug(tour),
    city: tour.geo.city,
    citySlug: tour.sourceCitySlug,
    lat: tour.geo.lat ?? undefined,
    lng: tour.geo.lng ?? undefined,
  },
  heroImage: tour.images.hero ?? "",
  galleryImages: tour.images.gallery,
  badges: {},
  activitySlugs: ["adventure"],
  bookingProvider: tour.bookingProvider ?? "fareharbor",
  bookingUrl: tour.booking.bookingUrl,
  longDescription: tour.content.experienceText,
});

const toUnifiedEngine2Tour = (tour: Engine2Tour): UnifiedCityTour => ({
  tour: toEngine2ListingTour(tour),
  href: tour.seo.canonicalPath,
});

const getDedupeKey = (entry: UnifiedCityTour) => {
  const itemId = getEngine1FareHarborItemId(entry.tour);

  if (!itemId) {
    return null;
  }

  return `${entry.tour.bookingProvider}:${itemId}`;
};

const scoreDedupeCandidate = (entry: UnifiedCityTour) =>
  entry.tour.id.startsWith("engine2-") ? 1 : 0;

const dedupeUnifiedCityTours = (entries: UnifiedCityTour[]) => {
  const deduped = new Map<string, UnifiedCityTour>();

  for (const entry of entries) {
    const key = getDedupeKey(entry);

    if (!key) {
      deduped.set(`${entry.href}::${entry.tour.id}`, entry);
      continue;
    }

    const existing = deduped.get(key);
    if (!existing) {
      deduped.set(key, entry);
      continue;
    }

    const existingScore = scoreDedupeCandidate(existing);
    const nextScore = scoreDedupeCandidate(entry);

    if (nextScore > existingScore) {
      deduped.set(key, entry);
      continue;
    }

    if (
      nextScore === existingScore &&
      entry.href.localeCompare(existing.href) < 0
    ) {
      deduped.set(key, entry);
    }
  }

  return [...deduped.values()].sort((a, b) => a.href.localeCompare(b.href));
};

export const getToursByCityUnified = (
  stateSlug: string,
  citySlug: string
): UnifiedCityTour[] => {
  const engine1Tours = getToursByCity(stateSlug, citySlug).map(
    toUnifiedEngine1Tour
  );

  if (stateSlug !== "california") {
    const engine2Tours = getEngine2ToursByStateSlug(stateSlug, citySlug).map(
      toUnifiedEngine2Tour
    );
    return dedupeUnifiedCityTours([...engine1Tours, ...engine2Tours]);
  }

  const engine2Tours =
    getEngine2ToursBySourceCity(citySlug).map(toUnifiedEngine2Tour);
  const engine3Tours = getEngine3ListingEntries(stateSlug, citySlug).map(
    entry => ({
      tour: entry.tour,
      href: entry.href,
    })
  );
  return dedupeUnifiedCityTours([
    ...engine1Tours,
    ...engine2Tours,
    ...engine3Tours,
  ]);
};

export const getAffiliateDisclosure = (tour: Tour) =>
  PROVIDER_CONFIG[tour.bookingProvider].affiliateDisclosure;

export const getProviderLabel = (provider: BookingProvider) =>
  PROVIDER_CONFIG[provider].label;
