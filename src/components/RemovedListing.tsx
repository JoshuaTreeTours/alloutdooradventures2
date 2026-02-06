import { Link } from "wouter";

export default function RemovedListing() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
      <h1 className="text-3xl font-semibold md:text-4xl">
        Listing no longer available
      </h1>
      <p className="mt-4 text-sm text-[#405040] md:text-base">
        This tour listing could not be found. Explore current options from our
        active catalog.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/tours">
          <a className="rounded-full border border-[#2f4a2f]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
            Browse tours
          </a>
        </Link>
        <Link href="/destinations">
          <a className="rounded-full border border-[#2f4a2f]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
            View destinations
          </a>
        </Link>
      </div>
    </main>
  );
}
