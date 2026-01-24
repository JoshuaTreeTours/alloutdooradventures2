import GuideTemplate from "../../templates/GuideTemplate";
import { buildCountryGuide } from "../../data/guideData";

type CountryGuideRouteProps = {
  params: {
    countrySlug: string;
  };
};

export default function CountryGuideRoute({ params }: CountryGuideRouteProps) {
  const guide = buildCountryGuide(params.countrySlug);

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
