export const isEngine6NationalParkDestination = (city?: string | null) =>
  /\bnational park\b/i.test(city?.trim() ?? "");

export type Engine6NationalParkExperienceProfile =
  | "backcountry-trek"
  | "multi-day-park-tour"
  | "photo-safari"
  | "wildlife-safari"
  | "wildlife-tour"
  | "geothermal-sightseeing"
  | "lower-loop-scenic"
  | "private-park-tour"
  | "general-park-tour";

const NATIONAL_PARK_CITY_SIGHTSEEING_OVERRIDE_KINDS = new Set([
  "city-sightseeing",
  "generic-tour",
]);

const GEOTHERMAL_SIGNAL_PATTERNS = [
  /\bold faithful\b/i,
  /\bgrand prismatic\b/i,
  /\bgeyser\b/i,
  /\bnorris geyser\b/i,
  /\bmammoth hot\b/i,
  /\bupper geyser\b/i,
  /\bfountain paint\b/i,
  /\bgeothermal\b/i,
  /\bthermal basin\b/i,
];

const WILDLIFE_PRIMARY_SIGNAL_PATTERNS = [
  /\blamar valley\b/i,
  /\bwolf\b/i,
  /\bwildlife safar/i,
  /\bwildlife tour\b/i,
  /\bwildlife watching\b/i,
  /\bwildlife sightseeing\b/i,
  /\bamerican serengeti\b/i,
  /\bbison\b/i,
  /\belk\b/i,
  /\bnaturalist\b/i,
];

const countPatternMatches = (text: string, patterns: RegExp[]) =>
  patterns.reduce(
    (count, pattern) => (pattern.test(text) ? count + 1 : count),
    0
  );

export const isPrimaryNationalParkHikingProduct = ({
  title,
  categoryLabel,
}: {
  title: string;
  categoryLabel?: string | null;
}) => {
  const titleIdentity = `${title} ${categoryLabel ?? ""}`.toLowerCase();

  if (
    /iconic sites.*family friendly hikes|family friendly hikes \+|hidden gems.*hikes included/i.test(
      titleIdentity
    )
  ) {
    return false;
  }

  if (
    /trek|thorofare|backcountry|7 days guided trek|hiking tour|geyser hiking|rim and loop hike|6-mile geyser|tour & hike|tour and hike|safari hiking tour/i.test(
      titleIdentity
    )
  ) {
    return true;
  }

  if (/\bhike\b|\bhiking\b|\btrek\b/.test(titleIdentity)) {
    return /hiking tour|hike with|guided hike|hike in|hike -|mile geyser|rim and loop/i.test(
      titleIdentity
    );
  }

  return false;
};

