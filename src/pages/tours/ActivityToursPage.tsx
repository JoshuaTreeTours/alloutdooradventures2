import { useMemo, useState } from "react";
import { Link } from "wouter";

import Image from "../../components/Image";
import Seo from "../../components/Seo";
import { useStructuredData } from "../../components/StructuredDataProvider";
import TourCard from "../../components/TourCard";
import {
  buildActivityDiscoveryPath,
  getActivityCityOptions,
  getActivityDiscoveryPage,
  getActivityInternationalCityOptions,
  getActivityInternationalCountryOptions,
  getActivityLocationNames,
  getActivityStateOptions,
  getActivityTourEntriesByLocation,
  getActivityTourHref,
  resolveActivityHeroImage,
} from "../../data/activityDiscovery";
import { resolveTourHeroImage } from "../../utils/hero";
import { useEngine6LiveTourCardHydration } from "../../engine6/useEngine6LiveTourCardHydration";
import { buildBreadcrumbList, buildItemList } from "../../utils/structuredData";

export type ActivityToursPageProps = {
  params: {
    activitySlug: string;
    stateSlug?: string;
    citySlug?: string;
  };
};

const formatCountLabel = (count: number) =>
  count === 1 ? "1 tour" : `${count} tours`;

const formatActivityToursLabel = (activityLabel: string) =>
  /\btours$/i.test(activityLabel.trim())
    ? activityLabel
    : `${activityLabel} Tours`;

