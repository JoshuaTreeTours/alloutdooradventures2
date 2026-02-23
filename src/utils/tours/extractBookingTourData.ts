export type BookingTourData = {
  duration: string;
  meetingPoint: string;
  age: string;
  cancellation: string;
  groupSize: string;
  accessibility: string;
  location: string;
  operator: string;
};

type ExtractBookingTourDataInput = {
  bookingPageHtml?: string | null;
  pageBodyContent?: string | null;
};

const HARD_FALLBACK: BookingTourData = {
  duration: "3 hours",
  meetingPoint: "Metate Ranch, 38635 Monroe St, Indio, CA",
  age: "5+",
  cancellation: "Free cancellation up to 48 hours before departure",
  groupSize: "2–7 guests per Jeep",
  accessibility: "Not wheelchair accessible; uneven desert terrain and short walks",
  location: "Indio Hills / San Andreas Fault zone",
  operator: "Red Jeep Tours",
};

const clean = (value: string) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const decodeEntities = (value: string) =>
  value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const extractText = (value: unknown): string => {
  if (typeof value === "string") {
    return decodeEntities(clean(value));
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
};

const readFirst = (content: string, patterns: RegExp[]) => {
  for (const pattern of patterns) {
    const match = content.match(pattern);
    const text = extractText(match?.[1]);
    if (text) {
      return text;
    }
  }

  return "";
};

export const extractBookingTourData = ({
  bookingPageHtml,
  pageBodyContent,
}: ExtractBookingTourDataInput): BookingTourData => {
  const primary = bookingPageHtml ?? "";
  const secondary = pageBodyContent ?? "";
  const combined = `${primary}\n${secondary}`;

  const data: Partial<Record<keyof BookingTourData, unknown>> = {
    duration:
      readFirst(primary, [
        /Duration\s*[:\-]\s*([^\n<]+)/i,
        /([0-9]+\s*(?:hour|hours|hr))/i,
      ]) ||
      readFirst(secondary, [/([0-9]+\s*(?:hour|hours|hr))/i]) ||
      "3 hours",
    meetingPoint:
      readFirst(primary, [
        /Meeting\s*(?:Point|Location)\s*[:\-]\s*([^\n<]+)/i,
        /(Metate Ranch[^\n<]*)/i,
      ]) ||
      readFirst(secondary, [/(Metate Ranch[^\n<]*)/i]) ||
      HARD_FALLBACK.meetingPoint,
    age:
      readFirst(primary, [
        /(?:Minimum\s+Age|Age)\s*[:\-]\s*([^\n<]+)/i,
        /(\b[0-9]{1,2}\s*\+\b)/i,
      ]) ||
      readFirst(secondary, [/(\b[0-9]{1,2}\s*\+\b)/i]) ||
      HARD_FALLBACK.age,
    cancellation:
      readFirst(primary, [
        /Cancellation\s*[:\-]\s*([^\n<]+)/i,
        /(\b[0-9]{1,2}\s*hours?[^\n<]*cancellation[^\n<]*)/i,
        /(free cancellation[^\n<]*)/i,
      ]) ||
      readFirst(secondary, [
        /(\b[0-9]{1,2}\s*hours?[^\n<]*cancellation[^\n<]*)/i,
        /(free cancellation[^\n<]*)/i,
      ]) ||
      HARD_FALLBACK.cancellation,
    groupSize:
      readFirst(primary, [
        /Group\s*Size\s*[:\-]\s*([^\n<]+)/i,
        /(\b[0-9]+\s*[–-]\s*[0-9]+\s*(?:guests?|people|passengers)[^\n<]*)/i,
      ]) ||
      readFirst(secondary, [
        /(\b[0-9]+\s*[–-]\s*[0-9]+\s*(?:guests?|people|passengers)[^\n<]*)/i,
      ]) ||
      HARD_FALLBACK.groupSize,
    accessibility:
      readFirst(combined, [
        /Accessibility\s*[:\-]\s*([^\n<]+)/i,
        /(not wheelchair accessible[^\n<]*)/i,
      ]) || HARD_FALLBACK.accessibility,
    location:
      readFirst(combined, [
        /(Indio Hills[^\n<]*)/i,
        /(San Andreas Fault zone[^\n<]*)/i,
      ]) || HARD_FALLBACK.location,
    operator:
      readFirst(combined, [
        /Operated by\s*([^\n<]+)/i,
        /(Red Jeep Tours)/i,
        /(Desert Adventures Red Jeep Tours)/i,
      ]) || HARD_FALLBACK.operator,
  };

  if (typeof data.duration === "object") {
    delete data.duration;
  }

  return {
    duration: extractText(data.duration) || HARD_FALLBACK.duration,
    meetingPoint: extractText(data.meetingPoint) || HARD_FALLBACK.meetingPoint,
    age: extractText(data.age) || HARD_FALLBACK.age,
    cancellation: extractText(data.cancellation) || HARD_FALLBACK.cancellation,
    groupSize: extractText(data.groupSize) || HARD_FALLBACK.groupSize,
    accessibility: extractText(data.accessibility) || HARD_FALLBACK.accessibility,
    location: extractText(data.location) || HARD_FALLBACK.location,
    operator: extractText(data.operator) || HARD_FALLBACK.operator,
  };
};
