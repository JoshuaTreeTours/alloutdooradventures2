import type { Engine6Tour } from "./types";

const NATURALIZED_MERCHANT_MIDDLE_CITIES = new Set([
  "Orlando",
  "Fort Lauderdale",
  "Naples",
  "Olympic National Park",
  "Honolulu",
  "Maui",
  "Hawaii Volcanoes National Park",
  "Kauai",
  "Kona",
  "Denver",
  "Aspen",
  "Boulder",
  "Austin",
  "Houston",
  "Bryce Canyon National Park",
  "Arches National Park",
  "Canyonlands National Park",
  "Acadia National Park",
  "London",
]);

const NATURALIZED_MERCHANT_TAIL_CITIES = new Set([
  "Paris",
  "Barcelona",
  "Rome",
  "Venice",
  "Amsterdam",
  "Dublin",
  "Edinburgh",
  "Mexico City",
  "Cancun",
  "Puerto Vallarta",
  "Cabo San Lucas",
  "Cusco",
  "Lima",
  "Rio de Janeiro",
  "Rio De Janeiro",
  "Tokyo",
  "Kyoto",
  "Bangkok",
  "Singapore",
  "Bali",
  "Seoul",
  "Osaka",
  "Sydney",
  "Cairns",
  "Queenstown",
  "Melbourne",
]);

// Orlando begins before the user-approved line-500 scope. Keep physical lines
// 488-499 byte-stable while naturalizing the rest of the Orlando block.
const MERCHANT_MIDDLE_SCOPE_EXCLUSIONS = new Set([
  "3170P78",
  "331790P2",
  "42054P2",
  "3170P51",
  "42054P4",
  "3170P40",
  "123164P1",
  "120040P3",
  "317042",
  "3170P41",
  "42054P5",
  "3170P32",
]);

export const isEngine6MerchantMiddleNaturalizationTarget = (
  tour: Engine6Tour
) =>
  tour.productCode === "181888P1" ||
  (NATURALIZED_MERCHANT_MIDDLE_CITIES.has(tour.city) &&
    !MERCHANT_MIDDLE_SCOPE_EXCLUSIONS.has(tour.productCode));

export const isEngine6MerchantTailNaturalizationTarget = (tour: Engine6Tour) =>
  isEngine6MerchantMiddleNaturalizationTarget(tour) ||
  NATURALIZED_MERCHANT_TAIL_CITIES.has(tour.city);

const finishSentence = (value: string) =>
  `${value.trim().replace(/[,:;\s-]+$/g, "")}.`;

const removeEditorialLabels = (value: string) =>
  value
    .replace(/\bthe published list\b/gi, "the itinerary")
    .replace(/\bpublished (?:route|circuit)\b/gi, "route")
    .replace(/\bpublished stops\b/gi, "stops")
    .replace(/\bpublished sights\b/gi, "sights")
    .replace(/\bpublished end\b/gi, "tour end")
    .replace(/\bpublished\b\s*/gi, "")
    .replace(/\bthe public page\b/gi, "the itinerary");

const naturalizeSelfServiceClause = (value: string) =>
  value
    .replace(/^coordinating\b/i, "having to coordinate")
    .replace(/\bon their own\b/gi, "yourself")
    .replace(/\bindependently\b/gi, "yourself");

const GLUED_HIGHLIGHT_MARKERS = [
  /\bPrivate tour\b/i,
  /\bFlexibility to\b/i,
  /\bHassle-free\b/i,
  /\bSee the\b/i,
  /\bReceive personalized\b/i,
  /\bA must-do\b/i,
  /\bFamily-friendly\b/i,
  /\bLicensed captain\b/i,
  /\bGet unique\b/i,
  /\bStop by\b/i,
  /\bVisit a\b/i,
  /\bSnorkel (?:amongst|with)\b/i,
  /\bTravel by\b/i,
  /\bBenefit from\b/i,
  /\bStart your\b/i,
  /\bEnjoy hassle-free\b/i,
  /\bMake the most\b/i,
  /\bSnacks and\b/i,
];

const isGluedHighlightSentence = (value: string) =>
  GLUED_HIGHLIGHT_MARKERS.filter(pattern => pattern.test(value)).length >= 2;

