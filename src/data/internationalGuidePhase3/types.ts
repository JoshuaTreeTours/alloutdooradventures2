export type InternationalGuidePhase3Poi = {
  title: string;
  description: string;
};

export type InternationalGuidePhase3Profile = {
  overview: string;
  context: string;
  planning: string;
  season: string;
  pack: string;
  pois: InternationalGuidePhase3Poi[];
};
