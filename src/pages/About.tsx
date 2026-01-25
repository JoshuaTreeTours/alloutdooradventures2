import { Link } from "wouter";

import Seo from "../components/Seo";
import { buildMetaDescription } from "../utils/seo";

export default function About() {
  const title = "About Outdoor Adventures | All Outdoor Adventures";
  const description = buildMetaDescription(
    "Learn about All Outdoor Adventures, a curated marketplace connecting travelers with local guides, outdoor destinations, and trusted tour partners.",
    "Meet the team behind our tours, explore our guiding philosophy, and see how we curate unforgettable outdoor experiences worldwide.",
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-[#1f2a1f]">
      <Seo title={title} description={description} url="/about" />
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
              Outdoor Adventures was founded in 1999 as an expression of Jerry
              Sybers&apos; life in the field—part geologist, part naturalist, part
              wanderer. For Jerry, happiness is not a luxury product; it is a
              discipline. Rooted in Epicurean philosophy, his work is built on a
              simple truth: well-being comes from clarity, moderation,
              friendship, and time spent in the real world. The outdoors is not
              an escape—it is a return.
            </p>
            <p className="mt-4 text-sm text-[#405040] md:text-base">
              Jerry&apos;s tours invite guests to see beyond the postcard surface of
              Joshua Tree and the desert Southwest. Through geology, ecology,
              and story, landscapes become living classrooms. Rocks are no
              longer inert; they become chapters in Earth&apos;s autobiography. A
              wash is not just a dry riverbed, but a memory of water and time.
              The desert becomes intelligible, intimate, and alive.
            </p>
            <p className="mt-4 text-sm text-[#405040] md:text-base">
              His fieldwork spans the alpine environments of Colorado and the
              stark immensity of the Mojave Desert—two extremes that shaped his
              guiding philosophy. He assisted with Desert Institute programs,
              helping train guides to interpret fragile ecosystems with both
              rigor and reverence. These experiences taught him that
              understanding precedes stewardship. We protect what we comprehend.
            </p>
            <p className="mt-4 text-sm text-[#405040] md:text-base">
              Every tour carries a deeper message: we are a species embedded in
              systems far older and more patient than ourselves. The Earth is
              not a backdrop; it is the stage, the script, and the limit.
              Resources are finite. Time is finite. Our lives, like these
              landscapes, are temporary arrangements of matter.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
