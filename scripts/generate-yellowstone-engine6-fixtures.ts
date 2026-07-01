import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { YELLOWSTONE_VIATOR_PUBLIC_RATINGS } from "../src/engine6/yellowstoneViatorPublicRatings";
import { runEngine6ParagonFixtureGeneration } from "./lib/runEngine6ParagonFixtureGeneration";

type ItineraryItem = {
  title: string;
  description: string;
  duration?: string;
  stopType: "stop" | "pass-by";
};

type YellowstoneTourFixture = {
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

const YELLOWSTONE_TOURS: YellowstoneTourFixture[] = [
  {
    productCode: "52661P41",
    productUrl:
      "https://www.viator.com/tours/Yellowstone-National-Park/The-Full-Yellowstone-Two-Day-experience-From-West-Yellowstone/d22411-52661P41",
    title: "The Full Two Day Private Yellowstone Day Trips West Yellowstone",
    description:
      "Cover both the upper and lower loops of Yellowstone across two private days with a dedicated guide who paces wildlife stops and geyser basins to your interests. Day one focuses on Lamar Valley and Mammoth Hot Springs while day two hits Old Faithful, Grand Prismatic Spring, and the Grand Canyon of the Yellowstone.",
    duration: "2 days (approx.)",
    priceFrom: 2399,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/d9/ee/1d.jpg",
    rating: 0,
    reviewCount: 0,
    highlights: [
      "Private two-day upper and lower loop Yellowstone itinerary",
      "Wildlife viewing in Lamar Valley and Hayden Valley",
      "Old Faithful and Grand Prismatic Spring geyser stops",
      "Grand Canyon of the Yellowstone and Artist Point overlooks",
      "Flexible pacing for photography and family-friendly hikes",
    ],
    startDescription:
      "Meet at the Cody Wyoming Adventures staging area in West Yellowstone, MT 59758. Your guide confirms pickup time and daily loop priorities before departure.",
    endDescription:
      "Return to West Yellowstone after the second-day lower loop completes at Old Faithful and canyon viewpoints.",
    itineraryItems: [
      {
        title: "Lamar Valley",
        description:
          "Day one begins in Lamar Valley scanning for bison, elk, and wolf activity along the river corridor.",
        duration: "3 hours",
        stopType: "stop",
      },
      {
        title: "Mammoth Hot Springs",
        description:
          "Walk the travertine terraces at Mammoth Hot Springs on the park's northern edge.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Norris Geyser Basin",
        description:
          "Explore Norris Geyser Basin, Yellowstone's hottest and most changeable thermal area.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Old Faithful",
        description:
          "Day two reaches Upper Geyser Basin for an Old Faithful eruption and boardwalk time.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Prismatic Spring",
        description:
          "View the rainbow-colored Grand Prismatic Spring from the Midway Geyser Basin boardwalk.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Canyon of the Yellowstone",
        description:
          "Finish at Artist Point overlooking the yellow canyon walls and Lower Falls.",
        duration: "1 hour",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private professional guide",
      "Air-conditioned vehicle",
      "Park entrance fees",
      "Bottled water and snacks",
    ],
    categories: ["Multi-day Tours", "Private Tours", "Wildlife Tours"],
  },
  {
    productCode: "5639875P7",
    productUrl:
      "https://www.viator.com/tours/Yellowstone-National-Park/Seven-Day-Guided-Trek-to-Yellowstones-Thorofare-Ranger-Station/d22411-5639875P7",
    title: "Seven Days Guided Trek to Yellowstone Thorofare Ranger Station",
    description:
      "Trek deep into Yellowstone's Thorofare backcountry on a seven-day guided backpacking route to the remote ranger station southeast of Yellowstone Lake. Certified wilderness guides handle permits, camp meals, and bear-safe food storage while you hike through Hayden Valley approaches and lake-country meadows.",
    duration: "7 days (approx.)",
    priceFrom: 2550,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/32/df/71/b2/caption.jpg",
    rating: 0,
    reviewCount: 0,
    highlights: [
      "Seven-day guided backpacking trek to Thorofare Ranger Station",
      "Remote Yellowstone Lake and Thorofare country wilderness",
      "Certified guide with backcountry permits and camp meals",
      "Wildlife corridors through Hayden Valley approaches",
      "Intermediate backpacking fitness recommended",
    ],
    startDescription:
      "Meet your guide at the trailhead briefing location near Yellowstone Lake, WY 82190. Gear check and permit review occur the morning of day one.",
    endDescription:
      "Return shuttle from the Thorofare trailhead back to the Yellowstone Lake area after the final camp night.",
    itineraryItems: [
      {
        title: "Yellowstone Lake",
        description:
          "Begin the approach along Yellowstone Lake's southeastern shore toward backcountry trailheads.",
        duration: "1 day",
        stopType: "stop",
      },
      {
        title: "Hayden Valley",
        description:
          "Cross Hayden Valley approaches with wildlife awareness briefings from your guide.",
        stopType: "pass-by",
      },
      {
        title: "Thorofare Ranger Station",
        description:
          "Reach the remote Thorofare Ranger Station camp on the park's southeastern boundary.",
        duration: "2 days",
        stopType: "stop",
      },
      {
        title: "Grand Canyon of the Yellowstone",
        description:
          "Optional pre- or post-trek rim viewpoint stop at the Grand Canyon of the Yellowstone.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Professional wilderness guide",
      "Backcountry permits",
      "Camping meals and shared gear",
      "Bear-safe food storage equipment",
    ],
    categories: ["Multi-day Tours", "Hiking", "Backpacking"],
  },
  {
    productCode: "52661P40",
    productUrl:
      "https://www.viator.com/tours/Yellowstone-National-Park/The-Full-Yellowstone-2-day-Experience-Upper-and-Lower-package/d22411-52661P40",
    title: "Yellowstone 2-Step 2 of Days Of Upper/Lower Loop West Yellowstone",
    description:
      "Join a small group of up to fourteen for a two-day sweep of Yellowstone's upper and lower loops from West Yellowstone. The same route as the private version covers Lamar Valley wildlife, Mammoth Hot Springs terraces, Old Faithful, Grand Prismatic Spring, and canyon overlooks at a shared per-person rate.",
    duration: "2 days (approx.)",
    priceFrom: 424.15,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/2f/25/0c/7d/caption.jpg",
    rating: 4.1,
    reviewCount: 8,
    highlights: [
      "Two-day small-group upper and lower loop tour",
      "Maximum fourteen guests with professional guide",
      "Lamar Valley and Hayden Valley wildlife stops",
      "Old Faithful and Grand Prismatic Spring boardwalks",
      "Grand Canyon of the Yellowstone rim viewpoints",
    ],
    startDescription:
      "Morning pickup from West Yellowstone hotels and the visitor center area. Confirm your pickup window when booking.",
    endDescription:
      "Return to West Yellowstone after the day-two lower loop and Old Faithful stop.",
    itineraryItems: [
      {
        title: "Lamar Valley",
        description:
          "Day one wildlife drive through Lamar Valley with stops for bison herds and predator habitat.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Mammoth Hot Springs",
        description:
          "Walk the Mammoth Hot Springs travertine terraces and historic fort area.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Old Faithful",
        description:
          "Day two geyser basin stop timed for an Old Faithful eruption.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Grand Prismatic Spring",
        description:
          "Boardwalk visit to Grand Prismatic Spring in Midway Geyser Basin.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Canyon of the Yellowstone",
        description:
          "Rim stop at Artist Point for views of the yellow canyon and Lower Falls.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "Small-group transport",
      "Park entrance fees",
      "Bottled water",
    ],
    categories: ["Multi-day Tours", "Small Group Tours", "Sightseeing Tours"],
  },
  {
    productCode: "151830P1",
    productUrl:
      "https://www.viator.com/tours/West-Yellowstone/Private-Tours-of-Yellowstone-National-Park-Gourmet-picnic-lunch-included/d50636-151830P1",
    title: "Private Yellowstone Tour: ICONIC Sites, Wildlife, Family Friendly Hikes + lunch",
    description:
      "Yellowstone Adventure Tours leads your private party on a full-day route through the park's signature sights with gourmet picnic lunch included. The guide tailors wildlife scanning in Hayden Valley, geyser stops at Old Faithful and Grand Prismatic Spring, and short family-friendly hikes near canyon overlooks.",
    duration: "7 to 9 hours (approx.)",
    priceFrom: 2200,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/2f/2d/70/92/caption.jpg",
    rating: 5,
    reviewCount: 842,
    highlights: [
      "Top-reviewed private Yellowstone day tour with 842 traveler reviews",
      "Gourmet picnic lunch at a scenic park location",
      "Old Faithful, Grand Prismatic Spring, and canyon overlooks",
      "Family-friendly hikes matched to group ability",
      "Wildlife viewing in Hayden Valley with spotting scope",
    ],
    startDescription:
      "Private pickup from West Yellowstone hotels or a coordinated meeting point at the West Yellowstone visitor area, MT 59758.",
    endDescription:
      "Return to your West Yellowstone pickup location after the final canyon or geyser stop.",
    itineraryItems: [
      {
        title: "Hayden Valley",
        description:
          "Morning wildlife drive through Hayden Valley scanning for bison, elk, and bear activity.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Old Faithful",
        description:
          "Upper Geyser Basin boardwalk time centered on an Old Faithful eruption.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Prismatic Spring",
        description:
          "Midway Geyser Basin stop at Grand Prismatic Spring's colorful runoff channels.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Canyon of the Yellowstone",
        description:
          "Short hike and rim time at Artist Point above the Lower Falls.",
        duration: "1 hour",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private professional guide",
      "Gourmet picnic lunch",
      "Spotting scope and binoculars",
      "Park entrance fees",
    ],
    categories: ["Private Sightseeing Tours", "Full-day Tours", "Wildlife Tours"],
  },
  {
    productCode: "151830P3",
    productUrl:
      "https://www.viator.com/tours/Yellowstone-National-Park/Evening-Wildlife-Tour/d22411-151830P3",
    title: "Private Yellowstone Wolf Watching & Wildlife Safari + lunch",
    description:
      "An evening-focused private safari targets wolf and predator activity in Lamar Valley and Hayden Valley with a provided lunch. Your guide uses spotting scopes at known wildlife corridors and adjusts routing for recent park sightings of bears, bison, and elk herds.",
    duration: "6 to 9 hours (approx.)",
    priceFrom: 1999,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/2f/19/f3/10/caption.jpg",
    rating: 5,
    reviewCount: 100,
    highlights: [
      "Private wolf-watching and wildlife safari",
      "Lamar Valley and Hayden Valley predator corridors",
      "Spotting scopes and binoculars provided",
      "Included picnic lunch in the park",
      "Flexible evening timing for active wildlife hours",
    ],
    startDescription:
      "Early pickup from West Yellowstone area lodgings for dawn wildlife runs in Lamar Valley, WY.",
    endDescription:
      "Return to West Yellowstone after dusk wildlife viewing in Hayden Valley or Norris Geyser Basin.",
    itineraryItems: [
      {
        title: "Lamar Valley",
        description:
          "Dawn and dusk drives through Lamar Valley for wolf, bear, and bison sightings.",
        duration: "3 hours",
        stopType: "stop",
      },
      {
        title: "Hayden Valley",
        description:
          "Midday and evening scanning in Hayden Valley's open meadows and river bends.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Mammoth Hot Springs",
        description:
          "Optional thermal-area stop at Mammoth Hot Springs between wildlife sessions.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Norris Geyser Basin",
        description:
          "Brief boardwalk stop at Norris Geyser Basin when routing allows.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Private wildlife guide",
      "Picnic lunch",
      "Spotting scope and binoculars",
      "Park entrance fees",
    ],
    categories: ["Private Tours", "Wildlife Tours", "Safaris"],
  },
  {
    productCode: "151830P8",
    productUrl:
      "https://www.viator.com/tours/Yellowstone-National-Park/PRIVATE-YELLOWSTONE-Hiking-Hot-Spring-and-Geyser-tour-Picnic-lunch-included/d22411-151830P8",
    title: "Private Hidden Gems of Yellowstone! Lunch w/ family friendly hikes included!",
    description:
      "Discover lesser-known trails and thermal features on a private hiking-focused day with picnic lunch included. Routes combine short family-friendly walks near Norris Geyser Basin and Grand Prismatic Spring with canyon rim time at the Grand Canyon of the Yellowstone away from the busiest pullouts.",
    duration: "7 to 9 hours (approx.)",
    priceFrom: 1999,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/2f/19/ec/97/caption.jpg",
    rating: 5,
    reviewCount: 23,
    highlights: [
      "Private hiking tour of Yellowstone hidden gems",
      "Family-friendly trail sections with guide pacing",
      "Norris Geyser Basin and Grand Prismatic Spring stops",
      "Picnic lunch at a scenic park location",
      "Grand Canyon of the Yellowstone rim hike time",
    ],
    startDescription:
      "Pickup from West Yellowstone hotels. Wear sturdy shoes and bring layers for changing park weather.",
    endDescription:
      "Return to West Yellowstone after the final canyon or geyser basin hike.",
    itineraryItems: [
      {
        title: "Norris Geyser Basin",
        description:
          "Morning boardwalk loop through Norris Geyser Basin's steaming pools and geysers.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Grand Prismatic Spring",
        description:
          "Midday stop at Grand Prismatic Spring with optional overlook hike when open.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Old Faithful",
        description:
          "Upper Geyser Basin visit timed around an Old Faithful eruption.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Grand Canyon of the Yellowstone",
        description:
          "Afternoon rim hike along the Grand Canyon of the Yellowstone viewpoints.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private hiking guide",
      "Picnic lunch",
      "Trail snacks and water",
      "Park entrance fees",
    ],
    categories: ["Private Tours", "Hiking Tours", "Full-day Tours"],
  },
  {
    productCode: "316119P3",
    productUrl:
      "https://www.viator.com/tours/Yellowstone-National-Park/Yellowstone-Lower-Loop-Private-Tour-for-10/d22411-316119P3",
    title: "Best in the West Yellowstone Private Tour",
    description:
      "CoveredGround Tours runs a twelve-hour private lower loop for groups up to ten with hotel pickup from West Yellowstone. The long day covers Old Faithful, Grand Prismatic Spring, Hayden Valley wildlife, and Grand Canyon of the Yellowstone overlooks with a provided lunch stop.",
    duration: "12 hours (approx.)",
    priceFrom: 1999,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/2f/1b/82/b3/caption.jpg",
    rating: 5,
    reviewCount: 10,
    highlights: [
      "Twelve-hour private lower loop for up to ten guests",
      "Old Faithful and Grand Prismatic Spring geyser stops",
      "Hayden Valley wildlife viewing with spotting scope",
      "Grand Canyon of the Yellowstone and Artist Point",
      "Hotel pickup from West Yellowstone lodgings",
    ],
    startDescription:
      "Morning pickup from West Yellowstone hotels and RV parks. Depart around 7:00 AM for the full lower loop.",
    endDescription:
      "Return to your West Yellowstone hotel after Artist Point and final geyser basin stops.",
    itineraryItems: [
      {
        title: "Hayden Valley",
        description:
          "Wildlife drive through Hayden Valley with bison and elk scanning.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Old Faithful",
        description:
          "Upper Geyser Basin boardwalk and Old Faithful eruption viewing.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Prismatic Spring",
        description:
          "Midway Geyser Basin boardwalk at Grand Prismatic Spring.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Canyon of the Yellowstone",
        description:
          "Artist Point overlook above the yellow canyon walls and Lower Falls.",
        duration: "1 hour",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private guide",
      "Air-conditioned van",
      "Lunch",
      "Binoculars and spotting scope",
      "Park entrance fees",
    ],
    categories: ["Private Sightseeing Tours", "Full-day Tours", "Bus Tours"],
  },
  {
    productCode: "5591554P17",
    productUrl:
      "https://www.viator.com/tours/West-Yellowstone/Yellowstone-Lower-Loop-Tour/d50636-5591554P17",
    title: "Private Tour of Yellowstone Lower Loop",
    description:
      "A private seven- to eight-hour lower loop from West Yellowstone hits the park's southern highlights without the crowds of large coaches. Your guide sequences Old Faithful, Grand Prismatic Spring, Hayden Valley, and canyon rim stops for photography and wildlife viewing at a comfortable pace.",
    duration: "7 to 8 hours (approx.)",
    priceFrom: 1415,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/31/32/1c/b2/caption.jpg",
    rating: 5,
    reviewCount: 3,
    highlights: [
      "Private lower loop tour from West Yellowstone",
      "Old Faithful and Grand Prismatic Spring boardwalks",
      "Hayden Valley wildlife scanning",
      "Grand Canyon of the Yellowstone rim stops",
      "Flexible photo time at each viewpoint",
    ],
    startDescription:
      "Pickup from West Yellowstone area hotels. Confirm your party size when booking the private vehicle.",
    endDescription:
      "Return to West Yellowstone after the canyon and geyser basin loop completes.",
    itineraryItems: [
      {
        title: "Old Faithful",
        description:
          "Upper Geyser Basin visit centered on an Old Faithful eruption.",
        duration: "1 hour 15 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Prismatic Spring",
        description:
          "Boardwalk time at Grand Prismatic Spring in Midway Geyser Basin.",
        duration: "40 minutes",
        stopType: "stop",
      },
      {
        title: "Hayden Valley",
        description:
          "Wildlife stop in Hayden Valley meadows along the Yellowstone River.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Canyon of the Yellowstone",
        description:
          "Rim viewpoints along the Grand Canyon of the Yellowstone including Artist Point.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private guide and vehicle",
      "Bottled water",
      "Park entrance fees",
      "Hotel pickup in West Yellowstone",
    ],
    categories: ["Private Sightseeing Tours", "Full-day Tours", "Sightseeing Tours"],
  },
  {
    productCode: "5591554P23",
    productUrl:
      "https://www.viator.com/tours/West-Yellowstone/Private-Yellowstone-Wildlife-Tour-in-the-American-Serengeti/d50636-5591554P23",
    title: "Private Yellowstone Wildlife Tour in the American Serengeti",
    description:
      "Explore Yellowstone's Lamar Valley and Hayden Valley on a private wildlife tour nicknamed the American Serengeti. Your guide uses spotting scopes at dawn-active corridors and routes through Mammoth Hot Springs and Norris Geyser Basin when wildlife activity slows midday.",
    duration: "7 to 8 hours (approx.)",
    priceFrom: 1295,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/33/1b/8b/d7/caption.jpg",
    rating: 5,
    reviewCount: 14,
    highlights: [
      "Private wildlife safari in Lamar and Hayden valleys",
      "Spotting scopes for wolf and bear viewing",
      "Mammoth Hot Springs thermal terrace stop",
      "Norris Geyser Basin boardwalk when routing allows",
      "Expert guide with recent park sighting intel",
    ],
    startDescription:
      "Early morning pickup from West Yellowstone hotels for Lamar Valley wildlife runs.",
    endDescription:
      "Return to West Yellowstone after afternoon wildlife scanning in Hayden Valley.",
    itineraryItems: [
      {
        title: "Lamar Valley",
        description:
          "Primary wildlife drive through Lamar Valley's open meadows and river bends.",
        duration: "2 hours 30 minutes",
        stopType: "stop",
      },
      {
        title: "Hayden Valley",
        description:
          "Afternoon bison and elk viewing in Hayden Valley grasslands.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Mammoth Hot Springs",
        description:
          "Thermal terrace walk at Mammoth Hot Springs between wildlife sessions.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Norris Geyser Basin",
        description:
          "Optional Norris Geyser Basin boardwalk when wildlife activity is quiet.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Private wildlife guide",
      "Spotting scope and binoculars",
      "Bottled water",
      "Park entrance fees",
    ],
    categories: ["Private Tours", "Wildlife Tours", "Safaris"],
  },
  {
    productCode: "137381P3",
    productUrl:
      "https://www.viator.com/tours/Idaho/Private-Yellowstone-Wildlife-Tour/d22215-137381P3",
    title: "Private Yellowstone Wildlife Sightseeing Tour",
    description:
      "A full-day private wildlife sightseeing route covers Lamar Valley, Hayden Valley, and Mammoth Hot Springs with flexible pickup from West Yellowstone or park gates. The guide focuses on bear, wolf, and bison behavior with interpretive commentary and spotting scopes at each wildlife corridor.",
    duration: "7 to 9 hours (approx.)",
    priceFrom: 1200,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/2f/1d/1f/88/caption.jpg",
    rating: 5,
    reviewCount: 103,
    highlights: [
      "Private full-day Yellowstone wildlife sightseeing",
      "Lamar Valley and Hayden Valley predator corridors",
      "Mammoth Hot Springs terrace visit included",
      "Spotting scopes and binoculars on every stop",
      "Flexible pickup from West Yellowstone area",
    ],
    startDescription:
      "Pickup from West Yellowstone hotels or coordinated park gate meeting point. Early starts recommended for Lamar Valley wildlife.",
    endDescription:
      "Return to your pickup location after the final Hayden Valley or canyon wildlife stop.",
    itineraryItems: [
      {
        title: "Lamar Valley",
        description:
          "Morning wildlife drive through Lamar Valley scanning for wolves and grizzly bears.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Hayden Valley",
        description:
          "Midday and afternoon bison herds and raptor viewing in Hayden Valley.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Mammoth Hot Springs",
        description:
          "Walk the Mammoth Hot Springs travertine terraces and elk lawn area.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Canyon of the Yellowstone",
        description:
          "Optional rim stop at the Grand Canyon of the Yellowstone when time allows.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Private naturalist guide",
      "Spotting scope and binoculars",
      "Bottled water and snacks",
      "Park entrance fees",
    ],
    categories: ["Private Tours", "Wildlife Tours", "Safaris"],
  },
  {
    productCode: "481298P1",
    productUrl:
      "https://www.viator.com/tours/Yellowstone-National-Park/Yellowstone-National-Park-Private-Wildlife-Tour/d22411-481298P1",
    title: "Yellowstone National Park Private Wildlife Tour",
    description:
      "Spend eight hours on a private wildlife tour through Lamar Valley, Hayden Valley, and Norris Geyser Basin with a naturalist guide. The route prioritizes bear and wolf habitat along river corridors and includes thermal boardwalk time when wildlife activity quiets in midday heat.",
    duration: "8 hours (approx.)",
    priceFrom: 1000,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/2f/8a/01/12/caption.jpg",
    rating: 5,
    reviewCount: 89,
    highlights: [
      "Eight-hour private Yellowstone wildlife tour",
      "Lamar Valley dawn wildlife corridor",
      "Hayden Valley bison and elk meadows",
      "Norris Geyser Basin thermal boardwalk stop",
      "Naturalist guide with spotting equipment",
    ],
    startDescription:
      "Pickup from West Yellowstone or Gardiner area lodgings. Confirm your preferred gate when booking.",
    endDescription:
      "Return to your original pickup point after the Norris Geyser Basin or Hayden Valley final stop.",
    itineraryItems: [
      {
        title: "Lamar Valley",
        description:
          "Early wildlife scanning in Lamar Valley for wolves, bears, and bison herds.",
        duration: "2 hours 30 minutes",
        stopType: "stop",
      },
      {
        title: "Hayden Valley",
        description:
          "Open meadow wildlife viewing in Hayden Valley along the Yellowstone River.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Mammoth Hot Springs",
        description:
          "Travertine terrace walk at Mammoth Hot Springs when routing from the north.",
        stopType: "pass-by",
      },
      {
        title: "Norris Geyser Basin",
        description:
          "Boardwalk loop through Norris Geyser Basin's hottest thermal features.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private naturalist guide",
      "Spotting scope",
      "Bottled water",
      "Park entrance fees",
    ],
    categories: ["Private Tours", "Wildlife Tours", "Safaris"],
  },
  {
    productCode: "265766P66",
    productUrl:
      "https://www.viator.com/tours/Yellowstone-National-Park/Yellowstone-Full-Day-Private-Tour-and-Hike-from-Inside-the-Park/d22411-265766P66",
    title: "Yellowstone Full Day Private Tour & Hike - from Inside the Park",
    description:
      "Guests staying inside Yellowstone meet a private guide for a six- to eight-hour tour combining scenic drives and guided hikes. The route covers Old Faithful, Grand Prismatic Spring overlooks, and rim trails at the Grand Canyon of the Yellowstone tailored to your group's fitness level.",
    duration: "6 to 8 hours (approx.)",
    priceFrom: 951,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/31/fc/53/15/caption.jpg",
    rating: 5,
    reviewCount: 4,
    highlights: [
      "Private tour and hike for guests staying inside the park",
      "Old Faithful and Grand Prismatic Spring stops",
      "Guided rim hike at Grand Canyon of the Yellowstone",
      "Trail choice matched to group fitness",
      "Certified guide with safety equipment",
    ],
    startDescription:
      "Meet your guide at your in-park lodge or campground near Old Faithful or Canyon Village. Confirm meeting point when booking.",
    endDescription:
      "Return to your in-park lodging after the guided hike and final geyser basin stop.",
    itineraryItems: [
      {
        title: "Old Faithful",
        description:
          "Morning Upper Geyser Basin boardwalk and Old Faithful eruption viewing.",
        duration: "1 hour 15 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Prismatic Spring",
        description:
          "Midday stop at Grand Prismatic Spring with optional overlook hike.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Grand Canyon of the Yellowstone",
        description:
          "Guided rim hike along the Grand Canyon of the Yellowstone to Artist Point.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Artist Point",
        description:
          "Photo time at Artist Point above the Lower Falls plunge.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private certified hiking guide",
      "Trail snacks and water",
      "Safety equipment",
      "Park entrance fees when applicable",
    ],
    categories: ["Private Tours", "Hiking Tours", "Full-day Tours"],
  },
  {
    productCode: "463268P4",
    productUrl:
      "https://www.viator.com/tours/Yellowstone-National-Park/Yellowstone-Winter-Photo-Safari-Wildlife-and-Landscape-Adventure/d22411-463268P4",
    title: "Private, Bespoke Yellowstone Winter Wildlife Photo Safaris",
    description:
      "A bespoke eight-hour winter photo safari targets Lamar Valley wolves and steam-shrouded thermal features at Mammoth Hot Springs and Norris Geyser Basin. Your photographer guide adjusts routing for light conditions and provides coaching at Old Faithful when the geyser erupts through winter ice.",
    duration: "8 hours (approx.)",
    priceFrom: 1520,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/32/14/4e/77/caption.jpg",
    rating: 0,
    reviewCount: 0,
    highlights: [
      "Private winter wildlife and landscape photo safari",
      "Lamar Valley wolf and bison photography",
      "Steam and ice compositions at Mammoth Hot Springs",
      "Norris Geyser Basin winter boardwalk access",
      "Photographer guide with local light routing",
    ],
    startDescription:
      "Meet your photographer guide at the Mammoth Hot Springs or Gardiner winter meeting point. Dress in layered cold-weather gear.",
    endDescription:
      "Return to the Mammoth Hot Springs area after the final Lamar Valley golden-hour session.",
    itineraryItems: [
      {
        title: "Lamar Valley",
        description:
          "Primary winter wildlife photography in Lamar Valley's snow-covered meadows.",
        duration: "3 hours",
        stopType: "stop",
      },
      {
        title: "Mammoth Hot Springs",
        description:
          "Steam-and-travertine compositions at Mammoth Hot Springs terraces.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Norris Geyser Basin",
        description:
          "Winter boardwalk photography at Norris Geyser Basin thermal pools.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Old Faithful",
        description:
          "Old Faithful winter eruption photography when road access is open.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Professional photographer guide",
      "Private transport with winter tires",
      "Hot beverages",
      "Park entrance fees",
    ],
    categories: ["Photography Tours", "Private Tours", "Wildlife Tours"],
  },
  {
    productCode: "463268P1",
    productUrl:
      "https://www.viator.com/tours/Yellowstone-National-Park/Private-Custom-Photo-Tours-of-Yellowstone-National-Park/d22411-463268P1",
    title: "Private, Bespoke Yellowstone Summer Wildlife Photo Safaris",
    description:
      "Custom summer photo safaris route through Lamar Valley, Hayden Valley, and canyon overlooks with a photographer guide who coaches composition and exposure settings. The eight- to ten-hour day flexes between wildlife telephoto opportunities and landscape shots at Grand Prismatic Spring and the Grand Canyon of the Yellowstone.",
    duration: "8 to 10 hours (approx.)",
    priceFrom: 1055,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/2f/1b/87/4e/caption.jpg",
    rating: 5,
    reviewCount: 8,
    highlights: [
      "Bespoke summer wildlife and landscape photo safari",
      "Lamar Valley and Hayden Valley wildlife photography",
      "Grand Prismatic Spring color and steam compositions",
      "Grand Canyon of the Yellowstone rim landscapes",
      "Photographer guide with custom routing",
    ],
    startDescription:
      "Pickup from West Yellowstone or Gardiner area hotels before dawn for Lamar Valley light.",
    endDescription:
      "Return to your pickup location after the final canyon or geyser basin photo stop.",
    itineraryItems: [
      {
        title: "Lamar Valley",
        description:
          "Dawn wildlife photography in Lamar Valley with telephoto coaching.",
        duration: "2 hours 30 minutes",
        stopType: "stop",
      },
      {
        title: "Hayden Valley",
        description:
          "Midday bison and raptor photography in Hayden Valley meadows.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Prismatic Spring",
        description:
          "Midway Geyser Basin compositions at Grand Prismatic Spring.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Grand Canyon of the Yellowstone",
        description:
          "Afternoon rim landscapes at the Grand Canyon of the Yellowstone.",
        duration: "1 hour",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional photographer guide",
      "Private vehicle",
      "Bottled water",
      "Park entrance fees",
    ],
    categories: ["Photography Tours", "Private Tours", "Wildlife Tours"],
  },
  {
    productCode: "52661P26",
    productUrl:
      "https://www.viator.com/tours/Yellowstone-National-Park/Private-Luxury-Yellowstone-Tour-by-Transit/d22411-52661P26",
    title: "Private Yellowstone Wildlife and Photo from West Yellowstone",
    description:
      "Travel in a private luxury transit van from West Yellowstone on an eight- to ten-hour wildlife and photography route. Lamar Valley and Hayden Valley wildlife stops pair with geyser basin time at Old Faithful and Grand Prismatic Spring for guests who want comfort and flexible photo pacing.",
    duration: "8 to 10 hours (approx.)",
    priceFrom: 1399,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/2f/25/0c/19/caption.jpg",
    rating: 4.5,
    reviewCount: 23,
    highlights: [
      "Private luxury transit van from West Yellowstone",
      "Lamar Valley and Hayden Valley wildlife viewing",
      "Old Faithful and Grand Prismatic Spring stops",
      "Flexible photography time at each viewpoint",
      "Professional guide with spotting scope",
    ],
    startDescription:
      "Pickup from West Yellowstone hotels in the private luxury transit van. Confirm party size when booking.",
    endDescription:
      "Return to West Yellowstone after the final geyser basin and wildlife stops.",
    itineraryItems: [
      {
        title: "Lamar Valley",
        description:
          "Morning wildlife drive through Lamar Valley with luxury van comfort stops.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Hayden Valley",
        description:
          "Midday bison and elk viewing in Hayden Valley open meadows.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Old Faithful",
        description:
          "Upper Geyser Basin and Old Faithful eruption viewing.",
        duration: "1 hour 15 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Prismatic Spring",
        description:
          "Boardwalk and overlook time at Grand Prismatic Spring.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private luxury transit van",
      "Professional guide",
      "Spotting scope",
      "Bottled water and snacks",
      "Park entrance fees",
    ],
    categories: ["Private Tours", "Photography Tours", "Wildlife Tours"],
  },
  {
    productCode: "5584219P8",
    productUrl:
      "https://www.viator.com/tours/Gardiner/Upper-Loop-Lamar-Wildlife-Safari-from-Gardiner-PRIVATE-Lunch/d50734-5584219P8",
    title: "Upper Loop Lamar Wildlife Safari from Gardiner PRIVATE Lunch",
    description:
      "Depart Gardiner on a private eight-hour upper loop safari focused on Lamar Valley wildlife with included lunch. The route covers Mammoth Hot Springs terraces, Norris Geyser Basin boardwalks, and Tower-Roosevelt meadows where bear and wolf activity peaks in morning and evening hours.",
    duration: "8 hours (approx.)",
    priceFrom: 450,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/30/ee/fd/81/caption.jpg",
    rating: 5,
    reviewCount: 1,
    highlights: [
      "Private upper loop safari from Gardiner, MT",
      "Lamar Valley wolf and bear wildlife focus",
      "Included lunch in the park",
      "Mammoth Hot Springs terrace walk",
      "Norris Geyser Basin thermal boardwalk",
    ],
    startDescription:
      "Pickup from Gardiner, MT hotels near the North Entrance. Early departure recommended for Lamar Valley wildlife.",
    endDescription:
      "Return to Gardiner after the final Lamar Valley wildlife session and Norris Geyser Basin stop.",
    itineraryItems: [
      {
        title: "Lamar Valley",
        description:
          "Primary wildlife safari through Lamar Valley's predator corridors.",
        duration: "3 hours",
        stopType: "stop",
      },
      {
        title: "Mammoth Hot Springs",
        description:
          "Travertine terrace walk at Mammoth Hot Springs near Gardiner.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Norris Geyser Basin",
        description:
          "Boardwalk loop at Norris Geyser Basin between wildlife sessions.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Tower-Roosevelt",
        description:
          "Meadow and river wildlife scanning near Tower-Roosevelt junction.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private wildlife guide",
      "Lunch",
      "Spotting scope",
      "Park entrance fees",
      "Gardiner hotel pickup",
    ],
    categories: ["Private Tours", "Wildlife Tours", "Safaris"],
  },
  {
    productCode: "23667P10",
    productUrl:
      "https://www.viator.com/tours/West-Yellowstone/Lamar-Valley-Wildlife-Van-Tour-from-West-Yellowstone-Upper-Loop-Tour/d50636-23667P10",
    title: "Upper Loop Tour and Lamar Valley from West Yellowstone with Lunch",
    description:
      "Yellowstone Guidelines leads an eight-hour upper loop van tour from West Yellowstone through Lamar Valley with included lunch. Stops include Mammoth Hot Springs, Norris Geyser Basin, and Tower-Roosevelt wildlife meadows where bison herds and predators are commonly spotted.",
    duration: "8 hours (approx.)",
    priceFrom: 312,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/2f/2d/55/ab/caption.jpg",
    rating: 4.8,
    reviewCount: 177,
    highlights: [
      "Eight-hour upper loop van tour from West Yellowstone",
      "Lamar Valley wildlife viewing with guide commentary",
      "Mammoth Hot Springs and Norris Geyser Basin stops",
      "Included lunch in the park",
      "Small-group format with active hiking options",
    ],
    startDescription:
      "Morning pickup from West Yellowstone hotels. Tour departs early for Lamar Valley wildlife activity.",
    endDescription:
      "Return to West Yellowstone after the Tower-Roosevelt and Norris Geyser Basin loop.",
    itineraryItems: [
      {
        title: "Lamar Valley",
        description:
          "Wildlife drive through Lamar Valley scanning for wolves, bears, and bison.",
        duration: "2 hours 30 minutes",
        stopType: "stop",
      },
      {
        title: "Mammoth Hot Springs",
        description:
          "Boardwalk walk at Mammoth Hot Springs travertine terraces.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Norris Geyser Basin",
        description:
          "Thermal boardwalk loop at Norris Geyser Basin.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Tower-Roosevelt",
        description:
          "Wildlife stop near Tower-Roosevelt meadows and Yellowstone River.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "Van transport",
      "Lunch",
      "Park entrance fees",
      "Hotel pickup in West Yellowstone",
    ],
    categories: ["Wildlife Tours", "Full-day Tours", "Bus Tours"],
  },
  {
    productCode: "23667P2",
    productUrl:
      "https://www.viator.com/tours/Yellowstone-National-Park/Lamar-Valley-Safari-Day-Hike/d22411-23667P2",
    title: "Lamar Valley Safari Hiking Tour with Lunch",
    description:
      "Hike Lamar Valley trails on a six-hour guided safari with lunch included and wildlife awareness briefings throughout. The route combines meadow walks near Tower-Roosevelt with open-country viewing in Hayden Valley where bison herds and raptors are frequently active.",
    duration: "6 hours (approx.)",
    priceFrom: 182,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/32/a6/72/31/caption.jpg",
    rating: 4.7,
    reviewCount: 183,
    highlights: [
      "Six-hour Lamar Valley guided hiking safari",
      "Included trail lunch in the park",
      "Wildlife awareness and bear-safety briefing",
      "Tower-Roosevelt meadow trail sections",
      "Hayden Valley open-country wildlife viewing",
    ],
    startDescription:
      "Meet at the Lamar Valley trailhead meeting point coordinated after booking. Wear hiking boots and bring bear spray if you have it.",
    endDescription:
      "Return to the trailhead after the Hayden Valley wildlife stop and included lunch.",
    itineraryItems: [
      {
        title: "Lamar Valley",
        description:
          "Guided meadow hikes through Lamar Valley wildlife corridors.",
        duration: "2 hours 30 minutes",
        stopType: "stop",
      },
      {
        title: "Tower-Roosevelt",
        description:
          "Trail sections near Tower-Roosevelt with river and meadow views.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Hayden Valley",
        description:
          "Open-country wildlife viewing hike in Hayden Valley grasslands.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional hiking guide",
      "Trail lunch",
      "Bear-safety briefing",
      "Park entrance fees",
    ],
    categories: ["Hiking Tours", "Wildlife Tours", "Safaris"],
  },
  {
    productCode: "23667P3",
    productUrl:
      "https://www.viator.com/tours/West-Yellowstone/Yellowstone-Tour-Lower-Loop-Active-Van-Adventure-from-West-Yellowstone/d50636-23667P3",
    title: "Lower Loop Van Tour from West Yellowstone: Grand Prismatic and Old Faithful",
    description:
      "An active eight-hour lower loop van tour from West Yellowstone covers Old Faithful, Grand Prismatic Spring, Hayden Valley, and the Grand Canyon of the Yellowstone. Frequent short walks at each stop keep the day engaging while the guide handles park logistics and wildlife spotting.",
    duration: "8 hours (approx.)",
    priceFrom: 312,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/2f/2d/74/f5/caption.jpg",
    rating: 4.9,
    reviewCount: 412,
    highlights: [
      "Highly reviewed lower loop van tour with 412 traveler reviews",
      "Old Faithful eruption and Upper Geyser Basin boardwalk",
      "Grand Prismatic Spring and Midway Geyser Basin",
      "Hayden Valley wildlife stop",
      "Grand Canyon of the Yellowstone and Artist Point",
    ],
    startDescription:
      "Morning pickup from West Yellowstone hotels. Active walking shoes recommended for frequent short hikes.",
    endDescription:
      "Return to West Yellowstone after Artist Point and the final geyser basin stops.",
    itineraryItems: [
      {
        title: "Old Faithful",
        description:
          "Upper Geyser Basin boardwalk timed for an Old Faithful eruption.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Prismatic Spring",
        description:
          "Midway Geyser Basin boardwalk at Grand Prismatic Spring.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Hayden Valley",
        description:
          "Wildlife stop in Hayden Valley meadows along the river.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Canyon of the Yellowstone",
        description:
          "Rim walk to Artist Point above the Lower Falls.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Artist Point",
        description:
          "Photo time at Artist Point on the canyon's south rim.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "Active van transport",
      "Bottled water",
      "Park entrance fees",
      "Hotel pickup in West Yellowstone",
    ],
    categories: ["Bus Tours", "Full-day Tours", "Sightseeing Tours"],
  },
  {
    productCode: "316119P4",
    productUrl:
      "https://www.viator.com/tours/Yellowstone-National-Park/Full-Day-Guided-Yellowstone-Day-Tour/d22411-316119P4",
    title: "Full-Day Guided Yellowstone Day Tour",
    description:
      "CoveredGround Tours runs the flagship lower loop day tour from Cody with pickup at Fishing Bridge for in-park guests. The ten- to eleven-hour route includes Hayden Valley, Grand Prismatic Spring, Old Faithful, Gibbon Falls, and Grand Canyon of the Yellowstone overlooks with a provided lunch.",
    duration: "10 to 11 hours (approx.)",
    priceFrom: 269,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/2f/1a/0a/f2/caption.jpg",
    rating: 4.9,
    reviewCount: 527,
    highlights: [
      "Highest review-count guided Yellowstone day tour on Viator",
      "Lower loop highlights including Old Faithful and Grand Prismatic Spring",
      "Hayden Valley wildlife viewing",
      "Grand Canyon of the Yellowstone and Artist Point",
      "Included lunch and Cody or Fishing Bridge pickup",
    ],
    startDescription:
      "7:00 AM pickup from Cody, WY hotels or 9:00 AM meet at Fishing Bridge General Store inside Yellowstone National Park.",
    endDescription:
      "Return to Cody hotels or Fishing Bridge after the final canyon and geyser stops around 4:30 PM.",
    itineraryItems: [
      {
        title: "Hayden Valley",
        description:
          "Wildlife drive through Hayden Valley with bison and elk scanning.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Prismatic Spring",
        description:
          "Midway Geyser Basin boardwalk at Grand Prismatic Spring.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Old Faithful",
        description:
          "Upper Geyser Basin and Old Faithful eruption viewing.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Canyon of the Yellowstone",
        description:
          "Rim stops along the Grand Canyon of the Yellowstone including Artist Point.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Artist Point",
        description:
          "Photo stop at Artist Point overlooking the Lower Falls.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Wilderness interpretive guide",
      "Lunch",
      "Binoculars and spotting scope",
      "Air-conditioned vehicle",
      "Park entrance fees",
    ],
    categories: ["Full-day Tours", "Bus Tours", "Sightseeing Tours"],
  },
  {
    productCode: "23667P4",
    productUrl:
      "https://www.viator.com/tours/Yellowstone-National-Park/5-Mile-Upper-Geyser-Basin-Loop-Hike-Morning-Glory-Old-Faithful-with-Lunch/d22411-23667P4",
    title: "6-Mile Geyser Hiking Tour in Yellowstone with Lunch",
    description:
      "Hike a six-mile loop through the Upper Geyser Basin past Morning Glory Pool and Castle Geyser with Old Faithful timed near the trail's midpoint. The six-hour guided hike includes lunch and interpretive commentary on Yellowstone's geothermal plumbing and geyser eruption cycles.",
    duration: "6 hours (approx.)",
    priceFrom: 182,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/2f/1a/12/fb/caption.jpg",
    rating: 4.9,
    reviewCount: 87,
    highlights: [
      "Six-mile Upper Geyser Basin guided hike",
      "Morning Glory Pool and Castle Geyser trail sections",
      "Old Faithful eruption timed on the loop",
      "Included trail lunch",
      "Geothermal interpretive commentary from guide",
    ],
    startDescription:
      "Meet at the Old Faithful area trailhead. Wear sturdy hiking shoes and bring water for the six-mile loop.",
    endDescription:
      "Finish at the Old Faithful visitor area after completing the Upper Geyser Basin loop.",
    itineraryItems: [
      {
        title: "Upper Geyser Basin",
        description:
          "Six-mile guided loop through the Upper Geyser Basin boardwalks and trails.",
        duration: "4 hours",
        stopType: "stop",
      },
      {
        title: "Morning Glory Pool",
        description:
          "Trail stop at Morning Glory Pool's vivid blue thermal spring.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Old Faithful",
        description:
          "Timed stop for an Old Faithful eruption during the basin loop.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Prismatic Spring",
        description:
          "Optional distant view toward Grand Prismatic Spring steam plumes when routing allows.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Professional hiking guide",
      "Trail lunch",
      "Bear-safety briefing",
      "Park entrance fees",
    ],
    categories: ["Hiking Tours", "Half-day Tours", "Nature Walks"],
  },
  {
    productCode: "23667P1",
    productUrl:
      "https://www.viator.com/tours/Yellowstone-National-Park/Yellowstone-Hiking-Tour/d22411-23667P1",
    title: "Grand Canyon of the Yellowstone Rim and Loop Hike with Lunch",
    description:
      "Trek rim trails along the Grand Canyon of the Yellowstone on a six-hour guided hike with included lunch. The route visits Artist Point, Inspiration Point, and viewpoints above the Lower Falls with interpretive commentary on the canyon's hydrothermal coloring and river erosion.",
    duration: "6 hours (approx.)",
    priceFrom: 182,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/2f/19/f9/d9/caption.jpg",
    rating: 4.8,
    reviewCount: 382,
    highlights: [
      "Six-hour Grand Canyon of the Yellowstone rim hike",
      "Artist Point and Inspiration Point viewpoints",
      "Lower Falls overlook trails",
      "Included trail lunch",
      "Geology commentary on yellow canyon walls",
    ],
    startDescription:
      "Meet at the Canyon Village area trailhead near the Grand Canyon of the Yellowstone. Bring hiking boots and rain layer.",
    endDescription:
      "Return to Canyon Village after completing the rim loop and lunch stop.",
    itineraryItems: [
      {
        title: "Grand Canyon of the Yellowstone",
        description:
          "Guided rim hike along the Grand Canyon of the Yellowstone trail system.",
        duration: "3 hours",
        stopType: "stop",
      },
      {
        title: "Artist Point",
        description:
          "Primary viewpoint stop at Artist Point above the Lower Falls.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Inspiration Point",
        description:
          "North rim stop at Inspiration Point for canyon depth views.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Lower Falls",
        description:
          "Viewpoints above the Lower Falls plunge and Yellowstone River gorge.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional hiking guide",
      "Trail lunch",
      "Bear-safety briefing",
      "Park entrance fees",
    ],
    categories: ["Hiking Tours", "Half-day Tours", "Nature Walks"],
  },
  {
    productCode: "463268P2",
    productUrl:
      "https://www.viator.com/tours/Yellowstone-National-Park/Half-Day-Private-Bespoke-Photography-Tour-of-Yellowstone/d22411-463268P2",
    title: "Private Yellowstone Summer Wildlife Photo Safaris - Half Day",
    description:
      "A half-day private photo safari flexes between Lamar Valley wildlife telephoto sessions and landscape shots at Grand Prismatic Spring and Old Faithful. Your photographer guide adjusts the four- to five-hour routing for light conditions and provides hands-on coaching for exposure and composition.",
    duration: "4 to 5 hours (approx.)",
    priceFrom: 645,
    heroUrl:
      "https://media.tacdn.com/media/photo-o/2f/1b/86/79/caption.jpg",
    rating: 5,
    reviewCount: 16,
    highlights: [
      "Half-day private summer wildlife photo safari",
      "Lamar Valley or Hayden Valley wildlife focus",
      "Grand Prismatic Spring landscape compositions",
      "Old Faithful geyser eruption photography",
      "Photographer guide with custom routing",
    ],
    startDescription:
      "Pickup from West Yellowstone or Gardiner area before dawn for optimal Lamar Valley light when selected.",
    endDescription:
      "Return to your pickup location after the final geyser basin or wildlife photo stop.",
    itineraryItems: [
      {
        title: "Lamar Valley",
        description:
          "Dawn or dusk wildlife photography in Lamar Valley when routing prioritizes predators.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Hayden Valley",
        description:
          "Alternative wildlife meadow photography in Hayden Valley.",
        stopType: "pass-by",
      },
      {
        title: "Grand Prismatic Spring",
        description:
          "Midday color and steam compositions at Grand Prismatic Spring.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Old Faithful",
        description:
          "Geyser eruption photography at Old Faithful when time remains.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional photographer guide",
      "Private vehicle",
      "Bottled water",
      "Park entrance fees",
    ],
    categories: ["Photography Tours", "Private Tours", "Half-day Tours"],
  },
];

const buildFixture = (tour: YellowstoneTourFixture) => {
  const viatorRatings = YELLOWSTONE_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: "Yellowstone National Park", state: "Wyoming" },
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
          question: "Where does the tour depart from in Yellowstone National Park?",
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
    destinationLabel: "Yellowstone National Park",
    destinationCitySlug: "yellowstone-national-park",
    viatorDestinationSlug: "Yellowstone-National-Park",
    tours: YELLOWSTONE_TOURS,
    buildFixture,
    destinationLogLabel: "Yellowstone",
  });
};

await main();
