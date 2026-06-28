import { extractEngine6OverviewNamedLocations } from "./overviewGovernance";
import {
  cleanEngine6Description,
  stripEngine6AdmissionArtifacts,
  stripEngine6GeneratedDescriptionPrefix,
} from "./seo";
import type { Engine6Tour } from "./types";

export const ENGINE6_EDITORIAL_DESCRIPTION_MIN_WORDS = 90;
export const ENGINE6_EDITORIAL_DESCRIPTION_MAX_WORDS = 140;
export const ENGINE6_EDITORIAL_DESCRIPTION_MIN_CHARS = 500;
export const ENGINE6_EDITORIAL_DESCRIPTION_MAX_CHARS = 800;

export const ENGINE6_EDITORIAL_FORBIDDEN_PATTERNS = [
  /\ba food-focused guided outing\b/i,
  /\ba water-based guided outing\b/i,
  /\ba guided cycling outing\b/i,
  /\ba city sightseeing outing\b/i,
  /\ba park-focused guided outing\b/i,
  /\ba guided destination outing\b/i,
  /\ban aerial sightseeing outing\b/i,
  /\ban off-road guided outing\b/i,
  /\ba guided hiking outing\b/i,
  /\bguided outing\b/i,
  /\bcentered on\b/i,
  /\borganized around\b/i,
  /\bdestination features\b/i,
  /\bguide-led context\b/i,
  /\bsurrounding landmarks\b/i,
  /\bsightseeing & city tours\b/i,
  /\bwater-based experience\b/i,
  /\boutdoor adventure in\b/i,
  /\btravelers explore\b/i,
  /\bthe route includes\b/i,
  /\bthe route emphasizes\b/i,
  /\bthe experience emphasizes\b/i,
  /\bscheduled stops include\b/i,
  /\blandmarks referenced\b/i,
  /\btravel is organized as\b/i,
  /\bdestination interpretation throughout the route\b/i,
  /\bexpect a route shaped around\b/i,
  /\bthe format is designed to read as destination guidance\b/i,
  /\bcity landmarks, neighborhood transitions\b/i,
  /\bHighlights include\b/i,
  /\bIncluded elements cover\b/i,
  /\bThe experience typically lasts\b/i,
  /\bThe outing typically lasts\b/i,
  /\bThe route combines\b/i,
  /\blandscape features and scenic viewpoints\b/i,
  /\bneighborhood landmarks and open views\b/i,
  /\bguided experience\b/i,
  /\bclear logistics\b/i,
  /\bmemorable local stops\b/i,
  /\btraveler-friendly pace\b/i,
  /\beasy logistics\b/i,
  /\bdetails aligned to the product page\b/i,
  /^Spend your time in\b/i,
  /\bopens up on\b/i,
  /\bouting is built around\b/i,
  /,\s*beginning with\b/i,
  /\bputs the focus on\b/i,
  /\byou set out on\b/i,
  /\bStops along the way include\b/i,
  /\bMajor pauses come at\b/i,
  /\bParticular attention goes to\b/i,
  /\bExpect time at\b/i,
  /\bYou spend meaningful time at\b/i,
  /\bThe day moves through\b/i,
  /\bkeeps the focus on the places named in the itinerary\b/i,
  /\bwith time built around\b/i,
] as const;

export type Engine6EditorialActivityKind =
  | "whale-watching"
  | "aquarium-admission"
  | "zoo-admission"
  | "wine-tasting"
  | "food-tour"
  | "trolley-tour"
  | "helicopter-flight"
  | "airboat-tour"
  | "kayak-tour"
  | "parasail-tour"
  | "speedboat-tour"
  | "sailing-tour"
  | "harbor-cruise"
  | "segway-tour"
  | "bike-tour"
  | "hiking-tour"
  | "off-road-tour"
  | "stargazing-tour"
  | "museum-tour"
  | "national-park-tour"
  | "city-sightseeing"
  | "surf-lesson"
  | "generic-tour";

const countWords = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;

