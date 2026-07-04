import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BOSTON_VIATOR_PUBLIC_RATINGS } from "../src/engine6/bostonViatorPublicRatings";

type ItineraryItem = {
  title: string;
  description: string;
  duration?: string;
  stopType: "stop" | "pass-by";
};

type BostonTourFixture = {
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

const BOSTON_TOURS: BostonTourFixture[] = [
  {
    productCode: "3283BWW",
    productUrl:
      "https://www.viator.com/tours/Boston/Boston-Whale-Watching-Cruise/d678-3283BWW",
    title: "Boston Whale Watching Cruise",
    description:
      "Head offshore from Boston Harbor on a premium whale watching cruise to Stellwagen Bank National Marine Sanctuary, one of the Atlantic's most reliable whale-feeding grounds. Naturalists on board identify humpbacks, fin whales, and dolphins while explaining migration patterns and marine ecology. The spacious vessel offers indoor and outdoor viewing decks suited to New England weather. This half-day outing suits families and first-time visitors who want open-ocean wildlife without a long drive from downtown Boston.",
    duration: "3 hours 30 minutes (approx.)",
    priceFrom: 85.56,
    heroUrl: `${TACDN}/09/94/a7/5d.jpg`,
    rating: 4.5,
    reviewCount: 2827,
    highlights: [
      "Whale watching cruise to Stellwagen Bank National Marine Sanctuary",
      "Naturalist commentary on humpbacks and marine wildlife",
      "Departures from Long Wharf in Boston Harbor",
      "Indoor and outdoor viewing decks",
      "Premium half-day format from downtown Boston",
    ],
    startDescription:
      "Board at Long Wharf in Boston Harbor. Arrive 30 minutes before departure for check-in and seating.",
    endDescription:
      "Return to Long Wharf after the offshore wildlife viewing loop.",
    itineraryItems: [
      {
        title: "Long Wharf",
        description: "Check in at Long Wharf and depart Boston Harbor.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Boston Harbor",
        description: "Transit through the harbor channel with skyline orientation.",
        duration: "30 minutes",
        stopType: "pass-by",
      },
      {
        title: "Stellwagen Bank National Marine Sanctuary",
        description: "Offshore whale watching in protected feeding grounds.",
        duration: "2 hours",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional naturalist guide",
      "Whale watching cruise",
      "Indoor and outdoor seating",
    ],
    categories: ["Cruises & Sailing", "Wildlife Tours", "Day Cruises"],
  },
  {
    productCode: "3283SSCRUISE",
    productUrl:
      "https://www.viator.com/tours/Boston/Boston-Historic-Sightseeing-Cruise/d678-3283SSCRUISE",
    title: "Boston Historic Sightseeing Cruise",
    description:
      "See Revolutionary Boston from the water on a narrated historic sightseeing cruise through Boston Harbor and the Inner Harbor islands. Your guide points out the USS Constitution, Bunker Hill Monument, Boston Light, Old North Church, and Castle Island as you pass each landmark from the deck. The one-hour format fits easily between Freedom Trail walks and North End dining. Ideal for first-time visitors who want harbor context without committing a full afternoon.",
    duration: "1 hour (approx.)",
    priceFrom: 46,
    heroUrl: `${TACDN}/0b/94/3a/b2.jpg`,
    rating: 4.5,
    reviewCount: 1138,
    highlights: [
      "Narrated Boston Harbor historic sightseeing cruise",
      "USS Constitution and Bunker Hill Monument pass-by views",
      "Boston Light and Castle Island harbor perspectives",
      "One-hour format from Long Wharf",
      "Premium introduction to Boston waterfront history",
    ],
    startDescription:
      "Board at Long Wharf near the New England Aquarium. Arrive 15 minutes early.",
    endDescription: "Disembark at Long Wharf after the harbor loop.",
    itineraryItems: [
      {
        title: "Long Wharf",
        description: "Board and depart from Long Wharf with harbor orientation.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "USS Constitution",
        description:
          "Pass Old Ironsides at Charlestown Navy Yard with Revolutionary War commentary.",
        stopType: "pass-by",
      },
      {
        title: "Bunker Hill Monument",
        description: "View the Charlestown obelisk from the harbor channel.",
        stopType: "pass-by",
      },
      {
        title: "Boston Light",
        description: "Pass Boston Light on Little Brewster Island.",
        stopType: "pass-by",
      },
      {
        title: "Old North Church",
        description:
          "Harbor perspective on the North End spire tied to Paul Revere's ride.",
        stopType: "pass-by",
      },
      {
        title: "Castle Island",
        description: "Circle Castle Island with Fort Independence views.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Professional narrator",
      "One-hour harbor cruise",
      "Open deck seating",
    ],
    categories: ["Cruises & Sailing", "Sightseeing Tours", "Historical Tours"],
  },
  {
    productCode: "44921P7",
    productUrl:
      "https://www.viator.com/tours/Boston/Sunset-Cruise/d678-44921P7",
    title: "Boston Sunset Harbor Cruise",
    description:
      "Watch the Boston skyline turn gold on a narrated sunset harbor cruise departing from Long Wharf. Your guide points out the Custom House Tower, Seaport District, and Charlestown Navy Yard as the light fades over Boston Harbor. The 90-minute format pairs harbor breezes with skyline photography without committing a full evening. Ideal for couples and first-time visitors who want a relaxed waterfront perspective after daytime downtown sightseeing.",
    duration: "1 hour 30 minutes (approx.)",
    priceFrom: 29,
    heroUrl: `${TACDN}/0b/94/34/73.jpg`,
    rating: 4.2,
    reviewCount: 474,
    highlights: [
      "Sunset harbor cruise from Long Wharf",
      "Boston skyline and Seaport District views",
      "Narrated pass-by of Charlestown Navy Yard",
      "90-minute evening format on Boston Harbor",
      "Premium waterfront outing after daytime sightseeing",
    ],
    startDescription:
      "Board at Long Wharf in Boston Harbor. Arrive 15 minutes before sunset departure for check-in.",
    endDescription:
      "Return to Long Wharf after the harbor sunset loop.",
    itineraryItems: [
      {
        title: "Long Wharf",
        description: "Board and depart Long Wharf with harbor orientation.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "Boston Harbor",
        description: "Cruise the inner harbor channel with sunset skyline views.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Charlestown Navy Yard",
        description: "Pass the USS Constitution and Charlestown waterfront at dusk.",
        stopType: "pass-by",
      },
      {
        title: "Seaport District",
        description: "Evening views of the Seaport towers and harbor islands.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Professional narrator",
      "Sunset harbor cruise",
      "Open deck seating",
    ],
    categories: ["Cruises & Sailing", "Sunset Tours", "Sightseeing Tours"],
  },
  {
    productCode: "3037DUCK",
    productUrl:
      "https://www.viator.com/tours/Boston/Boston-Duck-Tour/d678-3037DUCK",
    title: "Boston Duck Tour",
    description:
      "See Revolutionary Boston from land and water aboard an amphibious WWII-style Duck vehicle. Your conDUCKtor narrates Boston Common, the State House, and Faneuil Hall before splashing into the Charles River for a unique harbor-level perspective. The 80-minute loop covers downtown landmarks and the Esplanade in one entertaining ride. Perfect for families who want a fun overview without a long walking commitment.",
    duration: "1 hour 20 minutes (approx.)",
    priceFrom: 60,
    heroUrl: `${TACDN}/07/3c/d2/5f.jpg`,
    rating: 4.6,
    reviewCount: 9103,
    highlights: [
      "Amphibious Duck tour through downtown Boston",
      "Boston Common and Massachusetts State House pass-by",
      "Splash-down entry into the Charles River",
      "Faneuil Hall and Quincy Market routing",
      "Family-friendly 80-minute city overview",
    ],
    startDescription:
      "Check in at the Duck Tours departure point at the Museum of Science, Prudential Center, or New England Aquarium depending on your booking.",
    endDescription:
      "Return to your original Duck Tours boarding location after the river segment.",
    itineraryItems: [
      {
        title: "Boston Common",
        description: "Drive through America's oldest public park with Revolutionary context.",
        stopType: "pass-by",
      },
      {
        title: "Massachusetts State House",
        description: "Pass the golden dome on Beacon Hill with state government commentary.",
        stopType: "pass-by",
      },
      {
        title: "Faneuil Hall",
        description: "View Faneuil Hall and Quincy Market from the Duck vehicle.",
        stopType: "pass-by",
      },
      {
        title: "Charles River",
        description: "Splash into the Charles River for a harbor-level water segment.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Esplanade",
        description: "River views of the Hatch Memorial Shell and Back Bay skyline.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Professional conDUCKtor guide",
      "Amphibious Duck vehicle tour",
      "Land and river segments",
    ],
    categories: ["Bus Tours", "Sightseeing Tours", "Family Friendly"],
  },
  {
    productCode: "66111P3",
    productUrl:
      "https://www.viator.com/tours/Boston/Explore-Revolutionary-Boston-Freedom-Trail-History-Tour/d678-66111P3",
    title: "Explore Revolutionary Boston Freedom Trail History Tour",
    description:
      "Walk the Freedom Trail with a historian guide who brings Revolutionary Boston to life at each granite marker. The premium small-group format covers Boston Common, Granary Burying Ground, Faneuil Hall, Paul Revere House, and Old North Church with time for questions at every major stop. Your guide connects Sam Adams, Paul Revere, and the Boston Massacre to the sites where events unfolded. This 2.5-hour outing suits travelers who want depth beyond a self-guided red-line walk.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 39,
    heroUrl: `${TACDN}/r/33/0a/2f/3b/caption.jpg`,
    rating: 4.9,
    reviewCount: 4634,
    highlights: [
      "Premium small-group Freedom Trail walking tour",
      "Granary Burying Ground and Paul Revere House stops",
      "Faneuil Hall and Old North Church commentary",
      "Historian guide with Revolutionary War context",
      "2.5-hour format covering 11 landmark sites",
    ],
    startDescription:
      "Meet your guide at Boston Common Visitor Center on Tremont Street. Arrive 10 minutes early.",
    endDescription:
      "Tour concludes near Old North Church in the North End after the final Freedom Trail stops.",
    itineraryItems: [
      {
        title: "Boston Common",
        description: "Begin at the Freedom Trail start with colonial Boston context.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Massachusetts State House",
        description: "View the golden dome and learn about Beacon Hill governance.",
        stopType: "pass-by",
      },
      {
        title: "Granary Burying Ground",
        description: "Visit the graves of Paul Revere, John Hancock, and Sam Adams.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Faneuil Hall",
        description: "Explore the Cradle of Liberty marketplace and meeting hall.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Paul Revere House",
        description: "Stop at the North End home of the midnight rider.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Old North Church",
        description: "Visit the steeple church tied to the one-if-by-land signal.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional historian guide",
      "Small-group Freedom Trail walking tour",
      "Granary Burying Ground admission context",
    ],
    categories: ["Walking Tours", "Historical Tours", "Small Group Tours"],
  },
  {
    productCode: "26797P4",
    productUrl:
      "https://www.viator.com/tours/Boston/The-Tour-of-The-Freedom-Trail/d678-26797P4",
    title: "The Tour of The Freedom Trail",
    description:
      "Follow the red brick line through downtown Boston on a guided Freedom Trail walk covering the city's most storied Revolutionary sites. Your guide narrates the Boston Massacre, Tea Party, and midnight ride at Boston Common, Old South Meeting House, Faneuil Hall, and Paul Revere House. The 1 hour 45 minute format moves at a steady pace suited to travelers with limited time. A solid introduction for first-time visitors who want expert context without a premium price point.",
    duration: "1 hour 45 minutes (approx.)",
    priceFrom: 25,
    heroUrl: `${TACDN}/10/6e/6c/d4.jpg`,
    rating: 4.6,
    reviewCount: 2145,
    highlights: [
      "Guided Freedom Trail walk through downtown Boston",
      "Boston Common and Old South Meeting House stops",
      "Faneuil Hall and Paul Revere House routing",
      "Revolutionary War stories at each landmark",
      "1 hour 45 minute format for time-conscious visitors",
    ],
    startDescription:
      "Meet at Boston Common near the Visitor Center on Tremont Street.",
    endDescription:
      "Tour ends in the North End near Paul Revere House after the final trail markers.",
    itineraryItems: [
      {
        title: "Boston Common",
        description: "Start the Freedom Trail with colonial Boston orientation.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Old South Meeting House",
        description: "Learn about the Tea Party planning at this historic meeting hall.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Faneuil Hall",
        description: "Walk through the marketplace tied to Revolutionary protests.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Paul Revere House",
        description: "North End stop at the home of the midnight rider.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Old North Church",
        description: "View the steeple where the lantern signal was hung.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Professional guide",
      "Freedom Trail walking tour",
    ],
    categories: ["Walking Tours", "Historical Tours"],
  },
  {
    productCode: "8843P7",
    productUrl:
      "https://www.viator.com/tours/Boston/Tour-of-the-Freedom-Trail/d678-8843P7",
    title: "Tour of the Freedom Trail",
    description:
      "Experience the Freedom Trail with a premium small-group guide who paces the route for deeper stops at Boston's Revolutionary landmarks. The walk covers Boston Common, King's Chapel, Granary Burying Ground, Old State House, Faneuil Hall, and Old North Church with extended commentary at each site. Your guide weaves together the Boston Massacre, Tea Party, and Battle of Bunker Hill into a coherent narrative. Ideal for history enthusiasts who want a thorough trail experience without joining a large group.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 45,
    heroUrl: `${TACDN}/15/90/ca/37.jpg`,
    rating: 4.8,
    reviewCount: 1876,
    highlights: [
      "Premium small-group Freedom Trail tour",
      "King's Chapel and Granary Burying Ground stops",
      "Old State House and Faneuil Hall commentary",
      "Old North Church and North End routing",
      "Extended historian narration at each landmark",
    ],
    startDescription:
      "Meet your guide at Boston Common Visitor Center. Arrive 10 minutes before the scheduled start.",
    endDescription:
      "Conclude in the North End near Old North Church after the final trail landmark.",
    itineraryItems: [
      {
        title: "Boston Common",
        description: "Begin at the trail head with colonial Boston overview.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "King's Chapel",
        description: "Stop at the stone chapel and adjacent burying ground.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Granary Burying Ground",
        description: "Visit the resting place of Revolutionary patriots.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Old State House",
        description: "View the site of the Boston Massacre with guide commentary.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Faneuil Hall",
        description: "Explore the Cradle of Liberty and Quincy Market hall.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Old North Church",
        description: "Final stop at the church steeple tied to Paul Revere's ride.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional historian guide",
      "Premium small-group walking tour",
    ],
    categories: ["Walking Tours", "Historical Tours", "Small Group Tours"],
  },
  {
    productCode: "7167P68",
    productUrl:
      "https://www.viator.com/tours/Boston/Boston-Freedom-Trail-and-North-End-Neighborhood-Walking-Tour/d678-7167P68",
    title: "Boston Freedom Trail and North End Neighborhood Walking Tour",
    description:
      "Combine the Freedom Trail with an immersive North End neighborhood walk on a premium small-group outing. Your guide covers Boston Common, Faneuil Hall, Paul Revere House, and Old North Church before leading you through the North End's narrow streets, Hanover Street cafes, and Copp's Hill Burying Ground. The extended format adds Italian-immigrant history and local food culture to the Revolutionary narrative. Perfect for travelers who want both landmark history and neighborhood character in one booking.",
    duration: "3 hours (approx.)",
    priceFrom: 59,
    heroUrl: `${TACDN}/15/7d/a2/84.jpg`,
    rating: 4.8,
    reviewCount: 1243,
    highlights: [
      "Freedom Trail plus North End neighborhood walk",
      "Paul Revere House and Old North Church stops",
      "Copp's Hill Burying Ground and Hanover Street routing",
      "Premium small-group format with local food context",
      "Three-hour combined history and culture tour",
    ],
    startDescription:
      "Meet at Boston Common Visitor Center on Tremont Street. Arrive 10 minutes early.",
    endDescription:
      "Tour concludes on Hanover Street in the North End after Copp's Hill Burying Ground.",
    itineraryItems: [
      {
        title: "Boston Common",
        description: "Begin the Freedom Trail with Revolutionary Boston context.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Faneuil Hall",
        description: "Explore the Cradle of Liberty marketplace and meeting hall.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Paul Revere House",
        description: "Visit the North End home of the midnight rider.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Old North Church",
        description: "Stop at the steeple church tied to the lantern signal.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Copp's Hill Burying Ground",
        description: "Walk the colonial cemetery overlooking Boston Harbor.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Hanover Street",
        description: "Stroll the North End's main thoroughfare with neighborhood history.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional local guide",
      "Premium small-group walking tour",
      "Freedom Trail and North End routing",
    ],
    categories: ["Walking Tours", "Historical Tours", "Neighborhood Tours"],
  },
  {
    productCode: "5046BOS_OTT",
    productUrl:
      "https://www.viator.com/tours/Boston/Boston-Hop-on-Hop-off-Trolley-Tour/d678-5046BOS_OTT",
    title: "Boston Hop-on Hop-off Trolley Tour",
    description:
      "Explore Boston at your own pace aboard a hop-on hop-off trolley with live narration and 14 stops across the city. Ride past Faneuil Hall, USS Constitution, Fenway Park, and Harvard Square while hopping off at Freedom Trail landmarks, the New England Aquarium, and Copley Square. The two-hour full loop gives orientation; multi-day tickets let you revisit favorite neighborhoods. Ideal for first-time visitors who want flexible coverage without fixed walking routes.",
    duration: "2 hours (approx.)",
    priceFrom: 52,
    heroUrl: `${TACDN}/0a/59/cf/3e.jpg`,
    rating: 4.3,
    reviewCount: 5113,
    highlights: [
      "Hop-on hop-off trolley with 14 Boston stops",
      "Live narration past Faneuil Hall and USS Constitution",
      "Freedom Trail and Fenway Park routing options",
      "Flexible hop-off at New England Aquarium and Copley Square",
      "Two-hour full loop for city orientation",
    ],
    startDescription:
      "Board at any designated trolley stop; first boarding is commonly at Long Wharf or Faneuil Hall.",
    endDescription:
      "Disembark at any stop along the route; full loop returns to Long Wharf.",
    itineraryItems: [
      {
        title: "Faneuil Hall",
        description: "Trolley stop at the Cradle of Liberty and Quincy Market.",
        stopType: "stop",
      },
      {
        title: "USS Constitution",
        description: "Pass Old Ironsides at Charlestown Navy Yard.",
        stopType: "pass-by",
      },
      {
        title: "New England Aquarium",
        description: "Hop-off stop at Long Wharf near the harbor aquarium.",
        stopType: "stop",
      },
      {
        title: "Copley Square",
        description: "Stop near Trinity Church and Boston Public Library.",
        stopType: "stop",
      },
      {
        title: "Fenway Park",
        description: "Pass-by views of America's oldest ballpark.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Hop-on hop-off trolley pass",
      "Live onboard narration",
      "14 stops across Boston",
    ],
    categories: ["Hop-on Hop-off Tours", "Sightseeing Tours", "Bus Tours"],
  },
  {
    productCode: "7812P131",
    productUrl:
      "https://www.viator.com/tours/Boston/Private-Tour-Secret-Food-Tours-Boston-North-End/d678-7812P131",
    title: "Private Tour Secret Food Tours Boston North End",
    description:
      "Taste the North End on a private food tour built exclusively for your party. Your guide leads you through Hanover Street bakeries, salumerias, and hidden alleys with curated tastings of cannoli, arancini, and local seafood specialties. The premium private format adjusts pacing and dietary preferences while covering Paul Revere House and Old North Church between bites. Ideal for couples and families who want an unhurried culinary deep dive without joining a public group.",
    duration: "3 hours (approx.)",
    priceFrom: 275,
    heroUrl: `${TACDN}/10/59/d0/df.jpg`,
    rating: 5,
    reviewCount: 52,
    highlights: [
      "Private North End food tour for your party only",
      "Hanover Street bakery and salumeria tastings",
      "Cannoli, arancini, and local seafood samples",
      "Paul Revere House and Old North Church routing",
      "Flexible pacing with dietary accommodations",
    ],
    startDescription:
      "Meet your guide at a confirmed North End location near Hanover Street. Details sent at booking.",
    endDescription:
      "Tour concludes on Hanover Street after the final tasting stop.",
    itineraryItems: [
      {
        title: "Hanover Street",
        description: "Begin with North End orientation and first bakery tasting.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Paul Revere House",
        description: "Pass the midnight rider's home between food stops.",
        stopType: "pass-by",
      },
      {
        title: "Old North Church",
        description: "View the steeple church while walking to the next tasting.",
        stopType: "pass-by",
      },
      {
        title: "North End Market",
        description: "Curated tastings at local salumerias and pastry shops.",
        duration: "90 minutes",
        stopType: "stop",
      },
      {
        title: "Copp's Hill Burying Ground",
        description: "Optional stroll through the colonial cemetery overlooking the harbor.",
        duration: "15 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private local food guide",
      "Multiple food tastings",
      "North End neighborhood walk",
    ],
    categories: ["Private Tours", "Food Tours", "Walking Tours"],
  },
  {
    productCode: "8841P14",
    productUrl:
      "https://www.viator.com/tours/Boston/Bostons-Quincy-Market-and-North-End-Food-Tour-Small-Group-Walking-Tour/d678-8841P14",
    title: "Boston's Quincy Market and North End Food Tour",
    description:
      "Sample Boston's best bites on a premium small-group food walk from Quincy Market through the North End. Your guide leads tastings at Faneuil Hall vendors, Hanover Street cannoli shops, and hidden North End trattorias while sharing immigrant history and local food traditions. The half-day format covers enough stops for a full lunch without rushing between neighborhoods. Perfect for food-focused travelers who want both downtown market culture and authentic Italian North End flavors.",
    duration: "3 hours (approx.)",
    priceFrom: 147,
    heroUrl: `${TACDN}/12/89/5f/5e.jpg`,
    rating: 4.9,
    reviewCount: 892,
    highlights: [
      "Premium small-group food tour from Quincy Market to North End",
      "Faneuil Hall and Quincy Market vendor tastings",
      "Hanover Street cannoli and North End trattoria stops",
      "Immigrant history between food samples",
      "Enough tastings for a full lunch experience",
    ],
    startDescription:
      "Meet your guide outside Quincy Market at Faneuil Hall Marketplace.",
    endDescription:
      "Tour concludes on Hanover Street in the North End after the final tasting.",
    itineraryItems: [
      {
        title: "Quincy Market",
        description: "Begin with vendor tastings inside the historic marketplace.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Faneuil Hall",
        description: "Walk the Cradle of Liberty hall between market stops.",
        stopType: "pass-by",
      },
      {
        title: "Hanover Street",
        description: "North End main street with cannoli and salumeria tastings.",
        duration: "60 minutes",
        stopType: "stop",
      },
      {
        title: "Paul Revere House",
        description: "Pass the midnight rider's home en route to North End shops.",
        stopType: "pass-by",
      },
      {
        title: "Old North Church",
        description: "View the steeple church at the edge of the North End.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Professional food guide",
      "Multiple food tastings",
      "Small-group walking tour",
    ],
    categories: ["Food Tours", "Walking Tours", "Small Group Tours"],
  },
  {
    productCode: "400049P3",
    productUrl:
      "https://www.viator.com/tours/Boston/Boston-Food-and-History-Private-Tour/d678-400049P3",
    title: "Boston Food and History Private Tour",
    description:
      "Combine Revolutionary history with curated food tastings on a private Boston walk tailored to your group. Your guide connects Faneuil Hall protests and Paul Revere's ride to the North End's Italian immigrant story while stopping at Quincy Market vendors and Hanover Street specialties. The premium private format adjusts route and pacing to your interests, whether that means extra time at Old North Church or additional tastings. Ideal for travelers who want both cultural depth and culinary discovery in one unhurried outing.",
    duration: "4 hours (approx.)",
    priceFrom: 395,
    heroUrl: `${TACDN}/10/7d/7a/ff.jpg`,
    rating: 5,
    reviewCount: 41,
    highlights: [
      "Private food and history tour for your party only",
      "Faneuil Hall and Freedom Trail landmark stops",
      "Quincy Market and North End food tastings",
      "Paul Revere House and Old North Church routing",
      "Flexible four-hour format tailored to your group",
    ],
    startDescription:
      "Meet your guide at Faneuil Hall Marketplace. Pickup from downtown hotels available on request.",
    endDescription:
      "Conclude on Hanover Street in the North End after the final tasting and history stop.",
    itineraryItems: [
      {
        title: "Faneuil Hall",
        description: "Begin with Revolutionary history at the Cradle of Liberty.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Quincy Market",
        description: "Curated vendor tastings inside the historic marketplace.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Paul Revere House",
        description: "North End stop at the home of the midnight rider.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Old North Church",
        description: "Visit the steeple church tied to Paul Revere's lantern signal.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Hanover Street",
        description: "North End food tastings with immigrant neighborhood history.",
        duration: "60 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private historian and food guide",
      "Multiple food tastings",
      "Freedom Trail and North End routing",
    ],
    categories: ["Private Tours", "Food Tours", "Historical Tours"],
  },
  {
    productCode: "8647P466",
    productUrl:
      "https://www.viator.com/tours/Boston/Private-half-Day-Tour-to-Salem-and-Marbelhead-from-Boston-with-pick-up/d678-8647P466",
    title: "Private Half-Day Tour to Salem and Marblehead from Boston",
    description:
      "Escape Boston for a private half-day excursion to Salem's witch trial history and Marblehead's coastal charm. Your driver-guide picks up your party downtown and routes through Salem Witch Museum, Salem Maritime National Historic Site, and Marblehead's historic harbor district. The premium private format adjusts stops and timing to your interests, whether that means extended time at the House of the Seven Gables or a harbor walk in Marblehead. Ideal for travelers who want North Shore history without joining a motorcoach group.",
    duration: "5 hours (approx.)",
    priceFrom: 449,
    heroUrl: `${TACDN}/0d/0b/f0/cd.jpg`,
    rating: 5,
    reviewCount: 118,
    highlights: [
      "Private half-day tour from Boston to Salem and Marblehead",
      "Salem Witch Museum and Maritime National Historic Site",
      "House of the Seven Gables routing option",
      "Marblehead harbor and historic district stops",
      "Downtown Boston hotel pickup included",
    ],
    startDescription:
      "Morning pickup from your downtown Boston hotel or confirmed meeting point.",
    endDescription:
      "Return to your Boston hotel after the Marblehead harbor stop.",
    itineraryItems: [
      {
        title: "Salem Witch Museum",
        description: "Explore witch trial history at Salem's premier museum.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Salem Maritime National Historic Site",
        description: "Walk Derby Wharf and the Custom House with maritime commentary.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "House of the Seven Gables",
        description: "Visit the Turner-Ingersoll mansion that inspired Hawthorne's novel.",
        duration: "40 minutes",
        stopType: "stop",
      },
      {
        title: "Marblehead Harbor",
        description: "Stroll the picturesque harbor and historic waterfront streets.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private driver-guide",
      "Private vehicle with hotel pickup",
      "Salem and Marblehead sightseeing",
    ],
    categories: ["Private Tours", "Day Trips", "Historical Tours"],
  },
  {
    productCode: "400049P5",
    productUrl:
      "https://www.viator.com/tours/Boston/Private-Day-Trip-to-Lexington-and-Concord-from-Boston/d678-400049P5",
    title: "Private Day Trip to Lexington and Concord from Boston",
    description:
      "Trace the opening shots of the American Revolution on a private day trip from Boston to Lexington and Concord. Your driver-guide leads your party to Lexington Battle Green, Minute Man National Historical Park, and Old North Bridge where the shot heard round the world was fired. The premium private format allows extended stops at Concord's Old Manse and Sleepy Hollow Cemetery per your interests. Perfect for history enthusiasts who want an unhurried Revolutionary War pilgrimage tailored to their group.",
    duration: "8 hours (approx.)",
    priceFrom: 493,
    heroUrl: `${TACDN}/12/4c/65/1e.jpg`,
    rating: 5,
    reviewCount: 67,
    highlights: [
      "Private Revolutionary War day trip from Boston",
      "Lexington Battle Green and Minute Man National Historical Park",
      "Old North Bridge and Concord town center stops",
      "Flexible routing with hotel pickup from Boston",
      "Full-day format for in-depth colonial history",
    ],
    startDescription:
      "Morning pickup from your downtown Boston hotel or confirmed meeting point.",
    endDescription:
      "Return to your Boston hotel after the Concord town center visit.",
    itineraryItems: [
      {
        title: "Lexington Battle Green",
        description: "Stand where the first Revolutionary War shots were fired.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Minute Man National Historical Park",
        description: "Walk the Battle Road Trail with guide commentary.",
        duration: "60 minutes",
        stopType: "stop",
      },
      {
        title: "Old North Bridge",
        description: "Visit the Concord bridge where colonial militia engaged British troops.",
        duration: "40 minutes",
        stopType: "stop",
      },
      {
        title: "Concord Museum",
        description: "Optional stop at Concord's Revolutionary artifacts collection.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Sleepy Hollow Cemetery",
        description: "Pass Authors Ridge where Emerson, Hawthorne, and Thoreau are buried.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Private driver-guide",
      "Private vehicle with Boston hotel pickup",
      "Lexington and Concord sightseeing",
    ],
    categories: ["Private Tours", "Day Trips", "Historical Tours"],
  },
  {
    productCode: "385595P5",
    productUrl:
      "https://www.viator.com/tours/Boston/Lexington-and-Concord-Day-Tour/d678-385595P5",
    title: "Lexington and Concord Day Tour",
    description:
      "Follow the path of the American Revolution on a premium day tour from Boston to Lexington and Concord. Your guide narrates the Battle of Lexington Green, the Battle Road, and the stand at Old North Bridge while stopping at Minute Man National Historical Park and Concord's town center. The small-group format covers the key Revolutionary sites in a full-day outing with transportation from downtown Boston. Ideal for history lovers who want expert context on the shot heard round the world.",
    duration: "7 hours (approx.)",
    priceFrom: 129,
    heroUrl: `${TACDN}/12/5b/b5/7d.jpg`,
    rating: 4.8,
    reviewCount: 934,
    highlights: [
      "Premium day tour to Lexington and Concord from Boston",
      "Lexington Battle Green and Battle Road Trail",
      "Old North Bridge and Minute Man National Historical Park",
      "Concord town center and literary history context",
      "Transportation from downtown Boston included",
    ],
    startDescription:
      "Meet at a central Boston departure point or confirmed downtown pickup location.",
    endDescription:
      "Return to Boston after the Concord town center visit.",
    itineraryItems: [
      {
        title: "Lexington Battle Green",
        description: "Stand on the green where the first shots of the Revolution were fired.",
        duration: "40 minutes",
        stopType: "stop",
      },
      {
        title: "Minute Man National Historical Park",
        description: "Walk the Battle Road with park ranger and guide commentary.",
        duration: "50 minutes",
        stopType: "stop",
      },
      {
        title: "Old North Bridge",
        description: "Visit the Concord bridge and Minute Man statue.",
        duration: "35 minutes",
        stopType: "stop",
      },
      {
        title: "Concord Museum",
        description: "Explore Revolutionary artifacts and local history exhibits.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "Round-trip transportation from Boston",
      "Lexington and Concord park admissions where applicable",
    ],
    categories: ["Day Trips", "Historical Tours", "Small Group Tours"],
  },
{
    productCode: "5046BOS_GG",
    productUrl:
      "https://www.viator.com/tours/Boston/Boston-Ghosts-and-Gravestones-Tour/d678-5046BOS_GG",
    title: "Boston Ghosts and Gravestones Trolley Tour",
    description:
      "Explore Boston's haunted history on a Ghosts and Gravestones trolley tour led by costumed grave-digger guides. Ride through the North End and downtown after dark with stops at Granary Burying Ground and Copp's Hill Burying Ground, two of Boston's oldest cemeteries. Your conductor shares tales of Cotton Mather, Paul Revere, and Revolutionary-era spirits tied to Boston Common and Faneuil Hall. The two-hour evening format suits history buffs and families who want spooky storytelling without a long walking route.",
    duration: "2 hours (approx.)",
    priceFrom: 47.25,
    heroUrl: `${TACDN}/09/59/3a/a5.jpg`,
    rating: 4.5,
    reviewCount: 2524,
    highlights: [
      "Ghost-themed trolley tour through downtown Boston",
      "Granary Burying Ground and Copp's Hill cemetery stops",
      "Costumed grave-digger guide narration",
      "North End and Boston Tea Party Ships pass-by views",
      "Evening format from Long Wharf Marriott",
    ],
    startDescription:
      "Check in at Long Wharf Marriott, 200 Atlantic Avenue. Arrive 30 minutes before departure.",
    endDescription:
      "Tour ends back at the Long Wharf boarding point after the cemetery and North End loop.",
    itineraryItems: [
      {
        title: "Long Wharf",
        description: "Board the Ghosts and Gravestones trolley at Atlantic Avenue.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Granary Burying Ground",
        description: "Walk among Paul Revere and John Hancock graves with guide commentary.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "Copp's Hill Burying Ground",
        description: "Explore the North End hilltop cemetery overlooking Boston Harbor.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "North End",
        description: "Ride through Little Italy with haunted history stories.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Boston Tea Party Ships & Museum",
        description: "Pass the waterfront museum during the harbor-side route.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Ghost-themed trolley tour",
      "Professional tour conductor",
      "Local taxes",
    ],
    categories: ["Ghost Tours", "Historical Tours", "Night Tours"],
  },
  {
    productCode: "3283CODZILLA",
    productUrl:
      "https://www.viator.com/tours/Boston/Boston-Codzilla-Thrill-Boat-Ride/d678-3283CODZILLA",
    title: "City Cruises Boston Codzilla High-Speed Thrill Boat Ride",
    description:
      "Hold on for a high-speed thrill ride aboard Codzilla, Boston Harbor's 40-mph jet boat. The 45-minute outing blasts past the USS Constitution and Bunker Hill Monument with music, splash zones, and scripted commentary about how Codzilla came to Boston. Depart from Long Wharf next to the New England Aquarium with indoor and outdoor seating options. Ideal for teens, families, and visitors who want an adrenaline break between downtown sightseeing and harbor cruises.",
    duration: "45 minutes (approx.)",
    priceFrom: 56.01,
    heroUrl: `${TACDN}/07/68/d7/8a.jpg`,
    rating: 4,
    reviewCount: 425,
    highlights: [
      "High-speed 40-mph thrill boat ride on Boston Harbor",
      "Narrated show with original soundtrack",
      "Departures from Long Wharf ticket center",
      "USS Constitution and harbor skyline pass-by views",
      "45-minute family-friendly adrenaline outing",
    ],
    startDescription:
      "Meet at Boston Harbor City Cruises on Long Wharf. Arrive early for boarding—late arrivals miss the boat.",
    endDescription:
      "Return to the Long Wharf pier after the harbor thrill loop.",
    itineraryItems: [
      {
        title: "Long Wharf",
        description: "Check in at the City Cruises ticket center on Long Wharf.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "Boston Harbor",
        description: "High-speed loops with splash zones and harbor narration.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "USS Constitution",
        description: "Pass Old Ironsides at Charlestown Navy Yard during the ride.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "45-minute Codzilla thrill boat ride",
      "Narrated onboard show",
      "Original soundtrack",
    ],
    categories: ["Boat Tours", "Active Tours", "Water Tours"],
  },
  {
    productCode: "3978TOUR5",
    productUrl:
      "https://www.viator.com/tours/Boston/Salem-Witch-City-Day-Trip-From-Boston/d678-3978TOUR5",
    title: 'Boston to Salem "Witch City" Day Trip with Round-Trip Transportation',
    description:
      "Discover Salem's witch trial legacy on a guided day trip from Boston with round-trip motorcoach transportation. Explore Pickering Wharf, the Salem Witch Trials Memorial, and the House of the Seven Gables with free time for lunch and shopping on Essex Street. Your driver-guide shares North Shore history during the ride from downtown Boston. The seven-hour format packs Salem's museums, waterfront, and colonial lanes into one premium day trip without renting a car.",
    duration: "7 hours (approx.)",
    priceFrom: 62,
    heroUrl: `${TACDN}/07/af/ef/47.jpg`,
    rating: 4,
    reviewCount: 278,
    highlights: [
      "Round-trip day trip from Boston to Salem Witch City",
      "Pickering Wharf and Essex Street free time",
      "Salem Witch Trials Memorial visit",
      "House of the Seven Gables stop",
      "Luxury air-conditioned coach transportation",
    ],
    startDescription:
      "Meet at the central Boston departure point or selected downtown hotel pickup confirmed at booking.",
    endDescription:
      "Return to Boston after free time in Salem's waterfront district.",
    itineraryItems: [
      {
        title: "Boston",
        description: "Depart downtown Boston by motorcoach with guide orientation.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Salem Witch Trials Memorial",
        description: "Reflect at the memorial to victims of the 1692 witch trials.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "House of the Seven Gables",
        description: "Tour the Turner-Ingersoll mansion that inspired Hawthorne.",
        duration: "40 minutes",
        stopType: "stop",
      },
      {
        title: "Pickering Wharf",
        description: "Free time for lunch and waterfront shopping in Salem Harbor.",
        duration: "90 minutes",
        stopType: "stop",
      },
      {
        title: "Salem Old Town Hall",
        description: "Pass Salem's historic civic center during the walking route.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Round-trip motorcoach transportation",
      "Professional driver-guide",
      "Boston to Salem day trip",
    ],
    categories: ["Day Trips", "Historical Tours", "Small Group Tours"],
  },
  {
    productCode: "5042BOSDIN",
    productUrl:
      "https://www.viator.com/tours/Boston/Boston-Dinner-Cruise/d678-5042BOSDIN",
    title: "City Cruises Boston Premier Dinner Cruise on Odyssey",
    description:
      "Dine aboard the Odyssey on a Boston Harbor premier dinner cruise with skyline views and live DJ entertainment. The plated multi-course dinner unfolds as you pass Boston Light, Castle Island, Charlestown Navy Yard, and the Leonard P. Zakim Bridge from climate-controlled decks. Board at Rowes Wharf Gate B for a two- to three-hour evening suited to date nights and special occasions. Ideal for visitors who want a seated harbor dinner without navigating downtown restaurant reservations.",
    duration: "2 to 3 hours (approx.)",
    priceFrom: 132.89,
    heroUrl: `${TACDN}/15/c0/a1/08.jpg`,
    rating: 3.5,
    reviewCount: 181,
    highlights: [
      "Boston Harbor premier dinner cruise on Odyssey",
      "Plated multi-course dinner with live DJ",
      "Boston Light and Castle Island pass-by views",
      "Climate-controlled decks year-round",
      "Evening departure from Rowes Wharf",
    ],
    startDescription:
      "Board at Rowes Wharf Gate B. Arrive 45 minutes early for check-in and seating.",
    endDescription:
      "Disembark at Rowes Wharf after the harbor dinner loop.",
    itineraryItems: [
      {
        title: "Rowes Wharf",
        description: "Board Odyssey and depart Boston Harbor with welcome service.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Boston Light",
        description: "Pass America's oldest lighthouse during dinner service.",
        stopType: "pass-by",
      },
      {
        title: "Charlestown Navy Yard",
        description: "Harbor views of USS Constitution from the dining deck.",
        stopType: "pass-by",
      },
      {
        title: "Castle Island",
        description: "Evening views of the South Boston fort during dessert.",
        stopType: "pass-by",
      },
      {
        title: "Leonard P. Zakim Bunker Hill Bridge",
        description: "Pass the Zakim Bridge lights on the return harbor leg.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Plated dinner",
      "Boston Harbor dinner cruise",
      "Onboard DJ entertainment",
    ],
    categories: ["Cruises & Sailing", "Dinner Cruises", "Night Tours"],
  },
  {
    productCode: "5151BOSCY014",
    productUrl:
      "https://www.viator.com/tours/Boston/Guided-Bike-Tour-of-Boston/d678-5151BOSCY014",
    title: "Boston City View Bicycle Tour: History and Landmarks",
    description:
      "Cycle Boston's landmarks from Boston Common on a guided city-view bike tour through six neighborhoods to the North End and Back Bay. Pedal the Freedom Trail with Charles River Esplanade, Fenway Park, and Copley Square stops at Trinity Church and Boston Public Library. Urban AdvenTours provides bikes, helmets, and expert guides who keep a moderate pace suited to confident street riders. The two-and-a-half-hour format covers more ground than a walking tour while staying close to Boston's signature sights.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 78,
    heroUrl: `${TACDN}/07/2d/e2/41.jpg`,
    rating: 5,
    reviewCount: 645,
    highlights: [
      "Guided bike tour through six Boston neighborhoods",
      "North End, Beacon Hill, and Back Bay routing",
      "Copley Square and Boston Public Library stops",
      "Charles River Esplanade and Fenway Park pass-by",
      "Bike and helmet included from Urban AdvenTours",
    ],
    startDescription:
      "Meet at Urban AdvenTours, 103 Atlantic Avenue. Arrive 30 minutes early for bike fitting.",
    endDescription:
      "Return bikes to Urban AdvenTours after the Copley Square loop.",
    itineraryItems: [
      {
        title: "Boston Common",
        description: "Begin from Boston Common with Freedom Trail orientation.",
        duration: "5 minutes",
        stopType: "stop",
      },
      {
        title: "Freedom Trail",
        description: "Pedal the Freedom Trail route through downtown Boston.",
        stopType: "pass-by",
      },
      {
        title: "North End",
        description: "Begin cycling from Atlantic Avenue through Little Italy.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Beacon Hill",
        description: "Ride Louisburg Square with Federal row house views.",
        stopType: "pass-by",
      },
      {
        title: "Charles River Esplanade",
        description: "Cycle the riverfront path with Hatch Shell views.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Fenway Park",
        description: "Photo stop at America's oldest ballpark.",
        duration: "5 minutes",
        stopType: "stop",
      },
      {
        title: "Copley Square",
        description: "Stop at Trinity Church and Boston Public Library.",
        duration: "10 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Guided bicycle tour of Boston",
      "Bike and helmet rental",
      "Professional guide",
    ],
    categories: ["Bike Tours", "Sightseeing Tours", "Active Tours"],
  },
  {
    productCode: "66192P8",
    productUrl:
      "https://www.viator.com/tours/Boston/Day-Trip-from-Boston-To-Salem-Witch-Exhibits/d678-66192P8",
    title: "Day Trip from Boston To Salem Witch Exhibits",
    description:
      "Visit Salem's witch museums and waterfront on a small-group day trip from Boston with hotel pickup and museum admissions included. Tour the Salem Witch Museum, House of the Seven Gables, and Pickering Wharf with a Salem trolley segment and free time on Essex Street Pedestrian Mall. The eight- to nine-hour premium format includes bottled water and structured time at each exhibit so you see Salem's trial history without planning logistics. Suited to travelers who want a guided Salem immersion with door-to-door transport from Boston.",
    duration: "8 to 9 hours (approx.)",
    priceFrom: 190,
    heroUrl: `${TACDN}/11/6f/dc/17.jpg`,
    rating: 4.5,
    reviewCount: 81,
    highlights: [
      "Small-group Salem day trip from Boston with hotel pickup",
      "Salem Witch Museum admission included",
      "House of the Seven Gables visit",
      "Salem trolley and Pickering Wharf free time",
      "Essex Street Pedestrian Mall exploration",
    ],
    startDescription:
      "Pickup from your Boston hotel or meet at Boston Marriott Long Wharf if outside the pickup zone.",
    endDescription:
      "Return to your Boston hotel after the Salem waterfront visit.",
    itineraryItems: [
      {
        title: "Boston",
        description: "Hotel pickup and transit north to Salem with guide orientation.",
        duration: "60 minutes",
        stopType: "stop",
      },
      {
        title: "Salem Witch Museum",
        description: "Explore witch trial history with immersive exhibits.",
        duration: "60 minutes",
        stopType: "stop",
      },
      {
        title: "House of the Seven Gables",
        description: "Tour the Turner-Ingersoll mansion and gardens.",
        duration: "60 minutes",
        stopType: "stop",
      },
      {
        title: "Salem Trolley",
        description: "Ride the Salem trolley between harbor districts.",
        duration: "60 minutes",
        stopType: "stop",
      },
      {
        title: "Pickering Wharf",
        description: "Free time at Salem's waterfront dining and shops.",
        duration: "90 minutes",
        stopType: "stop",
      },
      {
        title: "Essex Street Pedestrian Mall",
        description: "Stroll Salem's pedestrian mall before return to Boston.",
        duration: "90 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Hotel pickup and drop-off",
      "Museum admissions",
      "Bottled water",
      "Professional guide",
    ],
    categories: ["Day Trips", "Historical Tours", "Small Group Tours"],
  },
  {
    productCode: "255730P225",
    productUrl:
      "https://www.viator.com/tours/Boston/New-England-Coast-Private-Day-Trip-from-Boston/d678-255730P225",
    title: "Boston Private Day Trip with Salem & Cape Ann's North Shore",
    description:
      "Explore Salem and Cape Ann on a private day trip from Boston tailored to your party. Your English-speaking guide drives the North Shore loop with three hours in Salem and three hours on Cape Ann, including photo stops at Gloucester harbors and Rockport lanes. Hotel pickup and private transportation keep the six-hour itinerary flexible for your interests, whether that means extended time at Salem Maritime National Historic Site or Cape Ann art galleries. Ideal for travelers who want a premium private North Shore introduction without a rental car.",
    duration: "6 hours (approx.)",
    priceFrom: 615,
    heroUrl: `${TACDN}/0d/0c/3d/29.jpg`,
    rating: 5,
    reviewCount: 4,
    highlights: [
      "Private day trip for your party only",
      "Salem and Cape Ann North Shore routing",
      "Hotel pickup and drop-off included",
      "Flexible photo stops at Gloucester and Rockport",
      "Professional English-speaking private guide",
    ],
    startDescription:
      "Meet your guide at your Boston hotel lobby or Flour Bakery on Farnsworth Street if hotel pickup is unavailable.",
    endDescription:
      "Return to your hotel or central Boston after the Cape Ann coastal loop.",
    itineraryItems: [
      {
        title: "Salem",
        description: "Private exploration of Salem's witch history and waterfront.",
        duration: "3 hours",
        stopType: "stop",
      },
      {
        title: "Cape Ann",
        description: "Scenic drive through Gloucester and Rockport harbor towns.",
        duration: "3 hours",
        stopType: "stop",
      },
      {
        title: "Gloucester Harbor",
        description: "Photo stop at the working fishing port on Cape Ann.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private professional guide",
      "Private air-conditioned vehicle",
      "Hotel pickup and drop-off",
    ],
    categories: ["Private Tours", "Day Trips", "Sightseeing Tours"],
  },
];

const buildFixture = (tour: BostonTourFixture) => {
  const viatorRatings = BOSTON_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: "Boston", state: "Massachusetts" },
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
      itineraryItems: tour.itineraryItems.map(item => ({
        ...item,
        description: "",
      })),
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
          question: "Where does the tour depart from in Boston?",
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

const writeLiveProductData = () => {
  const liveData = BOSTON_TOURS.map(tour => {
    const viatorRatings = BOSTON_VIATOR_PUBLIC_RATINGS[tour.productCode];
    return {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      priceFrom: `From $${tour.priceFrom.toFixed(2)}`,
      rating: viatorRatings?.rating ?? tour.rating,
      reviewCount: viatorRatings?.reviewCount ?? tour.reviewCount,
      duration: tour.duration,
      heroUrl: tour.heroUrl,
      overview: `${tour.description.split(".").slice(0, 1).join(".")}.`,
      itineraryStops: tour.itineraryItems.map(item => item.title),
      categories: tour.categories,
    };
  });
  writeFileSync(
    path.join(process.cwd(), "scripts", "boston-live-product-data.json"),
    `${JSON.stringify(liveData, null, 2)}\n`,
    "utf8"
  );
};

const main = async () => {
  if (process.argv.includes("--bootstrap")) {
    const outputDir = path.join(process.cwd(), "data", "engine6", "viator");
    mkdirSync(outputDir, { recursive: true });

    for (const tour of BOSTON_TOURS) {
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

    writeLiveProductData();
    console.log(
      `Bootstrapped ${BOSTON_TOURS.length} Boston Engine6 fixtures.`
    );
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Boston",
    destinationCitySlug: "boston",
    stateSlug: "massachusetts",
    citySlug: "boston",
    viatorDestinationSlug: "Boston",
    targetPremiumShare: 0.5,
    tours: BOSTON_TOURS,
    buildFixture,
    destinationLogLabel: "Boston",
  });

  writeLiveProductData();
};

await main();
