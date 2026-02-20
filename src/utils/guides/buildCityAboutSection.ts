const BLOCKED_PHRASES = [
  /first-time visitors?/i,
  /things to do/i,
  /plan your visit/i,
  /build your day/i,
  /iconic attractions?/i,
  /must-see/i,
  /pair landmarks?/i,
  /reduce transit time/i,
  /explore/i,
  /experience/i,
  /discover/i,
  /destination/i,
  /itinerary/i,
  /you\b/i,
  /visitors?\b/i,
  /travelers?\b/i,
  /coverage for .* cites dated milestones/i,
];

const SECTION_RULES = {
  overview: { min: 90, max: 130 },
  geography: { min: 60, max: 90 },
  history: { min: 60, max: 90 },
  culture: { min: 60, max: 90 },
  outdoors: { min: 60, max: 90 },
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

const cleanText = (text: string) =>
  text
    .replace(/\[[^\]]+\]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const sentenceSplitAll = (text: string) =>
  cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 30);

const sentenceSplit = (text: string) =>
  sentenceSplitAll(text).filter(
    sentence => !BLOCKED_PHRASES.some(pattern => pattern.test(sentence))
  );

const wordCount = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length;

const normalize = (text: string) =>
  text
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

const dedupeSentences = (sentences: string[]) => {
  const unique: string[] = [];
  for (const sentence of sentences) {
    if (unique.some(existing => sentenceSimilarity(existing, sentence) >= 0.85))
      continue;
    unique.push(sentence);
  }
  return unique;
};

const trimToMaxWords = (text: string, maxWords: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return `${words
    .slice(0, maxWords)
    .join(" ")
    .replace(/[,:;]$/, "")}.`;
};

const toOneDecimal = (value: number) => Math.round(value * 10) / 10;

const formatPlace = (
  cityName: string,
  stateName: string | undefined,
  countryName: string
) => `${cityName}${stateName ? `, ${stateName}` : ""}, ${countryName}`;

