import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { NAPA_VIATOR_PUBLIC_RATINGS } from "../src/engine6/napaViatorPublicRatings";

type ItineraryItem = {
  title: string;
  description: string;
  duration?: string;
  stopType: "stop" | "pass-by";
};

type NapaTourFixture = {
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

const NAPA_TOURS: NapaTourFixture[] = [
  {
    productCode: "6938NAPATRLY",
    productUrl:
      "https://www.viator.com/tours/Napa-and-Sonoma/Napa-Valley-Wine-Trolley/d914-6938NAPATRLY",
    title: "Napa Valley Wine Trolley Classic Tour",
    description:
      "Make exploring Wine Country easy on this tour aboard the Napa Valley Wine Trolley. The open-air cable car replica offers vineyard views as you travel to three or four wineries for tastings at your own expense. A guide shares Napa history while lunch at a winery is included for convenience.",
    duration: "6 hours 30 minutes (approx.)",
    priceFrom: 145,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/73/ee/87.jpg",
    rating: 4.5,
    reviewCount: 762,
    highlights: [
      "Open-air San Francisco cable car replica through Napa Valley",
      "Visit three or four wineries with reserved tasting stops",
      "Included lunch at a local winery",
      "Pickup and drop-off at Oxbow Public Market in Napa",
      "Guide commentary on Napa Valley wine history",
    ],
    startDescription:
      "Meet at Oxbow Public Market, 610 1st St, Napa, CA 94559 at the south parking lot across from the market.",
    endDescription:
      "Return to Oxbow Public Market after the final winery stop.",
    itineraryItems: [
      {
        title: "Oxbow Public Market",
        description:
          "Board the Napa Valley Wine Trolley at the Oxbow Public Market meeting point in downtown Napa.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Napa Valley",
        description:
          "Ride the open-air trolley through vineyard corridors with guide commentary between winery stops.",
        duration: "4 hours",
        stopType: "stop",
      },
      {
        title: "Napa Valley Wineries",
        description:
          "Visit three or four scheduled wineries for tours and tastings at your own expense.",
        duration: "3 hours",
        stopType: "stop",
      },
    ],
    inclusions: ["Lunch", "Guided tour", "Winery reservations"],
    categories: ["Wine Tasting", "Trolley Tours"],
  },
  {
    productCode: "6285P4",
    productUrl:
      "https://www.viator.com/tours/Napa-and-Sonoma/Small-Group-Wine-Tasting-Tour-through-Napa-Valley/d914-6285P4",
    title: "Napa Valley Small Group Winery Tour",
    description:
      "Discover Napa Valley at a relaxed pace on a full-day small-group tour. Shuttle transport collects you from your Napa Valley hotel and carries your group to three distinct wineries for tastings at your own expense, with live commentary and a complimentary picnic lunch at a charming winery.",
    duration: "7 hours (approx.)",
    priceFrom: 151.48,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/72/f3/26.jpg",
    rating: 5.0,
    reviewCount: 1038,
    highlights: [
      "Small-group Napa Valley winery tour with hotel pickup",
      "Three backroads winery stops with optional tastings",
      "Complimentary picnic lunch at a Napa Valley winery",
      "Shuttle transport with driver guide commentary",
      "Hotel pickup and drop-off within the tour region",
    ],
    startDescription:
      "Pickup from your Napa Valley hotel or meet at Main Street and 5th Street, Napa, CA 94559.",
    endDescription:
      "Return to your hotel or the original Napa Valley meeting point.",
    itineraryItems: [
      {
        title: "Napa Valley",
        description:
          "Begin the full-day route through Napa Valley backroads wineries with your driver guide.",
        duration: "6 hours",
        stopType: "stop",
      },
      {
        title: "Napa Valley Wineries",
        description:
          "Stop at three boutique wineries for tours, tastings, and optional purchases.",
        duration: "4 hours",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Three winery stops",
      "Driver tour guide",
      "Shuttle transport",
      "Picnic lunch",
      "Hotel pickup and drop-off",
    ],
    categories: ["Wine Tasting", "Day Trips"],
  },
  {
    productCode: "339737P1",
    productUrl:
      "https://www.viator.com/tours/Napa-and-Sonoma/Join-in-Flight/d914-339737P1",
    title: "Wine Country Join-in Flight",
    description:
      "Soar above Sonoma and Napa on this award-winning hot air balloon tour launching at sunrise from a private airport site. Glide over vineyards and canyons into Napa Valley with sweeping views from the Mayacamas Mountains to the San Francisco skyline, plus pre-flight snacks and a celebratory champagne toast.",
    duration: "4 hours (approx.)",
    priceFrom: 325,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/13/18/11/e7.jpg",
    rating: 5.0,
    reviewCount: 272,
    highlights: [
      "Sunrise hot air balloon flight over Napa and Sonoma",
      "Exclusive western Napa flight corridor with panoramic views",
      "Pre-flight snacks and all-inclusive champagne toast",
      "Launch from Sonoma Skypark private airport site",
      "Views from Mayacamas Mountains to San Francisco skyline",
    ],
    startDescription:
      "Meet at 21870 8th St E, Sonoma, CA 95476 at the flight lounge parking lot marked by flashing yellow lights.",
    endDescription:
      "Return to the Sonoma Skypark meeting location after the post-flight champagne toast.",
    itineraryItems: [
      {
        title: "Sonoma Skypark",
        description:
          "Check in at the flight lounge before sunrise launch preparations.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Carneros Valley",
        description:
          "Float over Carneros Valley vineyard and canyon scenery on the balloon route.",
        stopType: "pass-by",
      },
      {
        title: "Napa Valley",
        description:
          "Drift above Napa Valley vineyards with pilot commentary and photo opportunities.",
        duration: "1 hour",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Hot air balloon flight",
      "Pre-flight snacks",
      "Champagne toast",
      "Air-conditioned ground transport",
    ],
    categories: ["Hot Air Balloon Rides", "Outdoor Activities"],
  },
  {
    productCode: "148923P3",
    productUrl:
      "https://www.viator.com/tours/Napa-and-Sonoma/6-Hours-up-to-6-passengers-Napa-or-Sonoma-Valley-Wine-Tour-by-Private-SUV/d914-148923P3",
    title: "6 Hour Napa or Sonoma Valley Wine Tour by Private SUV",
    description:
      "Explore Napa or Sonoma Valley in a private SUV with a knowledgeable chauffeur-guide. This six-hour tour whisks your group between handpicked wineries while you relax and enjoy the scenery, with bottled water provided and flexible pacing for tastings and lunch stops.",
    duration: "6 hours (approx.)",
    priceFrom: 390,
    heroUrl:
      "https://dynamic-media.tacdn.com/media/photo-o/2e/d7/9c/43/caption.jpg",
    rating: 4.9,
    reviewCount: 177,
    highlights: [
      "Private six-hour SUV wine tour for up to six passengers",
      "Choose Napa Valley or Sonoma Valley routing",
      "Knowledgeable chauffeur-guide and flexible winery pacing",
      "Bottled water included on board",
      "Door-to-door pickup in Napa Valley wine country",
    ],
    startDescription:
      "Pickup from your Napa Valley hotel, Airbnb, or confirmed meeting location after booking.",
    endDescription:
      "Return to your original pickup location after the final winery stop.",
    itineraryItems: [
      {
        title: "Napa Valley",
        description:
          "Depart in a private SUV for a customized six-hour Napa or Sonoma winery route.",
        duration: "6 hours",
        stopType: "stop",
      },
      {
        title: "Napa Valley Wineries",
        description:
          "Visit multiple wineries selected for your group's preferences with time for tastings.",
        duration: "4 hours",
        stopType: "stop",
      },
    ],
    inclusions: ["Private SUV transport", "Chauffeur-guide", "Bottled water"],
    categories: ["Private Drivers", "Wine Tasting"],
  },
  {
    productCode: "17140_DWT",
    productUrl:
      "https://www.viator.com/tours/Napa-and-Sonoma/Napa-Valley-Wine-Country-Tour/d914-17140_DWT",
    title: "Napa Valley Daily Join In Group Wineries Tour Including Lunch",
    description:
      "Join a daily group wine tour from Napa with professional driver-guide transport to three premier wineries. This join-in outing includes lunch and pickup from downtown Napa hotels or the Oxbow Public Market meeting point for an easy wine country day with fellow travelers.",
    duration: "6 to 7 hours (approx.)",
    priceFrom: 125,
    heroUrl:
      "https://dynamic-media.tacdn.com/media/photo-o/2e/d7/9c/7e/caption.jpg",
    rating: 4.4,
    reviewCount: 465,
    highlights: [
      "Daily join-in group tour departing from Napa",
      "Three premier winery stops with driver guide",
      "Included lunch on the wine country route",
      "Pickup from downtown Napa hotels or Oxbow Market",
      "Shared format for meeting other wine lovers",
    ],
    startDescription:
      "Pickup from downtown Napa or American Canyon hotels, or meet at Oxbow Public Market, 610 1st St, Napa, CA 94559.",
    endDescription:
      "Return to your pickup hotel or the Oxbow Public Market meeting point.",
    itineraryItems: [
      {
        title: "Napa Valley",
        description:
          "Ride with a professional driver guide to three premier Napa and Sonoma wineries.",
        duration: "5 hours",
        stopType: "stop",
      },
      {
        title: "Oxbow Public Market",
        description:
          "Meet at Oxbow Public Market when joining from the central Napa meeting point.",
        duration: "15 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Driver guide", "Group transport", "Lunch"],
    categories: ["Wine Tasting", "Bus Tours"],
  },
  {
    productCode: "6938CASTLE",
    productUrl:
      "https://www.viator.com/tours/Napa-and-Sonoma/Napa-Valley-Wine-Trolley-and-Castle-Tour/d914-6938CASTLE",
    title: "Napa Valley Wine Trolley Castle Tour",
    description:
      "Experience Napa Valley on the Wine Trolley Castle Tour heading north to Calistoga. The route includes Castello di Amorosa for an extensive tasting, lunch at Tre Vigne Pizzeria, and two additional notable Napa Valley wineries aboard an open-air cable car replica.",
    duration: "6 hours 30 minutes (approx.)",
    priceFrom: 135,
    heroUrl:
      "https://dynamic-media.tacdn.com/media/photo-o/2e/d7/98/9b/caption.jpg",
    rating: 4.3,
    reviewCount: 244,
    highlights: [
      "Up-valley Napa Wine Trolley route to Calistoga",
      "Castello di Amorosa castle winery tasting stop",
      "Included lunch at Tre Vigne Pizzeria",
      "Open-air cable car replica transport",
      "Two additional Napa Valley winery visits",
    ],
    startDescription:
      "Meet at Oxbow Public Market, 610 1st St, Napa, CA 94559 for trolley pickup.",
    endDescription: "Return to the Oxbow Public Market meeting point in Napa.",
    itineraryItems: [
      {
        title: "Castello di Amorosa",
        description:
          "Tour the Tuscan-style castle winery for an extensive tasting in Calistoga.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Calistoga",
        description:
          "Continue the up-valley trolley route through Calistoga wine country.",
        stopType: "pass-by",
      },
      {
        title: "Napa Valley Wineries",
        description:
          "Visit two additional notable Napa Valley wineries after lunch.",
        duration: "2 hours",
        stopType: "stop",
      },
    ],
    inclusions: ["Lunch", "Guided tour", "Winery reservations"],
    categories: ["Wine Tasting", "Trolley Tours"],
  },
  {
    productCode: "41114P2",
    productUrl:
      "https://www.viator.com/tours/Napa-and-Sonoma/Half-Day-Napa-Valley-Bike-and-Wine-Tour/d914-41114P2",
    title: "Half-Day Napa Valley E-Bike Tour",
    description:
      "Explore Napa Valley on a half-day electric bike tour through wine country backroads. A local guide leads a small group to a winery stop with commentary on valley history and the vine-to-bottle process, with optional extended riding in Yountville after the tour concludes.",
    duration: "3 hours 30 minutes (approx.)",
    priceFrom: 169,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/11/a3/2c/68.jpg",
    rating: 4.7,
    reviewCount: 71,
    highlights: [
      "Half-day Napa Valley e-bike tour with local guide",
      "Pedal-assist bikes for varied fitness levels",
      "Winery stop on the Yountville area route",
      "Commentary on Napa Valley history and winemaking",
      "Option to keep bikes for self-guided riding after tour",
    ],
    startDescription:
      "Meet at the confirmed Yountville area bike tour location listed in your booking confirmation.",
    endDescription:
      "Finish in Yountville with optional extended self-guided riding.",
    itineraryItems: [
      {
        title: "Yountville",
        description:
          "Start the guided e-bike route through Napa Valley lanes near Yountville.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Napa Valley Wineries",
        description:
          "Stop at a local winery for tasting time on the half-day bike route.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Napa Valley",
        description:
          "Continue through scenic wine country backroads with guide commentary.",
        duration: "2 hours",
        stopType: "stop",
      },
    ],
    inclusions: ["Local guide", "Electric bike and helmet"],
    categories: ["Bike Tours", "Wine Tasting"],
  },
  {
    productCode: "38386P1",
    productUrl:
      "https://www.viator.com/tours/Napa-and-Sonoma/Private-Luxury-Wine-Tour-for-up-to-7-guests-thru-Napa-Valley-or-Sonoma/d914-38386P1",
    title: "6 Hour Private Customized Wine Tour up to 7 Guests Napa and Sonoma",
    description:
      "Enjoy a fully customizable half-day private wine tour of Napa and Sonoma in an SUV for up to seven guests. Your local guide provides concierge winery recommendations, bottled water, snacks, and photography assistance while you visit handpicked producers at your preferred pace.",
    duration: "6 hours (approx.)",
    priceFrom: 600,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/15/30/78/a1.jpg",
    rating: 4.9,
    reviewCount: 80,
    highlights: [
      "Private six-hour SUV tour for up to seven guests",
      "Fully customizable Napa or Sonoma winery itinerary",
      "Concierge winery and restaurant recommendations",
      "Pickup and drop-off in Napa or Sonoma",
      "Bottled water and snacks included",
    ],
    startDescription:
      "Pickup from your Napa or Sonoma hotel, Airbnb, or confirmed address after booking.",
    endDescription: "Return to your original pickup location after the tour.",
    itineraryItems: [
      {
        title: "Napa Valley",
        description:
          "Begin your private customized route through Napa or Sonoma wine country.",
        duration: "6 hours",
        stopType: "stop",
      },
      {
        title: "Napa Valley Wineries",
        description:
          "Visit three or more wineries tailored to your group's wine preferences.",
        duration: "4 hours",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private guide",
      "SUV transport",
      "Concierge service",
      "Bottled water",
      "Snacks",
    ],
    categories: ["Private Drivers", "Wine Tasting"],
  },
  {
    productCode: "175643P1",
    productUrl:
      "https://www.viator.com/tours/Napa-and-Sonoma/8hr-Private-Sonoma-or-Napa-Wine-Tours-with-Concierge-Service/d914-175643P1",
    title: "Sonoma or Napa 8hr Private Wine Tour with Concierge Service",
    description:
      "Spend a full day in wine country with a private tour and concierge service that preplans your Sonoma or Napa itinerary. Round-trip transport, bottled water, and predetermined tour templates help your group visit favorite wineries without worrying about driving or reservations.",
    duration: "8 hours 15 minutes (approx.)",
    priceFrom: 599,
    heroUrl:
      "https://dynamic-media.tacdn.com/media/photo-o/2f/1b/38/98/caption.jpg",
    rating: 4.9,
    reviewCount: 136,
    highlights: [
      "Eight-hour private wine tour with concierge planning",
      "Visit Napa Valley or Sonoma County wineries",
      "Pre-travel consultation to customize the itinerary",
      "Free pickup in Napa city limits and south Sonoma",
      "Predetermined tour templates available on request",
    ],
    startDescription:
      "Free pickup in Napa city limits, Yountville, and south central Sonoma at your hotel or Airbnb.",
    endDescription: "Return to your original pickup location after the tour.",
    itineraryItems: [
      {
        title: "Napa Valley",
        description:
          "Depart on an eight-hour private route through Napa or Sonoma wine country.",
        duration: "8 hours",
        stopType: "stop",
      },
      {
        title: "Napa Valley Wineries",
        description:
          "Visit multiple wineries selected during your pre-travel concierge consultation.",
        duration: "5 hours",
        stopType: "stop",
      },
    ],
    inclusions: ["Private transportation", "Concierge planning", "Bottled water"],
    categories: ["Private Drivers", "Wine Tasting"],
  },
  {
    productCode: "396101P2",
    productUrl:
      "https://www.viator.com/tours/Napa-and-Sonoma/Private-Napa-Valley-and-Sonoma-Wine-Tour-Experiences/d914-396101P2",
    title: "Private Wine Tours of Napa Valley and Sonoma for 2 to 5 people",
    description:
      "Book a private five-hour chauffeured wine tour for groups of two to five across Napa Valley and Sonoma County. A professional driver and concierge service help select and reserve winery tastings while you relax with complimentary bottled water between stops.",
    duration: "5 hours (approx.)",
    priceFrom: 400,
    heroUrl:
      "https://dynamic-media.tacdn.com/media/photo-o/2e/d7/95/fa/caption.jpg",
    rating: 4.9,
    reviewCount: 39,
    highlights: [
      "Private five-hour tour for two to five travelers",
      "Door-to-door pickup and drop-off in wine country",
      "Concierge assistance booking winery tastings",
      "Professional chauffeur-guide throughout the day",
      "Complimentary bottled water on board",
    ],
    startDescription:
      "Door-to-door pickup from your Napa or Sonoma lodging within the service area.",
    endDescription: "Return to your original pickup location after the tour.",
    itineraryItems: [
      {
        title: "Napa Valley",
        description:
          "Travel by private vehicle between Napa Valley and Sonoma winery stops.",
        duration: "5 hours",
        stopType: "stop",
      },
      {
        title: "Napa Valley Wineries",
        description:
          "Visit wineries selected with concierge support based on your preferences.",
        duration: "3 hours",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private chauffeur-guide",
      "Concierge service",
      "Complimentary bottled water",
    ],
    categories: ["Private Drivers", "Wine Tasting"],
  },
  {
    productCode: "212180P2",
    productUrl:
      "https://www.viator.com/tours/Napa-and-Sonoma/6-Hour-Exclusive-Wine-Country-Experience-for-up-to-6-Guests/d914-212180P2",
    title: "6-Hour Exclusive Wine Tour Experience Up to 6 Guests",
    description:
      "Explore Napa or Sonoma Valley in luxury on a six-hour private SUV tour for up to six guests. Choose your own wineries or follow a curated schedule designed to maximize tastings, vineyard views, and relaxed pacing with a professional driver handling every transfer.",
    duration: "6 hours (approx.)",
    priceFrom: 560,
    heroUrl:
      "https://dynamic-media.tacdn.com/media/photo-o/2e/d9/96/d6/caption.jpg",
    rating: 5.0,
    reviewCount: 62,
    highlights: [
      "Exclusive six-hour private SUV wine country experience",
      "Up to six guests with curated or custom winery lineup",
      "Professional driver for seamless valley transfers",
      "Flexible time at each winery and scenic stop",
      "Napa or Sonoma Valley routing available",
    ],
    startDescription:
      "Pickup from your Napa Valley resort, hotel, or confirmed address after booking.",
    endDescription: "Return to your pickup location after the final stop.",
    itineraryItems: [
      {
        title: "Napa Valley",
        description:
          "Begin a six-hour exclusive private route through wine country.",
        duration: "6 hours",
        stopType: "stop",
      },
      {
        title: "Napa Valley Wineries",
        description:
          "Visit boutique and landmark producers with time for tastings and vineyard walks.",
        duration: "4 hours",
        stopType: "stop",
      },
    ],
    inclusions: ["Private SUV transport", "Professional driver"],
    categories: ["Private Drivers", "Wine Tasting"],
  },
  {
    productCode: "87617P1",
    productUrl:
      "https://www.viator.com/tours/Napa-and-Sonoma/7-Hour-Private-Napa-or-Sonoma-Wine-Tour/d914-87617P1",
    title: "6hr 12 Passenger Mercedes Limo Sprinter Bus",
    description:
      "Tour Napa or Sonoma Valley in a Mercedes limo sprinter bus built for groups up to twelve passengers. This six-hour private charter includes flexible winery selection, onboard space to stand comfortably, and experienced planning for a VIP wine tasting day.",
    duration: "6 hours (approx.)",
    priceFrom: 1440,
    heroUrl:
      "https://dynamic-media.tacdn.com/media/photo-o/2e/d7/98/92/caption.jpg",
    rating: 5.0,
    reviewCount: 174,
    highlights: [
      "Mercedes sprinter limo bus for up to twelve passengers",
      "Six-hour private Napa or Sonoma wine tour charter",
      "High-top interior with room to stand comfortably",
      "Custom or operator-recommended winery itinerary",
      "Ideal for celebrations and group wine country outings",
    ],
    startDescription:
      "Pickup from your confirmed Napa or Sonoma address after itinerary planning.",
    endDescription: "Return to your original pickup point after the charter.",
    itineraryItems: [
      {
        title: "Napa Valley",
        description:
          "Board the sprinter bus for a six-hour private group wine tour route.",
        duration: "6 hours",
        stopType: "stop",
      },
      {
        title: "Napa Valley Wineries",
        description:
          "Visit three to four wineries with reservations arranged for your group.",
        duration: "4 hours",
        stopType: "stop",
      },
    ],
    inclusions: ["Private sprinter bus", "Professional driver"],
    categories: ["Limousine Tours", "Wine Tasting"],
  },
];

const buildFixture = (tour: NapaTourFixture) => {
  const viatorRatings = NAPA_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: "Napa", state: "California" },
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
          question: "Where does the tour depart from in Napa Valley?",
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

for (const tour of NAPA_TOURS) {
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

console.log(`Generated ${NAPA_TOURS.length} Napa Engine6 fixtures.`);
