import { Link } from "wouter";

export default function About() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-[#1f2a1f]">
      <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
        About
      </p>
      <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
        About Outdoor Adventures
      </h1>
      <p className="mt-4 text-sm text-[#405040] md:text-base">
        Outdoor Adventures connects travelers with curated tours, destination
        guides, and multi-day itineraries built for explorers.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/tours">
          <a className="rounded-full border border-[#2f4a2f]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
            Browse tours
          </a>
        </Link>
        <Link href="/guides">
          <a className="rounded-full border border-[#2f4a2f]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
            Read guides
          </a>
        </Link>
      </div>
    </main>
  );
}
