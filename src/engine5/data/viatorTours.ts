import type { Engine5ViatorApiTour } from "../types";
import { engine5ProofViatorRecord } from "../viator/record";

export const engine5ViatorTours = [engine5ProofViatorRecord] as const;

export const engine5ViatorApiFallbackByProductCode: Record<
  string,
  Engine5ViatorApiTour
> = {
  "132218P209": {
    productCode: "132218P209",
    title: "Best Yosemite National Park and Kings Canyon National Park 2-Day Tour from LA",
    bookingUrl:
      "https://www.viator.com/tours/Los-Angeles/example/d645-132218P209",
    description: "Two-day guided trip from Los Angeles.",
    duration: "2 days",
    fromPrice: "$279.00",
    priceCurrency: "USD",
    rating: 4.5,
    reviewCount: 96,
    meetingPoint: "6801 Hollywood Blvd, Los Angeles, CA 90028, USA",
    cancellationPolicy:
      "For a full refund, cancel at least 24 hours in advance of the start date of the experience.",
    itinerary: [],
    highlights: ["Visit Yosemite Valley"],
    faqs: [{ question: "Meals?", answer: "Not included" }],
    inclusions: [],
    exclusions: [],
    additionalInfo: [],
    exactProductImages: [
      {
        isCover: true,
        variants: [
          {
            url: "https://dynamic-media.tacdn.com/media/photo-o/11/22/caption.jpg",
            width: 1600,
            height: 900,
          },
        ],
      },
    ],
    canonicalHeroUrl:
      "https://dynamic-media.tacdn.com/media/photo-o/11/22/caption.jpg",
    heroSelectionSource: "api-images-payload",
    heroSelectionSize: {
      width: 1600,
      height: 900,
    },
    heroSelectionDiagnostics: {
      candidateUrls: [
        "https://dynamic-media.tacdn.com/media/photo-o/11/22/caption.jpg",
      ],
    },
    provenance: {
      apiFetchAttempted: true,
      apiFetchSucceeded: true,
      descriptionSource: "api",
    },
  },
};
