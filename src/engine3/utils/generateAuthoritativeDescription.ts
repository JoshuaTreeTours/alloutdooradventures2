const stripHtml = (value: string): string =>
  value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ");

const normalizeText = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const cleaned = stripHtml(value)
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();

  return cleaned.length > 0 ? cleaned : undefined;
};

const dedupe = (values?: string[]): string[] => {
  if (!values?.length) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleaned = normalizeText(value);
    if (!cleaned) {
      continue;
    }

    const key = cleaned.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(cleaned);
  }

  return result;
};

const joinList = (items: string[]): string | undefined => {
  if (items.length === 0) {
    return undefined;
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
};

const toSentence = (text: string): string =>
  text.endsWith(".") ? text : `${text}.`;

const wordCount = (value: string): number =>
  value.split(/\s+/).filter(Boolean).length;

const trimToLimit = (input: string, maxWords: number): string => {
  const sentences = input.match(/[^.!?]+[.!?]?/g) ?? [input];
  const kept: string[] = [];

  for (const sentence of sentences) {
    const candidate = [...kept, sentence.trim()].join(" ").trim();
    if (!candidate) {
      continue;
    }

    if (wordCount(candidate) <= maxWords) {
      kept.push(sentence.trim());
    } else {
      break;
    }
  }

  const sentenceBounded = kept.join(" ").trim();
  if (sentenceBounded && wordCount(sentenceBounded) <= maxWords) {
    return sentenceBounded;
  }

  const words = input.split(/\s+/).filter(Boolean).slice(0, maxWords);
  return `${words.join(" ").replace(/[.!?]*$/, "")}.`;
};

export function generateAuthoritativeDescription(input: {
  title: string;
  city?: string;
  state?: string;
  country?: string;
  durationText?: string;
  highlights?: string[];
  itineraryTitles?: string[];
  inclusions?: string[];
  groupSizeText?: string;
  meetingPointText?: string;
  operatorName?: string;
}): string {
  const title = normalizeText(input.title) ?? "This tour";
  const city = normalizeText(input.city);
  const state = normalizeText(input.state);
  const country = normalizeText(input.country);
  const duration = normalizeText(input.durationText);
  const location = [city, state ?? country].filter(Boolean).join(", ");

  const sentences: string[] = [];

  const intro = [
    title,
    location ? `takes place in ${location}` : undefined,
    duration ? `with a duration of ${duration}` : undefined,
  ]
    .filter(Boolean)
    .join(" ");
  sentences.push(toSentence(intro));

  const itineraryItems = dedupe(input.itineraryTitles).slice(0, 3);
  const highlightItems = dedupe(input.highlights).slice(0, 3);
  const keyItems = (
    itineraryItems.length > 0 ? itineraryItems : highlightItems
  ).slice(0, 3);

  const keyItemsText = joinList(keyItems);
  if (keyItemsText) {
    sentences.push(
      toSentence(
        `The experience includes stops and activities such as ${keyItemsText}`
      )
    );
  }

  const logisticsBits = [
    normalizeText(input.groupSizeText),
    normalizeText(input.meetingPointText),
    joinList(dedupe(input.inclusions).slice(0, 2)),
  ].filter((item): item is string => Boolean(item));

  if (logisticsBits.length > 0) {
    sentences.push(
      toSentence(
        `Logistics information provided by Viator includes ${joinList(logisticsBits)} `
      )
    );
  }

  let description = sentences.join(" ").replace(/\s+\./g, ".").trim();

  if (wordCount(description) < 90) {
    const remainingDetails = [
      joinList(dedupe(input.highlights).slice(3, 6)),
      joinList(dedupe(input.itineraryTitles).slice(3, 6)),
      normalizeText(input.operatorName)
        ? `The listed operator for this product is ${normalizeText(input.operatorName)}`
        : undefined,
      duration
        ? `Viator lists the activity duration as ${duration}`
        : undefined,
    ].filter((item): item is string => Boolean(item));

    if (remainingDetails.length > 0) {
      description = `${description} ${toSentence(
        `Additional published details include ${remainingDetails.join("; ")}`
      )}`.trim();
    }
  }

  if (wordCount(description) < 90) {
    const catalogFields = [
      joinList(dedupe(input.highlights).slice(0, 6)),
      joinList(dedupe(input.itineraryTitles).slice(0, 6)),
      joinList(dedupe(input.inclusions).slice(0, 4)),
      normalizeText(input.meetingPointText),
    ].filter((item): item is string => Boolean(item));

    if (catalogFields.length > 0) {
      description = `${description} ${toSentence(
        `Published Viator details for this listing include ${catalogFields.join("; ")}`
      )}`.trim();
    }
  }

  if (wordCount(description) > 130) {
    description = trimToLimit(description, 130);
  }

  return description;
}
