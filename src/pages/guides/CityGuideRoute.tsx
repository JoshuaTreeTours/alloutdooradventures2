import GuideTemplate from "../../templates/GuideTemplate";
import InternationalCityGuideTemplate from "../../templates/InternationalCityGuideTemplate";
import { buildCityGuide } from "../../data/guideData";
import {
  enhanceInternationalGuidePhase3,
  INTERNATIONAL_PARAGON_PHASE3_GUIDE_KEYS,
} from "../../data/internationalGuidePhase3";
import { withEngine6OnlyInternationalCityTopTours } from "../../data/internationalGuideEngine6Tours";

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

const getInternationalEnhancementParentSlug = (
  parentSlug: string,
  citySlug: string,
) =>
  parentSlug === "united-kingdom" && citySlug === "edinburgh"
    ? "scotland"
    : parentSlug;

export default function CityGuideRoute({
  params,
  regionType,
}: CityGuideRouteProps) {
  const activity = getActivityFilter() ?? undefined;
  const enhancementParentSlug = getInternationalEnhancementParentSlug(
    params.parentSlug,
    params.citySlug,
  );
  const paragonKey = `${enhancementParentSlug}/${params.citySlug}`;
  const isInternationalParagon =
    regionType === "country" &&
    INTERNATIONAL_PARAGON_PHASE3_GUIDE_KEYS.includes(paragonKey);

  const baseGuide = buildCityGuide({
    parentSlug: params.parentSlug,
    citySlug: params.citySlug,
    regionType,
    activityFocus: activity,
  });
  const enhancedGuide =
    baseGuide && regionType === "country"
      ? enhanceInternationalGuidePhase3(
          enhancementParentSlug,
          params.citySlug,
          baseGuide,
        )
      : baseGuide;
  const guide =
    enhancedGuide && regionType === "country"
      ? withEngine6OnlyInternationalCityTopTours(
          enhancedGuide,
          params.parentSlug,
          params.citySlug,
        )
      : enhancedGuide;

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

  return isInternationalParagon ? (
    <InternationalCityGuideTemplate guide={guide} />
  ) : (
    <GuideTemplate guide={guide} />
  );
}
