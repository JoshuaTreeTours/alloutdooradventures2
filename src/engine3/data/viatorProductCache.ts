import type { ViatorProductData } from "../types";

export const viatorProductCacheByCode: Record<string, ViatorProductData> = {
  "3351P15": {
    sourceUrl:
      "https://www.viator.com/tours/Palm-Springs/Palm-Springs-Indian-Canyons-Bike-and-Hike/d648-3351P15",
    productCode: "3351P15",
    title: "Palm Springs Indian Canyons Bike and Hike",
    supplierImage: "https://cdn.filestackcontent.com/jdGA0GBmQtmU0ynb8Uwm",
    imageCandidates: ["https://cdn.filestackcontent.com/jdGA0GBmQtmU0ynb8Uwm"],
    priceFrom: "$149.00",
    priceCurrency: "USD",
    reviewCount: 216,
    highlights: [
      "Guided bike-and-hike format in the Indian Canyons area near Palm Springs",
      "Combines cycling segments with on-foot trail exploration",
      "Focus on canyon landscapes and desert scenery",
    ],
    meetingPointDescription:
      "1590 S Palm Canyon Dr, Palm Springs, CA 92264, USA",
    meetingPointText: "1590 S Palm Canyon Dr, Palm Springs, CA 92264, USA",
  },
  "6740P7": {
    sourceUrl:
      "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Backroads-Hummer-H2-Tour/d648-6740P7",
    productCode: "6740P7",
    title: "Joshua Tree Backroads Hummer H2 Tour",
    supplierImage:
      "https://dynamic-media.tacdn.com/media/photo-o/2f/4f/17/7a/caption.jpg?w=1200&h=800&s=1",
    imageCandidates: [
      "https://dynamic-media.tacdn.com/media/photo-o/2f/4f/17/7a/caption.jpg?w=1200&h=800&s=1",
      "https://dynamic-media.tacdn.com/media/photo-o/2f/4f/17/87/caption.jpg?w=1200&h=800&s=1",
      "https://dynamic-media.tacdn.com/media/photo-o/2f/4f/17/91/caption.jpg?w=1200&h=800&s=1",
    ],
    priceFrom: "USD 199",
    priceCurrency: "USD",
    rating: 4.8,
    reviewCount: 642,
    operatorName: "Desert Adventures Red Jeep Tours",
    overview:
      "This guided Joshua Tree outing uses an open-air Hummer H2 to access backroad terrain across the national park landscape from the Palm Springs area. Travelers follow a structured route with a professional guide who explains desert geology, native plant zones, and regional history while moving between key viewpoints. Depending on conditions, itinerary stops can include Cap Rock Trail, Barker Dam Trail, and Keys View, each selected for distinctive terrain and broad park perspectives. The experience is designed as a small-group format with planned timing, water support, and interpretation throughout the drive and stop sequence. This format works well for visitors who want a vehicle-based park introduction with context on landmarks, habitat, and route logistics in one half-day program.",
    highlights: [
      "Travel in an open-air Hummer H2 through Joshua Tree backroad terrain",
      "Guide-led interpretation focused on geology, ecology, and regional history",
      "Itinerary can include Cap Rock Trail, Barker Dam Trail, and Keys View when operating conditions allow",
      "Small-group format with planned stops and desert viewpoint access",
    ],
    included: ["Professional guide", "Bottled water"],
    itinerary: [
      {
        title: "Cap Rock Trail",
        description:
          "Short interpretive stop in a rock formation area used to explain desert geology and vegetation patterns.",
        order: 1,
      },
      {
        title: "Barker Dam Trail",
        description:
          "Park stop with guide context on historical water management, habitat, and trail conditions.",
        order: 2,
      },
      {
        title: "Keys View",
        description:
          "Panoramic overlook used for orientation to the Coachella Valley and surrounding mountain ranges.",
        order: 3,
      },
    ],
    meetingPointText:
      "Palm Springs Art Museum, 101 N Museum Dr, Palm Springs, CA",
    meetingPointDescription:
      "Palm Springs Art Museum, 101 N Museum Dr, Palm Springs, CA",
    departureTimeText: "Daily at 8:30 a.m.",
    cancellationWindowHours: 48,
    vehicleType: "open-air Hummer H2",
    signatureHighlight:
      "The route combines Joshua Tree backroads access with named park viewpoint stops and guide interpretation.",
    duration: "3 hours",
    latitude: 33.7226,
    longitude: -116.3745,
  },
  "2335P1": {
    sourceUrl:
      "https://www.viator.com/tours/Palm-Springs/San-Andreas-Fault-Jeep-Tour-from-Palm-Springs/d648-2335P1?pid=P00058975&uid=U00174482&mcid=58086&currency=USD",
    productCode: "2335P1",
    title: "San Andreas Fault Jeep Tour from Palm Springs",
    supplierImage: "https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa",
    imageCandidates: ["https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa"],
    priceFrom: "USD 175",
    priceCurrency: "USD",
    rating: 4.5,
    reviewCount: 117,
    highlights: [
      "Open-air Jeep ride through the San Andreas Fault zone",
      "Guide-led geology interpretation at key viewpoints",
      "Stops near desert washes and fan-palm oasis habitat",
    ],
    included: [
      "Professional guide",
      "Guided Jeep transportation",
      "Interpretive geology commentary",
    ],
    notIncluded: [
      "Guide gratuities",
      "Hotel pickup and drop-off unless selected",
    ],
    meetingPointDescription: "Tours meet at Metate Ranch in Indio.",
    meetingLocation: "Metate Ranch in Indio",
    maxGroupSize: 7,
    minAge: 5,
    cancellationWindowHours: 48,
    vehicleType: "open-air Jeep",
    signatureHighlight:
      "The route explores the San Andreas Fault zone and nearby desert oasis terrain.",
    duration: "3 hours",
    operatorName: "Desert Adventures Red Jeep Tours",
  },
};
