import type { Engine6Tour } from "./types";

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

// This Paris row is physical line 799 in merchantFeed.csv and is intentionally
// outside the user-approved line-800-to-end editorial scope.
const MERCHANT_TAIL_SCOPE_EXCLUSIONS = new Set(["181888P1"]);

export const isEngine6MerchantTailNaturalizationTarget = (tour: Engine6Tour) =>
  NATURALIZED_MERCHANT_TAIL_CITIES.has(tour.city) &&
  !MERCHANT_TAIL_SCOPE_EXCLUSIONS.has(tour.productCode);

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

const naturalizeSentence = (sentence: string) => {
  const normalized = sentence.trim();
  if (!normalized) {
    return "";
  }

  let match = normalized.match(
    /^Local commentary and route logistics are handled so (?:you|visitors) can focus on (.+)\.$/i
  );
  if (match) {
    return `Your guide handles the route and adds local context, leaving you free to focus on ${match[1]}.`;
  }

  match = normalized.match(
    /^Ideal for visitors basing in (.+?) who want (.+) without (.+)\.$/i
  );
  if (match) {
    return `If you're staying in ${match[1]}, this is a straightforward way to enjoy ${match[2]} without ${match[3]}.`;
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

  return value
    .replace(/\b(\d+) your\b/gi, "$1 guests")
    .replace(/\btravelers\b/gi, "guests")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)
    .map(naturalizeSentence)
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};
