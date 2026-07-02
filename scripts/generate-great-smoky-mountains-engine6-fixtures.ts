import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { GREAT_SMOKY_MOUNTAINS_VIATOR_PUBLIC_RATINGS } from "../src/engine6/greatSmokyMountainsViatorPublicRatings";
import {
  ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS,
  validateEngine6CityProductAvailability,
} from "../src/engine6/viatorPublicAvailability";
import { runEngine6ParagonFixtureGeneration } from "./lib/runEngine6ParagonFixtureGeneration";

type ItineraryItem = {
  title: string;
  description: string;
  duration?: string;
  stopType: "stop" | "pass-by";
};

type GreatSmokyMountainsTourFixture = {
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

const GREAT_SMOKY_MOUNTAINS_TOURS: GreatSmokyMountainsTourFixture[] = [
  {
    productCode: "26480P10",
    productUrl:
      "https://www.viator.com/tours/Gatlinburg/Thundering-Cascades-of-the-Smokies/d24151-26480P10",
    title: "Thundering Streams and Falls of the Smokies Guided Hiking Tour",
    description:
      "Explore pristine cascades and waterfalls on a guided hike through lesser-known Smoky Mountain trails with A Walk in the Woods naturalist guides. Warm up on a popular park trail, then follow your guide onto quieter paths where thundering streams and seasonal wildflowers frame the route. Guides share tree identification, Appalachian ecology, and park history while pacing the moderate climb over downed trees and wet creek crossings. Ideal for active travelers who want waterfall scenery without navigating the park alone.",
    duration: "3 hours (approx.)",
    priceFrom: 76,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0a/37/4b/91.jpg",
    rating: 4.9,
    reviewCount: 130,
    highlights: [
      "Guided waterfall hike on lesser-traveled Smoky Mountain trails",
      "Certified naturalist guides with Wilderness First Responder training",
      "Seasonal wildflower and swimming-hole stops when conditions allow",
      "Moderate adventure with creek crossings and elevation gain",
      "Departs from the Sugarlands Visitor Center area",
    ],
    startDescription:
      "Meet at 1420 Fighting Creek Gap Rd, Gatlinburg, TN 37738 near Sugarlands Visitor Center. Arrive 15 minutes early; a two-guest minimum applies.",
    endDescription:
      "Return to the Sugarlands Visitor Center trailhead after the final cascade stop.",
    itineraryItems: [
      {
        title: "Sugarlands Visitor Center",
        description:
          "Check in with your naturalist guide and review trail conditions for the day's waterfall route.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Little River Trail",
        description:
          "Warm up on a more popular Smoky Mountain trail with smaller cascade photo stops.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Thundering Cascades",
        description:
          "Follow your guide onto a less-traveled section of the park to thundering stream sections.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Hidden Waterfalls",
        description:
          "Reach secluded waterfall viewpoints with interpretive commentary on park ecology.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional naturalist guide",
      "Trail snacks and water",
      "Bear safety briefing",
      "Park parking guidance",
    ],
    categories: ["Hiking Tours", "Nature and Wildlife Tours", "Half-day Tours"],
  },
  {
    productCode: "26480P2",
    productUrl:
      "https://www.viator.com/tours/Gatlinburg/Explore-a-Simpler-Time-Smoky-Mountain-Tour/d24151-26480P2",
    title: "Historic River Town Ramble",
    description:
      "Step back to a simpler era on a guided history and nature walk through Great Smoky Mountains National Park. Your naturalist guide leads a gentle trail past a family cemetery, nineteenth-century barn, and restored settler cabin while sharing Cherokee heritage and Appalachian pioneer stories. Follow the misnamed Little River corridor where early logging towns once thrived, with wildlife and geology interpretation at every turn. Certified Wilderness First Responders lead this small-group outing from the Sugarlands Visitor Center.",
    duration: "3 hours 30 minutes (approx.)",
    priceFrom: 85,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/05/4c/ab.jpg",
    rating: 5,
    reviewCount: 37,
    highlights: [
      "History and nature tour of Great Smoky Mountains National Park",
      "Visit settler cabin, barn, and family cemetery sites",
      "Cherokee and Appalachian pioneer storytelling",
      "Gentle nature walk with certified naturalist guide",
      "Small-group format from Sugarlands Visitor Center",
    ],
    startDescription:
      "Meet at Sugarlands Visitor Center, 1420 Fighting Creek Gap Rd, Gatlinburg, TN 37738. A Park It Forward parking pass is required for vehicles stopping longer than 15 minutes.",
    endDescription:
      "Return to Sugarlands Visitor Center after the restored cabin stop.",
    itineraryItems: [
      {
        title: "Sugarlands Visitor Center",
        description:
          "Orientation at the visitor center before entering the historic river corridor.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Little River",
        description:
          "Walk the Little River corridor past remnants of an early 1900s resort town.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Elkmont Historic District",
        description:
          "Explore preserved structures and interpret logging-era Smoky Mountain history.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Family Cemetery",
        description:
          "Visit a small family cemetery and restored cabin illustrating settlers' daily lives.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional naturalist guide",
      "Trail snacks",
      "Bear aversion safety briefing",
      "Interpretive history commentary",
    ],
    categories: ["Walking Tours", "Historical Tours", "Nature and Wildlife Tours"],
  },
  {
    productCode: "26480P11",
    productUrl:
      "https://www.viator.com/tours/Gatlinburg/Romance-Streamside-Holiday-Special/d24151-26480P11",
    title: "Clear Creek Falls Hike",
    description:
      "Hike to Clear Creek Falls on a guided half-day outing that pairs moderate trail mileage with waterfall scenery in Great Smoky Mountains National Park. A Walk in the Woods naturalist guides lead the route from the Fighting Creek Gap area through forested creek corridors to the falls, sharing wildflower and wildlife insights along the way. The pace suits hikers comfortable with a few hours on uneven terrain. Guides carry Wilderness First Responder certification for added peace of mind in bear country.",
    duration: "4 hours 30 minutes (approx.)",
    priceFrom: 99,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/9b/0b/8d.jpg",
    rating: 5,
    reviewCount: 8,
    highlights: [
      "Guided hike to Clear Creek Falls in Great Smoky Mountains National Park",
      "Moderate trail with naturalist interpretation",
      "Wildflower and wildlife commentary en route",
      "Wilderness First Responder certified guides",
      "Half-day waterfall outing from Gatlinburg",
    ],
    startDescription:
      "Meet at 1420 Fighting Creek Gap Rd, Gatlinburg, TN 37738. Confirm departure time when booking.",
    endDescription:
      "Return to the Fighting Creek Gap meeting point after the falls turnaround.",
    itineraryItems: [
      {
        title: "Fighting Creek Gap",
        description:
          "Guide briefing and trailhead departure near Gatlinburg.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Clear Creek Trail",
        description:
          "Moderate forest hike along Clear Creek with ecology stops.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Clear Creek Falls",
        description:
          "Waterfall viewpoint and photo time at Clear Creek Falls.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Return Trail",
        description:
          "Return hike to the trailhead with final interpretive stops.",
        duration: "1 hour",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional naturalist guide",
      "Trail snacks and water",
      "Safety briefing",
    ],
    categories: ["Hiking Tours", "Nature and Wildlife Tours"],
  },
  {
    productCode: "26480P6",
    productUrl:
      "https://www.viator.com/tours/Gatlinburg/Smoky-Mountain-High-Van-tour/d24151-26480P6",
    title: "Smoky Mountain Guided Scenic High Van Tour",
    description:
      "Leave the driving to expert naturalist guides on a high-country van tour to the top of the Smoky Mountains. Travel the Newfound Gap corridor with photo stops above the sea of ridges, optional Appalachian Trail viewpoints, and commentary on human and natural history from guides who may include former park rangers and thru-hikers. This three-hour outing suits travelers who want big panoramas without hiking long distances. Luxury van transport keeps the focus on scenery and interpretation.",
    duration: "3 hours (approx.)",
    priceFrom: 150,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/04/42/e8.jpg",
    rating: 4.9,
    reviewCount: 11,
    highlights: [
      "Guided high-country van tour in Great Smoky Mountains National Park",
      "Newfound Gap Road scenic overlooks and photo stops",
      "Naturalist guides with park ranger and biology backgrounds",
      "Optional Appalachian Trail viewpoint stop",
      "Luxury van transport from Gatlinburg",
    ],
    startDescription:
      "Pickup from A Walk in the Woods staging at 1420 Fighting Creek Gap Rd, Gatlinburg, TN 37738 unless otherwise confirmed.",
    endDescription:
      "Return to the Gatlinburg pickup point after the final high-elevation overlook.",
    itineraryItems: [
      {
        title: "Gatlinburg Pickup",
        description:
          "Board the luxury van and begin the climb toward Newfound Gap.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Newfound Gap Road",
        description:
          "Scenic drive with multiple pullouts for ridge-top photography.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Clingmans Dome Area",
        description:
          "High-elevation stop with panoramic views above the Smoky Mountain crest.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Appalachian Trail Overlook",
        description:
          "Optional viewpoint near the Appalachian Trail with interpretive commentary.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Luxury van transport",
      "Professional naturalist guide",
      "Photo stop time at overlooks",
    ],
    categories: ["Bus Tours", "Sightseeing Tours", "Nature and Wildlife Tours"],
  },
  {
    productCode: "335817P3",
    productUrl:
      "https://www.viator.com/tours/Gatlinburg/Classic-Driving-Tour-of-the-Smokies/d24151-335817P3",
    title: "The Classic National Park Tour",
    description:
      "Discover Appalachian history and mountain scenery on a small-group Classic National Park tour from Gatlinburg. Ride in eco-friendly vans to a vanished resort town, learn about Smokies logging and pioneer life, then ascend Newfound Gap Road to the Tennessee–North Carolina divide at 5,000 feet. Stops include scenic overlooks, a light hike, and the site where President Franklin Roosevelt dedicated the park in 1940. Snacks, water, and parking are included for a comfortable half-day introduction to America's most-visited national park.",
    duration: "3 hours (approx.)",
    priceFrom: 85,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/05/4c/94.jpg",
    rating: 4.9,
    reviewCount: 171,
    highlights: [
      "Small-group Classic Smoky Mountains tour from Gatlinburg",
      "Historic resort town and logging heritage stops",
      "Newfound Gap Road scenic drive to 5,000-foot divide",
      "Light hike with professional guide commentary",
      "Snacks, water, and parking included",
    ],
    startDescription:
      "Meet at the tour operator pickup location in Gatlinburg, TN confirmed at booking.",
    endDescription:
      "Return to Gatlinburg after the Newfound Gap overlook stop.",
    itineraryItems: [
      {
        title: "Gatlinburg",
        description:
          "Pickup in Gatlinburg and orientation before entering the national park.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Elkmont Historic District",
        description:
          "Explore remnants of a long-gone resort town and early logging history.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Newfound Gap Road",
        description:
          "Scenic mountain drive with overlooks for photos and interpretation.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Newfound Gap",
        description:
          "Stop at the Tennessee–North Carolina divide and Roosevelt dedication site.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Eco-friendly van transport",
      "Professional guide",
      "Snacks and bottled water",
      "Parking fees",
    ],
    categories: ["Bus Tours", "Half-day Tours", "Hiking Tours"],
  },
  {
    productCode: "335817P10",
    productUrl:
      "https://www.viator.com/tours/Gatlinburg/Smoky-Mountains-Half-Day-Fly-Fishing/d24151-335817P10",
    title: "Smoky Mountains National Park Half Day Fly Fishing",
    description:
      "Learn fly fishing on a half-day guided outing along Smoky Mountain streams with professional instruction near Gatlinburg. Guides provide rods, reels, waders, and casting lessons suited to beginners and intermediate anglers, then lead you to productive trout water inside Great Smoky Mountains National Park. Streamside instruction covers reading water, fly selection, and catch-and-release ethics in a scenic Appalachian setting. This half-day format fits travelers who want an active outdoor experience beyond driving tours.",
    duration: "4 hours (approx.)",
    priceFrom: 163,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/04/42/eb.jpg",
    rating: 4.9,
    reviewCount: 12,
    highlights: [
      "Half-day guided fly fishing in Great Smoky Mountains National Park",
      "Professional instruction for beginners and intermediate anglers",
      "Rods, reels, waders, and tackle provided",
      "Trout streams near the Gatlinburg park gateway",
      "Catch-and-release streamside coaching",
    ],
    startDescription:
      "Meet at the tour operator location in Gatlinburg, TN confirmed at booking. Wear quick-dry clothing and closed-toe shoes.",
    endDescription:
      "Return to the Gatlinburg meeting point after the final streamside session.",
    itineraryItems: [
      {
        title: "Gatlinburg",
        description:
          "Check in, gear fitting, and casting basics before entering park streams.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Smoky Mountain Streams",
        description:
          "Travel to guided trout water with instruction on reading current and structure.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Guided Fly Fishing",
        description:
          "Streamside coaching on presentation, drift, and catch-and-release handling.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "Return to Gatlinburg",
        description:
          "Return gear and recap techniques at the Gatlinburg meeting point.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional fly fishing guide",
      "Rod, reel, and wader rental",
      "Flies and tackle",
      "Casting instruction",
    ],
    categories: ["Fishing Charters", "Nature and Wildlife Tours", "Half-day Tours"],
  },
  {
    productCode: "26480P8",
    productUrl:
      "https://www.viator.com/tours/Gatlinburg/Fall-Color-Tour-in-the-Smoky-Mountains/d24151-26480P8",
    title: "Fall Color Tour in the Smoky Mountains",
    description:
      "Chase peak autumn color in Great Smoky Mountains National Park on a guided fall foliage tour led by naturalists who track leaf progression weekly. Itineraries flex to the best color at tour time—high-elevation overlooks, ridgeline hikes, and quiet cove roads replace fixed routes when leaves peak at different elevations. Guides may include former park rangers and biologists who explain why the Smokies produce such vivid displays. Easy to moderate hiking keeps the outing accessible while maximizing color photography opportunities.",
    duration: "4 hours (approx.)",
    priceFrom: 170,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/04/42/ea.jpg",
    rating: 4.5,
    reviewCount: 11,
    highlights: [
      "Seasonal fall color tour in Great Smoky Mountains National Park",
      "Flexible routing based on current leaf peak locations",
      "Naturalist guides tracking weekly color progression",
      "Easy to moderate guided hiking included",
      "Photography stops at high-elevation overlooks",
    ],
    startDescription:
      "Meet at 1420 Fighting Creek Gap Rd, Gatlinburg, TN 37738. Fall color routes vary by week; confirm conditions when booking.",
    endDescription:
      "Return to the Gatlinburg meeting point after the final color overlook.",
    itineraryItems: [
      {
        title: "Gatlinburg",
        description:
          "Guide briefing on current fall color conditions and daily route plan.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "High-Elevation Overlooks",
        description:
          "Drive to ridge-top overlooks showing peak or near-peak autumn color.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Guided Fall Color Hike",
        description:
          "Easy to moderate hike through cove hardwoods at the best color elevation.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Scenic Mountain Views",
        description:
          "Final photo stop above the sea of autumn ridges before return.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional naturalist guide",
      "Van transport to color locations",
      "Trail snacks",
    ],
    categories: ["Bus Tours", "Nature and Wildlife Tours", "Seasonal Tours"],
  },
  {
    productCode: "26480P14",
    productUrl:
      "https://www.viator.com/tours/Gatlinburg/Best-of-the-Smokies/d24151-26480P14",
    title: "Smokies Custom Private Tour",
    description:
      "Build your ideal Smoky Mountains day on a private custom tour with A Walk in the Woods naturalist guides. Choose from waterfall hikes, history strolls, high-country vistas, or a mix of short experiences tailored to your group's fitness and interests. Your guide presents options at the meetup, then leads a full-day adventure with a included deli picnic lunch. This private format suits families and small groups who want flexible pacing through Great Smoky Mountains National Park without joining a fixed itinerary group.",
    duration: "8 hours (approx.)",
    priceFrom: 325,
    heroUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/04/42/ec.jpg",
    rating: 5,
    reviewCount: 3,
    highlights: [
      "Private full-day custom tour of Great Smoky Mountains National Park",
      "Guide-curated mix of hikes, vistas, and history stops",
      "Included deli sandwich picnic lunch",
      "Flexible pacing for your group's fitness level",
      "Naturalist guides with Wilderness First Responder certification",
    ],
    startDescription:
      "Meet your private guide at 1420 Fighting Creek Gap Rd, Gatlinburg, TN 37738 to select the day's adventure options.",
    endDescription:
      "Return to the Gatlinburg meeting point after your custom full-day itinerary.",
    itineraryItems: [
      {
        title: "Custom Trailhead",
        description:
          "Guide presents waterfall, vista, and history options matched to your group.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Waterfall Hike",
        description:
          "Primary guided hike to a waterfall or cascade route chosen for your party.",
        duration: "2 hours 30 minutes",
        stopType: "stop",
      },
      {
        title: "Historic Vista",
        description:
          "Scenic or cultural stop such as a pioneer site or ridge overlook.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Picnic Lunch Stop",
        description:
          "Deli sandwich picnic with chips and cookies at a scenic lunch spot.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private naturalist guide",
      "Deli picnic lunch",
      "Custom itinerary planning",
      "Trail snacks and water",
    ],
    categories: ["Private Tours", "Hiking Tours", "Full-day Tours"],
  },
];

const buildFixture = (tour: GreatSmokyMountainsTourFixture) => {
  const viatorRatings =
    GREAT_SMOKY_MOUNTAINS_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: {
        city: "Great Smoky Mountains National Park",
        state: "Tennessee",
      },
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
          question:
            "Where does the tour depart from near Great Smoky Mountains National Park?",
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
  const unavailable = GREAT_SMOKY_MOUNTAINS_TOURS.filter(tour =>
    ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS.has(tour.productCode)
  );

  if (unavailable.length > 0) {
    throw new Error(
      `Blocked unavailable Viator products: ${unavailable.map(t => t.productCode).join(", ")}`
    );
  }

  await validateEngine6CityProductAvailability({
    destinationLabel: "Great Smoky Mountains National Park",
    tours: GREAT_SMOKY_MOUNTAINS_TOURS.map(tour => ({
      productCode: tour.productCode,
      productUrl: tour.productUrl,
    })),
  });

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Great Smoky Mountains National Park",
    destinationCitySlug: "great-smoky-mountains-national-park",
    targetPremiumShare: 0.25,
    tours: GREAT_SMOKY_MOUNTAINS_TOURS,
    buildFixture,
    destinationLogLabel: "Great Smoky Mountains",
  });
};

await main();
