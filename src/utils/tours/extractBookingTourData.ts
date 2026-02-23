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

const readFirst = (content: string, patterns: RegExp[]) => {
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match?.[1]) {
      return decodeEntities(clean(match[1]));
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

  const duration =
    readFirst(primary, [
      /Duration\s*[:\-]\s*([^\n<]+)/i,
      /([0-9]+\s*(?:hour|hours|hr))/i,
    ]) ||
    readFirst(secondary, [/([0-9]+\s*(?:hour|hours|hr))/i]) ||
    HARD_FALLBACK.duration;

  const meetingPoint =
    readFirst(primary, [
      /Meeting\s*(?:Point|Location)\s*[:\-]\s*([^\n<]+)/i,
      /(Metate Ranch[^\n<]*)/i,
    ]) ||
    readFirst(secondary, [/(Metate Ranch[^\n<]*)/i]) ||
    HARD_FALLBACK.meetingPoint;

  const age =
    readFirst(primary, [
      /(?:Minimum\s+Age|Age)\s*[:\-]\s*([^\n<]+)/i,
      /(\b[0-9]{1,2}\s*\+\b)/i,
    ]) ||
    readFirst(secondary, [/(\b[0-9]{1,2}\s*\+\b)/i]) ||
    HARD_FALLBACK.age;

  const cancellationRaw =
    readFirst(primary, [
      /Cancellation\s*[:\-]\s*([^\n<]+)/i,
      /(\b[0-9]{1,2}\s*hours?[^\n<]*cancellation[^\n<]*)/i,
      /(free cancellation[^\n<]*)/i,
    ]) ||
    readFirst(secondary, [
      /(\b[0-9]{1,2}\s*hours?[^\n<]*cancellation[^\n<]*)/i,
      /(free cancellation[^\n<]*)/i,
    ]);
  const cancellation = cancellationRaw || HARD_FALLBACK.cancellation;

  const groupSize =
    readFirst(primary, [
      /Group\s*Size\s*[:\-]\s*([^\n<]+)/i,
      /(\b[0-9]+\s*[–-]\s*[0-9]+\s*(?:guests?|people|passengers)[^\n<]*)/i,
    ]) ||
    readFirst(secondary, [
      /(\b[0-9]+\s*[–-]\s*[0-9]+\s*(?:guests?|people|passengers)[^\n<]*)/i,
    ]) ||
    HARD_FALLBACK.groupSize;

  const accessibility =
    readFirst(combined, [
      /Accessibility\s*[:\-]\s*([^\n<]+)/i,
      /(not wheelchair accessible[^\n<]*)/i,
    ]) || HARD_FALLBACK.accessibility;

  const location =
    readFirst(combined, [
      /(Indio Hills[^\n<]*)/i,
      /(San Andreas Fault zone[^\n<]*)/i,
    ]) || HARD_FALLBACK.location;

  const operator =
    readFirst(combined, [
      /Operated by\s*([^\n<]+)/i,
      /(Red Jeep Tours)/i,
      /(Desert Adventures Red Jeep Tours)/i,
    ]) || HARD_FALLBACK.operator;

  return {
    duration,
    meetingPoint,
    age,
    cancellation,
    groupSize,
    accessibility,
    location,
    operator,
  };
};
