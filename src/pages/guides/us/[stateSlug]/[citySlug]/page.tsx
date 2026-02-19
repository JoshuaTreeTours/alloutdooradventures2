import CityGuideUsRoute from "../../../CityGuideUsRoute";

type GuidePageRouteProps = {
  params: {
    stateSlug: string;
    citySlug: string;
  };
};

export default function GuidePageRoute({ params }: GuidePageRouteProps) {
  return <CityGuideUsRoute params={params} />;
}
