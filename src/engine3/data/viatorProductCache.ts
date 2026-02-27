import type { ViatorProductData } from "../types";

export const viatorProductCacheByCode: Record<string, ViatorProductData> = {
  "2335P1": {
    sourceUrl:
      "https://www.viator.com/tours/Palm-Springs/San-Andreas-Fault-Jeep-Tour-from-Palm-Springs/d648-2335P1?pid=P00058975&uid=U00174482&mcid=58086&currency=USD",
    productCode: "2335P1",
    title: "San Andreas Fault Jeep Tour from Palm Springs",
    supplierImage: "https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa",
    priceFrom: "USD 175",
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
    duration: "3 hours",
  },
  "6488P7": {
    sourceUrl:
      "https://www.viator.com/tours/Palm-Springs/Indian-Canyons-Walking-Tour/d648-6488P7",
    productCode: "6488P7",
    title: "Indian Canyons Walking Tour",
    supplierImage: "https://cdn.filestackcontent.com/jdGA0GBmQtmU0ynb8Uwm",
    priceFrom: "USD 149",
    meetingPointDescription:
      "Departure point details are provided on the Viator booking page.",
    duration: "3 hours",
  },
};
