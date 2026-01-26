import type { Tour } from "../data/tours.types";

const multiDayTriggers = ["multi-day", "multi day", "overnight"];

const extractDurationDays = (text?: string) => {
  if (!text) {
    return undefined;
  }

  const normalized = text.toLowerCase();
  const overnightMatch = normalized.match(/(\d+)\s*d\s*\/\s*(\d+)\s*n/);
  if (overnightMatch) {
    const days = Number(overnightMatch[1]);
    return Number.isNaN(days) ? undefined : days;
  }

  const rangeMatch = normalized.match(/(\d+)\s*-\s*(\d+)\s*day/);
  if (rangeMatch) {
    const days = Number(rangeMatch[1]);
    return Number.isNaN(days) ? undefined : days;
  }

  const dayMatch = normalized.match(/\b(\d+)\s*day/);
  if (dayMatch) {
    const days = Number(dayMatch[1]);
    return Number.isNaN(days) ? undefined : days;
  }

  const compactMatch = normalized.match(/\b(\d+)\s*d\b/);
  if (compactMatch) {
    const days = Number(compactMatch[1]);
    return Number.isNaN(days) ? undefined : days;
  }

  return undefined;
};

export const getTourDurationDays = (tour: Tour) => {
  const sources = [
    tour.badges?.duration,
    tour.badges?.tagline,
    tour.title,
    tour.slug?.replace(/-/g, " "),
  ];

  for (const source of sources) {
    const durationDays = extractDurationDays(source);
    if (durationDays !== undefined) {
      return durationDays;
    }
  }

  if (multiDayTriggers.some((trigger) => tour.title.toLowerCase().includes(trigger))) {
    return 2;
  }

  return undefined;
};

export const isMultiDayTour = (tour: Tour, durationDays?: number) => {
  if (durationDays !== undefined) {
    return durationDays > 1;
  }

  const combined = `${tour.title} ${tour.slug}`.toLowerCase();
  if (combined.includes("full day") || combined.includes("day-long")) {
    return false;
  }

  return multiDayTriggers.some((trigger) => combined.includes(trigger));
};

export const getMultiDayTours = (tourList: Tour[]) =>
  tourList
    .map((tour) => {
      const durationDays = getTourDurationDays(tour);
      return {
        tour,
        durationDays,
        isMultiDay: isMultiDayTour(tour, durationDays),
      };
    })
    .filter(({ isMultiDay }) => isMultiDay);

export const buildJourneyLinkForTour = (tour: Tour) => {
  const params = new URLSearchParams();
  if (tour.slug) {
    params.set("tour", tour.slug);
  }
  if (tour.title) {
    params.set("q", tour.title);
  }

  const queryString = params.toString();
  return queryString ? `/journeys?${queryString}` : "/journeys";
};
