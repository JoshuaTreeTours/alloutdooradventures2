import {
  cleanEngine6Description,
  stripEngine6AdmissionArtifacts,
} from "./seo";
import {
  isEngine6SupplierMirroredItineraryText,
  normalizeEngine6ItineraryComparisonText,
} from "./itineraryGovernance";

export const ENGINE6_OVERVIEW_MIN_WORDS = 120;
export const ENGINE6_OVERVIEW_MAX_WORDS = 250;

const ENGINE6_OVERVIEW_TARGET_MIN_WORDS = 120;
const ENGINE6_OVERVIEW_TARGET_MAX_WORDS = 250;

const ENGINE6_OVERVIEW_OPERATIONAL_OPENER_PATTERNS = [
  /^please\b/i,
  /^meet\b/i,
  /^meeting\b/i,
  /^pick(?:-|\s)?up\b/i,
  /^hotel pickup\b/i,
  /^departure\b/i,
  /^arrive\b/i,
  /^check in\b/i,
  /^wear\b/i,
  /^bring\b/i,
  /^dress\b/i,
  /^confirmation\b/i,
  /^important:\s*/i,
  /^note:\s*/i,
  /^your guide\b/i,
  /^our guide\b/i,
  /^we (?:will|meet|pick|provide|start)\b/i,
  /^you (?:will|must|should|need to|are required to)\b/i,
  /^guests (?:will|must|should)\b/i,
  /^travelers (?:will|must|should)\b/i,
] as const;

const ENGINE6_OVERVIEW_EXCLUDED_SENTENCE_PATTERNS = [
  /\bcancellation\b/i,
  /\brefund\b/i,
  /\bconfirmation will be received\b/i,
  /\bnot wheelchair accessible\b/i,
  /\bmost travelers can participate\b/i,
  /\bnear public transportation\b/i,
  /\blicensed (?:and )?insured\b/i,
  /\boperator credentials\b/i,
  /\bmilitary discount\b/i,
  /\bsenior discount\b/i,
  /\bpromotional offer\b/i,
  /\bbooking incentive\b/i,
  /\bterms and conditions\b/i,
  /\bliability\b/i,
  /\bpassport required\b/i,
  /\bvalid id\b/i,
  /\bvoucher\b/i,
  /\bminimum age\b/i,
  /\bmaximum weight\b/i,
] as const;

