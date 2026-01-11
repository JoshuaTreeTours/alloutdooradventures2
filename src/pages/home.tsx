import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f1e3] text-[#1f2a1f]">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f7f1e3]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="text-lg font-semibold tracking-tight">
            <Link href="/">All Outdoor Adventures</Link>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link href="/destinations" className="hover:opacity-75">
              Destinations
            </Link>
            <Link href="/tours" className="hover:opacity-75">
              Tours
            </Link>
            <Link href="/about" className="hover:opacity-75">
              About
            </Link>
            <Link
              href="/find"
              className="rounded bg-[#1f3b24] px-4 py-2 font-semibold text-white hover:opacity-90"
            >
              Find an Adventure
            </Link>
          </nav>

          {/* Mobile: just show the CTA (simple + effective) */}
          <div className="md:hidden">
            <Link
              href="/find"
              className="rounded bg-[#1f3b24] px-3 py-2 text-sm font-semibold text-white"
            >
              Find
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        {/* Background image */}
        <div className="relative h-[540px] w-full overflow-hidden md:h-[620px]">
          <img
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2400&q=80"
            alt="Desert canyon road trip"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
        </div>

        {/* Hero content */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-6xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl text-center md:text-left"
            >
              <h1 className="text-4xl font-extrabold leading-tight text-white md:text-6xl">
                Find Your Next Adventure
              </h1>
              <p className="mt-5 text-lg text-white/90 md:text-xl">
                The ultimate field guide to outdoor experiences across America.
                <br className="hidden md:block" />
                From desert canyons to mountain peaks, we help you explore the wild.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 md:flex-row md:items-start">
                <Link
                  href="/destinations"
                  className="rounded bg-[#1f3b24] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  Explore Destinations
                </Link>
                <Link
                  href="/tours"
                  className="rounded bg-white/25 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/40 hover:bg-white/30"
                >
                  View Tours
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <h2 className="text-center text-3xl font-extrabold md:text-4xl">
          Why Choose All Outdoor Adventures?
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-center text-base leading-relaxed text-black/70">
          We curate the best outdoor experiences, vetted by locals and seasoned travelers.
          No tourist traps, just authentic adventures.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Curated Experiences",
              body: "Only the tours and activities we’d recommend to friends.",
            },
            {
              title: "Local Insight",
              body: "Guides and partners who actually know the terrain, weather, and seasons.",
            },
            {
              title: "Book With Confidence",
              body: "Clear expectations, quality operators, and trip-ready details.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-xl border border-black/10 bg-white/40 p-6 shadow-sm"
            >
              <div className="text-lg font-bold">{c.title}</div>
              <div className="mt-2 text-sm leading-relaxed text-black/70">{c.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured grid */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="flex items-end justify-between gap-4">
          <h3 className="text-2xl font-extrabold">Featured Adventures</h3>
          <Link href="/find" className="text-sm font-semibold text-[#1f3b24] hover:underline">
            See all →
          </Link>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            { title: "Joshua Tree National Park", tag: "Desert • Stargazing • Geology" },
            { title: "Palm Springs & Coachella Valley", tag: "Canyons • Off-road • Views" },
            { title: "Santa Barbara Coast", tag: "Sailing • Sunset • Ocean air" },
          ].map((item) => (
            <div
              key={item.title}
              className="overflow-hidden rounded-xl border border-black/10 bg-white/40 shadow-sm"
            >
              <div className="h-44 w-full bg-black/10" />
              <div className="p-5">
                <div className="text-lg font-bold">{item.title}</div>
                <div className="mt-1 text-sm text-black/70">{item.tag}</div>
                <div className="mt-4">
                  <Link
                    href="/find"
                    className="inline-flex rounded bg-[#1f3b24] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                  >
                    Find tours
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/10 bg-[#f7f1e3]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-black/65 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} All Outdoor Adventures</div>
          <div className="flex gap-6">
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <Link href="/tours" className="hover:underline">
              Tours
            </Link>
            <Link href="/destinations" className="hover:underline">
              Destinations
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