const normalizeSentence = (value: string) => {
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

export const isEngine6ForbiddenEditorialPhrase = (value: string) =>
  ENGINE6_EDITORIAL_FORBIDDEN_PATTERNS.some(pattern => pattern.test(value));

const splitSentences = (value: string) =>
  value
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const formatLandmarkList = (values: string[]) => {
  const cleaned = values
    .map(value => value.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (cleaned.length === 0) return "";
  if (cleaned.length === 1) return cleaned[0];
  if (cleaned.length === 2) return `${cleaned[0]} and ${cleaned[1]}`;
  return `${cleaned.slice(0, -1).join(", ")}, and ${cleaned[cleaned.length - 1]}`;
};

const dedupeValues = (values: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }

  return result;
};

const sanitizeListItem = (value: string) =>
  value
    .replace(/\bguided experience\b/gi, "guided visit")
    .replace(/\bPrivate guided experience\b/gi, "private Met visit")
    .trim();

const summarizeList = (values: string[], limit = 5) =>
  dedupeValues(
    values
      .map(sanitizeListItem)
      .filter(value => value.length >= 3 && !isEngine6ForbiddenEditorialPhrase(value))
  ).slice(0, limit);

const hashProductCode = (productCode: string) =>
  productCode.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

const isOperationalStopTitle = (value: string) =>
  /\b(?:departure|pickup|pick-up|meeting point|launch area|launch corridor|return|drop[- ]?off)\b/i.test(
    value
  );

export const classifyEngine6EditorialActivityKind = ({
  title,
  categoryLabel,
  overviewText,
}: {
  title: string;
  categoryLabel?: string | null;
  overviewText: string;
}): Engine6EditorialActivityKind => {
  const titleIdentity = `${title} ${categoryLabel ?? ""}`.toLowerCase();
  const identity = `${title} ${categoryLabel ?? ""} ${overviewText}`.toLowerCase();

  const fromTitle = (): Engine6EditorialActivityKind | null => {
    if (/whale watch|whale watching|whale-watching/.test(titleIdentity)) {
      return "whale-watching";
    }
    if (
      /aquarium/.test(titleIdentity) &&
      /admission|ticket|entry|pass/.test(titleIdentity)
    ) {
      return "aquarium-admission";
    }
    if (
      /(?:zoo|safari park)/.test(titleIdentity) &&
      /admission|ticket|entry|pass|2-visit|two day|2 day/.test(titleIdentity)
    ) {
      return "zoo-admission";
    }
    if (/wine|vineyard|winery|wine country/.test(titleIdentity)) {
      return "wine-tasting";
    }
    if (
      /food tour|culinary|gourmet|bustronome|dining experience|lunch tour|dinner tour/.test(
        titleIdentity
      )
    ) {
      return "food-tour";
    }
    if (/trolley/.test(titleIdentity)) {
      return "trolley-tour";
    }
    if (/helicopter|heli[- ]?tour|sky tour|flightseeing/.test(titleIdentity)) {
      return "helicopter-flight";
    }
    if (/airboat|swamp tour|bayou/.test(titleIdentity)) {
      return "airboat-tour";
    }
    if (/kayak|sea cave|paddle board|paddleboard|\bsup\b|canoe/.test(titleIdentity)) {
      return "kayak-tour";
    }
    if (/parasail|paraglid/.test(titleIdentity)) {
      return "parasail-tour";
    }
    if (/speedboat|jet boat|jetboat/.test(titleIdentity)) {
      return "speedboat-tour";
    }
    if (/sail|yacht|catamaran/.test(titleIdentity)) {
      return "sailing-tour";
    }
    if (/segway/.test(titleIdentity)) {
      return "segway-tour";
    }
    if (/surf lesson|learn to surf|surfing lesson/.test(titleIdentity)) {
      return "surf-lesson";
    }
    if (/bike|e-bike|cycling|bicycle/.test(titleIdentity)) {
      return "bike-tour";
    }
    if (/hike|hiking|scrambl|climb|trail run/.test(titleIdentity)) {
      return "hiking-tour";
    }
    if (/jeep|4x4|off[- ]?road|humvee|atv|dune buggy/.test(titleIdentity)) {
      return "off-road-tour";
    }
    if (/stargaz|astronomy|night sky|telescope/.test(titleIdentity)) {
      return "stargazing-tour";
    }
    if (
      (/museum|metropolitan museum|moma|gallery tour|art tour/.test(titleIdentity) ||
        /private tour of .*museum/i.test(title)) &&
      !/national park/.test(titleIdentity)
    ) {
      return "museum-tour";
    }
    if (/national park|state park|monument\b/.test(titleIdentity)) {
      return "national-park-tour";
    }
    if (/cruise|boat tour|harbor tour|bay tour/.test(titleIdentity)) {
      return "harbor-cruise";
    }
    if (
      /city tour|sightseeing|landmark|panoramic bus|coach tour|bus tour|day trip/.test(
        titleIdentity
      )
    ) {
      return "city-sightseeing";
    }
    return null;
  };

  const titleKind = fromTitle();
  if (titleKind) {
    return titleKind;
  }

  if (/whale watch|whale watching|whale-watching/.test(identity)) {
    return "whale-watching";
  }
  if (
    /aquarium/.test(identity) &&
    /admission|ticket|entry|pass/.test(identity)
  ) {
    return "aquarium-admission";
  }
  if (
    /(?:zoo|safari park)/.test(identity) &&
    /admission|ticket|entry|pass|2-visit|two day|2 day/.test(identity)
  ) {
    return "zoo-admission";
  }
  if (/wine|vineyard|winery|wine country|tasting/.test(identity)) {
    return "wine-tasting";
  }
  if (/food tour|culinary|tasting tour|chefs? tour|gourmet|bustronome/.test(identity)) {
    return "food-tour";
  }
  if (/trolley/.test(identity)) {
    return "trolley-tour";
  }
  if (/helicopter|heli[- ]?tour|sky tour|aerial tour|flightseeing/.test(identity)) {
    return "helicopter-flight";
  }
  if (/airboat|swamp tour|bayou/.test(identity)) {
    return "airboat-tour";
  }
  if (/kayak|sea cave|paddle board|paddleboard|\bsup\b|canoe/.test(identity)) {
    return "kayak-tour";
  }
  if (/parasail|paraglid/.test(identity)) {
    return "parasail-tour";
  }
  if (/speedboat|jet boat|jetboat/.test(identity)) {
    return "speedboat-tour";
  }
  if (/sail|yacht|catamaran/.test(identity)) {
    return "sailing-tour";
  }
  if (/segway/.test(identity)) {
    return "segway-tour";
  }
  if (/surf lesson|learn to surf|surfing lesson/.test(identity)) {
    return "surf-lesson";
  }
  if (/bike|e-bike|cycling|bicycle|pedal/.test(identity)) {
    return "bike-tour";
  }
  if (/hike|hiking|scrambl|climb|trail run/.test(identity)) {
    return "hiking-tour";
  }
  if (/jeep|4x4|off[- ]?road|humvee|atv|dune buggy/.test(identity)) {
    return "off-road-tour";
  }
  if (/stargaz|astronomy|night sky|telescope/.test(identity)) {
    return "stargazing-tour";
  }
  if (
    /private tour of .*museum/i.test(title) ||
    (/museum|metropolitan museum|moma/.test(titleIdentity) &&
      !/national park/.test(titleIdentity))
  ) {
    return "museum-tour";
  }
  if (/national park|state park|monument\b/.test(identity)) {
    return "national-park-tour";
  }
  if (/cruise|boat tour|harbor tour|bay tour|dinner cruise|brunch cruise/.test(identity)) {
    return "harbor-cruise";
  }
  if (
    /city tour|sightseeing|landmark|neighborhood|downtown|coach tour|bus tour|day trip|panoramic bus/.test(
      identity
    )
  ) {
    return "city-sightseeing";
  }
  if (/wildlife|safari(?! park)/.test(identity) && /cruise|watch/.test(identity)) {
    return "whale-watching";
  }

  return "generic-tour";
};

const selectPrimaryVenue = ({
  title,
  itineraryStops,
  overviewText,
  highlights,
  preferPattern,
}: {
  title: string;
  itineraryStops: Array<{ title: string; description?: string | null }>;
  overviewText: string;
  highlights: string[];
  preferPattern?: RegExp;
}) => {
  const itineraryCandidates = itineraryStops
    .map(stop => stop.title.trim())
    .filter(
      stopTitle =>
        stopTitle &&
        !isOperationalStopTitle(stopTitle) &&
        (!preferPattern || preferPattern.test(stopTitle))
    );

  if (itineraryCandidates.length > 0) {
    return itineraryCandidates[0];
  }

  if (preferPattern) {
    const titleMatch = title.match(
      new RegExp(`(${preferPattern.source})`, preferPattern.flags)
    )?.[0];
    if (titleMatch) {
      return titleMatch.trim();
    }
  }

  return (
    collectEditorialPois({
      title: "",
      overviewText,
      itineraryStops,
      highlights,
    })[0] ?? ""
  );
};

const collectEditorialPois = ({
  title,
  overviewText,
  itineraryStops,
  highlights,
  includeTitleMatches = false,
}: {
  title: string;
  overviewText: string;
  itineraryStops: Array<{ title: string; description?: string | null }>;
  highlights: string[];
  includeTitleMatches?: boolean;
}) => {
  const fromItinerary = itineraryStops
    .map(stop => stop.title)
    .filter(titleValue => titleValue && !isOperationalStopTitle(titleValue));
  const fromOverview = extractEngine6OverviewNamedLocations({
    sourceOverview: overviewText,
    highlights,
    itinerary: itineraryStops,
  });
  const fromHighlights = highlights
    .map(sanitizeListItem)
    .filter(item => item.length >= 4 && !/^see |^visit |^enjoy /i.test(item));

  return summarizeList(
    [...fromItinerary, ...fromOverview, ...fromHighlights].filter(poi => {
      if (includeTitleMatches) {
        return true;
      }
      const normalizedTitle = title.toLowerCase();
      const normalizedPoi = poi.toLowerCase();
      return (
        normalizedPoi.length >= 8 ||
        !normalizedTitle.includes(normalizedPoi)
      );
    }),
    5
  );
};

const cleanEditorialSource = (value: string, title: string) => {
  if (/\.\.\.|…/.test(value)) return "";

  let cleaned = stripEngine6GeneratedDescriptionPrefix(
    cleanEngine6Description(value)
  )
    .replace(/\.\.\.+/g, ".")
    .replace(/\s+/g, " ")
    .trim();

  const readableTitle = title.replace(/\s+\d{4,}$/i, "").trim();
  if (readableTitle) {
    cleaned = cleaned
      .replace(
        new RegExp(
          `^${readableTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+(?:is|offers|provides|gives|takes|brings|combines|features)\\s+`,
          "i"
        ),
        ""
      )
      .replace(
        new RegExp(
          `^${readableTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[,;:\\s-]+`,
          "i"
        ),
        ""
      )
      .trim();
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const isExperienceFirstSentence = (sentence: string) =>
  /^(?:Ride|Paddle|Sail|Fly|Hike|Walk|Board|Cruise|Explore|Discover|Visit|Watch|Scan|Roll|Glide|Cycle|Drive|Taste|Sample|Uncover|Step|Drift|Climb|Kayak|Whiz|Soar|Float|Tour|Use|Spend|Stand|Cross|Wind|Traverse|Uncover)/i.test(
    sentence.trim()
  );

const appendSentenceIfUseful = (sentences: string[], sentence: string) => {
  const normalized = normalizeSentence(sentence);
  if (!normalized) return false;
  if (isEngine6ForbiddenEditorialPhrase(normalized)) return false;
  if (countWords(normalized) < 4) return false;

  const candidateKey = normalized.toLowerCase();
  if (
    sentences.some(existing => {
      const existingKey = existing.toLowerCase();
      return (
        existingKey.includes(candidateKey) || candidateKey.includes(existingKey)
      );
    })
  ) {
    return false;
  }

  const candidate = [...sentences, normalized].join(" ");
  if (countWords(candidate) > ENGINE6_EDITORIAL_DESCRIPTION_MAX_WORDS) {
    return false;
  }

  sentences.push(normalized);
  return true;
};

const buildPoiFollowOn = (
  pois: string[],
  activityKind: Engine6EditorialActivityKind,
  productCode: string
) => {
  if (pois.length === 0) return "";

  const list = formatLandmarkList(pois.slice(0, 4));
  const variant = hashProductCode(productCode) % 4;

  switch (activityKind) {
    case "aquarium-admission":
    case "zoo-admission":
    case "museum-tour":
      return normalizeSentence(
        [
          `Inside, you'll move through ${list}.`,
          `The visit covers ${list}.`,
          `Gallery time spans ${list}.`,
          `Exhibits include ${list}.`,
        ][variant]
      );
    case "whale-watching":
    case "harbor-cruise":
    case "sailing-tour":
    case "speedboat-tour":
      return normalizeSentence(
        [
          `From the water you'll pass ${list}.`,
          `The route tracks ${list} along the shoreline.`,
          `On deck you'll see ${list}.`,
          `Captain commentary ties together ${list}.`,
        ][variant]
      );
    case "wine-tasting":
    case "food-tour":
      return normalizeSentence(
        [
          `Tastings unfold at ${list}.`,
          `Stops include ${list}.`,
          `You'll sample across ${list}.`,
          `The day visits ${list}.`,
        ][variant]
      );
    default:
      return normalizeSentence(
        [
          `Along the way you'll see ${list}.`,
          `The route connects ${list}.`,
          `You'll pause at ${list}.`,
          `Landmarks along the route include ${list}.`,
        ][variant]
      );
  }
};

const buildExperienceOpening = ({
  productCode,
  title,
  city,
  categoryLabel,
  overviewText,
  itineraryStops,
  highlights,
  durationText,
}: {
  productCode: string;
  title: string;
  city: string;
  categoryLabel?: string | null;
  overviewText: string;
  itineraryStops: Array<{ title: string; description?: string | null }>;
  highlights: string[];
  durationText?: string | null;
}) => {
  const activityKind = classifyEngine6EditorialActivityKind({
    title,
    categoryLabel,
    overviewText,
  });
  const pois = collectEditorialPois({
    title,
    overviewText,
    itineraryStops,
    highlights,
  });
  const primaryPoi = selectPrimaryVenue({
    title,
    itineraryStops,
    overviewText,
    highlights,
  });
  const duration = durationText?.trim();
  const durationPhrase = duration ? ` lasting ${duration}` : "";
  const cityLabel = city.trim();

  switch (activityKind) {
    case "whale-watching":
      return normalizeSentence(
        `Scan ${cityLabel}'s coastal waters on a whale watching cruise${durationPhrase} where seasonal migrations bring whales, dolphins, and seabirds within view of the boat.`
      );
    case "aquarium-admission": {
      const venue =
        selectPrimaryVenue({
          title,
          itineraryStops,
          overviewText,
          highlights,
          preferPattern: /aquarium/i,
        }) ||
        title.match(/(.+?\bAquarium\b)/i)?.[1]?.trim() ||
        primaryPoi;
      return normalizeSentence(
        venue
          ? `Walk ${venue}'s kelp forest, Open Sea, and signature Pacific galleries at your own pace with timed admission.`
          : `Explore ${cityLabel}'s aquarium galleries—from kelp forest to open-ocean exhibits—with a timed admission ticket.`
      );
    }
    case "zoo-admission": {
      const zooStops = itineraryStops
        .map(stop => stop.title.trim())
        .filter(Boolean);
      if (zooStops.length >= 2) {
        return normalizeSentence(
          `Use your multi-day pass to explore ${zooStops[0]} and ${zooStops[1]}, moving between zoo habitats and open-range safari enclosures on your own schedule.`
        );
      }
      const venue =
        selectPrimaryVenue({
          title,
          itineraryStops,
          overviewText,
          highlights,
          preferPattern: /zoo|safari park/i,
        }) || primaryPoi;
      return normalizeSentence(
        `Move through ${venue || `${cityLabel}'s zoo`} with admission that lets you explore major habitats and animal exhibits at your pace.`
      );
    }
    case "wine-tasting":
      return normalizeSentence(
        `Sample ${cityLabel} wine country on a tasting-day route through valley vineyards${primaryPoi ? ` including ${primaryPoi}` : ""}.`
      );
    case "food-tour":
      return normalizeSentence(
        `Dine while sightseeing through ${cityLabel}${primaryPoi ? `, with courses served as you pass ${primaryPoi}` : ""}, on a panoramic bus route that pairs NYC landmarks with a multi-course meal.`
      );
    case "trolley-tour":
      return normalizeSentence(
        `Roll through ${cityLabel} aboard an open-air trolley${primaryPoi ? `, passing ${primaryPoi}` : ""}, with live narration and photo stops along the route.`
      );
    case "helicopter-flight":
      return normalizeSentence(
        `Lift off over ${cityLabel} on a helicopter flight${durationPhrase} with aerial views of skyline and landmark rooftops.`
      );
    case "airboat-tour":
      return normalizeSentence(
        `Skim cypress swamp and bayou channels near ${primaryPoi || cityLabel} on an airboat ride where marsh scenery and wildlife unfold at speed.`
      );
    case "kayak-tour":
      return normalizeSentence(
        `Paddle ${primaryPoi ? `through ${primaryPoi}` : `along ${cityLabel}'s shoreline`} on a guided kayak route with close-up coastal views and wildlife-rich water.`
      );
    case "parasail-tour":
      return normalizeSentence(
        `Lift off from ${primaryPoi || cityLabel}'s waterfront on a parasailing flight with wide coastal views below.`
      );
    case "speedboat-tour":
      return normalizeSentence(
        `Drive your own speedboat through ${cityLabel}'s harbor${primaryPoi ? `, following the route past ${primaryPoi}` : ""}, with captain guidance and on-board commentary.`
      );
    case "sailing-tour":
      return normalizeSentence(
        `Sail ${cityLabel}'s bay${durationPhrase}${primaryPoi ? ` with views of ${primaryPoi}` : ""} from the deck of a private or small-group yacht.`
      );
    case "harbor-cruise":
      return normalizeSentence(
        `Cruise ${cityLabel}'s harbor${durationPhrase}${primaryPoi ? ` with views of ${primaryPoi}` : ""} from the water.`
      );
    case "segway-tour":
      return normalizeSentence(
        `Glide through ${cityLabel}${primaryPoi ? ` to ${primaryPoi}` : ""} on a Segway route that covers more ground than walking while keeping a relaxed pace.`
      );
    case "bike-tour":
      return normalizeSentence(
        `Cycle through ${cityLabel}${primaryPoi ? `, linking ${primaryPoi}` : ""}, on a guided bike route with neighborhood context and photo stops.`
      );
    case "hiking-tour":
      return normalizeSentence(
        `Hike ${primaryPoi ? `through ${primaryPoi}` : `in ${cityLabel}`} on a trail route${durationPhrase} with wide views and guide interpretation.`
      );
    case "off-road-tour":
      return normalizeSentence(
        `Climb into rugged backcountry near ${cityLabel}${primaryPoi ? `, reaching ${primaryPoi}` : ""}, on an off-road route shaped by desert terrain and scenic overlooks.`
      );
    case "stargazing-tour":
      return normalizeSentence(
        `Look up from ${primaryPoi || `${cityLabel}'s dark-sky country`} on a stargazing session with telescopes and constellation interpretation far from city glow.`
      );
    case "museum-tour": {
      const museumName =
        selectPrimaryVenue({
          title,
          itineraryStops,
          overviewText,
          highlights,
          preferPattern: /museum|metropolitan|moma|gallery/i,
        }) ||
        title
          .replace(/^private tour of (?:the )?/i, "")
          .replace(/\s+in\s+.+$/i, "")
          .trim();
      return normalizeSentence(
        `Tour ${museumName} with a private guide who tailors the route to your interests across the museum's major collections.`
      );
    }
    case "national-park-tour":
      return normalizeSentence(
        `Travel into ${primaryPoi || "the national park"} from ${cityLabel} on a guided park day${durationPhrase} with scenic pullouts and short walks.`
      );
    case "city-sightseeing":
      return normalizeSentence(
        `See ${cityLabel}'s landmark neighborhoods${primaryPoi ? `, including ${primaryPoi}` : ""}, on a guided city circuit with strategic photo stops.`
      );
    case "surf-lesson":
      return normalizeSentence(
        `Catch your first waves on ${cityLabel}'s surf breaks with an instructor who handles board setup, ocean safety, and in-water coaching.`
      );
    default:
      return normalizeSentence(
        primaryPoi
          ? `Discover ${primaryPoi} and surrounding ${cityLabel} highlights with time for the places that define the route.`
          : `Explore ${cityLabel} with time for the landmarks and neighborhoods that define the route.`
      );
  }
};

const buildInclusionsNarrative = (included: string[]) => {
  const items = summarizeList(
    included.filter(item => !/pickup|pick-up|hotel/i.test(item)),
    3
  );
  if (items.length === 0) return "";
  return normalizeSentence(`${formatLandmarkList(items)} are included.`);
};

const buildDurationNarrative = ({
  durationText,
  activityKind,
}: {
  durationText?: string | null;
  activityKind: Engine6EditorialActivityKind;
}) => {
  const duration = durationText?.trim();
  if (!duration) return "";

  if (activityKind === "aquarium-admission" || activityKind === "zoo-admission") {
    return normalizeSentence(`Allow ${duration} for your visit.`);
  }

  return normalizeSentence(`Plan on ${duration} for the outing.`);
};

const buildTransportNarrative = (included: string[]) => {
  const transport = included.find(item =>
    /transport|ferry|shuttle|coach|bus|van|pickup|pick-up|round.?trip/i.test(item)
  );
  if (!transport) return "";
  return normalizeSentence(`${transport.replace(/[.!?]+$/g, "")} is included.`);
};

const trimToCharBudget = (
  value: string,
  maxChars = ENGINE6_EDITORIAL_DESCRIPTION_MAX_CHARS
) => {
  if (value.length <= maxChars) {
    return value;
  }

  const clipped = value.slice(0, maxChars).trim();
  const lastWordBoundary = clipped.lastIndexOf(" ");
  const safe =
    lastWordBoundary > maxChars * 0.7
      ? clipped.slice(0, lastWordBoundary)
      : clipped;

  return `${safe.replace(/[,.;:\s-]+$/g, "").trim()}.`;
};

const trimToWordBudget = (sentences: string[]) => {
  const selected: string[] = [];

  for (const sentence of sentences) {
    const candidate = [...selected, sentence].join(" ");
    if (
      countWords(candidate) > ENGINE6_EDITORIAL_DESCRIPTION_MAX_WORDS &&
      selected.length > 0
    ) {
      break;
    }
    selected.push(sentence);
    if (countWords(candidate) >= ENGINE6_EDITORIAL_DESCRIPTION_MIN_WORDS) {
      break;
    }
  }

  if (
    selected.length > 0 &&
    countWords(selected.join(" ")) < ENGINE6_EDITORIAL_DESCRIPTION_MIN_WORDS
  ) {
    return sentences.slice(0, Math.min(sentences.length, selected.length + 2));
  }

  return selected.length > 0 ? selected : sentences.slice(0, 1);
};

const padToMinimumEditorialLength = ({
  sentences,
  activityKind,
  productCode,
  itineraryStops,
  highlights,
  included,
  durationText,
  overviewText,
  title,
}: {
  sentences: string[];
  activityKind: Engine6EditorialActivityKind;
  productCode: string;
  itineraryStops: Array<{ title: string; description?: string | null }>;
  highlights: string[];
  included: string[];
  durationText?: string | null;
  overviewText: string;
  title: string;
}) => {
  const pois = collectEditorialPois({
    title,
    overviewText,
    itineraryStops,
    highlights,
  });

  const paddingCandidates = [
    buildPoiFollowOn(pois, activityKind, productCode),
    buildInclusionsNarrative(included),
    buildTransportNarrative(included),
    buildDurationNarrative({ durationText, activityKind }),
    ...itineraryStops.flatMap(stop =>
      splitSentences(
        cleanEditorialSource(stop.description ?? "", stop.title)
      ).slice(0, 1)
    ),
  ];

  for (const candidate of paddingCandidates) {
    if (trimToCharBudget(sentences.join(" ")).length >= ENGINE6_EDITORIAL_DESCRIPTION_MIN_CHARS) {
      break;
    }
    appendSentenceIfUseful(sentences, candidate);
  }

  return sentences;
};

export const buildEngine6PremiumEditorialDescription = ({
  productCode,
  title,
  city,
  categoryLabel,
  overviewText,
  description,
  itineraryStops = [],
  highlights = [],
  included = [],
  durationText,
}: {
  productCode: string;
  title: string;
  city: string;
  categoryLabel?: string | null;
  overviewText?: string | null;
  description?: string | null;
  itineraryStops?: Array<{ title: string; description?: string | null }>;
  highlights?: string[];
  included?: string[];
  durationText?: string | null;
}) => {
  const normalizedOverview = cleanEditorialSource(overviewText ?? "", title);
  const normalizedDescription = cleanEditorialSource(description ?? "", title);
  const sourceText = normalizedOverview || normalizedDescription;
  const activityKind = classifyEngine6EditorialActivityKind({
    title,
    categoryLabel,
    overviewText: sourceText,
  });

  const editorialSentences = splitSentences(sourceText).filter(
    sentence =>
      !isEngine6ForbiddenEditorialPhrase(sentence) &&
      countWords(sentence) >= 6 &&
      !/^this (?:tour|activity|experience)\b/i.test(sentence)
  );

  const experienceFirstOverview = editorialSentences.find(isExperienceFirstSentence);
  const curatedOverview = editorialSentences.join(" ").trim();

  if (
    curatedOverview.length >= ENGINE6_EDITORIAL_DESCRIPTION_MIN_CHARS &&
    countWords(curatedOverview) >= ENGINE6_EDITORIAL_DESCRIPTION_MIN_WORDS &&
    !isEngine6ForbiddenEditorialPhrase(curatedOverview) &&
    (experienceFirstOverview || editorialSentences.length >= 3)
  ) {
    return trimToCharBudget(curatedOverview);
  }

  const sentences: string[] = [];

  if (experienceFirstOverview) {
    appendSentenceIfUseful(sentences, experienceFirstOverview);
  } else {
    appendSentenceIfUseful(
      sentences,
      buildExperienceOpening({
        productCode,
        title,
        city,
        categoryLabel,
        overviewText: sourceText,
        itineraryStops,
        highlights,
        durationText,
      })
    );
  }

  const pois = collectEditorialPois({
    title,
    overviewText: sourceText,
    itineraryStops,
    highlights,
  });
  appendSentenceIfUseful(
    sentences,
    buildPoiFollowOn(pois, activityKind, productCode)
  );

  for (const sentence of editorialSentences) {
    if (countWords(sentences.join(" ")) >= ENGINE6_EDITORIAL_DESCRIPTION_MIN_WORDS) {
      break;
    }
    if (sentence === experienceFirstOverview) continue;
    appendSentenceIfUseful(sentences, sentence);
  }

  const supportingSentences = [
    buildInclusionsNarrative(included),
    buildTransportNarrative(included),
    buildDurationNarrative({ durationText, activityKind }),
  ];

  for (const sentence of supportingSentences) {
    if (countWords(sentences.join(" ")) >= ENGINE6_EDITORIAL_DESCRIPTION_MIN_WORDS) {
      break;
    }
    appendSentenceIfUseful(sentences, sentence);
  }

  padToMinimumEditorialLength({
    sentences,
    activityKind,
    productCode,
    itineraryStops,
    highlights,
    included,
    durationText,
    overviewText: sourceText,
    title,
  });

  const composed = trimToCharBudget(
    trimToWordBudget(sentences).join(" ").trim()
  );
  return composed.replace(/\s+/g, " ").replace(/\s+([,.;!?])/g, "$1");
};

export const buildEngine6PremiumEditorialDescriptionFromTour = (
  tour: Engine6Tour
) =>
  buildEngine6PremiumEditorialDescription({
    productCode: tour.productCode,
    title: tour.title,
    city: tour.city,
    categoryLabel: tour.categoryLabel,
    overviewText: tour.overviewText,
    description: tour.description || tour.metaDescription || tour.seoDescription,
    itineraryStops: tour.itinerary,
    highlights: tour.highlights,
    included: tour.included,
    durationText: tour.durationText,
  });
