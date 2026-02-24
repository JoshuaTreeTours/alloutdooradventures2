// ENGINE2 ONLY — DO NOT IMPORT INTO ENGINE1

const DEFAULT_TIMEZONE = "America/Los_Angeles";
const DEFAULT_REF = "https://www.alloutdooradventures.com";
const DEFAULT_BACK = "https://www.alloutdooradventures.com/";

const REQUIRED_QUERY_PAIRS = [
  ["asn", "fhdn"],
  ["asn-ref", "alloutdooradventures"],
  ["flow", "no"],
  ["full-items", "yes"],
  ["g4", "yes"],
  ["ref", DEFAULT_REF],
  ["back", DEFAULT_BACK],
] as const;

const getCurrentYearMonth = () => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: DEFAULT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());
  const year = parts.find(part => part.type === "year")?.value;
  const month = parts.find(part => part.type === "month")?.value;

  if (!year || !month) {
    throw new Error("Unable to resolve current FareHarbor year/month.");
  }

  return { year, month };
};

const normalizeCalendarPath = (calendarPath?: string) => {
  const match = calendarPath?.match(/\/calendar\/(\d{4})\/(\d{2})\/?/);
  if (match?.[1] && match?.[2]) {
    return `/calendar/${match[1]}/${match[2]}/`;
  }

  const { year, month } = getCurrentYearMonth();
  return `/calendar/${year}/${month}/`;
};

export type BuildFareHarborUrlArgs = {
  company: string;
  itemId: string;
  calendarPath?: string;
};

export const buildFareHarborUrl = ({
  company,
  itemId,
  calendarPath,
}: BuildFareHarborUrlArgs) => {
  const normalizedCalendarPath = normalizeCalendarPath(calendarPath);
  const baseUrl = `https://fareharbor.com/embeds/book/${company}/items/${itemId}${normalizedCalendarPath}`;
  const query = REQUIRED_QUERY_PAIRS.map(
    ([key, value]) => `${key}=${encodeURIComponent(value)}`
  ).join("&");

  return `${baseUrl}?${query}`;
};

const parseFareHarborPath = (path: string) => {
  const match = path.match(
    /\/embeds\/(?:book|calendar)\/([^/]+)\/items\/(\d+)(\/calendar\/\d{4}\/\d{2}\/?|\/)?/
  );

  if (!match?.[1] || !match?.[2]) {
    return null;
  }

  return {
    company: match[1],
    itemId: match[2],
    calendarPath: match[3],
  };
};

export const normalizeFareHarborUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "fareharbor.com") {
      return url;
    }

    const pathParts = parseFareHarborPath(parsed.pathname);
    if (!pathParts) {
      return url;
    }

    return buildFareHarborUrl(pathParts);
  } catch {
    return url;
  }
};
