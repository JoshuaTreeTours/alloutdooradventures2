import { getEngine2TourByPath } from "../../engine2/data/loadEngine2";
import { fareHarborUrlByBookPath } from "./fareharborBookFixtures";

const normalizeBookPath = (bookPath: string) =>
  bookPath.trim().replace(/\?.*$/, "").replace(/\/+$/, "");

export const resolveFareHarborUrlFromBookPage = (
  bookPath: string
): string | null => {
  const normalizedBookPath = normalizeBookPath(bookPath);

  if (fareHarborUrlByBookPath[normalizedBookPath]) {
    return fareHarborUrlByBookPath[normalizedBookPath];
  }

  const canonicalPath = normalizedBookPath.replace(/\/book$/, "");
  const tour = getEngine2TourByPath(canonicalPath);
  return tour?.bookingUrl ?? null;
};