export const ENGINE6_OVERVIEW_BANNED_VOICE_PATTERNS = [
  /\b(?:lol|lmao|haha)\b/i,
  /\b(?:awesome|amazing|unforgettable|once in a lifetime|trip of a lifetime)\b/i,
  /\bbucket list\b/i,
  /\bmust-?do\b/i,
  /\b(?:we|our|you(?:'ll| will|'re| can)|your guide|our guide)\b/i,
  /\b(?:funny|hilarious|joke|jokes)\b/i,
  /\b(?:don't miss|do not miss)\b/i,
  /[\u{1F300}-\u{1FAFF}]/u,
] as const;

const ENGINE6_NAMED_LOCATION_PATTERN =
  /\b(?:The\s+)?[A-Z][A-Za-z'’&-]+(?:\s+(?:of|and|the|de|la|el|del|los|las|at|in|on)\s+)*[A-Z0-9][A-Za-z'’&-]+(?:\s+[A-Z0-9][A-Za-z'’&-]+){0,5}\b/g;

const ENGINE6_ATTRACTION_SUFFIX_PATTERN =
  /\b(?:The\s+)?[A-Z][A-Za-z'’]+(?:\s+[A-Z][A-Za-z'’]+){0,4}\s+(?:Sign|Bridge|Bay|Harbor|Lake|Park|Canyon|Falls|Waterfalls|Glacier|Island|Pier|Wharf|Beach|Valley|Mountain|Mount|Museum|Studios?|Observatory|River|Market|Square|District|Neighborhood|Village|Mission|Locks|Needle|Monorail|Factory|Wilderness|Monument|Preserve|Refuge|Courthouse|Presidio|Waterfront|Grove|Basin|Summit|Overlook|Viewpoint|Landing|Promenade|Boardwalk|Peninsula|Sanctuary|Aquarium|Garden|Gardens|Cathedral|Castle|Fort|Lighthouse|Dam|Springs|National Park|State Park|Ferry|Terminal|Station|Plaza|Trail|Cruise|Trolley|Cavern|Ruins|Temple|Tower|Palace|Arena|Stadium|Theatre|Theater|Gallery|Hall|Vineyard|Winery|Brewery|Distillery|Marina|Dock|Channel|Strait|Sound|Inlet|Estuary|Lagoon|Marsh|Swamp|Wetland|Bayou|Delta|Fjord|Volcano|Crater|Reef|Atoll|Monolith|Memorial|Statue|Sculpture|Fountain|Arch|Tunnel|Causeway|Esplanade|Port|Shipyard|Seawall|Embankment|Levee|Dike|Spillway|Lock|Canal|Aqueduct|Reservoir|Woods|Forest|Rainforest|Jungle|Prairie|Meadow|Farm|Ranch|Orchard|Oasis|Spring|Geyser|Rapids|Stream|Creek|Brook|Pond|Arboretum|Conservatory|Greenhouse|Planetarium|Aviary|Zoo|Library|Convention Center|Fairgrounds|Raceway|Speedway|Highlands|Backcountry|Wilderness|Backroads|Fault|Geology|Canyonlands|Badlands|Dunes|Plateau|Mesa|Butte|Ridge|Peak|Summit|Pass|Gap|Saddle|Bluff|Cliff|Escarpment|Palisade|Tableland|Highland|Lowland|Plain|Steppe|Tundra|Taiga|Timberline|Moraine|Outwash|Painted Desert|Petrified Forest|Ghost Town|Old Town|Historic District|Arts District|Warehouse District|Financial District|Entertainment District|Waterfront District|Harbor District|Market District|Chinatown|French Quarter|Latin Quarter|Gaslamp|River Walk|Embarcadero|Farmers Market|Public Market|Flea Market|Night Market|Street Market|Bazaar|Souk|Medina|Kasbah|Old City|Medieval Quarter|Castle District|Palace District|Temple District|Sacred Valley|Holy City|Monastery|Abbey|Convent|Basilica|Chapel|Church|Mosque|Synagogue|Shrine|Sanctuary|Mission|Presidio|Citadel|Chateau|Manor|Estate|Hacienda|Homestead|Lodge|Inn|Resort|Spa|Hot Springs|Thermal Bath|Onsen|Hammam|Bathhouse|Sauna|Wellness Center|Retreat|Refuge|Reserve|Sanctuary|Wildlife Refuge|Bird Refuge|Marine Sanctuary|National Monument|National Historical Park|National Recreation Area|National Seashore|National Lakeshore|National Forest|Regional Park|City Park|Urban Park|Metropolitan Park|Community Park|Neighborhood Park|Botanical Garden|Nature Preserve|Nature Reserve|Wilderness Area|Alpine Zone|Icefield|Ice Cap|Ice Sheet|Glacial Lake|Kettle Lake|Drumlin|Esker|Kame|Sand Dune|Dune Field|Archaeological Site|Ancient City|Lost City|Mining Town|Boomtown|Frontier Town|Colonial Town|Colonial City|Colonial Quarter|Historic Quarter|Old Quarter|New Quarter|Upper Town|Lower Town|Old Port|New Port|Harbor Front|Riverfront|Lakefront|Oceanfront|Seafront|Breakwater|Jetty|Quay|Buoy|Lighthouse|Sluice|Weir|Mangrove|Cypress Swamp|Redwood|Sequoia|Joshua Tree|Palm Oasis|Slot Canyon|Antelope Canyon|Narrows|Glen|Cove|Spine|Crest|Timberland|Plantation|Homestead|Village|Town|City|Downtown|Uptown|Midtown|Waterfront|Boardwalk|Promenade|Pier|Wharf|Harbour|Harbor|Marina|Dock|Channel|Strait|Sound|Inlet|Estuary|Lagoon|Marsh|Swamp|Wetland|Bayou|Delta|Fjord|Volcano|Crater|Reef|Atoll|Monolith|Memorial|Statue|Sculpture|Fountain|Arch|Tunnel|Causeway|Esplanade|Port|Shipyard|Seawall|Embankment|Levee|Dike|Spillway|Lock|Canal|Aqueduct|Reservoir)\b/g;

const GENERIC_HIGHLIGHT_PATTERNS = [
  /^guided\b/i,
  /^multiple\b/i,
  /^behind-the-scenes\b/i,
  /^walking route\b/i,
  /^small-group\b/i,
  /^local guide\b/i,
  /^not recommended\b/i,
  /^travelers should\b/i,
  /^confirmation\b/i,
  /^this (?:tour|activity|experience)\b/i,
  /^most travelers\b/i,
  /^near public transportation\b/i,
  /^wheelchair accessible\b/i,
  /^food samples\b/i,
  /^tasting\b/i,
  /^optional\b/i,
  /^includes\b/i,
  /^round trip\b/i,
  /^hotel pickup\b/i,
  /^service animals allowed\b/i,
  /^public transportation options\b/i,
  /^specialized infant seats\b/i,
  /^infants must sit on laps\b/i,
  /^stroller accessible\b/i,
] as const;

const isUsableOverviewHighlight = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (isEngine6ExcludedOverviewSentence(trimmed)) return false;
  if (isEngine6OperationalOverviewOpener(trimmed)) return false;
  if (GENERIC_HIGHLIGHT_PATTERNS.some(pattern => pattern.test(trimmed))) {
    return false;
  }
  if (trimmed.split(/\s+/).length > 10) return false;
  return true;
};

const OVERVIEW_LOCATION_LEADING_VERB_PATTERN =
  /^(?:Sample|Explore|Visit|Discover|Tour|Guided|See|Travel|Ride|Paddle|Sail|Fly|Hike|Walk|Drive|Taste|Enjoy|Experience|Meet|Start|Stop|Pass|Cruise|For|This|These|Spend|Put|Take|Get|Join|Come|Watch|Look|Learn|Cover|Combine|Include|Feature|Offer|Provide|Not)\b/i;

const isSignificantOverviewLocation = (candidate: string) => {
  const normalized = normalizeEngine6ItineraryComparisonText(candidate);
  if (!normalized || normalized.length < 4) return false;
  if (OVERVIEW_LOCATION_LEADING_VERB_PATTERN.test(candidate)) return false;
  if (GENERIC_LOCATION_LABELS.has(normalized)) return false;
  if (GENERIC_HIGHLIGHT_PATTERNS.some(pattern => pattern.test(candidate))) {
    return false;
  }
  if (
    /^(?:stop|pass|visit|explore|market|tour|guide|local|food|scenic)\b/i.test(
      candidate
    )
  ) {
    return false;
  }
  if (candidate.split(/\s+/).length > 8) return false;
  if (/[.!?]/.test(candidate) && candidate.split(/\s+/).length > 5) {
    return false;
  }
  return (
    ENGINE6_ATTRACTION_SUFFIX_PATTERN.test(candidate) ||
    /^[A-Z][A-Za-z'’&-]+(?:\s+[A-Z0-9][A-Za-z'’&-]+){1,5}$/.test(candidate)
  );
};

