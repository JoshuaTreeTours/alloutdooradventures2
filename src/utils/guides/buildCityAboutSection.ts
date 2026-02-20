const BLOCKED_PHRASES = [
  /first-time visitors?/i,
  /build each day/i,
  /anchor area/i,
  /pair landmarks?/i,
  /reduce transit time/i,
  /itinerary/i,
  /plan your day/i,
  /start with/i,
  /\bthen\b/i,
  /before you go/i,
  /day trip/i,
  /half-day/i,
  /you should/i,
  /travelers?/i,
  /plan (?:a|your) (?:trip|visit|day)/i,
];

const SECTION_RULES = {
  overview: { min: 70, max: 110 },
  geography: { min: 50, max: 90 },
  history: { min: 50, max: 90 },
  culture: { min: 50, max: 90 },
  outdoors: { min: 50, max: 90 },
} as const;

export type CityFacts = {
  population?: number;
  areaKm2?: number;
  elevationM?: number;
  latitude?: number;
  longitude?: number;
  inceptionYear?: number;
  locatedIn?: string[];
  waterBodies?: string[];
  mountainRanges?: string[];
  metroArea?: string;
  nickname?: string;
  landmarks?: string[];
};

export type BuildCityAboutSectionInput = {
  cityName: string;
  stateName?: string;
  countryName: string;
  wikiSummaryText?: string;
  wikiExtractText?: string;
  facts?: CityFacts;
};

export type CityAboutSections = {
  overview: string;
  geography: string;
  history: string;
  culture: string;
  outdoors: string;
};

const toWordCount = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length;

const sentenceSplit = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(value => value.trim())
    .filter(
      value =>
        value.length > 35 &&
        !BLOCKED_PHRASES.some(pattern => pattern.test(value))
    );

const cleanSentence = (text: string) => text.replace(/\[[^\]]+\]/g, "").trim();

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const sentenceSimilarity = (a: string, b: string) => {
  const aTokens = new Set(
    normalize(a)
      .split(" ")
      .filter(token => token.length > 3)
  );
  const bTokens = new Set(
    normalize(b)
      .split(" ")
      .filter(token => token.length > 3)
  );
  if (!aTokens.size || !bTokens.size) return 0;
  const overlap = Array.from(aTokens).filter(token =>
    bTokens.has(token)
  ).length;
  return overlap / Math.min(aTokens.size, bTokens.size);
};

const dedupe = (sentences: string[]) => {
  const output: string[] = [];
  for (const sentence of sentences) {
    if (output.some(existing => sentenceSimilarity(existing, sentence) > 0.78))
      continue;
    output.push(sentence);
  }
  return output;
};

const hasNumberSignal = (text: string) => /\b\d{1,4}\b/.test(text);
const hasGeoSignal = (text: string) =>
  /\b(?:river|bay|gulf|ocean|coast|mountain|range|valley|plateau|lake|desert|basin|delta)\b/i.test(
    text
  );
const hasInstitutionSignal = (text: string) =>
  /\b(?:airport|university|port|park|district|museum|stadium|harbor|college|campus|downtown)\b/i.test(
    text
  );
const hasHistorySignal = (text: string) =>
  /\b(?:founded|incorporated|annexed|earthquake|war|exposition|colonial|independence|gold rush|railroad|industrial)\b/i.test(
    text
  );

const factualSignalCount = (text: string) =>
  [
    hasNumberSignal(text),
    hasGeoSignal(text),
    hasInstitutionSignal(text),
    hasHistorySignal(text),
  ].filter(Boolean).length;

const trimToMaxWords = (text: string, maxWords: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return `${words
    .slice(0, maxWords)
    .join(" ")
    .replace(/[,:;]$/, "")}.`;
};

const pickSentences = (
  candidates: string[],
  used: string[],
  maxCount: number
) => {
  const selected: string[] = [];
  for (const candidate of candidates) {
    if (selected.length >= maxCount) break;
    const repeated = [...used, ...selected].some(
      existing => sentenceSimilarity(existing, candidate) > 0.76
    );
    if (repeated) continue;
    selected.push(candidate);
  }
  return selected;
};

const oneDecimal = (value: number) => Math.round(value * 10) / 10;

