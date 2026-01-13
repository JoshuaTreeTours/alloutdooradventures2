import { Link } from "wouter";

import DestinationCard from "../components/DestinationCard";
import { featuredDestinations } from "../data/destinations";

const HERO_IMAGE_URL = "/hero.jpg"; // put your hero image in /public/hero.jpg

export default function Home() {
  return (
    <div>
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
            Why Choose Outdoor Adventures?
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
            {featuredDestinations.map((destination) => (
              <DestinationCard
                key={destination.name}
                destination={destination}
                ctaLabel="Discover"
                headingLevel="h3"
                descriptionVariant="featured"
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-black/10">
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-[#405040]">
          © {new Date().getFullYear()} Outdoor Adventures
        </div>
      </footer>
    </div>
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
