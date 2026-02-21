import { useEffect } from "react";
import GuidePageTemplate from "../../templates/GuidePageTemplate";
import { loadUsCityGuide } from "../../utils/loadGuide";
import { useLocation } from "wouter";

type CityGuideUsRouteProps = {
  params: {
    stateSlug: string;
    citySlug: string;
  };
};

export default function CityGuideUsRoute({ params }: CityGuideUsRouteProps) {
  const [, setLocation] = useLocation();
  const guide = loadUsCityGuide(params.stateSlug, params.citySlug);

  useEffect(() => {
    if (!guide) {
      setLocation(`/guides/us/${params.stateSlug}`, { replace: true });
    }
  }, [guide, params.stateSlug, setLocation]);

  if (!guide) {
    return null;
  }

  return <GuidePageTemplate guide={guide} />;
}
