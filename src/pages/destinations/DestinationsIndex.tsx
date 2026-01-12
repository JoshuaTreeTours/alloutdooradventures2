import { Link } from "wouter";

const STATES = [
  {
    name: "California",
    description: "Coastal drives, alpine hikes, and redwood escapes.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations/states/california",
  },
  {
    name: "Arizona",
    description: "Desert sunrises, canyon overlooks, and stargazing nights.",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations/states/arizona",
  },
  {
    name: "Nevada",
    description: "Hidden hot springs, high desert trails, and open skies.",
    image:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations/states/nevada",
  },
  {
    name: "Utah",
    description: "Slot canyons, iconic arches, and sandstone vistas.",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations/states/utah",
  },
  {
    name: "Oregon",
    description: "Waterfalls, misty forests, and volcanic ridgelines.",
    image:
      "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations/states/oregon",
  },
  {
    name: "Washington",
    description: "Rainforests, alpine lakes, and glacier-capped peaks.",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
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
            <a className="group relative overflow-hidden rounded-xl border border-black/10 bg-[#f7f3ea] shadow-sm">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${state.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="relative flex h-56 flex-col justify-end p-6 text-white">
                <h2 className="text-xl font-semibold">{state.name}</h2>
                <p className="mt-2 text-sm text-white/90">{state.description}</p>
                <span className="mt-4 inline-flex w-fit items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                  View adventures
                </span>
              </div>
            </a>
          </Link>
        ))}
      </section>
    </main>
  );
}