const GENERIC_LOCATION_LABELS = new Set(
  [
    "This stop",
    "Market vendor tastings",
    "Market history",
    "Local guide",
    "Food tastings",
    "Guided tour",
    "Small group",
    "Hotel pickup",
    "Round trip transport",
    "Scenic views",
    "Photo stop",
    "Photo stops",
    "Free time",
    "Return",
    "Departure",
    "Meeting point",
    "End point",
    "City tour",
    "Walking tour",
    "Boat tour",
    "Food tour",
    "Wine tasting",
    "Tasting stop",
    "Tasting stops",
    "Main hall",
    "Market edge",
    "Waterfront views",
    "Coastal views",
    "Mountain views",
    "Skyline views",
    "Historic district",
    "Downtown",
    "Old town",
    "City center",
    "City centre",
    "National park",
    "State park",
    "County park",
    "Regional park",
    "Visitor center",
    "Visitor centre",
    "Nature center",
    "Nature centre",
    "Interpretive stop",
    "Interpretive stops",
    "Scenic overlook",
    "Scenic overlooks",
    "Viewpoint",
    "Viewpoints",
    "Lookout",
    "Lookouts",
    "Observation deck",
    "Observation decks",
    "Boarding",
    "Disembarkation",
    "Lunch stop",
    "Rest stop",
    "Rest stops",
    "Break",
    "Breaks",
    "Transfer",
    "Transfers",
    "Transport",
    "Transportation",
    "Travel time",
    "Drive",
    "Drive through",
    "Pass by",
    "Pass-by",
    "Optional stop",
    "Optional stops",
    "Seasonal route",
    "Seasonal stop",
    "Seasonal stops",
    "Central Business District",
  ].map(value => normalizeEngine6ItineraryComparisonText(value))
);

type OverviewRewriteArgs = {
  title: string;
  city: string;
  state: string;
  categoryLabel: string | null;
  durationText: string | null;
  highlights: string[];
  itinerary: Array<{ title: string; description?: string | null }>;
  sourceOverview: string;
};

type OverviewValidationArgs = {
  overviewText: string | null | undefined;
  sourceOverview: string | null | undefined;
  highlights?: string[];
  itinerary?: Array<{ title: string; description?: string | null }>;
};

const countOverviewWords = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;

const splitOverviewSentences = (value: string) =>
  value
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const normalizeOverviewSentence = (value: string) => {
  const cleaned = stripEngine6AdmissionArtifacts(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\.\.\.+/g, ".")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/^[,.;:!?\s-]+/, "")
    .trim();

  if (!cleaned) return "";
  const withoutDangling = cleaned.replace(/[,:;\s-]+$/g, "").trim();
  return /[.!?]$/.test(withoutDangling)
    ? withoutDangling
    : `${withoutDangling}.`;
};

const formatOverviewLandmarkList = (values: string[]) => {
  if (values.length <= 1) return values[0] ?? "";
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
};

const dedupeOverviewValues = (values: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const trimmed = value.replace(/\s+/g, " ").trim();
    if (!trimmed) continue;
    const normalized = normalizeEngine6ItineraryComparisonText(trimmed);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(trimmed);
  }

  return result;
};

const collectPatternMatches = (value: string, pattern: RegExp) => {
  const flags = pattern.flags.includes("g")
    ? pattern.flags
    : `${pattern.flags}g`;
  const matcher = new RegExp(pattern.source, flags);
  return [...value.matchAll(matcher)]
    .map(match => match[0]?.trim() ?? "")
    .filter(Boolean);
};

