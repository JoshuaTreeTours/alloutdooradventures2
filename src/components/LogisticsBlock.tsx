type LogisticsItem = {
  label: string;
  detail: string;
};

type LogisticsBlockProps = {
  heading?: string;
  items?: LogisticsItem[];
};

const DEFAULT_LOGISTICS: LogisticsItem[] = [
  { label: "Best time to visit", detail: "May through October for alpine access." },
  { label: "Getting there", detail: "2.5 hours from the nearest major airport." },
  { label: "Stay", detail: "Cabins, lodges, and campground options near trailheads." },
  { label: "Permits", detail: "Day hikes typically no permit; backpacking requires reservations." },
];

export default function LogisticsBlock({
  heading = "Plan the logistics",
  items = DEFAULT_LOGISTICS,
}: LogisticsBlockProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16" aria-label="Logistics">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
            {heading}
          </h2>
          <p className="mt-3 max-w-xl text-sm md:text-base text-[#405040] leading-relaxed">
            Use these quick facts to sketch your itinerary and prep gear.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-black/10 bg-white/70 p-5 shadow-sm"
          >
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7a8a6b]">
              {item.label}
            </h3>
            <p className="mt-2 text-sm text-[#405040] leading-relaxed">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
