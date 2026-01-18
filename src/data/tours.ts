import type { BookingProvider, Tour } from "./tours.types";
import { flagstaffTours } from "./flagstaffTours";
import { sedonaTours } from "./sedonaTours";
import { toursGenerated } from "./tours.generated";
import { europeTours } from "./europeTours";

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
const MANUAL_TOURS: Tour[] = [
  {
    id: "yellowstoneexcursions-425563",
    slug: "all-yellowstone-tours-425563",
    title: "All Yellowstone Tours",
    operator: "Yellowstone Excursions",
    categories: ["hiking"],
    primaryCategory: "hiking",
    destination: {
      state: "Montana",
      stateSlug: "montana",
      city: "Bozeman",
      citySlug: "bozeman",
    },
    heroImage: "https://cdn.filestackcontent.com/H4abOlNUQlmRczadXw7c",
    galleryImages: ["https://cdn.filestackcontent.com/H4abOlNUQlmRczadXw7c"],
    badges: {
      tagline: "Guided tour",
    },
    activitySlugs: ["hiking"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/yellowstoneexcursions/items/425563/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/yellowstoneexcursions/items/425563/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "All Yellowstone Tours is a guided day tour based in Bozeman, Montana that focuses on park highlights and scenic overlooks.",
  },
  {
    id: "bigboystoysallterrainrentals-621226",
    slug: "18ft-alumacraft-fishing-boat-621226",
    title: "18ft Alumacraft Fishing Boat",
    operator: "Big Boys Toys All Terrain Rentals",
    categories: ["canoeing"],
    primaryCategory: "canoeing",
    tags: ["Rentals"],
    destination: {
      state: "Montana",
      stateSlug: "montana",
      city: "Bozeman",
      citySlug: "bozeman",
    },
    heroImage: "https://cdn.filestackcontent.com/lBwzioVqSdPQnfIys10A",
    galleryImages: ["https://cdn.filestackcontent.com/lBwzioVqSdPQnfIys10A"],
    badges: {
      tagline: "Rental",
    },
    tagPills: ["Rentals"],
    activitySlugs: ["canoeing"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/bigboystoysallterrainrentals/items/621226/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/bigboystoysallterrainrentals/items/621226/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "18ft Alumacraft Fishing Boat offers boat rentals in Bozeman, Montana for self-guided time on nearby lakes and rivers.",
  },
  {
    id: "bigboystoysallterrainrentals-621666",
    slug: "canoe-rentals-621666",
    title: "Canoe Rentals",
    operator: "Big Boys Toys All Terrain Rentals",
    categories: ["canoeing"],
    primaryCategory: "canoeing",
    tags: ["Rentals"],
    destination: {
      state: "Montana",
      stateSlug: "montana",
      city: "Bozeman",
      citySlug: "bozeman",
    },
    heroImage: "https://cdn.filestackcontent.com/7CO4yDheSqywv78ddoU2",
    galleryImages: ["https://cdn.filestackcontent.com/7CO4yDheSqywv78ddoU2"],
    badges: {
      tagline: "Rental",
    },
    tagPills: ["Rentals"],
    activitySlugs: ["canoeing"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/bigboystoysallterrainrentals/items/621666/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/bigboystoysallterrainrentals/items/621666/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Canoe Rentals in Bozeman, Montana makes it easy to plan a self-guided paddle day on local waters.",
  },
  {
    id: "bigboystoysallterrainrentals-621668",
    slug: "hardshell-kayak-rentals-621668",
    title: "Hardshell Kayak Rentals",
    operator: "Big Boys Toys All Terrain Rentals",
    categories: ["canoeing"],
    primaryCategory: "canoeing",
    tags: ["Rentals"],
    destination: {
      state: "Montana",
      stateSlug: "montana",
      city: "Bozeman",
      citySlug: "bozeman",
    },
    heroImage: "https://cdn.filestackcontent.com/tpz0MUvoR1uxWkzVmcBh",
    galleryImages: ["https://cdn.filestackcontent.com/tpz0MUvoR1uxWkzVmcBh"],
    badges: {
      tagline: "Rental",
    },
    tagPills: ["Rentals"],
    activitySlugs: ["canoeing"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/bigboystoysallterrainrentals/items/621668/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/bigboystoysallterrainrentals/items/621668/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Hardshell Kayak Rentals provides single-day kayak rentals in Bozeman, Montana for paddlers who want to explore at their own pace.",
  },
  {
    id: "bigboystoysallterrainrentals-621669",
    slug: "inflatable-kayak-rentals-621669",
    title: "Inflatable Kayak Rentals",
    operator: "Big Boys Toys All Terrain Rentals",
    categories: ["canoeing"],
    primaryCategory: "canoeing",
    tags: ["Rentals"],
    destination: {
      state: "Montana",
      stateSlug: "montana",
      city: "Bozeman",
      citySlug: "bozeman",
    },
    heroImage: "https://cdn.filestackcontent.com/eKbETikRXGTdcvdXC9QN",
    galleryImages: ["https://cdn.filestackcontent.com/eKbETikRXGTdcvdXC9QN"],
    badges: {
      tagline: "Rental",
    },
    tagPills: ["Rentals"],
    activitySlugs: ["canoeing"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/bigboystoysallterrainrentals/items/621669/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/bigboystoysallterrainrentals/items/621669/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Inflatable Kayak Rentals in Bozeman, Montana is a flexible option for paddlers planning an independent lake or river outing.",
  },
  {
    id: "bigboystoysallterrainrentals-621665",
    slug: "nrs-14-ft-raft-rentals-621665",
    title: "NRS 14-Ft Raft Rentals",
    operator: "Big Boys Toys All Terrain Rentals",
    categories: ["canoeing"],
    primaryCategory: "canoeing",
    tags: ["Rentals"],
    destination: {
      state: "Montana",
      stateSlug: "montana",
      city: "Bozeman",
      citySlug: "bozeman",
    },
    heroImage: "https://cdn.filestackcontent.com/lyzqrKITXqZnaAcTyM1g",
    galleryImages: ["https://cdn.filestackcontent.com/lyzqrKITXqZnaAcTyM1g"],
    badges: {
      tagline: "Rental",
    },
    tagPills: ["Rentals"],
    activitySlugs: ["canoeing"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/bigboystoysallterrainrentals/items/621665/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/bigboystoysallterrainrentals/items/621665/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "NRS 14-Ft Raft Rentals is a Bozeman, Montana option for groups planning a self-guided river float.",
  },
  {
    id: "bigboystoysallterrainrentals-621233",
    slug: "ro-fishbone-driftboat-rentals-621233",
    title: "Ro Fishbone Driftboat Rentals",
    operator: "Big Boys Toys All Terrain Rentals",
    categories: ["canoeing"],
    primaryCategory: "canoeing",
    tags: ["Rentals"],
    destination: {
      state: "Montana",
      stateSlug: "montana",
      city: "Bozeman",
      citySlug: "bozeman",
    },
    heroImage: "https://cdn.filestackcontent.com/Qqy6tV5SgKqSFDSJyGKn",
    galleryImages: ["https://cdn.filestackcontent.com/Qqy6tV5SgKqSFDSJyGKn"],
    badges: {
      tagline: "Rental",
    },
    tagPills: ["Rentals"],
    activitySlugs: ["canoeing"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/bigboystoysallterrainrentals/items/621233/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/bigboystoysallterrainrentals/items/621233/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Ro Fishbone Driftboat Rentals gives Bozeman paddlers a self-guided way to spend time on the river.",
  },
  {
    id: "bigboystoysallterrainrentals-621242",
    slug: "ro-guide-driftboat-rentals-621242",
    title: "Ro Guide Driftboat Rentals",
    operator: "Big Boys Toys All Terrain Rentals",
    categories: ["canoeing"],
    primaryCategory: "canoeing",
    tags: ["Rentals"],
    destination: {
      state: "Montana",
      stateSlug: "montana",
      city: "Bozeman",
      citySlug: "bozeman",
    },
    heroImage: "https://cdn.filestackcontent.com/dW4JOEW3TcmGHEsKDclI",
    galleryImages: ["https://cdn.filestackcontent.com/dW4JOEW3TcmGHEsKDclI"],
    badges: {
      tagline: "Rental",
    },
    tagPills: ["Rentals"],
    activitySlugs: ["canoeing"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/bigboystoysallterrainrentals/items/621242/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/bigboystoysallterrainrentals/items/621242/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Ro Guide Driftboat Rentals in Bozeman, Montana offers a self-guided driftboat option for river days.",
  },
  {
    id: "bigboystoysallterrainrentals-621667",
    slug: "standup-paddle-board-rentals-621667",
    title: "Standup Paddle Board Rentals",
    operator: "Big Boys Toys All Terrain Rentals",
    categories: ["canoeing"],
    primaryCategory: "canoeing",
    tags: ["Rentals"],
    destination: {
      state: "Montana",
      stateSlug: "montana",
      city: "Bozeman",
      citySlug: "bozeman",
    },
    heroImage: "https://cdn.filestackcontent.com/2KR4rm1mR0uuRJ0BIM0M",
    galleryImages: ["https://cdn.filestackcontent.com/2KR4rm1mR0uuRJ0BIM0M"],
    badges: {
      tagline: "Rental",
    },
    tagPills: ["Rentals"],
    activitySlugs: ["canoeing"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/bigboystoysallterrainrentals/items/621667/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/bigboystoysallterrainrentals/items/621667/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Standup Paddle Board Rentals is a Bozeman, Montana option for easy-going paddling on calm water.",
  },
  {
    id: "peakrentalsofmt-574565",
    slug: "1-day-watersport-rentals-574565",
    title: "1 Day Watersport Rentals",
    operator: "Peak Rentals of Montana LLC",
    categories: ["canoeing"],
    primaryCategory: "canoeing",
    tags: ["Rentals"],
    destination: {
      state: "Montana",
      stateSlug: "montana",
      city: "Missoula",
      citySlug: "missoula",
    },
    heroImage: "https://cdn.filestackcontent.com/jtfkvisCRYC2R8wxsEey",
    galleryImages: ["https://cdn.filestackcontent.com/jtfkvisCRYC2R8wxsEey"],
    badges: {
      tagline: "Rental",
    },
    tagPills: ["Rentals"],
    activitySlugs: ["canoeing"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/peakrentalsofmt/items/574565/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/peakrentalsofmt/items/574565/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "1 Day Watersport Rentals in Missoula, Montana keeps paddle and float plans flexible for a quick day on the water.",
  },
  {
    id: "peakrentalsofmt-574568",
    slug: "2-day-watersport-rentals-574568",
    title: "2 Day Watersport Rentals",
    operator: "Peak Rentals of Montana LLC",
    categories: ["canoeing"],
    primaryCategory: "canoeing",
    tags: ["Rentals"],
    destination: {
      state: "Montana",
      stateSlug: "montana",
      city: "Missoula",
      citySlug: "missoula",
    },
    heroImage: "https://cdn.filestackcontent.com/FIBlt1UTREG1MTmEDfmw",
    galleryImages: ["https://cdn.filestackcontent.com/FIBlt1UTREG1MTmEDfmw"],
    badges: {
      tagline: "Rental",
    },
    tagPills: ["Rentals"],
    activitySlugs: ["canoeing"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/peakrentalsofmt/items/574568/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/peakrentalsofmt/items/574568/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "2 Day Watersport Rentals is a Missoula, Montana option for multi-day paddling or lake time.",
  },
  {
    id: "clarkforkyachtclub-311642",
    slug: "tubing-311642",
    title: "Tubing",
    operator: "Clark Fork Yacht Club",
    categories: ["canoeing"],
    primaryCategory: "canoeing",
    destination: {
      state: "Montana",
      stateSlug: "montana",
      city: "Missoula",
      citySlug: "missoula",
    },
    heroImage: "https://cdn.filestackcontent.com/OlnkJq4TC2LQYUfY7zVp",
    galleryImages: ["https://cdn.filestackcontent.com/OlnkJq4TC2LQYUfY7zVp"],
    badges: {
      tagline: "River float",
    },
    activitySlugs: ["canoeing"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/clarkforkyachtclub/items/311642/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/clarkforkyachtclub/items/311642/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Tubing is a relaxed float outing based in Missoula, Montana for low-effort time on the river.",
  },
  {
    id: "missoulabicycleworks-674100",
    slug: "bicycle-repair-and-tune-ups-674100",
    title: "Bicycle Repair & Tune-Ups",
    operator: "Missoula Bicycle Works",
    categories: ["cycling"],
    primaryCategory: "cycling",
    tags: ["Workshop"],
    destination: {
      state: "Montana",
      stateSlug: "montana",
      city: "Missoula",
      citySlug: "missoula",
    },
    heroImage: "https://cdn.filestackcontent.com/aCyjOvUtQNm42CniiQkW",
    galleryImages: ["https://cdn.filestackcontent.com/aCyjOvUtQNm42CniiQkW"],
    badges: {
      tagline: "Workshop",
    },
    tagPills: ["Workshop"],
    activitySlugs: ["cycling"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/missoulabicycleworks/items/674100/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/missoulabicycleworks/items/674100/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Bicycle Repair & Tune-Ups is a Missoula, Montana workshop option for riders who want to prep gear before hitting trails and paths.",
  },
  {
    id: "seamepaddle-556966",
    slug: "tour-whitefish-lake-evening-tour-556966",
    title: "Tour: Whitefish Lake Evening Tour",
    operator: "Tour Glacier | Sea Me Paddle Kayaking",
    categories: ["canoeing"],
    primaryCategory: "canoeing",
    destination: {
      state: "Montana",
      stateSlug: "montana",
      city: "Whitefish",
      citySlug: "whitefish",
      lat: -114.369061,
      lng: 48.42277,
    },
    heroImage: "https://cdn.filestackcontent.com/MQZSZGlQPWZg8cEF3c7s",
    galleryImages: ["https://cdn.filestackcontent.com/MQZSZGlQPWZg8cEF3c7s"],
    badges: {
      tagline: "Lake tour",
    },
    activitySlugs: ["canoeing"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/seamepaddle/items/556966/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/seamepaddle/items/556966/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Tour: Whitefish Lake Evening Tour is a calm-water paddle outing based in Whitefish, Montana with sunset timing on the lake.",
  },
  {
    id: "whitefishvertical-117858",
    slug: "ice-climb-at-serenity-falls---full-day-117858",
    title: "Ice Climb at Serenity Falls - Full Day",
    operator: "Whitefish Vertical Adventures",
    categories: ["hiking"],
    primaryCategory: "hiking",
    destination: {
      state: "Montana",
      stateSlug: "montana",
      city: "Whitefish",
      citySlug: "whitefish",
    },
    heroImage: "https://cdn.filestackcontent.com/tjA2RW7KQ1Gfdug7fhk1",
    galleryImages: ["https://cdn.filestackcontent.com/tjA2RW7KQ1Gfdug7fhk1"],
    badges: {
      tagline: "Climbing",
    },
    activitySlugs: ["hiking"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/whitefishvertical/items/117858/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/whitefishvertical/items/117858/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Ice Climb at Serenity Falls - Full Day is a Whitefish, Montana ice climbing experience that focuses on time on route and winter scenery.",
  },
  {
    id: "whitefishvertical-615146",
    slug: "private-rock-climbing-trip-615146",
    title: "Private Rock Climbing Trip",
    operator: "Whitefish Vertical Adventures",
    categories: ["hiking"],
    primaryCategory: "hiking",
    destination: {
      state: "Montana",
      stateSlug: "montana",
      city: "Whitefish",
      citySlug: "whitefish",
    },
    heroImage: "https://cdn.filestackcontent.com/BAGIZJrTSWAGtcwRvAtA",
    galleryImages: ["https://cdn.filestackcontent.com/BAGIZJrTSWAGtcwRvAtA"],
    badges: {
      tagline: "Climbing",
    },
    activitySlugs: ["hiking"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/whitefishvertical/items/615146/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/whitefishvertical/items/615146/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Private Rock Climbing Trip is a Whitefish, Montana climbing outing built for smaller groups who want guided time on the rock.",
  },
  {
    id: "whitefishvertical-612955",
    slug: "rock-rescue-101-612955",
    title: "Rock Rescue 101",
    operator: "Whitefish Vertical Adventures",
    categories: ["hiking"],
    primaryCategory: "hiking",
    destination: {
      state: "Montana",
      stateSlug: "montana",
      city: "Whitefish",
      citySlug: "whitefish",
    },
    heroImage: "https://cdn.filestackcontent.com/CROnjfKjQL2bg3DwSy6s",
    galleryImages: ["https://cdn.filestackcontent.com/CROnjfKjQL2bg3DwSy6s"],
    badges: {
      tagline: "Climbing",
    },
    activitySlugs: ["hiking"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/whitefishvertical/items/612955/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/whitefishvertical/items/612955/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Rock Rescue 101 is a Whitefish, Montana skills-focused climbing session centered on safety fundamentals.",
  },
  {
    id: "hollywoodbustoursla-333382",
    slug: "a-taste-of-la-half-day-tour-of-the-best-of-los-angeles-333382",
    title: "A Taste of LA: Half Day Tour of the BEST of Los Angeles",
    operator: "Hollywood Bus Tours, LLC",
    categories: ["detours"],
    primaryCategory: "detours",
    tags: ["City Tour", "Museum", "Sightseeing Tour"],
    destination: {
      state: "California",
      stateSlug: "california",
      city: "Los Angeles",
      citySlug: "los-angeles",
    },
    heroImage: "https://cdn.filestackcontent.com/T5WYAXrVScjR4SNHb0BD",
    galleryImages: ["https://cdn.filestackcontent.com/T5WYAXrVScjR4SNHb0BD"],
    badges: {
      tagline: "Sightseeing Tour",
    },
    tagPills: ["City Tour", "Museum", "Sightseeing Tour"],
    activitySlugs: ["detours"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/hollywoodbustoursla/items/333382/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/book/hollywoodbustoursla/items/333382/calendar/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "A Taste of LA: Half Day Tour of the BEST of Los Angeles is a guided sightseeing outing based in Los Angeles, California that highlights iconic neighborhoods and museum stops on a half-day itinerary.",
  },
  {
    id: "alldayla-205984",
    slug: "1-hr---real-hollywood-sign-tour-205984",
    title: "1 Hr - Real Hollywood Sign Tour",
    operator: "Golden Ticket LA",
    categories: ["detours"],
    primaryCategory: "detours",
    tags: ["Sightseeing Tour"],
    destination: {
      state: "California",
      stateSlug: "california",
      city: "Los Angeles",
      citySlug: "los-angeles",
      lat: -118.339056,
      lng: 34.101413,
    },
    heroImage: "https://cdn.filestackcontent.com/s4urjGMMSEObSWnyZ5E4",
    galleryImages: ["https://cdn.filestackcontent.com/s4urjGMMSEObSWnyZ5E4"],
    badges: {
      tagline: "Sightseeing Tour",
    },
    tagPills: ["Sightseeing Tour"],
    activitySlugs: ["detours"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/alldayla/items/205984/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/book/alldayla/items/205984/calendar/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "1 Hr - Real Hollywood Sign Tour is a guided sightseeing outing based in Los Angeles, California that spotlights the Hollywood Sign and nearby landmarks.",
  },
  {
    id: "alldayla-168579",
    slug: "la-essential-star-homes-tour-168579",
    title: "LA Essential Star Homes Tour",
    operator: "Golden Ticket LA",
    categories: ["detours"],
    primaryCategory: "detours",
    tags: ["Sightseeing Tour"],
    destination: {
      state: "California",
      stateSlug: "california",
      city: "Los Angeles",
      citySlug: "los-angeles",
      lat: -118.339056,
      lng: 34.101413,
    },
    heroImage: "https://cdn.filestackcontent.com/JwJyljguTkKDCCITcTMe",
    galleryImages: ["https://cdn.filestackcontent.com/JwJyljguTkKDCCITcTMe"],
    badges: {
      tagline: "Sightseeing Tour",
    },
    tagPills: ["Sightseeing Tour"],
    activitySlugs: ["detours"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/alldayla/items/168579/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/book/alldayla/items/168579/calendar/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "LA Essential Star Homes Tour is a guided sightseeing outing based in Los Angeles, California that visits celebrity homes and classic neighborhoods.",
  },
  {
    id: "parlorcartours-495929",
    slug: "hollywood-sightseeing-trolley-tour-495929",
    title: "Hollywood Sightseeing Trolley Tour",
    operator: "Parlor Car Tours",
    categories: ["detours"],
    primaryCategory: "detours",
    tags: ["Bus Tour", "Sightseeing Tour"],
    destination: {
      state: "California",
      stateSlug: "california",
      city: "Los Angeles",
      citySlug: "los-angeles",
      lat: -118.329989,
      lng: 34.102766,
    },
    heroImage: "https://cdn.filestackcontent.com/Md0xFxXARTGbe5OsbTck",
    galleryImages: ["https://cdn.filestackcontent.com/Md0xFxXARTGbe5OsbTck"],
    badges: {
      tagline: "Sightseeing Tour",
    },
    tagPills: ["Bus Tour", "Sightseeing Tour"],
    activitySlugs: ["detours"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/parlorcartours/items/495929/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/book/parlorcartours/items/495929/calendar/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Hollywood Sightseeing Trolley Tour is a guided sightseeing outing based in Los Angeles, California that rolls through iconic Hollywood stops by trolley.",
  },
  {
    id: "alldayla-518084",
    slug: "private-los-angeles-tour-beverly-hills-518084",
    title: "Private Los Angeles Tour (Beverly Hills)",
    operator: "Golden Ticket LA",
    categories: ["detours"],
    primaryCategory: "detours",
    tags: ["City Tour", "Private", "Sightseeing Tour"],
    destination: {
      state: "California",
      stateSlug: "california",
      city: "Los Angeles",
      citySlug: "los-angeles",
      lat: -118.339056,
      lng: 34.101413,
    },
    heroImage: "https://cdn.filestackcontent.com/8b9pyGF6QB0UiK7Yoc2y",
    galleryImages: ["https://cdn.filestackcontent.com/8b9pyGF6QB0UiK7Yoc2y"],
    badges: {
      tagline: "Private Tour",
    },
    tagPills: ["City Tour", "Private", "Sightseeing Tour"],
    activitySlugs: ["detours"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/alldayla/items/518084/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/book/alldayla/items/518084/calendar/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Private Los Angeles Tour (Beverly Hills) is a guided sightseeing outing based in Los Angeles, California tailored to Beverly Hills highlights.",
  },
  {
    id: "graveline-680527",
    slug: "manson-family-murders-funeral-limo-tour-of-la-680527",
    title: "Manson Family Murders Funeral Limo Tour of LA",
    operator: "Grave Line Tours",
    categories: ["detours"],
    primaryCategory: "detours",
    tags: [
      "City Tour",
      "Ghost Tour",
      "Guided Tour",
      "History Tour",
      "Sightseeing Tour",
    ],
    destination: {
      state: "California",
      stateSlug: "california",
      city: "Los Angeles",
      citySlug: "los-angeles",
    },
    heroImage: "https://cdn.filestackcontent.com/mehLbyeBRDmhWg9xAAlG",
    galleryImages: ["https://cdn.filestackcontent.com/mehLbyeBRDmhWg9xAAlG"],
    badges: {
      tagline: "History Tour",
    },
    tagPills: [
      "City Tour",
      "Ghost Tour",
      "Guided Tour",
      "History Tour",
      "Sightseeing Tour",
    ],
    activitySlugs: ["detours"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/graveline/items/680527/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/book/graveline/items/680527/calendar/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Manson Family Murders Funeral Limo Tour of LA is a guided history-focused outing based in Los Angeles, California that explores infamous true-crime sites.",
  },
  {
    id: "hollywoodhikes-471721",
    slug: "the-official-hollywood-sign-walking-tour-in-los-angeles-free-waters-471721",
    title: "The Official Hollywood Sign Walking Tour in Los Angeles-Free Waters!",
    operator: "Hollywood Hikes, LLC",
    categories: ["detours"],
    primaryCategory: "detours",
    tags: ["Walking Tour"],
    destination: {
      state: "California",
      stateSlug: "california",
      city: "Los Angeles",
      citySlug: "los-angeles",
      lat: -118.327127,
      lng: 34.130221,
    },
    heroImage: "https://cdn.filestackcontent.com/L7s2PXn7TyLI9DkUDV7g",
    galleryImages: ["https://cdn.filestackcontent.com/L7s2PXn7TyLI9DkUDV7g"],
    badges: {
      tagline: "Walking Tour",
    },
    tagPills: ["Walking Tour"],
    activitySlugs: ["detours"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/hollywoodhikes/items/471721/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/book/hollywoodhikes/items/471721/calendar/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "The Official Hollywood Sign Walking Tour in Los Angeles-Free Waters! is a guided walking outing based in Los Angeles, California with close-up views of the Hollywood Sign.",
  },
  {
    id: "hollywoodhikes-471726",
    slug: "the-official-hollywood-sign-express-walking-tour-in-los-angeles-free-waters-471726",
    title: "The Official Hollywood Sign Express Walking Tour in Los Angeles-Free Waters!",
    operator: "Hollywood Hikes, LLC",
    categories: ["detours"],
    primaryCategory: "detours",
    tags: ["Walking Tour"],
    destination: {
      state: "California",
      stateSlug: "california",
      city: "Los Angeles",
      citySlug: "los-angeles",
      lat: -118.327127,
      lng: 34.130221,
    },
    heroImage: "https://cdn.filestackcontent.com/jL1Pe9qMQF67SxBKhFNR",
    galleryImages: ["https://cdn.filestackcontent.com/jL1Pe9qMQF67SxBKhFNR"],
    badges: {
      tagline: "Walking Tour",
    },
    tagPills: ["Walking Tour"],
    activitySlugs: ["detours"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/hollywoodhikes/items/471726/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/book/hollywoodhikes/items/471726/calendar/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "The Official Hollywood Sign Express Walking Tour in Los Angeles-Free Waters! is a guided walking outing based in Los Angeles, California with a quicker-paced route to the Hollywood Sign.",
  },
  {
    id: "takemeoutla-629071",
    slug: "venices-finest-a-daytime-experience-629071",
    title: "Venice’s Finest: A Daytime Experience",
    operator: "Take Me Out LA",
    categories: ["detours"],
    primaryCategory: "detours",
    tags: ["Walking Tour"],
    destination: {
      state: "California",
      stateSlug: "california",
      city: "Los Angeles",
      citySlug: "los-angeles",
    },
    heroImage: "https://cdn.filestackcontent.com/xxTGErtvSvidZOPPQrkP",
    galleryImages: ["https://cdn.filestackcontent.com/xxTGErtvSvidZOPPQrkP"],
    badges: {
      tagline: "Walking Tour",
    },
    tagPills: ["Walking Tour"],
    activitySlugs: ["detours"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/takemeoutla/items/629071/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/book/takemeoutla/items/629071/calendar/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Venice’s Finest: A Daytime Experience is a guided walking outing based in Los Angeles, California that explores Venice's daytime highlights.",
  },
  {
    id: "hollywooddreamtours-349518",
    slug: "sightseeing-hollywood-tours-349518",
    title: "Sightseeing Hollywood Tours",
    operator: "Hollywood LA Tours",
    categories: ["detours"],
    primaryCategory: "detours",
    tags: ["Sightseeing Tour"],
    destination: {
      state: "California",
      stateSlug: "california",
      city: "Los Angeles",
      citySlug: "los-angeles",
      lat: -118.242643,
      lng: 34.054908,
    },
    heroImage: "/hero.jpg",
    galleryImages: ["/hero.jpg"],
    badges: {
      tagline: "Sightseeing Tour",
    },
    tagPills: ["Sightseeing Tour"],
    activitySlugs: ["detours"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/hollywooddreamtours/items/349518/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/book/hollywooddreamtours/items/349518/calendar/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Sightseeing Hollywood Tours is a guided sightseeing outing based in Los Angeles, California that covers classic Hollywood highlights.",
  },
  {
    id: "walkandridetours-547525",
    slug: "1-hour-walk-of-fame-guided-tour-547525",
    title: "1-Hour Walk of Fame Guided Tour",
    operator: "Walk and Ride Hollywood",
    categories: ["detours"],
    primaryCategory: "detours",
    tags: ["Walking Tour"],
    destination: {
      state: "California",
      stateSlug: "california",
      city: "Los Angeles",
      citySlug: "los-angeles",
    },
    heroImage: "https://cdn.filestackcontent.com/nOED5MVjRYhdCqre6IVt",
    galleryImages: ["https://cdn.filestackcontent.com/nOED5MVjRYhdCqre6IVt"],
    badges: {
      tagline: "Walking Tour",
    },
    tagPills: ["Walking Tour"],
    activitySlugs: ["detours"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/walkandridetours/items/547525/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/book/walkandridetours/items/547525/calendar/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "1-Hour Walk of Fame Guided Tour is a guided walking outing based in Los Angeles, California that focuses on the Hollywood Walk of Fame.",
  },
  {
    id: "graveline-680528",
    slug: "death-becomes-her-funeral-limo-tour-of-los-angeles-680528",
    title: "Death Becomes Her Funeral Limo Tour of Los Angeles",
    operator: "Grave Line Tours",
    categories: ["detours"],
    primaryCategory: "detours",
    tags: [
      "City Tour",
      "Ghost Tour",
      "Guided Tour",
      "History Tour",
      "Sightseeing Tour",
    ],
    destination: {
      state: "California",
      stateSlug: "california",
      city: "Los Angeles",
      citySlug: "los-angeles",
    },
    heroImage: "https://cdn.filestackcontent.com/4tVjDoPQt2rowJhpeefs",
    galleryImages: ["https://cdn.filestackcontent.com/4tVjDoPQt2rowJhpeefs"],
    badges: {
      tagline: "History Tour",
    },
    tagPills: [
      "City Tour",
      "Ghost Tour",
      "Guided Tour",
      "History Tour",
      "Sightseeing Tour",
    ],
    activitySlugs: ["detours"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/graveline/items/680528/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/book/graveline/items/680528/calendar/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Death Becomes Her Funeral Limo Tour of Los Angeles is a guided history-focused outing based in Los Angeles, California that explores notorious stories and landmarks.",
  },
  {
    id: "graveline-680529",
    slug: "hollywood-horror-story-the-black-dahlia-funeral-limo-tour-680529",
    title: "Hollywood Horror Story: The Black Dahlia Funeral Limo Tour",
    operator: "Grave Line Tours",
    categories: ["detours"],
    primaryCategory: "detours",
    tags: [
      "City Tour",
      "Ghost Tour",
      "Guided Tour",
      "History Tour",
      "Sightseeing Tour",
    ],
    destination: {
      state: "California",
      stateSlug: "california",
      city: "Los Angeles",
      citySlug: "los-angeles",
    },
    heroImage: "https://cdn.filestackcontent.com/CWNoiwruT76kvMxjomkh",
    galleryImages: ["https://cdn.filestackcontent.com/CWNoiwruT76kvMxjomkh"],
    badges: {
      tagline: "History Tour",
    },
    tagPills: [
      "City Tour",
      "Ghost Tour",
      "Guided Tour",
      "History Tour",
      "Sightseeing Tour",
    ],
    activitySlugs: ["detours"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/graveline/items/680529/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/book/graveline/items/680529/calendar/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Hollywood Horror Story: The Black Dahlia Funeral Limo Tour is a guided history-focused outing based in Los Angeles, California centered on the Black Dahlia case.",
  },
  {
    id: "sunsetexotictour-324799",
    slug: "beverly-hills-tour-1h15-minutes-324799",
    title: "Beverly Hills Tour 1h15 minutes",
    operator: "Sunset Exotic Tour",
    categories: ["detours"],
    primaryCategory: "detours",
    tags: [
      "City Tour",
      "Factory Tour",
      "Photography Tour",
      "Sightseeing Tour",
      "Theater",
    ],
    destination: {
      state: "California",
      stateSlug: "california",
      city: "Los Angeles",
      citySlug: "los-angeles",
    },
    heroImage: "https://cdn.filestackcontent.com/A5HYYN3KRu3fM4sGixJg",
    galleryImages: ["https://cdn.filestackcontent.com/A5HYYN3KRu3fM4sGixJg"],
    badges: {
      tagline: "Sightseeing Tour",
    },
    tagPills: [
      "City Tour",
      "Factory Tour",
      "Photography Tour",
      "Sightseeing Tour",
      "Theater",
    ],
    activitySlugs: ["detours"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/sunsetexotictour/items/324799/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/book/sunsetexotictour/items/324799/calendar/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "Beverly Hills Tour 1h15 minutes is a guided sightseeing outing based in Los Angeles, California highlighting Beverly Hills and luxury landmarks.",
  },
  {
    id: "sunsetexotictour-382848",
    slug: "the-beach-tour-4-hours-382848",
    title: "The Beach Tour 4 Hours",
    operator: "Sunset Exotic Tour",
    categories: ["detours"],
    primaryCategory: "detours",
    tags: ["Attraction", "Exotic Car", "Sightseeing Tour"],
    destination: {
      state: "California",
      stateSlug: "california",
      city: "Los Angeles",
      citySlug: "los-angeles",
    },
    heroImage: "https://cdn.filestackcontent.com/PINfVSoeSmcZfeHnz5EA",
    galleryImages: ["https://cdn.filestackcontent.com/PINfVSoeSmcZfeHnz5EA"],
    badges: {
      tagline: "Sightseeing Tour",
    },
    tagPills: ["Attraction", "Exotic Car", "Sightseeing Tour"],
    activitySlugs: ["detours"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/sunsetexotictour/items/382848/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/book/sunsetexotictour/items/382848/calendar/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no",
    longDescription:
      "The Beach Tour 4 Hours is a guided sightseeing outing based in Los Angeles, California that cruises coastal highlights and beach scenery.",
  },
];

export const tours: Tour[] = [
  ...toursGenerated,
  ...MANUAL_TOURS,
  ...flagstaffTours,
  ...sedonaTours,
  ...europeTours,
];

export const getToursByState = (stateSlug: string) =>
  tours.filter((tour) => tour.destination.stateSlug === stateSlug);

export const getToursByCity = (stateSlug: string, citySlug: string) =>
  tours.filter(
    (tour) =>
      tour.destination.stateSlug === stateSlug &&
      tour.destination.citySlug === citySlug,
  );

export const getTourBySlugs = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string,
) =>
  tours.find(
    (tour) =>
      tour.destination.stateSlug === stateSlug &&
      tour.destination.citySlug === citySlug &&
      tour.slug === tourSlug,
  );

export const getToursByActivity = (activitySlug: string) =>
  tours.filter((tour) => {
    if (!tour.activitySlugs.includes(activitySlug)) {
      return false;
    }

    if (activitySlug === "hiking") {
      return !tour.activitySlugs.includes("cycling");
    }

    return true;
  });

export const getTourDetailPath = (tour: Tour) =>
  `/tours/${tour.destination.stateSlug}/${tour.destination.citySlug}/${tour.slug}`;

export const getCityTourDetailPath = (tour: Tour) =>
  `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`;

export const getCityTourBookingPath = (tour: Tour) =>
  `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}/book`;

export const getAffiliateDisclosure = (tour: Tour) =>
  PROVIDER_CONFIG[tour.bookingProvider].affiliateDisclosure;

export const getProviderLabel = (provider: BookingProvider) =>
  PROVIDER_CONFIG[provider].label;
