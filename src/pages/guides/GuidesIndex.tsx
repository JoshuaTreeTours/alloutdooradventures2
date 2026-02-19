import RegionDropdownButton from "../../components/RegionDropdownButton";
import Seo from "../../components/Seo";
import { getGuideCountries } from "../../data/guideData";
import { getStaticPageSeo } from "../../utils/seo";
import { getGuideStates, getGuidesByState } from "../../utils/guides/guideRegistry";

const titleCase = (value: string) =>
  value
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function GuidesIndex() {
  const seo = getStaticPageSeo("/guides");
  const stateSlugs = getGuideStates();
  const countries = getGuideCountries();
  const firstState = stateSlugs[0] ?? "";
  const featuredCities = firstState ? getGuidesByState(firstState).slice(0, 8) : [];

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
              Explore destinations with expert insight before you plan your next
              escape.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-14">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-semibold text-[#1f2a1f] md:text-2xl">
                Find an Adventure (US Guides)
              </h2>
              <p className="mt-2 text-sm text-[#405040]">
                Choose a state to browse city destination guides.
              </p>
              <div className="mt-4">
                <RegionDropdownButton
                  label="Choose a state"
                  options={stateSlugs.map((slug) => ({
                    name: titleCase(slug),
                    slug,
                  }))}
                  onSelect={(slug) => {
                    window.location.assign(`/guides/us/${slug}`);
                  }}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-semibold text-[#1f2a1f] md:text-2xl">
                International Destinations
              </h2>
              <p className="mt-2 text-sm text-[#405040]">
                Browse expert-led destination guides across the globe.
              </p>
              <div className="mt-4">
                <RegionDropdownButton
                  label="Choose a destination"
                  options={countries.map((country) => ({
                    name: country.name,
                    slug: country.slug,
                  }))}
                  onSelect={(slug) => {
                    window.location.assign(`/guides/world/${slug}`);
                  }}
                />
              </div>
            </div>
          </div>

          {featuredCities.length ? (
            <div className="mt-8 rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-semibold md:text-2xl">
                Guide index listings
              </h2>
              <ul className="mt-4 grid gap-2 md:grid-cols-2">
                {featuredCities.map((entry) => (
                  <li key={`${entry.stateSlug}-${entry.citySlug}`}>
                    <a
                      href={`/guides/us/${entry.stateSlug}/${entry.citySlug}`}
                      className="text-sm underline"
                    >
                      {entry.dataImport.city}, {entry.dataImport.state}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </main>
    </>
  );
}
