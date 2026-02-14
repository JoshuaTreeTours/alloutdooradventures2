const DEFAULT_TIMEZONE = "America/Los_Angeles";

type YearMonth = {
  year: string;
  month: string;
};

type GetCurrentYearMonthOptions = {
  date?: Date;
  timeZone?: string;
};

type FareHarborBookingArgs = {
  shortname: string;
  itemId: string;
  refUrl: string;
  backUrl: string;
};

const REQUIRED_PARAMS = {
  asn: "fh",
  "asn-ref": "alloutdooradventures",
  flow: "no",
  "full-items": "yes",
  g4: "yes",
} as const;

export const getCurrentYearMonth = (
  opts: GetCurrentYearMonthOptions = {}
): YearMonth => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: opts.timeZone ?? DEFAULT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
  });

  const parts = formatter.formatToParts(opts.date ?? new Date());
  const year = parts.find(part => part.type === "year")?.value;
  const month = parts.find(part => part.type === "month")?.value;

  if (!year || !month) {
    throw new Error("Unable to resolve current FareHarbor year/month.");
  }

  return {
    year,
    month,
  };
};

const setCommonParams = (
  params: URLSearchParams,
  args: FareHarborBookingArgs
) => {
  Object.entries(REQUIRED_PARAMS).forEach(([key, value]) => {
    params.set(key, value);
  });
  params.set("ref", args.refUrl);
  params.set("back", args.backUrl);
};

export const buildFareHarborCalendarUrl = (args: FareHarborBookingArgs) => {
  const { year, month } = getCurrentYearMonth();
  const url = new URL(
    `https://fareharbor.com/embeds/book/${args.shortname}/items/${args.itemId}/calendar/${year}/${month}/`
  );

  setCommonParams(url.searchParams, args);

  return url.toString();
};

export const buildFareHarborItemUrl = (args: FareHarborBookingArgs) => {
  const url = new URL(
    `https://fareharbor.com/embeds/book/${args.shortname}/items/${args.itemId}/`
  );

  setCommonParams(url.searchParams, args);

  return url.toString();
};
