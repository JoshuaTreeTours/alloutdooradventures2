const FALLBACK_ENGINE6_OVERVIEW_MAX_WORDS = 32;
const REWRITTEN_ENGINE6_OVERVIEW_MAX_WORDS = 180;
const REWRITTEN_ENGINE6_OVERVIEW_MIN_WORDS = 120;

const cleanWhitespace = (value: string) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toSentence = (value: string) => {
  const normalized = cleanWhitespace(value).replace(/[.;:,]+$/g, "");
  if (!normalized) {
    return "";
  }

  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}.`;
};

const truncateToWords = (value: string, maxWords: number) => {
  const words = cleanWhitespace(value).split(" ").filter(Boolean);
  if (words.length <= maxWords) {
    return words.join(" ");
  }

  return `${words.slice(0, maxWords).join(" ")}...`;
};

const joinList = (items: string[]) => {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0] ?? "";
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
};

const unique = (items: Array<string | null | undefined>) => {
  const seen = new Set<string>();
  return items.filter((item): item is string => {
    const normalized = cleanWhitespace(item ?? "");
    if (!normalized) {
      return false;
    }

    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

export const buildEngine6FallbackOverview = (originalOverview: string) =>
  truncateToWords(originalOverview, FALLBACK_ENGINE6_OVERVIEW_MAX_WORDS);

export const rewriteEngine6Overview = ({
  title,
  city,
  state,
  originalOverview,
  durationText,
  highlights,
  itinerary,
}: {
  title: string;
  city: string;
  state: string;
  originalOverview: string | null;
  durationText: string | null;
  highlights: string[];
  itinerary: Array<{ title: string }>;
}) => {
  const stopNames = unique(itinerary.map(item => item.title)).slice(0, 4);
  const highlightPhrases = unique(highlights).slice(0, 3);

  const candidateSentences = [
    toSentence(
      `${title} is a ${durationText ? `${durationText.toLowerCase()} ` : ""}guided outing based around ${city}, ${state}, giving travelers a structured way to experience the surrounding scenery without piecing the day together on their own`
    ),
    stopNames.length > 0
      ? toSentence(
          `Most departures focus on major stops such as ${joinList(stopNames)}, pairing time at the viewpoints with a comfortable point-to-point route`
        )
      : "",
    highlightPhrases.length > 0
      ? toSentence(
          `Travelers can expect details such as ${joinList(highlightPhrases).toLowerCase()}, which adds practical value without overcomplicating the day`
        )
      : "",
    toSentence(
      `For visitors comparing Grand Canyon day trips from Las Vegas, the experience balances recognizable landmarks, efficient logistics, and enough time on site to enjoy the West Rim rather than only the drive`
    ),
    toSentence(
      `The result is an itinerary built around scenic access, pickup convenience, and a clearer sense of place for first-time Nevada and Arizona travelers`
    ),
  ].filter(Boolean);

  const rewritten = cleanWhitespace(candidateSentences.join(" "));
  const wordCount = rewritten.split(" ").filter(Boolean).length;

  if (wordCount >= REWRITTEN_ENGINE6_OVERVIEW_MIN_WORDS) {
    return truncateToWords(rewritten, REWRITTEN_ENGINE6_OVERVIEW_MAX_WORDS);
  }

  if (originalOverview) {
    return buildEngine6FallbackOverview(originalOverview);
  }

  return truncateToWords(rewritten, REWRITTEN_ENGINE6_OVERVIEW_MAX_WORDS);
};
