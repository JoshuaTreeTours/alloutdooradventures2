type AboutSection = {
  heading:
    | "Overview"
    | "Geography & Setting"
    | "History"
    | "Culture & Identity"
    | "Outdoor / Natural Context";
  paragraphs: [string];
};

const SECTION_SPECS = [
  {
    heading: "Overview",
    min: 90,
    max: 120,
    tags: ["history", "economy", "culture", "geography"] as const,
  },
  {
    heading: "Geography & Setting",
    min: 60,
    max: 80,
    tags: ["geography"] as const,
  },
  {
    heading: "History",
    min: 70,
    max: 100,
    tags: ["history", "year"] as const,
  },
  {
    heading: "Culture & Identity",
    min: 70,
    max: 100,
    tags: ["culture", "architecture"] as const,
  },
  {
    heading: "Outdoor / Natural Context",
    min: 50,
    max: 70,
    tags: ["geography", "culture"] as const,
  },
] as const;

const BLOCKED_PHRASES = [
  "first-time visitors",
  "build each day",
  "anchor area",
  "pair landmarks",
  "reduce transit time",
  "nearby experiences",
  "over-scheduling",
  "strong base for",
  "perfect for",
] as const;

const ADVICE_LANGUAGE =
  /\b(itinerary|plan your|best time to visit|must-see|book ahead|day trip|how to get around)\b/i;

const FACT_PATTERNS = {
  year: /\b(1[6-9]\d{2}|20\d{2})\b/,
  geography:
    /\b(river|coast|bay|mountain|valley|basin|harbor|port|desert|plateau|climate|latitude|elevation|watershed|ocean|gulf|plain|delta|lake)\b/i,
  history:
    /\b(founded|established|incorporated|annexed|independence|war|expansion|industrialization|railroad|earthquake|rebuilt|settlement|colonial|century)\b/i,
  demographic: /\b(population|residents|inhabitants|metropolitan|census)\b/i,
  architecture:
    /\b(architecture|architectural|skyline|cathedral|landmark building|modernist|victorian|art deco|historic district)\b/i,
  economy:
    /\b(economy|economic|industry|manufacturing|trade|finance|technology|logistics|shipping|employment|headquarters)\b/i,
  culture:
    /\b(museum|university|arts|music|theater|festival|cuisine|cultural|institution|identity|language|heritage|creative)\b/i,
} as const;

type FactTag = keyof typeof FACT_PATTERNS;
type TaggedSentence = { sentence: string; tags: Set<FactTag> };

const splitSentences = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

const toWords = (text: string) => text.trim().split(/\s+/).filter(Boolean);

const getTags = (sentence: string): Set<FactTag> => {
  const tags = new Set<FactTag>();
  for (const [tag, pattern] of Object.entries(FACT_PATTERNS) as Array<
    [FactTag, RegExp]
  >) {
    if (pattern.test(sentence)) tags.add(tag);
  }
  return tags;
};

const sectionOverlap = (a: string, b: string) => {
  const sentences = (text: string) =>
    text
      .split(/(?<=[.!?])\s+/)
      .map(sentence => sentence.trim().toLowerCase())
      .filter(Boolean);

  const left = sentences(a);
  const right = sentences(b);
  if (!left.length || !right.length) return 0;
  const rightSet = new Set(right);
  const shared = left.filter(sentence => rightSet.has(sentence)).length;
  return shared / Math.min(left.length, right.length);
};

const SECTION_EXTENSIONS = (
  cityName: string,
  stateName: string,
  countryName: string
): Record<AboutSection["heading"], string[]> => ({
  Overview: [
    `${cityName} remains a major institutional and economic center within ${stateName}.`,
    `Its influence across ${countryName} is visible through concentrated infrastructure, labor markets, and public institutions.`,
    `This role connects historical development to contemporary governance, industry, and cultural visibility.`,
  ],
  "Geography & Setting": [
    `${cityName}'s terrain and climate continue to guide infrastructure and land-use decisions.`,
    `Regional topography in ${stateName} shapes long-term environmental planning across the metropolitan area.`,
    `Hydrology, elevation, and seasonal conditions remain persistent constraints in city-scale planning.`,
  ],
  History: [
    `These developments explain how ${cityName} evolved from early settlement structures into a modern urban system.`,
    `Historical transitions in governance and industry continue to influence civic institutions in ${cityName}.`,
    `Successive growth periods linked local change with wider regional and national economic cycles.`,
  ],
  "Culture & Identity": [
    `${cityName}'s identity reflects both established communities and newer creative or professional sectors.`,
    `Major institutions in ${stateName} reinforce the city's reputation for arts, scholarship, and public culture.`,
    `Cultural continuity and adaptation remain visible across neighborhood institutions and civic rituals.`,
  ],
  "Outdoor / Natural Context": [
    `Natural systems around ${cityName} remain central to watershed stewardship and urban resilience policy.`,
    `Seasonal ecological conditions in ${stateName} continue to shape the city's environmental management priorities.`,
    `Regional habitats and open-space networks continue to influence conservation and land-management strategy.`,
  ],
});

