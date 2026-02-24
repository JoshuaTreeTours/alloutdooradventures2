import { cleanImageUrls } from "./cleanImageUrls";

export const selectTourImages = (
  heroImageUrl: string | null | undefined,
  image2Url: string | null | undefined
): string[] => cleanImageUrls([heroImageUrl, image2Url], 2);
