import { Link } from "wouter";

import RegionDropdownButton from "../../components/RegionDropdownButton";
import Seo from "../../components/Seo";
import { getInternationalCountries } from "../../utils/guides/getInternationalCountries";
import { getStaticPageSeo } from "../../utils/seo";

export default function GuidesIndex() {
  const seo = getStaticPageSeo("/guides");
  const countries = getInternationalCountries();

  return (
    <>
      {seo ? (
        <Seo
          title={seo.title}
          description={seo.description}
          url={seo.url}
          image={seo.image}
        />
      ) : null}
      <main className="bg-[#f6f1e8] text-[#1f2a1f]">
        <section className="bg-[#2f4a2f] text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              Guides
            </p>
            <h1 className="text-3xl font-semibold md:text-5xl">Guides</h1>
            <p className="max-w-3xl text-sm text-white/90 md:text-base">
              Start with a regional guide index, then drill into states,
              countries, and city-level guides.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-14">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-semibold text-[#1f2a1f] md:text-2xl">
                United States Guides
              </h2>
              <p className="mt-2 text-sm text-[#405040]">
                Browse state-by-state outdoor guides and open city pages from
                each state index.
              </p>
              <div className="mt-5">
                <Link href="/guides/us">
                  <a className="inline-flex rounded-full border border-[#2f4a2f]/20 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f] transition hover:bg-[#f0f4ee]">
                    Open US guides
                  </a>
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-semibold text-[#1f2a1f] md:text-2xl">
                World Guides
              </h2>
              <p className="mt-2 text-sm text-[#405040]">
                Explore country and city guides outside the United States.
              </p>
              <div className="mt-5">
                <Link href="/guides/world">
                  <a className="inline-flex rounded-full border border-[#2f4a2f]/20 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f] transition hover:bg-[#f0f4ee]">
                    Open world guides
                  </a>
                </Link>
              </div>
              <div className="mt-4">
                <RegionDropdownButton
                  label="Choose a country guide"
                  options={countries.map(country => ({
                    name: country.name,
                    slug: country.slug,
                  }))}
                  onSelect={slug => {
                    window.location.assign(`/guides/world/${slug}`);
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
