import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

import RegionDropdownButton from "../components/RegionDropdownButton";
import Seo from "../components/Seo";
import { states } from "../data/destinations";
import { EUROPE_COUNTRIES, WORLD_DESTINATIONS, slugify } from "../data/tourCatalog";
import { getStaticPageSeo } from "../utils/seo";

export default function ToursIndex() {
  const seo = getStaticPageSeo("/tours");
  const [selectedStateSlug, setSelectedStateSlug] = useState("");
  const [selectedCitySlug, setSelectedCitySlug] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const countryOptions = useMemo(() => {
    const europeOptions = EUROPE_COUNTRIES.map((country) => ({
      name: country,
      slug: `europe:${slugify(country)}`,
    }));
    const worldOptions = WORLD_DESTINATIONS.map((country) => ({
      name: country,
      slug: `world:${slugify(country)}`,
    }));
    return [...europeOptions, ...worldOptions].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, []);

  const stateOptions = useMemo(
    () =>
      states
        .map((state) => ({
          name: state.name,
          slug: state.slug,
          cities: state.cities,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const selectedState = useMemo(
    () => stateOptions.find((state) => state.slug === selectedStateSlug),
    [stateOptions, selectedStateSlug],
  );

  const cityOptions = useMemo(() => {
    if (!selectedState) {
      return [];
    }
    return selectedState.cities
      .map((city) => ({
        name: city.name,
        slug: city.slug,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedState]);

  useEffect(() => {
    setSelectedCitySlug("");
  }, [selectedStateSlug]);

  useEffect(() => {
    if (
      selectedCitySlug &&
      !cityOptions.some((city) => city.slug === selectedCitySlug)
    ) {
      setSelectedCitySlug("");
    }
  }, [selectedCitySlug, cityOptions]);

  const popularDestinations = [
    { label: "California", href: "/destinations/states/california" },
    { label: "Arizona", href: "/destinations/states/arizona" },
    { label: "Colorado", href: "/destinations/states/colorado" },
    { label: "France", href: "/destinations/europe/france" },
    { label: "Italy", href: "/destinations/europe/italy" },
    { label: "Japan", href: "/destinations/world/japan" },
  ];

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
      <main className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#2f4a2f]">
            Tours
          </h1>
          <p className="mt-3 max-w-2xl text-sm md:text-base text-[#405040] leading-relaxed">
            Use the destination directory below to jump straight to country and
            state guides. Select a location to explore destination pages with
            local highlights and available tours.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
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

        <section className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm">
          <div className="space-y-6">
            <RegionDropdownButton
              label="Select a country…"
              options={countryOptions}
              selectedName={
                countryOptions.find((country) => country.slug === selectedCountry)
                  ?.name
              }
              onSelect={(slug) => {
                const [region, countrySlug] = slug.split(":");
                if (!countrySlug) {
                  return;
                }
                setSelectedCountry(slug);
                const basePath =
                  region === "world" ? "/destinations/world" : "/destinations/europe";
                window.location.assign(`${basePath}/${countrySlug}`);
              }}
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
                Popular destinations
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {popularDestinations.map((destination) => (
                  <Link key={destination.href} href={destination.href}>
                    <a className="rounded-full border border-[#2f4a2f]/20 bg-white px-3 py-1 text-xs font-semibold text-[#2f4a2f] hover:border-[#2f4a2f]/40 hover:bg-[#2f4a2f]/5 transition">
                      {destination.label}
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
              United States
            </p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <RegionDropdownButton
                label="Choose a state"
                options={stateOptions.map((state) => ({
                  name: state.name,
                  slug: state.slug,
                }))}
                selectedName={selectedState?.name || undefined}
                onSelect={(slug) => {
                  setSelectedStateSlug(slug);
                }}
              />
              <RegionDropdownButton
                label="Choose a city"
                options={cityOptions}
                selectedName={
                  cityOptions.find((city) => city.slug === selectedCitySlug)?.name
                }
                onSelect={(slug) => setSelectedCitySlug(slug)}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-[#2f4a2f]">
              {selectedState ? (
                <Link href={`/destinations/states/${selectedState.slug}`}>
                  <a className="inline-flex items-center gap-2 rounded-md border border-[#2f4a2f]/20 px-3 py-1.5 hover:border-[#2f4a2f]/40 hover:bg-[#2f4a2f]/5 transition">
                    View {selectedState.name} →
                  </a>
                </Link>
              ) : null}
              {selectedState && selectedCitySlug ? (
                <Link
                  href={`/destinations/states/${selectedState.slug}/cities/${selectedCitySlug}`}
                >
                  <a className="inline-flex items-center gap-2 rounded-md border border-[#2f4a2f]/20 px-3 py-1.5 hover:border-[#2f4a2f]/40 hover:bg-[#2f4a2f]/5 transition">
                    View city →
                  </a>
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
