import path from "node:path";
import { isTier1City } from "../../data/cityTier1";

type TieredGuide = {
  tier?: "tier1" | "tier2";
};

export const isTier1Guide = (
  guide: TieredGuide,
  guideFilePath?: string
): boolean => {
  if (guide.tier === "tier1") {
    return true;
  }

  if (!guideFilePath) {
    return false;
  }

  const citySlug = path.basename(guideFilePath, ".json");
  return isTier1City(citySlug);
};
