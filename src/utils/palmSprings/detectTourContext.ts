export type DetectTourContextInput = {
  title?: string;
  slug?: string;
  category?: string;
};

export type TourContextFlags = {
  isFaultTour: boolean;
  isJeepTour: boolean;
  isHikingTour: boolean;
  isOasisTour: boolean;
  isAerialTramwayTour: boolean;
  isCanyonTour: boolean;
};

const hasKeyword = (value: string, pattern: RegExp) => pattern.test(value);

export const detectTourContext = ({
  title,
  slug,
  category,
}: DetectTourContextInput): TourContextFlags => {
  const joined = [title, slug, category]
    .filter((item): item is string => typeof item === "string")
    .join(" ")
    .toLowerCase();

  return {
    isFaultTour: hasKeyword(
      joined,
      /\bfault\b|san\s*andreas|tectonic|plate\s*boundary/
    ),
    isJeepTour: hasKeyword(joined, /\bjeep\b|off[-\s]?road|4x4/),
    isHikingTour: hasKeyword(joined, /\bhik(e|ing)\b|trail|trek|walk/),
    isOasisTour: hasKeyword(joined, /\boasis\b|oases|palm\s*oasis/),
    isAerialTramwayTour: hasKeyword(joined, /aerial\s*tramway|tram\b/),
    isCanyonTour: hasKeyword(joined, /\bcanyon\b|gorge/),
  };
};
