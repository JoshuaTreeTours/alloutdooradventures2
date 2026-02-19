import { buildStateGuide, getGuideStates } from "../../data/guideData";

export type StateTopCity = {
  stateSlug: string;
  cityName: string;
  citySlug: string;
};

export const getStateTopCities = (): StateTopCity[] => {
  const records: StateTopCity[] = [];

  getGuideStates().forEach(state => {
    const guide = buildStateGuide(state.slug);
    if (!guide?.topCities?.length) {
      return;
    }

    guide.topCities.forEach(city => {
      records.push({
        stateSlug: state.slug,
        cityName: city.name,
        citySlug: city.slug,
      });
    });
  });

  return records;
};