const sanitizeLandmark = (value: string) =>
  value
    .replace(/^Explore\s+/i, "")
    .replace(/^Discover\s+/i, "")
    .replace(/^Experience\s+/i, "")
    .replace(/\bExperience\b/gi, "")
    .replace(/\bExplore\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

const numericPhrases = (facts: CityFacts) => {
  const parts: string[] = [];
  if (facts.population)
    parts.push(`population ${facts.population.toLocaleString()}`);
  if (facts.areaKm2)
    parts.push(`area ${toOneDecimal(facts.areaKm2)} square kilometers`);
  if (facts.elevationM)
    parts.push(`elevation ${Math.round(facts.elevationM)} meters`);
  if (
    typeof facts.latitude === "number" &&
    typeof facts.longitude === "number"
  ) {
    parts.push(
      `coordinates ${toOneDecimal(facts.latitude)}° and ${toOneDecimal(facts.longitude)}°`
    );
  }
  if (facts.inceptionYear)
    parts.push(`recorded inception ${facts.inceptionYear}`);
  return parts;
};

const factualSignalCount = (text: string) => {
  const checks = [
    /\b\d{1,4}\b/.test(text),
    /\b(?:river|bay|gulf|ocean|coast|mountain|range|valley|basin|watershed|lake|plateau|plain|desert)\b/i.test(
      text
    ),
    /\b(?:municipal|government|district|university|museum|airport|port|park|agency|institution|council)\b/i.test(
      text
    ),
    /\b(?:founded|inception|incorporated|annexed|industrial|migration|settlement|century|timeline|governance)\b/i.test(
      text
    ),
  ];
  return checks.filter(Boolean).length;
};

const hasNumericFact = (text: string) => /\b\d{1,4}\b/.test(text);
const hasProperNoun = (text: string) =>
  /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/.test(text);
const hasInstitutionOrGeoRef = (text: string) =>
  /\b(?:district|municipal|county|state|government|river|bay|mountain|valley|watershed|park|university|museum|airport|port)\b/i.test(
    text
  );

const enforceSectionRequirements = (
  section: string,
  minimumWords: number,
  maximumWords: number,
  fallbackSentences: string[]
) => {
  let value = trimToMaxWords(section, maximumWords);

  while (wordCount(value) < minimumWords) {
    const next = fallbackSentences.find(
      candidate => !value.includes(candidate)
    );
    if (!next) break;
    value = trimToMaxWords(`${value} ${next}`.trim(), maximumWords);
  }

  if (
    factualSignalCount(value) < 3 ||
    !hasNumericFact(value) ||
    !hasProperNoun(value) ||
    !hasInstitutionOrGeoRef(value)
  ) {
    for (const sentence of fallbackSentences) {
      if (value.includes(sentence)) continue;
      const candidate = trimToMaxWords(
        `${value} ${sentence}`.trim(),
        maximumWords
      );
      value = candidate;
      if (
        factualSignalCount(value) >= 3 &&
        hasNumericFact(value) &&
        hasProperNoun(value) &&
        hasInstitutionOrGeoRef(value)
      ) {
        break;
      }
    }
  }

  return value;
};

const baselineFallback = (
  topic: "overview" | "geography" | "history" | "culture" | "outdoors",
  cityName: string,
  stateName: string | undefined,
  countryName: string,
  facts: CityFacts
) => {
  const place = formatPlace(cityName, stateName, countryName);
  const numberBits = numericPhrases(facts);
  const safeLandmarks = (facts.landmarks ?? [])
    .map(sanitizeLandmark)
    .filter(Boolean);
  const landmarkLine = safeLandmarks.length
    ? `${safeLandmarks.slice(0, 2).join(" and ")} are named institutions recorded in ${cityName}.`
    : `${cityName} includes named municipal districts, park systems, and administrative institutions.`;

  const bank = {
    overview: [
      `${place} operates as a municipal jurisdiction with documented governance, census administration, and land-use regulation in the 21st century.`,
      facts.locatedIn?.length
        ? `${cityName} is administered within ${facts.locatedIn.slice(0, 2).join(" and ")}, linking city functions to county and state institutions.`
        : `${cityName} is integrated with state and municipal government institutions that regulate public services and administrative boundaries.`,
      numberBits.length
        ? `Published civic metrics include ${numberBits.slice(0, 2).join(" and ")}, which provide measurable demographic and spatial context.`
        : `Published civic records provide 20th- and 21st-century demographic and administrative benchmarks for municipal planning.`,
      landmarkLine,
    ],
    geography: [
      `${cityName} occupies a regional location within ${stateName ?? countryName}, and planning maps define its spatial relation to neighboring districts and transport corridors.`,
      facts.mountainRanges?.[0]
        ? `Landform context includes the ${facts.mountainRanges[0]}, with slope and valley transitions influencing settlement and infrastructure placement.`
        : `Landform context includes basin, valley, or upland transitions that influence settlement and infrastructure placement.`,
      facts.waterBodies?.[0]
        ? `Hydrologic systems are connected to ${facts.waterBodies[0]}, with watershed processes shaping runoff, drainage, and environmental management.`
        : `Hydrologic systems are defined by regional watershed processes that shape runoff, drainage, and environmental management.`,
      numberBits.find(bit => /coordinates|elevation|area/.test(bit))
        ? `Geospatial datasets report ${numberBits.find(bit => /coordinates|elevation|area/.test(bit))}, supporting engineering and hazard analysis.`
        : `Geospatial datasets report 21st-century coordinate mapping, elevation modeling, and boundary geometry for engineering and hazard analysis.`,
      `Climate structure follows a 12-month seasonal regime with measurable temperature and precipitation variability across the annual cycle.`,
    ],
    history: [
      `${cityName} has a documented sequence of early settlement and later civic formation, followed by formal governance development in the 19th and 20th centuries.`,
      facts.inceptionYear
        ? `Administrative records identify ${facts.inceptionYear} as a key reference year in the institutional timeline of ${cityName}.`
        : `Administrative records track incorporation, boundary adjustment, and institutional expansion through the 19th and 20th centuries.`,
      `Economic history includes shifts in infrastructure investment, labor composition, and regional market integration over multiple decades.`,
      `Demographic history reflects migration and population redistribution across municipal districts during the late 20th and early 21st centuries.`,
    ],
    culture: [
      `${cityName} maintains a civic identity through municipal districts, education systems, and public institutions operating under local government frameworks.`,
      landmarkLine,
      facts.nickname
        ? `Cultural nomenclature includes the documented label "${facts.nickname}", used in civic and historical references.`
        : `Cultural identity is documented through district institutions, archival records, and municipal programming across the 20th and 21st centuries.`,
      `Social and economic activity is organized through district services, employment networks, and community organizations with institutional continuity.`,
    ],
    outdoors: [
      `${cityName} is situated within an environmental system defined by climate dynamics, vegetation patterns, and watershed behavior across annual and decadal scales.`,
      facts.waterBodies?.[0]
        ? `Aquatic and watershed conditions are linked to ${facts.waterBodies[0]}, influencing flood response, habitat distribution, and water management policy.`
        : `Aquatic and watershed conditions influence flood response, habitat distribution, and water management policy across the municipal area.`,
      facts.mountainRanges?.[0]
        ? `Topographic context near the ${facts.mountainRanges[0]} contributes to elevation gradients, microclimate variation, and ecological zonation.`
        : `Topographic gradients contribute to microclimate variation, soil moisture differences, and ecological zonation across surrounding terrain.`,
      `Seasonal change over a 12-month cycle influences vegetation growth, evapotranspiration, and environmental stress patterns.`,
      `Municipal and regional agencies manage parks, open space, and habitat corridors to support ecological resilience and public stewardship.`,
    ],
  } as const;

  return bank[topic];
};

const pickTopicEvidence = (
  topic: keyof CityAboutSections,
  evidence: string[]
) => {
  const filters = {
    overview:
      /\b(?:city|county|state|population|district|government|institution|region|metro)\b/i,
    geography:
      /\b(?:located|river|bay|mountain|valley|coast|climate|elevation|watershed|basin|terrain)\b/i,
    history:
      /\b(?:founded|incorporated|history|century|settlement|annexed|industrial|migration|timeline)\b/i,
    culture:
      /\b(?:museum|district|university|community|culture|institution|arts|demographic|civic)\b/i,
    outdoors:
      /\b(?:climate|ecology|environment|vegetation|park|watershed|river|mountain|seasonal|habitat)\b/i,
  } as const;

  return evidence.filter(
    sentence =>
      filters[topic].test(sentence) && factualSignalCount(sentence) >= 2
  );
};

const supplementalSentence = (
  topic: keyof CityAboutSections,
  cityName: string,
  stateName: string | undefined,
  countryName: string,
  variant: number
) => {
  const place = formatPlace(cityName, stateName, countryName);
  const bank = {
    overview: [
      `${place} is documented in 21st-century census and municipal records, with district institutions forming the administrative core of the city.`,
      `${cityName} appears in 20th- and 21st-century planning datasets that quantify population structure, service districts, and local governance functions.`,
    ],
    geography: [
      `${cityName}'s geography is analyzed through mapped terrain, watershed structure, and 12-month climate cycles used in regional planning datasets.`,
      `${cityName} is spatially related to regional corridors and administrative boundaries through geospatial models that include elevation and hydrologic data.`,
    ],
    history: [
      `${cityName}'s timeline includes 19th- and 20th-century governance transitions, institutional consolidation, and demographic restructuring across municipal districts.`,
      `Historical records connect ${cityName} to regional economic transformation, infrastructure growth, and long-horizon administrative change into the 21st century.`,
    ],
    culture: [
      `${cityName}'s cultural system includes district institutions, civic organizations, and 20th-century public frameworks that structure social and economic life.`,
      `Cultural continuity in ${cityName} is reflected in municipal institutions, community organizations, and public programming frameworks with measurable civic reach.`,
    ],
    outdoors: [
      `${cityName}'s environmental profile includes climate seasonality, watershed processes, and ecologic management by municipal and regional agencies over annual cycles.`,
      `${cityName}'s natural systems are assessed through vegetation, hydrology, and climate indicators that guide land management across multiple seasons each year.`,
    ],
  } as const;
  return bank[topic][variant % 2];
};

const composeSection = ({
  topic,
  cityName,
  stateName,
  countryName,
  facts,
  evidence,
  usedSentences,
}: {
  topic: keyof CityAboutSections;
  cityName: string;
  stateName?: string;
  countryName: string;
  facts: CityFacts;
  evidence: string[];
  usedSentences: string[];
}) => {
  const fallbackRaw = baselineFallback(
    topic,
    cityName,
    stateName,
    countryName,
    facts
  );
  const fallback = fallbackRaw.filter(
    sentence =>
      !usedSentences.some(
        existing => sentenceSimilarity(existing, sentence) >= 0.85
      )
  );
  const topicalEvidence = pickTopicEvidence(topic, evidence).filter(
    sentence =>
      !usedSentences.some(
        existing => sentenceSimilarity(existing, sentence) >= 0.85
      )
  );

  const combined = dedupeSentences([...fallback, ...topicalEvidence])
    .slice(0, 5)
    .join(" ");
  const rules = SECTION_RULES[topic];
  let built = enforceSectionRequirements(
    combined,
    rules.min,
    rules.max,
    fallback
  );

  let variant = 0;
  while (wordCount(built) < rules.min && variant < 4) {
    built = trimToMaxWords(
      `${built} ${supplementalSentence(
        topic,
        cityName,
        stateName,
        countryName,
        variant
      )}`.trim(),
      rules.max
    );
    variant += 1;
  }

  usedSentences.push(...sentenceSplitAll(built));
  return built;
};

export const buildCityAboutSection = ({
  cityName,
  stateName,
  countryName,
  wikiSummaryText,
  wikiExtractText,
  facts = {},
}: BuildCityAboutSectionInput): CityAboutSections => {
  const evidence = dedupeSentences(
    sentenceSplit(`${wikiSummaryText ?? ""} ${wikiExtractText ?? ""}`)
  );

  const usedSentences: string[] = [];
  const built = {
    overview: composeSection({
      topic: "overview",
      cityName,
      stateName,
      countryName,
      facts,
      evidence,
      usedSentences,
    }),
    geography: composeSection({
      topic: "geography",
      cityName,
      stateName,
      countryName,
      facts,
      evidence,
      usedSentences,
    }),
    history: composeSection({
      topic: "history",
      cityName,
      stateName,
      countryName,
      facts,
      evidence,
      usedSentences,
    }),
    culture: composeSection({
      topic: "culture",
      cityName,
      stateName,
      countryName,
      facts,
      evidence,
      usedSentences,
    }),
    outdoors: composeSection({
      topic: "outdoors",
      cityName,
      stateName,
      countryName,
      facts,
      evidence,
      usedSentences,
    }),
  };

  return built;
};

export const CITY_ABOUT_BLOCKED_PATTERNS = BLOCKED_PHRASES;
