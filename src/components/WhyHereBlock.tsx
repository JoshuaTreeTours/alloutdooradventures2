type Reason = {
  title: string;
  description: string;
};

type WhyHereBlockProps = {
  heading?: string;
  reasons?: Reason[];
};

const DEFAULT_REASONS: Reason[] = [
  {
    title: "Scenic diversity",
    description: "Granite domes, meadows, and river valleys all within an hour.",
  },
  {
    title: "Four-season access",
    description: "Wildflowers in spring, cool alpine hikes in summer, golden fall drives.",
  },
  {
    title: "Local expertise",
    description: "Guides who know the best trail windows, shuttles, and viewpoints.",
  },
];

export default function WhyHereBlock({
  heading = "Why adventure here",
  reasons = DEFAULT_REASONS,
}: WhyHereBlockProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16" aria-label="Why here">
      <h2 className="text-2xl md:text-3xl font-semibold text-[#2f4a2f] text-center">
        {heading}
      </h2>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {reasons.map((reason) => (
          <div
            key={reason.title}
            className="rounded-lg border border-black/10 bg-[#f7f3ea] p-6"
          >
            <h3 className="text-base font-semibold text-[#1f2a1f]">
              {reason.title}
            </h3>
            <p className="mt-2 text-sm text-[#405040] leading-relaxed">
              {reason.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
