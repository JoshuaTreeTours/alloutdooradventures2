import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { YOSEMITE_VIATOR_PUBLIC_RATINGS } from "../src/engine6/yosemiteViatorPublicRatings";

type ItineraryItem = {
  title: string;
  description: string;
  duration?: string;
  stopType: "stop" | "pass-by";
};

type YosemiteTourFixture = {
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

const YOSEMITE_TOURS: YosemiteTourFixture[] = [
  {
    productCode: "391021P1",
    productUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Yosemite-Highlights-Small-Group-Tours/d5265-391021P1",
    title: "Yosemite Highlights Small Group Tour",
    description:
      "Explore Yosemite Valley on a small-group guided tour with a naturalist guide who shares park history, geology, and wildlife stories. Photo stops include Tunnel View, Bridalveil Fall, and El Capitan Meadow with time to walk short trails near Yosemite Falls.",
    duration: "8 hours (approx.)",
    priceFrom: 210,
    heroUrl: `${HERO_BASE}/10/49/7f/34.jpg`,
    rating: 4.9,
    reviewCount: 415,
    highlights: [
      "Small-group tour limited to 15 passengers",
      "Tunnel View overlook of Yosemite Valley",
      "Photo stops at Bridalveil Fall and El Capitan Meadow",
      "Guided commentary on park geology and wildlife",
      "Round-trip transport from select meeting points",
    ],
    startDescription:
      "Meet at the designated Yosemite area pickup point. Arrive 15 minutes before departure for check-in with your naturalist guide.",
    endDescription:
      "Return to the original meeting point after the valley highlights loop.",
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
          "Walk to the base of Bridalveil Fall for misty views of the 620-foot cascade.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "El Capitan Meadow",
        description:
          "Photo stop beneath the granite walls of El Capitan with guide commentary.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Yosemite Valley",
        description:
          "Scenic drive through the valley floor with views of Cathedral Rocks and Sentinel Rock.",
        stopType: "pass-by",
      },
      {
        title: "Yosemite Falls",
        description:
          "Stop near Lower Yosemite Fall for a short walk and waterfall views.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Professional guide", "Transport by air-conditioned vehicle"],
    categories: ["Bus Tours", "Full-day Tours"],
  },
  {
    productCode: "3454P41",
    productUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Best-of-Yosemite-Tour-Giant-Sequoias-and-Glacier-Point/d5265-3454P41",
    title:
      "Best of Yosemite Small Group Tour: Giant Sequoias & Glacier Point",
    description:
      "See Yosemite's greatest hits on a small-group day tour combining Tuolumne Grove giant sequoias with Glacier Point's sweeping valley panorama. Your guide handles park logistics while you focus on Tunnel View, Yosemite Valley, and alpine viewpoints.",
    duration: "10 hours (approx.)",
    priceFrom: 175,
    heroUrl: `${HERO_BASE}/0b/08/22/80.jpg`,
    rating: 4.6,
    reviewCount: 28,
    highlights: [
      "Small-group tour with naturalist guide",
      "Walk among giant sequoias at Tuolumne Grove",
      "Glacier Point overlook above Yosemite Valley",
      "Tunnel View and valley floor photo stops",
      "Hotel pickup available from select locations",
    ],
    startDescription:
      "Pickup from select hotels in the Yosemite gateway area starting at 7:30 AM.",
    endDescription: "Return to your original hotel pickup point.",
    itineraryItems: [
      {
        title: "Tuolumne Grove",
        description:
          "Hike the grove trail among mature giant sequoias including a walk-through tunnel tree.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Tunnel View",
        description:
          "Classic valley overlook stop with views of Half Dome and Bridalveil Fall.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Yosemite Valley",
        description:
          "Drive through the valley with commentary on El Capitan and Cathedral Rocks.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Glacier Point",
        description:
          "Stand at the rim overlook for sweeping views of Half Dome and Yosemite Falls.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Hotel pickup and drop-off", "Professional guide"],
    categories: ["Bus Tours", "Full-day Tours"],
  },
  {
    productCode: "18808P1",
    productUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Yosemite-and-Glacier-Point-Tour-from-Fresno/d5265-18808P1",
    title:
      "Full-Day Small Group Yosemite & Glacier Point Tour Including Hotel Pickup",
    description:
      "Travel from Fresno to Yosemite on a full-day small-group tour with hotel pickup. Visit Yosemite Valley landmarks including Tunnel View, Yosemite Falls, and El Capitan before ascending to Glacier Point for one of the park's most dramatic panoramas.",
    duration: "11 hours (approx.)",
    priceFrom: 250,
    heroUrl: `${HERO_BASE}/06/6b/96/58.jpg`,
    rating: 4.6,
    reviewCount: 489,
    highlights: [
      "Hotel pickup and drop-off from Fresno area",
      "Small-group tour with driver-guide",
      "Yosemite Valley and Glacier Point in one day",
      "Photo stops at Tunnel View and Yosemite Falls",
      "Air-conditioned vehicle transport",
    ],
    startDescription:
      "Hotel pickup from select Fresno-area hotels between 6:00 AM and 6:30 AM.",
    endDescription: "Return to your Fresno hotel after the full-day tour.",
    itineraryItems: [
      {
        title: "Tunnel View",
        description:
          "First valley overlook stop with views of El Capitan, Half Dome, and Bridalveil Fall.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Yosemite Valley",
        description:
          "Explore the valley floor with stops near Yosemite Falls and Swinging Bridge.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "El Capitan",
        description:
          "Photo stop at El Capitan Meadow beneath the 3,000-foot granite wall.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Glacier Point",
        description:
          "Ascend to Glacier Point for rim views over Half Dome and the high country.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Hotel pickup and drop-off", "Air-conditioned vehicle", "Guide"],
    categories: ["Bus Tours", "Full-day Tours"],
  },
  {
    productCode: "391021P3",
    productUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Mariposa-Grove-of-Giant-Sequoias-and-Wawona-Small-Group-Tour/d5265-391021P3",
    title:
      "Mariposa Grove of Giant Sequoias and Wawona Small Group Tour",
    description:
      "Walk among the world's largest trees on a small-group tour of Mariposa Grove near Wawona. Your naturalist guide leads the grove trails past the Grizzly Giant and California Tunnel Tree with commentary on sequoia ecology and Yosemite's southern history.",
    duration: "4 hours (approx.)",
    priceFrom: 170,
    heroUrl: `${HERO_BASE}/15/72/ab/91.jpg`,
    rating: 5.0,
    reviewCount: 11,
    highlights: [
      "Small-group tour of Mariposa Grove",
      "See the Grizzly Giant and California Tunnel Tree",
      "Naturalist guide explains sequoia ecology",
      "Explore historic Wawona area",
      "Round-trip transport included",
    ],
    startDescription:
      "Meet at the Mariposa Grove arrival area. Arrive 15 minutes before departure.",
    endDescription: "Return to the Mariposa Grove meeting point after the tour.",
    itineraryItems: [
      {
        title: "Mariposa Grove",
        description:
          "Walk the grove trails among ancient giant sequoias including the Grizzly Giant.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Wawona",
        description:
          "Brief stop in the historic Wawona area with guide commentary on early park history.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Professional guide", "Transport by air-conditioned vehicle"],
    categories: ["Walking Tours", "Nature and Wildlife"],
  },
  {
    productCode: "18808P14",
    productUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Semi-Private-Yosemite-Tour/d5265-18808P14",
    title:
      "Semi Private Yosemite Tour with Ahwahnee Lunch and Hotel Pickup",
    description:
      "Enjoy a semi-private Yosemite day tour with hotel pickup and lunch at The Ahwahnee. Visit Tunnel View, Yosemite Valley, and Glacier Point with a small group and guide who tailors stops to your interests.",
    duration: "10 hours (approx.)",
    priceFrom: 250,
    heroUrl: `${HERO_BASE}/06/6b/96/71.jpg`,
    rating: 4.8,
    reviewCount: 70,
    highlights: [
      "Semi-private tour with limited group size",
      "Lunch included at The Ahwahnee",
      "Hotel pickup from Fresno gateway hotels",
      "Tunnel View, valley, and Glacier Point stops",
      "Flexible pacing with driver-guide",
    ],
    startDescription:
      "Hotel pickup from select Fresno-area hotels starting at 6:30 AM.",
    endDescription: "Return to your hotel after the semi-private valley tour.",
    itineraryItems: [
      {
        title: "Tunnel View",
        description:
          "Panoramic overlook stop with views across Yosemite Valley.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Yosemite Valley",
        description:
          "Explore valley landmarks including Yosemite Falls and El Capitan Meadow.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Half Dome",
        description:
          "View Half Dome from valley viewpoints with guide commentary.",
        stopType: "pass-by",
      },
      {
        title: "Glacier Point",
        description:
          "Rim overlook with sweeping views of the valley and high country.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Lunch", "Hotel pickup and drop-off", "Professional guide"],
    categories: ["Private Tours", "Full-day Tours"],
  },
  {
    productCode: "6004HIKE",
    productUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Yosemite-Hiking-Excursion/d5265-6004HIKE",
    title: "Guided Yosemite Hiking Excursion",
    description:
      "Hit the trail with a certified Yosemite hiking guide on a small-group excursion tailored to current conditions. Routes may include Yosemite Valley meadows, waterfall viewpoints, or moderate valley loops with naturalist commentary on flora and geology.",
    duration: "6 hours (approx.)",
    priceFrom: 205,
    heroUrl: `${HERO_BASE}/0b/3c/9f/95.jpg`,
    rating: 4.7,
    reviewCount: 77,
    highlights: [
      "Certified Yosemite hiking guide",
      "Small-group trail experience",
      "Routes adapted to season and fitness level",
      "Naturalist commentary on valley ecology",
      "Trail snacks and water provided",
    ],
    startDescription:
      "Meet your guide at the designated Yosemite Valley trailhead meeting point.",
    endDescription: "Return to the trailhead meeting point after the hike.",
    itineraryItems: [
      {
        title: "Yosemite Valley",
        description:
          "Guided hike through valley trails with views of granite walls and meadows.",
        duration: "4 hours",
        stopType: "stop",
      },
      {
        title: "Yosemite Falls",
        description:
          "Approach Lower Yosemite Fall on a moderate valley trail segment.",
        duration: "1 hour",
        stopType: "stop",
      },
    ],
    inclusions: ["Professional guide", "Snacks", "Bottled water"],
    categories: ["Hiking", "Outdoor Activities"],
  },
  {
    productCode: "7011P8",
    productUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Yosemite-Valley-Custom-Adventure-Tour/d5265-7011P8",
    title: "Yosemite Valley Private Hiking Tour",
    description:
      "Design your own Yosemite Valley adventure on a private hiking tour for your group. A local guide customizes the route to your interests—waterfall walks, meadow strolls, or moderate climbs—with insider knowledge of less-crowded trails.",
    duration: "6 hours (approx.)",
    priceFrom: 360,
    heroUrl: `${HERO_BASE}/2f/24/52/0f.jpg`,
    rating: 5.0,
    reviewCount: 81,
    highlights: [
      "Private tour for your group only",
      "Customized valley hiking route",
      "Local guide with insider trail knowledge",
      "Flexible pace and difficulty",
      "Ideal for families and special occasions",
    ],
    startDescription:
      "Meet your private guide at a Yosemite Valley meeting point agreed at booking.",
    endDescription: "Return to the agreed meeting point after your custom hike.",
    itineraryItems: [
      {
        title: "Yosemite Valley",
        description:
          "Private guided hike through valley trails tailored to your group's interests.",
        duration: "5 hours",
        stopType: "stop",
      },
      {
        title: "Bridalveil Fall",
        description:
          "Optional stop at Bridalveil Fall when included in your custom route.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Private guide", "Custom itinerary planning"],
    categories: ["Private Tours", "Hiking"],
  },
  {
    productCode: "6004P8",
    productUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Family-Hike-in-Yosemite/d5265-6004P8",
    title: "Private Family Hike in Yosemite",
    description:
      "Take the family on a private Yosemite hike paced for all ages. Your guide selects kid-friendly valley trails with plenty of stops for photos, wildlife spotting, and short lessons on Yosemite's granite cliffs and waterfalls.",
    duration: "4 hours (approx.)",
    priceFrom: 178.75,
    heroUrl: `${HERO_BASE}/0b/3c/99/2f.jpg`,
    rating: 4.9,
    reviewCount: 33,
    highlights: [
      "Private family-friendly hiking tour",
      "Kid-paced routes in Yosemite Valley",
      "Guide shares fun facts on park wildlife",
      "Flexible rest and photo stops",
      "Trail snacks included for children",
    ],
    startDescription:
      "Meet your guide at the Yosemite Valley family hike meeting point.",
    endDescription: "Return to the meeting point after the family hike.",
    itineraryItems: [
      {
        title: "Yosemite Valley",
        description:
          "Easy-to-moderate family hike through meadow and riverside trails.",
        duration: "3 hours",
        stopType: "stop",
      },
      {
        title: "El Capitan Meadow",
        description:
          "Photo break with views of El Capitan suited for all ages.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Private guide", "Snacks", "Bottled water"],
    categories: ["Private Tours", "Hiking"],
  },
  {
    productCode: "6004PRHIKE",
    productUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Private-Guided-Hiking-Tour-in-Yosemite/d5265-6004PRHIKE",
    title: "Private Guided Hiking Tour in Yosemite",
    description:
      "Book a private guided hike with a Yosemite expert who builds a route around your fitness level and goals. Options range from valley waterfall walks to longer treks with views of Half Dome, Glacier Point, or Tuolumne Grove depending on season.",
    duration: "8 hours (approx.)",
    priceFrom: 293,
    heroUrl: `${HERO_BASE}/2f/24/54/6a.jpg`,
    rating: 4.8,
    reviewCount: 83,
    highlights: [
      "Fully private guided hiking experience",
      "Route customized to fitness and interests",
      "Expert naturalist guide",
      "Seasonal routing to Glacier Point or groves",
      "Extended time on trail away from crowds",
    ],
    startDescription:
      "Meet your private guide at the agreed Yosemite trailhead or valley meeting point.",
    endDescription: "Return to the meeting point after your private hike.",
    itineraryItems: [
      {
        title: "Yosemite Valley",
        description:
          "Private hike through valley trails with guide-selected routing.",
        duration: "3 hours",
        stopType: "stop",
      },
      {
        title: "Glacier Point",
        description:
          "Seasonal ascent to Glacier Point when road access permits.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Tuolumne Grove",
        description:
          "Optional grove walk among giant sequoias when included in your route.",
        duration: "1 hour",
        stopType: "stop",
      },
    ],
    inclusions: ["Private guide", "Trail planning", "Snacks"],
    categories: ["Private Tours", "Hiking"],
  },
  {
    productCode: "69029P14",
    productUrl:
      "https://www.viator.com/tours/Yosemite-National-Park/Giant-Sequoia-Snowshoe-and-Yosemite-Valley-Waterfalls-Adventure/d5265-69029P14",
    title: "Yosemite Valley Discovery Walk",
    description:
      "Discover Yosemite Valley on a guided discovery walk focused on waterfalls, meadows, and iconic granite landmarks. Your guide leads an unhurried route through the valley floor with stories of John Muir, Ansel Adams, and the park's climbing history.",
    duration: "3 hours (approx.)",
    priceFrom: 180,
    heroUrl: `${HERO_BASE}/2f/24/6d/d8.jpg`,
    rating: 4.7,
    reviewCount: 56,
    highlights: [
      "Guided discovery walk in Yosemite Valley",
      "Waterfall and meadow viewpoints",
      "Stories of park history and conservation",
      "Small-group format with naturalist guide",
      "Easy walking suitable for most travelers",
    ],
    startDescription:
      "Meet at the Yosemite Valley Visitor Center area for check-in with your guide.",
    endDescription:
      "Finish the discovery walk near the Yosemite Valley meeting area.",
    itineraryItems: [
      {
        title: "Yosemite Valley",
        description:
          "Leisurely guided walk across the valley floor with frequent photo stops.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Yosemite Falls",
        description:
          "Stop near Lower Yosemite Fall to hear the cascade and take photos.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Half Dome",
        description:
          "View Half Dome from valley meadows with guide commentary.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["Professional guide"],
    categories: ["Walking Tours", "Nature and Wildlife"],
  },
];

const buildFixture = (tour: YosemiteTourFixture) => {
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

for (const tour of YOSEMITE_TOURS) {
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

console.log(`Generated ${YOSEMITE_TOURS.length} Yosemite Engine6 fixtures.`);