export const resolveEngine6NationalParkEditorialActivityKind = ({
  title,
  categoryLabel,
  overviewText,
}: {
  title: string;
  categoryLabel?: string | null;
  overviewText: string;
}) => {
  if (
    isPrimaryNationalParkHikingProduct({
      title,
      categoryLabel,
    })
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

  if (
    activityKind === "hiking-tour" &&
    !isPrimaryNationalParkHikingProduct({
      title,
      categoryLabel,
    })
  ) {
    return "national-park-tour";
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

export const inferEngine6NationalParkExperienceProfile = ({
  title,
  categoryLabel,
  overviewText,
  highlights = [],
  itineraryTitles = [],
  durationText,
}: {
  title: string;
  categoryLabel?: string | null;
  overviewText: string;
  highlights?: string[];
  itineraryTitles?: string[];
  durationText?: string | null;
}): Engine6NationalParkExperienceProfile => {
  const titleIdentity = `${title} ${categoryLabel ?? ""}`.toLowerCase();
  const identity = [
    title,
    categoryLabel ?? "",
    overviewText,
    highlights.join(" "),
    itineraryTitles.join(" "),
    durationText ?? "",
  ]
    .join(" ")
    .toLowerCase();

  const geothermalScore = countPatternMatches(identity, GEOTHERMAL_SIGNAL_PATTERNS);
  const wildlifeScore = countPatternMatches(identity, WILDLIFE_PRIMARY_SIGNAL_PATTERNS);

  if (/trek|thorofare|backcountry trek|7 days guided trek/i.test(titleIdentity)) {
    return "backcountry-trek";
  }

  if (/photo safar|photography safar|photographer|wildlife photo|wildlife and photo/i.test(titleIdentity)) {
    return "photo-safari";
  }

  if (
    /two day|2 day|2-step|full two day|multi-day|multi day/i.test(identity) &&
    /upper.*lower|lower.*upper|upper\/lower/i.test(identity)
  ) {
    return "multi-day-park-tour";
  }

  if (/lower loop/i.test(titleIdentity)) {
    return "lower-loop-scenic";
  }

  if (/upper loop/i.test(titleIdentity) && /lamar valley/i.test(titleIdentity)) {
    return "wildlife-tour";
  }

  if (
    /wolf watch|wildlife safar|american serengeti|lamar.*safar|upper loop lamar wildlife safar/i.test(
      titleIdentity
    )
  ) {
    return "wildlife-safari";
  }

  if (
    /wildlife tour|wildlife sightseeing|private wildlife|wildlife watching/i.test(
      titleIdentity
    ) ||
    (/\bwildlife\b/i.test(categoryLabel ?? "") &&
      wildlifeScore >= geothermalScore &&
      !/lower loop|grand prismatic|old faithful|geyser hiking|hidden gems|best in the west|iconic sites/i.test(
        titleIdentity
      ))
  ) {
    return "wildlife-tour";
  }

  if (
    /geyser|grand prismatic|old faithful|6-mile geyser|geothermal|thermal basin|hidden gems|best in the west|iconic sites|full-day guided yellowstone day tour|lower loop van tour/i.test(
      titleIdentity
    ) ||
    (geothermalScore >= 2 && geothermalScore > wildlifeScore)
  ) {
    return "geothermal-sightseeing";
  }

  if (
    /private.*tour|best in the west|hidden gems|iconic sites|full day private|custom park tour/i.test(
      titleIdentity
    )
  ) {
    return "private-park-tour";
  }

  if (/upper loop/i.test(titleIdentity)) {
    return "general-park-tour";
  }

  if (wildlifeScore > geothermalScore && wildlifeScore >= 2) {
    return "wildlife-tour";
  }

  return "general-park-tour";
};

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

export const buildEngine6NationalParkExperienceOpening = ({
  profile,
  title,
  cityLabel,
  primaryPoi,
  durationPhrase,
  routeContext,
}: {
  profile: Engine6NationalParkExperienceProfile;
  title: string;
  cityLabel: string;
  primaryPoi?: string | null;
  durationPhrase: string;
  routeContext: string;
}) => {
  const poiLead = primaryPoi?.trim() || null;
  const titleIdentity = title.toLowerCase();

  switch (profile) {
    case "backcountry-trek":
      return poiLead
        ? `Trek Yellowstone's backcountry on a guided multi-day hike${durationPhrase} from ${poiLead} through trail systems, remote lakes, and canyon country.`
        : `Trek Yellowstone's backcountry on a guided multi-day hike${durationPhrase} through trail systems, remote lakes, and canyon country.`;
    case "multi-day-park-tour":
      return poiLead
        ? `Cover Yellowstone's upper and lower loops on a two-day private park tour${durationPhrase} starting from ${poiLead} with time for geyser basins, canyon overlooks, and valley pullouts.`
        : `Cover Yellowstone's upper and lower loops on a two-day private park tour${durationPhrase} with time for geyser basins, canyon overlooks, and valley pullouts.`;
    case "photo-safari":
      return poiLead
        ? `Photograph Yellowstone's wildlife and landscapes on a guided photography safari${durationPhrase} with a professional photographer at ${poiLead} and scenic park-road pullouts.`
        : `Photograph Yellowstone's wildlife and landscapes on a guided photography safari${durationPhrase} with a professional photographer at scenic park-road pullouts.`;
    case "wildlife-safari":
      return poiLead
        ? `Search ${poiLead} and nearby valleys for wolves, bison, and elk on a guided wildlife safari${durationPhrase} with spotting scopes at meadow pullouts.`
        : `Search Lamar Valley and Hayden Valley for wolves, bison, and elk on a guided wildlife safari${durationPhrase} with spotting scopes at meadow pullouts.`;
    case "wildlife-tour":
      return poiLead
        ? `Explore ${poiLead} and Yellowstone's wildlife habitats on a naturalist-led wildlife tour${durationPhrase} with time at valley overlooks along park roads.`
        : `Explore Yellowstone's wildlife habitats on a naturalist-led wildlife tour${durationPhrase} with time at valley overlooks along park roads.`;
    case "geothermal-sightseeing":
      return poiLead
        ? `Visit ${poiLead} and Yellowstone's geothermal basins on a scenic geyser-basin tour${durationPhrase} with boardwalk time at iconic thermal features.`
        : `Tour Yellowstone's geothermal basins on a scenic geyser-basin tour${durationPhrase} with boardwalk time at iconic thermal features.`;
    case "lower-loop-scenic":
      return poiLead
        ? `Circle Yellowstone's Lower Loop on a scenic park tour${durationPhrase} from ${poiLead} through Old Faithful, Grand Prismatic Spring, and canyon overlooks.`
        : `Circle Yellowstone's Lower Loop on a scenic park tour${durationPhrase} through Old Faithful, Grand Prismatic Spring, and canyon overlooks.`;
    case "private-park-tour":
      return poiLead
        ? `Discover Yellowstone on a private park tour${durationPhrase} with flexible stops at ${poiLead}, geothermal basins, and scenic canyon viewpoints.`
        : `Discover Yellowstone on a private park tour${durationPhrase} with flexible stops at geothermal basins, canyon viewpoints, and valley pullouts.`;
    case "general-park-tour":
    default:
      if (/full[- ]day guided|day tour/i.test(titleIdentity)) {
        return poiLead
          ? `Spend a full day in Yellowstone on a guided park tour${durationPhrase} with stops at ${poiLead}, ${routeContext}, and scenic pullouts along park roads.`
          : `Spend a full day in Yellowstone on a guided park tour${durationPhrase} with stops at ${routeContext} and scenic pullouts along park roads.`;
      }
      return poiLead
        ? `Explore ${poiLead} and ${routeContext} across ${cityLabel}${durationPhrase} with guide context at scenic viewpoints and park roads.`
        : `Explore ${routeContext} across ${cityLabel}${durationPhrase} with guide context at scenic viewpoints and park roads.`;
  }
};

export const buildEngine6NationalParkHikingOpening = ({
  title,
  cityLabel,
  primaryPoi,
  durationPhrase,
  routeContext,
}: {
  title: string;
  cityLabel: string;
  primaryPoi?: string | null;
  durationPhrase: string;
  routeContext: string;
}) => {
  const titleIdentity = title.toLowerCase();
  const poiLead = primaryPoi?.trim() || null;

  if (/lamar.*hik|safari hiking tour/i.test(titleIdentity)) {
    return poiLead
      ? `Hike ${poiLead} and meadow trails on a wildlife-focused hiking tour${durationPhrase} with guide interpretation along Yellowstone trail systems.`
      : `Hike Lamar Valley and meadow trails on a wildlife-focused hiking tour${durationPhrase} with guide interpretation along Yellowstone trail systems.`;
  }

  if (/geyser.*hik|6-mile geyser/i.test(titleIdentity)) {
    return poiLead
      ? `Hike Yellowstone geyser basins on a trail-based thermal tour${durationPhrase} with trail time at ${poiLead} and nearby thermal features.`
      : `Hike Yellowstone geyser basins on a trail-based thermal tour${durationPhrase} with boardwalk and backcountry trail time at thermal features.`;
  }

  if (/grand canyon.*hik|rim and loop/i.test(titleIdentity)) {
    return poiLead
      ? `Hike the Grand Canyon of the Yellowstone rim on a guided canyon trail tour${durationPhrase} with overlooks at ${poiLead} and nearby canyon viewpoints.`
      : `Hike the Grand Canyon of the Yellowstone rim on a guided canyon trail tour${durationPhrase} with canyon overlooks and trail-side viewpoints.`;
  }

  if (/trek|thorofare|backcountry/i.test(titleIdentity)) {
    return poiLead
      ? `Trek Yellowstone's backcountry on a guided multi-day hike${durationPhrase} from ${poiLead} through ${routeContext} and remote trail systems.`
      : `Trek Yellowstone's backcountry on a guided multi-day hike${durationPhrase} through ${routeContext} and remote trail systems.`;
  }

  if (/tour & hike|tour and hike/i.test(titleIdentity)) {
    return poiLead
      ? `Combine a private Yellowstone park tour with guided hiking${durationPhrase}, linking ${poiLead}, ${routeContext}, and trail time inside the park.`
      : `Combine a private Yellowstone park tour with guided hiking${durationPhrase} across ${routeContext} and scenic trail sections inside the park.`;
  }

  return poiLead
    ? `Hike to ${poiLead} and across Yellowstone's ${routeContext}${durationPhrase} with wide valley views and guide interpretation.`
    : `Hike across Yellowstone's ${routeContext}${durationPhrase} with wide valley views and guide interpretation.`;
};

export const buildEngine6NationalParkPoiFollowOn = ({
  profile,
  list,
  variant,
}: {
  profile: Engine6NationalParkExperienceProfile;
  list: string;
  variant: number;
}) => {
  switch (profile) {
    case "photo-safari":
      return [
        `Photo stops include ${list}.`,
        `The route tracks ${list} for landscape and wildlife photography.`,
        `You'll pause at ${list} for guided photo opportunities.`,
        `Scenic frames unfold at ${list} along the route.`,
      ][variant];
    case "wildlife-safari":
    case "wildlife-tour":
      return [
        `Valley pullouts include ${list}.`,
        `The route tracks ${list} through wildlife habitats and park roads.`,
        `You'll scan ${list} from meadow overlooks and roadside pullouts.`,
        `Wildlife-focused stops include ${list}.`,
      ][variant];
    case "geothermal-sightseeing":
    case "lower-loop-scenic":
      return [
        `Geothermal and scenic stops include ${list}.`,
        `The route connects ${list} across geyser basins and canyon viewpoints.`,
        `You'll pause at ${list} along boardwalks and scenic pullouts.`,
        `Thermal features and overlooks along the route include ${list}.`,
      ][variant];
    case "multi-day-park-tour":
    case "private-park-tour":
      return [
        `Signature park stops include ${list}.`,
        `The custom route connects ${list} across both park loops.`,
        `You'll visit ${list} with flexible time at each stop.`,
        `Scenic stops across the itinerary include ${list}.`,
      ][variant];
    case "backcountry-trek":
      return [
        `Backcountry camps and trail segments include ${list}.`,
        `The trek moves through ${list} on remote Yellowstone trails.`,
        `You'll hike to ${list} across successive trail days.`,
        `Trail milestones along the route include ${list}.`,
      ][variant];
    default:
      return [
        `Scenic stops include ${list}.`,
        `The route follows park roads through ${list}.`,
        `You'll pause at iconic landmarks including ${list}.`,
        `Along the route you'll visit ${list}.`,
      ][variant];
  }
};
