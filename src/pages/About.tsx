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

      <section className="mt-16 rounded-3xl border border-black/5 bg-white/60 p-6 shadow-sm md:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <div className="w-full md:w-5/12">
            <img
              src="/images/jerry-sybers.jpg"
              alt="Jerry Sybers standing in a desert landscape"
              className="h-full w-full rounded-2xl object-cover shadow-sm"
            />
          </div>
          <div className="w-full md:w-7/12">
            <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
              Founded in 1999
            </p>
            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
              Meet the Owner: Jerry Sybers
            </h2>
            <p className="mt-4 text-sm text-[#405040] md:text-base">
              Founded in 1999, Outdoor Adventures reflects Jerry Sybers&apos; life
              as a geologist, avid hiker, and naturalist who believes that
              happiness and health come from an Epicurean way of life rooted in
              time outdoors. He&apos;s dedicated to helping guests see deeper than
              the surface—blending geology, ecology, and storytelling so
              landscapes become living classrooms.
            </p>
            <p className="mt-4 text-sm text-[#405040] md:text-base">
              Jerry&apos;s fieldwork stretches from Colorado&apos;s alpine terrain to the
              stark beauty of the Mojave Desert, a contrast that shaped his
              guiding philosophy. He assisted with Desert Institute programs,
              training guides to interpret desert ecosystems with care and
              curiosity. His tours encourage us, as a species, to understand the
              Earth and all living things, to recognize the fine balance we must
              maintain, and to see how unsustainable actions carry real
              consequences for nature.
            </p>
            <p className="mt-4 text-sm text-[#405040] md:text-base">
              As we pursue happiness and liberty, Jerry reminds guests that
              resources are scarce, just as our lives are scarce, and that our
              time here will one day end. Two roads remain—and he closes with
              Walt Whitman&apos;s words from Leaves of Rain: “Two roads diverged in a
              yellow wood.”
            </p>
            <blockquote className="mt-6 border-l-2 border-[#2f4a2f]/40 pl-4 text-sm italic text-[#2f4a2f] md:text-base">
              “To THINK out of the box, one must first GET OUT of the box.” —
              Jerry Sybers
            </blockquote>
          </div>
        </div>
      </section>
    </main>
  );
}
