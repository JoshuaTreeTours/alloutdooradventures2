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
  "6740JTREE": {
    sourceUrl:
      "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Hummer-Adventure-from-Palm-Desert/d648-6740JTREE",
    productCode: "6740JTREE",
    title: "Joshua Tree Hummer Adventure from Palm Desert",
    supplierImage:
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
    imageCandidates: [
      "https://dynamic-media.tacdn.com/media/photo-o/2f/globalNav/fallback-image.webp",
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
    ],
    priceFrom: "USD 199",
    priceCurrency: "USD",
    rating: 4.8,
    reviewCount: 642,
    operatorName: "Desert Adventures Red Jeep Tours",
    highlights: [
      "Travel in an open-air Hummer through Joshua Tree National Park terrain",
      "Stop at geologic landmarks and panoramic viewpoints",
      "Guide commentary on desert ecology and regional history",
    ],
    included: ["Professional guide", "Bottled water"],
    meetingPointDescription: "Departures operate from Palm Desert.",
    departureLocation: "Palm Desert",
    cancellationWindowHours: 48,
    vehicleType: "open-air Hummer",
    signatureHighlight:
      "The route features Joshua Tree desert scenery with geologic stops and panoramic viewpoints.",
    duration: "3 hours",
    latitude: 33.7226,
    longitude: -116.3745,
  },
  "2335P1": {
    sourceUrl:
      "https://www.viator.com/tours/Palm-Springs/San-Andreas-Fault-Jeep-Tour-from-Palm-Springs/d648-2335P1?mcid=58086&pid=P00290915&medium=link&api_version=2.0&uid=U00174482&currency=USD",
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
