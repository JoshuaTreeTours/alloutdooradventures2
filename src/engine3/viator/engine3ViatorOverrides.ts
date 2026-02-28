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
  }
> = {
  "2335P1": {
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
