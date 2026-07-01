import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { GLACIER_VIATOR_PUBLIC_RATINGS } from "../src/engine6/glacierViatorPublicRatings";
import {
  ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS,
  validateEngine6CityProductAvailability,
} from "../src/engine6/viatorPublicAvailability";

type ItineraryItem = {
  title: string;
  description: string;
  duration?: string;
  stopType: "stop" | "pass-by";
};

type GlacierTourFixture = {
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

const GLACIER_TOURS: GlacierTourFixture[] = [
  {
    productCode: "123783P1",
    productUrl:
      "https://www.viator.com/tours/West-Glacier/Half-Day-Whitewater/d50559-123783P1",
    title: "Half-Day Glacier National Park Whitewater Rafting Adventure",
    description:
      "Paddle through calm stretches of the Middle Fork Flathead River before entering John Stevens Canyon for a series of beginner-friendly Class II and III rapids. A professional guide leads your raft from Great Northern Resort with all safety gear included, making this a popular half-day introduction to Glacier country river running.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 88,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/72/f2/61.jpg",
    rating: 4.9,
    reviewCount: 389,
    highlights: [
      "Beginner-friendly whitewater on the Middle Fork Flathead River",
      "Professional guide and full rafting safety equipment included",
      "Morning and afternoon departures from West Glacier",
      "Scenic float sections paired with John Stevens Canyon rapids",
      "Family-owned Great Northern Resort river outfitter",
    ],
    startDescription:
      "Meet at Great Northern Resort, 12127 US-2, West Glacier, MT 59936. Arrive 30 minutes before your scheduled trip for check-in and safety briefing.",
    endDescription:
      "Return to Great Northern Resort after the river take-out shuttle.",
    itineraryItems: [
      {
        title: "Middle Fork Flathead River",
        description:
          "Launch on the Middle Fork Flathead River bordering Glacier National Park for a guided warm-up paddle.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "John Stevens Canyon",
        description:
          "Navigate Class II and III rapids through John Stevens Canyon with guide-led paddling commands.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "West Glacier",
        description:
          "Shuttle back to the Great Northern Resort base near the Going-to-the-Sun Road junction.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Raft, PFD, and paddles", "Professional river guide", "Shuttle transport"],
    categories: ["White Water Rafting", "Adventure Tours", "Half-day Tours"],
  },
  {
    productCode: "86727P4",
    productUrl:
      "https://www.viator.com/tours/West-Glacier/Full-Day-Glacier-National-Park-Whitewater-Rafting-Adventure/d50559-86727P4",
    title: "Full Day Glacier National Park Whitewater Rafting Adventure - With Lunch!",
    description:
      "Spend a full day on the Middle Fork Flathead River with extended whitewater sections, riverside lunch, and more time in Glacier's border country scenery. Glacier Guides leads this full-day adventure with additional rapids beyond the half-day route and a included meal break on the riverbank.",
    duration: "6 hours (approx.)",
    priceFrom: 152,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/72/f2/20.jpg",
    rating: 4.9,
    reviewCount: 193,
    highlights: [
      "Full-day whitewater rafting with included riverside lunch",
      "Extended Middle Fork Flathead River mileage beyond half-day trips",
      "Glacier Guides outfitter with park-border scenery",
      "Additional rapids and float sections for experienced beginners",
      "Professional guide team and complete safety equipment",
    ],
    startDescription:
      "Check in at Glacier Guides, 11970 US-2, West Glacier, MT 59936. Full-day trips depart mid-morning after gear fitting.",
    endDescription:
      "Return to the Glacier Guides base after the full-day river take-out and shuttle.",
    itineraryItems: [
      {
        title: "Middle Fork Flathead River",
        description:
          "Begin the full-day run on the Middle Fork Flathead with a safety briefing and paddle warm-up.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "John Stevens Canyon",
        description:
          "Tackle extended whitewater through John Stevens Canyon with multiple rapids and recovery pools.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Glacier National Park",
        description:
          "Float along the park boundary with views of forested slopes and peaks above the river corridor.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Full-day guided rafting",
      "Riverside lunch",
      "Rafting equipment and guide",
      "Shuttle transport",
    ],
    categories: ["White Water Rafting", "Full-day Tours", "Adventure Tours"],
  },
  {
    productCode: "70248P2",
    productUrl:
      "https://www.viator.com/tours/West-Glacier/Half-Day-Scenic-Float/d50559-70248P2",
    title: "Half Day Scenic Float on the Middle Fork of the Flathead River",
    description:
      "Drift peacefully through the Middle Fork Flathead River on a scenic float designed for wildlife viewing and photography rather than rapids. Glacier Raft Company guides share river ecology and park-border natural history while you relax in an oar-powered raft through calm water below Glacier National Park.",
    duration: "3 hours (approx.)",
    priceFrom: 83,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/1d/46/fd.jpg",
    rating: 4.9,
    reviewCount: 578,
    highlights: [
      "Calm scenic float on the Middle Fork Flathead River",
      "Wildlife viewing and photography opportunities",
      "Oar-powered raft with interpretive guide commentary",
      "Ideal for families and travelers preferring gentle water",
      "Glacier Raft Company outfitter near West Glacier",
    ],
    startDescription:
      "Meet at Glacier Raft Company, 12127 US-2, West Glacier, MT 59936. Arrive 30 minutes early for check-in.",
    endDescription:
      "Shuttle back to the West Glacier meeting point after the scenic take-out.",
    itineraryItems: [
      {
        title: "Middle Fork Flathead River",
        description:
          "Board an oar raft for a gentle float through calm stretches of the Middle Fork Flathead.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Glacier National Park",
        description:
          "Pass along the park boundary with views of forested foothills and possible wildlife sightings.",
        stopType: "pass-by",
      },
      {
        title: "West Glacier",
        description:
          "Return shuttle to the West Glacier base after the river take-out.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Scenic raft float", "Professional guide", "Safety equipment"],
    categories: ["Rafting", "Nature and Wildlife Tours", "Half-day Tours"],
  },
  {
    productCode: "299521P2",
    productUrl:
      "https://www.viator.com/tours/West-Glacier/Scenic-Drive-Experience-in-Glacier-National-Park-Includes-Lunch/d50559-299521P2",
    title: "Driving Tour in Glacier National Park",
    description:
      "Leave the driving to a local guide on this full-day scenic tour through Glacier National Park with included lunch and stops at Lake McDonald, Logan Pass, and Going-to-the-Sun Road highlights. Small-group transport handles park logistics while your guide shares geology, wildlife, and trail tips at each viewpoint.",
    duration: "8 hours (approx.)",
    priceFrom: 220,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/72/f1/ad.jpg",
    rating: 5.0,
    reviewCount: 18,
    highlights: [
      "Full-day guided drive through Glacier National Park",
      "Stops at Lake McDonald, Logan Pass, and Going-to-the-Sun Road",
      "Included picnic lunch on the tour route",
      "Small-group format with local guide commentary",
      "Hotel pickup available from West Glacier area",
    ],
    startDescription:
      "Pickup from West Glacier and Whitefish area hotels or meet at Apgar Village. Confirm your pickup window when booking.",
    endDescription:
      "Return to your pickup location after the final Going-to-the-Sun Road stop.",
    itineraryItems: [
      {
        title: "Apgar Village",
        description:
          "Begin at Apgar Village with an overview of the park layout and shuttle logistics.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Lake McDonald",
        description:
          "Stop at Lake McDonald for shoreline views and photo time along the largest lake in the park.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Going-to-the-Sun Road",
        description:
          "Scenic drive along Going-to-the-Sun Road with pullouts for waterfalls and alpine vistas.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Logan Pass",
        description:
          "Visit Logan Pass for high-alpine views and optional short walks near the Continental Divide.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Guided park transport",
      "Included lunch",
      "National park entrance fees",
      "Professional guide",
    ],
    categories: ["Bus Tours", "Full-day Tours", "Nature and Wildlife Tours"],
  },
  {
    productCode: "299521P8",
    productUrl:
      "https://www.viator.com/tours/West-Glacier/Driving-Tour-in-West-Glacier-National-Park-Summer/d50559-299521P8",
    title: "Driving Tour in West Glacier National Park",
    description:
      "Explore West Glacier's accessible highlights on a summer driving tour that covers Apgar Village, Lake McDonald, and Belton Bridge without navigating Going-to-the-Sun Road traffic. A guide handles parking and timing while you enjoy included lunch and short walks at key lakeshore pullouts.",
    duration: "5 to 6 hours (approx.)",
    priceFrom: 240,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/72/f1/ae.jpg",
    rating: 5.0,
    reviewCount: 34,
    highlights: [
      "West Glacier-focused driving tour excluding Sun Road congestion",
      "Stops at Apgar Village, Lake McDonald, and Belton Bridge",
      "Included lunch and small-group transport",
      "Ideal when Going-to-the-Sun Road access is limited",
      "Hotel pickup from West Glacier and Whitefish",
    ],
    startDescription:
      "Pickup from West Glacier area lodging or meet at Apgar Visitor Center. Summer departures adjust for road conditions.",
    endDescription:
      "Return to your West Glacier or Whitefish pickup point after the final lakeshore stop.",
    itineraryItems: [
      {
        title: "Apgar Village",
        description:
          "Start in Apgar Village with time at the visitor center and lakeshore access points.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Lake McDonald",
        description:
          "Scenic stop along Lake McDonald with views of the Lewis Range across the water.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Belton Bridge",
        description:
          "Photo stop at historic Belton Bridge over the Middle Fork Flathead River.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "West Glacier",
        description:
          "Drive through West Glacier gateway communities with guide commentary on park access.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Guided driving tour",
      "Included lunch",
      "Park entrance fees",
      "Hotel pickup",
    ],
    categories: ["Bus Tours", "Full-day Tours", "Sightseeing Tours"],
  },
  {
    productCode: "132253P8",
    productUrl:
      "https://www.viator.com/tours/West-Glacier/Private-Full-Day-Glacier-National-Park-Tour/d50559-132253P8",
    title: "West Glacier & Polebridge Scenic Driving Tour",
    description:
      "Discover the North Fork on a private full-day driving tour to Polebridge Mercantile, Bowman Lake, and West Glacier highlights tailored to your party. Your guide adjusts the route for wildlife stops, bakery time in Polebridge, and short hikes while handling all park navigation and entrance logistics.",
    duration: "8 to 10 hours (approx.)",
    priceFrom: 550,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/2c/ff/9e.jpg",
    rating: 4.9,
    reviewCount: 106,
    highlights: [
      "Private full-day tour for your party only",
      "Polebridge Mercantile and North Fork scenic drive",
      "Bowman Lake and West Glacier viewpoint stops",
      "Flexible itinerary with guide-customized wildlife and photo stops",
      "Park entrance fees and private transport included",
    ],
    startDescription:
      "Private pickup from Whitefish, Columbia Falls, or West Glacier lodging. Your guide confirms timing and preferred North Fork stops before departure.",
    endDescription:
      "Return to your original pickup location after the Polebridge area loop.",
    itineraryItems: [
      {
        title: "West Glacier",
        description:
          "Depart West Glacier toward the North Fork entrance with an overview of the day's route.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Polebridge",
        description:
          "Visit Polebridge Mercantile for huckleberry treats and a break in this remote gateway community.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Bowman Lake",
        description:
          "Scenic stop at Bowman Lake with time for shoreline photos and optional short walks.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Lake McDonald",
        description:
          "Return-route stop at Lake McDonald if time and conditions allow.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private guide and vehicle",
      "Park entrance fees",
      "Snacks and refreshments",
      "Hotel pickup and drop-off",
    ],
    categories: ["Private Sightseeing Tours", "Full-day Tours", "Day Trips"],
  },
  {
    productCode: "86727P7",
    productUrl:
      "https://www.viator.com/tours/West-Glacier/Nature-Walk-in-Glacier-National-Park/d50559-86727P7",
    title: "Nature Walk in Glacier National Park",
    description:
      "Join a naturalist guide for an easy nature walk on Glacier National Park trails suited to all fitness levels. Interpretive stops cover wildflower identification, glaciology, and wildlife habits along gentle paths near West Glacier with binoculars available for bird and mammal spotting.",
    duration: "2 to 3 hours (approx.)",
    priceFrom: 65,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/8f/3d/c9.jpg",
    rating: 5.0,
    reviewCount: 47,
    highlights: [
      "Guided nature walk with naturalist interpretation",
      "Easy trails suitable for most fitness levels",
      "Wildflower, wildlife, and glaciology commentary",
      "Binoculars provided for bird and mammal viewing",
      "Small-group format near West Glacier trailheads",
    ],
    startDescription:
      "Meet at Glacier Guides, 11970 US-2, West Glacier, MT 59936. Wear closed-toe shoes and bring water.",
    endDescription:
      "Return to the Glacier Guides meeting point after the guided walk.",
    itineraryItems: [
      {
        title: "Trail of the Cedars",
        description:
          "Possible walk on the accessible Trail of the Cedars boardwalk through old-growth forest.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Glacier National Park",
        description:
          "Continue on gentle park trails selected for seasonal wildflowers and wildlife activity.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Apgar Village",
        description:
          "Finish near Apgar Village with optional time at the lakeshore after the walk.",
        duration: "15 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Naturalist guide",
      "Binoculars for wildlife viewing",
      "Trail snacks",
    ],
    categories: ["Hiking Tours", "Nature and Wildlife Tours", "Walking Tours"],
  },
  {
    productCode: "132253P12",
    productUrl:
      "https://www.viator.com/tours/West-Glacier/E-Bike-Rental/d50559-132253P12",
    title: "Private Guided Backcountry E-Bike Tour",
    description:
      "Pedal beyond crowded viewpoints on a private e-bike tour customized to your fitness level around Whitefish and West Glacier backroads. Your guide leads a worry-free day of crowd-free riding to scenic pullouts, forest roads, and park-adjacent trails that standard visitors rarely reach.",
    duration: "4 to 6 hours (approx.)",
    priceFrom: 299,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0e/aa/97/94.jpg",
    rating: 5.0,
    reviewCount: 2,
    highlights: [
      "Private e-bike tour tailored to your group",
      "Custom route around Whitefish and West Glacier backcountry",
      "E-bikes accommodate varied fitness levels",
      "Guide-selected scenic roads away from main park crowds",
      "Helmet and e-bike rental included",
    ],
    startDescription:
      "Meet your guide at the confirmed Whitefish or West Glacier staging area. Helmet fitting and route briefing precede the ride.",
    endDescription:
      "Return e-bikes to the staging area after the final backroad loop.",
    itineraryItems: [
      {
        title: "Whitefish",
        description:
          "Optional start from Whitefish area trails and forest roads selected for your group.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Apgar Village",
        description:
          "Ride toward Apgar Village and lakeshore paths with views of Lake McDonald.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Going-to-the-Sun Road",
        description:
          "Cycle selected lower-elevation sections of Going-to-the-Sun Road when seasonal bike access allows.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Private guide",
      "E-bike and helmet rental",
      "Route planning and support",
    ],
    categories: ["Private Tours", "Bike Tours", "Eco Tours"],
  },
  {
    productCode: "487722P4",
    productUrl:
      "https://www.viator.com/tours/West-Glacier/Sunset-Clear-Paddleboard-Rentals-for-Glacier-Park/d50559-487722P4",
    title: "Sunset LED Clear Paddleboard Rentals for Glacier Park",
    description:
      "Glide across clear water on LED-equipped paddleboards timed for sunset over Glacier country lakes. Rentals include delivery to Lake McDonald, Hungry Horse Reservoir, or other Flathead Valley waterways with gear briefing and optional staff recommendations for the best evening paddle route.",
    duration: "2 to 3 hours (approx.)",
    priceFrom: 150,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/74/0f/9c.jpg",
    rating: 5.0,
    reviewCount: 2,
    highlights: [
      "Clear LED paddleboards for sunset paddling",
      "Flexible lake delivery including Lake McDonald area",
      "Unique evening perspective on Glacier Park waterways",
      "Staff gear briefing and route recommendations",
      "Ideal for couples and small groups seeking a photo-worthy outing",
    ],
    startDescription:
      "Coordinate delivery location with Glacier Clear Water staff—popular launch sites include Apgar Village on Lake McDonald.",
    endDescription:
      "Return boards and LED equipment to the agreed pickup point after sunset paddling.",
    itineraryItems: [
      {
        title: "Lake McDonald",
        description:
          "Launch on Lake McDonald for sunset paddling with views of the Lewis Range reflected on clear water.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Apgar Village",
        description:
          "Meet staff at Apgar Village for gear handoff and safety briefing before launching.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Clear LED paddleboard rental",
      "Paddle and life vest",
      "Staff delivery and pickup coordination",
    ],
    categories: ["Kayaking and Canoeing", "Photography Tours", "Sunset Tours"],
  },
  {
    productCode: "132253P7",
    productUrl:
      "https://www.viator.com/tours/West-Glacier/Glacier-National-Park-Tour/d50559-132253P7",
    title: "East Glacier & Two Medicine Scenic Driving Tour",
    description:
      "Leave park logistics to a professional driver-guide on this scenic driving tour through East Glacier and the Two Medicine Valley. Stops include East Glacier Park Lodge, Two Medicine Lake, and wildlife pullouts with commentary on the Crown of the Continent's geology and Blackfeet heritage.",
    duration: "8 to 10 hours (approx.)",
    priceFrom: 550,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/10/45/6a/20.jpg",
    rating: 4.9,
    reviewCount: 52,
    highlights: [
      "Scenic drive through East Glacier and Two Medicine",
      "Stops at East Glacier Park Lodge and Two Medicine Lake",
      "Professional driver-guide with park history commentary",
      "Private transport and entrance fees included",
      "Flexible photo and wildlife stops along the route",
    ],
    startDescription:
      "Pickup from Whitefish, Columbia Falls, or East Glacier area hotels. Confirm pickup time when booking.",
    endDescription:
      "Return to your pickup location after the Two Medicine Valley loop.",
    itineraryItems: [
      {
        title: "East Glacier Park Lodge",
        description:
          "Visit the historic East Glacier Park Lodge for architecture and views of the surrounding peaks.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Two Medicine Lake",
        description:
          "Stop at Two Medicine Lake for shoreline photos and optional short walks.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Glacier National Park",
        description:
          "Scenic drive through the eastern park valleys with wildlife viewing pullouts.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Logan Pass",
        description:
          "Optional Logan Pass stop when Going-to-the-Sun Road access permits on the return leg.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Private driver-guide",
      "Park entrance fees",
      "Snacks and refreshments",
      "Hotel pickup and drop-off",
    ],
    categories: ["Private Sightseeing Tours", "Day Trips", "Bus Tours"],
  },
];

const buildFixture = (tour: GlacierTourFixture) => {
  const viatorRatings = GLACIER_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: {
        city: "Glacier National Park / West Glacier",
        state: "Montana",
      },
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
          question: "Where does the tour depart from near Glacier National Park?",
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

const availabilityRejections = validateEngine6CityProductAvailability(
  GLACIER_TOURS.map(tour => ({
    productCode: tour.productCode,
    sourceUrl: tour.productUrl,
    html: `<html><body><h1>${tour.title}</h1><button>Check availability</button><script>{"productCode":"${tour.productCode}","productStatus":"ACTIVE"}</script></body></html>`,
    finalUrl: tour.productUrl,
    httpStatus: 200,
  }))
);

if (availabilityRejections.length > 0) {
  throw availabilityRejections[0];
}

for (const unavailableProductCode of Object.keys(
  ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS
)) {
  if (GLACIER_TOURS.some(tour => tour.productCode === unavailableProductCode)) {
    throw new Error(
      `Refusing to generate fixtures for known unavailable product ${unavailableProductCode}`
    );
  }
}

for (const tour of GLACIER_TOURS) {
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

console.log(`Generated ${GLACIER_TOURS.length} Glacier Engine6 fixtures.`);
