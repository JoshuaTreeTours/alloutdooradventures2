import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { YOSEMITE_VIATOR_PUBLIC_RATINGS } from "../src/engine6/yosemiteViatorPublicRatings";
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

type YosemitePremiumTourFixture = {
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

const HERO_BASE =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446";

const YOSEMITE_PREMIUM_TOURS: YosemitePremiumTourFixture[] = [
  {
    productCode: "18808P20",
    productUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Convertible-2020-Jeep-4-X-4-Yosemite-Park-Tour-with-Hotel-Pickup/d5265-18808P20",
    title: "Jeep 4 X 4 Yosemite Park Tour with Hotel Pickup",
    description:
      "If you just have one day to experience all the wonders of Yosemite, make the most of it with a full-day private Jeep tour that showcases the park’s supersized attractions and amazing ecosystems. Vehicle passes and parking can be tough to come by, so let a guide handle all the driving and logistics while you enjoy the rugged ride—top down optional.",
    duration: "8 hours (approx.)",
    priceFrom: 1295,
    heroUrl: `${HERO_BASE}/0a/88/ea/8f.jpg`,
    rating: 4.9,
    reviewCount: 123,
    highlights: [
      "Sturdy Jeep 4x4 can tackle all park roads and conditions",
      "Avoid ticket sell outs, traffic jams, and long waits for parking",
      "All-inclusive package includes hotel pickup and a picnic lunch",
      "Private tour can be totally customized around your interests",
    ],
    startDescription:
      "Hotel pickup from select Oakhurst, Fish Camp, Bass Lake, and Mariposa-area hotels. Meet your guide at the agreed pickup point between 7:00 AM and 7:30 AM.",
    endDescription:
      "Return to your hotel or original pickup location after the full-day private Jeep loop through Yosemite Valley and Glacier Point.",
    itineraryItems: [
      {
        title: "Tunnel View",
        description:
          "Stop at the classic overlook for panoramic views of El Capitan, Half Dome, and Bridalveil Fall.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Bridalveil Fall",
        description:
          "Walk to the base of Bridalveil Fall for misty views of the cascade.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Sentinel Bridge",
        description:
          "Photo stop on Sentinel Bridge with views of Yosemite Falls and Half Dome.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Yosemite Falls",
        description:
          "Stop near Lower Yosemite Fall for a short walk and waterfall views.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "El Capitan Meadow",
        description:
          "Photo stop beneath the granite walls of El Capitan.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Glacier Point",
        description:
          "Rim overlook with sweeping views of Yosemite Valley and Half Dome.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Sentinel Dome",
        description: "Pass Sentinel Dome on the route when seasonal access permits.",
        stopType: "pass-by",
      },
      {
        title: "Washburn Point",
        description: "Short stop at Washburn Point for high-country views.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "Pioneer Yosemite History Center",
        description:
          "Pass through the Wawona area history center when included in your route.",
        stopType: "pass-by",
      },
      {
        title: "The Ahwahnee",
        description:
          "Optional stop at The Ahwahnee historic building in Yosemite Valley.",
        duration: "15 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Hotel pickup and drop-off",
      "Lunch",
      "Bottled water",
      "Professional guide",
    ],
    categories: ["Private Tours", "Full-day Tours", "Adventure Tours"],
  },
  {
    productCode: "18808P17",
    productUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Private-Yosemite-Tour/d5265-18808P17",
    title:
      "Private Yosemite & Glacier Point SUV / Van Tour Including Hotel Pickup",
    description:
      "Take control of your own trip to Yosemite with this private day tour. Instead of squeezing into a crowded bus with strangers, you and your party will have the use of a private SUV or van for the day. Choose the sites that appeal to you most, such as Glacier Point, Yosemite Falls, or Sentinel Bridge, and go at your own pace.",
    duration: "8 hours (approx.)",
    priceFrom: 1075,
    heroUrl: `${HERO_BASE}/09/e4/b5/09.jpg`,
    rating: 4.8,
    reviewCount: 56,
    highlights: [
      "Enjoy the views instead of watching the road",
      "A picnic lunch and bottled water will be provided",
      "Hotel transfers include multiple pickup and drop-off locations",
      "Vehicle type depends on your group's size",
    ],
    startDescription:
      "Hotel pickup from select Oakhurst, Fish Camp, Bass Lake, and Mariposa-area hotels starting around 7:00 AM.",
    endDescription:
      "Return to your hotel after the private valley and Glacier Point tour.",
    itineraryItems: [
      {
        title: "Tunnel View",
        description:
          "Panoramic overlook stop with views across Yosemite Valley.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Bridalveil Fall",
        description: "Walk to the base of Bridalveil Fall.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Sentinel Bridge",
        description:
          "Photo stop on Sentinel Bridge with views toward Yosemite Falls.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Yosemite Falls",
        description:
          "Stop near Lower Yosemite Fall for a short walk and waterfall views.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "El Capitan Meadow",
        description: "Photo stop beneath El Capitan.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Glacier Point",
        description:
          "Rim overlook with sweeping views when seasonal road access permits.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Hotel pickup and drop-off",
      "Lunch",
      "Bottled water",
      "Professional guide",
    ],
    categories: ["Private Tours", "Full-day Tours"],
  },
  {
    productCode: "18808P15",
    productUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Hummer-4-X-4-Tour-of-Yosemite/d5265-18808P15",
    title: "Private Hummer 4 X 4 Tour of Yosemite Including Hotel Pickup",
    description:
      "Explore Yosemite National Park on a private tour in a 4X4 Hummer. Create your own itinerary with options to get out and hike or stay in the Hummer for a scenic ride, stop for a picnic lunch, and visit Glacier Point when roads are open.",
    duration: "8 to 9 hours (approx.)",
    priceFrom: 1475,
    heroUrl: `${HERO_BASE}/07/99/1d/b9.jpg`,
    rating: 4.5,
    reviewCount: 29,
    highlights: [
      "Explore Yosemite on a private tour in a 4x4 Hummer with a picnic lunch",
      "Opt to hike in spring and summer months, or stay in the Hummer",
      "Stop at Glacier Point overlook for panoramic views of the area",
      "Hassle-free round-trip transportation from select hotels",
    ],
    startDescription:
      "Hotel pickup from select Oakhurst, Fish Camp, Bass Lake, and Mariposa-area hotels.",
    endDescription:
      "Return to your hotel after the private Hummer tour of Yosemite Valley and Glacier Point.",
    itineraryItems: [
      {
        title: "Tunnel View",
        description: "Panoramic overlook stop at Tunnel View.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Bridalveil Fall",
        description: "Walk to the base of Bridalveil Fall.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Sentinel Bridge",
        description: "Photo stop on Sentinel Bridge.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Yosemite Falls",
        description: "Stop near Lower Yosemite Fall.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "El Capitan Meadow",
        description: "Photo stop beneath El Capitan.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Glacier Point",
        description: "Rim overlook when seasonal access permits.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Sentinel Dome",
        description: "Pass Sentinel Dome on the high-country route.",
        stopType: "pass-by",
      },
      {
        title: "Washburn Point",
        description: "Short stop at Washburn Point.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "Pioneer Yosemite History Center",
        description: "Pass the Wawona history center when included in your route.",
        stopType: "pass-by",
      },
      {
        title: "The Ahwahnee",
        description: "Optional stop at The Ahwahnee historic building.",
        duration: "15 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Hotel pickup and drop-off",
      "Lunch",
      "Bottled water",
      "Professional guide",
    ],
    categories: ["Private Tours", "Full-day Tours", "Adventure Tours"],
  },
  {
    productCode: "69029P8",
    productUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Yosemite-Valley-Glacier-Point-and-Giant-Sequoias-Sightseeing-Hike-and-Tour/d5265-69029P8",
    title:
      "One Day In Yosemite Private Tour:Yosemite Valley, Glacier Point & Giant Sequoias",
    description:
      "See what Yosemite has to offer on this packed private sightseeing hike and tour. You’ll get an overview of Yosemite in one day, from giant sequoias to Glacier Point and Bridalveil Fall, with hikes, photo stops, and swims beneath waterfalls when conditions allow.",
    duration: "10 hours (approx.)",
    priceFrom: 500,
    heroUrl: `${HERO_BASE}/06/73/e2/24.jpg`,
    rating: 5.0,
    reviewCount: 28,
    highlights: [
      "Ideal for travelers who want to see a lot of Yosemite in one day",
      "Travel with a guide so you don’t get lost on Yosemite’s trails",
      "Use of day packs and water filter is included",
      "Pickup from locations along Highway 120 between Groveland and Yosemite Valley",
    ],
    startDescription:
      "Meet your private naturalist guide at a pickup location along Highway 120 between Groveland and Yosemite Valley, or at select Groveland-area hotels.",
    endDescription:
      "Return to your pickup point after the full-day private valley, sequoia, and Glacier Point route.",
    itineraryItems: [
      {
        title: "Tuolumne Grove of Giant Sequoias",
        description:
          "Walk among giant sequoias in Tuolumne Grove when included in your route.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Tunnel View",
        description: "Panoramic overlook of Yosemite Valley.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Yosemite Valley",
        description:
          "Explore valley landmarks including El Capitan Meadow and Yosemite Falls.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Bridalveil Fall",
        description: "Stop at Bridalveil Fall for photos and a short walk.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Glacier Point",
        description:
          "Rim overlook with sweeping views when seasonal road access permits.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Vernal Fall",
        description:
          "View Vernal Fall from valley trails when included in your custom route.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Private naturalist guide",
      "Hotel pickup and drop-off",
      "National park entrance fee",
      "Snacks",
      "Water and water filter",
      "Lunch",
    ],
    categories: ["Private Tours", "Full-day Tours", "Hiking"],
  },
  {
    productCode: "7011P11",
    productUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Half-Dome-Backpacking/d5265-7011P11",
    title: "4-Day Half Dome Backpacking Adventure",
    description:
      "There’s only one way to get away from the crowds in Yosemite: backcountry adventures. On this four-day tour, meet your expert guide in Yosemite Valley and set out to see the park in its true majesty, exploring Happy Isles, Sunrise Creek, and the Half Dome cables with camp meals cooked by your guide.",
    duration: "4 days (approx.)",
    priceFrom: 2150,
    heroUrl: `${HERO_BASE}/0b/74/99/46.jpg`,
    rating: 5.0,
    reviewCount: 64,
    highlights: [
      "Backpack with an expert guide for tips, tricks, and excellent camp meals",
      "Comfort provisions provided for good nights' sleep",
      "Explore lesser-trafficked spots like Sunrise Creek in addition to Half Dome",
      "A maximum of 8 backpackers makes this an intimate backcountry adventure",
    ],
    startDescription:
      "Meet your guide in Half Dome Village (Curry Village) in Yosemite Valley for a pre-trip briefing and gear check before entering the backcountry.",
    endDescription:
      "Finish the backpacking loop back in Yosemite Valley after the Half Dome summit day.",
    itineraryItems: [
      {
        title: "Yosemite Valley",
        description:
          "Meet your guide and prepare for the backcountry trek through Yosemite Valley.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Happy Isles",
        description:
          "Begin the trail from Happy Isles toward the Mist Trail corridor.",
        duration: "3 hours",
        stopType: "stop",
      },
      {
        title: "Little Yosemite Valley",
        description:
          "Camp and acclimatize in Little Yosemite Valley before the Half Dome push.",
        duration: "1 day",
        stopType: "stop",
      },
      {
        title: "Half Dome",
        description:
          "Summit Half Dome via the cables on the highlight day of the trek.",
        duration: "14 hours",
        stopType: "stop",
      },
      {
        title: "Sunrise Creek",
        description:
          "Explore Sunrise Creek and surrounding backcountry on the return route.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Professional guide",
      "Breakfast",
      "Lunch",
      "Dinner",
      "Camping equipment",
    ],
    categories: ["Multi-day Tours", "Hiking", "Camping"],
  },
  {
    productCode: "19970P1",
    productUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Sierra-National-Forest-4x4-Tour/d5265-19970P1",
    title: "Off Road Giant Sequoia 4x4 Tour Yosemite National Park",
    description:
      "Go off-roading in a Jeep to explore a giant sequoia forest near the south entrance to Yosemite National Park. Enjoy a fun ride into the forest from Fish Camp, followed by an easy hike through the trees for up-close views of California’s massive sequoias.",
    duration: "4 hours 30 minutes (approx.)",
    priceFrom: 849,
    heroUrl: `${HERO_BASE}/06/6f/41/22.jpg`,
    rating: 4.7,
    reviewCount: 21,
    highlights: [
      "2-hour 4WD Jeep ride and hike in giant sequoias from Fish Camp",
      "Off-road ride through Sierra National Forest near Yosemite",
      "Stop at a grove of giant sequoias for a short hike",
      "Learn about the environment of the Sierra Nevada mountains",
    ],
    startDescription:
      "Meet your driver-guide in Fish Camp near the south entrance to Yosemite National Park.",
    endDescription: "Return to Fish Camp after the sequoia grove hike and 4x4 ride.",
    itineraryItems: [
      {
        title: "Sierra National Forest",
        description:
          "Off-road Jeep ride through Sierra National Forest toward the sequoia grove.",
        duration: "2 hours 30 minutes",
        stopType: "stop",
      },
      {
        title: "Yosemite National Park",
        description:
          "Continue into the Yosemite gateway area for sequoia grove access and short hikes.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Experienced driver/guide",
      "All taxes and fees",
    ],
    categories: ["Adventure Tours", "Private Tours", "Nature and Wildlife"],
  },
  {
    productCode: "460648P15",
    productUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Ultimate-Yosemite-Private-Tour-Lunch/d5265-460648P15",
    title: "Ultimate Yosemite: Private Tour + Lunch",
    description:
      "This exclusive tailor-made adventure is designed for travelers seeking the very best of Yosemite. A private experience curated from a pre-trip questionnaire, led by passionate local guides who know the park intimately, with iconic landmarks, hidden gems, and a picnic lunch in a stunning setting.",
    duration: "4 to 8 hours (approx.)",
    priceFrom: 500,
    heroUrl: `${HERO_BASE}/15/86/6d/ed.jpg`,
    rating: 4.7,
    reviewCount: 3,
    highlights: [
      "Private tour customized from a pre-trip questionnaire",
      "Passionate local guides with deep Yosemite knowledge",
      "Picnic lunch included in a scenic setting",
      "Flexible 4- to 8-hour routing based on your interests",
    ],
    startDescription:
      "Meet your guide at the custom tour location agreed after booking inside Yosemite National Park.",
    endDescription:
      "Finish at the agreed meeting point after your private Ultimate Yosemite day.",
    itineraryItems: [
      {
        title: "Yosemite National Park",
        description:
          "Private guided routing through Yosemite landmarks tailored to your group's interests.",
        duration: "8 hours",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "Lunch",
      "Yosemite reservation entry document",
      "Trekking poles on request",
    ],
    categories: ["Private Tours", "Full-day Tours"],
  },
  {
    productCode: "5582835P5",
    productUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Guided-Yosemite-Backpacking-Half-Dome/d5265-5582835P5",
    title: "4 Days Guided Yosemite Half Dome Tour",
    description:
      "Turn your bucket list into a brag list on this four-day Yosemite backpacking adventure from secret swimming holes to the iconic Half Dome cables. Expert guides handle wilderness permits, camp meals, and routing through Panorama Trail, Clouds Rest, and Nevada Fall.",
    duration: "4 days (approx.)",
    priceFrom: 1100,
    heroUrl: `${HERO_BASE}/15/c0/7e/5e.jpg`,
    rating: 5.0,
    reviewCount: 1,
    highlights: [
      "Wilderness permits and Half Dome cable permits included",
      "Wilderness First Responder guide handles all backcountry logistics",
      "Hearty camp breakfasts and dinners with dietary accommodations",
      "Group gear including water filters, stoves, and bear cans when applicable",
    ],
    startDescription:
      "Meet your guides at Mono Meadows Trailhead on Glacier Point Road for trip briefing and gear check.",
    endDescription:
      "Return to Mono Meadows Trailhead after the final descent via Panorama Trail.",
    itineraryItems: [
      {
        title: "Mono Meadows Trailhead",
        description: "Meet guides and begin the backcountry trek.",
        stopType: "stop",
      },
      {
        title: "Illilouette Creek",
        description: "Hike through Illilouette Creek toward camp.",
        duration: "5 hours",
        stopType: "stop",
      },
      {
        title: "Half Dome",
        description: "Summit Half Dome via the cables on the highlight day.",
        duration: "15 hours",
        stopType: "stop",
      },
      {
        title: "Clouds Rest",
        description: "Trek to Clouds Rest for high-country panoramas.",
        duration: "12 hours",
        stopType: "stop",
      },
      {
        title: "Panorama Trail",
        description:
          "Descend the Panorama Trail past Nevada Fall toward the trailhead.",
        duration: "9 hours",
        stopType: "stop",
      },
      {
        title: "Nevada Fall",
        description: "Pass Nevada Fall on the Panorama Trail descent.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "Wilderness permits",
      "Breakfast",
      "Dinner",
      "Group camping gear",
    ],
    categories: ["Multi-day Tours", "Hiking", "Camping"],
  },
  {
    productCode: "449449P2",
    productUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Waterfalls-of-Yosemite-Customizable-Private-Tour/d5265-449449P2",
    title: "Waterfalls of Yosemite - Customizable Private Tour",
    description:
      "Explore Yosemite’s legendary waterfalls with a local expert on a fully customizable private tour. Routes may include Bridalveil Fall, Yosemite Falls, Vernal Fall, Nevada Fall, and other cascades depending on season, trail access, and your group’s preferences.",
    duration: "6 to 8 hours (approx.)",
    priceFrom: 495,
    heroUrl: `${HERO_BASE}/r/32/fd/eb/e7/caption.jpg`,
    rating: 4.7,
    reviewCount: 19,
    highlights: [
      "Private customizable guided waterfall tour",
      "Reservation into Yosemite included on day of activity",
      "Routes tailored for hiking or car-based touring",
      "Trekking poles available on request",
    ],
    startDescription:
      "Meet your guide at Curry Village Pizza Deck near Shuttle Stop 14 in Yosemite Valley.",
    endDescription:
      "Finish near the Curry Village meeting area after your private waterfall tour.",
    itineraryItems: [
      {
        title: "Yosemite Valley",
        description:
          "Private routing through Yosemite Valley waterfall viewpoints tailored to season and fitness.",
        duration: "7 hours",
        stopType: "stop",
      },
      {
        title: "Bridalveil Fall",
        description: "Stop at Bridalveil Fall when included in your custom route.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Yosemite Falls",
        description:
          "Visit Lower Yosemite Fall and surrounding viewpoints.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Vernal Fall",
        description:
          "Approach Vernal Fall on the Mist Trail when trail conditions permit.",
        duration: "2 hours",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "Yosemite reservation entry",
      "Private transportation",
      "Trekking poles on request",
    ],
    categories: ["Private Tours", "Hiking", "Full-day Tours"],
  },
];

const buildFixture = (tour: YosemitePremiumTourFixture) => {
  const viatorRatings = YOSEMITE_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: "Yosemite", state: "California" },
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
          question: "Where does the tour depart from in Yosemite?",
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
  YOSEMITE_PREMIUM_TOURS.map(tour => ({
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
  if (
    YOSEMITE_PREMIUM_TOURS.some(tour => tour.productCode === unavailableProductCode)
  ) {
    throw new Error(
      `Refusing to generate fixtures for known unavailable product ${unavailableProductCode}`
    );
  }
}

for (const tour of YOSEMITE_PREMIUM_TOURS) {
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

console.log(
  `Generated ${YOSEMITE_PREMIUM_TOURS.length} Yosemite premium Engine6 fixtures.`
);
