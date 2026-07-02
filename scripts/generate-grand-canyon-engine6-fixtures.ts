import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { GRAND_CANYON_VIATOR_PUBLIC_RATINGS } from "../src/engine6/grandCanyonViatorPublicRatings";
import { runEngine6ParagonFixtureGeneration } from "./lib/runEngine6ParagonFixtureGeneration";

type ItineraryItem = {
  title: string;
  description: string;
  duration?: string;
  stopType: "stop" | "pass-by";
};

type GrandCanyonTourFixture = {
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

const GRAND_CANYON_TOURS: GrandCanyonTourFixture[] = [
  {
    productCode: "5662346P1",
    productUrl:
      "https://www.viator.com/tours/Grand-Canyon-National-Park/4-Day-Grand-Canyon-Backpacking-Adventure-on-Hermit-Trail/d815-5662346P1",
    title: "4 Day Grand Canyon Backpacking Adventure on Hermit Trail",
    description:
      "Descend into the canyon on the historic Hermit Trail with a certified guide over four days of rim-to-river backpacking. Camp beside Monument Creek and Hermit Rapids, carry a lightweight shared gear load, and climb back to the South Rim with daily mileage paced for intermediate hikers.",
    duration: "4 days (approx.)",
    priceFrom: 1800,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/r/33/48/6b/a1/caption.jpg",
    rating: 5,
    reviewCount: 3,
    highlights: [
      "Four-day guided backpacking on the Hermit Trail",
      "Camp nights at Monument Creek and Hermit Rapids",
      "Certified wilderness guide with canyon route expertise",
      "Shared group camping gear and meals provided",
      "Intermediate fitness level recommended for rim-to-river mileage",
    ],
    startDescription:
      "Meet at Hermit's Rest, Grand Canyon South Rim, AZ 86023. Arrive early for gear check and trail briefing before the descent.",
    endDescription:
      "Finish at Hermit's Rest on the South Rim after the final climb out of the inner canyon.",
    itineraryItems: [
      {
        title: "Hermit Trail",
        description:
          "Begin the descent from Hermit's Rest on the rugged Hermit Trail into the Supai layer formations.",
        duration: "1 day",
        stopType: "stop",
      },
      {
        title: "Monument Creek",
        description:
          "Camp and explore the Monument Creek drainage with time to rest beside seasonal waterfalls.",
        duration: "1 day",
        stopType: "stop",
      },
      {
        title: "Hermit Rapids",
        description:
          "Reach the Colorado River at Hermit Rapids for a camp night along the inner gorge.",
        duration: "1 day",
        stopType: "stop",
      },
      {
        title: "Hermit's Rest",
        description:
          "Climb back to the South Rim trailhead at Hermit's Rest to complete the loop.",
        duration: "1 day",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional wilderness guide",
      "Camping equipment and meals",
      "Backcountry permits",
      "All fees and taxes",
    ],
    categories: ["Multi-day Tours", "Hiking", "Camping"],
  },
  {
    productCode: "5637206P8",
    productUrl:
      "https://www.viator.com/tours/Grand-Canyon-National-Park/Experience-Three-Night-Ranch-Adventure/d815-5637206P8",
    title: "Experience Three Night Ranch Adventure",
    description:
      "Stay three nights at Grand Canyon Western Ranch on the Hualapai Reservation with horseback rides, wagon rides, and evening entertainment. Lodging, ranch meals, and guided activities fill each day while the canyon rim sits a short drive away for optional add-on excursions.",
    duration: "4 days (approx.)",
    priceFrom: 1143,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/r/32/80/e2/60/caption.jpg",
    rating: 4.8,
    reviewCount: 6,
    highlights: [
      "Three-night stay at Grand Canyon Western Ranch",
      "Included horseback and wagon ride activities",
      "Ranch meals and nightly entertainment",
      "Western-themed lodging near the canyon",
      "Optional South Rim sightseeing add-ons available",
    ],
    startDescription:
      "Check in at Grand Canyon Western Ranch, 3750 E Diamond Bar Rd, Peach Springs, AZ 86434. Ranch staff greet arrivals from mid-afternoon.",
    endDescription:
      "Check out from Grand Canyon Western Ranch after breakfast on your final morning.",
    itineraryItems: [
      {
        title: "Grand Canyon Western Ranch",
        description:
          "Spend four days at the ranch with lodging, meals, horseback rides, wagon rides, and evening shows.",
        duration: "4 days",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Three nights ranch lodging",
      "Ranch meals",
      "Horseback and wagon rides",
      "Evening entertainment",
    ],
    categories: ["Multi-day Tours", "Overnight Tours", "Safaris"],
  },
  {
    productCode: "5637206P7",
    productUrl:
      "https://www.viator.com/tours/Grand-Canyon-National-Park/Experience-Two-Night-Ranch-Adventure/d815-5637206P7",
    title: "Experience Two Night Ranch Adventure",
    description:
      "A two-night package at Grand Canyon Western Ranch pairs western lodging with guided horseback rides and wagon tours across open range. Evenings bring live music and ranch-style dining while days leave room to visit the South Rim on your own or with optional tours.",
    duration: "3 days (approx.)",
    priceFrom: 831,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/r/32/7e/62/0c/caption.jpg",
    rating: 4.7,
    reviewCount: 4,
    highlights: [
      "Two-night western ranch stay near the Grand Canyon",
      "Guided horseback and wagon ride activities included",
      "Ranch meals and live evening entertainment",
      "Family-friendly lodging on the Hualapai Reservation",
      "Flexible time for South Rim sightseeing",
    ],
    startDescription:
      "Arrive at Grand Canyon Western Ranch, 3750 E Diamond Bar Rd, Peach Springs, AZ 86434 for afternoon check-in.",
    endDescription:
      "Depart from Grand Canyon Western Ranch after breakfast on departure day.",
    itineraryItems: [
      {
        title: "Grand Canyon Western Ranch",
        description:
          "Enjoy two nights at the ranch with included rides, meals, and nightly western entertainment.",
        duration: "3 days",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Two nights ranch lodging",
      "Ranch meals",
      "Horseback and wagon rides",
      "Evening entertainment",
    ],
    categories: ["Multi-day Tours", "Overnight Tours", "Safaris"],
  },
  {
    productCode: "109090P3",
    productUrl:
      "https://www.viator.com/tours/Arizona/Exclusive-South-Rim-Grand-Canyon-Tour-Private-SUV-Hidden-Trails/d271-109090P3",
    title: "Grand Canyon Luxury Car Tour Experience",
    description:
      "Travel the South Rim in a private luxury SUV with a dedicated guide who tailors stops to your interests. The route covers classic overlooks, Hermit Road viewpoints, and time at Grand Canyon Village with an optional lunch reservation at El Tovar Dining Room.",
    duration: "4 to 7 hours (approx.)",
    priceFrom: 1200,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/14/cb/4f/7a.jpg",
    rating: 5,
    reviewCount: 7,
    highlights: [
      "Private luxury SUV for your party only",
      "Flexible four- to seven-hour South Rim itinerary",
      "Hermit Road overlooks and hidden trail viewpoints",
      "Optional El Tovar Dining Room lunch reservation",
      "Hotel pickup available from Flagstaff and Sedona area",
    ],
    startDescription:
      "Private pickup from your Flagstaff, Sedona, or South Rim hotel. Your guide confirms timing and preferred overlooks before departure.",
    endDescription:
      "Return to your original pickup location after the final rim stop.",
    itineraryItems: [
      {
        title: "Grand Canyon South Rim",
        description:
          "Scenic drive along Desert View Drive and rim roads with stops at major overlooks.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Hermit Trail",
        description:
          "Visit Hermit Road viewpoints including trail overlooks above the inner canyon.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "El Tovar Dining Room",
        description:
          "Optional lunch stop at the historic El Tovar Hotel dining room on the rim.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Lipan Point",
        description:
          "Photo stop at Lipan Point for wide views toward the Colorado River bend.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private luxury SUV transport",
      "Professional guide/driver",
      "Bottled water",
      "National park entrance fees",
    ],
    categories: ["Private Sightseeing Tours", "Luxury Car Tours", "Full-day Tours"],
  },
  {
    productCode: "5167SD",
    productUrl:
      "https://www.viator.com/tours/Las-Vegas/Self-Drive-One-Day-Grand-Canyon-White-Water-Rafting-Tour/d684-5167SD",
    title: "Self-Drive 1-Day Grand Canyon Whitewater Rafting Tour",
    description:
      "Drive yourself from Las Vegas to Hualapai Lodge for a full-day Colorado River whitewater rafting adventure through Grand Canyon West. Class III to IV rapids, a riverside lunch, and return via Lake Mead National Recreation Area make this a long but action-packed canyon day.",
    duration: "17 hours (approx.)",
    priceFrom: 634.99,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/f1/95/58.jpg",
    rating: 4.6,
    reviewCount: 50,
    highlights: [
      "Self-drive day trip from Las Vegas to Hualapai Lodge",
      "Guided whitewater rafting on the Colorado River",
      "Class III to IV rapids through Grand Canyon West",
      "Riverside lunch included on the raft trip",
      "Return route passes Lake Mead National Recreation Area",
    ],
    startDescription:
      "Drive to Hualapai Lodge, 900 Highway 66, Peach Springs, AZ 86434. Plan an early departure from Las Vegas for the 17-hour day.",
    endDescription:
      "Return drive to Las Vegas after the rafting shuttle drops you back at Hualapai Lodge.",
    itineraryItems: [
      {
        title: "Hualapai Lodge",
        description:
          "Check in at Hualapai Lodge for rafting orientation and shuttle to the river put-in.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Grand Canyon National Park",
        description:
          "Raft the Colorado River through canyon walls on a guided whitewater run.",
        duration: "6 hours",
        stopType: "stop",
      },
      {
        title: "Lake Mead National Recreation Area",
        description:
          "Pass through Lake Mead area scenery on the return drive toward Las Vegas.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Guided rafting trip",
      "Riverside lunch",
      "Rafting safety equipment",
      "Shuttle between lodge and river",
    ],
    categories: ["White Water Rafting", "Day Trips", "Adventure Tours"],
  },
  {
    productCode: "6338P18",
    productUrl:
      "https://www.viator.com/tours/Grand-Canyon-National-Park/Horseshoe-Bend-and-Antelope-Canyon-Adventure/d815-6338P18",
    title: "Horseshoe Bend and Antelope Canyon Adventure by Airplane",
    description:
      "Fly from Grand Canyon Airport on a fixed-wing sightseeing plane that links the South Rim with Page-area landmarks. Aerial views of the canyon precede ground visits to Lower Antelope Canyon and Horseshoe Bend with time at Lake Powell overlooks.",
    duration: "6 hours 30 minutes (approx.)",
    priceFrom: 574,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/15/58/0d/07.jpg",
    rating: 4.6,
    reviewCount: 12,
    highlights: [
      "Fixed-wing airplane flight from Grand Canyon Airport",
      "Ground tour of Lower Antelope Canyon slot formations",
      "Visit Horseshoe Bend overlook above the Colorado River",
      "Lake Powell scenic viewpoints included",
      "Small-group format with narrated aerial commentary",
    ],
    startDescription:
      "Meet at Grand Canyon National Park Airport, 871 Liberator Dr, Grand Canyon Village, AZ 86023. Arrive 30 minutes before departure.",
    endDescription:
      "Return to Grand Canyon National Park Airport after the Page-area ground tour.",
    itineraryItems: [
      {
        title: "Grand Canyon National Park",
        description:
          "Depart by airplane for aerial views of the South Rim and eastern canyon.",
        duration: "40 minutes",
        stopType: "stop",
      },
      {
        title: "Lower Antelope Canyon",
        description:
          "Walk through Lower Antelope Canyon with a Navajo guide among sandstone slot walls.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Horseshoe Bend",
        description:
          "Stop at the Horseshoe Bend overlook for views of the Colorado River meander.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Lake Powell",
        description:
          "Scenic viewpoints above Lake Powell on the return portion of the tour.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Airplane flight",
      "Antelope Canyon admission and guide",
      "Ground transport in Page area",
      "All fees and taxes",
    ],
    categories: ["Air Tours", "Day Trips", "Sightseeing Tours"],
  },
  {
    productCode: "265766P28",
    productUrl:
      "https://www.viator.com/tours/Grand-Canyon-National-Park/Full-Day-Small-Group-Tour-of-Grand-Canyon-National-Park/d815-265766P28",
    title: "Grand Canyon Full Day Small Group Tour & Hike",
    description:
      "Join a small group for a full day on the South Rim combining shuttle transport, rim overlooks, and a guided hike below the rim. Stops include Mather Point, Yavapai Geology Museum, Desert View Watchtower, and a section of the South Kaibab Trail tailored to group fitness.",
    duration: "6 to 8 hours (approx.)",
    priceFrom: 527,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/10/45/6a/20.jpg",
    rating: 5,
    reviewCount: 14,
    highlights: [
      "Small-group South Rim tour with certified guide",
      "Guided hike below the rim on South Kaibab Trail",
      "Mather Point and Yavapai Geology Museum stops",
      "Desert View Watchtower visit on Desert View Drive",
      "National park entrance fees included",
    ],
    startDescription:
      "Pickup from select Tusayan and Grand Canyon Village hotels. Confirm your pickup window when booking.",
    endDescription:
      "Return to your Tusayan or Grand Canyon Village pickup point after the final rim stop.",
    itineraryItems: [
      {
        title: "Mather Point",
        description:
          "Begin at Mather Point for introductory views of the main canyon expanse.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "South Kaibab Trail",
        description:
          "Hike a guided section below the rim on the South Kaibab Trail.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Canyon Desert View Watchtower",
        description:
          "Visit the stone Desert View Watchtower at the eastern end of the South Rim.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Yavapai Point",
        description:
          "Stop at Yavapai Point for unobstructed views toward the inner gorge.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Yavapai Geology Museum",
        description:
          "Explore exhibits explaining canyon rock layers and formation at the geology museum.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "Small-group transport",
      "National park entrance fees",
      "Bottled water",
    ],
    categories: ["Hiking Tours", "Small Group Tours", "Full-day Tours"],
  },
  {
    productCode: "5637206P4",
    productUrl:
      "https://www.viator.com/tours/Grand-Canyon-National-Park/Two-Nights-Deluxe-Ranch-Experience/d815-5637206P4",
    title: "Two Nights Deluxe Ranch Experience",
    description:
      "Grand Canyon Western Ranch welcomes you for two nights in upgraded deluxe accommodations with the same ranch activities as standard packages. Horseback rides, wagon tours, ranch meals, and evening entertainment frame a relaxed western stay a short drive from the South Rim.",
    duration: "3 days (approx.)",
    priceFrom: 581,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/r/32/80/7e/f3/caption.jpg",
    rating: 4.6,
    reviewCount: 5,
    highlights: [
      "Two nights in deluxe ranch accommodations",
      "Included horseback and wagon ride activities",
      "Ranch-style meals and nightly entertainment",
      "Western ranch setting on the Hualapai Reservation",
      "Optional South Rim day trips from the ranch",
    ],
    startDescription:
      "Check in at Grand Canyon Western Ranch, 3750 E Diamond Bar Rd, Peach Springs, AZ 86434.",
    endDescription:
      "Check out from Grand Canyon Western Ranch after your final breakfast.",
    itineraryItems: [
      {
        title: "Grand Canyon Western Ranch",
        description:
          "Stay two nights in deluxe ranch rooms with included rides, meals, and evening shows.",
        duration: "3 days",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Two nights deluxe lodging",
      "Ranch meals",
      "Horseback and wagon rides",
      "Evening entertainment",
    ],
    categories: ["Multi-day Tours", "Overnight Tours", "Safaris"],
  },
  {
    productCode: "318692P1",
    productUrl:
      "https://www.viator.com/tours/Arizona/Grand-Canyon-guided-day-hike-below-the-rim/d271-318692P1",
    title: "Half-Day Private Grand Canyon Guided Hiking Tour",
    description:
      "A private certified guide leads your group on a half-day hike below the South Rim on trails matched to your fitness level. Options include sections of South Kaibab, Bright Angel, or Grandview Trail with interpretive commentary on geology, flora, and safe canyon hiking practices.",
    duration: "5 hours (approx.)",
    priceFrom: 345,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/r/33/67/0b/3e/caption.jpg",
    rating: 5,
    reviewCount: 244,
    highlights: [
      "Private half-day hike with certified canyon guide",
      "Trail choice tailored to group fitness and interests",
      "South Kaibab, Bright Angel, or Grandview Trail options",
      "Interpretive commentary on geology and canyon ecology",
      "Pickup available from Tusayan and South Rim hotels",
    ],
    startDescription:
      "Meet your guide at Grand Canyon Village or arrange hotel pickup in Tusayan. Wear sturdy hiking shoes and bring water.",
    endDescription:
      "Return to the trailhead or your pickup point after the guided hike back to the rim.",
    itineraryItems: [
      {
        title: "Grand Canyon South Rim",
        description:
          "Begin at a South Rim trailhead selected for your group's ability level.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "South Kaibab Trail",
        description:
          "Possible guided descent on South Kaibab Trail to Ooh Aah Point or Cedar Ridge.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Bright Angel Trail",
        description:
          "Alternative route on Bright Angel Trail with rest stops at shaded switchbacks.",
        stopType: "pass-by",
      },
      {
        title: "Grandview Trail",
        description:
          "Optional Grandview Trail section for experienced hikers seeking steep canyon views.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Private certified hiking guide",
      "Trail snacks",
      "Safety equipment",
      "Hotel pickup when selected",
    ],
    categories: ["Private Tours", "Hiking Tours", "Half-day Tours"],
  },
  {
    productCode: "318692P2",
    productUrl:
      "https://www.viator.com/tours/Arizona/Grand-Canyon-Sunset-Hiking-Adventure-Deep-Below-The-South-Rim/d271-318692P2",
    title: "Grand Canyon Sunset Hiking Adventure Deep Below The South Rim",
    description:
      "Hike below the rim in the late afternoon with a private guide timed to watch sunset colors spread across the canyon walls. The route uses South Kaibab or Bright Angel Trail switchbacks with a return climb before dark, starting from Grand Canyon Village area trailheads.",
    duration: "5 hours (approx.)",
    priceFrom: 345,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/r/33/a3/87/ea/caption.jpg",
    rating: 5,
    reviewCount: 76,
    highlights: [
      "Private sunset-timed hike below the South Rim",
      "Certified guide paces the route for safe rim return",
      "South Kaibab or Bright Angel Trail options",
      "Golden-hour views across layered canyon walls",
      "Pickup from Tusayan and Grand Canyon Village hotels",
    ],
    startDescription:
      "Afternoon meetup at Grand Canyon Village trailhead or hotel pickup in Tusayan. Start time shifts seasonally for optimal sunset timing.",
    endDescription:
      "Return to the South Rim trailhead or your hotel after the post-sunset climb.",
    itineraryItems: [
      {
        title: "Grand Canyon South Rim",
        description:
          "Gather at the rim for a pre-hike briefing and sunset timing overview.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Canyon Village",
        description:
          "Depart from the village area toward the selected below-rim trailhead.",
        stopType: "pass-by",
      },
      {
        title: "South Kaibab Trail",
        description:
          "Descend South Kaibab Trail to a viewpoint positioned for sunset over the inner canyon.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Bright Angel Trail",
        description:
          "Alternative descent on Bright Angel Trail with rest at Indian Garden or mile-and-a-half resthouse.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Private certified guide",
      "Headlamp for return hike",
      "Trail snacks and water",
      "Hotel pickup when selected",
    ],
    categories: ["Private Tours", "Hiking Tours", "Sunset Tours"],
  },
  {
    productCode: "18678CS",
    productUrl:
      "https://www.viator.com/tours/Grand-Canyon-National-Park/45-minute-Helicopter-Flight-Over-the-Grand-Canyon-from-Tusayan-Arizona/d815-18678CS",
    title: "45-minute Helicopter Flight Over the Grand Canyon from Tusayan, Arizona",
    description:
      "Lift off from Tusayan on a 45-minute helicopter flight tracing the eastern Grand Canyon and Colorado River corridor. Narrated aerial routing covers Kaibab National Forest, Desert View Watchtower, Marble Canyon, and the Painted Desert beyond the park boundary.",
    duration: "45 minutes (approx.)",
    priceFrom: 359.32,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/47/d9/03.jpg",
    rating: 4.8,
    reviewCount: 2018,
    highlights: [
      "45-minute narrated helicopter flight from Tusayan",
      "Aerial views of the eastern Grand Canyon and Colorado River",
      "Flyover of Desert View Watchtower and Marble Canyon",
      "Climate-controlled cabin with oversized viewing windows",
      "Multiple daily departures from Grand Canyon Airport area",
    ],
    startDescription:
      "Check in at the helicopter terminal near Grand Canyon National Park Airport, Tusayan, AZ 86023. Arrive 30 minutes before your scheduled flight.",
    endDescription:
      "Land back at the Tusayan helicopter terminal after the 45-minute aerial loop.",
    itineraryItems: [
      {
        title: "Kaibab National Forest",
        description:
          "Depart over ponderosa pine forest on the canyon's south plateau.",
        stopType: "pass-by",
      },
      {
        title: "Grand Canyon National Park",
        description:
          "Sweep along the main canyon chasm with views of layered rim and inner gorge.",
        duration: "20 minutes",
        stopType: "pass-by",
      },
      {
        title: "Painted Desert",
        description:
          "Fly toward the Painted Desert badlands northeast of the canyon.",
        stopType: "pass-by",
      },
      {
        title: "Grand Canyon Desert View Watchtower",
        description:
          "Circle the Desert View Watchtower at the eastern South Rim.",
        stopType: "pass-by",
      },
      {
        title: "Marble Canyon",
        description:
          "Follow Marble Canyon upstream where the Colorado River narrows.",
        stopType: "pass-by",
      },
      {
        title: "Colorado River",
        description:
          "Track the Colorado River bend through the deepest sections of the flight path.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "45-minute helicopter flight",
      "Live narration",
      "Helicopter fuel surcharge",
      "All fees and taxes",
    ],
    categories: ["Helicopter Tours", "Air Tours", "Sightseeing Tours"],
  },
  {
    productCode: "6613P24",
    productUrl:
      "https://www.viator.com/tours/Grand-Canyon-National-Park/Grand-Canyon-Helicopter-45-Minute-Flights-with-Optional-Hummer-Tour/d815-6613P24",
    title: "Grand Canyon Helicopter 45-Minute Flight with Optional Hummer Tour",
    description:
      "Choose a standalone 45-minute helicopter flight or bundle it with a ground Hummer tour of the South Rim. The aerial segment covers both rims and the Colorado River while the optional Hummer portion adds rim-edge stops unreachable by standard buses.",
    duration: "45 minutes (approx.)",
    priceFrom: 354,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/68/f7/98.jpg",
    rating: 4.6,
    reviewCount: 331,
    highlights: [
      "45-minute helicopter flight over the Grand Canyon",
      "Optional add-on Hummer ground tour of the South Rim",
      "Views of North Rim, South Rim, and Colorado River",
      "Departures from Tusayan helicopter terminal",
      "Flexible booking for flight-only or combo packages",
    ],
    startDescription:
      "Check in at the Papillon helicopter terminal in Tusayan, AZ 86023. Allow 30 minutes for check-in before flight time.",
    endDescription:
      "Return to the Tusayan terminal after landing; Hummer guests transfer to the ground tour staging area.",
    itineraryItems: [
      {
        title: "Grand Canyon National Park",
        description:
          "Helicopter routing over the main canyon with commentary on major landmarks.",
        duration: "45 minutes",
        stopType: "pass-by",
      },
      {
        title: "Kaibab National Forest",
        description:
          "Initial climb over Kaibab National Forest before reaching the rim.",
        stopType: "pass-by",
      },
      {
        title: "Grand Canyon North Rim",
        description:
          "Aerial views toward the less-visited North Rim plateau.",
        stopType: "pass-by",
      },
      {
        title: "Colorado River",
        description:
          "Follow the Colorado River corridor visible from the helicopter cabin.",
        stopType: "pass-by",
      },
      {
        title: "Grand Canyon South Rim",
        description:
          "Optional Hummer tour stops at South Rim viewpoints after the flight.",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Helicopter flight",
      "Live narration",
      "Optional Hummer tour when selected",
      "All fees and taxes",
    ],
    categories: ["Helicopter Tours", "4WD Tours", "Air Tours"],
  },
  {
    productCode: "89776P1",
    productUrl:
      "https://www.viator.com/tours/Grand-Canyon-National-Park/Grand-Canyon-Signature-Hummer-Tour-with-Optional-Sunset-Views/d815-89776P1",
    title: "Grand Canyon Signature Hummer Tour with Optional Sunset Views",
    description:
      "Ride an open-air Hummer along restricted South Rim roads to viewpoints most visitors never reach. A driver-guide shares canyon history at each stop, with an optional sunset departure timed for golden light over the inner gorge.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 139,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/75/a5/8c.jpg",
    rating: 4.8,
    reviewCount: 1773,
    highlights: [
      "Open-air Hummer tour on restricted South Rim routes",
      "Multiple rim viewpoints with photo time at each stop",
      "Optional sunset departure for golden-hour canyon light",
      "Driver-guide commentary on geology and park history",
      "National park entrance fees included",
    ],
    startDescription:
      "Meet at the Hummer tour check-in desk in Tusayan, AZ 86023, or at the National Geographic Visitor Center.",
    endDescription:
      "Return to the Tusayan check-in point after the final rim viewpoint stop.",
    itineraryItems: [
      {
        title: "Grand Canyon National Park",
        description:
          "Two-and-a-half-hour Hummer loop covering multiple South Rim overlooks and restricted roads.",
        duration: "2 hours 30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Hummer transport",
      "Driver/guide",
      "National park entrance fees",
      "Bottled water",
    ],
    categories: ["4WD Tours", "Hummer Tours", "Sightseeing Tours"],
  },
  {
    productCode: "229754P2",
    productUrl:
      "https://www.viator.com/tours/Grand-Canyon-National-Park/Off-Road-Sunset-Safari-to-Grand-Canyon-with-Entrance-Gate-Detour/d815-229754P2",
    title: "3 Hour Off-Road Sunset Safari to Grand Canyon with Entrance Gate Detour",
    description:
      "Board a custom open-air safari vehicle for a back-road approach to the South Rim that bypasses the main entrance gate lines. The three-hour route hits Yavapai Point, Pipe Creek Vista, and Grandview Point timed for sunset over the canyon.",
    duration: "3 hours (approx.)",
    priceFrom: 133.34,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0a/9f/98/57.jpg",
    rating: 4.9,
    reviewCount: 972,
    highlights: [
      "Open-air safari vehicle with entrance gate bypass route",
      "Sunset-timed stops at Yavapai and Grandview points",
      "Three-hour guided South Rim overview",
      "National park entrance fees included",
      "Departures from Tusayan area hotels",
    ],
    startDescription:
      "Pickup from Tusayan hotels and the National Geographic Visitor Center. Sunset departure times vary by season.",
    endDescription:
      "Return to your Tusayan pickup point after the final sunset stop.",
    itineraryItems: [
      {
        title: "Grand Canyon South Rim",
        description:
          "Enter the park via back roads and begin the rim viewpoint loop.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Yavapai Point",
        description:
          "Stop at Yavapai Point for wide views and pre-sunset photo time.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Pipe Creek Vista",
        description:
          "Brief stop at Pipe Creek Vista overlooking the Bright Angel fault trace.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Grandview Point",
        description:
          "Sunset viewing at Grandview Point above the Horseshoe Mesa.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Safari vehicle transport",
      "Professional guide",
      "National park entrance fees",
      "Hotel pickup in Tusayan",
    ],
    categories: ["Safaris", "Sunset Tours", "4WD Tours"],
  },
  {
    productCode: "5488718P3",
    productUrl:
      "https://www.viator.com/tours/Grand-Canyon-National-Park/Grand-Canyon-South-Rim-Sunset-Tour-with-Dinner/d815-5488718P3",
    title: "Grand Canyon South Rim Sunset Tour with Dinner included",
    description:
      "An afternoon-to-evening coach tour of the South Rim culminates in sunset viewing followed by a sit-down dinner near Tusayan. The guide paces rim stops so you reach a prime overlook as the canyon shifts through late-day color.",
    duration: "4 hours (approx.)",
    priceFrom: 170,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/13/2c/33/a4.jpg",
    rating: 4.9,
    reviewCount: 242,
    highlights: [
      "South Rim sunset tour by comfortable coach",
      "Included sit-down dinner after sunset viewing",
      "Multiple rim overlooks with guide commentary",
      "Pickup from Tusayan and Grand Canyon Village hotels",
      "National park entrance fees included",
    ],
    startDescription:
      "Afternoon pickup from Tusayan hotels or Grand Canyon Village lodges. Confirm your pickup time when booking.",
    endDescription:
      "Return to your hotel after dinner near Tusayan or drop-off at Grand Canyon Village.",
    itineraryItems: [
      {
        title: "Grand Canyon South Rim",
        description:
          "Afternoon coach loop along South Rim roads with stops at major viewpoints before sunset.",
        duration: "3 hours",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Coach transport",
      "Professional guide",
      "Sunset rim viewing",
      "Dinner",
      "National park entrance fees",
    ],
    categories: ["Sunset Tours", "Bus Tours", "Dining Experiences"],
  },
  {
    productCode: "7886P3",
    productUrl:
      "https://www.viator.com/tours/Grand-Canyon-National-Park/Grand-Canyon-Ultimate-Tour-from-Tusayan-South-Rim/d815-7886P3",
    title: "Grand Canyon Tour from Tusayan",
    description:
      "This six-hour Tusayan departure covers the essential South Rim in a single comfortable bus tour. Multiple viewpoint stops, time at Grand Canyon Village, and included park entrance fees make it a straightforward full-morning or afternoon introduction to the canyon.",
    duration: "6 hours (approx.)",
    priceFrom: 249,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/15/be/c1/65.jpg",
    rating: 5,
    reviewCount: 177,
    highlights: [
      "Six-hour comprehensive South Rim bus tour from Tusayan",
      "Multiple rim viewpoint photo stops",
      "Free time at Grand Canyon Village",
      "National park entrance fees included",
      "Hotel pickup from Tusayan properties",
    ],
    startDescription:
      "Morning or afternoon pickup from Tusayan hotels. Meet at your hotel lobby at the confirmed departure time.",
    endDescription:
      "Return to your Tusayan hotel after the final village and rim stops.",
    itineraryItems: [
      {
        title: "Grand Canyon South Rim",
        description:
          "Six-hour guided loop with stops at Mather Point, Yavapai Point, and additional overlooks.",
        duration: "6 hours",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Air-conditioned bus",
      "Professional guide",
      "National park entrance fees",
      "Hotel pickup in Tusayan",
    ],
    categories: ["Bus Tours", "Full-day Tours", "Sightseeing Tours"],
  },
  {
    productCode: "3272GCER",
    productUrl:
      "https://www.viator.com/tours/Grand-Canyon-National-Park/Grand-Canyon-East-Rim-Drive-by-Jeep-and-IMAX-Movie/d815-3272GCER",
    title: "Desert View Grand Canyon Jeep Tour",
    description:
      "A three-hour open-air Jeep tour follows Desert View Drive east from Grand Canyon Village to the Desert View Watchtower. Stops include Duck on a Rock Viewpoint, Grandview Point, and Pipe Creek Vista, plus admission to the Grand Canyon IMAX film at the visitor center.",
    duration: "3 hours (approx.)",
    priceFrom: 166.43,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/08/39/1e/8c.jpg",
    rating: 4.6,
    reviewCount: 298,
    highlights: [
      "Open-air Jeep tour along Desert View Drive",
      "Stops at Grandview Point and Desert View Watchtower",
      "Included Grand Canyon IMAX movie admission",
      "National park entrance fees covered",
      "Departures from Tusayan visitor center area",
    ],
    startDescription:
      "Meet at the Jeep tour staging area near the National Geographic Visitor Center, Tusayan, AZ 86023.",
    endDescription:
      "Return to the Tusayan staging area; IMAX tickets valid for same-day screening.",
    itineraryItems: [
      {
        title: "Grand Canyon South Rim",
        description:
          "Begin the east-rim Jeep route from the village area toward Desert View Drive.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Duck on a Rock Viewpoint",
        description:
          "Photo stop at Duck on a Rock Viewpoint along Desert View Drive.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "Grandview Point",
        description:
          "Stop at Grandview Point for views above Horseshoe Mesa and the inner canyon.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Canyon Desert View Watchtower",
        description:
          "Visit the historic Desert View Watchtower at the eastern South Rim.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Pipe Creek Vista",
        description:
          "Brief overlook stop at Pipe Creek Vista before returning west.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Canyon Visitor Center Imax",
        description:
          "Receive IMAX admission for the Grand Canyon: River at Risk film screening.",
        duration: "34 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Jeep transport",
      "Driver/guide",
      "IMAX movie ticket",
      "National park entrance fees",
    ],
    categories: ["4WD Tours", "Jeep Tours", "Sightseeing Tours"],
  },
  {
    productCode: "25576P9",
    productUrl:
      "https://www.viator.com/tours/Grand-Canyon-National-Park/Western-Ranch-Overnight-Experience-Cabin-or-Camp-Out/d815-25576P9",
    title: "Western Ranch Overnight Experience: Cabin or Camp Out",
    description:
      "Spend one night at Grand Canyon Western Ranch choosing between a private cabin or an outdoor camp-out under the stars. The package includes a ranch dinner, breakfast, and western activities such as horseback riding on the Hualapai Reservation near the canyon.",
    duration: "2 days (approx.)",
    priceFrom: 295.32,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/90/77/de.jpg",
    rating: 4.1,
    reviewCount: 14,
    highlights: [
      "One-night stay in cabin or camp-out option",
      "Ranch dinner and breakfast included",
      "Horseback riding and ranch activities",
      "Western entertainment on the Hualapai Reservation",
      "Short drive to South Rim sightseeing",
    ],
    startDescription:
      "Arrive at Grand Canyon Western Ranch, 3750 E Diamond Bar Rd, Peach Springs, AZ 86434 for afternoon check-in.",
    endDescription:
      "Depart after breakfast on your second day from Grand Canyon Western Ranch.",
    itineraryItems: [
      {
        title: "Grand Canyon Western Ranch",
        description:
          "Overnight at the ranch with cabin or camp-out lodging, meals, and western activities.",
        duration: "2 days",
        stopType: "stop",
      },
    ],
    inclusions: [
      "One night lodging (cabin or camp-out)",
      "Ranch dinner and breakfast",
      "Horseback ride",
      "Evening entertainment",
    ],
    categories: ["Overnight Tours", "Multi-day Tours", "Safaris"],
  },
  {
    productCode: "6613P14",
    productUrl:
      "https://www.viator.com/tours/Grand-Canyon-National-Park/Helicopter-Tour-of-the-North-Canyon-with-Optional-Hummer-Excursion/d815-6613P14",
    title: "Helicopter Tour of the North Canyon with Optional Hummer Excursion",
    description:
      "Lift off from the Grand Canyon South Rim Heliport on a Bell helicopter flight over Kaibab National Forest and into the Dragon Corridor, the deepest and widest section of the canyon. An optional Hummer ground tour adds South Rim viewpoints after landing back in Tusayan.",
    duration: "25 minutes to 4 hours 30 minutes (approx.)",
    priceFrom: 289,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/bb/cb/df.jpg",
    rating: 4.6,
    reviewCount: 184,
    highlights: [
      "25-minute North Canyon helicopter flight from the South Rim Heliport",
      "Aerial routing through the Dragon Corridor over the inner gorge",
      "Optional add-on Hummer tour of South Rim viewpoints",
      "State-of-the-art Bell helicopter with window views for every passenger",
      "Seamless transfer to ground tour when the Hummer option is selected",
    ],
    startDescription:
      "Check in at Papillon Helicopters, 3568 Airport Rd, Grand Canyon Village, AZ 86023. Arrive 30 minutes before your scheduled departure.",
    endDescription:
      "Return to the Papillon terminal after landing; Hummer add-on guests transfer to the ground tour staging area.",
    itineraryItems: [
      {
        title: "Kaibab National Forest",
        description:
          "Depart over ponderosa pine forest on the South Rim plateau before reaching the canyon edge.",
        stopType: "pass-by",
      },
      {
        title: "Dragon Corridor",
        description:
          "Fly through the Dragon Corridor, the deepest and widest section of the Grand Canyon.",
        duration: "10 minutes",
        stopType: "pass-by",
      },
      {
        title: "Grand Canyon North Rim",
        description:
          "Aerial views toward the North Rim and inner gorge from the helicopter cabin.",
        stopType: "pass-by",
      },
      {
        title: "Colorado River",
        description:
          "Track the Colorado River bend visible from the North Canyon flight path.",
        stopType: "pass-by",
      },
      {
        title: "Grand Canyon South Rim",
        description:
          "Optional Hummer tour stops at South Rim viewpoints after the helicopter lands.",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Helicopter air tour from Grand Canyon South Rim Heliport",
      "Professional pilot and live narration",
      "Optional Hummer tour with driver-guide when selected",
      "All fees and taxes",
    ],
    categories: ["Helicopter Tours", "4WD Tours", "Air Tours"],
  },
  {
    productCode: "6338DISCOVERY",
    productUrl:
      "https://www.viator.com/tours/Grand-Canyon-National-Park/Grand-Canyon-Landmarks-Tour-by-Airplane/d815-6338DISCOVERY",
    title: "Grand Canyon Landmarks Tour by Airplane with Optional Hummer Tour",
    description:
      "A 40-minute fixed-wing flight from Grand Canyon Airport showcases eastern canyon landmarks from the air. Optional ground Hummer add-ons extend the trip with South Rim stops after landing back in Tusayan.",
    duration: "40 minutes (approx.)",
    priceFrom: 174,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/72/fe/76.jpg",
    rating: 4.6,
    reviewCount: 373,
    highlights: [
      "40-minute scenic airplane flight from Grand Canyon Airport",
      "Aerial views of Zuni Point and Desert View Watchtower",
      "Optional Hummer ground tour add-on available",
      "Every seat is a window seat on the sightseeing plane",
      "Multiple departures daily from Tusayan",
    ],
    startDescription:
      "Check in at Grand Canyon National Park Airport terminal, 871 Liberator Dr, Grand Canyon Village, AZ 86023.",
    endDescription:
      "Land at Grand Canyon Airport; Hummer add-on guests transfer to the ground tour.",
    itineraryItems: [
      {
        title: "Grand Canyon National Park",
        description:
          "Depart by airplane for a narrated loop over the eastern Grand Canyon.",
        duration: "40 minutes",
        stopType: "pass-by",
      },
      {
        title: "Zuni Point",
        description:
          "Fly past Zuni Point on the East Rim for broad canyon panoramas.",
        stopType: "pass-by",
      },
      {
        title: "Point Imperial Drive",
        description:
          "Aerial routing toward the North Rim vicinity along Point Imperial Drive.",
        stopType: "pass-by",
      },
      {
        title: "Grand Canyon Desert View Watchtower",
        description:
          "Circle the Desert View Watchtower at the canyon's eastern gateway.",
        stopType: "pass-by",
      },
      {
        title: "Colorado River",
        description:
          "Follow the Colorado River bend visible from the aircraft cabin.",
        stopType: "pass-by",
      },
      {
        title: "Kaibab National Forest",
        description:
          "Initial climb and final descent over Kaibab National Forest.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Airplane flight",
      "Live narration",
      "Optional Hummer tour when selected",
      "All fees and taxes",
    ],
    categories: ["Air Tours", "Sightseeing Tours", "Airplane Tours"],
  },
  {
    productCode: "229754P1",
    productUrl:
      "https://www.viator.com/tours/Grand-Canyon-National-Park/Back-Road-Safari-to-Grand-Canyon-with-Entrance-Gate-By-Pass/d815-229754P1",
    title: "3 Hour Back-Road Safari to Grand Canyon with Entrance Gate By-Pass at 9:30 am",
    description:
      "Morning safari vehicle pickup in Tusayan uses back roads to enter the South Rim without waiting at the main gate. Three hours of guided stops include Yavapai Point, views above Bright Angel Trail, and time near Hopi House in Grand Canyon Village.",
    duration: "3 hours (approx.)",
    priceFrom: 130,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0a/94/1d/55.jpg",
    rating: 4.9,
    reviewCount: 446,
    highlights: [
      "Morning 9:30 AM back-road safari from Tusayan",
      "Entrance gate bypass saves time entering the park",
      "Stops at Yavapai Point and Bright Angel Trail overlook",
      "Visit Hopi House in Grand Canyon Village",
      "National park entrance fees included",
    ],
    startDescription:
      "9:30 AM pickup from Tusayan hotels and the National Geographic Visitor Center.",
    endDescription:
      "Return to your Tusayan pickup point after the village and rim loop.",
    itineraryItems: [
      {
        title: "Grand Canyon South Rim",
        description:
          "Enter via back roads and begin the three-hour rim and village loop.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Yavapai Point",
        description:
          "Stop at Yavapai Point for panoramic views of the inner canyon.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Bright Angel Trail",
        description:
          "Viewpoint above Bright Angel Trailhead to watch hikers on the upper switchbacks.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Hopi House",
        description:
          "Stop at Mary Colter's Hopi House for architecture and artisan crafts in the village.",
        duration: "25 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Safari vehicle transport",
      "Professional guide",
      "National park entrance fees",
      "Hotel pickup in Tusayan",
    ],
    categories: ["Safaris", "4WD Tours", "Sightseeing Tours"],
  },
  {
    productCode: "3272GCSR2",
    productUrl:
      "https://www.viator.com/tours/Grand-Canyon-National-Park/Grand-Canyon-South-Rim-Jeep-Tour-with-Transport-from-Tusayan/d815-3272GCSR2",
    title: "Grand Entrance Grand Canyon Jeep Tour",
    description:
      "A two-hour Jeep tour from Tusayan covers the classic South Rim introduction with transport included from local hotels. Grandview Point overlooks and an IMAX ticket at the visitor center round out a compact first visit to the canyon.",
    duration: "2 hours (approx.)",
    priceFrom: 144.08,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/08/39/1e/5c.jpg",
    rating: 4.6,
    reviewCount: 237,
    highlights: [
      "Two-hour open-air Jeep tour of the South Rim",
      "Hotel transport included from Tusayan properties",
      "Stop at Grandview Point for canyon panoramas",
      "Grand Canyon IMAX movie ticket included",
      "National park entrance fees covered",
    ],
    startDescription:
      "Pickup from Tusayan hotels for transfer to the Jeep staging area near the National Geographic Visitor Center.",
    endDescription:
      "Return transport to your Tusayan hotel after the Jeep loop and IMAX pickup.",
    itineraryItems: [
      {
        title: "Grand Canyon South Rim",
        description:
          "Two-hour Jeep introduction loop along primary South Rim viewpoints.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Grandview Point",
        description:
          "Photo stop at Grandview Point with views above Horseshoe Mesa.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Grand Canyon Imax Theater",
        description:
          "Receive admission to the Grand Canyon IMAX film at the visitor center.",
        duration: "34 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Jeep transport",
      "Tusayan hotel pickup",
      "Driver/guide",
      "IMAX movie ticket",
      "National park entrance fees",
    ],
    categories: ["Jeep Tours", "4WD Tours", "Sightseeing Tours"],
  },
];

const buildFixture = (tour: GrandCanyonTourFixture) => {
  const viatorRatings = GRAND_CANYON_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: "Grand Canyon National Park", state: "Arizona" },
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
          question: "Where does the tour depart from at the Grand Canyon?",
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
    destinationLabel: "Grand Canyon National Park",
    destinationCitySlug: "grand-canyon-national-park",
    viatorDestinationSlug: "Grand-Canyon-National-Park",
    tours: GRAND_CANYON_TOURS,
    buildFixture,
    destinationLogLabel: "Grand Canyon",
  });
};

await main();
