import { Link } from "wouter";

import { getGuideCountries, getGuideStates } from "../../data/guideData";

export default function GuidesIndex() {
  const states = getGuideStates();
  const countries = getGuideCountries();

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            Guides
          </p>
          <h1 className="text-3xl font-semibold md:text-5xl">
            Outdoor Adventure Guides
          </h1>
          <p className="max-w-3xl text-sm text-white/90 md:text-base">
            Plan your next journey with destination-specific itineraries and
            tips.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10">
          <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-10">
            <h2 className="text-xl font-semibold text-[#1f2a1f] md:text-2xl">
              United States
            </h2>
            <p className="mt-2 text-sm text-[#405040]">
              Explore every U.S. state where tours are currently available.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {states.map((state) => (
                <Link key={state.slug} href={`/guides/us/${state.slug}`}>
                  <a className="inline-flex items-center rounded-full border border-[#2f4a2f]/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f] transition hover:bg-[#f0f4ee]">
                    {state.name}
                  </a>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-10">
            <h2 className="text-xl font-semibold text-[#1f2a1f] md:text-2xl">
              International
            </h2>
            <p className="mt-2 text-sm text-[#405040]">
              Global destinations with outdoor experiences available now.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {countries.map((country) => (
                <Link key={country.slug} href={`/guides/world/${country.slug}`}>
                  <a className="inline-flex items-center rounded-full border border-[#2f4a2f]/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f] transition hover:bg-[#f0f4ee]">
                    {country.name}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