export const extractEngine6OverviewNamedLocations = ({
  sourceOverview,
  highlights = [],
  itinerary = [],
}: {
  sourceOverview?: string | null;
  highlights?: string[];
  itinerary?: Array<{ title: string; description?: string | null }>;
}) => {
  const candidates = [
    ...itinerary.map(item => item.title),
    ...collectPatternMatches(
      sourceOverview ?? "",
      ENGINE6_ATTRACTION_SUFFIX_PATTERN
    ),
    ...collectPatternMatches(sourceOverview ?? "", ENGINE6_NAMED_LOCATION_PATTERN),
    ...itinerary.flatMap(item =>
      item.description
        ? collectPatternMatches(item.description, ENGINE6_NAMED_LOCATION_PATTERN)
        : []
    ),
    ...highlights.filter(isUsableOverviewHighlight),
  ];

  return dedupeOverviewValues(candidates).filter(isSignificantOverviewLocation);
};

export const isEngine6OperationalOverviewOpener = (value: string) => {
  const firstSentence = splitOverviewSentences(value)[0]?.trim() ?? value.trim();
  return ENGINE6_OVERVIEW_OPERATIONAL_OPENER_PATTERNS.some(pattern =>
    pattern.test(firstSentence)
  );
};

export const isEngine6ExcludedOverviewSentence = (value: string) =>
  ENGINE6_OVERVIEW_EXCLUDED_SENTENCE_PATTERNS.some(pattern =>
    pattern.test(value)
  );

export const isEngine6SupplierMirroredOverviewText = ({
  source,
  target,
}: {
  source: string;
  target: string;
}) => isEngine6SupplierMirroredItineraryText({ source, target });

const stripOverviewMarketingLanguage = (value: string) =>
  value
    .replace(/\bonce in a lifetime\b/gi, "")
    .replace(/\btrip of a lifetime\b/gi, "")
    .replace(/\bbucket list\b/gi, "notable")
    .replace(/\bmust-?do\b/gi, "notable")
    .replace(/\bunforgettable\b/gi, "")
    .replace(/\bamazing\b/gi, "")
    .replace(/\bawesome\b/gi, "");

