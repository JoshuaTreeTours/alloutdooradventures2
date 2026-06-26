import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { MONTEREY_VIATOR_PUBLIC_RATINGS } from "../src/engine6/montereyViatorPublicRatings";

type ItineraryItem = {
  title: string;
  description: string;
  duration?: string;
  stopType: "stop" | "pass-by";
};

type MontereyTourFixture = {
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

const MONTEREY_TOURS: MontereyTourFixture[] = [
  {
    productCode: "70275P1",
    productUrl:
      "https://www.viator.com/tours/Monterey-and-Carmel/Ride-an-e-Bike-along-the-coastline-explore17-Mile-Drive/d5250-70275P1",
    title: "Monterey 17 Mile Drive Guided Electric Bike Tour",
    description:
      "Ride an electric bike along the Monterey Peninsula coastline on a guided three-hour tour through 17-Mile Drive scenery. A local guide leads the route past Pebble Beach viewpoints, cypress groves, and Pacific overlooks with flexible pacing for varied fitness levels.",
    duration: "3 hours (approx.)",
    priceFrom: 55,
    heroUrl: `${TACDN}/15/ff/01/ff.jpg`,
    rating: 5.0,
    reviewCount: 889,
    highlights: [
      "Guided electric bike tour along 17-Mile Drive",
      "Coastal viewpoints and cypress-lined scenic corridors",
      "Small-group format with local guide",
      "Flexible pacing on e-bike assisted routes",
      "Photo stops at iconic Monterey Peninsula overlooks",
    ],
    startDescription:
      "Meet at the confirmed Carmel or Pacific Grove meeting point listed in your booking confirmation.",
    endDescription: "Tour returns to the original Monterey Peninsula meeting location.",
    itineraryItems: [
      {
        title: "17-Mile Drive",
        description:
          "Begin the guided e-bike route along the Monterey Peninsula coastal drive.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Pebble Beach",
        description:
          "Pass scenic golf-course overlooks and shoreline viewpoints along the drive.",
        stopType: "pass-by",
      },
      {
        title: "Lone Cypress",
        description:
          "Stop for photos at the famous cypress tree overlook when route conditions allow.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Pacific Grove",
        description:
          "Continue through Pacific Grove coastal lanes with guide commentary on local history.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["Local guide", "Electric bike and helmet"],
    categories: ["Bike Tours", "Sightseeing Tours"],
  },
  {
    productCode: "53254P1",
    productUrl:
      "https://www.viator.com/tours/Monterey-and-Carmel/Monterey-4-hour-Whale-Watching-Experience/d5250-53254P1",
    title: "Whale Watching Tour From Monterey",
    description:
      "Cruise Monterey Bay on a guided whale-watching trip from Old Fisherman's Wharf with a naturalist crew. The route searches for gray, humpback, and blue whales plus dolphins, sea lions, and seabirds in the Monterey Bay National Marine Sanctuary.",
    duration: "3 hours 30 minutes (approx.)",
    priceFrom: 70,
    heroUrl: `${TACDN}/06/6e/e7/f6.jpg`,
    rating: 4.8,
    reviewCount: 1064,
    highlights: [
      "Guided whale-watching cruise from Monterey Bay",
      "Naturalist commentary on marine wildlife",
      "Depart from Old Fisherman's Wharf",
      "Search for gray, humpback, and blue whales",
      "Views of dolphins, sea lions, and seabirds",
    ],
    startDescription:
      "Board at Old Fisherman's Wharf in Monterey at the operator location listed in your confirmation.",
    endDescription: "Return to Old Fisherman's Wharf after the bay cruise.",
    itineraryItems: [
      {
        title: "Old Fisherman's Wharf",
        description:
          "Board the vessel at Monterey's historic wharf before heading into the bay.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Monterey Bay",
        description:
          "Cruise protected sanctuary waters while the crew searches for whales and dolphins.",
        duration: "2 hours 30 minutes",
        stopType: "stop",
      },
      {
        title: "Monterey Bay National Marine Sanctuary",
        description:
          "Pass through sanctuary waters with commentary on seasonal whale migration patterns.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["Live commentary on board"],
    categories: ["Whale Watching", "Cruises & Sailing"],
  },
  {
    productCode: "362397P1",
    productUrl:
      "https://www.viator.com/tours/Monterey-and-Carmel/Monterey-Whale-Watching-Tour/d5250-362397P1",
    title: "Monterey Whale Watching Tour",
    description:
      "Join a Monterey whale-watching cruise aboard a comfortable vessel with onboard naturalists and marine biologists. The route explores Monterey Bay sanctuary waters to spot humpback, gray, and blue whales along with dolphins, sea otters, and other Pacific wildlife.",
    duration: "3 hours (approx.)",
    priceFrom: 70,
    heroUrl: `${TACDN}/06/6e/e7/f9.jpg`,
    rating: 4.9,
    reviewCount: 780,
    highlights: [
      "Whale-watching cruise with onboard naturalists",
      "Comfortable vessel designed for wildlife viewing",
      "High success rate for seasonal whale sightings",
      "Marine biologist commentary on Monterey Bay ecology",
      "Depart from Monterey waterfront",
    ],
    startDescription:
      "Meet at the Monterey waterfront departure point confirmed after booking.",
    endDescription: "Return to the Monterey departure pier after the cruise.",
    itineraryItems: [
      {
        title: "Monterey waterfront",
        description:
          "Check in and board at the Monterey departure pier before the bay cruise.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Monterey Bay",
        description:
          "Cruise open waters while naturalists help locate whales and marine mammals.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Cannery Row",
        description:
          "Pass Cannery Row shoreline corridors on the return approach to harbor.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["Onboard naturalist", "Use of binoculars when available"],
    categories: ["Whale Watching", "Cruises & Sailing"],
  },
  {
    productCode: "53254P8",
    productUrl:
      "https://www.viator.com/tours/Monterey-and-Carmel/Sunset-Whale-Watch/d5250-53254P8",
    title: "Sunset Whale Watch Tour in Monterey",
    description:
      "Watch for whales at sunset on a guided Monterey Bay cruise led by a naturalist or marine biologist. The evening route departs from Fisherman's Wharf with provided coffee or tea while the crew searches for breaching whales and coastal wildlife.",
    duration: "3 hours (approx.)",
    priceFrom: 75,
    heroUrl: `${TACDN}/06/6e/e7/f6.jpg`,
    rating: 4.8,
    reviewCount: 312,
    highlights: [
      "Sunset whale-watching cruise on Monterey Bay",
      "Naturalist or marine biologist guide on board",
      "Coffee or tea provided during the cruise",
      "Shared group format from Fisherman's Wharf",
      "Evening light over Pacific coastal waters",
    ],
    startDescription:
      "Meet at 66 Fisherman's Wharf, Monterey, CA 93940 at the Discovery Whale Watch blue building.",
    endDescription: "Return to 66 Fisherman's Wharf after the sunset cruise.",
    itineraryItems: [
      {
        title: "Fisherman's Wharf",
        description:
          "Board at the Discovery Whale Watch office on Fisherman's Wharf.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Monterey Bay",
        description:
          "Cruise at sunset while the guide searches for whales and dolphins.",
        duration: "2 hours 15 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Naturalist guide", "Coffee or tea on board"],
    categories: ["Whale Watching", "Cruises & Sailing"],
  },
  {
    productCode: "6021MBA",
    productUrl:
      "https://www.viator.com/tours/Monterey-and-Carmel/Monterey-Bay-Aquarium-Admission/d5250-6021MBA",
    title: "Monterey Bay Aquarium Admission Ticket",
    description:
      "Visit the Monterey Bay Aquarium on Cannery Row with a skip-the-line admission ticket for all-day access. Explore kelp forest, open sea, and otter exhibits plus daily feedings and interpretive programs at one of the top aquariums on the Pacific Coast.",
    duration: "2 to 4 hours (approx.)",
    priceFrom: 60,
    heroUrl: `${TACDN}/12/2e/41/ec.jpg`,
    rating: 4.5,
    reviewCount: 1290,
    highlights: [
      "Skip-the-line admission to Monterey Bay Aquarium",
      "All-day access to major exhibit galleries",
      "See sea otters, jellyfish, sharks, and kelp forest displays",
      "Located on historic Cannery Row waterfront",
      "Daily feedings and interpretive programs",
    ],
    startDescription:
      "Enter at Monterey Bay Aquarium, 886 Cannery Row, Monterey, CA 93940 during opening hours.",
    endDescription: "Exit at the aquarium entrance when your visit concludes.",
    itineraryItems: [
      {
        title: "Monterey Bay Aquarium",
        description:
          "Enter the aquarium and explore main galleries at your own pace.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Kelp Forest",
        description:
          "View the towering kelp forest exhibit and surrounding marine habitats.",
        stopType: "stop",
      },
      {
        title: "Open Sea",
        description:
          "Visit the open-ocean gallery featuring sharks, sardines, and pelagic species.",
        stopType: "stop",
      },
      {
        title: "Cannery Row",
        description:
          "Walk Cannery Row before or after your aquarium visit along the Monterey waterfront.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["Aquarium admission ticket"],
    categories: ["Attraction Tickets", "Family Friendly"],
  },
  {
    productCode: "5973FOOD",
    productUrl:
      "https://www.viator.com/tours/Monterey-and-Carmel/Carmel-Small-Group-Food-and-Wine-Walking-Tour/d5250-5973FOOD",
    title: "Carmel Small Group Walking Food and Cultural Tour",
    description:
      "Explore Carmel-by-the-Sea on a small-group walking food and cultural tour with tastings at local restaurants and specialty shops. A guide shares village history while the route covers hidden courtyards, galleries, and signature Carmel flavors.",
    duration: "3 hours 15 minutes (approx.)",
    priceFrom: 149,
    heroUrl: `${TACDN}/15/4f/1e/85.jpg`,
    rating: 4.9,
    reviewCount: 403,
    highlights: [
      "Small-group Carmel food and wine walking tour",
      "Multiple tastings at local restaurants and shops",
      "Explore hidden courtyards and village lanes",
      "Guide shares Carmel history and architecture",
      "Maximum group size keeps the route intimate",
    ],
    startDescription:
      "Meet at the confirmed Carmel-by-the-Sea meeting point listed in your booking confirmation.",
    endDescription: "Tour finishes in downtown Carmel-by-the-Sea.",
    itineraryItems: [
      {
        title: "Carmel-by-the-Sea",
        description:
          "Begin in the village center before the guided tasting route through town.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Ocean Avenue",
        description:
          "Walk Ocean Avenue corridors with stops at curated food and wine venues.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Carmel Mission",
        description:
          "Pass near the historic mission district with commentary on village founding.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["Local guide", "Food tastings"],
    categories: ["Food Tours", "Walking Tours"],
  },
  {
    productCode: "88377P1",
    productUrl:
      "https://www.viator.com/tours/Monterey-and-Carmel/Old-Monterey-Walking-Food-Tour/d5250-88377P1",
    title: "Old Monterey Walking Food Tour",
    description:
      "Taste Old Monterey on a guided walking food tour through historic adobe districts, Fisherman's Wharf, and Cannery Row corridors. Sample local seafood, artisan bites, and regional specialties while learning Monterey's Spanish and sardine-era history.",
    duration: "3 hours 30 minutes (approx.)",
    priceFrom: 153,
    heroUrl: `${TACDN}/06/7b/71/39.jpg`,
    rating: 5.0,
    reviewCount: 221,
    highlights: [
      "Guided Old Monterey walking food tour",
      "Tastings across historic downtown and waterfront areas",
      "Learn Monterey adobe and Cannery Row history",
      "Small-group format with local guide",
      "Route covers Fisherman's Wharf and Cannery Row",
    ],
    startDescription:
      "Meet at the confirmed Old Monterey meeting point listed in your booking confirmation.",
    endDescription: "Tour ends near Cannery Row or downtown Monterey.",
    itineraryItems: [
      {
        title: "Old Monterey",
        description:
          "Start in the historic adobe district before the curated tasting route.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Fisherman's Wharf",
        description:
          "Sample seafood and waterfront specialties along the wharf corridor.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Cannery Row",
        description:
          "Continue along Cannery Row with tastings and Steinbeck-era commentary.",
        duration: "1 hour",
        stopType: "stop",
      },
    ],
    inclusions: ["Local guide", "Food tastings"],
    categories: ["Food Tours", "Walking Tours"],
  },
  {
    productCode: "39976P3",
    productUrl:
      "https://www.viator.com/tours/Monterey-and-Carmel/Guided-Tours-of-Cannery-Row/d5250-39976P3",
    title: "Cannery Row Sardines Steinbeck and Sea Otters Tour",
    description:
      "Walk Cannery Row on a guided tour focused on John Steinbeck history, sardine-canning heritage, and modern sea otter conservation. The route covers waterfront lanes, historic cannery sites, and Monterey Bay viewpoints with a local historian guide.",
    duration: "2 hours (approx.)",
    priceFrom: 32,
    heroUrl: `${TACDN}/15/26/1a/5c.jpg`,
    rating: 4.9,
    reviewCount: 43,
    highlights: [
      "Guided walking tour of historic Cannery Row",
      "Learn John Steinbeck and sardine industry history",
      "Sea otter and marine conservation context",
      "Waterfront viewpoints along Monterey Bay",
      "Small-group historian-led format",
    ],
    startDescription:
      "Meet at the confirmed Cannery Row meeting point listed in your booking confirmation.",
    endDescription: "Tour ends along Cannery Row near the Monterey waterfront.",
    itineraryItems: [
      {
        title: "Cannery Row",
        description:
          "Begin on Cannery Row with an overview of the sardine-canning era.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Monterey Bay Aquarium",
        description:
          "Pass the aquarium exterior and waterfront exhibits corridor on Cannery Row.",
        stopType: "pass-by",
      },
      {
        title: "Monterey Bay",
        description:
          "Stop at bay viewpoints to discuss sea otters and marine sanctuary ecology.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Local guide"],
    categories: ["Walking Tours", "Historical Tours"],
  },
  {
    productCode: "14670CAR",
    productUrl:
      "https://www.viator.com/tours/Monterey-and-Carmel/1-Hour-Monterey-and-Cannery-Row-Sea-Car-Tour/d5250-14670CAR",
    title: "Ultimate Monterey Bay Cannery Row GoCar Tour",
    description:
      "Explore Monterey, Cannery Row, and Pacific Grove at your own pace in a GPS-guided GoCar. The narrated route covers waterfront landmarks, 17-Mile Drive access points, and scenic overlooks with flexible one- to three-hour rental windows.",
    duration: "1 to 3 hours (approx.)",
    priceFrom: 95,
    heroUrl: `${TACDN}/12/e8/2b/19.jpg`,
    rating: 4.0,
    reviewCount: 171,
    highlights: [
      "GPS-guided GoCar tour of Monterey and Cannery Row",
      "Flexible one- to three-hour rental duration",
      "Narrated route through Pacific Grove and bay viewpoints",
      "Self-drive format with live GPS commentary",
      "Cover more ground than a standard walking tour",
    ],
    startDescription:
      "Pick up the GoCar at the Monterey operator location listed in your booking confirmation.",
    endDescription: "Return the GoCar to the original Monterey pickup location.",
    itineraryItems: [
      {
        title: "Cannery Row",
        description:
          "Drive the narrated Cannery Row segment with GPS commentary at each landmark.",
        stopType: "pass-by",
      },
      {
        title: "Monterey Bay",
        description:
          "Follow waterfront routes with stops at bay overlooks when you choose to pause.",
        stopType: "stop",
      },
      {
        title: "Pacific Grove",
        description:
          "Continue into Pacific Grove coastal lanes on the GPS-guided route.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["GoCar rental", "GPS audio guide"],
    categories: ["Self-guided Tours", "City Tours"],
  },
  {
    productCode: "173135P2",
    productUrl:
      "https://www.viator.com/tours/Monterey-and-Carmel/Guided-2-Hour-Point-Lobos-Nature-Walk/d5250-173135P2",
    title: "Guided Point Lobos Nature Walk",
    description:
      "Hike Point Lobos State Natural Reserve on a guided nature walk with a local naturalist. The route covers woodland trails, cliff overlooks, and cove viewpoints while watching for otters, seals, deer, and seabirds in a small-group format.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 89,
    heroUrl: `${TACDN}/31/d9/f9/af.jpg`,
    rating: 4.9,
    reviewCount: 186,
    highlights: [
      "Guided hike in Point Lobos State Natural Reserve",
      "Naturalist guide knows wildlife viewing areas",
      "Woodland trails and coastal cliff overlooks",
      "Small group limited to 14 travelers",
      "Park admission included",
    ],
    startDescription:
      "Meet at the Point Lobos Walks parking area on Highway 1 south of the reserve entrance.",
    endDescription: "Return to the Highway 1 meeting parking area after the hike.",
    itineraryItems: [
      {
        title: "Point Lobos State Natural Reserve",
        description:
          "Enter the reserve for a guided walk through woodland and coastal trails.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Whalers Cove",
        description:
          "Stop at cove overlooks to watch for seals and sea otters when visible.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "China Cove",
        description:
          "View the turquoise cove and cliff formations on the guided route.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["Local guide", "Park admission"],
    categories: ["Nature Walks", "Hiking Tours"],
  },
  {
    productCode: "434555P1",
    productUrl:
      "https://www.viator.com/tours/Monterey-and-Carmel/Wine-Tasting-and-Walking-Tour-of-Carmel-by-the-Sea/d5250-434555P1",
    title: "Wine Tasting and Walking Tour of Carmel-by-the-Sea",
    description:
      "Combine Carmel-by-the-Sea wine tastings with a guided walking tour of village highlights and hidden gems. Local sommeliers introduce regional wines while the route explores courtyards, galleries, and scenic lanes in a small-group format.",
    duration: "3 hours (approx.)",
    priceFrom: 159,
    heroUrl: `${TACDN}/15/4f/1e/85.jpg`,
    rating: 4.8,
    reviewCount: 124,
    highlights: [
      "Wine tasting and walking tour of Carmel-by-the-Sea",
      "Sommelier-led tastings at local venues",
      "Explore village highlights and hidden courtyards",
      "Three-hour guided small-group experience",
      "Central Coast wine education from local experts",
    ],
    startDescription: "Meet at San Carlos Street, Carmel-by-the-Sea, CA 93921.",
    endDescription: "Tour finishes in downtown Carmel-by-the-Sea.",
    itineraryItems: [
      {
        title: "Carmel-by-the-Sea",
        description:
          "Meet on San Carlos Street before the wine tasting and walking route begins.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Downtown Carmel",
        description:
          "Walk village lanes with stops at tasting rooms and local wine venues.",
        duration: "2 hours",
        stopType: "stop",
      },
    ],
    inclusions: ["Local guide", "Wine tastings"],
    categories: ["Wine Tasting", "Walking Tours"],
  },
  {
    productCode: "118676P4",
    productUrl:
      "https://www.viator.com/tours/Monterey-and-Carmel/Wine-Trolley-Premium-Package/d5250-118676P4",
    title: "Carmel Valley Wine Tour Premium Package",
    description:
      "Ride from downtown Monterey to Carmel Valley on a vintage trolley or high-top van for a premium wine-tasting day. Visit three wineries with lunch, scenic valley views, and a take-home bottle included on this guided Monterey wine country outing.",
    duration: "6 hours (approx.)",
    priceFrom: 179,
    heroUrl: `${TACDN}/12/e8/a2/b7.jpg`,
    rating: 4.8,
    reviewCount: 98,
    highlights: [
      "Carmel Valley wine tour from downtown Monterey",
      "Tastings at three wineries plus lunch",
      "Vintage trolley or high-top van transport",
      "Take-home bottle of wine included",
      "Insider guide perspective on valley producers",
    ],
    startDescription:
      "Pickup from downtown Monterey at the location confirmed after booking.",
    endDescription: "Return to downtown Monterey after the valley wine tour.",
    itineraryItems: [
      {
        title: "Monterey",
        description:
          "Depart downtown Monterey by trolley or van toward Carmel Valley.",
        stopType: "pass-by",
      },
      {
        title: "Carmel Valley",
        description:
          "Visit three wineries with guided tastings across the valley route.",
        duration: "4 hours",
        stopType: "stop",
      },
      {
        title: "Carmel Valley Village",
        description:
          "Stop for lunch at a valley restaurant before the return drive to Monterey.",
        duration: "1 hour",
        stopType: "stop",
      },
    ],
    inclusions: ["Local guide", "Wine tastings", "Lunch", "Transport"],
    categories: ["Wine Tasting", "Day Trips"],
  },
  {
    productCode: "9345P1",
    productUrl:
      "https://www.viator.com/tours/Monterey-and-Carmel/Monterey-Bay-Sailing-Family-Cruise/d5250-9345P1",
    title: "Monterey Bay Sailing Cruise",
    description:
      "Sail Monterey Bay on a one- or two-hour catamaran cruise from Old Fisherman's Wharf. Watch for whales, dolphins, sea otters, and sea lions while enjoying views of the golden hills surrounding the protected marine sanctuary.",
    duration: "1 to 2 hours (approx.)",
    priceFrom: 65,
    heroUrl: `${TACDN}/11/fe/5d/78.jpg`,
    rating: 4.7,
    reviewCount: 445,
    highlights: [
      "Sailing cruise on Monterey Bay from Fisherman's Wharf",
      "Watch for whales, dolphins, and sea otters",
      "One- or two-hour charter options",
      "Views of sanctuary hills and coastline",
      "Pet-friendly sailing experience",
    ],
    startDescription:
      "Meet at Monterey Bay Sailing, 78 Old Fisherman's Wharf #1, Monterey, CA 93940.",
    endDescription: "Return to Old Fisherman's Wharf after the sailing loop.",
    itineraryItems: [
      {
        title: "Old Fisherman's Wharf",
        description:
          "Board the catamaran at the Sail Monterey office on Fisherman's Wharf.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "Monterey Bay",
        description:
          "Sail sanctuary waters with views of marine wildlife and coastal hills.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Cannery Row",
        description:
          "Pass Cannery Row shoreline from open-water perspectives on the return leg.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["Captain and crew"],
    categories: ["Sailing Trips", "Cruises & Sailing"],
  },
];

const buildFixture = (tour: MontereyTourFixture) => {
  const viatorRatings = MONTEREY_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
  product: {
    productCode: tour.productCode,
    productUrl: tour.productUrl,
    title: tour.title,
    description: { text: tour.description },
    location: { city: "Monterey", state: "California" },
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
        question: "Where does the tour depart from in Monterey?",
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

for (const tour of MONTEREY_TOURS) {
  const filePath = path.join(outputDir, `${tour.productCode}.exact-product.json`);
  writeFileSync(filePath, `${JSON.stringify(buildFixture(tour), null, 2)}\n`, "utf8");
  console.log(`Wrote ${filePath}`);
}

console.log(`Generated ${MONTEREY_TOURS.length} Monterey Engine6 fixtures.`);
