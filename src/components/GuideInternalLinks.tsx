import { Link } from "wouter";

import { getActivityLabelFromSlug } from "../data/activityLabels";
import { cityContext } from "../data/cityContext";
import type { GuideContent, GuideLink } from "../data/guideData";
import { getGuideTourDetailPath } from "../data/guideData";
import {
  getAllToursHref,
  getTopCitiesForPlace,
  getTopToursForPlace,
  getTourCountsForActivities,
  isEuropeCountrySlug,
} from "../data/tourIndex";
import { slugify } from "../data/tourCatalog";
import TourCard from "./TourCard";

type GuideInternalLinksProps = {
  guide: GuideContent;
  variant: "intro" | "primary" | "top-tours" | "nearby";
};

const ACTIVITY_LINKS = [
  { activitySlug: "cycling", routeSlug: "cycling" },
  { activitySlug: "hiking", routeSlug: "hiking" },
  { activitySlug: "canoeing", routeSlug: "paddle-sports" },
];

const STATE_ABBREVIATIONS: Record<string, string> = {
  alabama: "al",
  alaska: "ak",
  arizona: "az",
  arkansas: "ar",
  california: "ca",
  colorado: "co",
  connecticut: "ct",
  delaware: "de",
  florida: "fl",
  georgia: "ga",
  hawaii: "hi",
  idaho: "id",
  illinois: "il",
  indiana: "in",
  iowa: "ia",
  kansas: "ks",
  kentucky: "ky",
  louisiana: "la",
  maine: "me",
  maryland: "md",
  massachusetts: "ma",
  michigan: "mi",
  minnesota: "mn",
  mississippi: "ms",
  missouri: "mo",
  montana: "mt",
  nebraska: "ne",
  nevada: "nv",
  "new-hampshire": "nh",
  "new-jersey": "nj",
  "new-mexico": "nm",
  "new-york": "ny",
  "north-carolina": "nc",
  "north-dakota": "nd",
  ohio: "oh",
  oklahoma: "ok",
  oregon: "or",
  pennsylvania: "pa",
  "rhode-island": "ri",
  "south-carolina": "sc",
  "south-dakota": "sd",
  tennessee: "tn",
  texas: "tx",
  utah: "ut",
  vermont: "vt",
  virginia: "va",
  washington: "wa",
  "west-virginia": "wv",
  wisconsin: "wi",
  wyoming: "wy",
  "district-of-columbia": "dc",
};

const buildCityContextKey = (parentSlug: string, citySlug: string) => {
  const stateAbbreviation = STATE_ABBREVIATIONS[parentSlug];
  const contextSuffix = stateAbbreviation ?? parentSlug;
  return `${citySlug}-${contextSuffix}`;
};

const buildPlaceLabel = (guide: GuideContent) => {
  if (guide.type === "city") {
    return guide.parentName
      ? `${guide.name}, ${guide.parentName}`
      : guide.name;
  }

  return guide.name;
};

const buildCategoryHref = (guide: GuideContent, activitySlug: string, routeSlug: string) => {
  if (guide.type === "state") {
    return `/tours/${activitySlug}/us/${guide.slug}`;
  }

  if (guide.type === "country") {
    return isEuropeCountrySlug(guide.slug)
      ? `/destinations/europe/${guide.slug}/${routeSlug}`
      : `/destinations/world/${guide.slug}/${routeSlug}`;
  }

  if (guide.regionType === "state") {
    return `/destinations/states/${guide.parentSlug}/cities/${guide.slug}/tours?activity=${activitySlug}`;
  }

  return isEuropeCountrySlug(guide.parentSlug ?? "")
    ? `/destinations/europe/${guide.parentSlug}/cities/${guide.slug}/tours?activity=${activitySlug}`
    : `/destinations/world/${guide.parentSlug}/cities/${guide.slug}/tours?activity=${activitySlug}`;
};

const buildGuidePlace = (guide: GuideContent) => {
  if (guide.type === "state") {
    return { type: "state", slug: guide.slug, name: guide.name } as const;
  }

  if (guide.type === "country") {
    return { type: "country", slug: guide.slug, name: guide.name } as const;
  }

  return {
    type: "city",
    slug: guide.slug,
    name: guide.name,
    parentSlug: guide.parentSlug ?? "",
    parentName: guide.parentName ?? "",
    regionType: guide.regionType ?? "state",
  } as const;
};