export default function ActivityToursPage({ params }: ActivityToursPageProps) {
  const activity = getActivityDiscoveryPage(params.activitySlug);

  const activityTourEntries = useMemo(
    () =>
      getActivityTourEntriesByLocation({
        activitySlug: params.activitySlug,
        stateSlug: params.stateSlug,
        citySlug: params.citySlug,
      }),
    [params.activitySlug, params.stateSlug, params.citySlug]
  );
  const hydratedActivityTourEntries =
    useEngine6LiveTourCardHydration(activityTourEntries);
  const activityTours = useMemo(
    () => hydratedActivityTourEntries.map(entry => entry.tour),
    [hydratedActivityTourEntries]
  );

  const { stateName, cityName } = useMemo(
    () =>
      getActivityLocationNames({
        activitySlug: params.activitySlug,
        stateSlug: params.stateSlug,
        citySlug: params.citySlug,
      }),
    [params.activitySlug, params.stateSlug, params.citySlug]
  );

  const heroImage = useMemo(
    () => resolveActivityHeroImage(activityTours, params.activitySlug),
    [activityTours, params.activitySlug]
  );

  const stateOptions = useMemo(
    () => getActivityStateOptions(params.activitySlug),
    [params.activitySlug]
  );
  const cityOptions = useMemo(
    () =>
      params.stateSlug
        ? getActivityCityOptions(params.activitySlug, params.stateSlug)
        : [],
    [params.activitySlug, params.stateSlug]
  );
  const internationalCountryOptions = useMemo(
    () => getActivityInternationalCountryOptions(params.activitySlug),
    [params.activitySlug]
  );
  const [
    selectedInternationalCountrySlug,
    setSelectedInternationalCountrySlug,
  ] = useState("");
  const internationalCityOptions = useMemo(
    () =>
      selectedInternationalCountrySlug
        ? getActivityInternationalCityOptions(
            params.activitySlug,
            selectedInternationalCountrySlug
          )
        : [],
    [params.activitySlug, selectedInternationalCountrySlug]
  );

  const canonicalPath = buildActivityDiscoveryPath({
    activitySlug: params.activitySlug,
    stateSlug: params.stateSlug,
    citySlug: params.citySlug,
  });

  const activityToursLabel = activity
    ? formatActivityToursLabel(activity.label)
    : "Activity Tours";

  const pageTitle = (() => {
    if (!activity) {
      return "Activity Tours & Outdoor Adventures";
    }
    if (cityName && stateName) {
      return `${activityToursLabel} in ${cityName}, ${stateName} | Outdoor Adventures`;
    }
    if (stateName) {
      return `${activityToursLabel} in ${stateName} | Outdoor Adventures`;
    }
    return activity.title;
  })();

  const h1 = (() => {
    if (!activity) {
      return "Activity not found";
    }
    if (cityName && stateName) {
      return `${activityToursLabel} in ${cityName}, ${stateName}`;
    }
    if (stateName) {
      return `${activityToursLabel} in ${stateName}`;
    }
    return activity.title;
  })();

  const description = (() => {
    if (!activity) {
      return "Browse tour discovery pages by activity.";
    }
    if (cityName && stateName) {
      return `Browse ${activityToursLabel.toLowerCase()} and outdoor adventures in ${cityName}, ${stateName}. Compare ${formatCountLabel(activityTours.length)} with live tour cards and direct booking links.`;
    }
    if (stateName) {
      return `Browse ${activityToursLabel.toLowerCase()} and outdoor adventures across ${stateName}. Compare ${formatCountLabel(activityTours.length)} by city, rating, reviews, and title.`;
    }
    return `${activity.description} Compare ${formatCountLabel(activityTours.length)} sorted by rating, review count, and title.`;
  })();

  const structuredDataNodes = useMemo(() => {
    const breadcrumbItems = [
      { name: "Tours", url: "/tours" },
      {
        name: activity?.label ?? params.activitySlug,
        url: buildActivityDiscoveryPath({ activitySlug: params.activitySlug }),
      },
    ];

    if (params.stateSlug && stateName) {
      breadcrumbItems.push({
        name: stateName,
        url: buildActivityDiscoveryPath({
          activitySlug: params.activitySlug,
          stateSlug: params.stateSlug,
        }),
      });
    }

    if (params.stateSlug && params.citySlug && cityName) {
      breadcrumbItems.push({
        name: cityName,
        url: canonicalPath,
      });
    }

    const nodes: Record<string, unknown>[] = [
      buildBreadcrumbList(breadcrumbItems),
    ];
    if (activityTours.length) {
      nodes.push(
        buildItemList(
          activityTours.map(tour => {
            const image = resolveTourHeroImage(tour);
            return {
              name: tour.title,
              url: getActivityTourHref(tour),
              image: image ? [image] : undefined,
            };
          })
        )
      );
    }
    return nodes;
  }, [activity, activityTours, canonicalPath, cityName, params, stateName]);

  useStructuredData(structuredDataNodes);

  if (!activity) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <Seo title={pageTitle} description={description} url={canonicalPath} />
        <h1 className="text-2xl font-semibold">Activity not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that activity. Head back to tours to keep exploring.
        </p>
        <Link href="/tours" className="mt-6 inline-flex underline">
          Tours home
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={pageTitle}
        description={description}
        url={canonicalPath}
        image={heroImage}
      />
      <section className="relative overflow-hidden bg-[#2f4a2f]">
        {heroImage ? (
          <Image
            src={heroImage}
            fallbackSrc={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-20 text-white">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/80">
            <Link href="/tours">
              <a>Tours</a>
            </Link>
            <span>/</span>
            <Link href={`/tours/${activity.slug}`}>
              <a>{activity.label}</a>
            </Link>
            {stateName ? (
              <>
                <span>/</span>
                <Link href={`/tours/${activity.slug}/${params.stateSlug}`}>
                  <a>{stateName}</a>
                </Link>
              </>
            ) : null}
            {cityName ? (
              <>
                <span>/</span>
                <span className="text-white">{cityName}</span>
              </>
            ) : null}
          </div>
          <div className="max-w-3xl space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/75">
              Search by activity
            </p>
            <h1 className="text-3xl font-semibold md:text-5xl">{h1}</h1>
            <p className="text-sm text-white/90 md:text-base">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tours"
              className="inline-flex items-center justify-center rounded-md bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/25"
            >
              Tours home
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#1f2a1f]">
            Refine {activity.label} tours
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-[#2f4a2f]">
              State
              <select
                className="rounded-md border border-[#2f4a2f]/20 bg-white px-3 py-2 text-sm text-[#1f2a1f]"
                value={params.stateSlug ?? ""}
                onChange={event => {
                  window.location.assign(
                    buildActivityDiscoveryPath({
                      activitySlug: activity.slug,
                      stateSlug: event.target.value || undefined,
                    })
                  );
                }}
              >
                <option value="">All states</option>
                {stateOptions.map(state => (
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
                value={params.citySlug ?? ""}
                onChange={event => {
                  window.location.assign(
                    buildActivityDiscoveryPath({
                      activitySlug: activity.slug,
                      stateSlug: params.stateSlug,
                      citySlug: event.target.value || undefined,
                    })
                  );
                }}
                disabled={!params.stateSlug}
              >
                <option value="">
                  {params.stateSlug ? "All cities" : "Select a state first"}
                </option>
                {cityOptions.map(city => (
                  <option key={city.slug} value={city.slug}>
                    {city.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {internationalCountryOptions.length ? (
            <div className="mt-6 border-t border-[#2f4a2f]/10 pt-5">
              <h3 className="text-base font-semibold text-[#1f2a1f]">
                International Locations
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-[#2f4a2f]">
                  Country
                  <select
                    className="rounded-md border border-[#2f4a2f]/20 bg-white px-3 py-2 text-sm text-[#1f2a1f]"
                    value={selectedInternationalCountrySlug}
                    onChange={event => {
                      setSelectedInternationalCountrySlug(event.target.value);
                    }}
                  >
                    <option value="">Select a country</option>
                    {internationalCountryOptions.map(country => (
                      <option key={country.slug} value={country.slug}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-[#2f4a2f]">
                  City
                  <select
                    className="rounded-md border border-[#2f4a2f]/20 bg-white px-3 py-2 text-sm text-[#1f2a1f]"
                    value=""
                    onChange={event => {
                      const city = internationalCityOptions.find(
                        option => option.slug === event.target.value
                      );
                      if (city) {
                        window.location.assign(city.route);
                      }
                    }}
                    disabled={!selectedInternationalCountrySlug}
                  >
                    <option value="">
                      {selectedInternationalCountrySlug
                        ? "Select a city"
                        : "Select a country first"}
                    </option>
                    {internationalCityOptions.map(city => (
                      <option key={city.slug} value={city.slug}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex flex-col gap-2 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            {formatCountLabel(activityTours.length)}
          </span>
          <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            Explore {activity.label.toLowerCase()} tour cards
          </h2>
          <p className="text-sm text-[#405040] md:text-base">
            Card badges continue to show each tour’s primary display category.
          </p>
        </div>
        {activityTours.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {hydratedActivityTourEntries.map(entry => (
              <TourCard
                key={entry.tour.id}
                tour={entry.tour}
                href={entry.href || getActivityTourHref(entry.tour)}
              />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-sm text-[#405040]">
            No {activity.label.toLowerCase()} tours are available for this page
            yet.
          </p>
        )}
      </section>
    </main>
  );
}
