import { ZION_VIATOR_PUBLIC_RATINGS } from "../src/engine6/zionViatorPublicRatings";
import { runEngine6ParagonFixtureGeneration } from "./lib/runEngine6ParagonFixtureGeneration";

type ItineraryItem = {
  title: string;
  description: string;
  duration?: string;
  stopType: "stop" | "pass-by";
};

type ZionTourFixture = {
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

const ZION_TOURS: ZionTourFixture[] = [
  {
    productCode: "199627P12",
    productUrl:
      "https://www.viator.com/tours/Zion-National-Park/Zion-Guided-Hike-and-Gourmet-Picnic/d5610-199627P12",
    title: "Zion National Park: Private Guided Hike & Picnic",
    description:
      "Explore Zion National Park on a private full-day tour tailored to your hiking ability and sightseeing priorities. A certified guide leads your party through canyon viewpoints, emerald pool trails, and optional Narrows wading when river conditions allow. Travel in a private vehicle with flexible stops at Court of the Patriarchs, Zion Lodge, and scenic pullouts along the canyon floor. This premium outing suits travelers who want a personalized Zion introduction without joining a large bus group.",
    duration: "6 to 10 hours (approx.)",
    priceFrom: 850.95,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/8f/3d/c9.jpg",
    rating: 5,
    reviewCount: 51,
    highlights: ["Private full-day Zion tour for your party only","Certified guide adjusts hikes to group fitness","Optional Narrows wading when conditions permit","Emerald Pools and Court of the Patriarchs stops","Flexible vehicle routing through Zion Canyon"],
    startDescription:
      "Meet your guide at the Zion Outfitter staging area in Springdale, UT 84767. Confirm pickup time and hiking preferences when booking.",
    endDescription:
      "Return to Springdale or your Zion area hotel after the final canyon stop.",
    itineraryItems: [
      {
        title: "Zion National Park",
        description:
          "Begin with a canyon overview and shuttle or private vehicle access to major trailheads.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Virgin River",
        description:
          "Optional wading section toward the Narrows when flow levels are safe for your group.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Emerald Pools",
        description:
          "Hike the lower or middle Emerald Pools trail for waterfall views beneath sandstone cliffs.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Court of the Patriarchs",
        description:
          "Photo stop at the Court of the Patriarchs viewpoint above the canyon road.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "The Narrows",
        description:
          "Bottom-up Narrows hike from Riverside Walk when river permits allow.",
        duration: "2 hours",
        stopType: "stop",
      }
    ],
    inclusions: ["Private professional guide","Private transport","Park entrance fees","Trail snacks and water"],
    categories: ["Private Tours","Hiking Tours","Full-day Tours"],
  },
  {
    productCode: "199627P1",
    productUrl:
      "https://www.viator.com/tours/Zion-National-Park/Day-Trip-Zion-National-Park/d5610-199627P1",
    title: "The Narrows: Zion National Park Private Guided Hike",
    description:
      "Hike the Narrows on a private guided outing that handles logistics, safety briefing, and pacing through Zion's most famous slot canyon. Your guide leads the Riverside Walk to the Virgin River entrance, then continues upstream through towering sandstone walls when conditions permit. Dry bags, walking sticks, and route selection are matched to seasonal flow levels. This private format keeps the focus on your group's comfort while maximizing time in the water-filled canyon.",
    duration: "7 hours (approx.)",
    priceFrom: 364,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/2c/ff/9e.jpg",
    rating: 5,
    reviewCount: 125,
    highlights: ["Private guided Narrows hike in Zion National Park","Riverside Walk approach with gear briefing","Dry bags and walking sticks provided","Route adjusted to seasonal Virgin River flow","Ideal for hikers seeking a dedicated Narrows day"],
    startDescription:
      "Meet at the Zion Lodge area or Springdale pickup point confirmed at booking. Wear closed-toe water shoes.",
    endDescription:
      "Return to the Temple of Sinawava trailhead or your pickup location after the Narrows hike.",
    itineraryItems: [
      {
        title: "Temple of Sinawava",
        description:
          "Shuttle or walk to the Narrows trailhead at the end of Zion Canyon Scenic Drive.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Riverside Walk",
        description:
          "Paved riverside path leading to the Virgin River Narrows entrance.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "The Narrows",
        description:
          "Upstream hike through the slot canyon with guide-selected turnaround point.",
        duration: "3 hours",
        stopType: "stop",
      },
      {
        title: "Orderville Canyon",
        description:
          "Optional side canyon exploration when water levels allow safe entry.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Zion Lodge",
        description:
          "Post-hike rest stop at Zion Lodge before return transport.",
        duration: "20 minutes",
        stopType: "stop",
      }
    ],
    inclusions: ["Private certified guide","Dry bag and walking stick","Park entrance fees","Safety briefing"],
    categories: ["Private Tours","Hiking Tours","Day Trips"],
  },
  {
    productCode: "422797P4",
    productUrl:
      "https://www.viator.com/tours/Zion-National-Park/Angels-Landing-Guided-Hike-Permit-Included/d5610-422797P4",
    title: "Private Angels Landing Hike Permit Included",
    description:
      "Climb Angels Landing on a private guided day hike with a certified leader who manages permit logistics and chain-section pacing. The route ascends Walter's Wiggles switchbacks to Scout Lookout, then continues along the exposed chain section to the summit viewpoint. Your guide monitors weather, hydration, and turnaround timing for a safe rim return. Private format limits group size to your party for a focused summit attempt.",
    duration: "4 to 6 hours (approx.)",
    priceFrom: 450,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0e/aa/97/94.jpg",
    rating: 5,
    reviewCount: 40,
    highlights: ["Private Angels Landing hike for parties of one to four","Guide handles permit and safety logistics","Scout Lookout and chain section pacing","Summit views over Zion Canyon","Certified guide with canyon route expertise"],
    startDescription:
      "Meet at the Zion Canyon Visitor Center, Springdale, UT 84767. Start early for parking and permit check-in.",
    endDescription:
      "Descend to the Grotto trailhead after the summit or Scout Lookout turnaround.",
    itineraryItems: [
      {
        title: "Zion Visitor Center",
        description:
          "Pre-hike briefing and permit verification at the visitor center.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Walter's Wiggles",
        description:
          "Steep switchback climb on the West Rim Trail toward Scout Lookout.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Scout Lookout",
        description:
          "Rest and assessment point before the exposed chain section.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Angels Landing",
        description:
          "Chain-assisted traverse and summit viewpoint over Zion Canyon.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "West Rim Trail",
        description:
          "Return descent on the West Rim Trail to the Grotto.",
        duration: "1 hour",
        stopType: "stop",
      }
    ],
    inclusions: ["Private certified hiking guide","Angels Landing permit coordination","Trail snacks and water","Safety equipment"],
    categories: ["Private Tours","Hiking Tours","Adrenaline & Extreme"],
  },
  {
    productCode: "118887P10",
    productUrl:
      "https://www.viator.com/tours/Zion-National-Park/Top-of-the-Rock-Climbing-Iron-Ladder-Via-Ferrata-Canyoning-and-Rappelling/d5610-118887P10",
    title: "Tallest in Utah Via Ferrata & Rappelling",
    description:
      "Combine via ferrata climbing, canyoneering, and rappelling on a half-day East Zion adventure above the main park canyon. Certified guides lead you up fixed cable routes at East Zion Resort, cross exposed ledges at Top of the Rock, then rappel into a sandstone slot section. Harness, helmet, and technical gear are included with instruction for first-time via ferrata climbers. This outing delivers adrenaline outside the crowded Zion Canyon shuttle zone.",
    duration: "4 to 5 hours (approx.)",
    priceFrom: 249,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/d6/d8/fe.jpg",
    rating: 5,
    reviewCount: 120,
    highlights: ["Via ferrata ascent with fixed cable routes","Top of the Rock summit panoramas","Guided canyoneering and rappel descents","Technical gear and instruction included","Half-day East Zion adventure format"],
    startDescription:
      "Check in at East Zion Resort, 859 Zion Park Blvd, Orderville, UT 84758. Arrive 15 minutes before your scheduled departure.",
    endDescription:
      "Return to East Zion Resort after the final rappel and gear return.",
    itineraryItems: [
      {
        title: "East Zion Resort",
        description:
          "Gear fitting and via ferrata safety briefing at the resort base.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Via Ferrata",
        description:
          "Fixed-cable climbing route with multiple pitches above East Zion.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Top of the Rock",
        description:
          "Summit stop with panoramic views over Zion's eastern plateau.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Canyoneering Section",
        description:
          "Down-climb and traverse through a sandstone slot section.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Rappel Descent",
        description:
          "Guided rappels into the slot canyon floor.",
        duration: "30 minutes",
        stopType: "stop",
      }
    ],
    inclusions: ["Certified canyoneering guide","Via ferrata and rappel equipment","Helmet and harness","Safety briefing"],
    categories: ["Canyoneering","Climbing","Adrenaline & Extreme"],
  },
  {
    productCode: "118744P3",
    productUrl:
      "https://www.viator.com/tours/Zion-National-Park/Peekaboo-Slot-Canyon/d5610-118744P3",
    title: "Peekaboo Slot Canyon 4WD Tour",
    description:
      "Discover Zion beyond the main canyon on a private full-day loop through Kolob Terrace Road, Grafton Ghost Town, and Peek-A-Boo Slot Canyon. Your guide combines back-road driving with short hikes to petroglyphs, lava-point vistas, and red sand dunes outside the park shuttle zone. This itinerary suits photographers and repeat visitors seeking Kolob country scenery without the Narrows crowds. Lunch stops and pacing remain flexible for your group.",
    duration: "8 hours (approx.)",
    priceFrom: 599,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/87/2c/40.jpg",
    rating: 5,
    reviewCount: 85,
    highlights: ["Private full-day Kolob Terrace and backcountry loop","Grafton Ghost Town historic stop","Peek-A-Boo Slot Canyon photo hike","Petroglyph and Lava Point vista stops","Flexible private vehicle routing"],
    startDescription:
      "Morning pickup from Springdale hotels or meet at the Kolob Terrace Road junction confirmed at booking.",
    endDescription:
      "Return to Springdale after the Lava Point or dune overlook finale.",
    itineraryItems: [
      {
        title: "Kolob Terrace Road",
        description:
          "Scenic drive ascending Kolob Terrace with canyon rim pullouts.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Grafton Ghost Town",
        description:
          "Explore preserved pioneer structures near the Virgin River.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Peek-A-Boo Slot Canyon",
        description:
          "Short hike through a narrow sandstone slot with photo time.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Petroglyph Stop",
        description:
          "View ancient rock art panels along the back-road route.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Lava Point",
        description:
          "High-elevation overlook with wide views toward Zion's western canyons.",
        duration: "30 minutes",
        stopType: "stop",
      }
    ],
    inclusions: ["Private guide and vehicle","Park and backcountry access fees","Bottled water","Trail snacks"],
    categories: ["Private Sightseeing Tours","4WD Tours","Day Trips"],
  },
  {
    productCode: "265766P10",
    productUrl:
      "https://www.viator.com/tours/Zion-National-Park/Full-Day-Private-Tour-and-Hike-in-Bryce-Canyon-National-Park/d5610-265766P10",
    title: "Bryce Canyon Full Day Private Tour and Hike",
    description:
      "Day-trip to Bryce Canyon National Park on a private full-day tour with guided hikes among the park's iconic hoodoo amphitheaters. Your guide covers Sunrise Point, Queen's Garden Trail, Inspiration Point, and Bryce Point with time for photography and interpretive commentary on the pink limestone formations. Travel from the Zion area in a private vehicle with flexible lunch timing. Ideal for travelers basing in Springdale who want Bryce without self-driving the mountain roads.",
    duration: "6 to 8 hours (approx.)",
    priceFrom: 850,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0e/1f/60/0e.jpg",
    rating: 5,
    reviewCount: 35,
    highlights: ["Private Bryce Canyon full-day tour from Zion area","Queen's Garden and Navajo Loop hike options","Sunrise, Inspiration, and Bryce Point overlooks","Professional guide with geology commentary","Private vehicle with flexible lunch stop"],
    startDescription:
      "Morning pickup from Springdale or Zion area lodging. Confirm pickup window when booking.",
    endDescription:
      "Return to your Springdale pickup point after the final Bryce Point stop.",
    itineraryItems: [
      {
        title: "Bryce Canyon National Park",
        description:
          "Enter the park and begin the rim amphitheater loop.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Sunrise Point",
        description:
          "First overlook stop above the main hoodoo amphitheater.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Queen's Garden Trail",
        description:
          "Guided descent among hoodoos on the Queen's Garden route.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Inspiration Point",
        description:
          "Rim viewpoint stop with wide amphitheater panoramas.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Bryce Point",
        description:
          "Final overlook at Bryce Point before the return drive.",
        duration: "20 minutes",
        stopType: "stop",
      }
    ],
    inclusions: ["Private professional guide","Private transport","Bryce Canyon entrance fees","Bottled water"],
    categories: ["Private Tours","Hiking Tours","Day Trips"],
  },
  {
    productCode: "265766P27",
    productUrl:
      "https://www.viator.com/tours/Zion-National-Park/Full-Day-Small-Group-Tour-of-Zion-National-Park/d5610-265766P27",
    title: "Zion Full Day Small Group Tour with Narrows",
    description:
      "Join a small-group full-day tour of Zion National Park that combines shuttle logistics, scenic overlooks, and a guided Narrows hike when river conditions allow. The itinerary covers Riverside Walk, Emerald Pools, Court of the Patriarchs, and bottom-up Narrows wading with a certified guide pacing the group. Maximum group size stays small for a social but uncrowded canyon experience. Park entrance fees and trail snacks are included.",
    duration: "6 to 8 hours (approx.)",
    priceFrom: 279,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/13/1d/62/0b.jpg",
    rating: 4.9,
    reviewCount: 77,
    highlights: ["Small-group full-day Zion canyon tour","Guided bottom-up Narrows hike when permitted","Riverside Walk and Emerald Pools stops","Court of the Patriarchs viewpoint","Park entrance fees included"],
    startDescription:
      "Meet at Zion Outfitter in Springdale, UT 84767 at your confirmed morning departure time.",
    endDescription:
      "Return to the Springdale meeting point after the final canyon trail.",
    itineraryItems: [
      {
        title: "Springdale",
        description:
          "Group meetup and gear check before entering Zion Canyon.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Riverside Walk",
        description:
          "Paved walk along the Virgin River toward the Narrows entrance.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "The Narrows",
        description:
          "Guided bottom-up Narrows hike when Virgin River flow allows.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Emerald Pools",
        description:
          "Short hike to lower Emerald Pools beneath canyon waterfalls.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Court of the Patriarchs",
        description:
          "Viewpoint stop at the Court of the Patriarchs pullout.",
        duration: "15 minutes",
        stopType: "stop",
      }
    ],
    inclusions: ["Professional guide","Small-group transport","Park entrance fees","Trail snacks and water"],
    categories: ["Small Group Tours","Hiking Tours","Full-day Tours"],
  },
  {
    productCode: "286874P2",
    productUrl:
      "https://www.viator.com/tours/Zion-National-Park/Guided-Angels-Landing-Tour/d5610-286874P2",
    title: "Guided Angel's Landing With Permit",
    description:
      "Hike Angels Landing with a guide who secures your permit and leads the West Rim Trail chain section to the summit. The six-hour outing includes pacing through Walter's Wiggles, rest at Scout Lookout, and a guided traverse of the exposed ridge with safety briefing at each chain segment. Suitable for fit hikers comfortable with heights who want permit logistics handled. Group format keeps the route social while maintaining safe spacing on the chains.",
    duration: "6 hours (approx.)",
    priceFrom: 350,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/13/c9/03/ac.jpg",
    rating: 5,
    reviewCount: 28,
    highlights: ["Guided Angels Landing hike with permit included","West Rim Trail ascent with certified guide","Chain section pacing and safety briefing","Scout Lookout rest before summit push","Six-hour round-trip format"],
    startDescription:
      "Meet at the Zion Canyon Visitor Center shuttle stop. Arrive 15 minutes before departure.",
    endDescription:
      "Return to the Grotto trailhead after descending from Scout Lookout or the summit.",
    itineraryItems: [
      {
        title: "Zion Canyon Visitor Center",
        description:
          "Group briefing and permit check before the hike begins.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "West Rim Trail",
        description:
          "Steady climb on the West Rim Trail toward Scout Lookout.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Walter's Wiggles",
        description:
          "Switchback section climbing toward the chain route.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Scout Lookout",
        description:
          "Rest point with views before the chain-assisted section.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Angels Landing",
        description:
          "Chain traverse to the summit viewpoint over Zion Canyon.",
        duration: "1 hour",
        stopType: "stop",
      }
    ],
    inclusions: ["Certified hiking guide","Angels Landing permit","Trail snacks and water","Safety equipment"],
    categories: ["Hiking Tours","Day Trips","Adrenaline & Extreme"],
  },
  {
    productCode: "300061P2",
    productUrl:
      "https://www.viator.com/tours/Zion-National-Park/Half-Day-Slot-Canyon-Canyoneering-near-East-Zion/d5610-300061P2",
    title: "The Huntress Slot Canyon Adventure",
    description:
      "Rappel and canyoneer through Huntress Slot Canyon on a half-day East Zion adventure near Moqui Cave. Certified guides lead a hike-in approach, introductory rappel training, and multiple drops through the narrow sandstone corridor. Technical gear including harness, helmet, and rappel devices is provided with instruction for beginners. This small-group outing explores a slot canyon outside the main park shuttle routes.",
    duration: "5 hours (approx.)",
    priceFrom: 179,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/ef/4b/41.jpg",
    rating: 4.9,
    reviewCount: 95,
    highlights: ["Huntress Slot Canyon canyoneering adventure","Introductory rappel training included","Multiple rappels through narrow sandstone","Small-group format with certified guides","Half-day East Zion departure near Moqui Cave"],
    startDescription:
      "Meet at the Moqui Cave/US-89 staging area near Kanab, UT. Confirm exact coordinates when booking.",
    endDescription:
      "Return to the Moqui Cave meeting point after the final rappel and hike out.",
    itineraryItems: [
      {
        title: "Moqui Cave",
        description:
          "Meet guides and gear up near the US-89 staging area.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Huntress Canyon",
        description:
          "Hike into the canyon approach through desert scrub terrain.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Intro Rappel",
        description:
          "Practice rappel on a short drop with guide instruction.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Main Slot Canyon",
        description:
          "Series of rappels through the Huntress slot corridor.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Hike Out",
        description:
          "Return hike to the staging area after the final drop.",
        duration: "30 minutes",
        stopType: "stop",
      }
    ],
    inclusions: ["Certified canyoneering guide","Rappel and canyoneering gear","Helmet and harness","Trail snacks"],
    categories: ["Canyoneering","Hiking Tours","Small Group Tours"],
  },
  {
    productCode: "163873P9",
    productUrl:
      "https://www.viator.com/tours/Zion-National-Park/Zion-National-Park-Canyoneering-and-Jeep-Adventure/d5610-163873P9",
    title: "East Zion Crimson Canyon Hike & UTV Adventure",
    description:
      "Combine a UTV ride through East Zion backroads with a canyoneering hike into Crimson Canyon slot formations. Guides lead off-road travel to the trailhead, then a short rock-climb and narrows section with photo stops in red sandstone corridors. This half-day adventure suits active travelers who want both motorized access and hands-on canyon exploration outside Zion Canyon. Helmets, UTV gear, and canyoneering equipment are included.",
    duration: "4 hours (approx.)",
    priceFrom: 129.91,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/e0/f5/44.jpg",
    rating: 4.9,
    reviewCount: 887,
    highlights: ["UTV off-road approach to East Zion trailheads","Crimson Canyon slot canyoneering section","Rock-climb obstacle with guide assistance","Red sandstone narrows photo stops","Half-day adventure from East Zion base"],
    startDescription:
      "Check in at the East Zion adventure base near Zion Ponderosa. Arrive 15 minutes early for UTV briefing.",
    endDescription:
      "Return to the East Zion base after the UTV ride back from Crimson Canyon.",
    itineraryItems: [
      {
        title: "East Zion",
        description:
          "UTV departure from the East Zion adventure base.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Crimson Canyon",
        description:
          "Hike into the Crimson Canyon slot entrance.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Rock Climb Section",
        description:
          "Guided scramble through a short rock obstacle.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Sandstone Narrows",
        description:
          "Photo time in narrow red sandstone corridors.",
        duration: "30 minutes",
        stopType: "stop",
      }
    ],
    inclusions: ["UTV transport","Canyoneering guide","Helmet and safety gear","Bottled water"],
    categories: ["UTV Tours","Canyoneering","Adrenaline & Extreme"],
  },
  {
    productCode: "163873P18",
    productUrl:
      "https://www.viator.com/tours/Zion-National-Park/Zion-Sunset-Jeep-Tour/d5610-163873P18",
    title: "Zion Sunset Jeep Tour",
    description:
      "Watch sunset over Zion's eastern plateau on a Jeep tour that climbs off-road routes to high viewpoints above the main canyon. Open-air Jeep transport reaches Pine Knoll and other overlooks timed for golden-hour light across sandstone domes and pine forest. The short two-hour format suits families and photographers who want a sunset experience without a full-day commitment. Departure from the East Zion area near Zion Ponderosa.",
    duration: "2 hours (approx.)",
    priceFrom: 81.48,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0c/12/32/fd.jpg",
    rating: 4.9,
    reviewCount: 261,
    highlights: ["Sunset-timed Jeep tour in East Zion","Off-road ascent to high plateau overlooks","Pine Knoll and sunset viewpoint stops","Open-air Jeep with driver-guide commentary","Two-hour format ideal for evening plans"],
    startDescription:
      "Meet at the Zion Ponderosa/East Zion Jeep staging area. Sunset departure times shift seasonally.",
    endDescription:
      "Return to the staging area after the final sunset stop.",
    itineraryItems: [
      {
        title: "Zion Ponderosa",
        description:
          "Jeep departure from the East Zion staging area.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "Off-Road Ascent",
        description:
          "Climb off-road routes through pine forest to plateau overlooks.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Pine Knoll Overlook",
        description:
          "High viewpoint stop with wide eastern Zion panoramas.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Sunset Viewpoint",
        description:
          "Final stop timed for sunset light over sandstone domes.",
        duration: "30 minutes",
        stopType: "stop",
      }
    ],
    inclusions: ["Jeep transport","Driver/guide","Bottled water","Sunset viewpoint access"],
    categories: ["Jeep Tours","Sunset Tours","4WD Tours"],
  },
  {
    productCode: "118887P1",
    productUrl:
      "https://www.viator.com/tours/Zion-National-Park/East-Zion-Slot-Canyon-Rappelling-Tour/d5610-118887P1",
    title: "Award Winning UTV Slot Canyon Tour",
    description:
      "Ride UTVs to Red Cave slot canyons on East Zion's award-winning two-hour slot canyon tour. Guides drive or lead you along off-road routes to upper and lower Red Cave narrows with time for photos in the red sandstone corridors. This compact outing delivers slot canyon access without a long hike or technical rappelling. Ideal for first-time visitors to East Zion seeking a high-review-count adventure.",
    duration: "2 hours (approx.)",
    priceFrom: 149,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/3b/25/f7.jpg",
    rating: 5,
    reviewCount: 1179,
    highlights: ["Award-winning UTV slot canyon tour","Upper and Lower Red Cave narrows","Off-road UTV approach from Orderville","Two-hour compact adventure format","Photo time in red sandstone slots"],
    startDescription:
      "Meet at the Orderville staging area on US-89. Confirm exact meeting coordinates when booking.",
    endDescription:
      "Return to the Orderville staging area after the lower canyon stop.",
    itineraryItems: [
      {
        title: "Orderville Staging",
        description:
          "Check in and UTV safety briefing at the Orderville base.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "UTV Route",
        description:
          "Off-road UTV travel to the slot canyon trailhead.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Upper Red Cave Slot Canyon",
        description:
          "Walk through the upper Red Cave narrows section.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Lower Red Cave Slot Canyon",
        description:
          "Continue to the lower slot section for photos.",
        duration: "30 minutes",
        stopType: "stop",
      }
    ],
    inclusions: ["UTV transport","Professional guide","Helmet and goggles","Bottled water"],
    categories: ["UTV Tours","Slot Canyon Tours","Small Group Tours"],
  },
  {
    productCode: "118887P5",
    productUrl:
      "https://www.viator.com/tours/Zion-National-Park/Ultimate-UTV-Slot-Canyon-Tour/d5610-118887P5",
    title: "Great Chamber/Peekaboo Slot Canyon UTV Tour 4hrs",
    description:
      "Spend four hours exploring Peekaboo Slot Canyon, hidden caves, and the Great Chamber on a UTV tour from Moqui Cave. The route links off-road driving with short hikes through Peekaboo narrows and a final stop at the Great Chamber alcove for dramatic photo opportunities. Guides share geology and route history while pacing the group through multiple slot sections. This is the extended East Zion UTV experience for travelers wanting more than a two-hour outing.",
    duration: "4 hours (approx.)",
    priceFrom: 199,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/3b/25/b9.jpg",
    rating: 5,
    reviewCount: 352,
    highlights: ["Four-hour UTV slot canyon expedition","Peekaboo Slot Canyon and Great Chamber stops","Hidden cave and lake viewpoint en route","Moqui Cave check-in and UTV briefing","Extended photo time in red rock narrows"],
    startDescription:
      "Check in at Moqui Cave on US-89 near Kanab, UT. Arrive 15 minutes before departure.",
    endDescription:
      "Return to Moqui Cave after the Great Chamber stop.",
    itineraryItems: [
      {
        title: "Moqui Cave",
        description:
          "Check-in and four-hour tour orientation at Moqui Cave.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Cave Lakes Route",
        description:
          "UTV segment past hidden cave and lake viewpoints.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Peekaboo Slot Canyon",
        description:
          "Hike through Peekaboo narrows with guide commentary.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Hidden Cave",
        description:
          "Brief stop at a hidden cave formation along the route.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "The Great Chamber",
        description:
          "Final photo stop at the Great Chamber alcove.",
        duration: "45 minutes",
        stopType: "stop",
      }
    ],
    inclusions: ["UTV transport","Professional guide","Helmet and goggles","Bottled water"],
    categories: ["UTV Tours","Photography Tours","Off-road Tours"],
  },
  {
    productCode: "118887P2",
    productUrl:
      "https://www.viator.com/tours/Zion-National-Park/East-Zion-Experiences-4-hr-ATV-Peekaboo-Slot-Canyon-Tour/d5610-118887P2",
    title: "East Zion Slot Canyon Canyoneering UTV Tour",
    description:
      "Combine UTV off-road travel with slot canyon canyoneering on a two-and-a-half-hour East Zion adventure from Orderville. Guides lead UTV transport to the canyon entrance, then a canyoneering section through narrows with an optional cave stop before the return ride. Technical difficulty stays moderate for active travelers seeking more than a passive UTV tour. Helmets and canyoneering gear are provided.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 119,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/3b/25/f2.jpg",
    rating: 5,
    reviewCount: 258,
    highlights: ["UTV plus canyoneering combo tour","Peekaboo area slot canyon section","Off-road UTV approach from Orderville","Optional cave stop en route","Two-and-a-half-hour active format"],
    startDescription:
      "Meet at the Orderville departure point on US-89. Wear closed-toe shoes suitable for canyon walking.",
    endDescription:
      "Return to Orderville by UTV after the canyon and cave stops.",
    itineraryItems: [
      {
        title: "Orderville Departure",
        description:
          "Group meetup and gear check at the Orderville base.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "UTV Off-Road",
        description:
          "UTV travel to the slot canyon trailhead.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Slot Canyon Canyoneering",
        description:
          "Guided canyoneering through Peekaboo area narrows.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Cave Stop",
        description:
          "Optional cave photo stop before the return ride.",
        duration: "15 minutes",
        stopType: "stop",
      }
    ],
    inclusions: ["UTV transport","Canyoneering guide","Helmet and safety gear","Bottled water"],
    categories: ["UTV Tours","Canyoneering","Adventure Tours"],
  },
  {
    productCode: "275087P2",
    productUrl:
      "https://www.viator.com/tours/Zion-National-Park/Peekaboo-Slot-Canyon-Great-Chamber-Loop-ATV-Tour/d5610-275087P2",
    title: "Peekaboo Slot Canyon + Great Chamber Loop UTV YOU DRIVE",
    description:
      "Drive your own UTV on a guided loop through Peekaboo Slot Canyon and the Great Chamber near Kanab. Guides lead the convoy along off-road routes, then on-foot exploration of Peekaboo narrows and the Great Chamber alcove before the return loop. This you-drive format suits confident UTV operators who want hands-on driving with guide navigation. Half-day timing covers multiple photo stops in red rock country.",
    duration: "4 hours (approx.)",
    priceFrom: 249,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0e/10/93/0d.jpg",
    rating: 5,
    reviewCount: 106,
    highlights: ["You-drive UTV convoy with guide navigation","Peekaboo Slot Canyon on-foot exploration","Great Chamber alcove photo stop","Kanab area off-road loop route","Guided half-day adventure format"],
    startDescription:
      "Meet at the Kanab/Peekaboo trailhead staging area. Valid driver license required for UTV operation.",
    endDescription:
      "Return to the Kanab trailhead after completing the loop route.",
    itineraryItems: [
      {
        title: "Kanab Trailhead",
        description:
          "UTV briefing and convoy formation at the trailhead.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "UTV Drive Segment",
        description:
          "You-drive UTV segment along guided off-road routes.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Peekaboo Slot Canyon",
        description:
          "On-foot hike through Peekaboo narrows.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Great Chamber",
        description:
          "Photo stop at the Great Chamber alcove.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Loop Return",
        description:
          "Return UTV drive completing the loop route.",
        duration: "45 minutes",
        stopType: "stop",
      }
    ],
    inclusions: ["UTV rental and guide","Helmet and goggles","Route navigation","Bottled water"],
    categories: ["UTV Tours","Private Tours","Slot Canyon Tours"],
  },
  {
    productCode: "163873P1",
    productUrl:
      "https://www.viator.com/tours/Zion-National-Park/Half-Day-Guided-Hiking-Tours/d5610-163873P1",
    title: "East Zion Canyoneering Elkheart Canyon and UTV Tour",
    description:
      "Explore Elkheart Canyon on a half-day canyoneering and UTV tour combining off-road access with two slot canyon sections near Mount Carmel. Guides lead UTV transport to the trailhead, then short hikes through narrows with moderate scrambling and photo stops. This outing suits active travelers wanting East Zion slot canyon time without a full-day commitment. Equipment and safety briefing are included at the Mount Carmel meeting point.",
    duration: "4 hours (approx.)",
    priceFrom: 149,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/ff/4d/d9.jpg",
    rating: 4.9,
    reviewCount: 420,
    highlights: ["Elkheart Canyon canyoneering and UTV combo","Two slot canyon sections on one outing","UTV off-road approach from Mount Carmel","Moderate scrambling with guide support","Half-day East Zion adventure"],
    startDescription:
      "Meet at the Mount Carmel Junction staging area on US-89. Confirm meeting point when booking.",
    endDescription:
      "Return to Mount Carmel by UTV after the second slot canyon section.",
    itineraryItems: [
      {
        title: "Mount Carmel",
        description:
          "Meet guides and gear up at the Mount Carmel staging area.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Elkheart Canyon",
        description:
          "Hike into Elkheart Canyon slot entrance.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "UTV Off-Road",
        description:
          "UTV segment connecting canyon sections.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Second Slot Canyon",
        description:
          "Explore a second narrows section with guide assistance.",
        duration: "45 minutes",
        stopType: "stop",
      }
    ],
    inclusions: ["UTV transport","Canyoneering guide","Helmet and harness","Bottled water"],
    categories: ["UTV Tours","Canyoneering","Hiking Tours"],
  },
  {
    productCode: "118744P4",
    productUrl:
      "https://www.viator.com/tours/Zion-National-Park/The-White-Sand-Cave/d5610-118744P4",
    title: "The White Sand Cave",
    description:
      "Visit the White Sand Cave and Great Chamber on a half-day hiking tour with off-road transfer from Kanab. Guides navigate desert backroads to the trailhead, then lead a short ascent into the white sand alcove and Great Chamber for photography. This small-group outing focuses on unique photo locations outside Zion National Park boundaries. Return transfer and trail snacks are included.",
    duration: "3 to 4 hours (approx.)",
    priceFrom: 129,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0a/e6/6c/0b.jpg",
    rating: 5,
    reviewCount: 310,
    highlights: ["White Sand Cave and Great Chamber photo tour","Off-road desert approach from Kanab","Small-group guided hiking format","Great Chamber alcove photo stop","Half-day red rock country outing"],
    startDescription:
      "Meet at the Kanab meeting point confirmed at booking. Wear sturdy hiking shoes and sun protection.",
    endDescription:
      "Return transfer to Kanab after the Great Chamber photo stop.",
    itineraryItems: [
      {
        title: "Kanab Meeting Point",
        description:
          "Group meetup before off-road transfer to the trailhead.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Off-Road Approach",
        description:
          "Desert backroad transfer to the White Sand Cave trailhead.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "White Sand Cave",
        description:
          "Short ascent into the white sand alcove formation.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Great Chamber",
        description:
          "Photo stop at the Great Chamber alcove viewpoint.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Return Transfer",
        description:
          "Return drive to Kanab after the cave stops.",
        duration: "30 minutes",
        stopType: "stop",
      }
    ],
    inclusions: ["Guide and off-road transfer","Trail snacks","Bottled water","Safety briefing"],
    categories: ["Hiking Tours","Photography Tours","Small Group Tours"],
  }
];

const buildFixture = (tour: ZionTourFixture) => {
  const viatorRatings = ZION_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: "Zion National Park", state: "Utah" },
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
          question: "Where does the tour depart from at Zion National Park?",
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
  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Zion National Park",
    destinationCitySlug: "zion-national-park",
    viatorDestinationSlug: "Zion-National-Park",
    tours: ZION_TOURS,
    buildFixture,
    destinationLogLabel: "Zion",
  });
};

await main();
