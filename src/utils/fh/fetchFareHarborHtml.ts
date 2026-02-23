import { fareHarborHtmlByUrl } from "./fareharborBookFixtures";

export const fetchFareHarborHtml = (fareHarborUrl: string): string | null =>
  fareHarborHtmlByUrl[fareHarborUrl] ?? null;