const naturalizeSentence = (tour: Engine6Tour, sentence: string) => {
  const normalized = sentence.trim();
  const useExpandedNaturalization =
    isEngine6MerchantMiddleNaturalizationTarget(tour);
  if (!normalized) {
    return "";
  }

  if (
    useExpandedNaturalization &&
    (isGluedHighlightSentence(normalized) ||
      /\b(?:c|wildl|fro|picku|max|no)\.$/i.test(normalized))
  ) {
    return "";
  }

  let match = normalized.match(
    /^Local commentary and route logistics are handled so (?:you|visitors) can focus on (.+)\.$/i
  );
  if (match) {
    return `Your guide handles the route and adds local context, leaving you free to focus on ${match[1]}.`;
  }

  if (!useExpandedNaturalization) {
    match = normalized.match(
      /^Ideal for visitors basing in (.+?) who want (.+) without (.+)\.$/i
    );
    if (match) {
      return `If you're staying in ${match[1]}, this is a straightforward way to enjoy ${match[2]} without ${match[3]}.`;
    }
  }

  if (useExpandedNaturalization) {
    match = normalized.match(
      /^Transportation, equipment, and local commentary are handled so you can focus on (.+)\.$/i
    );
    if (match) {
      return `With transportation, equipment, and local insight taken care of, you can focus on ${match[1]}.`;
    }

    match = normalized.match(
      /^Equipment, safety briefings, and local commentary are handled so you can focus on (.+)\.$/i
    );
    if (match) {
      return `With equipment, safety guidance, and local insight covered, you can focus on ${match[1]}.`;
    }

    if (
      /^Naples\b/i.test(tour.city) &&
      /^See Naples's landmark neighborhoods, including Naples,? on a guided city circuit with strategic photo stops\.$/i.test(
        normalized
      )
    ) {
      if (/\bfishing\b/i.test(tour.title)) {
        return "Fish the waters around Naples, Marco Island, and the Ten Thousand Islands with a local captain guiding the charter.";
      }
      if (/\b(?:hike|Everglades)\b/i.test(tour.title)) {
        return "Travel from Naples into the Everglades for a naturalist-led look at the wetlands, wildlife, and backcountry landscape.";
      }
      if (/\bsunset\b/i.test(tour.title)) {
        return "Cruise the waters around Naples and Marco Island at sunset, when the Gulf Coast takes on its warm evening color.";
      }
      if (/^2 Hour Dolphin, Birding and Shelling Tour/i.test(tour.title)) {
        return "Spend two hours cruising near Naples and Marco Island for dolphin watching, coastal birding, and shelling along the Gulf Coast.";
      }
      if (/Marco Island Dolphin Sightseeing Tour/i.test(tour.title)) {
        return "Cruise the waters around Marco Island on a dedicated dolphin-sightseeing tour through the coastal habitat near Naples.";
      }
      if (/\b(?:shell|dolphin|wildlife)\b/i.test(tour.title)) {
        return "Cruise from Naples toward Marco Island and the Ten Thousand Islands for shelling, wildlife viewing, and time on the Gulf Coast.";
      }
      return "Set out from Naples to explore the bays, islands, and Gulf waters of Southwest Florida.";
    }

    if (
      /^Professional captain or guide, Tour activity as described on Viator, and Safety equipment where applicable are included\.$/i.test(
        normalized
      )
    ) {
      return "Your booking covers the guided activity and the appropriate safety equipment for the selected option.";
    }

    if (/^Naples\b/i.test(tour.city)) {
      match = normalized.match(/^Visit (.+)\.$/i);
      if (match) {
        return `The route includes time at ${match[1]}.`;
      }
    }

    if (
      /^Naples\b/i.test(tour.city) &&
      /^Visit Naples during the 30 minutes stop\.$/i.test(normalized)
    ) {
      return "";
    }

    match = normalized.match(
      /^Ideal for visitors basing ((?:in|on|near) .+?) who want (.+) without (.+)\.$/i
    );
    if (match) {
      return `If you're staying ${match[1]}, this is a straightforward way to enjoy ${match[2]} without ${naturalizeSelfServiceClause(match[3])}.`;
    }

    match = normalized.match(
      /^Ideal for visitors basing ((?:in|on|near) .+?) who want (.+)\.$/i
    );
    if (match) {
      return `If you're staying ${match[1]}, this is a good choice if you want ${naturalizeSelfServiceClause(match[2])}.`;
    }

    match = normalized.match(
      /^Ideal for visitors touring (.+?) who want (.+) without (.+)\.$/i
    );
    if (match) {
      return `If you're visiting ${match[1]}, this is a straightforward way to enjoy ${match[2]} without ${naturalizeSelfServiceClause(match[3])}.`;
    }

    match = normalized.match(
      /^Ideal for visitors touring (.+?) who want (.+)\.$/i
    );
    if (match) {
      return `If you're visiting ${match[1]}, this is a good choice if you want ${naturalizeSelfServiceClause(match[2])}.`;
    }

    match = normalized.match(
      /^Ideal for guests basing ((?:in|on|near) .+?) who want (.+) without (.+)\.$/i
    );
    if (match) {
      return `If you're staying ${match[1]}, this is a straightforward way to enjoy ${match[2]} without ${naturalizeSelfServiceClause(match[3])}.`;
    }

    match = normalized.match(
      /^Ideal for guests basing ((?:in|on|near) .+?) who want (.+)\.$/i
    );
    if (match) {
      return `If you're staying ${match[1]}, this is a good choice if you want ${naturalizeSelfServiceClause(match[2])}.`;
    }

    match = normalized.match(
      /^Ideal for (.+?) guests who want (.+?)(?: without (.+))?\.$/i
    );
    if (match) {
      const without = match[3]
        ? ` without ${naturalizeSelfServiceClause(match[3])}`
        : "";
      return `If you're visiting ${match[1]}, this is a good choice when you want ${match[2]}${without}.`;
    }
  }

  match = normalized.match(
    /^The format suits visitors(?: basing in .+?)? who want (.+) without (.+)\.$/i
  );
  if (match) {
    return `Choose this option if you'd like ${match[1]} without ${match[2]}.`;
  }

  match = normalized.match(/^The format suits (.+)\.$/i);
  if (match) {
    return `This is a good choice for ${match[1]}.`;
  }

  match = normalized.match(/^Ideal for visitors (.+)\.$/i);
  if (match) {
    return `Choose this option if you're ${match[1]}.`;
  }

  match = normalized.match(/^Ideal for (groups|couples|families) (.+)\.$/i);
  if (useExpandedNaturalization && match) {
    return `This works well for ${match[1]} ${match[2]}.`;
  }

  match = normalized.match(
    /^Routes stay oriented to (.+?) that define this (.+?), with a guide handling (.+?) so the day stays focused on (.+?) rather than .+\.$/i
  );
  if (match) {
    return `The route centers on ${match[1]}, while your guide handles ${match[3]} so you can stay focused on ${match[4]}.`;
  }

  match = normalized.match(
    /^Routes stay oriented to (.+?) that define this (.+?), with a guide handling (.+)\.$/i
  );
  if (match) {
    return `The route centers on ${match[1]}, with your guide handling ${match[3]}.`;
  }

  match = normalized.match(/^Routes stay oriented to (.+)\.$/i);
  if (match) {
    return `The route follows ${match[1]}.`;
  }

  match = normalized.match(
    /^(Meeting points|Departures) are confirmed (.+?), and the itinerary (?:stays on|keeps visitors close to) (.+?) that (?:define|shape) this (?:outing|tour|class|ride|charter|experience) rather than .+\.$/i
  );
  if (match) {
    const subject = /^Departures$/i.test(match[1])
      ? "Departure details"
      : "Meeting details";
    return removeEditorialLabels(
      `You'll receive the exact ${subject.toLowerCase()} ${match[2]}, and the experience itself focuses on ${match[3]}.`
    );
  }

  match = normalized.match(
    /^(Meeting points|Departures) are confirmed (.+?), and the itinerary (?:stays on|keeps visitors close to) (.+?)(?: rather than .+)?\.$/i
  );
  if (match) {
    const subject = /^Departures$/i.test(match[1])
      ? "Departure details"
      : "Meeting details";
    return removeEditorialLabels(
      `You'll receive the exact ${subject.toLowerCase()} ${match[2]}, and the experience itself focuses on ${match[3]}.`
    );
  }

  match = normalized.match(/^The published format is (.+?) rather than .+\.$/i);
  if (match) {
    return `This is ${match[1]}.`;
  }

  match = normalized.match(
    /^The published format (.+?)(?: rather than .+)?\.$/i
  );
  if (match) {
    return `The experience ${match[1]}.`;
  }

  match = normalized.match(
    /^The published (route|circuit) (stays in|stays on|is) (.+?) rather than .+\.$/i
  );
  if (match) {
    return finishSentence(`The ${match[1]} ${match[2]} ${match[3]}`);
  }

  match = normalized.match(
    /^The published stops include (.+?) rather than .+\.$/i
  );
  if (match) {
    return `Stops include ${match[1]}.`;
  }

  match = normalized.match(
    /^The published ticket (includes|covers) (.+?) rather than .+\.$/i
  );
  if (match) {
    return `The ticket ${match[1]} ${match[2]}.`;
  }

  match = normalized.match(/^The public page lists (.+?) rather than .+\.$/i);
  if (match) {
    return `The experience includes ${match[1]}.`;
  }

  match = normalized.match(/^The public page notes (.+?) rather than .+\.$/i);
  if (match) {
    return `The itinerary includes ${match[1]}.`;
  }

  match = normalized.match(/^The public page is (.+?) rather than .+\.$/i);
  if (match) {
    return `This is ${match[1]}.`;
  }

  match = normalized.match(/^The outing is (.+?) rather than .+\.$/i);
  if (match) {
    return `This is ${match[1]}.`;
  }

  match = normalized.match(
    /^The return flight is listed over (.+?) rather than .+\.$/i
  );
  if (match) {
    return `The return flight passes over ${match[1]}.`;
  }

  match = normalized.match(
    /^(Meeting points|Departures) are confirmed (.+)\.$/i
  );
  if (match) {
    const subject = /^Departures$/i.test(match[1])
      ? "Departure details"
      : "Meeting details";
    return `You'll receive the exact ${subject.toLowerCase()} ${match[2]}.`;
  }

  match = normalized.match(
    /^The published meeting point is (.+?), with the (?:published )?end (?:at|in) (.+)\.$/i
  );
  if (match) {
    return `Meet at ${match[1]}; the tour finishes at ${match[2]}.`;
  }

  match = normalized.match(/^The published meeting point is (.+)\.$/i);
  if (match) {
    return `Meet at ${match[1]}.`;
  }

  match = normalized.match(/^The published duration is (.+)\.$/i);
  if (match) {
    return `Plan on ${match[1]}.`;
  }

  match = normalized.match(/^The public page describes (.+)\.$/i);
  if (match) {
    return `The itinerary explores ${match[1]}.`;
  }

  match = normalized.match(/^The public page (?:lists|notes) (.+)\.$/i);
  if (match) {
    return `The itinerary includes ${match[1]}.`;
  }

  if (/\srather than\s/i.test(normalized)) {
    return removeEditorialLabels(
      normalized.replace(/\s+rather than\s+.+\.$/i, ".")
    );
  }

  return removeEditorialLabels(normalized);
};

export const naturalizeEngine6CatalogDescription = (
  tour: Engine6Tour,
  value: string
) => {
  if (!isEngine6MerchantTailNaturalizationTarget(tour)) {
    return value;
  }

  const useExpandedNaturalization =
    isEngine6MerchantMiddleNaturalizationTarget(tour);
  let normalizedValue = value
    .replace(/\b(\d+) your\b/gi, "$1 guests")
    .replace(/\btravelers\b/gi, "guests");
  if (useExpandedNaturalization) {
    normalizedValue = normalizedValue
      .replace(/([.!?])(?=[A-Z])/g, "$1 ")
      .replace(/([^.!?])\s+(?=Ideal for\b)/g, "$1. ");
  }

  const sentences = normalizedValue
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)
    .map(sentence => naturalizeSentence(tour, sentence))
    .filter(Boolean);
  if (!useExpandedNaturalization) {
    return sentences.join(" ").replace(/\s+/g, " ").trim();
  }
  const seen = new Set<string>();

  return sentences
    .filter(sentence => {
      const key = sentence.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};