const buildPrimaryLinks = (guide: GuideContent): GuideLink[] => {
  const place = buildGuidePlace(guide);
  const placeLabel = buildPlaceLabel(guide);
  const activityCounts = getTourCountsForActivities(
    place,
    ACTIVITY_LINKS.map((link) => link.activitySlug),
  );
  const links: GuideLink[] = [
    {
      label: `All tours in ${placeLabel}`,
      href: getAllToursHref(place),
    },
  ];

  ACTIVITY_LINKS.forEach(({ activitySlug, routeSlug }) => {
    const count = activityCounts[activitySlug] ?? 0;
    if (count <= 0) {
      return;
    }

    links.push({
      label: `${getActivityLabelFromSlug(activitySlug)} tours in ${placeLabel}`,
      href: buildCategoryHref(guide, activitySlug, routeSlug),
    });
  });

  return links;
};

const buildNearbyLinks = (guide: GuideContent): GuideLink[] => {
  if (guide.type === "city") {
    const parentPlace =
      guide.regionType === "country"
        ? ({ type: "country", slug: guide.parentSlug ?? "", name: guide.parentName ?? "" } as const)
        : ({ type: "state", slug: guide.parentSlug ?? "", name: guide.parentName ?? "" } as const);
    const topCities = getTopCitiesForPlace(parentPlace, 8);
    const contextKey = buildCityContextKey(
      guide.parentSlug ?? "",
      guide.slug,
    );
    const nearbyNames = cityContext[contextKey]?.nearby ?? [];
    const mappedNearby = nearbyNames
      .map((name) =>
        topCities.find(
          (city) =>
            city.slug === slugify(name) ||
            city.name.toLowerCase() === name.toLowerCase(),
        ),
      )
      .filter((city): city is (typeof topCities)[number] => Boolean(city))
      .filter((city) => city.slug !== guide.slug);

    const fallbackCities = topCities.filter((city) => city.slug !== guide.slug);
    const citiesToUse = mappedNearby.length ? mappedNearby : fallbackCities;

    return citiesToUse.slice(0, 6).map((city) => ({
      label: `${city.name} guide`,
      href:
        guide.regionType === "state"
          ? `/guides/us/${guide.parentSlug}/${city.slug}`
          : `/guides/world/${guide.parentSlug}/${city.slug}`,
    }));
  }

  const topCities = getTopCitiesForPlace(
    { type: guide.type, slug: guide.slug, name: guide.name } as const,
    8,
  );

  return topCities.slice(0, 6).map((city) => ({
    label: `${city.name} guide`,
    href:
      guide.type === "state"
        ? `/guides/us/${guide.slug}/${city.slug}`
        : `/guides/world/${guide.slug}/${city.slug}`,
  }));
};

export default function GuideInternalLinks({
  guide,
  variant,
}: GuideInternalLinksProps) {
  const place = buildGuidePlace(guide);
  const placeLabel = buildPlaceLabel(guide);
  const primaryLinks = buildPrimaryLinks(guide);
  const nearbyLinks = buildNearbyLinks(guide);
  const topTours = getTopToursForPlace(place, { min: 3, max: 8 });

  if (variant === "intro") {
    const introLinks = primaryLinks.slice(0, 3);
    if (!introLinks.length) {
      return null;
    }

    return (
      <p className="mt-4 text-xs text-white/80 md:text-sm">
        Explore{" "}
        {introLinks.map((link, index) => (
          <span key={link.href}>
            <Link href={link.href}>
              <a className="underline underline-offset-2">{link.label}</a>
            </Link>
            {index < introLinks.length - 1 ? ", " : "."}
          </span>
        ))}
      </p>
    );
  }

  if (variant === "primary") {
    if (!primaryLinks.length) {
      return null;
    }

    return (
      <section className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-semibold text-[#1f2a1f] md:text-xl">
          Plan your adventure
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {primaryLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <a className="inline-flex items-center rounded-full border border-[#2f4a2f]/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f] transition hover:bg-[#f0f4ee]">
                {link.label}
              </a>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "top-tours") {
    if (!topTours.length) {
      return null;
    }

    return (
      <section className="mt-12 rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-10">
        <h2 className="text-xl font-semibold text-[#1f2a1f] md:text-2xl">
          Top tours in {placeLabel}
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {topTours.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              href={getGuideTourDetailPath(tour)}
            />
          ))}
        </div>
      </section>
    );
  }

  if (!nearbyLinks.length) {
    return null;
  }

  return (
    <section className="mt-12 rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-10">
      <h2 className="text-xl font-semibold text-[#1f2a1f] md:text-2xl">
        Explore nearby
      </h2>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#405040]">
        {nearbyLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <a className="inline-flex items-center rounded-full border border-[#2f4a2f]/15 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f] transition hover:bg-[#f0f4ee]">
              {link.label}
            </a>
          </Link>
        ))}
      </div>
    </section>
  );
}
