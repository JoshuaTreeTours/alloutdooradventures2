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

const normalizeIdentityText = (text: string, cityName?: string) => {
  const place = cityName ?? "This city";
  let normalized = text
    .replace(
      /\b(urban municipality|regional system|administrative structure|recognized city|administrative)\b/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    normalized = `${place} has global significance through major economic activity and cultural institutions.`;
  }

  let words = normalized.split(/\s+/).filter(Boolean);
  if (!/\b(economic|cultural|global)\b/i.test(normalized)) {
    normalized = `${normalized.replace(/\.$/, "")}; economic and cultural influence is substantial.`;
    words = normalized.split(/\s+/).filter(Boolean);
  }

  if (words.length > 20) {
    normalized = `${words
      .slice(0, 20)
      .join(" ")
      .replace(/[,:;]?$/, "")}.`;
    words = normalized.split(/\s+/).filter(Boolean);
  }

  if (words.length < 10) {
    normalized = `${normalized.replace(/\.$/, "")}, with major economic and cultural significance.`;
  }

  return normalized.replace(/\s+/g, " ").trim();
};

const buildFallbackCharacter = ({
  cityName,
  thingsToDo,
}: BuildCityAboutFactsInput) => {
  const place = cityName ?? "This city";
  const anchors = uniqTitles(thingsToDo);
  const hasArt = anchors.some(title =>
    /museum|art|gallery|theater|opera|music|cultural/i.test(title)
  );
  const hasEconomic = anchors.some(title =>
    /port|market|center|district|financial|industry|harbor|terminal/i.test(
      title
    )
  );

  if (hasArt && hasEconomic) {
    return `${place} combines major economic activity with a strong cultural reputation anchored by prominent institutions.`;
  }

  if (hasArt) {
    return `${place} has a strong cultural reputation with globally recognized institutions and landmark districts.`;
  }

  if (hasEconomic) {
    return `${place} holds a significant economic role with globally visible commercial infrastructure.`;
  }

  return `${place} has global significance for economic activity and cultural reputation across landmark districts.`;
};

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
    return `${place} is known for major landmarks and established public institutions.`;
  }

  return `${place} is known for landmarks such as ${anchors.join(", ")}.`;
};

const buildPopulationFromText = (sentences: string[]) => {
  const sentence = pickFirst(
    sentences,
    /\b(population|inhabitants|residents|census|metro area|metropolitan)\b/i
  );
  if (!sentence) return undefined;

  const millionMatch = sentence.match(/(\d+(?:\.\d+)?)\s*(million|billion)/i);
  if (millionMatch) {
    return `~${millionMatch[1]} ${millionMatch[2].toLowerCase()}`;
  }

  const numeric = sentence.match(/\b\d{1,3}(?:,\d{3})+\b|\b\d{5,}\b/);
  if (!numeric) return undefined;

  return `~${numeric[0]}`;
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

  const climateType = typeMatch?.[1]
    ? `${typeMatch[1].charAt(0).toUpperCase()}${typeMatch[1].slice(1)}`
    : "Seasonal";
  const seasonal = seasonalMatch?.[1]
    ?.replace(/and/gi, ",")
    .replace(/\s+/g, " ")
    .trim();

  let phrase = seasonal
    ? `${climateType}; ${seasonal}`
    : `${climateType} climate`;

  const words = phrase.split(/\s+/).filter(Boolean);
  if (words.length > 12) {
    phrase = words
      .slice(0, 12)
      .join(" ")
      .replace(/[,:;]?$/, "");
  }

  return phrase;
};

const withinWordBudget = (groups: AboutFactGroup[]) =>
  countWords(groups.map(group => group.text).join(" "));

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

  const population = buildPopulationFromText(sentences);
  const climate = buildClimateFromSummary(input.wikiSummaryText);

  const knownFor =
    pickFirst(
      sentences,
      /\b(known for|famous for|noted for|landmarks|museum|architecture|industry|arts|culture|port|university|districts?)\b/i
    ) ?? buildFallbackKnownFor(input);

  const characterSource =
    pickFirst(
      sentences,
      /\b(economic|cultural|global|financial|commercial|creative|arts|media|technology|industrial|port city|capital)\b/i
    ) ?? buildFallbackCharacter(input);

  const character = normalizeIdentityText(
    trimToTwoSentences(characterSource),
    input.cityName
  );

  const groups: AboutFactGroup[] = [
    { label: "Location", text: trimToTwoSentences(location) },
    ...(population ? [{ label: "Population" as const, text: population }] : []),
    ...(climate ? [{ label: "Climate" as const, text: climate }] : []),
    { label: "Known For", text: trimToTwoSentences(knownFor) },
    { label: "Character / Identity", text: trimToTwoSentences(character) },
  ];

  const deduped = groups.filter(
    (group, index, all) =>
      all.findIndex(other => other.label === group.label) === index
  );

  while (withinWordBudget(deduped) > MAX_WORDS && deduped.length > 3) {
    const removableIndex = deduped.findIndex(
      group => group.label === "Population" || group.label === "Climate"
    );
    if (removableIndex >= 0) {
      deduped.splice(removableIndex, 1);
      continue;
    }
    break;
  }

  return deduped.slice(0, 5);
};
