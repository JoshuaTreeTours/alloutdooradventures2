export type Engine6ItineraryFallbackDestination = {
  city?: string | null;
  state?: string | null;
  citySlug?: string | null;
};

export const isEngine6YosemiteItineraryDestination = (
  destination: Engine6ItineraryFallbackDestination
) =>
  destination.citySlug === "yosemite" ||
  /\byosemite\b/i.test(destination.city ?? "");

export const resolveEngine6ItineraryFallbackDestinationLabel = (
  destination: Engine6ItineraryFallbackDestination
) => {
  const city = destination.city?.trim();
  if (city) {
    return city;
  }

  const citySlug = destination.citySlug?.trim();
  if (citySlug) {
    return citySlug
      .split("-")
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  return "the destination";
};

export const synthesizeEngine6ItineraryFallbackDescription = (args: {
  title: string;
  duration: string | null;
  stopType: "stop" | "pass-by";
  destination: Engine6ItineraryFallbackDestination;
}) => {
  const { title, duration, stopType, destination } = args;
  const normalizedTitle = title.toLowerCase();
  const durationClause = duration ? ` in about ${duration}` : "";
  const destinationLabel =
    resolveEngine6ItineraryFallbackDestinationLabel(destination);
  const isYosemite = isEngine6YosemiteItineraryDestination(destination);

  if (isYosemite) {
    if (/tunnel view/i.test(normalizedTitle)) {
      return "Tunnel View frames Yosemite Valley with broad granite and waterfall vistas from a classic overlook.";
    }
    if (/glacier point/i.test(normalizedTitle)) {
      return "Glacier Point overlooks Yosemite Valley from a high granite promontory with wide alpine panoramas.";
    }
    if (/el capitan/i.test(normalizedTitle)) {
      return "El Capitan towers above Yosemite Valley as a sheer granite wall central to the park’s climbing heritage.";
    }
    if (/half dome/i.test(normalizedTitle)) {
      return "Half Dome stands out as Yosemite’s most recognizable granite summit above the valley skyline.";
    }
    if (
      /bridalveil/i.test(normalizedTitle) ||
      /waterfall|fall trail/i.test(normalizedTitle)
    ) {
      return `${title} highlights Yosemite’s glacially carved valley and cascading water features${durationClause}.`;
    }
    if (/valley view/i.test(normalizedTitle)) {
      return "Valley View captures a broad river-level perspective of Yosemite’s granite cliffs and forested valley floor.";
    }
    if (/sequoia|grove/i.test(normalizedTitle)) {
      return `${title} features giant sequoia habitat and classic Sierra Nevada forest terrain${durationClause}.`;
    }
    if (/village|store|historic building|picnic area/i.test(normalizedTitle)) {
      return `${title} adds local park context with a practical stop inside Yosemite Valley${durationClause}.`;
    }
  }

  return stopType === "pass-by"
    ? `${title} is viewed along the route through ${destinationLabel}${durationClause}.`
    : `${title} is a scheduled stop in ${destinationLabel}${durationClause}.`;
};
