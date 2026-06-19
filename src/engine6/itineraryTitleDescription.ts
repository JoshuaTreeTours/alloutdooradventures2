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
        detail: visitDuringMatch[2].trim(),
      };
    }
  }

  const carouselInPark = compact.match(
    /\b(?:an?\s+|the\s+|iconic\s+)?carousel\s+in\s+(Central Park)\b/i
  );
  if (carouselInPark) {
    return {
      landmark: `${carouselInPark[1]} Carousel`,
      detail: compact,
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
    return {
      landmark: `${place} ${typeWord}`.trim(),
      detail: compact,
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
        detail: compact,
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
        detail: compact,
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

export const normalizeEngine6ItineraryStopFields = (item: {
  title?: string;
  description?: string;
}): { title: string; description: string | undefined } => {
  const rawTitle = item.title?.trim() ?? "";
  const rawDescription = item.description?.trim() ?? "";

  let title = rawTitle;
  let description = rawDescription || undefined;

  const titleSplitSource = rawTitle || rawDescription;
  const split =
    titleSplitSource &&
    (isDescriptiveProseTitle(titleSplitSource) || !rawTitle)
      ? splitDescriptiveProseIntoLandmarkAndDetail(titleSplitSource)
      : rawTitle
        ? splitDescriptiveProseIntoLandmarkAndDetail(rawTitle)
        : null;

  if (split?.landmark) {
    title = split.landmark;
    if (!description) {
      if (rawDescription) {
        description = rawDescription;
      } else if (rawTitle && isDescriptiveProseTitle(rawTitle)) {
        description = rawTitle;
      }
    }
  } else if (!title && rawDescription) {
    const descriptionOnlySplit =
      splitDescriptiveProseIntoLandmarkAndDetail(rawDescription);
    if (descriptionOnlySplit?.landmark) {
      title = descriptionOnlySplit.landmark;
      description = rawDescription;
    }
  }

  return {
    title: title || rawTitle || "This stop",
    description,
  };
};
