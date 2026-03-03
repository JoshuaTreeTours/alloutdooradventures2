type BuildFactOverviewInput = {
  title?: string;
  duration?: string;
  city?: string;
  region?: string;
  highlights?: string[];
  inclusions?: string[];
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

const wordCount = (value: string): number =>
  value.split(/\s+/).filter(Boolean).length;

const toSentence = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const withPeriod = /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  return withPeriod.charAt(0).toUpperCase() + withPeriod.slice(1);
};

export const buildFactOverview = (input: BuildFactOverviewInput): string => {
  const title = cleanText(input.title) ?? "This Viator experience";
  const duration = cleanText(input.duration);
  const city = cleanText(input.city);
  const region = cleanText(input.region);
  const highlights = dedupe(input.highlights).slice(0, 6);
  const inclusions = dedupe(input.inclusions).slice(0, 5);
  const meetingPoint = cleanText(input.meetingPoint);

  const location = [city, region].filter(Boolean).join(", ");

  const sentences: string[] = [
    toSentence(
      `${title} is a guided Viator tour${location ? ` in ${location}` : ""}${duration ? ` with an expected duration of ${duration}` : ""}`
    ),
  ];

  if (highlights.length > 0) {
    sentences.push(
      toSentence(`Published highlights include ${highlights.join("; ")}`)
    );
    sentences.push(
      toSentence(
        "These highlights describe the route focus, the type of terrain covered, and the interpretation provided during the experience"
      )
    );
  }

  if (inclusions.length > 0) {
    sentences.push(
      toSentence(`Inclusions listed for the tour include ${inclusions.join(", ")}`)
    );
    sentences.push(
      toSentence(
        "Inclusion details clarify what is provided as part of the booked product and what guests should expect before departure"
      )
    );
  }

  if (meetingPoint) {
    sentences.push(
      toSentence(`Meeting and pickup information indicates ${meetingPoint}`)
    );
  }

  sentences.push(
    toSentence(
      "This overview is assembled from normalized Viator product fields so the content stays factual, consistent, and aligned with the current product data"
    )
  );

  let paragraph = sentences.join(" ").replace(/\s+/g, " ").trim();

  const expansions = [
    toSentence(
      "The summary intentionally focuses on stated duration, listed highlights, and published inclusions without adding unstated stops, schedules, or pickup claims"
    ),
    duration
      ? toSentence(
          `The duration field indicates ${duration}, so the description is framed around that published timing and the listed experience scope`
        )
      : null,
    highlights.length
      ? toSentence(
          `Highlight language is retained as published, including ${highlights.join(", ")}, so the overview reflects route emphasis and guide-led interpretation already present in source fields`
        )
      : null,
    inclusions.length
      ? toSentence(
          `Inclusion details such as ${inclusions.join(", ")} are included to clarify what is part of the booked product and to avoid assumptions about unlisted services`
        )
      : null,
    meetingPoint
      ? toSentence(
          `Meeting information is limited to the published statement ${meetingPoint} and does not infer additional pickup points or departure schedules`
        )
      : null,
    toSentence(
      "When source fields are brief, the overview remains constrained to available product facts and avoids unsupported claims about landmarks, exact schedules, or unlisted logistics"
    ),
    toSentence(
      "This fact-based fallback is intended to provide enough planning context while preserving data fidelity to the normalized Viator record for the selected product"
    ),
  ].filter((item): item is string => Boolean(item));

  for (const expansion of expansions) {
    if (wordCount(paragraph) >= 100) {
      break;
    }
    paragraph = `${paragraph} ${expansion}`.trim();
  }

  while (wordCount(paragraph) < 100) {
    paragraph = `${paragraph} ${toSentence(
      "Only published fields are used in this fallback summary"
    )}`.trim();
  }

  return paragraph;
};
