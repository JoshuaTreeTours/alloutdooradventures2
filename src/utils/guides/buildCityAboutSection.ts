const SECTION_SPECS = [
  { heading: "Overview", min: 90, max: 120 },
  { heading: "Geography & Setting", min: 60, max: 80 },
  { heading: "History", min: 70, max: 100 },
  { heading: "Culture & Identity", min: 70, max: 100 },
  { heading: "Outdoor / Natural Context", min: 50, max: 70 },
] as const;

const BLOCKED_PHRASES = [
  "first-time visitors",
  "anchor area",
  "pair landmarks",
  "reduce transit time",
] as const;

const toWords = (text: string) => text.trim().split(/\s+/).filter(Boolean);

const splitSentences = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const normalizeSentence = (sentence: string) =>
  sentence
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

const withWordRange = (
  text: string,
  min: number,
  max: number,
  extensionSentence: string
) => {
  let composed = text;
  while (toWords(composed).length < min) {
    composed = `${composed} ${extensionSentence}`.trim();
    if (toWords(composed).length > max + 20) break;
  }

  const words = toWords(composed);
  if (words.length <= max) return composed;
  return `${words
    .slice(0, max)
    .join(" ")
    .replace(/[,;:]$/, "")}.`;
};

const pickEvidence = (
  sentences: string[],
  used: Set<string>,
  pattern: RegExp
): string => {
  const match = sentences.find(
    sentence => !used.has(sentence) && pattern.test(sentence)
  );
  if (match) {
    used.add(match);
    return normalizeSentence(match);
  }

  const fallback = sentences.find(sentence => !used.has(sentence));
  if (!fallback) return "";
  used.add(fallback);
  return normalizeSentence(fallback);
};

export const assertNoBlockedCityAboutPhrases = (text: string) => {
  const lowered = text.toLowerCase();
  const blocked = BLOCKED_PHRASES.find(phrase => lowered.includes(phrase));
  if (blocked) {
    throw new Error(
      `City about section contains blocked phrase: \"${blocked}\"`
    );
  }
};

type BuildCityAboutSectionArgs = {
  wikiSummaryText: string;
  wikiExtractText?: string;
  cityName: string;
  stateName: string;
  countryName: string;
};

export const buildCityAboutSection = ({
  wikiSummaryText,
  wikiExtractText,
  cityName,
  stateName,
  countryName,
}: BuildCityAboutSectionArgs) => {
  const sourceText = `${wikiSummaryText} ${wikiExtractText ?? ""}`;
  const sentences = splitSentences(sourceText).filter(
    sentence => !/\btravel|itinerary|tourists?|visit(?:or)?s?\b/i.test(sentence)
  );
  const used = new Set<string>();

  const geographyEvidence = pickEvidence(
    sentences,
    used,
    /river|coast|bay|mountain|valley|plain|plateau|desert|elevation|climate|region|located|watershed/i
  );
  const historyEvidence = pickEvidence(
    sentences,
    used,
    /founded|established|incorporated|settled|century|industrial|rail|port|boom|migration|war/i
  );
  const cultureEvidence = pickEvidence(
    sentences,
    used,
    /culture|arts|music|museum|architecture|festival|community|cuisine|identity|district/i
  );
  const economyEvidence = pickEvidence(
    sentences,
    used,
    /economy|industry|manufacturing|finance|technology|government|trade|logistics|university|energy/i
  );
  const natureEvidence = pickEvidence(
    sentences,
    used,
    /park|forest|wetland|coastline|riverfront|shoreline|wildlife|habitat|ecology|seasonal|rainfall/i
  );

  const sectionDrafts = [
    `${cityName}, ${stateName} is a historically significant city in ${countryName}, shaped by early settlement and later economic expansion. It holds regional importance through its institutions, labor base, and civic influence, and it is known for a recognizable urban identity tied to industry, governance, and public culture. ${historyEvidence} ${economyEvidence}`,
    `${cityName} is positioned within ${stateName} as part of a landscape defined by terrain, water systems, and regional climate patterns. Its physical setting influences land use, neighborhood distribution, and long-term infrastructure decisions across the metropolitan area. ${geographyEvidence}`,
    `The city developed from an initial settlement phase into larger periods of growth connected to transport networks, commerce, and demographic change. Over time, political shifts and economic restructuring altered its built environment and social composition while preserving key historical markers. ${historyEvidence}`,
    `${cityName} has a cultural profile shaped by arts institutions, neighborhood traditions, and a civic reputation built through foodways, design, and local enterprise. Its identity reflects both long-standing communities and newer creative sectors that continue to redefine the city’s social character. ${cultureEvidence}`,
    `The regional environment around ${cityName} includes natural systems that frame urban life and seasonal change. Nearby water, vegetation, and open landscapes remain central to ecological management, recreation patterns, and the broader way the city is understood within ${stateName}. ${natureEvidence}`,
  ] as const;

  const extensions = [
    `${cityName} continues to function as a reference point for regional development across ${stateName}.`,
    `Its geography remains central to planning decisions and environmental analysis in ${countryName}.`,
    `These phases of change explain the city’s contemporary economic and civic structure.`,
    `The result is a civic identity that is both historically rooted and actively evolving.`,
    `These natural features influence ecological policy and public life throughout the city.`,
  ] as const;

  const sections = SECTION_SPECS.map((spec, index) => {
    const paragraph = withWordRange(
      sectionDrafts[index],
      spec.min,
      spec.max,
      extensions[index]
    );
    assertNoBlockedCityAboutPhrases(paragraph);
    return { heading: spec.heading, paragraphs: [paragraph] };
  });

  assertNoBlockedCityAboutPhrases(
    sections.map(section => section.paragraphs.join(" ")).join(" ")
  );

  return sections;
};
