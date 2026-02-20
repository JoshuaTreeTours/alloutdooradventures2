import { cleanWikiLanguage } from "../cleanWikiLanguage";

type GuideThing = { title: string };

export type AboutFactLabel =
  | "Location"
  | "Population"
  | "Climate"
  | "Known For"
  | "Character / Identity";

export type AboutFactGroup = {
  label: AboutFactLabel;
  text: string;
};

type BuildCityAboutFactsInput = {
  cityName?: string;
  stateName?: string;
  countryName?: string;
  wikiSummaryText?: string;
  wikiExtractText?: string;
  thingsToDo?: GuideThing[];
};

const MIN_WORDS = 60;
const MAX_WORDS = 120;

const sentenceSplit = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const countWords = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length;

const hasPlanningLanguage = (text: string) =>
  /\b(first-time visitors?|anchor area|reduce transit time|pair landmarks?|itinerary|trip planning|over-scheduling)\b/i.test(
    text
  );

const normalizeSentence = (sentence: string) =>
  cleanWikiLanguage(sentence)
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

const pickFirst = (sentences: string[], pattern: RegExp) =>
  sentences.find(sentence => pattern.test(sentence));

const uniqTitles = (thingsToDo?: GuideThing[]) =>
  Array.from(
    new Set((thingsToDo ?? []).map(item => item.title).filter(Boolean))
  );

const trimToTwoSentences = (text: string) =>
  sentenceSplit(text).slice(0, 2).join(" ");

const withinWordBudget = (groups: AboutFactGroup[]) =>
  countWords(groups.map(group => group.text).join(" "));

const buildFallbackLocation = ({
  cityName,
  stateName,
  countryName,
}: BuildCityAboutFactsInput) => {
  if (!cityName) return "Location details are not available.";
  const region = [stateName, countryName].filter(Boolean).join(", ");
  return region
    ? `${cityName} is located in ${region}.`
    : `${cityName} is a named city location.`;
};

const buildFallbackKnownFor = ({
  cityName,
  thingsToDo,
}: BuildCityAboutFactsInput) => {
  const place = cityName ?? "This city";
  const anchors = uniqTitles(thingsToDo).slice(0, 3);
  if (!anchors.length) {
    return `${place} is known for its documented landmarks and public institutions.`;
  }

  return `${place} is known for landmarks such as ${anchors.join(", ")}.`;
};

const buildClimateFromSummary = (wikiSummaryText?: string) => {
  const summarySentences = sentenceSplit(wikiSummaryText ?? "")
    .map(normalizeSentence)
    .filter(Boolean);

  const climateSentence = pickFirst(
    summarySentences,
    /\b(climate|temperature|precipitation|rainfall|snowfall|mediterranean|oceanic|humid|arid|seasonal|wet season|dry season|monsoon)\b/i
  );

  if (!climateSentence) {
    return undefined;
  }

  const typeMatch = climateSentence.match(
    /(mediterranean|oceanic|humid subtropical|subtropical|continental|semi-arid|arid|desert|temperate|marine west coast|tropical)/i
  );
  const seasonalMatch = climateSentence.match(
    /(warm,? dry summers? and mild,? wet winters?|hot summers? and mild winters?|four distinct seasons?|mild winters? and warm summers?|wet and dry seasons?|seasonal rainfall|seasonal temperature variation)/i
  );
  const featureMatch = climateSentence.match(
    /(marine influence|coastal fog|snowfall|heat waves|rainfall concentration|low precipitation|high humidity|ocean moderation|temperature range)/i
  );

  const climateType = typeMatch?.[1] ?? "a documented local climate";
  const seasonalPattern =
    seasonalMatch?.[1] ??
    "with seasonal temperature and precipitation variation";
  const notableFeature =
    featureMatch?.[1] ?? "including notable local weather variation";

  let text = `${climateType.charAt(0).toUpperCase()}${climateType.slice(1)} climate with ${seasonalPattern}; notable feature: ${notableFeature}.`;

  while (countWords(text) > 25) {
    text = text
      .replace(
        "seasonal temperature and precipitation variation",
        "seasonal variation"
      )
      .replace(
        "including notable local weather variation",
        "local weather variation"
      )
      .replace("; notable feature:", ",")
      .replace(/\s+/g, " ")
      .trim();
    if (countWords(text) <= 25) break;
    text = sentenceSplit(text)[0] ?? text;
    if (countWords(text) <= 25) break;
    const words = text.split(/\s+/);
    text = `${words
      .slice(0, 25)
      .join(" ")
      .replace(/[,:;]?$/, "")}.`;
    break;
  }

  if (countWords(text) < 15) {
    text = `${text.replace(/\.$/, "")}, with seasonal variation and a notable local weather feature.`;
  }

  return text;
};

