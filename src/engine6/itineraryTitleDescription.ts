import { normalizeEngine6ItineraryComparisonText } from "./itineraryGovernance";

const MAX_ITINERARY_TITLE_CHARS = 55;
const MAX_ITINERARY_TITLE_WORDS = 7;

const DESCRIPTIVE_PROSE_MARKERS =
  /\s(?:built|featuring|constructed|designed|opened|known for|home to|with over|includes|containing|offering|showcasing|highlighting|popular for|famous for|completed|dating back|one of|over \d+|where visitors|that offers|which offers|is home to|are home to)\b/i;

const LANDMARK_TYPE_PATTERN =
  "carousel|meadow|walk|house|bridge|fountain|memorial|arch|terrace|promenade|statue|monument|garden|plaza|pavilion|rink|castle|zoo|observatory|conservatory|lake|pond|boathouse|playground|field|green|gate|shrine|mall|obelisk|tower|belvedere|esplanade";

const normalizeComparableText = (value: string) =>
  normalizeEngine6ItineraryComparisonText(value);

const titleCaseWord = (word: string) =>
  word ? `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}` : word;

const polishDetailFragment = (detail: string) => {
  let cleaned = detail
    .replace(/^[,;:\-–—]+\s*/, "")
    .replace(/\s*&\s*/g, " and ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) {
    return "";
  }
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  if (!/[.!?]$/.test(cleaned)) {
    cleaned = `${cleaned.replace(/[.!?]+$/g, "")}.`;
  }
  return cleaned;
};

export const isDescriptiveProseTitle = (value: string) => {
  const compact = value.trim().replace(/\s+/g, " ");
  if (!compact) {
    return false;
  }
  if (compact.length > MAX_ITINERARY_TITLE_CHARS) {
    return true;
  }
  if (compact.split(/\s+/).length > MAX_ITINERARY_TITLE_WORDS) {
    return true;
  }
  return DESCRIPTIVE_PROSE_MARKERS.test(compact);
};

