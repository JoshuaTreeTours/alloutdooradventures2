import { Link } from "wouter";

const HERO_IMAGE_URL = "/hero.jpg"; // put your hero image in /public/hero.jpg

export default function Home() {
  return (
    <div>
      <Header />

      <main>
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
                <Link
                  href="/destinations"
                  className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#294129] transition"
                >
                  Explore Destinations
                </Link>
                <Link
                  href="/tours"
                  className="inline-flex items-center justify-center rounded-md bg-white/25 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/40 hover:bg-white/30 transition"
                >
                  View Tours
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16" aria-label="Why choose">
          <h2 className="text-center text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
            Why Choose All Outdoor Adventures?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm md:text-base text-[#405040] leading-relaxed">
            We curate the best outdoor experiences, vetted by locals and seasoned travelers.
            No tourist traps—just authentic adventures.
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
        <Link href="/" className="text-lg font-semibold text-[#1f2a1f]">
          All Outdoor Adventures
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-[#405040]">
          <Link className="hover:text-[#1f2a1f]" href="/destinations">
            Destinations
          </Link>
          <Link className="hover:text-[#1f2a1f]" href="/tours">
            Tours
          </Link>
          <Link className="hover:text-[#1f2a1f]" href="/about">
            About
          </Link>
        </nav>

        <Link
          href="/tours"
          className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#294129] transition"
        >
          Find an Adventure
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
