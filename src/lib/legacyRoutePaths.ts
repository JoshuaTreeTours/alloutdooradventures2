export type LegacyTourPathSeed = {
  slug?: string;
  destination?: { stateSlug?: string; citySlug?: string };
};

export const buildLegacyTourPathsFromTours = (
  tours: LegacyTourPathSeed[]
): string[] => {
  const paths = new Set<string>();
  for (const tour of tours) {
    if (!tour?.slug || !tour?.destination?.stateSlug || !tour?.destination?.citySlug) {
      continue;
    }

    paths.add(`/tours/${tour.destination.stateSlug}/${tour.destination.citySlug}/${tour.slug}`);
    paths.add(`/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`);
  }

  return Array.from(paths);
};