const conservativeSentences = (
  topic: "overview" | "geography" | "history" | "culture" | "outdoors",
  cityName: string,
  stateName: string | undefined,
  countryName: string,
  facts: CityFacts
) => {
  const place = `${cityName}${stateName ? `, ${stateName}` : ""}, ${countryName}`;
  const landmarkLine = facts.landmarks?.length
    ? `Named landmarks commonly cited for ${cityName} include ${facts.landmarks.slice(0, 3).join(", ")}.`
    : `${cityName} includes identifiable civic districts, public parks, and transport-linked urban corridors.`;

  const bank = {
    overview: [
      `${place} functions as a municipal jurisdiction in the 21st century with documented governance, zoning, and service administration.`,
      landmarkLine,
      `${cityName} also sits within a regional geographic framework that shapes infrastructure, housing patterns, and long-term public investment.`,
    ],
    geography: [
      `${cityName} is part of the wider ${stateName ?? countryName} landscape, where basin, valley, or coastal systems influence settlement form.`,
      `Modern mapping and planning records in the 20th and 21st centuries track municipal boundaries, transport corridors, and environmental risk areas.`,
      landmarkLine,
    ],
    history: [
      `${cityName}'s modern administrative timeline is rooted in 19th- and 20th-century governance changes, including incorporation and municipal restructuring in many U.S. cities.`,
      `Public institutions, district growth, and infrastructure investment created durable historical layers that still shape present-day land use.`,
      landmarkLine,
    ],
    culture: [
      `${cityName}'s civic identity is expressed through district institutions, museums, schools, and community organizations that expanded through the 20th century.`,
      `${landmarkLine} These institutions provide measurable anchors for demographic and cultural continuity across neighborhoods.`,
      `Municipal programming and public spaces reinforce local identity across multiple districts in the 21st century.`,
    ],
    outdoors: [
      `${cityName}'s outdoor context reflects regional climate cycles, watershed conditions, and managed open-space systems documented in modern planning eras.`,
      `Parks and green corridors support ecological resilience and public use through seasonal temperature and precipitation changes across the year.`,
      landmarkLine,
    ],
  } as const;

  return bank[topic];
};

const buildFactLeads = (
  cityName: string,
  stateName: string | undefined,
  countryName: string,
  facts: CityFacts
) => {
  const place = `${cityName}${stateName ? `, ${stateName}` : ""}, ${countryName}`;
  const locationBits = [
    facts.locatedIn?.[0],
    facts.metroArea ? `part of the ${facts.metroArea}` : undefined,
  ].filter(Boolean);

  return {
    overview: `${place} is an incorporated urban center${
      facts.population
        ? ` with a population of about ${facts.population.toLocaleString()}`
        : ""
    }${facts.inceptionYear ? ` and an establishment timeline tied to ${facts.inceptionYear}` : ""}. ${
      locationBits.length
        ? `It is administratively connected to ${locationBits.join(" and ")}.`
        : ""
    }`.trim(),
    geography: `${cityName} is mapped near ${
      typeof facts.latitude === "number" && typeof facts.longitude === "number"
        ? `${oneDecimal(facts.latitude)}° latitude and ${oneDecimal(facts.longitude)}° longitude`
        : "its documented municipal coordinates"
    }${facts.areaKm2 ? `, with an area around ${oneDecimal(facts.areaKm2)} km²` : ""}${
      facts.elevationM
        ? ` and elevation near ${Math.round(facts.elevationM)} meters`
        : ""
    }.`,
    history: `${cityName}'s civic development is tracked through recorded administrative milestones${
      facts.inceptionYear ? ` beginning by ${facts.inceptionYear}` : ""
    }, with later growth tied to regional infrastructure and governance changes.`,
    culture: `${cityName}'s cultural profile reflects local institutions and district-level communities${
      facts.nickname
        ? `, and it is often associated with the nickname "${facts.nickname}"`
        : ""
    }.`,
    outdoors: `${cityName}'s natural setting is shaped by regional climate and hydrology${
      facts.waterBodies?.[0] ? `, including the ${facts.waterBodies[0]}` : ""
    }${facts.mountainRanges?.[0] ? ` and the ${facts.mountainRanges[0]}` : ""}.`,
  };
};

