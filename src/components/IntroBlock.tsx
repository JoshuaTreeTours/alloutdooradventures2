type IntroBlockProps = {
  eyebrow?: string;
  heading?: string;
  description?: string;
};

export default function IntroBlock({
  eyebrow = "The Essentials",
  heading = "Your launchpad to iconic alpine adventures",
  description =
    "From sunrise ridgelines to wildflower meadows, this location mixes big views with accessible day trips. Build a flexible itinerary with guided hikes, scenic drives, and lake days.",
}: IntroBlockProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-14" aria-label="Intro">
      <div className="text-center">
        <span className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
          {eyebrow}
        </span>
        <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
          {heading}
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-sm md:text-base text-[#405040] leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  );
}
