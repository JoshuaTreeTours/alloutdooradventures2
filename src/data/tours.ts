import type { BookingProvider, Tour } from "./tours.types";
import { flagstaffTours } from "./flagstaffTours";
import { sedonaTours } from "./sedonaTours";
import { manualTours } from "./tours.manual";
import { toursGenerated } from "./tours.generated";
import { europeTours } from "./europeTours";
import { australiaTours } from "./australiaTours";
import { SANTA_BARBARA_TOURS } from "./locations/us/california/santa-barbara.tours";
import { applyTourPricing } from "./tourPricing";
import { fareharborTourContentByKey } from "./fareharborContent.generated";
import {
  extractTourBaseDescription,
  normalizeDescriptionForDedupe,
} from "../utils/tourDescription";
export { getTourBookingPath } from "./tourPaths";

export { australiaTours } from "./australiaTours";


const cleanText = (value?: string) => value?.replace(/\s+/g, " ").trim() || undefined;

const extractFareharborReference = (bookingUrl?: string) => {
  if (!bookingUrl) return null;
  try {
    const parsed = new URL(bookingUrl);
    const match =
      parsed.pathname.match(/\/embeds\/book\/([^/]+)\/items\/(\d+)/) ??
      parsed.pathname.match(/\/embeds\/calendar\/([^/]+)\/items\/(\d+)/);
    if (!match?.[1] || !match?.[2]) return null;
    return { companyShortname: match[1], itemId: match[2] };
  } catch {
    return null;
  }
};

const getFareharborCacheKey = (companyShortname: string, itemId: string) =>
  `${companyShortname}:${itemId}`;

const normalizeFareharborTourContent = (tour: Tour): Tour => {
  if (tour.bookingProvider !== "fareharbor") {
    return tour;
  }

  const reference = extractFareharborReference(tour.bookingUrl);
  const cacheKey = reference
    ? getFareharborCacheKey(reference.companyShortname, reference.itemId)
    : null;
  const cached = cacheKey ? fareharborTourContentByKey[cacheKey] : undefined;

  const heroImageUrl =
    cleanText(cached?.heroImageUrl) ?? cleanText(tour.heroImageUrl) ?? cleanText(tour.heroImage);
  const sourceDescription =
    cleanText(cached?.sourceDescription) ??
    cleanText(tour.sourceDescription) ??
    cleanText(tour.shortDescription) ??
    cleanText(tour.longDescription);

  return {
    ...tour,
    heroImage: heroImageUrl ?? tour.heroImage,
    heroImageUrl: heroImageUrl ?? tour.heroImageUrl,
    heroImageSource: heroImageUrl ? "fareharbor_media" : tour.heroImageSource,
    sourceDescription,
    sourceDescriptionSource: sourceDescription ? "fareharbor" : tour.sourceDescriptionSource,
    sourceOperatorSlug:
      cached?.sourceOperatorSlug ?? tour.sourceOperatorSlug ?? reference?.companyShortname,
    sourceItemId: cached?.sourceItemId ?? tour.sourceItemId ?? reference?.itemId,
  };
};

export const getTourHeroImage = (tour: Tour) => {
  if (tour.heroImageSource === "fareharbor_media" && tour.heroImageUrl) {
    return tour.heroImageUrl;
  }
  return tour.heroImageUrl ?? tour.heroImage;
};

export const getTourMetaDescriptionSource = (tour: Tour) => {
  if (tour.sourceDescriptionSource === "fareharbor" && tour.sourceDescription) {
    return tour.sourceDescription;
  }
  return undefined;
};

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

const dedupeToursByCanonicalKey = (tourList: Tour[]) => {
  const toursByKey = new Map<string, Tour>();

  tourList.forEach((tour) => {
    const canonicalKey = `${tour.bookingProvider}:${tour.sourceOperatorSlug ?? ""}:${tour.sourceItemId ?? tour.id}`;
    toursByKey.set(canonicalKey, tour);
  });

  return [...toursByKey.values()];
};

const BASE_TOURS: Tour[] = [
  ...toursGenerated,
  ...manualTours,
  ...flagstaffTours,
  ...sedonaTours,
  ...europeTours,
  ...australiaTours,
];

const ALL_TOURS = dedupeToursByCanonicalKey([
  ...BASE_TOURS,
  ...SANTA_BARBARA_TOURS,
]);

if (ALL_TOURS.length < BASE_TOURS.length) {
  throw new Error(
    `Per-location tour merge reduced tour count (${ALL_TOURS.length} < ${BASE_TOURS.length})`,
  );
}

export const tours: Tour[] = ALL_TOURS.map(normalizeFareharborTourContent).map(
  applyTourPricing,
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

export const getToursByState = (stateSlug: string) =>
  tours.filter(tour => tour.destination.stateSlug === stateSlug);

export const getToursByCity = (stateSlug: string, citySlug: string) =>
  tours.filter(
    tour =>
      tour.destination.stateSlug === stateSlug &&
      tour.destination.citySlug === citySlug
  );

export const getTourBySlugs = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string
) =>
  tours.find(
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

export const getAffiliateDisclosure = (tour: Tour) =>
  PROVIDER_CONFIG[tour.bookingProvider].affiliateDisclosure;

export const getProviderLabel = (provider: BookingProvider) =>
  PROVIDER_CONFIG[provider].label;
