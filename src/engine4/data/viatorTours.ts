import type { Engine4ViatorApiTour, Engine4ViatorTourRecord } from "../types";

export const engine4ViatorTours: readonly Engine4ViatorTourRecord[] = [
  {
    engine: "engine4",
    bookingProvider: "viator",
    viator: {
      productCode: "74828P5",
      url: "https://www.viator.com/tours/Aspen/Aspen-East-End-Light-Hike/d26395-74828P5?pid=P00290915&mcid=42383&medium=link",
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
      url: "https://www.viator.com/tours/Aspen/Aspens-Off-the-Beaten-Path-Tour/d26395-74828P4",
    },
    destination: {
      country: "united-states",
      state: "colorado",
      city: "aspen",
    },
    slug: "aspens-off-the-beaten-path-tour",
  },
] as const;

export const engine4ViatorApiFallbackByProductCode: Record<
  string,
  Engine4ViatorApiTour
> = {
  "74828P5": {
    productCode: "74828P5",
    title: "Aspen East End Light Hike",
    sourceUrl:
      "https://www.viator.com/tours/Aspen/Aspen-East-End-Light-Hike/d26395-74828P5?pid=P00290915&mcid=42383&medium=link",
    fromPrice: "$65.00",
    priceCurrency: "USD",
    rating: 4.7,
    reviewCount: 3,
    duration: "2 hours",
    startTime: "8:15 AM",
    meetingPoint: "Wheeler Opera House, 320 E Hyman Ave, Aspen, CO 81611",
    cancellationPolicy: "Free cancellation up to 24 hours in advance.",
    sourceDerivedImageUrl:
      "https://media.tacdn.com/media/photo-o/11/8a/ad/05/caption.jpg",
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
    title: "Aspen’s Off the Beaten Path Tour",
    sourceUrl:
      "https://www.viator.com/tours/Aspen/Aspens-Off-the-Beaten-Path-Tour/d26395-74828P4",
    fromPrice: "$45",
    priceCurrency: "USD",
    rating: 5.0,
    reviewCount: 23,
    duration: "1h 30m",
    meetingPoint:
      "Across from Wheeler Opera House on the downtown brick pedestrian mall",
    cancellationPolicy: "Free cancellation up to 24 hours before start",
    sourceDerivedImageUrl:
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
    overview:
      "This guided walking tour of Aspen’s West End offers a deeper look at the neighborhood’s architecture, stories, and local culture beyond the downtown core. Over approximately 1 hour 30 minutes, your guide leads a moderate-paced route of roughly 1.5 miles through historic residential streets and scenic sections along the Roaring Fork River. The experience also includes the John Denver Sanctuary area, where Aspen’s natural setting and cultural identity come together. With a central meeting point across from the Wheeler Opera House on the pedestrian mall, this tour is a practical option for visitors who want meaningful context while exploring Aspen on foot.",
    highlights: [
      "Guided walking tour through Aspen’s historic West End",
      "Approximate duration of 1 hour 30 minutes",
      "Explore riverside trails along the Roaring Fork River",
      "Visit the John Denver Sanctuary area",
      "Learn about Aspen architecture and local history",
      "Central downtown meeting point near Wheeler Opera House",
      "Free cancellation up to 24 hours before departure",
    ],
    faqs: [
      {
        question: "Where does the tour start?",
        answer:
          "Meet near the Wheeler Opera House on Aspen’s downtown pedestrian mall.",
      },
      {
        question: "How long is the tour?",
        answer: "The walking tour lasts approximately 1 hour 30 minutes.",
      },
      {
        question: "How far do we walk?",
        answer:
          "The route covers roughly 1.5 miles through neighborhoods and river paths.",
      },
      {
        question: "What is the cancellation policy?",
        answer:
          "Bookings can be cancelled up to 24 hours before the start time for a full refund.",
      },
    ],
  },
};
