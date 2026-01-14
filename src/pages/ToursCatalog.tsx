import { Link } from "wouter";

const ACTIVITY_CATEGORIES = [
  {
    title: "Hiking & trekking",
    description: "Guided hikes, summit pushes, and scenic day walks.",
    href: "/tours?activity=hiking",
  },
  {
    title: "Cycling & MTB",
    description: "Road rides, gravel routes, and mountain bike loops.",
    href: "/tours?activity=cycling",
  },
  {
    title: "Detours & day trips",
    description: "Short add-ons, food stops, and half-day excursions.",
    href: "/tours?activity=detours",
  },
  {
    title: "Multi-day adventures",
    description: "Overnights, hut trips, and multi-day guided loops.",
    href: "/tours?activity=multi-day",
  },
];

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const EUROPE_CITIES = [
  {
    region: "United Kingdom",
    cities: ["London", "Edinburgh", "Bath", "Manchester", "Bristol"],
  },
  {
    region: "France",
    cities: ["Paris", "Nice", "Lyon", "Bordeaux", "Chamonix"],
  },
  {
    region: "Italy",
    cities: ["Rome", "Florence", "Milan", "Venice", "Naples"],
  },
  {
    region: "Spain",
    cities: ["Barcelona", "Madrid", "Seville", "Valencia", "Bilbao"],
  },
  {
    region: "Portugal",
    cities: ["Lisbon", "Porto", "Madeira", "Faro"],
  },
  {
    region: "Switzerland",
    cities: ["Zurich", "Lucerne", "Interlaken", "Zermatt"],
  },
  {
    region: "Germany",
    cities: ["Berlin", "Munich", "Hamburg", "Cologne"],
  },
  {
    region: "Netherlands",
    cities: ["Amsterdam", "Rotterdam", "Utrecht"],
  },
  {
    region: "Greece",
    cities: ["Athens", "Santorini", "Crete"],
  },
  {
    region: "Nordics",
    cities: ["Copenhagen", "Stockholm", "Oslo", "Reykjavik", "Helsinki"],
  },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export default function ToursCatalog() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
          Tour catalog
        </span>
        <h1 className="text-3xl font-semibold text-[#2f4a2f] md:text-4xl">
          Browse tours by activity or destination
        </h1>
        <p className="max-w-3xl text-sm text-[#405040] md:text-base">
          This catalog is designed to grow with your tour inventory. Start with
          activity categories and region lists, then connect each destination to
          your tour pages and booking links as they go live.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/tours"
            className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]"
          >
            Tours home
          </Link>
          <Link
            href="/destinations"
            className="inline-flex items-center justify-center rounded-md bg-black/5 px-4 py-2 text-sm font-semibold text-[#2f4a2f] transition hover:bg-black/10"
          >
            Destinations
          </Link>
        </div>
      </header>

      <section className="mt-12">
        <div className="flex flex-col gap-2 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            Activity focus
          </span>
          <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            Tour styles your travelers ask for most
          </h2>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {ACTIVITY_CATEGORIES.map((category) => (
            <Link key={category.title} href={category.href}>
              <a className="flex h-full flex-col justify-between rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div>
                  <h3 className="text-base font-semibold text-[#1f2a1f]">
                    {category.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#405040]">
                    {category.description}
                  </p>
                </div>
                <span className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
                  Explore {category.title} →
                </span>
              </a>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="flex flex-col gap-2 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            United States
          </span>
          <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            All 50 states
          </h2>
          <p className="text-sm text-[#405040] md:text-base">
            Link each state to a future tour hub as you build inventory.
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {US_STATES.map((state) => (
            <Link key={state} href={`/tours/us/${slugify(state)}`}>
              <a className="rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm font-semibold text-[#2f4a2f] shadow-sm transition hover:border-[#2f4a2f]/40 hover:bg-white">
                {state}
              </a>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="flex flex-col gap-2 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            Europe
          </span>
          <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            Major cities to populate next
          </h2>
          <p className="text-sm text-[#405040] md:text-base">
            Use these as placeholders for city pages and specific tour listings.
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {EUROPE_CITIES.map((region) => (
            <div
              key={region.region}
              className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold text-[#1f2a1f]">
                {region.region}
              </h3>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {region.cities.map((city) => (
                  <Link
                    key={city}
                    href={`/tours/europe/${slugify(city)}`}
                  >
                    <a className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-[#2f4a2f] transition hover:border-[#2f4a2f]/40 hover:bg-white/90">
                      {city}
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