export const buildCityAboutFactGroups = (
  input: BuildCityAboutFactsInput
): AboutFactGroup[] => {
  const sourceText = [input.wikiSummaryText, input.wikiExtractText]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(" ");

  const sentences = sentenceSplit(sourceText)
    .map(normalizeSentence)
    .filter(sentence => sentence.length > 25 && !hasPlanningLanguage(sentence));

  const location =
    pickFirst(
      sentences,
      /\b(located|lies|sits|in|along|on the|at the|region|coast|river|valley|basin|bay|mountain|island)\b/i
    ) ?? buildFallbackLocation(input);

  const population = pickFirst(
    sentences,
    /\b(population|inhabitants|residents|census|metro area|metropolitan)\b/i
  );

  const climate = buildClimateFromSummary(input.wikiSummaryText);

  const knownFor =
    pickFirst(
      sentences,
      /\b(known for|famous for|noted for|landmarks|museum|architecture|industry|arts|culture|port|university|districts?)\b/i
    ) ?? buildFallbackKnownFor(input);

  const character =
    pickFirst(
      sentences,
      /\b(major city|largest|capital|economic|cultural|administrative|regional center|global city|municipality|commune)\b/i
    ) ??
    `${input.cityName ?? "This city"} is a recognized urban municipality in ${input.stateName ?? input.countryName ?? "its region"}.`;

  const groups: AboutFactGroup[] = [
    { label: "Location", text: trimToTwoSentences(location) },
    ...(population
      ? [{ label: "Population" as const, text: trimToTwoSentences(population) }]
      : []),
    ...(climate ? [{ label: "Climate" as const, text: climate }] : []),
    { label: "Known For", text: trimToTwoSentences(knownFor) },
    { label: "Character / Identity", text: trimToTwoSentences(character) },
  ];

  while (groups.length < 4) {
    groups.splice(1, 0, {
      label: "Population",
      text: `${input.cityName ?? "This city"} has population figures reported in published reference records.`,
    });
  }

  const deduped = groups.filter(
    (group, index, all) =>
      all.findIndex(other => other.label === group.label) === index
  );

  while (withinWordBudget(deduped) > MAX_WORDS && deduped.length > 4) {
    const removableIndex = deduped.findIndex(
      group => group.label === "Population"
    );
    if (removableIndex >= 0) {
      deduped.splice(removableIndex, 1);
      continue;
    }
    break;
  }

  if (withinWordBudget(deduped) < MIN_WORDS) {
    const knownForGroup = deduped.find(group => group.label === "Known For");
    if (knownForGroup) {
      knownForGroup.text +=
        " This summary reflects published city references and documented landmarks.";
    }
  }

  if (withinWordBudget(deduped) < MIN_WORDS) {
    const identityGroup = deduped.find(
      group => group.label === "Character / Identity"
    );
    if (identityGroup) {
      identityGroup.text +=
        " It is identified as part of a broader regional urban system.";
    }
  }

  return deduped.slice(0, 5);
};
