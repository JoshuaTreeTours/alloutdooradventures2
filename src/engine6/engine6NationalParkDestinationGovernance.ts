export const isEngine6NationalParkDestination = (city?: string | null) =>
  /\bnational park\b/i.test(city?.trim() ?? "");

const NATIONAL_PARK_CITY_SIGHTSEEING_OVERRIDE_KINDS = new Set([
  "city-sightseeing",
  "generic-tour",
]);

export const resolveEngine6NationalParkEditorialActivityKind = ({
  title,
  categoryLabel,
  overviewText,
}: {
  title: string;
  categoryLabel?: string | null;
  overviewText: string;
}) => {
  const titleIdentity = `${title} ${categoryLabel ?? ""}`.toLowerCase();
  const identity = `${title} ${categoryLabel ?? ""} ${overviewText}`.toLowerCase();

  if (/hike|hiking|trek|backcountry|trail run|scrambl|climb/.test(titleIdentity)) {
    return "hiking-tour";
  }
  if (
    /hike|hiking|trek|backcountry|trail run|scrambl|climb/.test(identity) &&
    !/\b(?:van tour|bus tour|coach tour|photo safar|wildlife safar)\b/.test(
      identity
    )
  ) {
    return "hiking-tour";
  }

  return "national-park-tour";
};

export const applyEngine6NationalParkEditorialActivityOverride = ({
  city,
  activityKind,
  title,
  categoryLabel,
  overviewText,
}: {
  city?: string | null;
  activityKind: string;
  title: string;
  categoryLabel?: string | null;
  overviewText: string;
}) => {
  if (!isEngine6NationalParkDestination(city)) {
    return activityKind;
  }

  if (!NATIONAL_PARK_CITY_SIGHTSEEING_OVERRIDE_KINDS.has(activityKind)) {
    return activityKind;
  }

  return resolveEngine6NationalParkEditorialActivityKind({
    title,
    categoryLabel,
    overviewText,
  });
};

export const isEngine6WildlifeFocusedNationalParkExperience = (
  title: string,
  overviewText: string
) =>
  /wildlife|wolf|safari|naturalist|bison|elk|photo safar/i.test(
    `${title} ${overviewText}`
  );

export const inferEngine6NationalParkRouteContext = ({
  overviewText,
  highlights = [],
  itineraryTitles = [],
}: {
  overviewText: string;
  highlights?: string[];
  itineraryTitles?: string[];
}) => {
  const identity = [
    overviewText,
    highlights.join(" "),
    itineraryTitles.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  if (
    /geyser|old faithful|grand prismatic|norris|mammoth hot|thermal|geothermal|fountain paint/.test(
      identity
    )
  ) {
    return "geothermal basins";
  }
  if (/wildlife|wolf|lamar|hayden valley|bison|elk|safari|bear/.test(identity)) {
    return "wildlife habitats";
  }
  if (/grand canyon|artist point|waterfall|inspiration point|lower falls/.test(
    identity
  )) {
    return "canyon overlooks";
  }
  if (/trail|hike|backcountry|ranger station|trek|rim walk/.test(identity)) {
    return "trail systems";
  }
  if (/lake|river|yellowstone lake|lewis lake|fishing bridge/.test(identity)) {
    return "lakes and rivers";
  }
  if (/forest|meadow|valley|overlook|viewpoint/.test(identity)) {
    return "scenic viewpoints";
  }

  return "iconic landmarks";
};
