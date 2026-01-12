type Experience = {
  title: string;
  description: string;
  duration: string;
};

type ExperienceGridProps = {
  heading?: string;
  experiences?: Experience[];
};

const DEFAULT_EXPERIENCES: Experience[] = [
  {
    title: "Granite Summit Trek",
    description: "Guided day hike with panoramic overlooks and alpine lakes.",
    duration: "Full day",
  },
  {
    title: "Waterfall Loop Adventure",
    description: "Family-friendly loop featuring cascading falls and shaded groves.",
    duration: "Half day",
  },
  {
    title: "Stargazing Campout",
    description: "Overnight escape with ranger-led night skies and campfire meals.",
    duration: "Overnight",
  },
];

export default function ExperienceGrid({
  heading = "Signature experiences",
  experiences = DEFAULT_EXPERIENCES,
}: ExperienceGridProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16" aria-label="Experiences">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
          {heading}
        </h2>
        <p className="mt-3 max-w-2xl text-sm md:text-base text-[#405040] leading-relaxed">
          Mix and match these itineraries to build the perfect adventure.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {experiences.map((experience) => (
          <div
            key={experience.title}
            className="rounded-xl border border-black/10 bg-white/70 p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-[#1f2a1f]">
              {experience.title}
            </h3>
            <p className="mt-2 text-sm text-[#405040] leading-relaxed">
              {experience.description}
            </p>
            <span className="mt-4 inline-flex w-fit items-center rounded-full bg-[#eef2e3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
              {experience.duration}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
