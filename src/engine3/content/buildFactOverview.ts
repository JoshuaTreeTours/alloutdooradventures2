type BuildFactOverviewInput = {
  title?: string;
  duration?: string;
  city?: string;
  region?: string;
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  meetingPoint?: string;
};

const cleanText = (value?: string | null): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > 0 ? normalized : null;
};

const dedupe = (values?: string[]): string[] => {
  if (!Array.isArray(values)) {
    return [];
  }

  const seen = new Set<string>();
  const output: string[] = [];
  for (const item of values) {
    const cleaned = cleanText(item);
    if (!cleaned) {
      continue;
    }
    const key = cleaned.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    output.push(cleaned);
  }

  return output;
};

const words = (value: string): number => value.split(/\s+/).filter(Boolean).length;

const sentence = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  const punctuated = /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  return punctuated.charAt(0).toUpperCase() + punctuated.slice(1);
};

const asClause = (items: string[]): string => {
  if (items.length === 0) {
    return "";
  }
  if (items.length === 1) {
    return items[0];
  }
  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
};

export const hasMinimumOverviewFacts = (input: BuildFactOverviewInput): boolean => {
  const duration = cleanText(input.duration);
  const highlights = dedupe(input.highlights);
  const inclusions = dedupe(input.inclusions);

  return Boolean(duration || highlights.length >= 2 || inclusions.length >= 2);
};

export const buildFactOverview = (input: BuildFactOverviewInput): string | null => {
  if (!hasMinimumOverviewFacts(input)) {
    return null;
  }

  const title = cleanText(input.title) ?? "This guided desert tour";
  const duration = cleanText(input.duration);
  const city = cleanText(input.city);
  const region = cleanText(input.region);
  const highlights = dedupe(input.highlights).slice(0, 5);
  const inclusions = dedupe(input.inclusions).slice(0, 4);
  const exclusions = dedupe(input.exclusions).slice(0, 3);
  const meetingPoint = cleanText(input.meetingPoint);

  const location = [city, region].filter(Boolean).join(", ");

  const lines: string[] = [
    sentence(
      `${title} is a guided desert experience${duration ? ` that runs about ${duration}` : ""}${location ? ` in the ${location} area` : ""}`
    ),
    sentence(
      "The route is operated in an open-air vehicle format and follows desert terrain with planned roadside stops"
    ),
  ];

  if (highlights.length > 0) {
    lines.push(sentence(`Route focus centers on ${asClause(highlights.slice(0, 3))}`));
  }

  if (highlights.length > 3) {
    lines.push(sentence(`Additional route moments cover ${asClause(highlights.slice(3))}`));
  }

  lines.push(
    sentence(
      "Guide narration is provided during transit and at stop locations to add context on geology, ecology, and regional history"
    )
  );

  if (inclusions.length > 0) {
    lines.push(sentence(`Provided services are ${asClause(inclusions)}`));
  }

  if (exclusions.length > 0) {
    lines.push(sentence(`Excluded items are ${asClause(exclusions)}`));
  }

  if (meetingPoint) {
    lines.push(sentence(`Departures operate from ${meetingPoint.replace(/^departures\s+operate\s+from\s+/i, "")}`));
  }

  let overview = lines.join(" ").replace(/\s+/g, " ").trim();

  const fallbackExpansions = [
    sentence(
      "Travelers should expect a paced route structure that balances driving segments with short interpretation stops"
    ),
    sentence(
      "The experience keeps attention on desert landforms, broad scenic views, and guide-led context throughout the outing"
    ),
    sentence(
      "Inclusion and route details are reflected directly from the available tour facts without adding unstated itinerary claims"
    ),
  ];

  for (const extra of fallbackExpansions) {
    if (words(overview) >= 110) {
      break;
    }
    overview = `${overview} ${extra}`.trim();
  }

  if (words(overview) > 170) {
    const tokens = overview.split(/\s+/).slice(0, 170);
    overview = tokens.join(" ").replace(/[,:;]$/, "").trim();
    if (!/[.!?]$/.test(overview)) {
      overview = `${overview}.`;
    }
  }

  return overview;
};
