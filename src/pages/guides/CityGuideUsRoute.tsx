import RouteRedirect from "../../components/RouteRedirect";
import GuidePageTemplate from "../../templates/GuidePageTemplate";
import { loadUsCityGuide } from "../../utils/loadGuide";
import { resolveMissingUsCityGuideRedirect } from "../../utils/guides/guideResolver";

type CityGuideUsRouteProps = {
  params: {
    stateSlug: string;
    citySlug: string;
  };
};

export default function CityGuideUsRoute({ params }: CityGuideUsRouteProps) {
  const guide = loadUsCityGuide(params.stateSlug, params.citySlug);

  if (!guide) {
    const redirectTo = resolveMissingUsCityGuideRedirect(
      params.stateSlug,
      params.citySlug
    );

    if (redirectTo) {
      return <RouteRedirect to={redirectTo} />;
    }

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

  return <GuidePageTemplate guide={guide} />;
}
