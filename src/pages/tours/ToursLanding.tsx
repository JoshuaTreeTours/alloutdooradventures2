import { useEffect, useMemo, useRef, useState } from "react";

import Seo from "../../components/Seo";
import TourCard from "../../components/TourCard";
import {
  getCityBySlugs,
  getStateBySlug,
  states,
} from "../../data/destinations";
import {
  getFallbackCityBySlugs,
  getFallbackStateBySlug,
} from "../../data/tourFallbacks";
import { getToursByCityUnified, tours } from "../../data/tours";
import type { Tour } from "../../data/tours.types";
import {
  getAllEngine2Tours,
  getEngine2CanadaProvinceIndex,
  getEngine2MexicoTours,
} from "../../engine2/data/loadEngine2";
import { isUSStateName } from "../../constants/usStates";
import { getStaticPageSeo } from "../../utils/seo";
import { slugify } from "../../utils/slugify";
import { getGuideRecord } from "../../utils/guides/guideRegistry";
import { EUROPE_COUNTRIES } from "../../data/tourCatalog";
import {
  buildInternationalCityOptions,
  buildInternationalCountryOptions,
  CANADA_COUNTRY_NAME,
  getMexicoCityKey,
  MEXICO_COUNTRY_NAME,
} from "./internationalSelectorData";

const resolveState = (stateSlug: string | null) => {
  if (!stateSlug) {
    return null;
  }

  return getStateBySlug(stateSlug) ?? getFallbackStateBySlug(stateSlug);
};

const resolveCity = (stateSlug: string, citySlug: string | null) => {
  if (!citySlug) {
    return null;
  }

  return (
    getCityBySlugs(stateSlug, citySlug) ??
    getFallbackCityBySlugs(stateSlug, citySlug)
  );
};

