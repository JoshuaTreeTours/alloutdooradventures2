import type { FareHarborItemFixture } from "./fareharborBookFixtures";
import { cleanImageUrls } from "../cleanImageUrls";

export const getSecondGalleryImageUrl = (
  fhItem: FareHarborItemFixture | null | undefined,
  heroUrl: string | null | undefined
): string | null => {
  const hero =
    cleanImageUrls([heroUrl], 1).find(url => /^https:\/\//i.test(url)) ?? null;
  const candidates = cleanImageUrls(fhItem?.imageUrls ?? [], 10).filter(url =>
    /^https:\/\//i.test(url)
  );
  const image2 = candidates.find(url => url !== hero);
  return image2 ?? null;
};
