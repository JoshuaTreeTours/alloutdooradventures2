import { Link } from "wouter";

const HERO_IMAGE_URL = "/hero.jpg"; // put your hero image in /public/hero.jpg

const FEATURED_DESTINATIONS = [
  {
    name: "California",
    description:
      "Surf to summit with coastal cliffs, redwood groves, and alpine trails.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations/states/california",
  },
  {
    name: "Arizona",
    description:
      "Sunrise hikes, canyon overlooks, and desert skies that glow at dusk.",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations/states/arizona",
  },
  {
    name: "Nevada",
    description: "Wide-open basins, rugged ranges, and hidden hot springs.",
    image:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations/states/nevada",
  },
  {
    name: "Utah",
    description:
      "Iconic arches, canyon slots, and sandstone trails made for exploration.",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations/states/utah",
  },
  {
    name: "Oregon",
    description: "Waterfalls, misty forests, and volcanic peaks around every bend.",
    image:
      "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations/states/oregon",
  },
  {
    name: "Washington",
    description:
      "Coastal rainforests, alpine lakes, and glacier-capped peaks to explore.",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    href: "/destinations/states/washington",
  },
];

export default function Home() {
  return (
    <div>
      <Header />

      <main>
        {/* HERO */}
        <section
          className="relative mx-auto max-w-[1400px] px-6 pt-6"
          aria-label="Hero"
        >
          <div className="relative overflow-hidden rounded-none md:rounded-md">
            {/* Background image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
            />
            {/* Dark overlay for readable text */}
            <div className="absolute inset-0 bg-black/35" />

            {/* Content */}
            <div className="relative px-6 py-20 md:px-16 md:py-28 text-center text-white">
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
                Find Your Next Adventure
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-white/90 leading-relaxed">
                The ultimate field guide to outdoor experiences across America.
                <br />
                From desert canyons to mountain peaks, we help you explore the wild.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/destinations">
                  <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#294129] transition">
                    Explore Destinations
                  </a>
                </Link>

                <Link href="/tours">
                  <a className="inline-flex items-center justify-center rounded-md bg-white/25 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/40 hover:bg-white/30 transition">
                    View Tours
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE */}
        <section className="mx-auto max-w-6xl px-6 py-16" aria-label="Why choose">
          <h2 className="text-center text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
            Why Choose All Outdoor Adventures?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm md:text-base text-[#405040] leading-relaxed">
            We curate the best outdoor experiences, vetted by locals and seasoned
            travelers. No tourist traps—just authentic adventures.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Card
              title="Curated Experiences"
              body="Handpicked tours and activities with a focus on quality, safety, and unforgettable scenery."
            />
            <Card
              title="Local Knowledge"
              body="We work with operators who know their terrain—so you get the real story, not brochure fluff."
            />
            <Card
              title="Easy Discovery"
              body="Browse destinations and tours fast, then book with confidence. Simple choices, great outcomes."
            />
          </div>
        </section>

        {/* FEATURED DESTINATIONS (Codex section) */}
        <section className="mx-auto max-w-6xl px-6 pb-20" aria-label="Featured destinations">
          <div className="flex flex-col items-center text-center">
            <span className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
              Featured Destinations
            </span>
            <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
              Plan your next escape
            </h2>
            <p className="mt-3 max-w-2xl text-sm md:text-base text-[#405040] leading-relaxed">
              Explore handcrafted itineraries across the West—each destination blends
              signature landscapes with local-guided adventure.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {FEATURED_DESTINATIONS.map((destination) => (
              <Link key={destination.name} href={destination.href}>
                <a className="group relative overflow-hidden rounded-xl border border-black/10 bg-[#f7f3ea] shadow-sm">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${destination.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="relative flex h-56 flex-col justify-end p-6 text-white">
                    <h3 className="text-xl font-semibold">{destination.name}</h3>
                    <p className="mt-2 text-sm text-white/90">
                      {destination.description}
                    </p>
                    <span className="mt-4 inline-flex w-fit items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                      Discover
                    </span>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-black/10">
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-[#405040]">
          © {new Date().getFullYear()} All Outdoor Adventures
        </div>
      </footer>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#f6f1e8]/95 backdrop-blur border-b border-black/10">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/">
          <a className="text-lg font-semibold text-[#1f2a1f]">
            All Outdoor Adventures
          </a>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-[#405040]">
          <Link href="/destinations">
            <a className="hover:text-[#1f2a1f]">Destinations</a>
          </Link>
          <Link href="/tours">
            <a className="hover:text-[#1f2a1f]">Tours</a>
          </Link>
          <Link href="/about">
            <a className="hover:text-[#1f2a1f]">About</a>
          </Link>
        </nav>

        <Link href="/tours">
          <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#294129] transition">
            Find an Adventure
          </a>
        </Link>
      </div>
    </header>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white/55 p-6 shadow-sm">
      <h3 className="text-base font-semibold text-[#1f2a1f]">{title}</h3>
      <p className="mt-2 text-sm text-[#405040] leading-relaxed">{body}</p>
    </div>
  );
}