const ensureSection = ({
  sectionText,
  fallbackSentences,
  min,
  max,
  usedSentences,
}: {
  sectionText: string;
  fallbackSentences: string[];
  min: number;
  max: number;
  usedSentences: string[];
}) => {
  let value = trimToMaxWords(sectionText, max).trim();
  let words = toWordCount(value);
  if (words < min) {
    for (const sentence of fallbackSentences) {
      if (value.includes(sentence)) continue;
      const next = trimToMaxWords(`${value} ${sentence}`.trim(), max);
      value = next;
      words = toWordCount(value);
      if (words >= min) break;
    }
  }
  return value;
};

const buildFactualStub = (summarySentences: string[]) => {
  const scored = summarySentences
    .map(sentence => cleanSentence(sentence))
    .filter(sentence => factualSignalCount(sentence) >= 1)
    .slice(0, 2);
  return scored.join(" ");
};

export const buildCityAboutSection = ({
  cityName,
  stateName,
  countryName,
  wikiSummaryText,
  wikiExtractText,
  facts = {},
}: BuildCityAboutSectionInput): CityAboutSections => {
  const summarySentences = dedupe(
    sentenceSplit(wikiSummaryText ?? "").map(cleanSentence)
  );
  const allSentences = dedupe(
    sentenceSplit(`${wikiSummaryText ?? ""} ${wikiExtractText ?? ""}`).map(
      cleanSentence
    )
  );

  const signalRich = allSentences.filter(
    sentence => factualSignalCount(sentence) >= 2
  );
  const byTopic = {
    overview: signalRich,
    geography: signalRich.filter(
      sentence =>
        hasGeoSignal(sentence) ||
        /\b(?:located|coordinates|elevation|area)\b/i.test(sentence)
    ),
    history: signalRich.filter(
      sentence =>
        hasHistorySignal(sentence) ||
        /\b(?:century|founded|incorporated|annexed)\b/i.test(sentence)
    ),
    culture: signalRich.filter(
      sentence =>
        hasInstitutionSignal(sentence) ||
        /\b(?:culture|arts|community|district|demographic|ethnic)\b/i.test(
          sentence
        )
    ),
    outdoors: signalRich.filter(
      sentence =>
        hasGeoSignal(sentence) &&
        /\b(?:park|forest|trail|wildlife|environment|climate|river|mountain|coast)\b/i.test(
          sentence
        )
    ),
  };

  const factLeads = buildFactLeads(cityName, stateName, countryName, facts);
  const used: string[] = [];

  const build = (
    topic: keyof typeof byTopic,
    range: { min: number; max: number }
  ) => {
    const chosen = pickSentences([...byTopic[topic], ...signalRich], used, 2);
    used.push(...chosen);

    const base = [factLeads[topic], ...chosen].filter(Boolean).join(" ").trim();
    const fallbackStub = buildFactualStub(summarySentences);
    const fallbackCandidates = dedupe([
      ...summarySentences.filter(sentence => factualSignalCount(sentence) >= 2),
      ...signalRich,
      ...conservativeSentences(topic, cityName, stateName, countryName, facts),
      ...(fallbackStub ? [fallbackStub] : []),
    ]);

    let section = ensureSection({
      sectionText: base,
      fallbackSentences: fallbackCandidates,
      min: range.min,
      max: range.max,
      usedSentences: used,
    });

    if (factualSignalCount(section) < 2) {
      const stub = fallbackCandidates.find(
        candidate =>
          !used.some(existing => sentenceSimilarity(existing, candidate) > 0.76)
      );
      if (stub) {
        section = ensureSection({
          sectionText: `${factLeads[topic]} ${stub}`.trim(),
          fallbackSentences: conservativeSentences(
            topic,
            cityName,
            stateName,
            countryName,
            facts
          ),
          min: range.min,
          max: range.max,
          usedSentences: used,
        });
      }
    }

    used.push(...sentenceSplit(section));
    return section;
  };

  return {
    overview: build("overview", SECTION_RULES.overview),
    geography: build("geography", SECTION_RULES.geography),
    history: build("history", SECTION_RULES.history),
    culture: build("culture", SECTION_RULES.culture),
    outdoors: build("outdoors", SECTION_RULES.outdoors),
  };
};

export const CITY_ABOUT_BLOCKED_PATTERNS = BLOCKED_PHRASES;