const toThirdPersonGuideVoice = (sentence: string) => {
  let text = stripOverviewMarketingLanguage(sentence)
    .replace(/\b(?:you(?:'ll| will|'re)|your)\b/gi, "travelers")
    .replace(/\b(?:we(?:'ll| will|'re)|our)\b/gi, "the tour")
    .replace(/\byour guide\b/gi, "the guide")
    .replace(/\bour guide\b/gi, "the guide")
    .replace(/\bjoin us\b/gi, "the route")
    .replace(/\bcome discover\b/gi, "the route covers")
    .replace(/\bdon't miss\b/gi, "includes")
    .replace(/\bdo not miss\b/gi, "includes")
    .replace(/\s+/g, " ")
    .trim();

  text = text
    .replace(/^travelers (?:can|will|may)\s+/i, "The route ")
    .replace(/^the tour (?:can|will|may)\s+/i, "The route ")
    .replace(
      /^this (?:tour|experience|outing)\s+(?:offers|provides|gives|is)\s+/i,
      "The outing "
    )
    .replace(/^enjoy\s+/i, "The route includes ")
    .replace(/^experience\s+/i, "The route covers ")
    .replace(/^discover\s+/i, "The route explores ")
    .replace(/^explore\s+/i, "The route explores ")
    .replace(/^visit\s+/i, "The route includes ")
    .replace(/^see\s+/i, "The route includes ")
    .replace(/^take in\s+/i, "The route includes ")
    .replace(/^check out\s+/i, "The route includes ");

  return normalizeOverviewSentence(text);
};

const chooseOverviewActivityLabel = ({
  title,
  categoryLabel,
  sourceOverview,
}: {
  title: string;
  categoryLabel: string | null;
  sourceOverview: string;
}) => {
  const identity = `${title} ${categoryLabel ?? ""} ${sourceOverview}`.toLowerCase();
  if (/food|tasting|market|wine|culinary|chef/.test(identity)) {
    return "food-focused guided outing";
  }
  if (/boat|cruise|sail|yacht|harbor|bay|kayak|paddle|airboat/.test(identity)) {
    return "water-based guided outing";
  }
  if (/hike|hiking|trail|scrambl|climb/.test(identity)) {
    return "guided hiking outing";
  }
  if (/bike|cycling|e-bike|segway/.test(identity)) {
    return "guided cycling outing";
  }
  if (/helicopter|paraglid|parasail|flight|fly|air/.test(identity)) {
    return "aerial sightseeing outing";
  }
  if (/jeep|4x4|off-road|humvee/.test(identity)) {
    return "off-road guided outing";
  }
  if (/national park|state park|wildlife|desert|canyon|mountain/.test(identity)) {
    return "park-focused guided outing";
  }
  if (/city|sightseeing|landmark|neighborhood|downtown/.test(identity)) {
    return "city sightseeing outing";
  }
  return categoryLabel
    ? `${categoryLabel.toLowerCase()} outing`
    : "guided destination outing";
};

const extractOverviewTransportMethod = ({
  title,
  categoryLabel,
  sourceOverview,
}: {
  title: string;
  categoryLabel: string | null;
  sourceOverview: string;
}) => {
  const identity = `${title} ${categoryLabel ?? ""} ${sourceOverview}`.toLowerCase();
  if (/airboat/.test(identity)) return "airboat travel";
  if (/helicopter/.test(identity)) return "helicopter flight";
  if (/parasail|paraglid/.test(identity)) return "aerial flight";
  if (/yacht|catamaran|sailboat|sail/.test(identity)) return "sail-powered travel";
  if (/boat|cruise|harbor|bay|ferry/.test(identity)) return "boat travel";
  if (/kayak|canoe|paddle|sup/.test(identity)) return "paddle travel";
  if (/segway|e-bike|bike|cycling|trolley|pedicab/.test(identity)) {
    return "small-group vehicle travel";
  }
  if (/bus|coach|van|minivan|shuttle|4x4|jeep|humvee|off-road/.test(identity)) {
    return "road travel";
  }
  if (/walking|walk|on foot|foot tour/.test(identity)) return "walking travel";
  if (/hike|hiking|trail|scrambl/.test(identity)) return "on-foot trail travel";
  return null;
};

const buildOverviewDestinationOpening = ({
  title,
  city,
  state,
  categoryLabel,
  sourceOverview,
  namedLocations,
}: OverviewRewriteArgs & { namedLocations: string[] }) => {
  const locationLabel = `${city}, ${state}`.replace(/\s+/g, " ").trim();
  const activityLabel = chooseOverviewActivityLabel({
    title,
    categoryLabel,
    sourceOverview,
  });
  const leadLocation = namedLocations[0];
  const secondaryLocations = namedLocations.slice(1, 3);

  if (leadLocation && secondaryLocations.length > 0) {
    return normalizeOverviewSentence(
      `${title} is a ${activityLabel} in ${locationLabel} centered on ${leadLocation}, ${secondaryLocations[0]}, and surrounding destination landmarks`
    );
  }

  if (leadLocation) {
    return normalizeOverviewSentence(
      `${title} is a ${activityLabel} in ${locationLabel} centered on ${leadLocation} and nearby destination landmarks`
    );
  }

  return normalizeOverviewSentence(
    `${title} is a ${activityLabel} in ${locationLabel} focused on local landmarks, scenery, and destination context`
  );
};

const buildOverviewRouteSentence = (namedLocations: string[]) => {
  const stops = namedLocations.slice(0, 5);
  if (stops.length === 0) return "";
  return normalizeOverviewSentence(
    `The route emphasizes ${formatOverviewLandmarkList(stops)}`
  );
};

const buildOverviewThematicSentence = (sourceOverview: string) => {
  const themes: string[] = [];
  const lower = sourceOverview.toLowerCase();

  if (/food|tasting|culinary|chef|market vendor|vendor/.test(lower)) {
    themes.push("regional food tastings and vendor stops");
  }
  if (/history|heritage|culture|story|stories/.test(lower)) {
    themes.push("local history and cultural context");
  }
  if (/wildlife|whale|dolphin|bird|marine|ecosystem/.test(lower)) {
    themes.push("wildlife observation along the route");
  }
  if (/waterfall|falls|river|canyon|mountain|park|forest|desert|glacier|meadow|grove|valley/.test(lower)) {
    themes.push("landscape features and scenic viewpoints");
  }
  if (/neighborhood|district|downtown|waterfront|harbor|harbour|bay|coast|beach|skyline|city/.test(lower)) {
    themes.push("neighborhood landmarks and open views");
  }
  if (/wine|vineyard|winery|tasting room/.test(lower)) {
    themes.push("wine-country stops and tasting-room visits");
  }
  if (/obstacle|adventure|climb|rope|aerial|course|zip|scrambl/.test(lower)) {
    themes.push("structured adventure features and challenge elements");
  }
  if (/narrated|commentary|interpret|guide-led|naturalist|captain/.test(lower)) {
    themes.push("destination interpretation throughout the route");
  }
  if (/small-group|private|shared/.test(lower)) {
    themes.push("a small-group route format");
  }

  if (themes.length === 0) return "";
  return normalizeOverviewSentence(
    `The route combines ${formatOverviewLandmarkList(themes.slice(0, 3))}`
  );
};

const buildOverviewTitleLocationSentence = ({
  title,
  city,
  state,
}: {
  title: string;
  city: string;
  state: string;
}) => {
  const titleMatch =
    /\bnear\s+([A-Z][A-Za-z'’&-]+(?:\s+[A-Z][A-Za-z'’&-]+){0,4})\b/.exec(title) ??
    /\bin\s+([A-Z][A-Za-z'’&-]+(?:\s+[A-Z][A-Za-z'’&-]+){0,4})\b/.exec(title) ??
    /\bfrom\s+([A-Z][A-Za-z'’&-]+(?:\s+[A-Z][A-Za-z'’&-]+){0,4})\b/.exec(title);

  const titleLocation = titleMatch?.[1]?.trim();
  if (!titleLocation) return "";

  const normalizedTitleLocation =
    normalizeEngine6ItineraryComparisonText(titleLocation);
  const normalizedCity = normalizeEngine6ItineraryComparisonText(city);
  if (
    normalizedTitleLocation === normalizedCity ||
    normalizedTitleLocation.includes(normalizedCity)
  ) {
    return "";
  }

  return normalizeOverviewSentence(
    `The outing extends the ${city}, ${state} area to include ${titleLocation}`
  );
};

