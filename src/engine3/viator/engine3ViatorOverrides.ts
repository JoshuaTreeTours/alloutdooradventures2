export type Engine3OverviewFactsOverride = {
  meetingPoint?: string;
  durationHours?: number;
  ageMin?: number;
  groupMax?: number;
  cancellationHours?: number;
  signatureHighlight?: string;
  included?: string[];
};

export const ENGINE3_VIATOR_OVERRIDES: Record<
  string,
  {
    description?: string;
    overviewFactsOverride?: Engine3OverviewFactsOverride;
    faqs?: Array<{ question: string; answer: string }>;
  }
> = {
  "2335P1": {
    description:
      "San Andreas Fault Jeep Tour from Palm Springs is a guided off-road experience in the Coachella Valley focused on fault geology, desert ecosystems, and oasis terrain. The route is operated in open-air Jeeps with commentary from a professional naturalist guide, with stops selected for on-site interpretation and photography. Published tour details list a typical duration of about three hours, meeting at Metate Ranch in Indio, and a maximum group size of seven guests per vehicle. The itinerary is designed for travelers seeking field context on the San Andreas Fault zone in a half-day format.",
    overviewFactsOverride: {
      meetingPoint: "Metate Ranch in Indio",
      durationHours: 3,
      ageMin: 5,
      groupMax: 7,
      cancellationHours: 48,
      signatureHighlight:
        "The route explores the San Andreas Fault zone and desert oasis terrain.",
      included: ["Professional guide", "Open-air Jeep transportation"],
    },
    faqs: [
      {
        question: "What is the cancellation policy for this tour?",
        answer:
          "Published tour terms list free cancellation up to 48 hours before the scheduled departure time.",
      },
      {
        question: "Where is the meeting point for departure?",
        answer:
          "Check-in is listed at Metate Ranch in Indio in the Palm Springs area; booking confirmation includes final timing details.",
      },
      {
        question: "What should guests bring on the tour?",
        answer:
          "Guests should bring sun protection, closed-toe footwear, drinking water, and weather-appropriate layers for an open-air vehicle ride.",
      },
      {
        question: "Is the tour suitable for children or guests needing accessibility support?",
        answer:
          "Published details list a minimum age of 5 years; accessibility requirements should be confirmed with the operator before booking.",
      },
      {
        question: "How long is the tour and how many people are in each vehicle?",
        answer:
          "The experience is typically about 3 hours, and listed maximum group size is 7 guests per vehicle.",
      },
    ],
  },
  "6740JTREE": {
    overviewFactsOverride: {
      meetingPoint: "Palm Desert",
      durationHours: 3,
      cancellationHours: 48,
      signatureHighlight:
        "Guests ride in an open-air Hummer through Joshua Tree desert scenery and geologic viewpoints.",
      included: ["Professional guide", "Bottled water"],
    },
  },
};
