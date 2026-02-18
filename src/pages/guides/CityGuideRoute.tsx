import GuideTemplate from "../../templates/GuideTemplate";
import GeneratedWorldGuideRoute, { shouldUseGeneratedGuide } from "./GeneratedWorldGuideRoute";
import { buildCityGuide } from "../../data/guideData";

type CityGuideRouteProps = {
  params: {
    parentSlug: string;
    citySlug: string;
  };
  regionType: "state" | "country";
};

const getActivityFilter = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("activity");
};

export default function CityGuideRoute({
  params,
  regionType,
}: CityGuideRouteProps) {
  const activity = getActivityFilter() ?? undefined;

  if (
    regionType === "country" &&
    shouldUseGeneratedGuide(params.parentSlug, params.citySlug)
  ) {
    return (
      <GeneratedWorldGuideRoute
        countrySlug={params.parentSlug}
        citySlug={params.citySlug}
      />
    );
  }

  const guide = buildCityGuide({
    parentSlug: params.parentSlug,
    citySlug: params.citySlug,
    regionType,
    activityFocus: activity,
  });

  if (!guide) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Guide not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that guide. Explore the main guides list to pick
          another destination.
        </p>
      </main>
    );
  }

  return <GuideTemplate guide={guide} />;
}
