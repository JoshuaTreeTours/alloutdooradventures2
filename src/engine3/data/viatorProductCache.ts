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
  "6740P7": {
    sourceUrl:
      "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Backroads-Hummer-H2-Tour/d648-6740P7",
    productCode: "6740P7",
    title: "Joshua Tree National Park Scenic Tour",
    supplierImage:
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
    imageCandidates: [
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
    ],
    priceFrom: "$159.00",
    priceCurrency: "USD",
    rating: 4.7,
    reviewCount: 519,
    operatorName: "Desert Adventures Red Jeep Tours",
    highlights: [
      "Small-group scenic route through Joshua Tree National Park basins and granite formations",
      "Photo stops and short walks at Cap Rock, Intersection Rock, Barker Dam, and Keys View",
      "Guide context on desert geology, the San Andreas Fault, and Cahuilla cultural history",
    ],
    description:
      "See Joshua Tree National Park on a small-group scenic tour that trades guesswork for a guide who actually knows where the good stuff is. Starting from the Palm Springs Art Museum area, you’ll ride in an air-conditioned vehicle and spend roughly 3–5 hours exploring desert basins, granite formations, and classic Joshua tree scenery. Along the way, your route includes photo stops and short walks at well-known points like Cap Rock, Intersection Rock, Barker Dam, and Keys View—so you get both the big vistas and the up-close textures. Expect context on the forces that shaped this landscape, including the San Andreas Fault, plus regional cultural history tied to the Cahuilla people.",
    meetingPointDescription: "Meeting point: Palm Springs Art Museum area.",
    meetingPointText: "Palm Springs Art Museum (select at booking)",
    duration: "3 to 5 hours (approx.)",
    itinerary: [
      { title: "Joshua Tree National Park", order: 1 },
      { title: "Cap Rock Trail", order: 2 },
      { title: "Intersection Rock", order: 3 },
      { title: "Barker Dam Trail", order: 4 },
      { title: "Keys View", order: 5 },
    ],
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
