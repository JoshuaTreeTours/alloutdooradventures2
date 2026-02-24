const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

type WikiApiQueryResponse = {
  query?: {
    search?: Array<{ title?: string }>;
    pages?: Record<
      string,
      {
        title?: string;
        imageinfo?: Array<{
          url?: string;
          descriptionurl?: string;
          extmetadata?: Record<string, { value?: string }>;
          width?: number;
          height?: number;
        }>;
      }
    >;
  };
};

export type WikiFileInfo = {
  fileTitle: string;
  url: string;
  sourcePage: string;
  author: string;
  licenseShort: string;
  licenseUrl?: string;
  width?: number;
  height?: number;
};

const stripHtml = (value?: string) =>
  (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const queryCommonsApi = async (params: URLSearchParams) => {
  params.set("origin", "*");
  const response = await fetch(`${COMMONS_API}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Wikimedia API request failed: ${response.status}`);
  }

  return (await response.json()) as WikiApiQueryResponse;
};

export const searchFiles = async (query: string): Promise<string[]> => {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    list: "search",
    srnamespace: "6",
    srlimit: "12",
    srsearch: query,
  });

  const data = await queryCommonsApi(params);
  const seen = new Set<string>();

  return (data.query?.search ?? [])
    .map(result => result.title?.trim() ?? "")
    .filter(Boolean)
    .filter(title => {
      if (seen.has(title)) {
        return false;
      }
      seen.add(title);
      return true;
    });
};

export const getFileInfo = async (
  fileTitle: string,
): Promise<WikiFileInfo | null> => {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "imageinfo",
    titles: fileTitle,
    iiprop: "url|extmetadata|size",
  });

  const data = await queryCommonsApi(params);
  const pages = Object.values(data.query?.pages ?? {});
  const imageInfo = pages[0]?.imageinfo?.[0];
  if (!imageInfo?.url) {
    return null;
  }

  const ext = imageInfo.extmetadata ?? {};
  const author =
    stripHtml(ext.Artist?.value) ||
    stripHtml(ext.Credit?.value) ||
    "Unknown author";
  const licenseShort =
    stripHtml(ext.LicenseShortName?.value) ||
    stripHtml(ext.UsageTerms?.value) ||
    "License unspecified";

  return {
    fileTitle,
    url: imageInfo.url,
    sourcePage: imageInfo.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle.replace(/\s+/g, "_"))}`,
    author,
    licenseShort,
    licenseUrl: stripHtml(ext.LicenseUrl?.value) || undefined,
    width: imageInfo.width,
    height: imageInfo.height,
  };
};