const findBlockedPhrase = (text: string) => {
  const lowered = text.toLowerCase();
  return BLOCKED_PHRASES.find(phrase => lowered.includes(phrase));
};

export const assertNoBlockedCityAboutPhrases = (text: string) => {
  const blocked = findBlockedPhrase(text);
  if (blocked) {
    throw new Error(
      `City about section contains blocked phrase: \"${blocked}\"`
    );
  }
};

const hasRequiredFactualContent = (text: string) =>
  Object.values(FACT_PATTERNS).some(pattern => pattern.test(text));

const buildSectionParagraph = (
  tagged: TaggedSentence[],
  used: Set<string>,
  preferred: readonly FactTag[],
  min: number,
  max: number,
  extensions: string[]
): string | null => {
  const selected: string[] = [];

  for (const sentence of tagged) {
    if (used.has(sentence.sentence)) continue;
    if (!preferred.some(tag => sentence.tags.has(tag))) continue;
    selected.push(sentence.sentence);
    used.add(sentence.sentence);
    if (selected.length >= 2 || toWords(selected.join(" ")).length >= min)
      break;
  }

  for (const sentence of tagged) {
    if (selected.length >= 2 || toWords(selected.join(" ")).length >= min) {
      break;
    }
    if (used.has(sentence.sentence)) continue;
    selected.push(sentence.sentence);
    used.add(sentence.sentence);
  }

  if (!selected.length) return null;

  let paragraph = selected.join(" ");
  for (const extension of extensions) {
    if (toWords(paragraph).length >= min) break;
    paragraph = `${paragraph} ${extension}`;
  }

  const words = toWords(paragraph);
  if (words.length > max) {
    paragraph = `${words
      .slice(0, max)
      .join(" ")
      .replace(/[,;:]$/, "")}.`;
  }

  if (toWords(paragraph).length < min) return null;
  return paragraph;
};

type BuildCityAboutSectionArgs = {
  wikiSummaryText: string;
  wikiExtractText?: string;
  cityName: string;
  stateName: string;
  countryName: string;
  debugLog?: (message: string) => void;
};

export const buildCityAboutSection = ({
  wikiSummaryText,
  wikiExtractText,
  cityName,
  stateName,
  countryName,
  debugLog,
}: BuildCityAboutSectionArgs): AboutSection[] | null => {
  if (!wikiExtractText?.trim()) {
    debugLog?.("missing extract");
    return null;
  }

  const combinedSource = `${wikiSummaryText} ${wikiExtractText}`;
  assertNoBlockedCityAboutPhrases(combinedSource);

  const tagged = splitSentences(combinedSource)
    .map(sentence => sentence.replace(/\s+/g, " ").trim())
    .filter(sentence => sentence.length > 30)
    .filter(sentence => !ADVICE_LANGUAGE.test(sentence))
    .map(sentence => ({ sentence, tags: getTags(sentence) }))
    .filter(item => item.tags.size > 0);

  const factualSignalCount = new Set(tagged.flatMap(item => [...item.tags]))
    .size;
  if (factualSignalCount < 3) {
    debugLog?.(`insufficient factual signals:${factualSignalCount}`);
    return null;
  }

  const used = new Set<string>();
  const extensions = SECTION_EXTENSIONS(cityName, stateName, countryName);
  const sections: AboutSection[] = [];

  for (const spec of SECTION_SPECS) {
    const paragraph = buildSectionParagraph(
      tagged,
      used,
      spec.tags,
      spec.min,
      spec.max,
      extensions[spec.heading]
    );

    if (!paragraph || !hasRequiredFactualContent(paragraph)) {
      debugLog?.(`failed section:${spec.heading}`);
      return null;
    }
    assertNoBlockedCityAboutPhrases(paragraph);
    sections.push({ heading: spec.heading, paragraphs: [paragraph] });
  }

  for (let i = 0; i < sections.length; i += 1) {
    for (let j = i + 1; j < sections.length; j += 1) {
      if (
        sectionOverlap(sections[i].paragraphs[0], sections[j].paragraphs[0]) >
        0.55
      ) {
        debugLog?.(
          `similarity fail:${sections[i].heading} vs ${sections[j].heading}`
        );
        return null;
      }
    }
  }

  const allText = sections.map(section => section.paragraphs[0]).join(" ");
  assertNoBlockedCityAboutPhrases(allText);
  if (ADVICE_LANGUAGE.test(allText)) {
    debugLog?.("advice language fail");
    return null;
  }

  return sections;
};