const buildOverviewHighlightsSentence = (highlights: string[]) => {
  const items = dedupeOverviewValues(
    highlights
      .filter(isUsableOverviewHighlight)
      .map(item => item.replace(/[.!?]+$/g, "").trim())
  ).slice(0, 3);
  if (items.length === 0) return "";
  return normalizeOverviewSentence(
    `The experience emphasizes ${formatOverviewLandmarkList(items)}`
  );
};

const buildOverviewDurationSentence = (durationText: string | null) => {
  if (!durationText?.trim()) return "";
  return normalizeOverviewSentence(
    `The outing typically lasts ${durationText.replace(/[.!?]+$/g, "").trim()}`
  );
};

const buildOverviewTransportSentence = (args: {
  title: string;
  categoryLabel: string | null;
  sourceOverview: string;
}) => {
  const transportMethod = extractOverviewTransportMethod(args);
  if (!transportMethod) return "";
  return normalizeOverviewSentence(
    `Travel is organized as ${transportMethod} with route pacing matched to the destination`
  );
};

const buildOverviewSourceLocationsSentence = (sourceOverview: string) => {
  const locations = dedupeOverviewValues(
    collectPatternMatches(sourceOverview, ENGINE6_ATTRACTION_SUFFIX_PATTERN)
  )
    .filter(isSignificantOverviewLocation)
    .slice(0, 4);

  if (locations.length === 0) return "";
  return normalizeOverviewSentence(
    `Landmarks referenced in the route include ${formatOverviewLandmarkList(locations)}`
  );
};

const buildOverviewItineraryStopsSentence = (
  itinerary: Array<{ title: string; description?: string | null }>
) => {
  const stops = dedupeOverviewValues(
    itinerary
      .map(item => item.title.replace(/\s+/g, " ").trim())
      .filter(title => {
        const normalized = normalizeEngine6ItineraryComparisonText(title);
        return (
          normalized.length >= 4 && !GENERIC_LOCATION_LABELS.has(normalized)
        );
      })
  ).slice(0, 5);

  if (stops.length === 0) return "";
  return normalizeOverviewSentence(
    `Scheduled stops include ${formatOverviewLandmarkList(stops)}`
  );
};

const buildOverviewSourceParaphrase = ({
  sourceOverview,
  city,
  state,
  categoryLabel,
}: {
  sourceOverview: string;
  city: string;
  state: string;
  categoryLabel: string | null;
}) => {
  const lower = sourceOverview.toLowerCase();
  const activityLabel = categoryLabel?.toLowerCase() ?? "guided outing";

  if (/market|vendor|tasting|food|culinary|chef/.test(lower)) {
    return normalizeOverviewSentence(
      `Market stalls, specialty foods, and public-market history shape the walking format across ${city}'s best-known vendor areas`
    );
  }
  if (/obstacle|aerial|rope|course|climb|adventure|zip|treetop|oak grove/.test(lower)) {
    return normalizeOverviewSentence(
      `The aerial course combines treetop obstacles, challenge levels, and forest setting details that define the ${city} outing`
    );
  }
  if (/whale|dolphin|marine|wildlife|bird|ecosystem/.test(lower)) {
    return normalizeOverviewSentence(
      `Coastal waters around ${city}, ${state} provide the main setting for seasonal wildlife viewing and open-water scenery`
    );
  }
  if (/harbor|bay|cruise|boat|yacht|sail|kayak|paddle|ferry|waterfront/.test(lower)) {
    return normalizeOverviewSentence(
      `Waterfront corridors, harbor perspectives, and shoreline scenery organize the ${activityLabel} around ${city}`
    );
  }
  if (/park|mountain|waterfall|forest|desert|canyon|glacier|meadow|national park/.test(lower)) {
    return normalizeOverviewSentence(
      `Park landscapes, scenic stops, and mountain or valley viewpoints structure the ${activityLabel} outside ${city}`
    );
  }
  if (/city|downtown|neighborhood|landmark|district|skyline|historic/.test(lower)) {
    return normalizeOverviewSentence(
      `City landmarks, neighborhood transitions, and skyline or historic districts frame the ${activityLabel} across ${city}`
    );
  }
  if (/wine|vineyard|winery|valley|tasting room/.test(lower)) {
    return normalizeOverviewSentence(
      `Wine-country roads, tasting stops, and valley scenery shape the full-day route beyond ${city}'s immediate center`
    );
  }

  return normalizeOverviewSentence(
    `The ${activityLabel} in ${city}, ${state} is organized around the destination features described in the source route rather than booking logistics`
  );
};