export const splitDescriptiveProseIntoLandmarkAndDetail = (
  text: string
): { landmark: string; detail: string } | null => {
  const compact = text.replace(/\s+/g, " ").replace(/&amp;/g, "&").trim();
  if (!compact) {
    return null;
  }

  const visitDuringMatch = compact.match(/^Visit\s+(.+?)\s+(during\s.+)$/i);
  if (visitDuringMatch?.[1] && visitDuringMatch[2]) {
    const landmark = visitDuringMatch[1].replace(/[.,:;]+$/, "").trim();
    if (
      landmark.length <= MAX_ITINERARY_TITLE_CHARS &&
      landmark.split(/\s+/).length <= MAX_ITINERARY_TITLE_WORDS
    ) {
      return {
        landmark,
        detail: polishDetailFragment(visitDuringMatch[2]),
      };
    }
  }

  const carouselInPark = compact.match(
    /\b(?:an?\s+|the\s+|iconic\s+)?carousel\s+in\s+(Central Park)\b/i
  );
  if (carouselInPark) {
    const detail = compact
      .replace(/\b(?:An?\s+|The\s+|Iconic\s+)?carousel\s+in\s+Central Park\s*,?\s*/i, "")
      .trim();
    return {
      landmark: `${carouselInPark[1]} Carousel`,
      detail: polishDetailFragment(detail),
    };
  }

  const typeInPlace = compact.match(
    new RegExp(
      `\\b(?:an?|the|iconic\\s+)?(${LANDMARK_TYPE_PATTERN})\\s+in\\s+([A-Z][\\w'\\-]+(?:\\s+[A-Z][\\w'\\-]+){0,3})\\b`,
      "i"
    )
  );
  if (typeInPlace) {
    const typeWord = titleCaseWord(typeInPlace[1] ?? "");
    const place = typeInPlace[2]?.trim() ?? "";
    const landmark = `${place} ${typeWord}`.trim();
    const detail = compact.replace(typeInPlace[0], "").trim();
    return {
      landmark,
      detail: polishDetailFragment(detail),
    };
  }

  const landmarkWithFollowingDetail = compact.match(
    /^((?:[A-Z][\w'&-]+(?:\s+|&\s*)){1,4}[A-Z][\w'&-]+)\s+(?=[a-z(])/
  );
  if (landmarkWithFollowingDetail?.[1]) {
    const landmark = landmarkWithFollowingDetail[1].trim();
    if (
      landmark.split(/\s+/).length <= MAX_ITINERARY_TITLE_WORDS &&
      landmark.length <= MAX_ITINERARY_TITLE_CHARS
    ) {
      return {
        landmark,
        detail: polishDetailFragment(
          compact.slice(landmarkWithFollowingDetail[1].length).trim()
        ),
      };
    }
  }

  const markerMatch = compact.match(DESCRIPTIVE_PROSE_MARKERS);
  if (markerMatch?.index && markerMatch.index > 0) {
    const landmarkCandidate = compact
      .slice(0, markerMatch.index)
      .replace(/[,;:\-–—]+\s*$/, "")
      .trim();
    if (
      landmarkCandidate.length <= MAX_ITINERARY_TITLE_CHARS &&
      landmarkCandidate.split(/\s+/).length <= MAX_ITINERARY_TITLE_WORDS &&
      !/^(?:iconic|famous|historic|beautiful|scenic|popular)\b/i.test(
        landmarkCandidate
      )
    ) {
      return {
        landmark: landmarkCandidate,
        detail: polishDetailFragment(compact.slice(markerMatch.index).trim()),
      };
    }
  }

  if (
    compact.length <= MAX_ITINERARY_TITLE_CHARS &&
    compact.split(/\s+/).length <= MAX_ITINERARY_TITLE_WORDS &&
    !isDescriptiveProseTitle(compact) &&
    !/^(?:pass\s+by|stop|visit)$/i.test(compact)
  ) {
    return { landmark: compact, detail: "" };
  }

  return null;
};

export const stripTitleOverlapFromDescription = (
  title: string,
  description: string
) => {
  const trimmedDescription = description.trim();
  if (!trimmedDescription) {
    return "";
  }

  const normalizedTitle = normalizeComparableText(title);
  const normalizedDescription = normalizeComparableText(trimmedDescription);
  if (!normalizedTitle || normalizedDescription === normalizedTitle) {
    return "";
  }

  let cleaned = trimmedDescription
    .replace(
      new RegExp(
        `^(?:visit|see|explore|pass by|stop at|arrive at|continue to|photo stop at)\\s+${escapeRegExp(title)}\\s*[,:-–—]?\\s*`,
        "i"
      ),
      ""
    )
    .replace(new RegExp(`^${escapeRegExp(title)}\\s*[,:-–—]?\\s*`, "i"), "")
    .trim();

  if (!cleaned || normalizeComparableText(cleaned) === normalizedTitle) {
    return "";
  }

  cleaned = cleaned
    .replace(/^during\b/i, "During")
    .replace(/^at\b/i, "At")
    .trim();

  if (normalizedDescription.includes(normalizedTitle)) {
    const titleTokens = normalizedTitle.split(" ").filter(token => token.length > 2);
    const remainingTokens = normalizeComparableText(cleaned)
      .split(" ")
      .filter(token => token.length > 2 && !titleTokens.includes(token));
    if (remainingTokens.length === 0) {
      return "";
    }
  }

  return cleaned;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const descriptionsAreEffectivelySame = (left: string, right: string) =>
  normalizeComparableText(left) === normalizeComparableText(right);

export const normalizeEngine6ItineraryStopFields = (item: {
  title?: string;
  description?: string;
}): { title: string; description: string | undefined } => {
  const rawTitle = item.title?.trim() ?? "";
  const rawDescription = item.description?.trim() ?? "";

  let title = rawTitle;
  let description = rawDescription || undefined;

  const titleSource = rawTitle || rawDescription;
  const split =
    titleSource && (isDescriptiveProseTitle(titleSource) || !rawTitle)
      ? splitDescriptiveProseIntoLandmarkAndDetail(titleSource)
      : rawTitle
        ? splitDescriptiveProseIntoLandmarkAndDetail(rawTitle)
        : null;

  if (split?.landmark) {
    title = split.landmark;
    if (split.detail) {
      if (!description || descriptionsAreEffectivelySame(description, rawTitle)) {
        description = split.detail;
      }
    } else if (description && descriptionsAreEffectivelySame(description, rawTitle)) {
      description = undefined;
    }
  } else if (rawTitle) {
    title = rawTitle;
  }

  if (!title && rawDescription) {
    const descriptionOnlySplit =
      splitDescriptiveProseIntoLandmarkAndDetail(rawDescription);
    if (descriptionOnlySplit?.landmark) {
      title = descriptionOnlySplit.landmark;
      description = descriptionOnlySplit.detail || undefined;
    }
  }

  if (description) {
    description = stripTitleOverlapFromDescription(title, description);
    if (!description.trim()) {
      description = undefined;
    }
  }

  return {
    title: title || rawTitle || "This stop",
    description,
  };
};
