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
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1600&h=1200&s=1",
    imageCandidates: [
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=800&h=600&s=1",
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1600&h=1200&s=1",
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
    ],
    priceFrom: "USD 199",
    priceCurrency: "USD",
    rating: 4.8,
    reviewCount: 642,
    operatorName: "Desert Adventures Red Jeep Tours",
    highlights: [
      "Ride in an open-air Hummer H2 along Joshua Tree backroads and desert tracks",
      "Guide-led stops at geologic formations and panoramic viewpoints",
      "Interpretation on regional desert ecology and local history",
    ],
    included: ["Professional guide", "Bottled water"],
    meetingPointName: "Palm Springs Art Museum",
    meetingPointAddress: "101 N Museum Dr",
    departureTimeLabel: "daily at 8:30 a.m.",
    meetingPointDescription:
      "Palm Springs Art Museum (101 N Museum Dr) — daily at 8:30 a.m.",
    departureLocation: "Palm Springs Art Museum",
    cancellationWindowHours: 48,
    vehicleType: "open-air Hummer H2",
    signatureHighlight:
      "The route follows Joshua Tree backroads with geologic viewpoints and open-desert scenery.",
    duration: "3 hours",
    latitude: 33.8246,
    longitude: -116.5414,
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
