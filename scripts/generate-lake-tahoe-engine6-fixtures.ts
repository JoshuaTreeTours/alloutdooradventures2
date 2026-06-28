import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { LAKE_TAHOE_VIATOR_PUBLIC_RATINGS } from "../src/engine6/lakeTahoeViatorPublicRatings";

type ItineraryItem = {
  title: string;
  description: string;
  duration?: string;
  stopType: "stop" | "pass-by";
};

type LakeTahoeTourFixture = {
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

const LAKE_TAHOE_TOURS: LakeTahoeTourFixture[] = [
  {
    productCode: "2535P4",
    productUrl:
      "https://www.viator.com/tours/Lake-Tahoe/M-S-Dixie-II-Emerald-Bay-Scenic-Cruise/d816-2535P4",
    title: "Lake Tahoe Emerald Bay Scenic Cruise",
    description:
      "Board a classic paddlewheeler for a scenic cruise around Lake Tahoe's Emerald Bay. An included audio guide shares how the bay formed, stories of Fannette Island, and views of Vikingsholm Castle while you choose open-air decks or climate-controlled seating.",
    duration: "2 to 3 hours (approx.)",
    priceFrom: 104.94,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/d6/cf/11.jpg",
    rating: 4.5,
    reviewCount: 729,
    highlights: [
      "Scenic paddlewheel cruise to Emerald Bay",
      "Included audio guide on Fannette Island and Vikingsholm Castle",
      "Open-air decks and indoor climate-controlled seating",
      "Complimentary shuttle service from select South Shore hotels",
      "Onboard restrooms and optional food and bar service",
    ],
    startDescription:
      "Meet at Zephyr Cove Marina, 760 US-50, Zephyr Cove, NV 89448. Arrive 30 minutes before departure to check in at the boat dock.",
    endDescription: "Return to Zephyr Cove Marina after the cruise.",
    itineraryItems: [
      {
        title: "Lake Tahoe Cruises / MS Dixie II",
        description:
          "Board the MS Dixie II paddlewheeler at Zephyr Cove Marina for the Emerald Bay sightseeing route.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Fannette Island",
        description:
          "Pass by Fannette Island while the audio guide shares Tahoe history and Emerald Bay geology.",
        stopType: "pass-by",
      },
      {
        title: "Emerald Bay State Park",
        description:
          "Cruise along Emerald Bay with close views of alpine shoreline and Vikingsholm Castle.",
        stopType: "pass-by",
      },
      {
        title: "Zephyr Cove",
        description: "Return along the South Shore with views of Zephyr Cove.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["All fees and taxes", "Restroom on board", "Audio guide"],
    categories: ["Day Cruises", "Sightseeing Tours"],
  },
  {
    productCode: "271742P1",
    productUrl:
      "https://www.viator.com/tours/Lake-Tahoe/Daily-South-Lake-Tahoe-Sailing-Cruise/d816-271742P1",
    title: "2 Hour Sailing Cruise on Lake Tahoe",
    description:
      "Sail Tahoe Blue on a small-group yacht limited to 18 passengers. This daily South Lake Tahoe sailing cruise includes complimentary local beer, wine, and non-alcoholic beverages while you glide across the lake under wind power.",
    duration: "2 hours (approx.)",
    priceFrom: 149,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/bb/44/51.jpg",
    rating: 5.0,
    reviewCount: 933,
    highlights: [
      "Small-group sailing yacht limited to 18 passengers",
      "Complimentary local beer, wine, and non-alcoholic beverages",
      "Wind-powered cruise without engine noise",
      "Daily departures from South Lake Tahoe",
      "Restroom on board",
    ],
    startDescription:
      "Meet at the Sail Tahoe Blue check-in window next to Riva Grill, 900 Ski Run Blvd, South Lake Tahoe, CA 96150. Arrive 30 minutes before departure.",
    endDescription:
      "Return to the Sail Tahoe Blue meeting point at Riva Grill.",
    itineraryItems: [
      {
        title: "Lake Tahoe (California)",
        description:
          "Set sail from South Lake Tahoe for a two-hour cruise on clear alpine water.",
        duration: "2 hours",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Alcoholic beverages",
      "Bottled water",
      "Restroom on board",
    ],
    categories: ["Sailing", "Cruises & Sailing"],
  },
  {
    productCode: "6508TAHOE",
    productUrl:
      "https://www.viator.com/tours/Lake-Tahoe/Lake-Tahoe-Circle-Tour-Including-Squaw-Valley/d816-6508TAHOE",
    title: "Full-Day Lake Tahoe Circle Tour including Olympic Valley",
    description:
      "Circle the full lake on a comfortable air-conditioned shuttle with a driver-guide. Stops include Palisades Tahoe, Emerald Bay State Park, Tahoe City, and Logan Shoals Vista Trail with commentary on Tahoe history and landmarks.",
    duration: "7 hours 30 minutes (approx.)",
    priceFrom: 70,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/73/17/f3.jpg",
    rating: 4.5,
    reviewCount: 160,
    highlights: [
      "Full circumnavigation of Lake Tahoe by shuttle bus",
      "Stops at Palisades Tahoe and Emerald Bay State Park",
      "Logan Shoals Vista Trail and Tahoe City free time",
      "Hotel pickup and drop-off at select South Shore hotels",
      "Driver-guide commentary throughout the route",
    ],
    startDescription:
      "Pickup from select South Shore hotels including Marriott Resorts, Golden Nugget Lake Tahoe, and Hilton Vacation Club on Ski Run Blvd starting at 8:00 AM.",
    endDescription:
      "Return to your original South Shore hotel pickup point.",
    itineraryItems: [
      {
        title: "Palisades Tahoe",
        description:
          "Stop at the former Olympic Valley resort area with time to explore the village.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Lake Tahoe",
        description:
          "Travel the lakeshore ring road with scenic viewpoints and guide commentary.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Emerald Bay State Park",
        description:
          "Photo stop overlooking Emerald Bay and the surrounding alpine forest.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Tahoe City",
        description:
          "Free time in Tahoe City to explore shops, the waterfront, or grab lunch.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Logan Shoals Vista Trail",
        description: "Brief stop at a North Shore viewpoint above the lake.",
        duration: "15 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Air-conditioned shuttle bus", "Driver/guide", "Hotel pickup"],
    categories: ["Bus Tours", "Full-day Tours"],
  },
  {
    productCode: "383103P1",
    productUrl:
      "https://www.viator.com/tours/Lake-Tahoe/Clear-Kayak-Paddle-Tour-at-Sand-Harbor/d816-383103P1",
    title: "Clear Kayak Tour of Sand Harbor's Crystal Clear Waters",
    description:
      "Paddle clear kayaks on a small-group guided tour along Lake Tahoe's East Shore from Sand Harbor. A lifeguard-certified guide leads the route to hidden coves and landmarks such as Bonsai Rock with time to swim on warm days.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 150,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/10/74/cf/94.jpg",
    rating: 4.5,
    reviewCount: 222,
    highlights: [
      "Small-group clear kayak tour on the East Shore",
      "Lifeguard-certified guide leads the paddle route",
      "Views of Sand Harbor, Bonsai Rock, and hidden coves",
      "Swim breaks on warm days in crystal-clear water",
      "Kayak, paddle, and safety gear included",
    ],
    startDescription:
      "Meet at Sand Harbor on the East Shore, launching from 797 Southwood Blvd, Incline Village area.",
    endDescription: "Return to the Sand Harbor launch point after the paddle.",
    itineraryItems: [
      {
        title: "Incline Village",
        description:
          "Check in and receive kayak gear before launching from Sand Harbor.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Lake Tahoe Area",
        description:
          "Paddle along the East Shore to scenic coves and Bonsai Rock with guide commentary.",
        duration: "2 hours",
        stopType: "stop",
      },
    ],
    inclusions: ["Clear kayak", "Paddle", "Guide", "Safety equipment"],
    categories: ["Kayaking Tours", "On the Water"],
  },
  {
    productCode: "70777P4",
    productUrl:
      "https://www.viator.com/tours/Lake-Tahoe/Truckee-River-Boca-to-Floriston-Run-Class-III-Whitewater/d816-70777P4",
    title: "Truckee River: Boca to Floriston Run (Class III Whitewater)",
    description:
      "Raft the Truckee River on a guided Class III whitewater run from Boca to Floriston Gorge. Begin with mellow rapids through Tahoe National Forest scenery, then build to intermediate rapids with optional swimming stops in natural pools on warm days.",
    duration: "3 hours 30 minutes (approx.)",
    priceFrom: 128.4,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/13/17/f7/85.jpg",
    rating: 5.0,
    reviewCount: 183,
    highlights: [
      "Class III whitewater run on the Truckee River",
      "Guides assist from put-in through Floriston Gorge",
      "PFD, helmet, and transport back to meeting point included",
      "Wetsuits and splash jackets provided in cold weather",
      "Scenic forest canyon setting near Lake Tahoe",
    ],
    startDescription:
      "Meet at Truckee River Put-In, 10550 Stampede Meadows Rd, Truckee, CA 96161. Plan to carpool when parking is limited.",
    endDescription:
      "Shuttle returns you to the Truckee River meeting point after the run.",
    itineraryItems: [
      {
        title: "Lake Tahoe (California)",
        description:
          "Launch on the Truckee River for a guided rafting run through forest canyon scenery.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Truckee",
        description:
          "Finish in Floriston Gorge with intermediate Class III rapids.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["PFD", "Helmet", "Return transport", "Wetsuits when needed"],
    categories: ["White Water Rafting", "Outdoor Activities"],
  },
  {
    productCode: "466292P2",
    productUrl:
      "https://www.viator.com/tours/Lake-Tahoe/The-Sand-Harbor-Experience-LAKE-TAHOES-MOST-BEAUTIFUL-BEACH/d816-466292P2",
    title: "Sand Harbor Experience Access & Beach Day at Tahoe's Beach",
    description:
      "Skip Sand Harbor parking hassles with VIP beach access and complimentary transport into the park. Guides set up chairs, umbrellas, towels, and beach games at Camp Tahoe while you enjoy three and a half hours on one of Lake Tahoe's most beautiful beaches.",
    duration: "3 hours 30 minutes (approx.)",
    priceFrom: 175,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/db/58/7c.jpg",
    rating: 5.0,
    reviewCount: 16,
    highlights: [
      "VIP access and transport into Sand Harbor State Park",
      "Beach setup with chairs, umbrellas, towels, and games",
      "Morning and afternoon session options",
      "Near Bonsai Rock on Lake Tahoe's East Shore",
      "Optional kayak and stand-up paddle rentals nearby",
    ],
    startDescription:
      "Meet at 889 NV-28, Incline Village, NV 89451. Use central Incline parking lots such as Raley's or Ace Hardware and walk or take TART transit to the meeting point.",
    endDescription:
      "Return transport brings you back to the Incline Village meeting area.",
    itineraryItems: [
      {
        title: "Incline Village Meeting Point",
        description:
          "Check in at the Incline Village meeting area before complimentary transport into Sand Harbor State Park.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Sand Harbor",
        description:
          "Enjoy a guided beach day at Sand Harbor with included park access and beach amenities.",
        duration: "3 hours",
        stopType: "stop",
      },
    ],
    inclusions: [
      "All fees and taxes",
      "Air-conditioned vehicle",
      "Beach chairs and umbrellas",
      "Towels and beach games",
    ],
    categories: ["Half-day Tours", "Outdoor Activities"],
  },
  {
    productCode: "268564P2",
    productUrl:
      "https://www.viator.com/tours/Lake-Tahoe/Lake-Tahoe-Half-Day-Electric-Bike-Rental-Ride-the-Scenic-Shoreline/d816-268564P2",
    title: "Tahoe Coastal Self-Guided E-Bike Tour on East Shore Trail",
    description:
      "Explore Lake Tahoe at your own pace on a self-guided electric bike rental along the car-free East Shore Trail. Ride from Incline Village toward Sand Harbor, stopping whenever you choose for photos, swims, or lunch with helmet, lock, and parking included.",
    duration: "2 to 4 hours (approx.)",
    priceFrom: 99.95,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/11/86/24/80.jpg",
    rating: 5.0,
    reviewCount: 332,
    highlights: [
      "Self-guided e-bike rental on the East Shore Trail",
      "Car-free bike path away from highway traffic",
      "Flexible two-, three-, or four-hour rental windows",
      "Helmet, bike lock, and parking fees included",
      "Route ends at Sand Harbor beach area",
    ],
    startDescription:
      "Pick up your e-bike next to Starbucks at 893 Tahoe Blvd, Incline Village, NV 89451.",
    endDescription:
      "Return your e-bike to the Incline Village pickup location.",
    itineraryItems: [
      {
        title: "Incline Village",
        description:
          "Pick up your e-bike next to Starbucks at 893 Tahoe Blvd in Incline Village.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "East Shore Trail",
        description:
          "Ride the scenic East Shore bike path at your own pace toward Sand Harbor.",
        duration: "2 to 4 hours",
        stopType: "stop",
      },
      {
        title: "Sand Harbor",
        description:
          "End the ride near Sand Harbor with optional beach and swim time.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["E-bike rental", "Helmet", "Bike lock", "Parking fees"],
    categories: ["Mountain Bike Tours", "Outdoor Activities"],
  },
  {
    productCode: "235497P3",
    productUrl:
      "https://www.viator.com/tours/Lake-Tahoe/2-Hour-Private-Lake-Tahoe-Shoreline-Cruise/d816-235497P3",
    title: "Private Emerald Bay Boat Cruise for Up to 12 Guests",
    description:
      "Charter a private captain-led boat for up to 12 guests on a two-hour Lake Tahoe cruise. Drop anchor in Emerald Bay for a swim, relax on floating lily pads, and use the onboard stereo while tailoring the route to your group.",
    duration: "2 hours (approx.)",
    priceFrom: 650,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/d7/70/1f.jpg",
    rating: 5.0,
    reviewCount: 32,
    highlights: [
      "Private two-hour boat charter for up to 12 guests",
      "Captain-led cruise with flexible shoreline routing",
      "Floating lily pads and onboard stereo system",
      "Swim stop options in Emerald Bay",
      "Depart from Tahoe Keys Marina in South Lake Tahoe",
    ],
    startDescription:
      "Meet at Rubicon Dock, Slip 135, Tahoe Keys Marina, 2435 Venice Dr E, South Lake Tahoe, CA 96150.",
    endDescription:
      "Return to Tahoe Keys Marina at the end of the private cruise.",
    itineraryItems: [
      {
        title: "Emerald Bay State Park",
        description:
          "Cruise to Emerald Bay with time to anchor, swim, and enjoy the private boat.",
        duration: "40 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Private captain", "Stereo system", "Floating lily pad"],
    categories: ["Private Tours", "Day Cruises"],
  },
  {
    productCode: "2535P14",
    productUrl:
      "https://www.viator.com/tours/Lake-Tahoe/Razor-Ridge-Run-Tour/d816-2535P14",
    title: "2-Hour Off-Road Razor Ridge Run Tour in the Desert",
    description:
      "Ride Polaris RZR side-by-sides through Carson Valley and the Pine Nut Mountains on a guided off-road tour. Scenic stops showcase high-desert views near Lake Tahoe with helmets, bandanas, and bottled water included for beginner and intermediate riders.",
    duration: "2 to 4 hours (approx.)",
    priceFrom: 185.5,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/15/99/1e/e1.jpg",
    rating: 4.5,
    reviewCount: 43,
    highlights: [
      "Guided off-road Razor tour through Carson Valley",
      "Scenic ridge runs in the Pine Nut Mountain Range",
      "Suited to beginner and intermediate riders",
      "Helmet, bandana, and bottled water included",
      "Complimentary shuttle from select South Shore hotels",
    ],
    startDescription:
      "Meet at the Lake Tahoe Adventures base with complimentary shuttle pickup available from select South Shore hotels.",
    endDescription:
      "Return to the meeting point or hotel shuttle drop-off after the ride.",
    itineraryItems: [
      {
        title: "Lake Tahoe Adventures Base",
        description:
          "Meet your guide, receive safety briefing, and board the Polaris RZR for the ridge run.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Carson Valley",
        description:
          "Follow your guide across desert washes, rocky hills, and sagebrush flats with photo stops.",
        duration: "2 hours",
        stopType: "stop",
      },
    ],
    inclusions: ["Helmet", "Bandana", "Bottled water"],
    categories: ["4WD Tours", "Outdoor Activities"],
  },
];

const buildFixture = (tour: LakeTahoeTourFixture) => {
  const viatorRatings = LAKE_TAHOE_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: "Lake Tahoe", state: "California" },
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
          question: "Where does the tour depart from at Lake Tahoe?",
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

const outputDir = path.join(process.cwd(), "data", "engine6", "viator");
mkdirSync(outputDir, { recursive: true });

for (const tour of LAKE_TAHOE_TOURS) {
  const filePath = path.join(
    outputDir,
    `${tour.productCode}.exact-product.json`
  );
  writeFileSync(
    filePath,
    `${JSON.stringify(buildFixture(tour), null, 2)}\n`,
    "utf8"
  );
  console.log(`Wrote ${filePath}`);
}

console.log(`Generated ${LAKE_TAHOE_TOURS.length} Lake Tahoe Engine6 fixtures.`);
