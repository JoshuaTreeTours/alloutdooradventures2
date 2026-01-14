import { Link } from "wouter";

export default function ToursIndex() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#2f4a2f]">
          Tours
        </h1>
        <p className="mt-3 max-w-2xl text-sm md:text-base text-[#405040] leading-relaxed">
          Browse tours by destination. This page is a starter hub—you can expand it
          into categories, featured tours, and booking links.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/tours/catalog"
            className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#294129] transition"
          >
            View tour catalog
          </Link>
          <Link
            href="/destinations"
            className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#294129] transition"
          >
            Explore Destinations
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-black/5 px-4 py-2 text-sm font-semibold text-[#2f4a2f] hover:bg-black/10 transition"
          >
            Home
          </Link>
        </div>
      </header>

      <section className="rounded-xl border border-black/10 bg-white/60 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1f2a1f]">Next step</h2>
        <p className="mt-2 text-sm text-[#405040] leading-relaxed">
          Decide whether tours live as:
          <span className="font-semibold"> /tours</span> (all tours),
          or nested under destinations like
          <span className="font-semibold"> /destinations/states/:state</span>.
        </p>
      </section>
    </main>
  );
}
