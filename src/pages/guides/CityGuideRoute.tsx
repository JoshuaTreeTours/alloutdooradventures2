import RouteRedirect from "../../components/RouteRedirect";
import GuideTemplate from "../../templates/GuideTemplate";
import { buildCityGuide } from "../../data/guideData";
import { GUIDE_RETENTION_MIN_ACTIVE_TOURS } from "../../utils/guides/guideRetentionPolicy";

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
  const guide = buildCityGuide({
    parentSlug: params.parentSlug,
    citySlug: params.citySlug,
    regionType,
    activityFocus: activity,
  });

  if (guide && guide.featuredTours.length < GUIDE_RETENTION_MIN_ACTIVE_TOURS) {
    return (
      <RouteRedirect
        to={
          regionType === "state"
            ? `/guides/us/${params.parentSlug}`
            : `/guides/world/${params.parentSlug}`
        }
      />
    );
  }

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