const forceAppendOverviewSentence = (
  sentences: string[],
  sentence: string,
  maxWords = ENGINE6_OVERVIEW_TARGET_MAX_WORDS
) => {
  const normalized = normalizeOverviewSentence(sentence);
  if (!normalized) return false;
  const candidate = [...sentences, normalized].join(" ");
  if (countOverviewWords(candidate) > maxWords) return false;
  if (sentences.includes(normalized)) return false;
  sentences.push(normalized);
  return true;
};

const ensureOverviewMinimumWordCount = (
  sentences: string[],
  args: OverviewRewriteArgs,
  cleanedSource: string
) => {
  const paddingSentences = [
    buildOverviewSourceParaphrase({
      sourceOverview: cleanedSource,
      city: args.city,
      state: args.state,
      categoryLabel: args.categoryLabel,
    }),
    buildOverviewItineraryStopsSentence(args.itinerary),
    buildOverviewThematicSentence(cleanedSource),
    buildOverviewTitleLocationSentence({
      title: args.title,
      city: args.city,
      state: args.state,
    }),
    normalizeOverviewSentence(
      `Expect a route shaped around the area's most relevant landmarks, scenery, and local character in ${args.city}`
    ),
    normalizeOverviewSentence(
      `The format is designed to read as destination guidance rather than promotional booking copy`
    ),
    normalizeOverviewSentence(
      `The outing keeps focus on place, route structure, and destination context rather than meeting or pickup logistics`
    ),
    normalizeOverviewSentence(
      `Together, these elements describe the destination experience, activity format, and route emphasis for travelers planning time in ${args.city}, ${args.state}`
    ),
  ];

  for (const sentence of paddingSentences) {
    if (countOverviewWords(sentences.join(" ")) >= ENGINE6_OVERVIEW_TARGET_MIN_WORDS) {
      break;
    }
    appendOverviewSentenceIfUseful(sentences, sentence) ||
      forceAppendOverviewSentence(sentences, sentence);
  }
};

const rewriteOverviewSourceSentence = (sentence: string) => {
  if (isEngine6ExcludedOverviewSentence(sentence)) return "";
  if (isEngine6OperationalOverviewOpener(sentence)) return "";

  const rewritten = toThirdPersonGuideVoice(sentence);
  if (!rewritten) return "";
  if (
    ENGINE6_OVERVIEW_BANNED_VOICE_PATTERNS.some(pattern => pattern.test(rewritten))
  ) {
    return "";
  }
  if (countOverviewWords(rewritten) < 6) return "";
  return rewritten;
};

const appendOverviewSentenceIfUseful = (
  sentences: string[],
  sentence: string,
  maxWords = ENGINE6_OVERVIEW_TARGET_MAX_WORDS
) => {
  const normalized = normalizeOverviewSentence(sentence);
  if (!normalized) return false;

  const normalizedCandidate = normalizeEngine6ItineraryComparisonText(normalized);
  if (
    sentences.some(existing => {
      const normalizedExisting =
        normalizeEngine6ItineraryComparisonText(existing);
      return (
        normalizedExisting.includes(normalizedCandidate) ||
        normalizedCandidate.includes(normalizedExisting)
      );
    })
  ) {
    return false;
  }

  const candidate = [...sentences, normalized].join(" ");
  if (countOverviewWords(candidate) > maxWords) return false;
  sentences.push(normalized);
  return true;
};

