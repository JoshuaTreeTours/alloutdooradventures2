import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { PHILADELPHIA_VIATOR_PUBLIC_RATINGS } from "../src/engine6/philadelphiaViatorPublicRatings";

type ItineraryItem = {
  title: string;
  description: string;
  duration?: string;
  stopType: "stop" | "pass-by";
};

type PhiladelphiaTourFixture = {
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

const PHILADELPHIA_TOURS: PhiladelphiaTourFixture[] = [
  {
    productCode: "8841P1",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/Private-City-of-Philadelphia-Driving-Tour/d906-8841P1",
    title: "Private Full Day Philadelphia Driving Tour with Special Inclusion",
    description:
      "Experience Philadelphia's essential landmarks on a private full-day driving tour with a dedicated local guide and vehicle for your party alone. The route covers Independence Hall, the Liberty Bell, the Rocky Steps at the Philadelphia Museum of Art, Eastern State Penitentiary, and additional stops tailored to your interests. Your guide shares Revolutionary War history, architecture stories, and neighborhood context while handling city traffic and parking. This premium per-group format suits families and friends who want comprehensive Philadelphia coverage without joining a large bus tour.",
    duration: "8 hours (approx.)",
    priceFrom: 975,
    heroUrl: `${TACDN}/0d/e1/01/a1.jpg`,
    rating: 5,
    reviewCount: 142,
    highlights: [
      "Private full-day driving tour of Philadelphia for your party only",
      "Independence Hall and Liberty Bell with flexible photo time",
      "Rocky Steps and Philadelphia Museum of Art exterior stop",
      "Eastern State Penitentiary visit with guided history",
      "Per-group pricing with hotel pickup options",
    ],
    startDescription:
      "Pickup from your Philadelphia hotel, vacation rental, or confirmed downtown meeting point at your scheduled time.",
    endDescription:
      "Return to your pickup location or requested drop-off point after the final scenic stop.",
    itineraryItems: [
      {
        title: "Independence Hall",
        description:
          "Begin at Independence National Historical Park with Independence Hall and the signing of the Declaration.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Liberty Bell",
        description:
          "Visit the Liberty Bell Center with time for photos and Revolutionary War context.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Rocky Steps",
        description:
          "Stop at the Philadelphia Museum of Art Rocky Steps with skyline and Boathouse Row views.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Eastern State Penitentiary",
        description:
          "Tour Eastern State Penitentiary with commentary on its prison architecture and history.",
        duration: "60 minutes",
        stopType: "stop",
      },
      {
        title: "Philadelphia Museum of Art",
        description:
          "Pass the Philadelphia Museum of Art facade and Benjamin Franklin Parkway.",
        stopType: "pass-by",
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
    productCode: "8841P6",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/Private-Half-Day-Philadelphia-Driving-Tour/d906-8841P6",
    title: "Private Half Day Philadelphia Driving Tour with Local Guide",
    description:
      "Discover Philadelphia's core landmarks on a private half-day driving tour with a local guide and vehicle reserved for your group. The route efficiently covers Independence Hall, the Liberty Bell, City Hall, and Reading Terminal Market with flexible stop lengths at your preferred photo points. Your guide connects Revolutionary history with modern Center City life while navigating downtown streets. This premium private format suits travelers with limited time who still want a personalized introduction to Philadelphia.",
    duration: "4 hours (approx.)",
    priceFrom: 595,
    heroUrl: `${TACDN}/0d/e1/06/a6.jpg`,
    rating: 5,
    reviewCount: 98,
    highlights: [
      "Private half-day driving tour with local guide",
      "Independence Hall and Liberty Bell stops",
      "Philadelphia City Hall and William Penn statue views",
      "Reading Terminal Market visit with food options",
      "Per-group private vehicle for your party only",
    ],
    startDescription:
      "Pickup from your Philadelphia hotel or confirmed downtown meeting point at your scheduled departure time.",
    endDescription:
      "Return to your pickup location or agreed Center City drop-off after the final stop.",
    itineraryItems: [
      {
        title: "Independence Hall",
        description:
          "Stop at Independence Hall with overview of the Founding Fathers and Declaration signing.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Liberty Bell",
        description:
          "Visit the Liberty Bell Center with time for photos and historical commentary.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "City Hall",
        description:
          "View Philadelphia City Hall and the William Penn statue atop the tower.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Reading Terminal Market",
        description:
          "Explore Reading Terminal Market with local food and vendor recommendations.",
        duration: "40 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private local guide",
      "Private vehicle transport",
      "Hotel pickup and drop-off",
    ],
    categories: ["Private Tours", "City Tours", "Sightseeing Tours"],
  },
  {
    productCode: "8841P70",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/A-Day-in-Amish-Country/d906-8841P70",
    title: "Guided Day Trip to Amish Country from Philadelphia",
    description:
      "Experience Lancaster County Amish Country on a guided day trip from Philadelphia with scenic countryside drives and cultural stops. Your guide explains Plain community traditions while visiting an Amish farm, Strasburg, and rural Lancaster County landscapes. The full-day format balances driving time with hands-on farm visits and small-town exploration away from the city. Ideal for travelers who want a structured Amish Country introduction without planning their own rural routing.",
    duration: "8 hours (approx.)",
    priceFrom: 249,
    heroUrl: `${TACDN}/0d/e1/70/b0.jpg`,
    rating: 4.8,
    reviewCount: 312,
    highlights: [
      "Full-day guided Amish Country trip from Philadelphia",
      "Lancaster County scenic countryside routing",
      "Amish farm visit with cultural commentary",
      "Strasburg and rural Pennsylvania stops",
      "Round-trip transport from Philadelphia",
    ],
    startDescription:
      "Meet at the confirmed Philadelphia departure point or hotel pickup location at your scheduled time.",
    endDescription:
      "Return to the original Philadelphia departure point after the Amish Country loop.",
    itineraryItems: [
      {
        title: "Lancaster County",
        description:
          "Drive into Lancaster County with orientation to Amish community life and farmland.",
        duration: "90 minutes",
        stopType: "stop",
      },
      {
        title: "Amish Farm",
        description:
          "Visit an Amish farm with guided commentary on daily life and traditions.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Strasburg",
        description:
          "Stop in Strasburg with time to explore the small-town main street and local shops.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Lancaster County",
        description:
          "Additional countryside pass-by views of horse-drawn buggies and rolling farmland.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Professional guide",
      "Round-trip transport from Philadelphia",
      "Amish farm visit",
    ],
    categories: ["Day Trips", "Cultural Tours", "Sightseeing Tours"],
  },
  {
    productCode: "8841P10",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/Private-Driving-Tour-of-Lancaster-and-Amish-Country/d906-8841P10",
    title: "Private Driving Tour of Amish Country from Philadelphia",
    description:
      "Discover Lancaster County on a private driving tour from Philadelphia with a dedicated guide and vehicle for your party alone. The route covers Amish Country back roads, a covered bridge, and Lancaster County farmland with flexible pacing at farms and scenic viewpoints. Your guide shares Plain community history and rural Pennsylvania stories without the schedule of a large group bus. This premium private format suits families who want an unhurried Amish Country day tailored to their interests.",
    duration: "8 hours (approx.)",
    priceFrom: 775,
    heroUrl: `${TACDN}/0d/a1/10/b1.jpg`,
    rating: 5,
    reviewCount: 67,
    highlights: [
      "Private Amish Country driving tour from Philadelphia",
      "Lancaster County back-road routing for your party only",
      "Covered bridge photo stop in rural Pennsylvania",
      "Flexible farm and countryside visit pacing",
      "Per-group private vehicle with dedicated guide",
    ],
    startDescription:
      "Pickup from your Philadelphia hotel or confirmed meeting point at your scheduled departure time.",
    endDescription:
      "Return to your Philadelphia pickup location after the final Amish Country stop.",
    itineraryItems: [
      {
        title: "Lancaster County",
        description:
          "Drive into Lancaster County with private routing through Amish farmland and villages.",
        duration: "90 minutes",
        stopType: "stop",
      },
      {
        title: "Amish Country",
        description:
          "Explore Amish Country with stops at farms and local artisan shops.",
        duration: "60 minutes",
        stopType: "stop",
      },
      {
        title: "Covered Bridge",
        description:
          "Photo stop at a historic covered bridge with rural Pennsylvania scenery.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Lancaster County",
        description:
          "Additional countryside driving with horse-drawn buggy pass-by views.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Private driver-guide",
      "Private vehicle transport",
      "Hotel pickup and drop-off",
    ],
    categories: ["Private Tours", "Day Trips", "Cultural Tours"],
  },
  {
    productCode: "102233P1",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/Discovering-Colonial-Philadelphia-to-now-Walking-Tour/d906-102233P1",
    title: "Discovering Colonial Philadelphia Private Walking Tour",
    description:
      "Explore Colonial Philadelphia on a private walking tour through Independence National Historical Park and Old City streets reserved for your party alone. Your guide connects Independence Hall, the Liberty Bell, Benjamin Franklin's Grave, and Christ Church with stories of the Founding Fathers and early American life. The private format allows flexible time at each landmark without a large group schedule. This premium outing suits history enthusiasts who want an intimate Colonial Philadelphia deep dive.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 250,
    heroUrl: `${TACDN}/10/22/33/c1.jpg`,
    rating: 5,
    reviewCount: 89,
    highlights: [
      "Private Colonial Philadelphia walking tour for your group",
      "Independence Hall and Liberty Bell with expert narration",
      "Benjamin Franklin's Grave at Christ Church Burial Ground",
      "Christ Church visit with Founding Fathers history",
      "Flexible pacing through Old City landmarks",
    ],
    startDescription:
      "Meet your private guide at Independence Visitor Center or confirmed Old City meeting point at your scheduled time.",
    endDescription:
      "Tour ends near Christ Church or your agreed Old City endpoint.",
    itineraryItems: [
      {
        title: "Independence Hall",
        description:
          "Begin at Independence Hall with the Declaration of Independence and Constitutional Convention history.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Liberty Bell",
        description:
          "Visit the Liberty Bell Center with Revolutionary War context and photo time.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Benjamin Franklin's Grave",
        description:
          "Stop at Christ Church Burial Ground to pay respects at Benjamin Franklin's grave.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Christ Church",
        description:
          "Tour Christ Church where Washington, Franklin, and other founders worshipped.",
        duration: "25 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private professional guide",
      "Private walking tour",
    ],
    categories: ["Private Tours", "Walking Tours", "Historical Tours"],
  },
  {
    productCode: "102233P3",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/Hamilton-The-Tour-where-it-Happens/d906-102233P3",
    title: "Hamilton The Tour where it Happens",
    description:
      "Follow Alexander Hamilton's Philadelphia footsteps on a guided walking tour connecting the sites where America's financial and political foundations took shape. Your guide weaves Broadway-inspired storytelling with real history at Independence Hall, City Tavern, and the Second Bank of the United States. The route covers Hamilton's role in the Constitutional Convention and his legacy in early Federal Philadelphia. Perfect for musical theater fans and history buffs who want a lively Founding-era narrative.",
    duration: "2 hours (approx.)",
    priceFrom: 250,
    heroUrl: `${TACDN}/10/22/33/c3.jpg`,
    rating: 4.9,
    reviewCount: 156,
    highlights: [
      "Hamilton-themed walking tour of Colonial Philadelphia",
      "Independence Hall with Constitutional Convention stories",
      "City Tavern stop tied to Founding Fathers gatherings",
      "Second Bank of the United States and Hamilton's financial legacy",
      "Engaging guide narration for musical and history fans",
    ],
    startDescription:
      "Meet your guide at Independence Visitor Center or confirmed Old City meeting point at your scheduled departure time.",
    endDescription:
      "Tour ends near the Second Bank of the United States or your agreed Old City endpoint.",
    itineraryItems: [
      {
        title: "Independence Hall",
        description:
          "Begin at Independence Hall with Hamilton's role in the Constitutional Convention.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "City Tavern",
        description:
          "Stop at City Tavern where Founding Fathers dined and debated.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Second Bank of the United States",
        description:
          "Visit the Second Bank with commentary on Hamilton's banking system.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Independence National Historical Park",
        description:
          "Walk additional park blocks connecting Hamilton-era Philadelphia sites.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "Hamilton history walking tour",
    ],
    categories: ["Walking Tours", "Historical Tours", "Cultural Tours"],
  },
  {
    productCode: "255730P245",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/Private-Family-Walking-Tour-In-the-Footsteps-of-the-Founders/d906-255730P245",
    title: "Private 2-hour Founding Fathers Tour of Philadelphia",
    description:
      "Discover the Founding Fathers on a private two-hour walking tour through Independence National Historical Park tailored to your family's pace. Your guide brings Washington, Jefferson, and Franklin to life at Independence Hall, the Liberty Bell, and Congress Hall with stories suited to all ages. The private format allows extra photo time and questions without keeping up with a large group. Ideal for families who want a focused Revolutionary history introduction in Old City.",
    duration: "2 hours (approx.)",
    priceFrom: 160,
    heroUrl: `${TACDN}/12/3b/f2/57.jpg`,
    rating: 5,
    reviewCount: 124,
    highlights: [
      "Private Founding Fathers walking tour for your party only",
      "Independence Hall with family-friendly Revolutionary history",
      "Liberty Bell visit with flexible photo time",
      "Congress Hall and early American government stories",
      "Two-hour format ideal for families with children",
    ],
    startDescription:
      "Meet your private guide at Independence Visitor Center at your scheduled departure time.",
    endDescription:
      "Tour ends at Congress Hall or your agreed Independence Mall endpoint.",
    itineraryItems: [
      {
        title: "Independence Hall",
        description:
          "Begin at Independence Hall with Founding Fathers stories and Declaration signing history.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Liberty Bell",
        description:
          "Visit the Liberty Bell Center with time for photos and kid-friendly commentary.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Congress Hall",
        description:
          "Tour Congress Hall where the early U.S. Congress convened.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Independence National Historical Park",
        description:
          "Walk the park connecting additional Founding-era landmarks.",
        duration: "15 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private professional guide",
      "Private walking tour",
    ],
    categories: ["Private Tours", "Walking Tours", "Historical Tours"],
  },
  {
    productCode: "255730P256",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/Private-Walking-Tour-of-Nazi-History-in-Berlin/d906-255730P256",
    title: "Flavours of Philadelphia: Private Reading Market 2.5-hr Food Tour",
    description:
      "Taste Philadelphia's culinary heritage on a private 2.5-hour food tour centered on Reading Terminal Market and Center City eateries. Your guide leads a paced walk with curated tastings at market stalls and neighborhood spots known for cheesesteaks, Amish baked goods, and local specialties. Commentary covers immigrant food traditions and the vendors who shaped Philadelphia's dining scene. This premium private format suits groups who want an unhurried market deep dive without joining strangers.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 290,
    heroUrl: `${TACDN}/12/57/30/d2.jpg`,
    rating: 5,
    reviewCount: 43,
    highlights: [
      "Private Reading Terminal Market food tour for your party",
      "Curated tastings at market stalls and Center City spots",
      "Cheesesteak and Amish baked goods samples",
      "Licensed guide with Philadelphia food history commentary",
      "2.5-hour private walking format",
    ],
    startDescription:
      "Meet your private guide at Reading Terminal Market entrance at your scheduled departure time.",
    endDescription:
      "Tour ends near the final tasting stop in Center City or Reading Terminal Market.",
    itineraryItems: [
      {
        title: "Reading Terminal Market",
        description:
          "Begin at Reading Terminal Market with orientation and first tastings at vendor stalls.",
        duration: "60 minutes",
        stopType: "stop",
      },
      {
        title: "Center City",
        description:
          "Walk Center City blocks between tastings with neighborhood food history.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Reading Terminal Market",
        description:
          "Return to the market for additional courses and specialty vendor stops.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Center City",
        description:
          "Finish with a final tasting at a Center City establishment near the market.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private food guide",
      "Food tastings",
      "Private walking tour",
    ],
    categories: ["Private Tours", "Food Tours", "Walking Tours"],
  },
  {
    productCode: "86032P3",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/Historic-Food-Tour/d906-86032P3",
    title: "Historic Old City Dine Around",
    description:
      "Explore Old City's historic streets and restaurants on a guided dine-around walking tour with multiple seated tastings. Your guide connects Elfreth's Alley, America's oldest residential street, with curated stops at Historic District restaurants serving Philadelphia classics. The route blends Colonial architecture with contemporary local cuisine in a three-hour format. Suited for food lovers who want history and flavor combined in one Old City outing.",
    duration: "3 hours (approx.)",
    priceFrom: 120,
    heroUrl: `${TACDN}/08/60/32/d3.jpg`,
    rating: 4.9,
    reviewCount: 187,
    highlights: [
      "Historic Old City dine-around with multiple restaurant stops",
      "Elfreth's Alley walk with Colonial architecture commentary",
      "Historic District restaurant tastings",
      "Philadelphia classic dishes at curated eateries",
      "Three-hour guided food and history format",
    ],
    startDescription:
      "Meet your guide at the confirmed Old City meeting point near Elfreth's Alley at your scheduled time.",
    endDescription:
      "Tour ends at the final Historic District restaurant on your route.",
    itineraryItems: [
      {
        title: "Old City",
        description:
          "Begin in Old City with orientation to the neighborhood's Colonial and culinary history.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Elfreth's Alley",
        description:
          "Walk Elfreth's Alley, America's oldest continuously inhabited residential street.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Historic District restaurants",
        description:
          "Seated tastings at Historic District restaurants with Philadelphia specialties.",
        duration: "90 minutes",
        stopType: "stop",
      },
      {
        title: "Old City",
        description:
          "Continue through Old City blocks connecting additional food stops.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "Restaurant tastings",
      "Walking tour",
    ],
    categories: ["Food Tours", "Walking Tours", "Historical Tours"],
  },
  {
    productCode: "8841P73",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/Valley-Forge-American-Revolution-Tour/d906-8841P73",
    title: "Driving Tour of Valley Forge National Park from Philadelphia",
    description:
      "Visit Valley Forge National Historical Park on a driving tour from Philadelphia with commentary on the Continental Army's pivotal winter encampment. Your guide covers Washington's Headquarters, reconstructed soldier huts, and the park's memorial architecture while handling the suburban drive. The half-day format delivers Revolutionary War context at the site where the army regrouped before independence was secured. Ideal for history buffs who want efficient transport to this essential American Revolution landmark.",
    duration: "4 hours (approx.)",
    priceFrom: 149,
    heroUrl: `${TACDN}/0d/e1/73/b3.jpg`,
    rating: 4.9,
    reviewCount: 76,
    highlights: [
      "Driving tour of Valley Forge National Historical Park from Philadelphia",
      "Washington's Headquarters visit with Revolutionary War history",
      "Continental Army encampment site commentary",
      "Round-trip transport from Philadelphia",
      "Half-day format with guided park exploration",
    ],
    startDescription:
      "Pickup from your Philadelphia hotel or confirmed meeting point at your scheduled departure time.",
    endDescription:
      "Return to your Philadelphia pickup location after the Valley Forge park visit.",
    itineraryItems: [
      {
        title: "Valley Forge National Historical Park",
        description:
          "Arrive at Valley Forge with overview of the 1777-78 winter encampment.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Washington's Headquarters",
        description:
          "Tour Washington's Headquarters with stories of the Continental Army leadership.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Valley Forge National Historical Park",
        description:
          "Drive park roads with stops at memorial arch and reconstructed huts.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Valley Forge National Historical Park",
        description:
          "Additional park viewpoints with pass-by memorial and monument commentary.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Professional guide",
      "Round-trip transport from Philadelphia",
      "Valley Forge park visit",
    ],
    categories: ["Day Trips", "Historical Tours", "Sightseeing Tours"],
  },
  {
    productCode: "153296P3",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/Customized-Tours-in-and-around-Philadelphia/d906-153296P3",
    title: "Customized Tours in and around Philadelphia",
    description:
      "Experience Philadelphia your way on a fully customized private tour with a dedicated guide who builds the route around your priorities. Choose emphasis on Independence Hall, the Philadelphia Museum of Art, food neighborhoods, or suburban day trips with flexible stop lengths at each landmark. Your guide adjusts pacing and routing to your group, whether that means extended time at the Liberty Bell or a detour to Reading Terminal Market. This premium private format suits repeat visitors and groups with specific Philadelphia interests.",
    duration: "4 hours (approx.)",
    priceFrom: 275,
    heroUrl: `${TACDN}/15/32/96/d3.jpg`,
    rating: 5,
    reviewCount: 52,
    highlights: [
      "Fully customized private Philadelphia tour for your party",
      "Flexible routing to Independence Hall, museums, or food stops",
      "Philadelphia Museum of Art and Rocky Steps optional routing",
      "Dedicated guide with personalized pacing",
      "Per-group pricing with hotel pickup options",
    ],
    startDescription:
      "Meet your guide at your Philadelphia hotel, vacation rental, or confirmed downtown meeting point.",
    endDescription:
      "Tour concludes at your preferred endpoint or starting location.",
    itineraryItems: [
      {
        title: "Route Planning",
        description:
          "Brief with your guide to set priorities among history, art, or food stops.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Independence Hall",
        description:
          "Optional stop at Independence Hall when included in your customized route.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Philadelphia Museum of Art",
        description:
          "Optional visit to the Philadelphia Museum of Art and Rocky Steps area.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Customizable stops",
        description:
          "Additional stops tailored to your interests across Philadelphia and suburbs.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private professional guide",
      "Custom route planning",
      "Private tour transport",
    ],
    categories: ["Private Tours", "City Tours", "Sightseeing Tours"],
  },
  {
    productCode: "8841P82",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/Italian-Market-Food-Tour-PRIVATE/d906-8841P82",
    title: "Italian Market Food Tour PRIVATE",
    description:
      "Discover South Philadelphia's Italian Market on a private food tour reserved for your party alone along South 9th Street. Your guide leads a paced walk with tastings at butcher shops, bakeries, and specialty vendors that have served the neighborhood for generations. Commentary covers immigrant food traditions and the market's role in Philadelphia's culinary identity. This premium private format suits groups who want an intimate Italian Market experience without joining a large tour.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 130,
    heroUrl: `${TACDN}/0d/e1/82/b8.jpg`,
    rating: 5,
    reviewCount: 38,
    highlights: [
      "Private Italian Market food tour for your party only",
      "South 9th Street vendor tastings at curated stops",
      "Butcher shops, bakeries, and specialty market vendors",
      "Immigrant food history and neighborhood commentary",
      "2.5-hour private walking format",
    ],
    startDescription:
      "Meet your private guide at the Italian Market on South 9th Street at your scheduled departure time.",
    endDescription:
      "Tour ends near the final tasting vendor on South 9th Street.",
    itineraryItems: [
      {
        title: "Italian Market",
        description:
          "Begin on South 9th Street with orientation to the market's history and vendors.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "South 9th Street",
        description:
          "Walk South 9th Street with tastings at butcher shops and bakeries.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Italian Market",
        description:
          "Continue through the market with additional specialty vendor stops.",
        duration: "40 minutes",
        stopType: "stop",
      },
      {
        title: "South 9th Street",
        description:
          "Finish with a final tasting at a South Philadelphia institution.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private food guide",
      "Food tastings",
      "Private walking tour",
    ],
    categories: ["Private Tours", "Food Tours", "Walking Tours"],
  },
  {
    productCode: "86032P1",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/Flavors-of-Philly-Food-Tour/d906-86032P1",
    title: "Flavors of Philly Food Tour",
    description:
      "Taste Philadelphia's iconic flavors on a guided food walking tour through Reading Terminal Market and Center City with cheesesteak stops and local specialties. Your guide connects each bite to the immigrant communities and vendors who built the city's food culture. The route covers enough tastings for a hearty lunch while keeping a comfortable walking pace through downtown. One of Philadelphia's most popular food tours for first-time visitors who want classic flavors in one outing.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 65,
    heroUrl: `${TACDN}/08/60/32/a1.jpg`,
    rating: 4.8,
    reviewCount: 516,
    highlights: [
      "Guided Flavors of Philly food walking tour",
      "Reading Terminal Market vendor tastings",
      "Center City stops with cheesesteak samples",
      "Local specialties and immigrant food history",
      "2.5-hour format with generous portions",
    ],
    startDescription:
      "Meet your guide at Reading Terminal Market or confirmed Center City meeting point at your scheduled departure time.",
    endDescription:
      "Tour ends near the final tasting stop in Center City.",
    itineraryItems: [
      {
        title: "Reading Terminal Market",
        description:
          "Begin at Reading Terminal Market with tastings at iconic vendor stalls.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Center City",
        description:
          "Walk Center City blocks between food stops with neighborhood commentary.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Center City",
        description:
          "Cheesesteak stop at a local institution with Philadelphia food history.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Reading Terminal Market",
        description:
          "Return to the market area for a final tasting course.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional food guide",
      "Food tastings",
      "Walking tour",
    ],
    categories: ["Food Tours", "Walking Tours"],
  },
  {
    productCode: "8841P34",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/Center-City-Philadelphia-Food-Tour-with-Reading-Market/d906-8841P34",
    title: "Center City Philadelphia Food Tour with Reading Market",
    description:
      "Explore Center City Philadelphia's food scene on a walking tour combining Reading Terminal Market tastings with Rittenhouse Square neighborhood stops. Your guide leads a paced route with samples at market vendors and local eateries known for Philadelphia classics. Commentary covers Center City development and the vendors who feed downtown workers and visitors daily. This affordable food tour suits travelers who want market and neighborhood flavors in one efficient downtown walk.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 59,
    heroUrl: `${TACDN}/0d/e1/34/a4.jpg`,
    rating: 4.9,
    reviewCount: 936,
    highlights: [
      "Center City food tour with Reading Terminal Market stop",
      "Rittenhouse Square neighborhood tasting route",
      "Market vendor and local eatery samples",
      "Philadelphia classic dishes at curated stops",
      "2.5-hour guided walking food experience",
    ],
    startDescription:
      "Meet your guide at Reading Terminal Market entrance at your scheduled departure time.",
    endDescription:
      "Tour ends near Rittenhouse Square or the final Center City tasting stop.",
    itineraryItems: [
      {
        title: "Reading Terminal Market",
        description:
          "Begin at Reading Terminal Market with tastings at vendor stalls.",
        duration: "40 minutes",
        stopType: "stop",
      },
      {
        title: "Center City",
        description:
          "Walk Center City blocks connecting market tastings to neighborhood stops.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Rittenhouse Square",
        description:
          "Stop near Rittenhouse Square with additional tasting at a local spot.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Center City",
        description:
          "Finish with a final tasting course in downtown Philadelphia.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional food guide",
      "Food tastings",
      "Walking tour",
    ],
    categories: ["Food Tours", "Walking Tours"],
  },
  {
    productCode: "5582660P3",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/Explore-Philadelphia-via-Vintage-Car-or-Electric-cart/d906-5582660P3",
    title: "Explore Philadelphia via Vintage Car or Electric cart",
    description:
      "See Philadelphia's landmarks from a vintage car or electric cart on a guided sightseeing tour through Old City and Center City. Your driver-guide narrates Independence Hall, the Liberty Bell, and City Hall while you enjoy open-air views from a distinctive vehicle. The two-hour format covers more ground than a walking tour with photo stops at key viewpoints. Ideal for visitors who want a fun, photogenic city overview without extensive walking.",
    duration: "2 hours (approx.)",
    priceFrom: 69,
    heroUrl: `${TACDN}/55/82/66/d3.jpg`,
    rating: 4.7,
    reviewCount: 46,
    highlights: [
      "Vintage car or electric cart sightseeing tour of Philadelphia",
      "Independence Hall and Liberty Bell pass-by and stop routing",
      "Philadelphia City Hall and Center City viewpoints",
      "Open-air photo opportunities from a distinctive vehicle",
      "Two-hour guided city overview format",
    ],
    startDescription:
      "Meet at the confirmed Old City or Center City departure point at your scheduled time.",
    endDescription:
      "Return to the original departure point after the city loop.",
    itineraryItems: [
      {
        title: "Independence Hall",
        description:
          "Begin near Independence Hall with Revolutionary history introduction from the cart.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Liberty Bell",
        description:
          "Stop at the Liberty Bell area with time for photos from the vehicle.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "City Hall",
        description:
          "Drive past Philadelphia City Hall with William Penn statue commentary.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Old City",
        description:
          "Continue through Old City blocks with pass-by Colonial architecture views.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Driver-guide",
      "Vintage car or electric cart tour",
    ],
    categories: ["City Tours", "Sightseeing Tours"],
  },
  {
    productCode: "6314PHILSEG",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/Philadelphia-2-Hour-Electric-Cart-Tour/d906-6314PHILSEG",
    title: "Philadelphia Sightseeing by Electric Cart",
    description:
      "Discover Philadelphia on a two-hour electric cart tour through Independence National Historical Park and Old City with a local guide. The open-air cart provides comfortable sightseeing with stops at key Revolutionary landmarks and Colonial streets. Your guide shares Founding Fathers stories while navigating the compact historic district efficiently. One of Philadelphia's most-reviewed cart tours for first-time visitors who want a quick historic overview.",
    duration: "2 hours (approx.)",
    priceFrom: 69,
    heroUrl: `${TACDN}/63/14/a0/b1.jpg`,
    rating: 4.8,
    reviewCount: 677,
    highlights: [
      "Two-hour electric cart tour of historic Philadelphia",
      "Independence National Historical Park routing",
      "Old City Colonial streets and landmark stops",
      "Local guide with Revolutionary War commentary",
      "Open-air cart with photo opportunities",
    ],
    startDescription:
      "Meet at the confirmed Old City departure point near Independence National Historical Park at your scheduled time.",
    endDescription:
      "Return to the original Old City departure point after the cart loop.",
    itineraryItems: [
      {
        title: "Independence Hall",
        description:
          "Begin at Independence Hall with orientation to the Founding Fathers and Revolutionary Philadelphia.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Liberty Bell",
        description:
          "Stop at the Liberty Bell with time for photos and guide commentary.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Old City",
        description:
          "Drive Old City streets with Colonial architecture and historic district commentary.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Independence National Historical Park",
        description:
          "Pass through the park with views of Congress Hall and Carpenters' Hall.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Local guide",
      "Electric cart tour",
    ],
    categories: ["Sightseeing Tours", "City Tours"],
  },
  {
    productCode: "5042PHLSPI",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/City-Cruises-Philadelphia-Signature-Dinner-Cruise-with-Buffet/d906-5042PHLSPI",
    title: "City Cruises Philadelphia Signature Dinner Cruise with Buffet",
    description:
      "Experience Philadelphia from the water on a signature dinner cruise along the Delaware River with a buffet meal and skyline views. The evening includes dining aboard City Cruises with panoramas of Penn's Landing, the Benjamin Franklin Bridge, and the illuminated Center City skyline. Indoor and outdoor deck seating frame the riverfront as the city lights come on. This special-occasion outing suits couples and groups who want dinner and sightseeing combined on the Delaware River.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 95,
    heroUrl: `${TACDN}/50/42/d1/n1.jpg`,
    rating: 4.0,
    reviewCount: 380,
    highlights: [
      "Signature dinner cruise on the Delaware River",
      "Buffet dinner aboard City Cruises vessel",
      "Penn's Landing and Philadelphia skyline views",
      "Indoor and outdoor deck seating",
      "Evening riverfront dining experience",
    ],
    startDescription:
      "Board at Penn's Landing or the City Cruises terminal confirmed on your reservation. Arrive 30 minutes early.",
    endDescription:
      "Disembark at the same Penn's Landing terminal after dinner service concludes.",
    itineraryItems: [
      {
        title: "Penn's Landing",
        description:
          "Board at Penn's Landing and settle into dinner seating with welcome service.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Delaware River",
        description:
          "Cruise the Delaware River during buffet dinner with skyline views.",
        duration: "90 minutes",
        stopType: "stop",
      },
      {
        title: "Philadelphia skyline",
        description:
          "River segment with illuminated Center City skyline and bridge views.",
        stopType: "pass-by",
      },
      {
        title: "Penn's Landing",
        description:
          "Return to Penn's Landing after the dinner cruise loop.",
        duration: "10 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Dinner cruise ticket",
      "Buffet dinner",
      "Indoor and outdoor deck access",
    ],
    categories: ["Dinner Cruises", "Cruises & Sailing"],
  },
  {
    productCode: "5042P61",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/City-Cruises-Philadelphia-Signature-Buffet-Lunch-Cruise/d906-5042P61",
    title: "City Cruises Philadelphia Signature Buffet Lunch Cruise",
    description:
      "Enjoy Philadelphia's skyline from the Delaware River on a daytime lunch cruise with a buffet meal aboard City Cruises. The route passes Penn's Landing and offers open views of the Benjamin Franklin Bridge and Center City towers from deck-level seating. The two-hour format balances dining with relaxed river sightseeing in natural daylight. Suited for visitors who want a water perspective of Philadelphia without committing to an evening dinner cruise.",
    duration: "2 hours (approx.)",
    priceFrom: 87,
    heroUrl: `${TACDN}/50/42/d1/l1.jpg`,
    rating: 4.0,
    reviewCount: 60,
    highlights: [
      "Daytime lunch cruise on the Delaware River",
      "Buffet lunch aboard City Cruises vessel",
      "Penn's Landing departure with skyline views",
      "Benjamin Franklin Bridge and riverfront panoramas",
      "Two-hour relaxed river sightseeing format",
    ],
    startDescription:
      "Board at Penn's Landing or the City Cruises terminal confirmed on your reservation. Arrive 20 minutes early.",
    endDescription:
      "Disembark at the same Penn's Landing terminal after the lunch cruise.",
    itineraryItems: [
      {
        title: "Penn's Landing",
        description:
          "Board at Penn's Landing and settle into lunch seating.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Delaware River",
        description:
          "Cruise the Delaware River during buffet lunch with daytime skyline views.",
        duration: "75 minutes",
        stopType: "stop",
      },
      {
        title: "Penn's Landing",
        description:
          "Pass Penn's Landing waterfront with commentary on Philadelphia's port history.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Lunch cruise ticket",
      "Buffet lunch",
      "Deck seating",
    ],
    categories: ["Lunch Cruises", "Cruises & Sailing"],
  },
  {
    productCode: "8841P27",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/Philadelphias-Italian-Market-Food-Tour/d906-8841P27",
    title: "Philadelphia's Italian Market Food Tour",
    description:
      "Walk South Philadelphia's Italian Market on a guided food tour with tastings at the vendors and eateries that define this historic neighborhood. Your guide shares immigrant stories while you sample cheeses, cured meats, and baked goods along South 9th Street. The two-hour format delivers enough bites for a satisfying lunch while exploring one of America's oldest outdoor markets. A popular choice for food lovers who want authentic South Philly flavor without a private booking.",
    duration: "2 hours (approx.)",
    priceFrom: 61,
    heroUrl: `${TACDN}/0d/e1/27/a7.jpg`,
    rating: 5.0,
    reviewCount: 309,
    highlights: [
      "Guided Italian Market food walking tour",
      "South Philadelphia neighborhood and vendor tastings",
      "South 9th Street market stalls and specialty shops",
      "Immigrant food history and local commentary",
      "Two-hour format with generous samples",
    ],
    startDescription:
      "Meet your guide at the Italian Market on South 9th Street at your scheduled departure time.",
    endDescription:
      "Tour ends near the final vendor stop on South 9th Street.",
    itineraryItems: [
      {
        title: "Italian Market",
        description:
          "Begin at the Italian Market with orientation to South 9th Street vendors.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "South Philadelphia",
        description:
          "Walk South Philadelphia blocks with tastings at neighborhood institutions.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Italian Market",
        description:
          "Continue through the market with cheese, meat, and bakery samples.",
        duration: "35 minutes",
        stopType: "stop",
      },
      {
        title: "South 9th Street",
        description:
          "Finish on South 9th Street with a final tasting at a market vendor.",
        duration: "15 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional food guide",
      "Food tastings",
      "Walking tour",
    ],
    categories: ["Food Tours", "Walking Tours"],
  },
  {
    productCode: "25140P1",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/Classic-Philadelphia-City-Bike-Tour/d906-25140P1",
    title: "Classic Philadelphia City Bike Tour",
    description:
      "Explore Philadelphia on a guided bike tour along the Schuylkill River Trail with stops at the Philadelphia Museum of Art, Rocky Steps, and Boathouse Row. Your guide leads a paced three-hour ride with commentary on skyline landmarks and riverfront parks. Bikes, helmets, and a safety briefing are included with routing matched to the group's ability. This active outing covers more ground than a walking tour while keeping a social, guided format.",
    duration: "3 hours (approx.)",
    priceFrom: 79,
    heroUrl: `${TACDN}/25/14/01/b1.jpg`,
    rating: 4.9,
    reviewCount: 214,
    highlights: [
      "Guided three-hour Philadelphia city bike tour",
      "Schuylkill River Trail riding with skyline views",
      "Philadelphia Museum of Art and Rocky Steps stop",
      "Boathouse Row and riverfront park segments",
      "Bikes, helmets, and safety briefing included",
    ],
    startDescription:
      "Meet at the bike rental staging area near the Schuylkill River Trail confirmed when booking. Arrive 15 minutes early for fitting.",
    endDescription:
      "Return bikes to the staging area after the final riverfront stop.",
    itineraryItems: [
      {
        title: "Schuylkill River Trail",
        description:
          "Bike orientation and safety briefing before entering the river trail route.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Philadelphia Museum of Art",
        description:
          "Stop at the Philadelphia Museum of Art and Rocky Steps with photo time.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Boathouse Row",
        description:
          "Ride along Boathouse Row with commentary on Philadelphia's rowing tradition.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Schuylkill River Trail",
        description:
          "Continue on the trail with skyline panoramas and parkland riding.",
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
    productCode: "115692P1",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/Beyond-the-Bell-History-Walking-Tour/d906-115692P1",
    title: "Beyond the Liberty Bell History Walking Tour",
    description:
      "Go beyond the Liberty Bell on a history walking tour through Old City that reveals hidden stories and lesser-known Revolutionary sites. Your guide covers Independence Hall and the bell while diving into alleyways, burial grounds, and overlooked landmarks that shaped early Philadelphia. The two-hour format keeps a focused pace through downtown crime, commerce, and Colonial life. Suited for curious travelers who want deeper context than a standard Independence Mall visit.",
    duration: "2 hours (approx.)",
    priceFrom: 59,
    heroUrl: `${TACDN}/11/56/92/b1.jpg`,
    rating: 4.8,
    reviewCount: 423,
    highlights: [
      "History walking tour beyond standard Liberty Bell stops",
      "Independence Hall with expanded Old City context",
      "Liberty Bell visit with hidden history commentary",
      "Old City alleyways and overlooked Revolutionary sites",
      "Two-hour guided format near Independence Mall",
    ],
    startDescription:
      "Meet your guide at Independence Visitor Center or confirmed Old City meeting point at your scheduled departure time.",
    endDescription:
      "Tour ends in Old City near the final hidden-history stop.",
    itineraryItems: [
      {
        title: "Independence Hall",
        description:
          "Begin at Independence Hall with context beyond the standard visitor narrative.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Liberty Bell",
        description:
          "Visit the Liberty Bell with stories of its symbolism and surrounding history.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Old City",
        description:
          "Walk Old City alleyways and side streets with hidden Revolutionary stories.",
        duration: "35 minutes",
        stopType: "stop",
      },
      {
        title: "Old City hidden history",
        description:
          "Continue through overlooked landmarks and burial grounds in the historic district.",
        duration: "25 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "History walking tour",
    ],
    categories: ["Walking Tours", "Historical Tours"],
  },
  {
    productCode: "52886P6",
    productUrl:
      "https://www.viator.com/tours/Philadelphia/Inside-the-Italian-Market-Chef-Led-Tasting-Journey/d906-52886P6",
    title: "Inside the Italian Market: Chef-Led Tasting Journey",
    description:
      "Experience the Italian Market through a chef's eyes on a guided tasting journey with curated stops at South Philadelphia's best vendors. Your chef-guide selects seasonal samples and explains how market ingredients shape Philadelphia's restaurant scene. The route covers the Italian Market with seated and standing tastings timed for flavor and pacing. Ideal for serious food lovers who want expert culinary perspective on this historic neighborhood.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 80,
    heroUrl: `${TACDN}/52/88/06/b6.jpg`,
    rating: 4.9,
    reviewCount: 167,
    highlights: [
      "Chef-led tasting journey through the Italian Market",
      "Curated vendor stops with seasonal sample selections",
      "Professional chef commentary on ingredients and technique",
      "Italian Market and South Philadelphia routing",
      "2.5-hour premium food experience",
    ],
    startDescription:
      "Meet your chef-guide at the Italian Market on South 9th Street at your scheduled departure time.",
    endDescription:
      "Tour ends near the final chef-led tasting stop in the Italian Market.",
    itineraryItems: [
      {
        title: "Italian Market",
        description:
          "Begin at the Italian Market with chef introduction and first vendor tasting.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Chef-Led Tastings",
        description:
          "Continue with chef-selected tastings at specialty market vendors.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Italian Market",
        description:
          "Additional market stops with commentary on ingredient sourcing and preparation.",
        duration: "35 minutes",
        stopType: "stop",
      },
      {
        title: "Italian Market",
        description:
          "Finish with a final chef-led tasting course at a market institution.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Chef guide",
      "Food tastings",
      "Walking tour",
    ],
    categories: ["Food Tours", "Walking Tours"],
  },
];

const buildFixture = (tour: PhiladelphiaTourFixture) => {
  const viatorRatings = PHILADELPHIA_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: "Philadelphia", state: "Pennsylvania" },
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
          question: "Where does the tour depart from in Philadelphia?",
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

    for (const tour of PHILADELPHIA_TOURS) {
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
      `Bootstrapped ${PHILADELPHIA_TOURS.length} Philadelphia Engine6 fixtures.`
    );
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Philadelphia",
    destinationCitySlug: "philadelphia",
    viatorDestinationSlug: "Philadelphia",
    targetPremiumShare: 12 / 22,
    tours: PHILADELPHIA_TOURS,
    buildFixture,
    destinationLogLabel: "Philadelphia",
  });
};

await main();
