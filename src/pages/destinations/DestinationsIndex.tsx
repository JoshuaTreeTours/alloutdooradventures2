import { Link } from "wouter";

const STATES = [
  {
    name: "California",
    description: "Coastal drives, alpine hikes, and redwood escapes.",
    href: "/destinations/states/california",
  },
  {
    name: "Arizona",
    description: "Desert sunrises, canyon overlooks, and stargazing nights.",
    href: "/destinations/states/arizona",
  },
  {
    name: "Nevada",
    description: "Hidden hot springs, high desert trails, and open skies.",
    href: "/destinations/states/nevada",
  },
  {
    name: "Utah",
    description: "Slot canyons, iconic arches, and sandstone vistas.",
    href: "/destinations/states/utah",
  },
  {
    name: "Oregon",
    description: "Waterfalls, misty forests, and volcanic ridgelines.",
    href: "/destinations/states/oregon",
  },
  {
    name: "Washington",
    description: "Rainforests, alpine lakes, and glacier-capped peaks.",
    href: "/destinations/states/washington",
  },
];

export default function DestinationsIndex() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="text-center">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#2f4a2f]">
          Destinations
        </h1>
        <p className="mt-4 text-sm md:text-base text-[#405040]">
          Explore our curated destinations across the American West. Choose a state
          to start planning your next adventure.
        </p>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-2" aria-label="States">
        {STATES.map((state) => (
          <Link key={state.name} href={state.href}>
            <a className="rounded-xl border border-black/10 bg-white/70 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <h2 className="text-xl font-semibold text-[#1f2a1f]">
                {state.name}
              </h2>
              <p className="mt-2 text-sm text-[#405040]">{state.description}</p>
              <span className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
                View adventures
              </span>
            </a>
          </Link>
        ))}
      </section>
    </main>
  );
}