export default function ToursLanding() {
  const seo = getStaticPageSeo("/tours");
  const didInitRef = useRef(false);
  const sortedStates = useMemo(() => {
    const bySlug = new Map(states.map(state => [state.slug, state]));

    getAllEngine2Tours().forEach(tour => {
      const parts = tour.seo.canonicalPath.split("/").filter(Boolean);
      const stateSlug =
        parts[0] === "destinations" && parts[1] === "united-states"
          ? parts[2]
          : parts[0] === "destinations"
            ? parts[1]
            : "";

      const stateName = tour.geo.region || stateSlug;

      if (
        !stateSlug ||
        bySlug.has(stateSlug) ||
        parts[1] === "world" ||
        !isUSStateName(stateName)
      ) {
        return;
      }

      bySlug.set(stateSlug, {
        slug: stateSlug,
        name: stateName,
        description: `Outdoor experiences across ${stateName}.`,
        heroImage: "/hero.jpg",
        region: "Featured destination",
        intro: `${stateName} is a strong basecamp for guided adventures.`,
        longDescription: `${stateName} features growing Engine2 inventory.`,
        topRegions: [],
        cities: [],
        isFallback: true,
      });
    });

    return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, []);
  const [selectedStateSlug, setSelectedStateSlug] = useState("");
  const [selectedCitySlug, setSelectedCitySlug] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [
    selectedInternationalProvinceSlug,
    setSelectedInternationalProvinceSlug,
  ] = useState("");
  const [selectedInternationalCity, setSelectedInternationalCity] =
    useState("");

  const canadaProvinces = useMemo(
    () =>
      getEngine2CanadaProvinceIndex().sort((a, b) =>
        a.provinceName.localeCompare(b.provinceName)
      ),
    []
  );

  const selectedState = useMemo(
    () => resolveState(selectedStateSlug),
    [selectedStateSlug]
  );

  const cityOptions = useMemo(() => {
    if (!selectedState) {
      return [];
    }

    return [...selectedState.cities].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [selectedState]);

  const selectedCity = useMemo(() => {
    if (!selectedStateSlug) {
      return null;
    }

    const city = resolveCity(selectedStateSlug, selectedCitySlug);
    if (!city) {
      return null;
    }

    return cityOptions.some(option => option.slug === city.slug) ? city : null;
  }, [cityOptions, selectedCitySlug, selectedStateSlug]);

  const internationalTours = useMemo(
    () => tours.filter(tour => tour.destination.country !== "United States"),
    []
  );

  const mexicoTours = useMemo(() => getEngine2MexicoTours(), []);

  const internationalEngine2Tours = useMemo(
    () =>
      getAllEngine2Tours().filter(
        tour =>
          tour.geo.country !== "United States" &&
          tour.sourceCountrySlug !== "canada" &&
          tour.sourceCountrySlug !== "mexico"
      ),
    []
  );

  const europeCountrySlugSet = useMemo(
    () => new Set(EUROPE_COUNTRIES.map(country => slugify(country))),
    []
  );

  const usStateOptions = useMemo(
    () => sortedStates.filter(state => isUSStateName(state.name)),
    [sortedStates]
  );

  const countryOptions = useMemo(
    () => buildInternationalCountryOptions(internationalTours, mexicoTours),
    [internationalTours, mexicoTours]
  );

  const internationalCities = useMemo(
    () =>
      buildInternationalCityOptions({
        selectedCountry,
        selectedCanadaProvinceSlug: selectedInternationalProvinceSlug,
        internationalTours,
        canadaProvinces,
        mexicoTours,
      }),
    [
      canadaProvinces,
      internationalTours,
      selectedCountry,
      selectedInternationalProvinceSlug,
      mexicoTours,
    ]
  );

  const filteredTours = useMemo(() => {
    let nextTours: Array<{ tour: Tour; href: string }> = [];

    if (selectedStateSlug && selectedCitySlug) {
      nextTours = getToursByCityUnified(selectedStateSlug, selectedCitySlug);
    }

    if (selectedCountry && selectedInternationalCity) {
      if (selectedCountry === MEXICO_COUNTRY_NAME) {
        nextTours = mexicoTours
          .filter(
            tour =>
              getMexicoCityKey(tour.geo.city, tour.sourceCitySlug) ===
              selectedInternationalCity
          )
          .map(tour => ({
            tour: {
              id: tour.id,
              slug: tour.slug,
              title: tour.name,
              description: tour.seo.description,
              image: tour.images.hero ?? "",
              price: tour.pricing?.price ? `$${tour.pricing.price}` : undefined,
              duration: "",
              difficulty: "",
              activityType: "Adventure",
              activitySlugs: ["adventure"],
              destination: {
                state: "Mexico",
                stateSlug: "mexico",
                city: tour.geo.city,
                citySlug: tour.sourceCitySlug,
                country: "Mexico",
                lat: tour.geo.lat ?? undefined,
                lng: tour.geo.lng ?? undefined,
              },
              bookingUrl: tour.booking.bookingUrl,
              operator: tour.provider.name,
              source: "manual",
            },
            href: tour.seo.canonicalPath,
          }));
      } else {
        const selectedCitySlug = selectedInternationalCity;

        const standardTours = tours
          .filter(
            tour =>
              tour.destination.country === selectedCountry &&
              tour.destination.citySlug === selectedCitySlug
          )
          .map(tour => ({
            tour,
            href: `/tours/${tour.destination.stateSlug}/${tour.destination.citySlug}/${tour.slug}`,
          }));

        const engine2Tours = internationalEngine2Tours
          .filter(
            tour =>
              tour.geo.country === selectedCountry &&
              (tour.sourceCitySlug === selectedCitySlug ||
                slugify(tour.geo.city) === selectedCitySlug)
          )
          .map(tour => ({
            tour: {
              id: tour.id,
              slug: tour.slug,
              title: tour.name,
              description: tour.seo.description,
              image: tour.images.hero ?? "",
              price: tour.pricing?.price ? `$${tour.pricing.price}` : undefined,
              duration: "",
              difficulty: "",
              activityType: "Adventure",
              activitySlugs: ["adventure"],
              destination: {
                state: tour.geo.country,
                stateSlug: slugify(tour.geo.country),
                city: tour.geo.city,
                citySlug: tour.sourceCitySlug,
                country: tour.geo.country,
                lat: tour.geo.lat ?? undefined,
                lng: tour.geo.lng ?? undefined,
              },
              bookingUrl: tour.booking.bookingUrl,
              operator: tour.provider.name,
              source: "manual",
            },
            href: tour.seo.canonicalPath,
          }));

        nextTours = [...standardTours, ...engine2Tours];
      }
    }

    return nextTours;
  }, [
    selectedCitySlug,
    selectedCountry,
    selectedInternationalCity,
    selectedStateSlug,
    mexicoTours,
    internationalEngine2Tours,
  ]);

  const selectedInternationalCityLabel = useMemo(() => {
    const match = internationalCities.find(
      city => city.slug === selectedInternationalCity
    );
    return match?.name ?? selectedInternationalCity;
  }, [internationalCities, selectedInternationalCity]);

  const pageContent = useMemo(() => {
    if (selectedCity) {
      return {
        title: `Best Tours in ${selectedCity.name} | Outdoor Adventures`,
        h1: `Best Tours in ${selectedCity.name}`,
        intro: `Explore tours and outdoor adventures in ${selectedCity.name}, ${selectedState?.name ?? "United States"}. From San Andreas Fault jeep tours and desert hiking experiences to scenic excursions and small-group adventures, these tours make it easy to discover the landscapes and natural history of the region.`,
      };
    }

    if (selectedState) {
      return {
        title: `${selectedState.name} Tours & Outdoor Adventures | All Outdoor Adventures`,
        h1: `${selectedState.name} Tours & Outdoor Adventures`,
        intro: `Browse tours and outdoor adventures across ${selectedState.name}, from local activities and guided experiences to scenic day trips and regional excursions.`,
      };
    }

    if (selectedCountry) {
      return {
        title: `${selectedCountry} Tours & Activities | All Outdoor Adventures`,
        h1: `${selectedCountry} Tours & Activities`,
        intro: `Browse tours and activities across ${selectedCountry}, from city experiences and cultural outings to outdoor adventures and day trips.`,
      };
    }

    return {
      title: "Find Tours & Outdoor Adventures | All Outdoor Adventures",
      h1: "Find Tours & Outdoor Adventures",
      intro:
        "Browse tours and outdoor adventures by state, city, or country to find experiences that fit your destination and travel style.",
    };
  }, [selectedCity, selectedCountry, selectedState]);

  const cityGuideRecord = useMemo(() => {
    if (!selectedState || !selectedCity) {
      return null;
    }

    return getGuideRecord(selectedState.slug, selectedCity.slug);
  }, [selectedCity, selectedState]);

  const updateUrl = (stateSlug: string, citySlug: string) => {
    const query = new URLSearchParams();

    if (stateSlug) {
      query.set("state", stateSlug);
    }

    if (citySlug) {
      query.set("city", citySlug);
    }

    const queryString = query.toString();
    const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}`;
    window.history.pushState({}, "", nextUrl);
  };

  useEffect(() => {
    if (didInitRef.current) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const urlStateSlug = params.get("state");
    const urlCitySlug = params.get("city");

    if (!urlStateSlug || !urlCitySlug) {
      didInitRef.current = true;
      return;
    }

    const resolvedState = resolveState(urlStateSlug);
    const resolvedCity = resolvedState
      ? resolveCity(urlStateSlug, urlCitySlug)
      : null;
    const isValidCity = Boolean(
      resolvedCity &&
      resolvedState?.cities.some(city => city.slug === resolvedCity.slug)
    );

    if (resolvedState && resolvedCity && isValidCity) {
      setSelectedStateSlug(resolvedState.slug);
      setSelectedCitySlug(resolvedCity.slug);
    }

    didInitRef.current = true;
  }, []);

  const handleStateChange = (nextStateSlug: string) => {
    setSelectedStateSlug(nextStateSlug);
    setSelectedCitySlug("");
    setSelectedCountry("");
    setSelectedInternationalProvinceSlug("");
    setSelectedInternationalCity("");
    updateUrl(nextStateSlug, "");
  };

  const handleCityChange = (nextCitySlug: string) => {
    setSelectedCitySlug(nextCitySlug);
    setSelectedCountry("");
    setSelectedInternationalProvinceSlug("");
    setSelectedInternationalCity("");
    updateUrl(selectedStateSlug, nextCitySlug);
  };

  const handleCountryChange = (nextCountry: string) => {
    setSelectedCountry(nextCountry);
    setSelectedInternationalProvinceSlug("");
    setSelectedInternationalCity("");
    setSelectedStateSlug("");
    setSelectedCitySlug("");
    updateUrl("", "");

    if (nextCountry === CANADA_COUNTRY_NAME) {
      window.location.assign("/destinations/world/canada");
      return;
    }
  };

  const handleProvinceChange = (nextProvinceSlug: string) => {
    setSelectedInternationalProvinceSlug(nextProvinceSlug);
    setSelectedInternationalCity("");
    setSelectedStateSlug("");
    setSelectedCitySlug("");
    updateUrl("", "");

    if (nextProvinceSlug) {
      window.location.assign(`/destinations/world/canada/${nextProvinceSlug}`);
    }
  };

  const handleInternationalCityChange = (nextCity: string) => {
    setSelectedInternationalCity(nextCity);
    setSelectedStateSlug("");
    setSelectedCitySlug("");
    updateUrl("", "");

    if (
      selectedCountry === CANADA_COUNTRY_NAME &&
      selectedInternationalProvinceSlug &&
      nextCity
    ) {
      window.location.assign(
        `/destinations/world/canada/${selectedInternationalProvinceSlug}/${nextCity}`
      );
      return;
    }

    if (selectedCountry === MEXICO_COUNTRY_NAME && nextCity) {
      window.location.assign(`/destinations/mexico/${nextCity}/tours`);
      return;
    }

    if (selectedCountry && nextCity) {
      const countrySlug = slugify(selectedCountry);
      const basePath = europeCountrySlugSet.has(countrySlug)
        ? `/destinations/europe/${countrySlug}`
        : `/destinations/world/${countrySlug}`;

      window.location.assign(`${basePath}/cities/${nextCity}`);
    }
  };

  return (
    <>
      {seo ? (
        <Seo
          title={pageContent.title}
          description={pageContent.intro}
          url={seo.url}
          image={seo.image}
        />
      ) : null}
      <main className="mx-auto max-w-6xl px-6 py-16 text-[#1f2a1f]">
        <header>
          <h1 className="text-3xl font-semibold md:text-4xl">
            {pageContent.h1}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-[#405040] md:text-base">
            {pageContent.intro}
          </p>
          {cityGuideRecord ? (
            <p className="mt-2 text-sm text-[#5b6d5b]">
              Looking for curated recommendations? See our guide to the best
              tours in {selectedCity?.name}.{" "}
              <a
                href={`/guides/us/${selectedStateSlug}/${selectedCitySlug}`}
                className="underline underline-offset-2"
              >
                View guide
              </a>
              .
            </p>
          ) : null}
        </header>

        <section className="mt-8 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-[#2f4a2f]">
              State
              <select
                className="rounded-md border border-[#2f4a2f]/20 bg-white px-3 py-2 text-sm text-[#1f2a1f]"
                value={selectedStateSlug}
                onChange={event => handleStateChange(event.target.value)}
              >
                <option value="">Select a state</option>
                {usStateOptions.map(state => (
                  <option key={state.slug} value={state.slug}>
                    {state.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-[#2f4a2f]">
              City
              <select
                className="rounded-md border border-[#2f4a2f]/20 bg-white px-3 py-2 text-sm text-[#1f2a1f]"
                value={selectedCitySlug}
                onChange={event => handleCityChange(event.target.value)}
                disabled={!selectedStateSlug}
              >
                <option value="">
                  {selectedStateSlug ? "Select a city" : "Select a state first"}
                </option>
                {cityOptions.map(city => (
                  <option key={city.slug} value={city.slug}>
                    {city.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {!selectedCity ? (
          <section className="mt-8 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-[#1f2a1f]">
              International Locations
            </h2>
            <div
              className={`grid gap-4 ${
                selectedCountry === CANADA_COUNTRY_NAME
                  ? "md:grid-cols-3"
                  : "md:grid-cols-2"
              }`}
            >
              <label className="flex flex-col gap-2 text-sm font-medium text-[#2f4a2f]">
                Country
                <select
                  className="rounded-md border border-[#2f4a2f]/20 bg-white px-3 py-2 text-sm text-[#1f2a1f]"
                  value={selectedCountry}
                  onChange={event => handleCountryChange(event.target.value)}
                >
                  <option value="">Select a country</option>
                  {countryOptions.map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </label>

              {selectedCountry === CANADA_COUNTRY_NAME ? (
                <label className="flex flex-col gap-2 text-sm font-medium text-[#2f4a2f]">
                  Province
                  <select
                    className="rounded-md border border-[#2f4a2f]/20 bg-white px-3 py-2 text-sm text-[#1f2a1f]"
                    value={selectedInternationalProvinceSlug}
                    onChange={event => handleProvinceChange(event.target.value)}
                    disabled={!selectedCountry}
                  >
                    <option value="">
                      {selectedCountry
                        ? "Select a province"
                        : "Select a country first"}
                    </option>
                    {canadaProvinces.map(province => (
                      <option
                        key={province.provinceSlug}
                        value={province.provinceSlug}
                      >
                        {province.provinceName}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className="flex flex-col gap-2 text-sm font-medium text-[#2f4a2f]">
                City
                <select
                  className="rounded-md border border-[#2f4a2f]/20 bg-white px-3 py-2 text-sm text-[#1f2a1f]"
                  value={selectedInternationalCity}
                  onChange={event =>
                    handleInternationalCityChange(event.target.value)
                  }
                  disabled={
                    !selectedCountry ||
                    (selectedCountry === CANADA_COUNTRY_NAME &&
                      !selectedInternationalProvinceSlug)
                  }
                >
                  <option value="">
                    {!selectedCountry
                      ? "Select a country first"
                      : selectedCountry === CANADA_COUNTRY_NAME &&
                          !selectedInternationalProvinceSlug
                        ? "Select a province first"
                        : "Select a city"}
                  </option>
                  {internationalCities.map(city => (
                    <option key={city.slug} value={city.slug}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        ) : null}

        {filteredTours.length === 0 ? (
          <p className="mt-8 text-sm text-[#405040]">
            Please select a location to view tours.
          </p>
        ) : (
          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-[#1f2a1f] md:text-3xl">
              {selectedCountry && selectedInternationalCity
                ? `All Tours in ${selectedInternationalCityLabel}`
                : `All Tours in ${selectedCity?.name ?? ""}`}
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredTours.map(({ tour, href }) => (
                <TourCard key={tour.id} tour={tour} href={href} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
