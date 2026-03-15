import GuidePageTemplate from "../../templates/GuidePageTemplate";
import { loadUsCityGuide } from "../../utils/loadGuide";
import Engine6HiloPilotListingSection from "../../engine6/components/Engine6HiloPilotListingSection";

type CityGuideUsRouteProps = {
  params: {
    stateSlug: string;
    citySlug: string;
  };
};

export default function CityGuideUsRoute({ params }: CityGuideUsRouteProps) {
  const guide = loadUsCityGuide(params.stateSlug, params.citySlug);

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

  const isHiloGuide =
    params.stateSlug === "hawaii" && params.citySlug === "hilo";

  return (
    <>
      {isHiloGuide ? (
        <Engine6HiloPilotListingSection heading="ENGINE6 PILOT • Hilo guide" />
      ) : null}
      <GuidePageTemplate guide={guide} />
    </>
  );
}
