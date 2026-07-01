import { runEngine6ParagonFixtureGeneration } from "./lib/runEngine6ParagonFixtureGeneration";
type ItineraryItem = {
  title: string;
  description: string;
  duration?: string;
  stopType: "stop" | "pass-by";
};

type SeattleTourFixture = {
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

const TACDN = "https://media.tacdn.com/media/attractions-splice-spp-674x446";

const SEATTLE_TOURS: SeattleTourFixture[] = [
  {
    productCode: "5396P10",
    productUrl:
      "https://www.viator.com/tours/Seattle/Premier-3-Hour-Seattle-City-Tour/d704-5396P10",
    title: "Seattle City Premier Tour",
    description:
      "Explore Seattle on a guided three-hour city tour with stops at Pioneer Square, the Ballard Locks, and Kerry Park for skyline views. A local guide narrates the route through waterfront districts, historic neighborhoods, and landmark corridors before ending near the Space Needle.",
    duration: "3 hours (approx.)",
    priceFrom: 79,
    heroUrl: `${TACDN}/07/a6/42/4f.jpg`,
    rating: 4.7,
    reviewCount: 2100,
    highlights: [
      "Guided Seattle city tour in a mini coach",
      "Stops at Pioneer Square and the Ballard Locks",
      "Kerry Park skyline photo opportunity",
      "Drive-by views of Pike Place Market and the waterfront",
      "Local guide commentary on Seattle history",
    ],
    startDescription:
      "Pickup is available at select downtown Seattle hotels or a central meeting point confirmed after booking.",
    endDescription:
      "Tour ends near the Space Needle or returns to downtown Seattle.",
    itineraryItems: [
      {
        title: "Downtown departure",
        description:
          "Board the mini coach for orientation before the Seattle city route begins.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Pioneer Square",
        description:
          "Pass through Seattle's oldest neighborhood with commentary on pioneer-era architecture.",
        stopType: "pass-by",
      },
      {
        title: "Ballard Locks",
        description:
          "Stop to watch boats pass through the Hiram M. Chittenden Locks between Puget Sound and Lake Union.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Kerry Park",
        description:
          "Stop for panoramic views of the Seattle skyline, Space Needle, and Mount Rainier when weather allows.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Seattle Waterfront",
        description:
          "Drive along Elliott Bay waterfront corridors with views of ferries and harbor activity.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["Local guide", "Transport by air-conditioned mini coach"],
    categories: ["City Tours", "Bus Tours"],
  },
  {
    productCode: "40943P1",
    productUrl:
      "https://www.viator.com/tours/Seattle/Seattle-City-Tour/d704-40943P1",
    title: "Seattle City Tour with Space Needle Drop Offs",
    description:
      "See Seattle highlights on a small-group bus tour with stops at Pike Place Market, Kerry Park, the Space Needle, and the Fremont Troll. A local guide covers Chinatown, Pioneer Square, and Lake Union viewpoints on a compact city route.",
    duration: "3 hours (approx.)",
    priceFrom: 65,
    heroUrl: `${TACDN}/07/16/e9/13.jpg`,
    rating: 4.8,
    reviewCount: 890,
    highlights: [
      "Small-group Seattle bus tour with expert guide",
      "Photo stop at the Space Needle",
      "Visit the Fremont Troll sculpture",
      "Drive through Pike Place Market and Kerry Park",
      "Maximum 15 travelers per departure",
    ],
    startDescription:
      "Meet at a central downtown Seattle location or selected hotel pickup point.",
    endDescription: "Drop-off available at the Space Needle or downtown Seattle.",
    itineraryItems: [
      {
        title: "Pioneer Square",
        description:
          "Drive through Pioneer Square and the International District with historic commentary.",
        stopType: "pass-by",
      },
      {
        title: "Pike Place Market",
        description:
          "Pass the historic public market and waterfront corridors near Elliott Bay.",
        stopType: "pass-by",
      },
      {
        title: "Kerry Park",
        description:
          "Stop for classic Seattle skyline photos with Space Needle and mountain backdrops.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Space Needle",
        description:
          "Stop for photos at the Space Needle before optional drop-off at the landmark.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Fremont Troll",
        description:
          "View the iconic under-bridge sculpture in the Fremont neighborhood up close.",
        duration: "10 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Local guide", "Transport by air-conditioned vehicle"],
    categories: ["City Tours", "Bus Tours"],
  },
  {
    productCode: "479383P1",
    productUrl:
      "https://www.viator.com/tours/Seattle/Introduction-to-Seattle-Walking-Tour/d704-479383P1",
    title: "Welcome to Seattle Walking Tour with Monorail Ride",
    description:
      "Get oriented to Seattle on a guided walking tour through downtown and Pioneer Square, plus a scenic ride on the historic Seattle Monorail. A local guide introduces major neighborhoods, city history, and landmark viewpoints in a few hours.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 45,
    heroUrl: `${TACDN}/12/dc/31/76.jpg`,
    rating: 4.9,
    reviewCount: 420,
    highlights: [
      "Guided walking introduction to Seattle",
      "Ride on the historic Seattle Monorail",
      "Explore Pioneer Square and downtown corridors",
      "Small-group format with local guide",
      "Ideal for first-time Seattle visitors",
    ],
    startDescription: "Meet at 100 Yesler Way, Seattle, WA 98104 in Pioneer Square.",
    endDescription: "Tour ends near Seattle Center at 472 1st Ave N.",
    itineraryItems: [
      {
        title: "Pioneer Square",
        description:
          "Begin in Pioneer Square with an overview of Seattle founding history and architecture.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Downtown Seattle",
        description:
          "Walk through central districts with commentary on neighborhoods and city landmarks.",
        stopType: "stop",
      },
      {
        title: "Seattle Monorail",
        description:
          "Ride the historic monorail linking downtown to Seattle Center for skyline perspectives.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Seattle Center",
        description:
          "Arrive near the Space Needle and Seattle Center campus to finish the orientation route.",
        stopType: "stop",
      },
    ],
    inclusions: ["Local guide", "Monorail ticket"],
    categories: ["Walking Tours", "City Tours"],
  },
  {
    productCode: "36129P1",
    productUrl:
      "https://www.viator.com/tours/Seattle/Beneath-The-Streets/d704-36129P1",
    title: "Beneath The Streets Underground History Tour",
    description:
      "Explore Pioneer Square on a guided walking tour through Seattle's historic underground passageways built after the Great Seattle Fire. A local guide shares stories of the city's early settlement, architecture, and subterranean corridors beneath modern streets.",
    duration: "1 hour (approx.)",
    priceFrom: 29,
    heroUrl: `${TACDN}/06/71/17/c6.jpg`,
    rating: 4.8,
    reviewCount: 1800,
    highlights: [
      "Guided underground tour of Pioneer Square",
      "Explore passageways built after the 1889 fire",
      "Local guide shares Seattle origin stories",
      "Covers three blocks of historic subterranean routes",
      "Boutique tour with engaging narration",
    ],
    startDescription: "Meet at 102 Cherry Street, Seattle, WA 98104 in Pioneer Square.",
    endDescription: "Tour returns to the Pioneer Square meeting area.",
    itineraryItems: [
      {
        title: "Pioneer Square",
        description:
          "Begin above ground in Pioneer Square before descending into historic underground corridors.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "Underground passageways",
        description:
          "Walk through restored subterranean walkways built beneath post-fire Seattle street levels.",
        duration: "40 minutes",
        stopType: "stop",
      },
      {
        title: "Historic storefronts",
        description:
          "View remnants of nineteenth-century shopfronts and sidewalks preserved below modern Pioneer Square.",
        stopType: "stop",
      },
    ],
    inclusions: ["Local guide"],
    categories: ["Walking Tours", "Historical Tours"],
  },
  {
    productCode: "2956PIKEPL",
    productUrl:
      "https://www.viator.com/tours/Seattle/Food-and-Cultural-Walking-Tour-of-Pike-Place-Market/d704-2956PIKEPL",
    title: "Pike Place Market Tasting Tour",
    description:
      "Sample Pike Place Market on a guided food and culture walking tour with tastings from local vendors. The route covers market stalls, specialty foods, and the history of Seattle's most famous public market.",
    duration: "2 hours (approx.)",
    priceFrom: 69,
    heroUrl: `${TACDN}/0b/ee/f4/4d.jpg`,
    rating: 4.9,
    reviewCount: 3200,
    highlights: [
      "Guided Pike Place Market tasting tour",
      "Multiple food samples from market vendors",
      "Behind-the-scenes market stories and history",
      "Walking route through main market levels",
      "Small-group experience with local guide",
    ],
    startDescription:
      "Meet at 1901 Western Ave Suite E on the covered ramp outside Honest Biscuits at the north end of Pike Place Market.",
    endDescription: "Tour ends near Bottega Italiana Gelato at 1425 1st Avenue.",
    itineraryItems: [
      {
        title: "Pike Place Market",
        description:
          "Meet at the market edge before entering the main hall for the tasting route.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "Market vendor tastings",
        description:
          "Sample produce, smoked salmon, pastries, and specialty items from curated market stalls.",
        duration: "90 minutes",
        stopType: "stop",
      },
      {
        title: "Market history",
        description:
          "Learn how Pike Place Market began more than a century ago while moving between food stops.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["Local guide", "Food tastings"],
    categories: ["Food Tours", "Walking Tours"],
  },
  {
    productCode: "23161P1",
    productUrl:
      "https://www.viator.com/tours/Seattle/Chef-Guided-Food-Tour-of-Pike-Place-Market/d704-23161P1",
    title: "Chef Guided Food Tour of Pike Place Market",
    description:
      "Tour Pike Place Market with a chef guide who introduces vendor relationships, seasonal ingredients, and behind-the-scenes market culture. Tastings highlight Pacific Northwest flavors across multiple stops in the historic market.",
    duration: "2 hours (approx.)",
    priceFrom: 73,
    heroUrl: `${TACDN}/12/02/be/65.jpg`,
    rating: 4.9,
    reviewCount: 650,
    highlights: [
      "Chef-led Pike Place Market food tour",
      "Behind-the-scenes vendor introductions",
      "Multiple curated tastings across the market",
      "Learn Pacific Northwest ingredient traditions",
      "Small-group walking format",
    ],
    startDescription:
      "Meet at the confirmed Pike Place Market meeting point listed in your booking confirmation.",
    endDescription: "Tour finishes within Pike Place Market.",
    itineraryItems: [
      {
        title: "Market meeting point",
        description:
          "Join the chef guide at the market entrance before the curated tasting route begins.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "Vendor tastings",
        description:
          "Sample dishes and ingredients from select Pike Place vendors with chef commentary.",
        duration: "90 minutes",
        stopType: "stop",
      },
      {
        title: "Market corridors",
        description:
          "Walk market lanes while learning about vendor history and seasonal Pacific Northwest produce.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["Chef guide", "Food tastings"],
    categories: ["Food Tours", "Walking Tours"],
  },
  {
    productCode: "2956EXCLUSIVE",
    productUrl:
      "https://www.viator.com/tours/Seattle/Viator-Exclusive-Early-Access-Food-Tour-of-Pike-Place-Market/d704-2956EXCLUSIVE",
    title: "Early-Bird Tasting Tour of Pike Place Market",
    description:
      "Explore Pike Place Market before peak crowds on an early-access guided tasting tour. Sample smoked salmon, local chocolate, and market specialties while vendors prepare for the day in a quieter market setting.",
    duration: "2 hours (approx.)",
    priceFrom: 76,
    heroUrl: `${TACDN}/09/b2/ce/f2.jpg`,
    rating: 4.9,
    reviewCount: 980,
    highlights: [
      "Early-access Pike Place Market food tour",
      "Tastings before peak market crowds arrive",
      "Sample smoked salmon and local sweets",
      "Small-group tour limited to 12 people",
      "Viator Exclusive early-morning access",
    ],
    startDescription: "Meet at 1901 Western Ave D, Seattle, WA 98101.",
    endDescription: "Tour ends within Pike Place Market.",
    itineraryItems: [
      {
        title: "Early market entry",
        description:
          "Enter Pike Place Market during quiet morning hours before the main crowds arrive.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Vendor tastings",
        description:
          "Sample smoked salmon, chocolate, and market specialties from opening vendors.",
        duration: "75 minutes",
        stopType: "stop",
      },
      {
        title: "Market history",
        description:
          "Learn how the market evolved over more than a century while tasting local favorites.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["Local guide", "Food tastings"],
    categories: ["Food Tours", "Walking Tours"],
  },
  {
    productCode: "7812P115",
    productUrl:
      "https://www.viator.com/tours/Seattle/Secret-Food-Tours-Seattle/d704-7812P115",
    title: "Seattle Pike Market Food Tour with 8 Authentic Local Tastings",
    description:
      "Discover Pike Place Market on a Secret Food Tours walking route with eight authentic local tastings including clam chowder, piroshki, and artisan sweets. The tour explores main market levels and the DownUnder area with a licensed market guide.",
    duration: "3 hours (approx.)",
    priceFrom: 75,
    heroUrl: `${TACDN}/12/72/ff/7c.jpg`,
    rating: 4.9,
    reviewCount: 540,
    highlights: [
      "Eight curated Pike Place Market tastings",
      "Licensed tour in the historic market district",
      "Sample clam chowder and local artisan foods",
      "Explore market lanes and the DownUnder level",
      "Small-group guided food experience",
    ],
    startDescription: "Meet in front of Sur La Table at 84 Pine Street, Seattle, WA 98101.",
    endDescription: "Tour ends near Pike Place Market by the Gum Wall.",
    itineraryItems: [
      {
        title: "Sur La Table meeting point",
        description:
          "Meet the guide at Pine Street before entering Pike Place Market for the tasting route.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "Market food stops",
        description:
          "Sample eight local favorites including chowder, piroshki, and a signature secret dish.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Pike Place DownUnder",
        description:
          "Descend to the DownUnder level for vendor scenes and North Pacific fishing traditions.",
        stopType: "stop",
      },
    ],
    inclusions: ["Local guide", "Food tastings"],
    categories: ["Food Tours", "Walking Tours"],
  },
  {
    productCode: "2960HARBOR",
    productUrl:
      "https://www.viator.com/tours/Seattle/Seattle-Harbor-Cruise/d704-2960HARBOR",
    title: "Seattle's Original Guided Harbor Cruise",
    description:
      "Cruise Elliott Bay and Seattle Harbor on a one-hour narrated boat tour departing from Pier 55. The route offers skyline views, shipping-terminal perspectives, and mountain backdrops including the Cascades, Olympics, and Mount Rainier when visible.",
    duration: "1 hour (approx.)",
    priceFrom: 46,
    heroUrl: `${TACDN}/15/20/06/fb.jpg`,
    rating: 4.7,
    reviewCount: 5800,
    highlights: [
      "One-hour narrated Elliott Bay harbor cruise",
      "Depart from Pier 55 on the Seattle waterfront",
      "Views of the skyline, Great Wheel, and Space Needle",
      "See one of the world's largest shipping terminals",
      "Mountain panoramas when weather permits",
    ],
    startDescription: "Board at Pier 55, 1101 Alaskan Way, Seattle, WA 98101.",
    endDescription: "Return to Pier 55 after the harbor loop.",
    itineraryItems: [
      {
        title: "Pier 55 departure",
        description:
          "Board the vessel at the Seattle waterfront before the narrated harbor loop begins.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "Elliott Bay",
        description:
          "Cruise Elliott Bay with commentary on Seattle's waterfront history and harbor operations.",
        stopType: "pass-by",
      },
      {
        title: "Seattle skyline",
        description:
          "View the city skyline, Great Wheel, and Space Needle from open-water perspectives.",
        stopType: "pass-by",
      },
      {
        title: "Shipping terminal",
        description:
          "Pass one of the largest container shipping terminals on the West Coast.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["Live narration"],
    categories: ["Boat Tours", "Sightseeing Cruises"],
  },
  {
    productCode: "3657RAINIER",
    productUrl:
      "https://www.viator.com/tours/Seattle/Mt-Rainier-Day-Trip-from-Seattle/d704-3657RAINIER",
    title: "Mt. Rainier National Park Day Tour from Seattle",
    description:
      "Travel from Seattle to Mount Rainier National Park on a full-day guided tour with stops at Narada Falls, Paradise, and Longmire. A narrated drive crosses lakes and foothill scenery before exploring the park's waterfalls and mountain viewpoints.",
    duration: "10 to 12 hours (approx.)",
    priceFrom: 189,
    heroUrl: `${TACDN}/12/33/7e/f5.jpg`,
    rating: 4.8,
    reviewCount: 1200,
    highlights: [
      "Full-day Mount Rainier tour from Seattle",
      "Stops at Narada Falls and Paradise area viewpoints",
      "Visit Longmire visitor area in the national park",
      "Hotel pickup from select Seattle locations",
      "Narrated scenic drive through Cascade foothills",
    ],
    startDescription:
      "Pickup available from select downtown Seattle and airport-area hotels.",
    endDescription: "Return to the original Seattle pickup location.",
    itineraryItems: [
      {
        title: "Seattle departure",
        description:
          "Depart Seattle by coach for the drive south toward Mount Rainier National Park.",
        stopType: "pass-by",
      },
      {
        title: "Longmire",
        description:
          "Stop at the Longmire area for park orientation and visitor center perspectives.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Narada Falls",
        description:
          "Visit Narada Falls, one of the most photographed waterfalls in the national park.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Paradise",
        description:
          "Explore the Paradise area for alpine meadows and Mount Rainier viewpoints when conditions allow.",
        duration: "2 hours",
        stopType: "stop",
      },
    ],
    inclusions: ["Local guide", "Transport by air-conditioned vehicle", "National park entry"],
    categories: ["Day Trips", "Nature Tours"],
  },
  {
    productCode: "5396MTR",
    productUrl:
      "https://www.viator.com/tours/Seattle/Mt-Rainier-Day-Tour-from-Seattle/d704-5396MTR",
    title: "Mt. Rainier Day Tour from Seattle",
    description:
      "Visit Mount Rainier National Park on a full-day small-group tour from Seattle with a professional guide. Seasonal routes include old-growth forests, wildflower meadows, waterfalls, and optional short hikes with flexible pacing for all abilities.",
    duration: "8 to 10 hours (approx.)",
    priceFrom: 159,
    heroUrl: `${TACDN}/0f/e6/16/f2.jpg`,
    rating: 4.8,
    reviewCount: 950,
    highlights: [
      "Full-day Mount Rainier tour in a mini coach",
      "Seasonal routes through forests and waterfall viewpoints",
      "Optional short hikes with flexible pacing",
      "Multiple downtown Seattle pickup locations",
      "Professional guide adapts route to conditions",
    ],
    startDescription:
      "Meet at Seattle Public Library, Matt Griffin YMCA SeaTac, or other listed central pickup points.",
    endDescription: "Return to the original Seattle meeting location.",
    itineraryItems: [
      {
        title: "Seattle pickup",
        description:
          "Board the mini coach at a central Seattle meeting point before heading toward the national park.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Mount Rainier National Park",
        description:
          "Enter the park for a guide-selected route based on season, weather, and trail conditions.",
        duration: "5 hours",
        stopType: "stop",
      },
      {
        title: "Waterfall viewpoints",
        description:
          "Stop at cascading falls and scenic overlooks such as Narada Falls when accessible.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Alpine viewpoints",
        description:
          "Visit meadow or mountain overlooks for Mount Rainier panoramas when weather allows.",
        stopType: "stop",
      },
    ],
    inclusions: ["Local guide", "Transport by mini coach"],
    categories: ["Day Trips", "Nature Tours"],
  },
  {
    productCode: "351474P1",
    productUrl:
      "https://www.viator.com/tours/Seattle/Touring-and-hiking-scenic-places-in-Mt-Rainier-National-Park/d704-351474P1",
    title: "Mt. Rainier Tour and Guided Hike",
    description:
      "Combine a Mount Rainier National Park tour from Seattle with guided hiking on alpine trails. The outing includes old-growth forest walks, waterfall stops, and glacier viewpoints with trekking poles and seasonal snowshoes provided when needed.",
    duration: "10 hours (approx.)",
    priceFrom: 179,
    heroUrl: `${TACDN}/0e/eb/c4/82.jpg`,
    rating: 4.9,
    reviewCount: 380,
    highlights: [
      "Guided hike in Mount Rainier National Park",
      "Old-growth forest and waterfall trail segments",
      "Trekking poles and snowshoes provided seasonally",
      "Lunch and snacks included on the tour day",
      "Small-group transport from Seattle",
    ],
    startDescription:
      "Pickup from a central Seattle meeting point confirmed after booking.",
    endDescription: "Return to the Seattle departure location.",
    itineraryItems: [
      {
        title: "Seattle departure",
        description:
          "Travel from Seattle toward Mount Rainier National Park with guide orientation en route.",
        stopType: "pass-by",
      },
      {
        title: "Guided trail hike",
        description:
          "Hike a guide-selected alpine trail with trekking poles provided for steady footing.",
        duration: "3 hours",
        stopType: "stop",
      },
      {
        title: "Narada Falls",
        description:
          "Stop at Narada Falls for photos and short walks when trail conditions allow.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Glacier viewpoints",
        description:
          "Reach scenic overlooks for Mount Rainier glacier and valley perspectives.",
        stopType: "stop",
      },
    ],
    inclusions: ["Local guide", "Lunch", "Trekking poles", "Transport"],
    categories: ["Hiking Tours", "Day Trips"],
  },
  {
    productCode: "3132SMB",
    productUrl:
      "https://www.viator.com/tours/Seattle/Morning-Tour-of-Boeing-Factory-from-Seattle/d704-3132SMB",
    title: "Boeing Factory Tour with Guided Transport from Seattle",
    description:
      "Travel from downtown Seattle to the Boeing Future of Flight facility for a guided factory tour of the world's largest building by volume. Explore assembly-line viewing areas and aviation exhibits with round-trip transport from the Hyatt Regency Seattle.",
    duration: "4 hours (approx.)",
    priceFrom: 125,
    heroUrl: `${TACDN}/06/f8/91/1b.jpg`,
    rating: 4.7,
    reviewCount: 620,
    highlights: [
      "Round-trip transport from downtown Seattle",
      "Guided Boeing factory assembly tour",
      "Visit Future of Flight Aviation Center exhibits",
      "Small-group morning departure format",
      "See 777 and 787 production lines from viewing balconies",
    ],
    startDescription:
      "Pickup at Hyatt Regency Seattle, 808 Howell Street, Seattle, WA 98101.",
    endDescription: "Return to the Hyatt Regency Seattle pickup location.",
    itineraryItems: [
      {
        title: "Hyatt Regency pickup",
        description:
          "Meet at the downtown Seattle hotel before the drive north to Everett.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Future of Flight Center",
        description:
          "Explore aviation exhibits and gallery displays before the factory tour begins.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Boeing factory tour",
        description:
          "Tour the assembly plant viewing areas to see commercial aircraft production lines.",
        duration: "90 minutes",
        stopType: "stop",
      },
      {
        title: "Return to Seattle",
        description:
          "Drive back to downtown Seattle after the factory and gallery visit.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["Local driver/guide", "Factory tour admission", "Round-trip transport"],
    categories: ["Day Trips", "Factory Tours"],
  },
  {
    productCode: "5396BOEING",
    productUrl:
      "https://www.viator.com/tours/Seattle/Boeing-Factory-Tour-from-Seattle/d704-5396BOEING",
    title: "Boeing Factory Tour from Seattle",
    description:
      "Take a half-day trip from Seattle to the Boeing Everett factory for a guided assembly-plant tour and Future of Flight exhibits. Hotel pickup across the greater Seattle area includes time at the aviation gallery and gift shop.",
    duration: "4 to 5 hours (approx.)",
    priceFrom: 119,
    heroUrl: `${TACDN}/06/6e/f3/0f.jpg`,
    rating: 4.7,
    reviewCount: 780,
    highlights: [
      "Half-day Boeing factory tour from Seattle",
      "Hotel pickup across greater Seattle area",
      "Guided assembly-plant viewing tour",
      "Future of Flight interpretive center visit",
      "See wide-body aircraft in production",
    ],
    startDescription:
      "Hotel pickup available across the greater Seattle area when confirmed after booking.",
    endDescription: "Return to the original Seattle pickup location.",
    itineraryItems: [
      {
        title: "Seattle hotel pickup",
        description:
          "Board the tour vehicle for the drive north to the Boeing Everett campus.",
        stopType: "stop",
      },
      {
        title: "Aviation Center Gallery",
        description:
          "Browse interactive aviation exhibits before the factory tour segment.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Boeing assembly plant",
        description:
          "Tour the world's largest building by volume with views of aircraft assembly lines.",
        duration: "90 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Local guide", "Factory tour admission", "Hotel pickup and drop-off"],
    categories: ["Day Trips", "Factory Tours"],
  },
  {
    productCode: "8647P594",
    productUrl:
      "https://www.viator.com/tours/Seattle/Private-5-hour-City-Tour-of-Seattle-and-Snoqualmie-Falls-with-driver-guide/d704-8647P594",
    title: "Private Seattle City and Snoqualmie Falls Tour",
    description:
      "Explore Seattle and Snoqualmie Falls on a private five-hour tour with a dedicated driver-guide. The flexible route covers city landmarks such as Kerry Park and Pike Place Market before continuing east to the 268-foot Snoqualmie Falls overlook.",
    duration: "5 hours (approx.)",
    priceFrom: 703,
    heroUrl: `${TACDN}/12/dc/30/71.jpg`,
    rating: 4.9,
    reviewCount: 95,
    highlights: [
      "Private five-hour Seattle and Snoqualmie Falls tour",
      "Dedicated driver-guide for your group only",
      "Flexible city stops including Kerry Park",
      "Visit the famous Snoqualmie Falls overlook",
      "Hotel or cruise port pickup available",
    ],
    startDescription:
      "Private pickup from your Seattle hotel, cruise port, or confirmed central meeting point.",
    endDescription: "Return to your Seattle hotel or cruise port.",
    itineraryItems: [
      {
        title: "Seattle city highlights",
        description:
          "Drive to selected Seattle landmarks such as Kerry Park, Pike Place Market, or the Space Needle area.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Snoqualmie Falls",
        description:
          "Travel east to the 268-foot Snoqualmie Falls overlook and surrounding park viewpoints.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Scenic return drive",
        description:
          "Return toward Seattle through Cascade foothill scenery with flexible photo stops when time allows.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["Private driver-guide", "Private vehicle", "Hotel pickup and drop-off"],
    categories: ["Private Tours", "Day Trips"],
  },
];

const buildFixture = (tour: SeattleTourFixture) => ({
  product: {
    productCode: tour.productCode,
    productUrl: tour.productUrl,
    title: tour.title,
    description: { text: tour.description },
    location: { city: "Seattle", state: "Washington" },
    duration: tour.duration,
    priceFrom: `From $${tour.priceFrom.toFixed(2)}`,
    reviews: {
      combinedAverageRating: tour.rating,
      totalReviews: tour.reviewCount,
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
    itinerarySummary: tour.description.split(".").slice(0, 1).join(".") + ".",
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
        question: "Where does the tour depart from in Seattle?",
        answer: tour.startDescription,
      },
    ],
    categories: tour.categories.map(label => ({ label })),
    pricing: {
      summary: { fromPrice: tour.priceFrom },
      currency: "USD",
    },
  },
});

const main = async () => {
  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Seattle",
    destinationCitySlug: "seattle",
    viatorDestinationSlug: "Seattle",
    tours: SEATTLE_TOURS,
    buildFixture,
    destinationLogLabel: "Seattle",
  });
};

await main();
