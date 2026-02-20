import { Link } from "wouter";

import Seo from "../../components/Seo";
import { getInternationalCountries } from "../../utils/guides/getInternationalCountries";
import { getStaticPageSeo } from "../../utils/seo";

export default function InternationalGuidesIndex() {
  const seo = getStaticPageSeo("/guides/world");
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
          <div className="mx-auto max-w-6xl px-6 py-12">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              International Guides
            </p>
            <h1 className="mt-2 text-3xl font-semibold md:text-5xl">
              International Guides
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
              Explore country-level guides and continue into destination cities.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map(country => (
              <Link key={country.slug} href={`/guides/world/${country.slug}`}>
                <a className="group block">
                  <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition group-hover:shadow-md">
                    <p className="text-xl font-semibold text-[#2f4a2f]">
                      {country.name}
                    </p>
                    <p className="mt-2 text-sm text-black/60">
                      {country.cityCount} destination
                      {country.cityCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
