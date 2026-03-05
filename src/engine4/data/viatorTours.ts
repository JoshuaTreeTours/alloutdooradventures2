import type { Engine4ViatorApiTour, Engine4ViatorTourRecord } from "../types";

export const engine4ViatorTours: readonly Engine4ViatorTourRecord[] = [
  {
    engine: "engine4",
    bookingProvider: "viator",
    viator: {
      productCode: "74828P5",
      url: "https://www.viator.com/tours/Aspen/Aspen-East-End-Light-Hike/d26395-74828P5?pid=P00290915&mcid=42383&medium=link",
      sourceHeroImageUrl:
        "https://media.tacdn.com/media/attractions-splice-spp-360x240/11/8a/ad/05.jpg",
    },
    destination: {
      country: "united-states",
      state: "colorado",
      city: "aspen",
    },
    slug: "aspen-east-end-light-hike",
  },
  {
    engine: "engine4",
    bookingProvider: "viator",
    viator: {
      productCode: "74828P4",
      url: "https://www.viator.com/tours/Aspen/Aspens-Off-the-Beaten-Path-Tour/d26395-74828P4?pid=P00290915&mcid=42383&medium=link",
      sourceHeroImageUrl:
        "https://media.tacdn.com/media/attractions-splice-spp-360x240/06/74/7c/8f.jpg",
    },
    destination: {
      country: "united-states",
      state: "colorado",
      city: "aspen",
    },
    slug: "aspens-off-the-beaten-path-tour-74828p4",
  },
] as const;

export const engine4ViatorApiFallbackByProductCode: Record<
  string,
  Engine4ViatorApiTour
> = {
  "74828P5": {
    productCode: "74828P5",
    title: "Aspen East End Light Hike",
    sourceUrl: "https://www.viator.com/tours/Aspen/Aspen-East-End-Light-Hike/d26395-74828P5",
    fromPrice: "$65.00",
    priceCurrency: "USD",
    rating: 4.7,
    reviewCount: 3,
    duration: "2 hours",
    startTime: "8:15 AM",
    meetingPoint: "Wheeler Opera House, 320 E Hyman Ave, Aspen, CO 81611",
    cancellationPolicy: "Free cancellation up to 24 hours in advance.",
    sourceDerivedImageUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-360x240/11/8a/ad/05.jpg",
    overview:
      "Explore Aspen’s East End on a guided light hike designed for travelers who want a shorter, approachable outing. This experience runs for about 2 hours and departs at 8:15 AM, with meeting at Wheeler Opera House, 320 E Hyman Ave in Aspen. The route focuses on the East End area and is led by a guide, making it a straightforward way to get outside without committing to a full-day trek. At booking time, this tour is listed from $65.00 per person and currently shows a 4.7 rating based on 3 reviews. If your plans change, you can cancel up to 24 hours before the start time for a full refund under the listed cancellation terms.",
    highlights: [
      "Guided light-hike format in Aspen’s East End",
      "Approximate duration of 2 hours",
      "Scheduled start time at 8:15 AM",
      "Central meeting point at Wheeler Opera House",
      "From price listed at $65.00 per person",
      "Free cancellation up to 24 hours before start",
    ],
    faqs: [
      {
        question: "Where do we meet for the Aspen East End Light Hike?",
        answer:
          "The meeting point is Wheeler Opera House, 320 E Hyman Ave, Aspen, CO 81611.",
      },
      {
        question: "How long is the hike?",
        answer: "The experience duration is approximately 2 hours.",
      },
      {
        question: "What is the cancellation policy?",
        answer: "This tour offers free cancellation up to 24 hours in advance.",
      },
    ],
  },
  "74828P4": {
    productCode: "74828P4",
    title: "Aspen's Off the Beaten Path Tour",
    sourceUrl:
      "https://www.viator.com/tours/Aspen/Aspens-Off-the-Beaten-Path-Tour/d26395-74828P4",
    fromPrice: "$145.00",
    priceCurrency: "USD",
    rating: 5,
    reviewCount: 42,
    duration: "3 hours",
    cancellationPolicy: "Free cancellation up to 24 hours in advance.",
    sourceDerivedImageUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-360x240/06/74/7c/8f.jpg",
    overview:
      "Aspen's Off the Beaten Path Tour explores lesser-known corners of Aspen with a local guide and a small-group format. The experience is designed for travelers who want a flexible, half-day outing that balances local context with scenic viewpoints around town. Current listing details show this tour from $145.00 per person, with an average 5.0 rating based on 42 reviews and a duration of approximately 3 hours. The listing also indicates free cancellation up to 24 hours in advance.",
    highlights: [
      "Small-group guided format focused on quieter Aspen areas",
      "Approximate duration of 3 hours",
      "From price listed at $145.00 per person",
      "Current listing rating of 5.0 based on 42 reviews",
      "Free cancellation up to 24 hours before start",
    ],
    faqs: [
      {
        question: "How long is Aspen's Off the Beaten Path Tour?",
        answer: "The listed duration is approximately 3 hours.",
      },
      {
        question: "What does the current listing show for price?",
        answer: "The listing shows a from price of $145.00 per person.",
      },
      {
        question: "Is free cancellation available?",
        answer: "Yes. The listing indicates free cancellation up to 24 hours in advance.",
      },
    ],
  },
};
