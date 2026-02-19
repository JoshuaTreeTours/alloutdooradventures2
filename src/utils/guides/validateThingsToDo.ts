import type { Tier2ThingToDo } from "./buildTier2ThingsToDo";

const FORBIDDEN_TITLE_PATTERNS = [
  /^Downtown\b/i,
  /\blocal neighborhood\b/i,
  /\boutdoor area\b/i,
  /\bguided experience\b/i,
  /\bbook a\b/i,
];

const LANDMARK_TOKEN_PATTERN =
  /\b(Park|Museum|Beach|Bridge|Harbor|Bay|River|Canyon|Trail|Historic District|Zoo|Aquarium|Garden|Gardens|Pier|Boardwalk|Island|Mountain|Lake|Observatory|Cathedral|Market|Old Town|Waterfront|Monument|Falls|Creek|Marina|Square)\b/i;

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const hasTwoCapitalizedWords = (
  title: string,
  cityName: string,
  stateName: string
) => {
  const excluded = new Set(normalize(`${cityName} ${stateName}`).split(" "));
  const words = title.match(/\b[A-Z][a-zA-Z'’.-]*\b/g) ?? [];
  const usable = words.filter(word => !excluded.has(normalize(word)));
  return usable.length >= 2;
};

const firstSixWords = (text: string) =>
  normalize(text)
    .split(" ")
    .filter(Boolean)
    .slice(0, 6)
    .join(" ");

export const validateThingsToDo = (
  items: Tier2ThingToDo[],
  cityName: string,
  stateName: string
): string[] => {
  const failures: string[] = [];
  const openingTracker = new Map<string, string>();

  items.forEach(item => {
    if (FORBIDDEN_TITLE_PATTERNS.some(pattern => pattern.test(item.title))) {
      failures.push(`Forbidden title pattern: ${item.title}`);
    }

    const passesStructure =
      LANDMARK_TOKEN_PATTERN.test(item.title) ||
      hasTwoCapitalizedWords(item.title, cityName, stateName);

    if (!passesStructure) {
      failures.push(`Title is not landmark-like: ${item.title}`);
    }

    const words = item.description.trim().split(/\s+/).filter(Boolean).length;
    if (words > 120) {
      failures.push(`Description too long (${words}) for: ${item.title}`);
    }

    const opening = firstSixWords(item.description);
    if (opening) {
      const previous = openingTracker.get(opening);
      if (previous) {
        failures.push(
          `Duplicate six-word opening between "${previous}" and "${item.title}"`
        );
      } else {
        openingTracker.set(opening, item.title);
      }
    }
  });

  return failures;
};
