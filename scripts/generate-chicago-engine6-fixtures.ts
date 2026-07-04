import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { CHICAGO_VIATOR_PUBLIC_RATINGS } from "../src/engine6/chicagoViatorPublicRatings";

type ItineraryItem = {
  title: string;
  description: string;
  duration?: string;
  stopType: "stop" | "pass-by";
};

type ChicagoTourFixture = {
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

const CHICAGO_TOURS: ChicagoTourFixture[] = [
  {
    productCode: "5580ARC",
    productUrl:
      "https://www.viator.com/tours/Chicago/Chicago-Architecture-River-Cruise/d673-5580ARC",
    title: "Chicago Architecture River Cruise",
    description:
      "Experience Chicago's world-famous skyline from the water on a guided architecture cruise along the Chicago River. A docent narrates the stories behind Willis Tower, the Wrigley Building, Tribune Tower, and other landmark towers as you pass beneath historic bridges. The open-air upper deck and climate-controlled lower salon keep the ride comfortable in any season. This classic Chicago outing suits first-time visitors who want an efficient introduction to the city's architectural heritage.",
    duration: "1 hour 15 minutes (approx.)",
    priceFrom: 53.7,
    heroUrl: `${TACDN}/07/aa/41/ca.jpg`,
    rating: 4.5,
    reviewCount: 12881,
    highlights: [
      "Guided architecture cruise along the Chicago River",
      "Willis Tower and Wrigley Building pass-by views",
      "Docent commentary on Chicago's landmark skyscrapers",
      "Open upper deck and enclosed lower salon seating",
      "75-minute format ideal for a first-day overview",
    ],
    startDescription:
      "Board at the Michigan Avenue/Wacker Drive dock near the Chicago River. Arrive 15 minutes before departure for check-in.",
    endDescription:
      "Disembark at the same Michigan Avenue/Wacker Drive dock after the final river loop.",
    itineraryItems: [
      {
        title: "Chicago River",
        description:
          "Cruise the main branch of the Chicago River with orientation to the Loop skyline.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Willis Tower",
        description:
          "Pass beneath and alongside Willis Tower with commentary on its structural design.",
        stopType: "pass-by",
      },
      {
        title: "Wrigley Building",
        description:
          "View the Wrigley Building clock tower and white terra-cotta facade from the river.",
        stopType: "pass-by",
      },
      {
        title: "John Hancock Center",
        description:
          "North-branch routing with views toward the John Hancock Center on Michigan Avenue.",
        stopType: "pass-by",
      },
      {
        title: "Tribune Tower",
        description:
          "Pass the Tribune Tower and Michigan Avenue bridge house with Gothic Revival details.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Professional architecture docent",
      "75-minute river cruise",
      "Open-air and indoor seating",
    ],
    categories: ["Cruises & Sailing", "Sightseeing Tours", "Architecture Tours"],
  },
  {
    productCode: "76126P2",
    productUrl:
      "https://www.viator.com/tours/Chicago/Lake-and-River-Architecture-Tour/d673-76126P2",
    title: "Lake and River Architecture Tour",
    description:
      "Experience two perspectives of Chicago's skyline on a premium architecture outing that pairs a Chicago River cruise with a Lake Michigan segment. Certified docents explain how the Great Chicago Fire reshaped the Loop and how modern towers rose along the lakefront. The dual-water format covers river-level bridge views and open-lake panoramas of Navy Pier and the Magnificent Mile. Ideal for architecture enthusiasts who want both river and lake vantage points in one booking.",
    duration: "2 hours (approx.)",
    priceFrom: 49,
    heroUrl: `${TACDN}/08/bb/52/d1.jpg`,
    rating: 4.7,
    reviewCount: 3245,
    highlights: [
      "Combined Chicago River and Lake Michigan cruise",
      "Certified architecture docent on both segments",
      "Navy Pier and Magnificent Mile lakefront views",
      "Willis Tower and river bridge commentary",
      "Two-hour premium architecture format",
    ],
    startDescription:
      "Check in at the Chicago Architecture Center river cruise dock on the Chicago River near Michigan Avenue.",
    endDescription:
      "Return to the Architecture Center dock after completing the lake segment.",
    itineraryItems: [
      {
        title: "Chicago River",
        description:
          "Begin with a guided river cruise through the Loop canyon of skyscrapers.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Lake Michigan",
        description:
          "Continue onto Lake Michigan for open-water skyline panoramas.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Navy Pier",
        description:
          "Pass Navy Pier with views of the Ferris wheel and lakefront parks.",
        stopType: "pass-by",
      },
      {
        title: "Willis Tower",
        description:
          "River-level views of Willis Tower and surrounding Loop towers.",
        stopType: "pass-by",
      },
      {
        title: "Magnificent Mile",
        description:
          "Lakefront approach with Michigan Avenue high-rise perspectives.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Certified architecture docent",
      "River and lake cruise segments",
      "Climate-controlled vessel seating",
    ],
    categories: ["Cruises & Sailing", "Architecture Tours", "Sightseeing Tours"],
  },
  {
    productCode: "76126P8",
    productUrl:
      "https://www.viator.com/tours/Chicago/Chicago-Sunset-Cruise/d673-76126P8",
    title: "Lake Michigan Sunset Cruise in Chicago",
    description:
      "Experience the Chicago skyline at golden hour on a sunset cruise departing from the Chicago River onto Lake Michigan. A guide highlights Willis Tower, the Magnificent Mile, and lakefront parks as daylight fades over the water. The 90-minute format includes time on the river before opening onto the lake for wide-angle sunset photos. This relaxed outing suits couples and families who want an evening on the water without a formal dinner cruise.",
    duration: "1 hour 30 minutes (approx.)",
    priceFrom: 45,
    heroUrl: `${TACDN}/0b/94/34/73.jpg`,
    rating: 4.5,
    reviewCount: 1215,
    highlights: [
      "Sunset cruise from the Chicago River to Lake Michigan",
      "Golden-hour skyline photography opportunities",
      "Magnificent Mile and Willis Tower lakefront views",
      "Guided commentary on Chicago landmarks",
      "90-minute evening format on the water",
    ],
    startDescription:
      "Board at the Chicago River dock confirmed on your voucher. Evening departures vary by season.",
    endDescription:
      "Return to the Chicago River boarding dock after the lake sunset loop.",
    itineraryItems: [
      {
        title: "Chicago River",
        description:
          "Depart the river with views of downtown bridges and Loop towers at dusk.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Lake Michigan",
        description:
          "Open-lake segment for sunset panoramas over the Chicago shoreline.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Magnificent Mile",
        description:
          "Lakefront views of Michigan Avenue high-rises and Water Tower Place.",
        stopType: "pass-by",
      },
      {
        title: "Willis Tower",
        description:
          "Skyline pass-by with Willis Tower silhouetted against the sunset.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Professional guide",
      "Sunset cruise ticket",
      "Indoor and outdoor deck access",
    ],
    categories: ["Cruises & Sailing", "Sunset Tours", "Sightseeing Tours"],
  },
  {
    productCode: "5580SKY",
    productUrl:
      "https://www.viator.com/tours/Chicago/Lake-Michigan-Sightseeing-Cruise/d673-5580SKY",
    title: "Lake Michigan Skyline Cruise in Chicago",
    description:
      "Discover Chicago's skyline from Lake Michigan on a one-hour sightseeing cruise with narration on the city's lakefront development. The route passes Navy Pier, Grant Park, and the harbor with open views of Willis Tower and the Loop. Indoor and outdoor seating keep the ride comfortable on breezy lake days. This budget-friendly water outing suits travelers who want a quick lake perspective without a full architecture tour.",
    duration: "1 hour (approx.)",
    priceFrom: 33,
    heroUrl: `${TACDN}/09/cc/63/e2.jpg`,
    rating: 4.5,
    reviewCount: 2187,
    highlights: [
      "One-hour Lake Michigan skyline cruise",
      "Navy Pier and Grant Park lakefront views",
      "Guided commentary on Chicago harbor history",
      "Indoor salon and open-air deck seating",
      "Affordable introduction to the lakefront",
    ],
    startDescription:
      "Board at the Navy Pier or Chicago Harbor cruise terminal confirmed when booking.",
    endDescription:
      "Return to the same boarding terminal after the one-hour lake loop.",
    itineraryItems: [
      {
        title: "Navy Pier",
        description:
          "Depart near Navy Pier with views of the Ferris wheel and festival hall.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Lake Michigan",
        description:
          "Open-water cruise with panoramic Loop and lakefront skyline views.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Chicago Harbor",
        description:
          "Pass the harbor entrance with commentary on Chicago's port history.",
        stopType: "pass-by",
      },
      {
        title: "Grant Park",
        description:
          "Lakefront views of Grant Park, Buckingham Fountain, and Museum Campus.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Professional guide",
      "One-hour lake cruise",
      "Indoor and outdoor seating",
    ],
    categories: ["Cruises & Sailing", "Sightseeing Tours"],
  },
  {
    productCode: "35169P12",
    productUrl:
      "https://www.viator.com/tours/Chicago/Chicago-Skyline-Sunset-Sail-Aboard-Official-Flagship-of-Chicago-148-S-V-Windy/d673-35169P12",
    title: "Chicago Skyline Sunset Sail Aboard a Tall Ship",
    description:
      "Experience a sunset sail aboard the Windy, Chicago's official tall ship, departing from Navy Pier on Lake Michigan. Crew members share sailing basics while you take in the skyline from the deck as the sun drops behind the Loop. The 90-minute outing combines the romance of a traditional schooner with wide-angle views of Grant Park and the harbor. Perfect for visitors who want a memorable sunset experience beyond a standard motor cruise.",
    duration: "1 hour 30 minutes (approx.)",
    priceFrom: 55,
    heroUrl: `${TACDN}/0a/dd/74/f3.jpg`,
    rating: 4.8,
    reviewCount: 842,
    highlights: [
      "Sunset sail aboard the Windy tall ship from Navy Pier",
      "Traditional schooner experience on Lake Michigan",
      "Skyline and harbor views at golden hour",
      "Crew commentary on sailing and Chicago history",
      "90-minute deck time with photo opportunities",
    ],
    startDescription:
      "Meet at the Navy Pier tall-ship boarding gate confirmed on your ticket. Arrive 20 minutes early.",
    endDescription:
      "Return to the Navy Pier dock after the sunset sail concludes.",
    itineraryItems: [
      {
        title: "Navy Pier",
        description:
          "Board the Windy at Navy Pier and receive a safety briefing on deck.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Lake Michigan",
        description:
          "Sail onto Lake Michigan with skyline views as the sun sets.",
        duration: "60 minutes",
        stopType: "stop",
      },
      {
        title: "Chicago Harbor",
        description:
          "Tack through the harbor entrance with Grant Park in view.",
        stopType: "pass-by",
      },
      {
        title: "Grant Park",
        description:
          "Lakefront pass-by with Museum Campus and Buckingham Fountain perspectives.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Sunset sail aboard the Windy",
      "Professional crew",
      "Safety briefing",
    ],
    categories: ["Cruises & Sailing", "Sunset Tours", "Sailing"],
  },
  {
    productCode: "5680NIGHT",
    productUrl:
      "https://www.viator.com/tours/Chicago/Chicago-by-Night-Helicopter-Tour/d673-5680NIGHT",
    title: "Chicago by Night Helicopter Tour",
    description:
      "Experience Chicago illuminated from above on a premium night helicopter flight over the Loop, lakefront, and Navy Pier. Your pilot narrates key landmarks as city lights reflect off Lake Michigan and the Chicago River. The compact aerial format delivers dramatic night photography angles unavailable from street level. Ideal for special occasions and travelers who want a bucket-list view of the skyline after dark.",
    duration: "15 minutes (approx.)",
    priceFrom: 249,
    heroUrl: `${TACDN}/0b/ee/85/g4.jpg`,
    rating: 4.9,
    reviewCount: 412,
    highlights: [
      "Night helicopter flight over downtown Chicago",
      "Illuminated Willis Tower and Loop skyline views",
      "Navy Pier and Lake Michigan aerial perspectives",
      "Pilot narration on Chicago landmarks",
      "Premium bucket-list aerial experience",
    ],
    startDescription:
      "Check in at the Chicago helicopter terminal near Chicago Midway or downtown heliport confirmed at booking.",
    endDescription:
      "Return to the heliport after landing from the night flight.",
    itineraryItems: [
      {
        title: "Willis Tower",
        description:
          "Aerial orbit with illuminated Willis Tower and Loop skyscrapers below.",
        duration: "5 minutes",
        stopType: "stop",
      },
      {
        title: "Millennium Park",
        description:
          "Overflight of Millennium Park and Cloud Gate with city lights.",
        stopType: "pass-by",
      },
      {
        title: "Navy Pier",
        description:
          "Lakefront pass with Navy Pier Ferris wheel and harbor lights.",
        stopType: "pass-by",
      },
      {
        title: "Lake Michigan",
        description:
          "Shoreline segment with reflections of the skyline on the water.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Night helicopter flight",
      "Pilot narration",
      "Headset communication",
      "Weight and safety briefing",
    ],
    categories: ["Helicopter Tours", "Night Tours", "Luxury Tours"],
  },
  {
    productCode: "5680DAY",
    productUrl:
      "https://www.viator.com/tours/Chicago/Chicago-City-Sights-Helicopter-Tour/d673-5680DAY",
    title: "Chicago City Sights Helicopter Tour",
    description:
      "Discover Chicago's landmarks from the air on a daytime helicopter tour with bird's-eye views of Willis Tower, Millennium Park, and the Lake Michigan shoreline. Your pilot points out architectural icons and lakefront parks during a focused aerial loop over the city center. The open-cockpit or wide-window seating maximizes photo opportunities in clear weather. This premium outing suits visitors who want a thrilling complement to river and walking tours.",
    duration: "15 minutes (approx.)",
    priceFrom: 189,
    heroUrl: `${TACDN}/0c/ff/96/h5.jpg`,
    rating: 4.9,
    reviewCount: 638,
    highlights: [
      "Daytime helicopter tour over downtown Chicago",
      "Aerial views of Willis Tower and Millennium Park",
      "Lake Michigan and Navy Pier shoreline perspectives",
      "Pilot-guided commentary throughout the flight",
      "Premium 15-minute skyline experience",
    ],
    startDescription:
      "Arrive at the Chicago heliport confirmed on your voucher for check-in and safety briefing.",
    endDescription:
      "Return to the heliport terminal after the flight lands.",
    itineraryItems: [
      {
        title: "Willis Tower",
        description:
          "Circle Willis Tower and the Loop canyon from above.",
        duration: "5 minutes",
        stopType: "stop",
      },
      {
        title: "Millennium Park",
        description:
          "Overfly Millennium Park, Cloud Gate, and the Jay Pritzker Pavilion.",
        stopType: "pass-by",
      },
      {
        title: "Navy Pier",
        description:
          "Lakefront pass over Navy Pier and the Chicago Harbor entrance.",
        stopType: "pass-by",
      },
      {
        title: "Lake Michigan",
        description:
          "Shoreline segment with Grant Park and Museum Campus views.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Helicopter flight",
      "Pilot narration",
      "Headset communication",
      "Pre-flight safety briefing",
    ],
    categories: ["Helicopter Tours", "Sightseeing Tours", "Luxury Tours"],
  },
  {
    productCode: "61552P17",
    productUrl:
      "https://www.viator.com/tours/Chicago/Gangster-Food-Tour/d673-61552P17",
    title: "Chicago Gangster and Food Walking Tour",
    description:
      "Explore Chicago's Prohibition-era past on a walking tour that pairs mob history with tastings at local eateries. Your guide recounts stories of Al Capone, the St. Valentine's Day Massacre, and Loop speakeasies while you sample Chicago favorites in River North and the Theatre District. Stops include landmark hotels and streets where gangsters once operated openly. This premium food-and-history format suits travelers who want culture and cuisine in one three-hour outing.",
    duration: "3 hours (approx.)",
    priceFrom: 89,
    heroUrl: `${TACDN}/10/59/d0/df.jpg`,
    rating: 4.8,
    reviewCount: 367,
    highlights: [
      "Gangster history walking tour with food tastings",
      "Stories of Al Capone and Prohibition-era Chicago",
      "Palmer House Hilton and Loop landmark stops",
      "Curated bites at local Chicago restaurants",
      "Three-hour premium food and history format",
    ],
    startDescription:
      "Meet your guide at the confirmed Loop or River North meeting point at your scheduled departure time.",
    endDescription:
      "Tour ends near the final tasting stop in the neighborhood covered on your route.",
    itineraryItems: [
      {
        title: "Loop District",
        description:
          "Orientation walk through the Loop with Prohibition-era history introduction.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Palmer House Hilton",
        description:
          "Stop outside the Palmer House with stories of Jazz Age Chicago.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Chicago Theatre",
        description:
          "View the Chicago Theatre marquee and surrounding Roaring Twenties blocks.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "River North",
        description:
          "Continue to River North with food tastings at neighborhood spots.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "Food tastings",
      "Walking tour",
    ],
    categories: ["Food Tours", "Walking Tours", "Historical Tours"],
  },
  {
    productCode: "7812P133",
    productUrl:
      "https://www.viator.com/tours/Chicago/Private-Tour-Secret-Food-Tours-Chicago/d673-7812P133",
    title: "Chicago Private Walking Food Tour With Secret Food Tours",
    description:
      "Discover Chicago's neighborhoods on a private Secret Food Tours route built for your party alone. A licensed guide leads a paced walk through River North, West Loop, or Fulton Market with curated tastings at local favorites known for deep-dish pizza, Italian beef, and craft bites. Commentary covers immigrant food traditions and the chefs shaping modern Chicago dining. This premium private format suits groups who want an unhurried culinary deep dive without joining strangers.",
    duration: "3 hours (approx.)",
    priceFrom: 299,
    heroUrl: `${TACDN}/11/6a/e1/e0.jpg`,
    rating: 5,
    reviewCount: 48,
    highlights: [
      "Private Secret Food Tours route for your party only",
      "Curated tastings at Chicago neighborhood eateries",
      "River North and West Loop routing options",
      "Licensed guide with local culinary commentary",
      "Three-hour private walking food experience",
    ],
    startDescription:
      "Meet your private guide at the confirmed downtown Chicago meeting point at your scheduled time.",
    endDescription:
      "Tour concludes near the final tasting stop in the neighborhood visited on your route.",
    itineraryItems: [
      {
        title: "River North",
        description:
          "Begin in River North with an overview of the tasting route and Chicago food history.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "West Loop",
        description:
          "Walk West Loop restaurant row with tastings at curated establishments.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Fulton Market",
        description:
          "Continue through Fulton Market with additional bites and market history.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Chicago Riverwalk",
        description:
          "Stroll the Riverwalk between tastings with skyline views.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private licensed food guide",
      "Food samples",
      "Private walking tour",
    ],
    categories: ["Private Tours", "Food Tours", "Walking Tours"],
  },
  {
    productCode: "8841P19",
    productUrl:
      "https://www.viator.com/tours/Chicago/Chicago-Architecture-and-Highlights-with-Local-Treat-Small-Group-Walking-Tour/d673-8841P19",
    title: "Best of Chicago: Architecture and Highlights City Private Tour",
    description:
      "Discover Chicago's essential landmarks on a private walking tour tailored to your group's pace and photo priorities. Your guide connects Millennium Park, the Chicago Riverwalk, and the Magnificent Mile with architecture stories and a included local treat stop. The private format allows flexible time at Cloud Gate and Wrigley Building viewpoints without a large group schedule. Priced per group, this premium outing suits families and friends who want a personalized Chicago introduction.",
    duration: "3 hours (approx.)",
    priceFrom: 245,
    heroUrl: `${TACDN}/12/7b/f2/f1.jpg`,
    rating: 5,
    reviewCount: 118,
    highlights: [
      "Private Chicago architecture and highlights walking tour",
      "Millennium Park and Cloud Gate photo time",
      "Chicago Riverwalk and Wrigley Building stops",
      "Included local treat tasting",
      "Per-group pricing for your party only",
    ],
    startDescription:
      "Meet your private guide at Millennium Park or a confirmed downtown meeting point at your scheduled time.",
    endDescription:
      "Tour ends on the Magnificent Mile or your agreed downtown endpoint.",
    itineraryItems: [
      {
        title: "Millennium Park",
        description:
          "Begin at Millennium Park with Cloud Gate and Pritzker Pavilion overview.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Cloud Gate",
        description:
          "Photo time at Cloud Gate with guide commentary on the park design.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Chicago Riverwalk",
        description:
          "Walk the Riverwalk with views of the river canyon and bridge houses.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Magnificent Mile",
        description:
          "Continue along Michigan Avenue with Wrigley Building and Tribune Tower views.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Wrigley Building",
        description:
          "Stop at the Wrigley Building plaza for architecture and photo time.",
        duration: "15 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private professional guide",
      "Local treat tasting",
      "Private walking tour",
    ],
    categories: ["Private Tours", "Walking Tours", "Architecture Tours"],
  },
  {
    productCode: "188341P1",
    productUrl:
      "https://www.viator.com/tours/Chicago/Private-4-hour-Walking-Tour/d673-188341P1",
    title: "Your Way or the Highway: Customized Private Walking Tour in Chicago",
    description:
      "Experience your ideal Chicago day on a fully customized four-hour private walking tour with a dedicated guide. Choose emphasis on architecture, food, museums, or neighborhood exploration across the Loop, River North, and lakefront. Your guide adjusts routing and stop length to your interests, whether that means extended time at the Art Institute or a deep dive into Fulton Market. This premium private format suits repeat visitors and groups with specific Chicago priorities.",
    duration: "4 hours (approx.)",
    priceFrom: 350,
    heroUrl: `${TACDN}/13/8c/g3/g2.jpg`,
    rating: 5,
    reviewCount: 76,
    highlights: [
      "Fully customized four-hour private Chicago walking tour",
      "Flexible routing across Loop, River North, and lakefront",
      "Architecture, food, or museum emphasis on your schedule",
      "Dedicated guide for your party only",
      "Premium private format with personalized pacing",
    ],
    startDescription:
      "Meet your guide at your Chicago hotel, vacation rental, or confirmed downtown meeting point.",
    endDescription:
      "Tour concludes at your preferred downtown endpoint or starting location.",
    itineraryItems: [
      {
        title: "Route Planning",
        description:
          "Brief with your guide to set priorities among architecture, food, or neighborhood stops.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Millennium Park",
        description:
          "Optional stop at Millennium Park when included in your customized route.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "The Loop",
        description:
          "Walk Loop blocks with flexible stops at Chicago Theatre or Palmer House area.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Chicago River",
        description:
          "Riverwalk or bridge viewpoints when your route includes the waterfront.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Magnificent Mile",
        description:
          "Optional Michigan Avenue segment for shopping and architecture highlights.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private professional guide",
      "Custom route planning",
      "Four-hour walking tour",
    ],
    categories: ["Private Tours", "Walking Tours", "Sightseeing Tours"],
  },
  {
    productCode: "130651P13",
    productUrl:
      "https://www.viator.com/tours/Chicago/Walking-Tour-Chicago-Passageways-Pedway-and-Riverwalk/d673-130651P13",
    title: "Walking Tour: Underground Chicago via the Pedway and Riverwalk",
    description:
      "Explore the hidden layers of downtown Chicago on a walking tour through the Pedway tunnel system and the Chicago Riverwalk. Your guide explains how the subterranean network connects Loop buildings, train stations, and civic plazas while keeping you comfortable in any weather. Above ground, the Riverwalk segment reveals bridge houses, public art, and river-level architecture. This two-hour outing suits curious travelers who want to see Chicago beyond the obvious streetscape.",
    duration: "2 hours (approx.)",
    priceFrom: 65,
    heroUrl: `${TACDN}/14/9d/h4/h3.jpg`,
    rating: 4.8,
    reviewCount: 441,
    highlights: [
      "Guided tour of the Chicago Pedway tunnel network",
      "Chicago Riverwalk walk with bridge and art commentary",
      "Loop District underground and street-level routing",
      "Weather-friendly Pedway segments",
      "Two-hour format near downtown meeting points",
    ],
    startDescription:
      "Meet your guide at the Chicago Cultural Center or confirmed Loop Pedway entrance at your scheduled time.",
    endDescription:
      "Tour ends on the Chicago Riverwalk or your agreed Loop endpoint.",
    itineraryItems: [
      {
        title: "Chicago Pedway",
        description:
          "Enter the Pedway system with overview of downtown's underground connections.",
        duration: "40 minutes",
        stopType: "stop",
      },
      {
        title: "Chicago Riverwalk",
        description:
          "Emerge onto the Riverwalk for river-level architecture and public art.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "The Loop",
        description:
          "Walk Loop blocks connecting Pedway exits and landmark buildings.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Chicago Theatre",
        description:
          "Stop at the Chicago Theatre exterior with Loop entertainment district history.",
        duration: "15 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "Pedway and Riverwalk walking tour",
    ],
    categories: ["Walking Tours", "Sightseeing Tours", "Cultural Tours"],
  },
  {
    productCode: "3397P10",
    productUrl:
      "https://www.viator.com/tours/Chicago/Chicago-Bike-Tour/d673-3397P10",
    title: "Chicago Bike Tour",
    description:
      "Explore Chicago's lakefront and downtown paths on a three-hour guided bike tour with stops at Millennium Park, Grant Park, and Navy Pier. Your guide leads a paced route along the Lakefront Trail with commentary on skyline landmarks and lakefront development. Bikes, helmets, and a safety briefing are included with routing matched to the group's ability. This active group tour covers more ground than a walking tour while keeping a social, guided format.",
    duration: "3 hours (approx.)",
    priceFrom: 60,
    heroUrl: `${TACDN}/15/ae/i5/i4.jpg`,
    rating: 4.9,
    reviewCount: 1189,
    highlights: [
      "Guided three-hour Chicago lakefront bike tour",
      "Millennium Park and Grant Park riding stops",
      "Navy Pier and Lakefront Trail segments",
      "Bikes, helmets, and safety briefing included",
      "Active sightseeing with skyline commentary",
    ],
    startDescription:
      "Meet at the bike rental staging area near Millennium Park confirmed when booking. Arrive 15 minutes early for fitting.",
    endDescription:
      "Return bikes to the staging area after the final lakefront stop.",
    itineraryItems: [
      {
        title: "Millennium Park",
        description:
          "Bike orientation and safety briefing before entering the lakefront route.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Grant Park",
        description:
          "Ride through Grant Park with Buckingham Fountain and Museum Campus views.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Navy Pier",
        description:
          "Lakefront stop at Navy Pier with photo time on the trail.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Chicago Lakefront Trail",
        description:
          "Ride the Lakefront Trail with Willis Tower and skyline panoramas.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional bike guide",
      "Bike and helmet rental",
      "Safety briefing",
    ],
    categories: ["Bike Tours", "Sightseeing Tours", "Active Tours"],
  },
  {
    productCode: "3332BITE",
    productUrl:
      "https://www.viator.com/tours/Chicago/Tastes-of-Chicago-Bike-Tour-Chicago-Style-Pizza-Beer-Cupcakes-and-Hot-Dogs/d673-3332BITE",
    title: "Tastes of Chicago Bike Tour",
    description:
      "Discover Chicago's iconic flavors on a premium bike tour combining deep-dish pizza, Italian beef, craft beer, cupcakes, and hot dogs across West Loop and lakefront neighborhoods. Your guide leads a paced ride with food stops timed for tasting and recovery between segments. The four-hour format balances active sightseeing with generous portions at local institutions. Ideal for food-loving travelers who want to cover neighborhoods and cuisine on two wheels.",
    duration: "4 hours (approx.)",
    priceFrom: 75,
    heroUrl: `${TACDN}/16/bf/j6/j5.jpg`,
    rating: 4.8,
    reviewCount: 203,
    highlights: [
      "Bike tour with Chicago-style pizza and local food tastings",
      "Italian beef, hot dog, beer, and cupcake stops",
      "West Loop and lakefront neighborhood routing",
      "Bikes, helmets, and guide included",
      "Four-hour premium food and cycling format",
    ],
    startDescription:
      "Meet at the bike depot in West Loop or Lincoln Park confirmed at booking. Arrive early for fitting.",
    endDescription:
      "Return bikes to the depot after the final tasting stop.",
    itineraryItems: [
      {
        title: "West Loop",
        description:
          "Begin in West Loop with first food stop and bike safety briefing.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Wicker Park",
        description:
          "Ride to Wicker Park with additional tasting at a neighborhood spot.",
        duration: "40 minutes",
        stopType: "stop",
      },
      {
        title: "Lincoln Park",
        description:
          "Continue through Lincoln Park with lakefront trail riding.",
        duration: "35 minutes",
        stopType: "stop",
      },
      {
        title: "Lakefront Trail",
        description:
          "Lakefront segment connecting food stops with skyline views.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Bike guide",
      "Bike and helmet rental",
      "Food tastings",
      "Safety briefing",
    ],
    categories: ["Bike Tours", "Food Tours", "Active Tours"],
  },
  {
    productCode: "316128P3",
    productUrl:
      "https://www.viator.com/tours/Chicago/Private-Chicago-Scenic-Driving-Tour/d673-316128P3",
    title: "Private Chicago Scenic Driving Tour",
    description:
      "Discover Chicago's most photogenic neighborhoods on a private three-hour driving tour with a dedicated guide and vehicle for your party. The route covers the Magnificent Mile, Gold Coast mansions, Lincoln Park, and Lake Shore Drive with flexible photo stops at your preferred viewpoints. Your guide shares architecture, history, and local stories while handling downtown traffic. This premium private format suits travelers who want comprehensive city coverage without walking long distances.",
    duration: "3 hours (approx.)",
    priceFrom: 425,
    heroUrl: `${TACDN}/17/cg/k7/k6.jpg`,
    rating: 5,
    reviewCount: 87,
    highlights: [
      "Private three-hour scenic driving tour of Chicago",
      "Magnificent Mile and Gold Coast routing",
      "Lincoln Park and Lake Shore Drive viewpoints",
      "Private vehicle with hotel pickup options",
      "Flexible photo stops tailored to your group",
    ],
    startDescription:
      "Pickup from your Chicago hotel, vacation rental, or confirmed downtown meeting point.",
    endDescription:
      "Return to your pickup location or requested drop-off point after the final scenic stop.",
    itineraryItems: [
      {
        title: "Magnificent Mile",
        description:
          "Drive Michigan Avenue with stops at Water Tower and luxury retail corridors.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Gold Coast",
        description:
          "Tour Gold Coast residential streets with historic mansion commentary.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Lincoln Park",
        description:
          "Stop at Lincoln Park viewpoints with zoo and lagoon panoramas.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Lake Shore Drive",
        description:
          "Scenic drive along Lake Shore Drive with skyline and lake photos.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private driver-guide",
      "Private vehicle transport",
      "Hotel pickup and drop-off",
    ],
    categories: ["Private Tours", "City Tours", "Sightseeing Tours"],
  },
  {
    productCode: "5042P100",
    productUrl:
      "https://www.viator.com/tours/Chicago/Chicago-Odyssey-Fireworks-Dinner-Cruise/d673-5042P100",
    title: "Chicago Odyssey Fireworks Dinner Cruise",
    description:
      "Experience a premium fireworks dinner cruise on Lake Michigan with Chicago skyline views aboard Odyssey, with plated dining and live entertainment. The evening includes a multi-course meal, live entertainment, and a front-row seat to Navy Pier fireworks when scheduled. Floor-to-ceiling windows and outdoor decks frame Willis Tower and the Loop as the city lights up. This special-occasion outing suits couples and groups who want a full dinner experience on the water.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 180,
    heroUrl: `${TACDN}/18/dh/l8/l7.jpg`,
    rating: 4.6,
    reviewCount: 512,
    highlights: [
      "Fireworks dinner cruise aboard Odyssey on Lake Michigan",
      "Multi-course plated dinner with entertainment",
      "Navy Pier fireworks viewing when scheduled",
      "Skyline views from indoor and outdoor decks",
      "Premium special-occasion lakefront experience",
    ],
    startDescription:
      "Board Odyssey at the Navy Pier or Chicago Harbor terminal confirmed on your reservation. Arrive 30 minutes early.",
    endDescription:
      "Disembark at the same terminal after the fireworks and dinner service conclude.",
    itineraryItems: [
      {
        title: "Navy Pier",
        description:
          "Board at Navy Pier and settle into your dinner seating with welcome service.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Lake Michigan",
        description:
          "Cruise Lake Michigan during multi-course dinner with skyline views.",
        duration: "90 minutes",
        stopType: "stop",
      },
      {
        title: "Chicago Harbor",
        description:
          "Harbor loop with live entertainment and city light panoramas.",
        stopType: "pass-by",
      },
      {
        title: "Grant Park",
        description:
          "Lakefront pass-by with fireworks viewing when Navy Pier show is scheduled.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Fireworks dinner cruise",
      "Multi-course dinner",
      "Live entertainment",
      "Gratuities",
    ],
    categories: ["Dinner Cruises", "Cruises & Sailing", "Luxury Tours"],
  },
  {
    productCode: "46250P9",
    productUrl:
      "https://www.viator.com/tours/Chicago/Private-Lake-Michigan-Sailing-Charter-and-Sightseeing-Chicago-Skyline-Cruise/d673-46250P9",
    title: "Private Lake Michigan Sailing Charter and Sightseeing Cruise",
    description:
      "Experience a private sailboat charter on Lake Michigan with Chicago skyline views and captain-led commentary for a two-hour outing. Your party enjoys exclusive use of the vessel with flexible routing around the harbor and open lake. The intimate format suits proposals, celebrations, and small groups who want a personalized water experience. Depart from Burnham Harbor with optional customization of route and pace.",
    duration: "2 hours (approx.)",
    priceFrom: 450,
    heroUrl: `${TACDN}/19/ei/m9/m8.jpg`,
    rating: 5,
    reviewCount: 54,
    highlights: [
      "Private Lake Michigan sailing charter for your group",
      "Captain-led skyline and harbor commentary",
      "Flexible two-hour routing from Burnham Harbor",
      "Exclusive vessel use for celebrations",
      "Premium private sailing on Chicago's lakefront",
    ],
    startDescription:
      "Meet your captain at Burnham Harbor marina gate confirmed when booking.",
    endDescription:
      "Return to Burnham Harbor dock after the private sailing charter.",
    itineraryItems: [
      {
        title: "Burnham Harbor",
        description:
          "Board your private sailboat at Burnham Harbor with safety briefing.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Lake Michigan",
        description:
          "Sail on open lake with panoramic Loop and Museum Campus views.",
        duration: "75 minutes",
        stopType: "stop",
      },
      {
        title: "Navy Pier",
        description:
          "Harbor pass with Navy Pier and Ferris wheel perspectives.",
        stopType: "pass-by",
      },
      {
        title: "Grant Park",
        description:
          "Lakefront views of Grant Park and Buckingham Fountain from the water.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Private captain",
      "Private sailing charter",
      "Safety briefing",
      "Bottled water",
    ],
    categories: ["Private Tours", "Cruises & Sailing", "Sailing"],
  },
  {
    productCode: "68189P1",
    productUrl:
      "https://www.viator.com/tours/Chicago/Explore-Chicagos-notorious-mob-and-gangster-past-aboard-a-luxury-bus/d673-68189P1",
    title: "Chicago's Original Gangster Tour by Bus",
    description:
      "Discover Chicago's mob era on a guided bus tour covering Biograph Theater, Holy Name Cathedral, and Loop sites tied to Al Capone and Prohibition gang wars. A costumed or character guide narrates the St. Valentine's Day Massacre, speakeasy culture, and notorious hits that shaped the city's underworld reputation. Comfortable bus transport links North Side and downtown crime landmarks efficiently. This popular outing suits history buffs who want gangster stories without extensive walking.",
    duration: "2 hours (approx.)",
    priceFrom: 42,
    heroUrl: `${TACDN}/1a/fj/n0/n9.jpg`,
    rating: 4.7,
    reviewCount: 934,
    highlights: [
      "Original Chicago gangster bus tour with character guide",
      "Biograph Theater and St. Valentine's Day Massacre sites",
      "Palmer House Hilton and Loop mob history stops",
      "Comfortable luxury bus transport",
      "Two-hour narrated Prohibition-era outing",
    ],
    startDescription:
      "Board the tour bus at the confirmed North Side or Loop departure point at your scheduled time.",
    endDescription:
      "Return to the original departure point after the final gangster history stop.",
    itineraryItems: [
      {
        title: "Biograph Theater",
        description:
          "Stop at Biograph Theater where John Dillinger was killed in 1934.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Holy Name Cathedral",
        description:
          "View Holy Name Cathedral with stories of North Side mob conflicts.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "Palmer House Hilton",
        description:
          "Loop stop at Palmer House with Jazz Age and speakeasy commentary.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Loop District",
        description:
          "Drive Loop blocks with pass-by views of historic crime-era buildings.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Character guide",
      "Luxury bus transport",
      "Gangster history commentary",
    ],
    categories: ["Bus Tours", "Historical Tours", "Sightseeing Tours"],
  },
  {
    productCode: "61552P8",
    productUrl:
      "https://www.viator.com/tours/Chicago/Gangsters-and-Ghosts-Tour-in-Chicago/d673-61552P8",
    title: "Chicago: Gangsters and Ghosts Walking Tour",
    description:
      "Explore Chicago's Loop after dark on a tour blending mob history with haunted landmarks and ghost stories. Your guide leads you past Palmer House Hilton, the Congress Plaza Hotel, and Theatre District blocks where gangsters and spirits share the spotlight. Evening timing adds atmosphere to tales of Prohibition shootouts and unexplained hotel occurrences. This two-hour outing suits travelers who want spooky history with Chicago crime lore.",
    duration: "2 hours (approx.)",
    priceFrom: 35,
    heroUrl: `${TACDN}/1b/gk/o1/o0.jpg`,
    rating: 4.7,
    reviewCount: 621,
    highlights: [
      "Evening gangster and ghost walking tour of the Loop",
      "Palmer House Hilton haunted history",
      "Congress Plaza Hotel ghost stories",
      "Chicago Theatre District mob sites",
      "Two-hour guided night walk",
    ],
    startDescription:
      "Meet your guide at the confirmed Loop meeting point at your scheduled evening departure time.",
    endDescription:
      "Tour ends near the Congress Plaza Hotel or your agreed Loop endpoint.",
    itineraryItems: [
      {
        title: "Palmer House Hilton",
        description:
          "Begin at Palmer House with gangster history and reported hauntings.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Congress Plaza Hotel",
        description:
          "Stop at Congress Plaza with ghost stories and Roaring Twenties lore.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Chicago Theatre",
        description:
          "Walk the Theatre District with Prohibition-era crime commentary.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Loop District",
        description:
          "Continue through Loop blocks connecting mob sites and haunted landmarks.",
        duration: "25 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "Evening walking tour",
    ],
    categories: ["Walking Tours", "Ghost Tours", "Historical Tours"],
  },
  {
    productCode: "3332DAY",
    productUrl:
      "https://www.viator.com/tours/Chicago/Chicago-Lakefront-Neighborhoods-Bicycle-Tour/d673-3332DAY",
    title: "Bike Tour of Chicago's Lakefront Neighborhoods",
    description:
      "Explore Chicago's north lakefront neighborhoods on a three-hour bike tour covering Lincoln Park, Lakeview, and Wrigleyville. Your guide shares local history and parkland stories while riding the Lakefront Trail and residential side streets. The route balances active riding with stops at lagoon viewpoints and Wrigley Field exteriors. Ideal for travelers who want neighborhood flavor beyond downtown monument loops.",
    duration: "3 hours (approx.)",
    priceFrom: 55,
    heroUrl: `${TACDN}/1c/hl/p2/p1.jpg`,
    rating: 4.8,
    reviewCount: 389,
    highlights: [
      "Lakefront neighborhoods bike tour of Chicago",
      "Lincoln Park and Lakeview riding route",
      "Wrigleyville and Wrigley Field exterior stop",
      "Chicago Lakefront Trail segments",
      "Three-hour guided neighborhood cycling",
    ],
    startDescription:
      "Meet at the Lincoln Park bike staging location confirmed when booking. Arrive early for helmet fitting.",
    endDescription:
      "Return bikes to the Lincoln Park depot after the final neighborhood stop.",
    itineraryItems: [
      {
        title: "Lincoln Park",
        description:
          "Begin in Lincoln Park with lagoon and conservatory area orientation.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Lakeview",
        description:
          "Ride through Lakeview neighborhoods with local history commentary.",
        duration: "35 minutes",
        stopType: "stop",
      },
      {
        title: "Wrigleyville",
        description:
          "Stop at Wrigley Field exterior with ballpark and neighborhood stories.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Chicago Lakefront Trail",
        description:
          "Return via the Lakefront Trail with skyline views across the parks.",
        duration: "25 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional bike guide",
      "Bike and helmet rental",
      "Safety briefing",
    ],
    categories: ["Bike Tours", "Sightseeing Tours", "Active Tours"],
  },
  {
    productCode: "191307P3",
    productUrl:
      "https://www.viator.com/tours/Chicago/Gangs-and-Mobsters-Crime-Tour-at-Chicago/d673-191307P3",
    title: "Gangs and Mobsters Crime Tour at Chicago",
    description:
      "Discover Chicago's crime chronicles on a walking tour starting near the Art Institute of Chicago and continuing through Loop sites linked to mob bosses and gang wars. Your guide recounts the careers of Al Capone, Dion O'Bannion, and later organized-crime figures with stops at historic hotels and alley shootout locations. The two-hour format keeps a focused pace through downtown crime geography. Suited for true-crime fans who want expert narration on Chicago's notorious past.",
    duration: "2 hours (approx.)",
    priceFrom: 45,
    heroUrl: `${TACDN}/1d/im/q3/q2.jpg`,
    rating: 4.7,
    reviewCount: 256,
    highlights: [
      "Crime and mob history walking tour from the Art Institute area",
      "Al Capone and Prohibition-era gang stories",
      "Palmer House Hilton and Loop crime sites",
      "Biograph Theater history when routed nearby",
      "Two-hour guided true-crime outing",
    ],
    startDescription:
      "Meet your guide at the Art Institute of Chicago Michigan Avenue entrance or confirmed nearby meeting point.",
    endDescription:
      "Tour ends in the Loop near the final crime-history stop.",
    itineraryItems: [
      {
        title: "Art Institute of Chicago",
        description:
          "Meet near the Art Institute with introduction to Chicago organized crime history.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Palmer House Hilton",
        description:
          "Walk to Palmer House with Jazz Age mob and hotel history.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Biograph Theater",
        description:
          "Continue toward Biograph Theater with John Dillinger stories when on route.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Loop District",
        description:
          "Loop walk covering speakeasy locations and gangland shootout sites.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "Crime history walking tour",
    ],
    categories: ["Walking Tours", "Historical Tours", "Cultural Tours"],
  },
  {
    productCode: "338277P2",
    productUrl:
      "https://www.viator.com/tours/Chicago/Small-Group-River-Boat-Tour-in-Chicago/d673-338277P2",
    title: "Small-Group River Boat Tour in Chicago",
    description:
      "Experience the Chicago River on a small-group cruise with an intimate passenger count and personalized architecture commentary. The route covers the Loop canyon, Marina City, and landmark towers with time for questions and photos from deck-level seating. Limited group size keeps the experience conversational compared to large sightseeing boats. This premium river outing suits travelers who prefer a quieter architecture cruise with guide access.",
    duration: "1 hour 30 minutes (approx.)",
    priceFrom: 89,
    heroUrl: `${TACDN}/1e/jn/r4/r3.jpg`,
    rating: 4.9,
    reviewCount: 174,
    highlights: [
      "Small-group Chicago River architecture cruise",
      "Marina City and Willis Tower river views",
      "Personalized guide commentary and Q&A time",
      "Limited passenger count for intimate experience",
      "90-minute premium river boat format",
    ],
    startDescription:
      "Board at the Chicago River dock confirmed on your voucher near the Loop.",
    endDescription:
      "Disembark at the same river dock after the architecture loop.",
    itineraryItems: [
      {
        title: "Chicago River",
        description:
          "Cruise the main branch with small-group architecture orientation.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Willis Tower",
        description:
          "River-level views of Willis Tower and surrounding Loop skyscrapers.",
        stopType: "pass-by",
      },
      {
        title: "Marina City",
        description:
          "Pass Marina City corncob towers with structural design commentary.",
        stopType: "pass-by",
      },
      {
        title: "Wrigley Building",
        description:
          "Approach the Wrigley Building and Michigan Avenue bridge houses.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Professional guide",
      "Small-group river cruise",
      "Deck seating",
    ],
    categories: ["Small Group Tours", "Cruises & Sailing", "Architecture Tours"],
  },
  {
    productCode: "7812P19",
    productUrl:
      "https://www.viator.com/tours/Chicago/Small-Group-Chicago-Loop-Food-Walking-Tour/d673-7812P19",
    title: "Chicago Walking Food Tour With Secret Food Tours",
    description:
      "Explore Chicago's Loop food scene on a Secret Food Tours walking route with deep-dish pizza, Italian beef, gourmet popcorn, and a chef-selected secret dish at neighborhood stops. Your guide connects each tasting to Loop landmarks from Willis Tower to the Rookery Building while you walk historic downtown blocks. The three-hour small-group format delivers enough bites for a hearty meal without rushing between courses. This outing suits travelers who want classic Chicago flavors and architecture in one downtown walk.",
    duration: "3 hours (approx.)",
    priceFrom: 89,
    heroUrl: `${TACDN}/1f/ko/s5/s4.jpg`,
    rating: 4.9,
    reviewCount: 695,
    highlights: [
      "Secret Food Tours Loop walking route with multiple tastings",
      "Deep-dish pizza, Italian beef, and classic Chicago bites",
      "Willis Tower and Rookery Building landmarks along the route",
      "Licensed guide with culinary history commentary",
      "Three-hour small-group food experience",
    ],
    startDescription:
      "Meet your guide at the confirmed downtown Chicago meeting point at your scheduled departure time.",
    endDescription:
      "Tour ends near the final tasting stop in the neighborhood covered on your route.",
    itineraryItems: [
      {
        title: "Chicago Loop",
        description:
          "Meet your guide downtown and begin the Loop food walking route.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Willis Tower",
        description:
          "Pass Willis Tower while walking between Loop tasting stops.",
        duration: "10 minutes",
        stopType: "pass-by",
      },
      {
        title: "Rookery Building",
        description:
          "View the Rookery Building exterior between food stops.",
        duration: "10 minutes",
        stopType: "pass-by",
      },
      {
        title: "Millennium Park",
        description:
          "Finish near Millennium Park after the final tasting course.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Licensed food guide",
      "Food samples",
      "Walking tour",
    ],
    categories: ["Food Tours", "Walking Tours", "Small Group Tours"],
  },
];

const buildFixture = (tour: ChicagoTourFixture) => {
  const viatorRatings = CHICAGO_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: "Chicago", state: "Illinois" },
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
          question: "Where does the tour depart from in Chicago?",
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

    for (const tour of CHICAGO_TOURS) {
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
      `Bootstrapped ${CHICAGO_TOURS.length} Chicago Engine6 fixtures.`
    );
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Chicago",
    destinationCitySlug: "chicago",
    viatorDestinationSlug: "Chicago",
    targetPremiumShare: 0.5,
    tours: CHICAGO_TOURS,
    buildFixture,
    destinationLogLabel: "Chicago",
  });
};

await main();