export const rewriteEngine6Overview = (args: OverviewRewriteArgs) => {
  const cleanedSource = stripOverviewMarketingLanguage(
    cleanEngine6Description(args.sourceOverview)
  )
    .replace(/\s+/g, " ")
    .trim();
  const namedLocations = extractEngine6OverviewNamedLocations({
    sourceOverview: cleanedSource,
    highlights: args.highlights,
    itinerary: args.itinerary,
  });

  const sentences: string[] = [];
  appendOverviewSentenceIfUseful(
    sentences,
    buildOverviewDestinationOpening({ ...args, namedLocations })
  );
  appendOverviewSentenceIfUseful(
    sentences,
    buildOverviewRouteSentence(namedLocations)
  );
  appendOverviewSentenceIfUseful(
    sentences,
    buildOverviewHighlightsSentence(args.highlights)
  );
  appendOverviewSentenceIfUseful(
    sentences,
    buildOverviewItineraryStopsSentence(args.itinerary)
  );
  appendOverviewSentenceIfUseful(
    sentences,
    buildOverviewSourceLocationsSentence(cleanedSource)
  );
  appendOverviewSentenceIfUseful(
    sentences,
    buildOverviewThematicSentence(cleanedSource)
  );
  appendOverviewSentenceIfUseful(
    sentences,
    buildOverviewTitleLocationSentence({
      title: args.title,
      city: args.city,
      state: args.state,
    })
  );

  for (const sourceSentence of splitOverviewSentences(cleanedSource)) {
    const rewritten = rewriteOverviewSourceSentence(sourceSentence);
    if (!rewritten) continue;
    if (
      isEngine6SupplierMirroredOverviewText({
        source: sourceSentence,
        target: rewritten,
      })
    ) {
      continue;
    }
    appendOverviewSentenceIfUseful(sentences, rewritten);
  }

  appendOverviewSentenceIfUseful(
    sentences,
    buildOverviewDurationSentence(args.durationText)
  );
  appendOverviewSentenceIfUseful(sentences, buildOverviewTransportSentence(args));

  ensureOverviewMinimumWordCount(sentences, args, cleanedSource);

  if (
    cleanedSource &&
    isEngine6SupplierMirroredOverviewText({
      source: cleanedSource,
      target: sentences.join(" "),
    })
  ) {
    const safeSentences = sentences.filter(
      sentence =>
        !splitOverviewSentences(cleanedSource).some(sourceSentence =>
          isEngine6SupplierMirroredOverviewText({
            source: sourceSentence,
            target: sentence,
          })
        )
    );
    ensureOverviewMinimumWordCount(safeSentences, args, "");
    return safeSentences.join(" ").replace(/\s+/g, " ").trim();
  }

  return sentences.join(" ").replace(/\s+/g, " ").trim();
};

const overviewIncludesNamedLocation = (
  overviewText: string,
  location: string
) => {
  const normalizedOverview =
    normalizeEngine6ItineraryComparisonText(overviewText);
  const normalizedLocation = normalizeEngine6ItineraryComparisonText(location);
  if (!normalizedLocation) return true;

  if (normalizedOverview.includes(normalizedLocation)) {
    return true;
  }

  const tokens = normalizedLocation
    .split(" ")
    .filter(token => token.length > 3);
  if (tokens.length === 0) return true;
  const matchedTokens = tokens.filter(token =>
    normalizedOverview.includes(token)
  );
  return matchedTokens.length >= Math.max(1, Math.ceil(tokens.length * 0.6));
};

export const validateEngine6GovernedOverview = ({
  overviewText,
  sourceOverview,
  highlights = [],
  itinerary = [],
}: OverviewValidationArgs) => {
  const violations: string[] = [];
  const overview = overviewText?.trim() ?? "";
  const source = sourceOverview?.trim() ?? "";

  if (!overview) {
    if (source) {
      violations.push(
        "overview governance validation failed: overview missing despite source overview"
      );
    }
    return violations;
  }

  const wordCount = countOverviewWords(overview);
  if (wordCount < ENGINE6_OVERVIEW_MIN_WORDS) {
    violations.push(
      `overview governance validation failed: overview must reach at least ${ENGINE6_OVERVIEW_MIN_WORDS} words`
    );
  }
  if (wordCount > ENGINE6_OVERVIEW_MAX_WORDS) {
    violations.push(
      `overview governance validation failed: overview must stay within ${ENGINE6_OVERVIEW_MAX_WORDS} words`
    );
  }

  if (
    source &&
    isEngine6SupplierMirroredOverviewText({ source, target: overview })
  ) {
    violations.push(
      "overview governance validation failed: overview closely mirrors supplier wording"
    );
  }

  if (isEngine6OperationalOverviewOpener(overview)) {
    violations.push(
      "overview governance validation failed: overview begins with operational or logistical instructions"
    );
  }

  if (
    ENGINE6_OVERVIEW_BANNED_VOICE_PATTERNS.some(pattern => pattern.test(overview))
  ) {
    violations.push(
      "overview governance validation failed: overview uses promotional, conversational, or supplier-facing voice"
    );
  }

  if (
    splitOverviewSentences(overview).some(sentence =>
      isEngine6ExcludedOverviewSentence(sentence)
    )
  ) {
    violations.push(
      "overview governance validation failed: overview includes operational, legal, or promotional exclusions"
    );
  }

  const namedLocations = dedupeOverviewValues([
    ...itinerary
      .map(item => item.title.replace(/\s+/g, " ").trim())
      .filter(title => {
        const normalized = normalizeEngine6ItineraryComparisonText(title);
        return (
          normalized.length >= 4 && !GENERIC_LOCATION_LABELS.has(normalized)
        );
      }),
    ...collectPatternMatches(source, ENGINE6_ATTRACTION_SUFFIX_PATTERN).filter(
      isSignificantOverviewLocation
    ),
  ]);

  for (const location of namedLocations.slice(0, 6)) {
    if (!overviewIncludesNamedLocation(overview, location)) {
      violations.push(
        `overview governance validation failed: named location "${location}" from source material is missing from overview`
      );
    }
  }

  return violations;
};
