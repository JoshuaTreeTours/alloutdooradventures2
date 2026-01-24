import { Link } from "wouter";

export default function Journeys() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-[#1f2a1f]">
      <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
        Journeys
      </p>
      <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
        Journeys
      </h1>
      <p className="mt-4 text-sm text-[#405040] md:text-base">
        Journeys are coming soon. We’re curating multi-stop itineraries and
        storytelling trip ideas to inspire your next adventure.
      </p>
      <div className="mt-8">
        <Link href="/guides">
          <a className="rounded-full border border-[#2f4a2f]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
            Browse guides
          </a>
        </Link>
      </div>
    </main>
  );
}
