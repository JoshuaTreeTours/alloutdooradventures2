export type TourFaq = { q: string; a: string };

export const buildTourFaqs = (input: {
  title: string;
  duration?: string | null;
  age?: string | null;
  cancellation?: string | null;
}): TourFaq[] => [
  {
    q: "Is this suitable for beginners, and what fitness level should I expect?",
    a: "Yes. Most Joshua Tree tours are beginner-friendly with guided pacing; check booking page for exact fitness expectations.",
  },
  {
    q: "What ages are allowed on this tour?",
    a: input.age?.trim() || "Check booking page for exact details.",
  },
  {
    q: "What should I wear and bring?",
    a: "Bring sun protection, water, and sturdy shoes; check booking page for exact details.",
  },
  {
    q: "How long is the tour and what is included?",
    a: `${input.duration ? `The listed duration is ${input.duration}. ` : ""}Included items vary by departure, so check booking page for exact details.`,
  },
  {
    q: "How do reservations and cancellations work?",
    a: input.cancellation?.trim() || "Check booking page for exact details.",
  },
];
