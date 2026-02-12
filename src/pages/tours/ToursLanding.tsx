import { useEffect, useMemo, useRef, useState } from "react";

import Seo from "../../components/Seo";
import TourCard from "../../components/TourCard";
import {
  getCityBySlugs,
  getStateBySlug,
  states,
  type City,
  type StateDestination,
} from "../../data/destinations";
import {
  getFallbackCityBySlugs,
  getFallbackStateBySlug,
} from "../../data/tourFallbacks";
import { getCityTourDetailPath, getToursByCity } from "../../data/tours";
import { getStaticPageSeo } from "../../utils/seo";

const DEFAULT_STATE_SLUG = "california";

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

const isCityInState = (state: StateDestination | null, city: City | null) => {
  if (!state || !city) {
    return false;
  }

  return state.cities.some(candidate => candidate.slug === city.slug);
};

export default function ToursLanding() {
  const seo = getStaticPageSeo("/tours");
  const didInitRef = useRef(false);
  const sortedStates = useMemo(
    () => [...states].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );
  const defaultStateSlug =
    sortedStates.find(state => state.slug === DEFAULT_STATE_SLUG)?.slug ??
    sortedStates[0]?.slug ??
    "";
  const [selectedStateSlug, setSelectedStateSlug] = useState("");
  const [selectedCitySlug, setSelectedCitySlug] = useState("");

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

  const selectedCity = useMemo(
    () => resolveCity(selectedStateSlug, selectedCitySlug),
    [selectedCitySlug, selectedStateSlug]
  );

  const tours = useMemo(() => {
    if (!selectedStateSlug || !selectedCitySlug) {
      return [];
    }

    return getToursByCity(selectedStateSlug, selectedCitySlug);
  }, [selectedCitySlug, selectedStateSlug]);

  const updateUrl = (stateSlug: string, citySlug: string, replace = false) => {
    const query = new URLSearchParams();

    if (stateSlug) {
      query.set("state", stateSlug);
    }

    if (citySlug) {
      query.set("city", citySlug);
    }

    const queryString = query.toString();
    const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}`;

    if (replace) {
      window.history.replaceState({}, "", nextUrl);
      return;
    }

    window.history.pushState({}, "", nextUrl);
  };

  useEffect(() => {
    if (didInitRef.current || !sortedStates.length) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const urlStateSlug = params.get("state");
    const resolvedUrlState = resolveState(urlStateSlug);
    const nextStateSlug = resolvedUrlState?.slug ?? defaultStateSlug;

    const resolvedState = resolveState(nextStateSlug);
    const urlCitySlug = params.get("city");
    const resolvedUrlCity = resolveCity(nextStateSlug, urlCitySlug);

    const nextCitySlug = isCityInState(resolvedState, resolvedUrlCity)
      ? (resolvedUrlCity?.slug ?? "")
      : (resolvedState?.cities[0]?.slug ?? "");

    setSelectedStateSlug(nextStateSlug);
    setSelectedCitySlug(nextCitySlug);
    updateUrl(nextStateSlug, nextCitySlug, true);
    didInitRef.current = true;
  }, [defaultStateSlug, sortedStates]);

  const handleStateChange = (nextStateSlug: string) => {
    const nextState = resolveState(nextStateSlug);
    const nextCitySlug = nextState?.cities[0]?.slug ?? "";

    setSelectedStateSlug(nextStateSlug);
    setSelectedCitySlug(nextCitySlug);
    updateUrl(nextStateSlug, nextCitySlug);
  };

  const handleCityChange = (nextCitySlug: string) => {
    setSelectedCitySlug(nextCitySlug);
    updateUrl(selectedStateSlug, nextCitySlug);
  };

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
      <main className="mx-auto max-w-6xl px-6 py-16 text-[#1f2a1f]">
        <header>
          <h1 className="text-3xl font-semibold md:text-4xl">Tours</h1>
          <p className="mt-3 max-w-3xl text-sm text-[#405040] md:text-base">
            Choose a state and city to browse local tours.
          </p>
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
                {sortedStates.map(state => (
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
                disabled={!cityOptions.length}
              >
                {cityOptions.length ? null : (
                  <option value="">Select a city</option>
                )}
                {cityOptions.map(city => (
                  <option key={city.slug} value={city.slug}>
                    {city.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {!selectedCity || !selectedState ? (
          <p className="mt-8 text-sm text-[#405040]">
            Select a city to view available tours.
          </p>
        ) : (
          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-[#1f2a1f] md:text-3xl">
              Tours in {selectedCity.name}, {selectedState.name}
            </h2>
            {tours.length ? (
              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {tours.map(tour => (
                  <TourCard
                    key={tour.id}
                    tour={tour}
                    href={getCityTourDetailPath(tour)}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-[#405040]">
                No tours found for this city yet.
              </p>
            )}
          </section>
        )}
      </main>
    </>
  );
}
