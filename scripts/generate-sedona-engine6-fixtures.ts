import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { SEDONA_VIATOR_PUBLIC_RATINGS } from "../src/engine6/sedonaViatorPublicRatings";

type ItineraryItem = {
  title: string;
  description: string;
  duration?: string;
  stopType: "stop" | "pass-by";
};

type SedonaTourFixture = {
  productCode: string;
  productUrl: string;
  title: string;
  description: string;
  duration: string;
  priceFrom: number;
  heroUrl: string;
  rating: number;
  reviewCount: number;
  highlights: string[];
  startDescription: string;
  endDescription: string;
  itineraryItems: ItineraryItem[];
  inclusions: string[];
  categories: string[];
};

const SEDONA_TOURS: SedonaTourFixture[] = [
  {
    productCode: "162351P6",
    productUrl:
      "https://www.viator.com/tours/Sedona/Award-Winning-Sedona-Stargazing-with-TripAdvisor-Hall-of-Fame-Company/d750-162351P6",
    title: "Sedona Stargazing Tours LLC",
    description:
      "Experience Sedona's renowned dark skies with a TripAdvisor Hall of Fame stargazing company at a protected viewing site in the Verde Valley near Oak Creek, away from town glow. Certified astronomy guides set up high-powered telescopes and walk your small group through planets, star clusters, nebulae, and the Milky Way arc above Arizona's red rock country. The outing balances eyepiece time with constellation storytelling suited to first-time stargazers and repeat visitors alike. Sessions run about 75 minutes with seasonal start times tied to sunset and sky conditions. Dress in warm layers for the elevation, bring a red-light flashlight if you have one, and expect a quiet field experience focused on clear-sky viewing rather than a lecture hall format.",
    duration: "1 hour 15 minutes (approx.)",
    priceFrom: 120,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0a/f2/eb/a8.jpg",
    rating: 4.3,
    reviewCount: 955,
    highlights: [
      "TripAdvisor Hall of Fame stargazing operator in Sedona",
      "High-powered telescopes at a Verde Valley dark-sky site",
      "Guided views of planets, nebulae, and the Milky Way",
      "Small-group format away from Sedona light pollution",
      "Seasonal evening departures timed to sunset",
    ],
    startDescription:
      "Meet at the Verde Valley School area dark-sky staging point near Sedona. Confirm your exact meeting location and start time when booking.",
    endDescription:
      "Return to the Verde Valley School meeting area after the final telescope viewing session.",
    itineraryItems: [
      {
        title: "Verde Valley School",
        description:
          "Gather at the Verde Valley School area for a dark-sky briefing before telescope setup.",
        duration: "15 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional astronomy guide",
      "Telescope viewing session",
      "Constellation orientation",
      "All fees and taxes",
    ],
    categories: ["Night Tours", "Attractions & Museums", "Half-day Tours"],
  },
  {
    productCode: "321860P2",
    productUrl:
      "https://www.viator.com/tours/Sedona/The-Night-Sky-Galaxy-and-Star-Story-Tour/d750-321860P2",
    title: "The Night Sky Star Story, Galaxy, and Sedona Story Tour",
    description:
      "Experience Sedona after dark on a guided night-sky walk that blends astronomy with mythic constellation stories and local red rock lore. Your guide leads a small group to a scenic Sedona viewing area where you learn to identify major stars and seasonal patterns while hearing the cultural narratives tied to the desert sky. The format is conversational rather than classroom-style, with time to look through provided optics and ask questions about galaxies, planets, and the physics behind what you see. Expect roughly two hours outdoors with a pace suited to families and couples who want an accessible introduction to stargazing in northern Arizona. Bring a jacket for cool canyon evenings and comfortable shoes for short walks on uneven ground between viewing spots.",
    duration: "2 hours 5 minutes (approx.)",
    priceFrom: 100,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0e/d3/24/90.jpg",
    rating: 4.6,
    reviewCount: 278,
    highlights: [
      "Guided Sedona night-sky walk with constellation storytelling",
      "Mythic star stories paired with local Sedona history",
      "Small-group outdoor format about two hours long",
      "Optics provided for moon, planet, and deep-sky viewing",
      "Evening departures from central Sedona meeting points",
    ],
    startDescription:
      "Meet at the confirmed Sedona meeting location provided at booking. Arrive 10 minutes early for check-in.",
    endDescription:
      "Finish at the final Sedona viewing area and return to your vehicle after the star-story session.",
    itineraryItems: [],
    inclusions: [
      "Professional night-sky guide",
      "Constellation and galaxy orientation",
      "Optical viewing equipment",
      "All fees and taxes",
    ],
    categories: ["Night Tours", "Walking Tours", "Sightseeing Tours"],
  },
  {
    productCode: "327849P2",
    productUrl:
      "https://www.viator.com/tours/Sedona/The-Fast-Track-around-the-Sedona-Red-Rocks/d750-327849P2",
    title: "Everything Sedona (20+ Mile) - Sedona Helicopter Tour",
    description:
      "See Sedona's signature red rock formations from above on a compact helicopter flight covering more than 20 miles of canyon country in about 10 to 12 minutes. Lift off near Sedona Airport and trace a scenic loop over Cathedral Rock, Bell Rock, Chapel of the Holy Cross, Oak Creek Canyon, and Devil's Bridge Trail with live pilot narration. The route works as a fast-track overview for visitors on tight schedules who still want aerial perspective on the formations that define the Verde Valley skyline. Climate-controlled cabins and oversized windows keep photography straightforward as you bank past mesas, spires, and pine-fringed ridgelines. Weight limits and weather minimums apply; arrive early for check-in at the Sedona heliport.",
    duration: "10 to 12 minutes (approx.)",
    priceFrom: 196.79,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0c/0d/63/85.jpg",
    rating: 5,
    reviewCount: 111,
    highlights: [
      "Helicopter loop over 20+ miles of Sedona red rock country",
      "Aerial views of Cathedral Rock, Bell Rock, and Chapel of the Holy Cross",
      "Flyover of Oak Creek Canyon and Devil's Bridge Trail",
      "Live pilot narration on major Sedona landmarks",
      "Quick-format flight ideal for tight itineraries",
    ],
    startDescription:
      "Check in at the Sedona helicopter terminal near Sedona Airport, 455 Airport Rd, Sedona, AZ 86336. Arrive 30 minutes before departure.",
    endDescription:
      "Land back at the Sedona helicopter terminal after the red rock aerial loop.",
    itineraryItems: [
      {
        title: "Cathedral Rock",
        description:
          "Circle Cathedral Rock's twin spires rising above Oak Creek from a helicopter vantage.",
        stopType: "pass-by",
      },
      {
        title: "Bell Rock",
        description:
          "Pass Bell Rock's dome profile, one of Sedona's most photographed sandstone landmarks.",
        stopType: "pass-by",
      },
      {
        title: "Chapel of the Holy Cross",
        description:
          "Fly past Chapel of the Holy Cross built into the red cliffs above Sedona.",
        stopType: "pass-by",
      },
      {
        title: "Oak Creek Canyon",
        description:
          "Trace Oak Creek Canyon's forested gorge between high sandstone walls.",
        stopType: "pass-by",
      },
      {
        title: "Devil's Bridge Trail",
        description:
          "View Devil's Bridge Trail country where a natural sandstone arch crowns the ridgeline.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Helicopter flight",
      "Live pilot narration",
      "Helicopter fuel surcharge",
      "All fees and taxes",
    ],
    categories: ["Helicopter Tours", "Air Tours", "Sightseeing Tours"],
  },
  {
    productCode: "327849P1",
    productUrl:
      "https://www.viator.com/tours/Sedona/Mogollon-Rim-Tour-covering-3-wilderness-areas-around-Sedona/d750-327849P1",
    title: "Mogollon Rim (80+ Mile) - Sedona Helicopter Tour",
    description:
      "Upgrade to an extended Sedona helicopter expedition covering 80+ miles from red rock spires to the Mogollon Rim and Verde River corridor. This 50-minute flight climbs from Sedona Airport over Cathedral Rock, Bell Rock, Oak Creek Canyon, and Devil's Bridge before pushing into higher wilderness country around Sycamore Canyon, Honanki cliff dwellings, and the historic mining town of Jerome perched on Cleopatra Hill. Pilots narrate geology, forest ecology, and human history as you cross three wilderness areas invisible from Highway 89A alone. The longer routing suits photographers and repeat visitors who want context on how Sedona sits within the greater Colorado Plateau. Premium pricing reflects extended air time, fuel, and a broader aerial survey than the short red rock loop.",
    duration: "50 to 52 minutes (approx.)",
    priceFrom: 755.7,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/73/92/de.jpg",
    rating: 5,
    reviewCount: 17,
    highlights: [
      "Extended 80+ mile helicopter tour from Sedona Airport",
      "Aerial routing over Mogollon Rim and Sycamore Canyon wilderness",
      "Views of Honanki ruins and historic Jerome on Cleopatra Hill",
      "Cathedral Rock, Bell Rock, and Oak Creek Canyon flyovers included",
      "Live pilot narration across three wilderness areas",
    ],
    startDescription:
      "Check in at the Sedona helicopter terminal near Sedona Airport, 455 Airport Rd, Sedona, AZ 86336. Allow 30 minutes for weigh-in and safety briefing.",
    endDescription:
      "Return to the Sedona helicopter terminal after the Mogollon Rim aerial loop.",
    itineraryItems: [
      {
        title: "Sedona Airport Scenic Overlook",
        description: "Sedona Airport Scenic Overlook lift-off above Airport Mesa.",
        stopType: "pass-by",
      },
      {
        title: "Cathedral Rock",
        description:
          "Bank around Cathedral Rock above Oak Creek before heading into higher canyon country.",
        stopType: "pass-by",
      },
      {
        title: "Oak Creek Canyon",
        description:
          "Follow Oak Creek Canyon northward where ponderosa pine meets sheer sandstone walls.",
        stopType: "pass-by",
      },
      {
        title: "Honanki",
        description:
          "Fly near Honanki cliff dwellings tucked beneath basalt overhangs west of Sedona.",
        stopType: "pass-by",
      },
      {
        title: "Sycamore Canyon",
        description:
          "Cross Sycamore Canyon wilderness with wide views toward the Mogollon Rim escarpment.",
        duration: "10 minutes",
        stopType: "pass-by",
      },
      {
        title: "Jerome",
        description:
          "Circle historic Jerome on Cleopatra Hill above the Verde Valley mining district.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Extended helicopter flight",
      "Live pilot narration",
      "Helicopter fuel surcharge",
      "All fees and taxes",
    ],
    categories: ["Helicopter Tours", "Private and Luxury", "Air Tours"],
  },
  {
    productCode: "54668P3",
    productUrl:
      "https://www.viator.com/tours/Sedona/Wild-West-Tour-by-Helicopter-from-Sedona/d750-54668P3",
    title: "Sedona Helicopter Tour: Wild West Tour",
    description:
      "Combine Sedona's red rock panoramas with Wild West history on a 50-minute helicopter tour operated by Guidance Air from Sedona Airport. The flight sweeps over Cathedral Rock, Bell Rock, and Oak Creek Canyon before tracing routes associated with frontier ranching, mining, and outpost settlements across the Verde Valley. Pilots highlight how volcanic layers, fault lines, and erosion shaped the spires you see from town while pointing out remote canyons and mesa tops linked to Arizona's western heritage. This premium aerial outing suits travelers who want more air time than the short red rock loop and prefer a narrative focused on landscape and lore rather than a quick photo circuit. Check-in at Guidance Air includes a safety briefing and weight verification before boarding.",
    duration: "50 to 55 minutes (approx.)",
    priceFrom: 756,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/6e/fc/46.jpg",
    rating: 5,
    reviewCount: 37,
    highlights: [
      "50-minute Wild West themed helicopter tour from Sedona",
      "Guidance Air departures at Sedona Airport",
      "Aerial views of Cathedral Rock, Bell Rock, and Oak Creek Canyon",
      "Pilot commentary on Verde Valley frontier and mining history",
      "Extended routing beyond the standard red rock loop",
    ],
    startDescription:
      "Check in at Guidance Air at Sedona Airport, 455 Airport Rd, Sedona, AZ 86336. Arrive 30 minutes before your scheduled flight.",
    endDescription:
      "Land at Guidance Air at Sedona Airport after the Wild West aerial route.",
    itineraryItems: [
      {
        title: "Guidance Air",
        description:
          "Check in at Guidance Air for weigh-in, safety briefing, and boarding at Sedona Airport.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Cathedral Rock",
        description:
          "Lift off toward Cathedral Rock for introductory red rock views above Oak Creek.",
        stopType: "pass-by",
      },
      {
        title: "Bell Rock",
        description:
          "Pass Bell Rock and Courthouse Butte country on the western Sedona skyline.",
        stopType: "pass-by",
      },
      {
        title: "Oak Creek Canyon",
        description:
          "Trace Oak Creek Canyon's rim where pine forest meets towering sandstone cliffs.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Helicopter flight",
      "Live pilot narration",
      "Helicopter fuel surcharge",
      "All fees and taxes",
    ],
    categories: ["Helicopter Tours", "Air Tours", "Sightseeing Tours"],
  },
  {
    productCode: "189623P3",
    productUrl:
      "https://www.viator.com/tours/Sedona/Winery-Tours-from-Scottsdale-to-the-Verde-Valley-Vineyards-and-Sedona/d750-189623P3",
    title: "Bliss - Sedona's Most Luxurious Wine Tour - Lunch Included!",
    description:
      "Sample Verde Valley wines without driving on Bliss Wine Tours' full-day outing from Sedona through Cottonwood and Clarkdale tasting rooms. A luxury vehicle and host handle logistics while you visit Alcantara Vineyards, Cove Mesa Vineyard, D.A. Ranch, and Javelina Leap Vineyard with reserved tastings and a sit-down lunch included. Guides share how elevation, diurnal temperature swings, and volcanic soils shape Arizona varietals while pacing the day for relaxed conversation rather than rushed shuttle hops. The route stays anchored in the Sedona–Verde Valley corridor, pairing red rock scenery with riverside vineyards along Oak Creek and the Verde River. Ideal for couples and small groups who want a polished wine-country day with pickup options from Sedona lodging.",
    duration: "6 hours (approx.)",
    priceFrom: 125,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/09/df/69/5d.jpg",
    rating: 4.7,
    reviewCount: 657,
    highlights: [
      "Full-day Verde Valley wine tour with lunch included",
      "Visits to Alcantara, Cove Mesa, D.A. Ranch, and Javelina Leap",
      "Luxury transport with a dedicated wine tour host",
      "Reserved tastings across Cottonwood and Clarkdale wineries",
      "Pickup available from Sedona hotels and vacation rentals",
    ],
    startDescription:
      "Morning pickup from your Sedona hotel or agreed meeting point. Confirm pickup window when booking.",
    endDescription:
      "Return to your Sedona pickup location after the final winery stop.",
    itineraryItems: [
      {
        title: "Alcantara Vineyards and Winery",
        description:
          "Alcantara Vineyards and Winery along the Verde River near Cottonwood.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Cove Mesa Vineyard",
        description:
          "Continue to Cove Mesa Vineyard for a scenic Verde Valley tasting flight.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "D.A. Ranch",
        description:
          "Explore Page Springs Valley ranch estate for wine tasting with hillside views toward Clarkdale and the Verde River.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Javelina Leap Vineyard, Winery & Bistro",
        description:
          "Javelina Leap Vineyard, Winery & Bistro bistro lunch and final tasting.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Luxury vehicle transport",
      "Wine tour host",
      "Reserved tastings",
      "Lunch",
      "All fees and taxes",
    ],
    categories: ["Wine Tours", "Day Trips", "Food & Drink"],
  },
  {
    productCode: "325517P1",
    productUrl:
      "https://www.viator.com/tours/Sedona/VIP-Wine-and-City-tours-with-a-celebrity-tour-guide/d750-325517P1",
    title: "Vortex to Vineyards by ABC wildlife host Rachel Reenstra",
    description:
      "Join Emmy-nominated wildlife host Rachel Reenstra on a VIP half-day pairing Sedona vortex viewpoints with Verde Valley wine tasting. The curated route stops at Sedona Airport Scenic Overlook for red rock panoramas, then continues to Page Springs Cellars and DA Ranch before a tasting and bistro lunch at Javelina Leap Vineyard. Rachel's commentary blends comedy, ecology, and local lore so the outing feels like a hosted adventure rather than a standard shuttle tour. Small groups keep the pace flexible for photos at Airport Mesa and conversation in the tasting room. This experience suits visitors who want both Sedona scenery and Arizona wine culture in one guided afternoon without self-driving between hilltop overlooks and valley-floor vineyards.",
    duration: "3 to 4 hours (approx.)",
    priceFrom: 199,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/10/24/76/24.jpg",
    rating: 5,
    reviewCount: 206,
    highlights: [
      "VIP tour hosted by wildlife personality Rachel Reenstra",
      "Sedona Airport Scenic Overlook and vortex viewpoint stop",
      "Tastings at Page Springs Cellars and Javelina Leap Vineyard",
      "DA Ranch visit in the Page Springs Valley wine corridor",
      "Small-group format with hosted commentary and photo time",
    ],
    startDescription:
      "Meet at the confirmed Sedona pickup location provided at booking. Morning or afternoon departures available.",
    endDescription:
      "Return to your Sedona pickup point after the Javelina Leap Vineyard stop.",
    itineraryItems: [
      {
        title: "Sedona Airport Scenic Overlook",
        description:
          "Photo stop at Sedona Airport Scenic Overlook above the red rock basin and Airport Mesa vortex area.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "DA Ranch",
        description:
          "Visit DA Ranch for an estate tasting in the Page Springs wine corridor.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Page Springs Cellars",
        description:
          "Tour and taste at Page Springs Cellars along Oak Creek's upper watershed.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Javelina Leap Vineyard, Winery & Bistro",
        description:
          "Javelina Leap Vineyard, Winery & Bistro creek-side tasting and lunch stop.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Page Springs Valley",
        description:
          "Scenic drive through Page Springs Valley between Sedona overlooks and valley-floor wineries.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Celebrity host guide",
      "Luxury vehicle transport",
      "Winery tastings",
      "Bottled water",
    ],
    categories: ["Wine Tastings", "Sightseeing Tours", "Private and Luxury"],
  },
  {
    productCode: "109073P8",
    productUrl:
      "https://www.viator.com/tours/Sedona/Sedona-Scenic-Full-Day-Tour/d750-109073P8",
    title: "PRIVATE Sedona Scenic Full-Day Experience - Your Day - Your Way",
    description:
      "Design your ideal Sedona day on a private seven- to eight-hour tour with a dedicated guide, luxury transport, lunch, and snacks included. The route typically combines Chapel of the Holy Cross, Airport Mesa, Cathedral Rock, Bell Rock, and free time in Uptown Sedona, with an optional side trip to historic Jerome on Cleopatra Hill when your group wants mining-town galleries and valley views. Because the vehicle is yours alone, you set the pace for photography, shopping, short walks, and vortex stops without coordinating around strangers. Guides share red rock geology, Native American heritage, and practical tips for navigating crowded overlooks. This VIP format suits anniversaries, family reunions, and travelers who want one comprehensive Sedona introduction in a single customized outing.",
    duration: "7 to 8 hours (approx.)",
    priceFrom: 389,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/80/b3/29.jpg",
    rating: 5,
    reviewCount: 19,
    highlights: [
      "Private full-day Sedona tour with flexible custom routing",
      "Chapel of the Holy Cross, Cathedral Rock, and Bell Rock stops",
      "Airport Mesa scenic overlook and vortex viewpoint time",
      "Optional Jerome side trip on Cleopatra Hill",
      "Included lunch, snacks, and luxury private transport",
    ],
    startDescription:
      "Morning pickup from your Sedona hotel or vacation rental. Your guide confirms the day's priorities before departure.",
    endDescription:
      "Return to your Sedona lodging after the final overlook or Jerome stop.",
    itineraryItems: [
      {
        title: "Chapel of the Holy Cross",
        description:
          "Visit Chapel of the Holy Cross built into the red cliffs above Sedona.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Airport Mesa",
        description:
          "Stop at Airport Mesa for panoramic views over Sedona's red rock basin.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Cathedral Rock",
        description:
          "Photo time near Cathedral Rock viewpoints along Oak Creek.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Bell Rock",
        description:
          "Visit Bell Rock and Courthouse Butte area pullouts on Highway 179.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Jerome",
        description:
          "Optional visit to historic Jerome for galleries, cafes, and Verde Valley overlooks.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Sedona",
        description:
          "Free time in Uptown Sedona for shopping, galleries, and café stops.",
        duration: "1 hour",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private professional guide",
      "Luxury private transport",
      "Lunch and snacks",
      "Bottled water",
      "Flexible custom itinerary",
    ],
    categories: ["Private and Luxury", "Full-day Tours", "Sightseeing Tours"],
  },
  {
    productCode: "129182P3",
    productUrl:
      "https://www.viator.com/tours/Sedona/Sedona-Sacred-Places-and-Vortex-tour/d750-129182P3",
    title: "Sedona Sacred Places and Vortex Private Tour",
    description:
      "Explore Sedona's sacred sites on a private four-hour tour combining 4WD access with mindful time at vortex viewpoints and ceremonial landscapes. Your guide leads a small party to Cathedral Rock vortex areas and Chapel of the Holy Cross, explaining how indigenous traditions and contemporary spiritual seekers relate to the red rock formations. Stops may include a medicine wheel ceremonial site and quiet overlooks where guests practice grounding exercises away from crowded trailheads. The private format allows pacing for meditation, photography, and questions about Sedona's metaphysical reputation without rushing a fixed group schedule. Expect moderate walking on uneven red rock surfaces and a respectful, educational tone focused on place-based history rather than guaranteed supernatural effects.",
    duration: "4 hours (approx.)",
    priceFrom: 245,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/2a/1c/d8.jpg",
    rating: 4.9,
    reviewCount: 29,
    highlights: [
      "Private four-hour sacred sites and vortex tour",
      "Cathedral Rock vortex and Chapel of the Holy Cross visits",
      "Medicine wheel ceremonial site stop when accessible",
      "4WD access to quieter spiritual viewpoints",
      "Respectful guide commentary on indigenous and local traditions",
    ],
    startDescription:
      "Pickup from your Sedona hotel or agreed meeting point. Your guide reviews the day's sacred site routing before departure.",
    endDescription:
      "Return to your Sedona pickup location after the final vortex stop.",
    itineraryItems: [
      {
        title: "Cathedral Rock",
        description:
          "Spend mindful time at Cathedral Rock vortex viewpoints with guide-led orientation.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Chapel of the Holy Cross",
        description:
          "Visit Chapel of the Holy Cross for architecture, views, and quiet reflection time.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private vortex guide",
      "4WD transport",
      "Ceremonial site access when permitted",
      "Bottled water",
    ],
    categories: ["4WD Tours", "Private Tours", "Religious Tours"],
  },
  {
    productCode: "129182P1",
    productUrl:
      "https://www.viator.com/tours/Sedona/Private-custom-tours/d750-129182P1",
    title: "Private Custom Tours in Sedona",
    description:
      "Build a half-day Sedona itinerary around your group's interests on a private custom tour with hotel pickup and a dedicated guide. Choose emphasis on red rock photography at Sedona Airport Scenic Overlook, architecture at Chapel of the Holy Cross, canyon scenery along Oak Creek, or a moderate walk on Boynton Canyon Trail without matching a large-group pace. Guides adjust routing for mobility, sunset timing, and weather while sharing geology, wildlife, and trail etiquette for Coconino National Forest land. The three- to four-hour format suits families, couples, and multigenerational groups who want expert local navigation plus flexibility to linger at favorite overlooks. Tell your guide your priorities at pickup and the day adapts in real time.",
    duration: "3 to 4 hours (approx.)",
    priceFrom: 275,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/15/25/db/52.jpg",
    rating: 5,
    reviewCount: 46,
    highlights: [
      "Private custom half-day Sedona sightseeing tour",
      "Flexible stops at Airport Overlook and Chapel of the Holy Cross",
      "Optional Boynton Canyon Trail walk with guide pacing",
      "Oak Creek Canyon scenic drive when time allows",
      "Hotel pickup and tailored routing for your group",
    ],
    startDescription:
      "Pickup from your Sedona hotel or vacation rental at the confirmed departure time.",
    endDescription:
      "Return to your Sedona lodging after the final custom stop.",
    itineraryItems: [
      {
        title: "Sedona Airport Scenic Overlook",
        description:
          "Begin at Sedona Airport Scenic Overlook for wide red rock panoramas and photo time.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Chapel of the Holy Cross",
        description:
          "Visit Chapel of the Holy Cross built into the cliffs above Sedona.",
        duration: "40 minutes",
        stopType: "stop",
      },
      {
        title: "Boynton Canyon Trail",
        description:
          "Optional guided walk on Boynton Canyon Trail among red walls and juniper forest.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Oak Creek Canyon",
        description:
          "Scenic drive through Oak Creek Canyon with pullouts above the creek gorge.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private professional guide",
      "Private transport",
      "Custom itinerary planning",
      "Bottled water",
    ],
    categories: ["Private Sightseeing Tours", "Half-day Tours", "Sightseeing Tours"],
  },
  {
    productCode: "291644P3",
    productUrl:
      "https://www.viator.com/tours/Sedona/Explore-Sedona-Tour/d750-291644P3",
    title: "Private tour of Sedona and hike in Red Rock State park",
    description:
      "Combine Sedona sightseeing with a guided hike inside Red Rock State Park on a private four-hour outing tailored to your fitness level. Your guide handles logistics from Chapel of the Holy Cross photo stops to Airport Mesa overlooks, then leads a park trail segment where riparian cottonwoods meet red sandstone fins above Oak Creek. Interpretive commentary covers Colorado Plateau geology, desert wildlife, and how state park rules protect sensitive habitats near Eagle's Nest and Apache Fire looms. Private transport keeps the pace flexible for families who want both windshield touring and a meaningful walk without joining a crowded group hike. Wear sturdy shoes and bring water; trails may include rocky steps and sun exposure.",
    duration: "4 hours (approx.)",
    priceFrom: 275,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/7c/31/9e.jpg",
    rating: 4.5,
    reviewCount: 19,
    highlights: [
      "Private Sedona tour with guided Red Rock State Park hike",
      "Chapel of the Holy Cross and Airport Mesa scenic stops",
      "Trail pacing matched to your group's fitness level",
      "Interpretive commentary on geology and Oak Creek ecology",
      "Park entrance coordination handled by your guide",
    ],
    startDescription:
      "Pickup from your Sedona lodging at the confirmed morning or afternoon departure time.",
    endDescription:
      "Return to your Sedona pickup point after the Red Rock State Park hike.",
    itineraryItems: [
      {
        title: "Chapel of the Holy Cross",
        description:
          "Stop at Chapel of the Holy Cross for cliffside architecture and valley views.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Airport Mesa",
        description:
          "Visit Airport Mesa overlook above Sedona's red rock amphitheater.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Red Rock State Park",
        description:
          "Guided hike on Red Rock State Park trails along Oak Creek with ecology stops.",
        duration: "2 hours",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private professional guide",
      "Private transport",
      "Red Rock State Park entry coordination",
      "Trail snacks and water",
    ],
    categories: ["Hiking Tours", "Private Tours", "Nature and Wildlife Tours"],
  },
  {
    productCode: "338750P2",
    productUrl:
      "https://www.viator.com/tours/Sedona/Three-Hour-Creekside-of-Cathedral-Hike-Private-Group/d750-338750P2",
    title: "Sedona Creekside of Cathedral Rock Hike With a Private Guide",
    description:
      "Hike Sedona's creekside trails beneath Cathedral Rock with a private guide who knows the quiet Oak Creek corridors away from crowded parking lots. The four-hour outing follows red rock benches above flowing water, crossing sandy banks and shaded cottonwood groves while your guide identifies desert plants, bird activity, and the geological forces that tilted Sedona's spires skyward. Pace adjusts for your group's ability on moderate terrain with some rocky steps and creek-side footing. This experience suits photographers and nature-focused travelers who want Cathedral Rock perspectives from river level rather than only from highway pullouts. Meet your guide at the confirmed trailhead near Oak Creek; wear traction footwear and sun protection for exposed sections.",
    duration: "4 hours (approx.)",
    priceFrom: 285,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0e/08/ae/0f.jpg",
    rating: 5,
    reviewCount: 39,
    highlights: [
      "Private guided creekside hike beneath Cathedral Rock",
      "Oak Creek corridors with red rock and cottonwood scenery",
      "Local guide pacing on moderate Sedona trail terrain",
      "Desert ecology and geology interpretation en route",
      "Four-hour format for unhurried photography and rest stops",
    ],
    startDescription:
      "Meet your private guide at the confirmed Oak Creek trailhead near Cathedral Rock. Details provided at booking.",
    endDescription:
      "Finish at the creekside trail turnaround and return to the Cathedral Rock area trailhead.",
    itineraryItems: [
      {
        title: "Cathedral Rock",
        description:
          "Begin beneath Cathedral Rock along Oak Creek creekside paths with spire views overhead.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Oak Creek",
        description:
          "Follow Oak Creek through cottonwood shade with geology and wildlife commentary.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Creekside Overlook",
        description:
          "Reach a creekside overlook for photos of Cathedral Rock reflected above the water.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private hiking guide",
      "Trail snacks and water",
      "Safety briefing",
    ],
    categories: ["Hiking Tours", "Private Tours", "Nature and Wildlife Tours"],
  },
  {
    productCode: "393812P3",
    productUrl:
      "https://www.viator.com/tours/Sedona/Sedona-Cathedral-Rock-Hiking-Tour-with-a-Private-Guide/d750-393812P3",
    title: "Sedona, Cathedral Rock Hiking Tour with a Private Guide",
    description:
      "Climb toward Cathedral Rock with a private Sedona guide who blends trail skills with thoughtful conversation about the landscape's cultural and philosophical significance. The two-and-a-half-hour route uses Cathedral Rock Trail and connecting paths such as Templeton Trail, with difficulty adjusted to your fitness on the moderate-to-challenging sandstone steps above Oak Creek. Local guides identify flora, fauna, and rock layers while pacing rest stops for water and photography at red rock saddles. This outing suits travelers who want more than a quick viewpoint stop and prefer expert navigation on Sedona's busiest icon without guessing trail junctions alone. Sturdy hiking shoes and a small daypack are recommended; afternoon starts avoid midday heat when possible.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 194.5,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/15/71/08/54.jpg",
    rating: 5,
    reviewCount: 12,
    highlights: [
      "Private Cathedral Rock hiking tour with local Sedona guide",
      "Cathedral Rock Trail and Templeton Trail routing options",
      "Difficulty adjusted to guest fitness and preferences",
      "Geology, flora, and cultural context along the climb",
      "Two-and-a-half-hour focused hike format",
    ],
    startDescription:
      "Meet at the Cathedral Rock Trailhead area near Oak Creek. Your guide confirms the route based on conditions and ability.",
    endDescription:
      "Return to the Cathedral Rock Trailhead after the guided descent.",
    itineraryItems: [
      {
        title: "Cathedral Rock Trailhead",
        description:
          "Cathedral Rock Trailhead gear check before the guided ascent.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "Cathedral Rock Trail",
        description:
          "Ascend Cathedral Rock Trail sandstone steps with guide-led pacing and rest stops.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Templeton Trail",
        description:
          "Connect via Templeton Trail sections for alternate viewpoints above Oak Creek.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Arizona 89A & Oak Creek Boulevard",
        description:
          "Arizona 89A & Oak Creek Boulevard corridor descent toward the trailhead.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private certified hiking guide",
      "Trail snacks",
      "Safety equipment",
    ],
    categories: ["Hiking Tours", "Private Tours", "Nature and Wildlife Tours"],
  },
  {
    productCode: "320003P1",
    productUrl:
      "https://www.viator.com/tours/Sedona/Sedona-Hiking-and-Photo-Adventure/d750-320003P1",
    title: "Sedona Hiking and Photo Adventure",
    description:
      "Pair active hiking with professional photography on a five-and-a-half-hour Sedona adventure that hits photogenic red rock locations in optimal light. Your guide leads drives and walks to Cathedral Rock viewpoints and additional scenic pullouts, timing stops for golden-hour color on sandstone fins and Oak Creek reflections. Along the way you receive coaching on composition while the guide captures high-resolution images of your party delivered after the tour for prints or social sharing. The format suits couples, families, and small teams who want exercise plus polished keepsake photos without hiring a separate photographer. Moderate hiking ability is recommended; routes adjust slightly for proposals, celebrations, or team-building goals when arranged in advance.",
    duration: "5 hours 30 minutes (approx.)",
    priceFrom: 195,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/10/3f/75/c5.jpg",
    rating: 5,
    reviewCount: 6,
    highlights: [
      "Guided Sedona hike combined with professional photography",
      "Cathedral Rock and red rock scenic locations timed for light",
      "Full-resolution edited photos delivered after the tour",
      "Composition coaching for travelers who enjoy cameras",
      "Flexible routing for proposals and small-group celebrations",
    ],
    startDescription:
      "Meet your guide at the confirmed Sedona trailhead or hotel pickup point. Start times shift seasonally for best photography light.",
    endDescription:
      "Return to the meeting point after the final photo location on Cathedral Rock country trails.",
    itineraryItems: [],
    inclusions: [
      "Professional guide and photographer",
      "Edited digital photo delivery",
      "Trail transport between locations",
      "Trail snacks and water",
    ],
    categories: ["Hiking Tours", "Photography Tours", "Adventure Tours"],
  },
  {
    productCode: "3925OBW",
    productUrl:
      "https://www.viator.com/tours/Sedona/Old-Bear-Wallow-Tour-from-Sedona/d750-3925OBW",
    title: "PRIVATE Sedona Jeep Tour 4X4 Climb - Colorado Plateau",
    description:
      "Climb onto the Colorado Plateau on a private two-hour Pink Jeep 4x4 tour along Schnebly Hill Road and the Old Bear Wallow route above Sedona. Your driver-guide navigates steep sandstone ledges and Mogollon Rim viewpoints while explaining how faulting and erosion created the layered mesas visible from town. The outing emphasizes adrenaline and big-sky panoramas rather than gentle valley loops, with Schnebly Hill Vista providing a high perch over Oak Creek Canyon and the Verde Valley. Private vehicles keep the experience exclusive to your party with time for photos at rim overlooks. Meet at the Pink Jeep Tours base on West State Route 89A; closed-toe shoes and secure hats are recommended for open-air Jeep seating.",
    duration: "2 hours (approx.)",
    priceFrom: 159,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/71/49/60.jpg",
    rating: 4.7,
    reviewCount: 361,
    highlights: [
      "Private Pink Jeep 4x4 climb onto the Colorado Plateau",
      "Schnebly Hill Road ascent with rim-top panoramas",
      "Old Bear Wallow backcountry routing above Sedona",
      "Driver-guide commentary on plateau geology",
      "Exclusive private Jeep for your party only",
    ],
    startDescription:
      "Check in at Pink Jeep Tours, 2900 W State Rte 89A, Sedona, AZ 86336. Arrive 15 minutes before your scheduled departure.",
    endDescription:
      "Return to the Pink Jeep Tours base on West State Route 89A after the plateau descent.",
    itineraryItems: [
      {
        title: "Pink Jeep Tours Base",
        description:
          "Pink Jeep Tours Base check-in at 2900 W State Rte 89A before departure.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Schnebly Hill Vista",
        description:
          "Climb Schnebly Hill Road to Schnebly Hill Vista overlooking Oak Creek Canyon.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Mogollon Rim",
        description:
          "Reach Mogollon Rim viewpoints on the Colorado Plateau edge above the Verde Valley.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private Jeep 4x4 transport",
      "Professional driver-guide",
      "Bottled water",
      "All fees and taxes",
    ],
    categories: ["4WD Tours", "Jeep Tours", "Adventure Tours"],
  },
  {
    productCode: "3925P1",
    productUrl:
      "https://www.viator.com/tours/Sedona/Red-Rock-Panoramic-Tour/d750-3925P1",
    title: "PRIVATE Sedona Jeep Tour Mild 4X4 - Red Rock Panoramic",
    description:
      "See Sedona's red rock panoramas on a mild private Pink Jeep tour through Coconino National Forest backroads without the steepest plateau climbs. The two-hour loop uses Dry Creek Road and Boynton Canyon Trail access routes to reach scenic benches facing Courthouse Butte, Boynton Canyon walls, and juniper-studded meadows invisible from the highway. Your driver-guide shares wildlife signs, movie-location trivia, and geology while keeping the ride suitable for guests who want 4x4 character without extreme pitch. Private Jeeps depart from the Pink Jeep base on West State Route 89A with photo stops timed for morning or afternoon light. Ideal for first-time visitors and families seeking an introductory off-road overview of western Sedona.",
    duration: "2 hours (approx.)",
    priceFrom: 159,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/09/54/33/78.jpg",
    rating: 4.8,
    reviewCount: 137,
    highlights: [
      "Private mild 4x4 Pink Jeep tour of western Sedona",
      "Dry Creek Road and Boynton Canyon scenic backroads",
      "Panoramic red rock views without extreme cliff climbs",
      "Driver-guide commentary on forest ecology and geology",
      "Family-friendly introductory off-road format",
    ],
    startDescription:
      "Meet at Pink Jeep Tours, 2900 W State Rte 89A, Sedona, AZ 86336, 15 minutes before departure.",
    endDescription:
      "Return to the Pink Jeep Tours base after the red rock panoramic loop.",
    itineraryItems: [
      {
        title: "Pink Jeep Tours Base",
        description:
          "Pink Jeep Tours Base safety briefing before the red rock panoramic loop.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "Dry Creek Road",
        description:
          "Follow Dry Creek Road through juniper forest toward western Sedona viewpoints.",
        duration: "40 minutes",
        stopType: "stop",
      },
      {
        title: "Boynton Canyon Trail",
        description:
          "Stop near Boynton Canyon Trail for red wall panoramas and photo time.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private Jeep transport",
      "Professional driver-guide",
      "Bottled water",
      "All fees and taxes",
    ],
    categories: ["4WD Tours", "Private Sightseeing Tours", "Jeep Tours"],
  },
  {
    productCode: "25271P1",
    productUrl:
      "https://www.viator.com/tours/Sedona/The-Original-Sedona-Vortex-Tour/d750-25271P1",
    title: "PRIVATE Customizable Sedona Vortex Jeep Tour",
    description:
      "Customize a private two-hour Sedona vortex Jeep tour with guides trained to interpret the area's spiritual geography and red rock landforms. Depart Pink Jeep Tours on West State Route 89A and choose emphasis among Airport Mesa, Boynton Canyon, Bell Rock, and other vortex-associated sites based on your group's interests. Drivers combine mild 4x4 segments with stops for grounding exercises, photography, and educational commentary on how Sedona's vortex concept emerged from local landscape features. The private format lets skeptics and believers share one vehicle while pacing meditation time and scenic overlooks differently than a fixed group tour. Wear comfortable layers for open-air Jeep travel and expect short walks on sandy, uneven ground at viewpoint pullouts.",
    duration: "2 hours (approx.)",
    priceFrom: 159,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/09/69/15/d7.jpg",
    rating: 4.5,
    reviewCount: 185,
    highlights: [
      "Private customizable Sedona vortex Jeep experience",
      "Professional vortex-trained Pink Jeep guides",
      "Flexible stops at Airport Mesa, Bell Rock, and Boynton Canyon",
      "Mild 4x4 travel with short viewpoint walks",
      "Exclusive Jeep reserved for your party",
    ],
    startDescription:
      "Check in at Pink Jeep Tours, 2900 W State Rte 89A, Sedona, AZ 86336. Discuss vortex priorities with your guide before departure.",
    endDescription:
      "Return to the Pink Jeep Tours base after your customized vortex loop.",
    itineraryItems: [
      {
        title: "Pink Jeep Tours Base",
        description:
          "Pink Jeep Tours Base vortex routing consultation at 2900 W State Rte 89A.",
        duration: "15 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private Jeep 4x4 transport",
      "Vortex-trained driver-guide",
      "Customizable itinerary",
      "Bottled water",
    ],
    categories: ["4WD Tours", "Jeep Tours", "Religious Tours"],
  },
  {
    productCode: "15880P21",
    productUrl:
      "https://www.viator.com/tours/Sedona/Ultimate-Sedona-Experience/d750-15880P21",
    title: "Ultimate Sedona Jeep Tour: Vortex, Landmarks & Scenic Views",
    description:
      "Sedona's longest signature Jeep tour packs vortex sites, landmark stops, and shopping time into five and a half hours of guided red rock exploration. Visit Chapel of the Holy Cross, Airport Mesa, Amitabha Stupa and Peace Park, Lover's Knoll, and Tlaquepaque Arts & Shopping Village while your driver narrates geology, Native history, and Sedona's spiritual reputation. The route balances mild off-road segments with cultural stops so you see natural formations and local craft galleries in one comprehensive day. This is the operator's most complete Jeep itinerary for travelers who want breadth rather than a single-theme vortex or canyon ride. Morning departures include time for lunch near Tlaquepaque; bring sun protection for open-air Jeep seating.",
    duration: "5 hours 30 minutes (approx.)",
    priceFrom: 119.23,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/10/7c/9c/24.jpg",
    rating: 4.9,
    reviewCount: 296,
    highlights: [
      "Five-and-a-half-hour comprehensive Sedona Jeep tour",
      "Chapel of the Holy Cross and Airport Mesa vortex stops",
      "Amitabha Stupa and Peace Park visit included",
      "Free time at Tlaquepaque Arts & Shopping Village",
      "Lover's Knoll scenic viewpoint on the red rock loop",
    ],
    startDescription:
      "Meet at the tour operator check-in location in Sedona confirmed at booking. Morning departure recommended.",
    endDescription:
      "Return to the Sedona check-in point after Tlaquepaque and final scenic stops.",
    itineraryItems: [
      {
        title: "Chapel of the Holy Cross",
        description:
          "Visit Chapel of the Holy Cross built into Sedona's red cliffs with valley views.",
        duration: "40 minutes",
        stopType: "stop",
      },
      {
        title: "Tlaquepaque Arts & Shopping Village",
        description:
          "Explore Tlaquepaque Arts & Shopping Village galleries, courtyards, and local shops.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Amitabha Stupa and Peace Park",
        description:
          "Stop at Amitabha Stupa and Peace Park for a Buddhist stupa and meditation garden visit.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Lover's Knoll",
        description:
          "Photo stop at Lover's Knoll viewpoint above Oak Creek red rock formations.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Airport Mesa",
        description:
          "Finish the vortex loop with views from Airport Mesa above Sedona.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Jeep 4x4 transport",
      "Professional driver-guide",
      "Comprehensive landmark routing",
      "Bottled water",
    ],
    categories: ["4WD Tours", "Jeep Tours", "Sightseeing Tours"],
  },
  {
    productCode: "15880P10",
    productUrl:
      "https://www.viator.com/tours/Sedona/Outback/d750-15880P10",
    title: "Sedona Off-Road Jeep Tour: Rugged Western Canyons & Wildlife",
    description:
      "Trade pavement for a three-hour rugged Jeep safari through western Sedona canyons in Coconino National Forest backcountry. Drivers climb rocky tracks past Snoopy Rock and Bear Mountain Trail viewpoints with chances to spot mule deer, javelina, and raptors above juniper flats. You'll trade chapel stops for thrills and remote scenery, appealing to adventure seekers who want dust, tilt, and wide canyon silence minutes from town. Guides interpret how water carved slot sections and how indigenous peoples used these drainages for travel and gathering. This is among Sedona's most popular off-road experiences for good reason—book early for peak season afternoons and wear clothes you do not mind getting dusty.",
    duration: "3 hours (approx.)",
    priceFrom: 134.81,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/15/25/df/5f.jpg",
    rating: 4.9,
    reviewCount: 1462,
    highlights: [
      "Three-hour rugged western Sedona Jeep safari",
      "Coconino National Forest backcountry canyon routing",
      "Snoopy Rock and Bear Mountain Trail viewpoints",
      "Wildlife viewing opportunities for deer and javelina",
      "High-adventure off-road format with expert drivers",
    ],
    startDescription:
      "Check in at the Sedona Jeep tour staging area confirmed at booking. Arrive 15 minutes early.",
    endDescription:
      "Return to the Sedona staging area after the western canyon loop.",
    itineraryItems: [
      {
        title: "Coconino National Forest",
        description:
          "Enter Coconino National Forest backroads west of Sedona for the rugged canyon loop.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Snoopy Rock",
        description:
          "Pass Snoopy Rock formation where eroded sandstone resembles the cartoon beagle profile.",
        stopType: "pass-by",
      },
      {
        title: "Cathedral Rock",
        description:
          "View Cathedral Rock spires from western canyon vantage points above Oak Creek.",
        stopType: "pass-by",
      },
      {
        title: "Bear Mountain Trail",
        description:
          "Stop near Bear Mountain Trail country for canyon panoramas and wildlife scanning.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Jeep 4x4 transport",
      "Professional driver-guide",
      "National forest access",
      "Bottled water",
    ],
    categories: ["4WD Tours", "Jeep Tours", "Nature and Wildlife Tours"],
  },
  {
    productCode: "32242P1",
    productUrl:
      "https://www.viator.com/tours/Sedona/Guided-ATV-Tour-of-Western-Sedona/d750-32242P1",
    title: "Sedona's ONLY Guided ATV Tour: Western Red Rock Backcountry",
    description:
      "Drive your own ATV on Sedona's only guided backcountry tour through western red rock terrain unreachable by passenger cars. After orientation at Arizona ATV Adventures, follow a lead guide on a four-hour loop across sandy washes, juniper mesas, and cliff-lined corridors with stops for photos and red rock interpretation. No prior ATV experience is required, but operators verify comfort with automatic transmissions and provide helmets plus safety instruction before departure. The pace mixes moderate speed sections with scenic pauses overlooking Courthouse Butte country and remote canyon fins. Wear long pants, closed-toe shoes, and sunscreen; expect dust and vibration on this active alternative to windshield touring.",
    duration: "4 hours (approx.)",
    priceFrom: 238.53,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/r/33/72/f3/f1/caption.jpg",
    rating: 5,
    reviewCount: 1845,
    highlights: [
      "Sedona's only guided ATV backcountry tour",
      "Self-drive ATVs on western red rock routes",
      "Four-hour loop through remote Coconino National Forest terrain",
      "Helmets, safety briefing, and guide-led pacing included",
      "Photo stops at cliff-lined canyon viewpoints",
    ],
    startDescription:
      "Meet at Arizona ATV Adventures staging area in western Sedona. Arrive 30 minutes early for waiver and safety training.",
    endDescription:
      "Return ATVs to Arizona ATV Adventures after the guided backcountry loop.",
    itineraryItems: [],
    inclusions: [
      "ATV rental and fuel",
      "Helmet and safety gear",
      "Professional lead guide",
      "Safety training",
    ],
    categories: ["ATV Tours", "Extreme Sports", "Adventure Tours"],
  },
  {
    productCode: "291644P1",
    productUrl:
      "https://www.viator.com/tours/Sedona/Our-Vortex-Tour/d750-291644P1",
    title: "Sedona Vortex Odyssey - A Spiritual & Scientific Adventure",
    description:
      "Dynamic Journey Tours leads this three-hour van tour through Sedona vortex country with guides who blend metaphysical tradition and scientific context. Stops typically include Airport Mesa, Amitabha Stupa and Peace Park, Lover's Knoll, and viewpoints toward Boynton Canyon, Chimney Rock, and Capitol Butte while you learn how geology, Native heritage, and 1980s New Age literature shaped Sedona's vortex reputation. The van format keeps walking moderate and suits couples on opposite sides of the belief spectrum who still want shared outdoor time. Guides encourage personal reflection at each site rather than scripted rituals, emphasizing what public lands allow and how to visit respectfully. No pets; meet at the operator address on Roadrunner Drive.",
    duration: "3 hours (approx.)",
    priceFrom: 110.5,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/15/73/d5/25.jpg",
    rating: 4.9,
    reviewCount: 573,
    highlights: [
      "Three-hour Sedona vortex van tour with scientific and spiritual context",
      "Airport Mesa and Amitabha Stupa and Peace Park stops",
      "Views toward Boynton Canyon and Chimney Rock formations",
      "Local guides from Dynamic Journey Tours",
      "Moderate walking with van transport between sites",
    ],
    startDescription:
      "Meet at 105 Roadrunner Dr, Sedona, AZ 86336 at your confirmed departure time.",
    endDescription:
      "Return to 105 Roadrunner Dr after the final vortex viewpoint stop.",
    itineraryItems: [
      {
        title: "Dynamic Journey Tours",
        description:
          "Dynamic Journey Tours check-in at 105 Roadrunner Dr before boarding the van.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Airport Mesa",
        description:
          "Visit Airport Mesa vortex viewpoint above Sedona's red rock basin.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Boynton Canyon",
        description:
          "View Boynton Canyon red walls from a designated overlook on the vortex route.",
        stopType: "pass-by",
      },
      {
        title: "Amitabha Stupa and Peace Park",
        description:
          "Stop at Amitabha Stupa and Peace Park for a stupa walk and meditation garden time.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Chimney Rock",
        description:
          "Photo perspective toward Chimney Rock spire from the guided van route.",
        stopType: "pass-by",
      },
      {
        title: "Capitol Butte",
        description:
          "Pass Capitol Butte formations while learning how local geology relates to vortex lore.",
        stopType: "pass-by",
      },
      {
        title: "Lover's Knoll",
        description:
          "Finish with Lover's Knoll scenic stop above Oak Creek red rock country.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional vortex guide",
      "Van transport",
      "Interpretive commentary",
      "Bottled water",
    ],
    categories: ["Bus Tours", "Religious Tours", "Sightseeing Tours"],
  },
  {
    productCode: "115255P2",
    productUrl:
      "https://www.viator.com/tours/Sedona/Hopi-Cultural-and-Archaeological-Tour/d750-115255P2",
    title: "Hopi Cultural and Archaeological Day Trip from Sedona or Flagstaff",
    description:
      "Travel from Sedona into Hopi tribal lands on a full-day small-group tour focused on living Native culture and ancestral archaeology. The route crosses Oak Creek Canyon toward the Little Painted Desert Scenic View before reaching Walpi Village on First Mesa, where Hopi guides explain centuries of continuous settlement, farming traditions, and artistic practice on the Colorado Plateau. A included lunch and respectful visitation guidelines frame the experience as cultural education rather than casual sightseeing. Expect nine to eleven hours on the road with moderate walking on mesa-top paths and strict photography rules inside village boundaries. This outing suits travelers who want depth beyond red rock Jeep loops and are willing to listen carefully on sovereign Hopi land.",
    duration: "9 to 11 hours (approx.)",
    priceFrom: 328.45,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/6b/f4/0c.jpg",
    rating: 5,
    reviewCount: 2,
    highlights: [
      "Full-day Hopi cultural tour from Sedona or Flagstaff",
      "Walpi Village visit on First Mesa with Hopi guides",
      "Oak Creek Canyon scenic drive en route to tribal lands",
      "Little Painted Desert Scenic View stop",
      "Included lunch and small-group educational format",
    ],
    startDescription:
      "Early-morning pickup from Sedona or Flagstaff hotels confirmed at booking. Expect a long day on the Colorado Plateau.",
    endDescription:
      "Return to your Sedona or Flagstaff pickup point after departing Hopi lands.",
    itineraryItems: [
      {
        title: "Oak Creek Canyon",
        description:
          "Drive north through Oak Creek Canyon toward the Colorado Plateau en route to Hopi country.",
        duration: "1 hour",
        stopType: "pass-by",
      },
      {
        title: "Little Painted Desert Scenic View",
        description:
          "Stop at Little Painted Desert Scenic View for badland colors on the approach to First Mesa.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Walpi Village",
        description:
          "Guided visit to Walpi Village on First Mesa with Hopi cultural interpretation.",
        duration: "2 hours",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional tour guide",
      "Small-group transport",
      "Hopi village access coordination",
      "Lunch",
    ],
    categories: ["Archaeology Tours", "Cultural Tours", "Day Trips"],
  },
];

const buildFixture = (tour: SedonaTourFixture) => {
  const viatorRatings = SEDONA_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: "Sedona", state: "Arizona" },
      duration: tour.duration,
      priceFrom: `From $${tour.priceFrom.toFixed(2)}`,
      reviews: {
        combinedAverageRating: rating,
        totalReviews: reviewCount,
      },
      media: {
        images: [
          {
            isCover: true,
            variants: {
              FULL: {
                url: tour.heroUrl,
                width: 674,
                height: 446,
              },
            },
          },
        ],
      },
      highlights: tour.highlights,
      logistics: {
        start: { description: tour.startDescription },
        end: { description: tour.endDescription },
      },
      itinerarySummary: `${tour.description.split(".").slice(0, 1).join(".")}.`,
      itineraryItems: tour.itineraryItems,
      inclusions: tour.inclusions,
      additionalInfo: [
        "Confirmation will be received at time of booking",
        "Not wheelchair accessible",
        "Near public transportation",
        "Most travelers can participate",
      ],
      faqs: [
        {
          question: `How long is the ${tour.title}?`,
          answer: `The planned duration is ${tour.duration.replace(" (approx.)", "")}.`,
        },
        {
          question: "Where does the tour depart from in Sedona?",
          answer: tour.startDescription,
        },
      ],
      categories: tour.categories.map(label => ({ label })),
      pricing: {
        summary: { fromPrice: tour.priceFrom },
        currency: "USD",
      },
    },
  };
};

const main = async () => {
  if (process.argv.includes("--bootstrap")) {
    const outputDir = path.join(process.cwd(), "data", "engine6", "viator");
    mkdirSync(outputDir, { recursive: true });

    for (const tour of SEDONA_TOURS) {
      const filePath = path.join(outputDir, `${tour.productCode}.exact-product.json`);
      writeFileSync(
        filePath,
        `${JSON.stringify(buildFixture(tour), null, 2)}\n`,
        "utf8"
      );
      console.log(`Wrote ${filePath}`);
    }

    console.log(`Bootstrapped ${SEDONA_TOURS.length} Sedona Engine6 fixtures.`);
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Sedona",
    destinationCitySlug: "sedona",
    viatorDestinationSlug: "Sedona",
    targetPremiumShare: 0.5,
    tours: SEDONA_TOURS,
    buildFixture,
    destinationLogLabel: "Sedona",
  });
};

await main();
