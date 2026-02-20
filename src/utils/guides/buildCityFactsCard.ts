import { validateNoBoilerplate } from "./validateNoBoilerplate";

export type CityFactsCard = {
  title: string;
  bullets: Array<{ label: string; value: string }>;
};

type BuildCityFactsCardInput = {
  cityName: string;
  stateName?: string;
  countryName: string;
  wikiSummaryText?: string;
  wikiExtractText?: string;
  thingsToDoItems: Array<{ title: string }>;
};

const cleanText = (text: string) => text.replace(/\s+/g, " ").trim();

const sentenceSplit = (text: string) =>
  cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const dedupeStrings = (items: string[]) =>
  Array.from(new Set(items.map(cleanText).filter(Boolean)));

const geographyAnchorPattern =
  /(on|along|at|near|between|in)\s+(the\s+)?(?:pacific coast|atlantic coast|gulf coast|coast|bay|river|mountains|ocean|peninsula|valley|delta|great lakes|sound|lake\s+[A-Za-z]+)/i;

const climatePattern =
  /(Mediterranean|humid subtropical|humid continental|arid|semi-arid|temperate oceanic|marine west coast|monsoon|alpine|subarctic|desert climate|oceanic climate|coastal fog|mild summers|wet winters|dry summers|hot summers|cold winters)/i;

const identityKeywords = [
  "state capital",
  "capital city",
  "national capital",
  "port city",
  "tech hub",
  "technology hub",
  "financial center",
  "university town",
  "resort city",
  "cultural center",
  "media center",
  "entertainment industry",
  "major seaport",
  "manufacturing center",
  "tourism hub",
  "gateway",
];

const CITY_FACT_OVERRIDES: Record<
  string,
  Partial<Record<"population" | "climate" | "identity", string>>
> = {
  "san francisco": {
    climate: "Mediterranean climate with coastal fog.",
    identity: "San Francisco is a tech and finance hub.",
  },
  "los angeles": {
    climate: "Mediterranean climate with hot, dry summers.",
    identity: "Los Angeles is a global entertainment capital.",
  },
  "new york": {
    climate: "Humid continental climate with hot summers and cold winters.",
    identity: "New York is a global financial center.",
  },
  "new orleans": {
    climate: "Humid subtropical climate with long, warm summers.",
    identity: "New Orleans is a major Gulf Coast port city.",
  },
  portland: {
    climate: "Temperate oceanic climate with wet winters and dry summers.",
    identity: "Portland is a Pacific Northwest cultural and food hub.",
  },
};

const extractPopulation = (text: string) => {
  const sentence = sentenceSplit(text).find(item =>
    /\bpopulation\b|\bcensus\b|\bmost populous\b/i.test(item)
  );
  if (!sentence) return undefined;

  const value = sentence.match(
    /([\d]{2,3}(?:,[\d]{3})+|[\d]+\.?[\d]*\s*(?:million|billion))/i
  )?.[1];

  if (value) return `About ${value}.`;

  const mostPopulous = sentence.match(
    /most populous city in ([A-Za-z\s]+)/i
  )?.[1];
  return mostPopulous
    ? `Largest city in ${cleanText(mostPopulous)}.`
    : undefined;
};

const extractClimate = (text: string) => {
  const sentence = sentenceSplit(text).find(item => climatePattern.test(item));
  if (!sentence) return undefined;
  const matched = sentence.match(climatePattern)?.[1];
  if (!matched) return undefined;

  if (/coastal fog/i.test(sentence) && !/coastal fog/i.test(matched)) {
    return `${matched} climate with coastal fog.`;
  }

  return `${matched} climate.`;
};

const pickKnownFor = (
  thingsToDoItems: Array<{ title: string }>,
  text: string
) => {
  const fromThings = dedupeStrings(
    thingsToDoItems
      .map(item => item.title.replace(/^Explore\s+/i, "").trim())
      .filter(title => title.length > 2)
  ).slice(0, 5);

  if (fromThings.length >= 3) return fromThings;

  const wikiEntities = dedupeStrings(
    text.match(/\b([A-Z][\w'’.-]+(?:\s+[A-Z][\w'’.-]+){1,3})\b/g) ?? []
  ).filter(
    entity =>
      !/^(United States|North America|South America|New York City|Los Angeles|San Francisco|Portland|New Orleans)$/i.test(
        entity
      )
  );

  return dedupeStrings([...fromThings, ...wikiEntities]).slice(0, 5);
};

const extractIdentity = (text: string, cityName: string) => {
  const sentence = sentenceSplit(text).find(item =>
    identityKeywords.some(keyword =>
      new RegExp(`\\b${keyword.replace(/\s+/g, "\\s+")}\\b`, "i").test(item)
    )
  );

  if (!sentence) return undefined;

  const keyword = identityKeywords.find(item =>
    new RegExp(`\\b${item.replace(/\s+/g, "\\s+")}\\b`, "i").test(sentence)
  );
  if (!keyword) return undefined;

  const normalized = keyword
    .replace("technology hub", "tech hub")
    .replace("capital city", "capital")
    .replace("national capital", "capital")
    .replace("state capital", "state capital")
    .replace("tourism hub", "tourism center");

  const identity = `${cityName} is a ${normalized}.`;
  return identity.split(/\s+/).length <= 12 ? identity : undefined;
};

const buildLocation = (
  cityName: string,
  stateName: string | undefined,
  countryName: string,
  text: string
) => {
  const sentence = sentenceSplit(text).find(item =>
    /\b(located|lies|sits|on|along|at|near|between|in)\b/i.test(item)
  );
  const place = stateName ? `${stateName}, ${countryName}` : countryName;

  if (sentence) {
    const anchor = sentence.match(geographyAnchorPattern)?.[0];
    if (anchor) {
      return `${cityName} is in ${place}, ${anchor.toLowerCase()}.`;
    }
  }

  return `${cityName} is in ${place}.`;
};

export const buildCityFactsCard = ({
  cityName,
  stateName,
  countryName,
  wikiSummaryText,
  wikiExtractText,
  thingsToDoItems,
}: BuildCityFactsCardInput): CityFactsCard => {
  const sourceText = cleanText(
    `${wikiSummaryText ?? ""} ${wikiExtractText ?? ""}`
  );

  const bullets: Array<{ label: string; value: string }> = [
    {
      label: "Location",
      value: buildLocation(cityName, stateName, countryName, sourceText),
    },
  ];

  const population = extractPopulation(sourceText);
  if (population) bullets.push({ label: "Population", value: population });

  const climate = extractClimate(sourceText);
  if (climate) bullets.push({ label: "Climate", value: climate });

  const knownFor = pickKnownFor(thingsToDoItems, sourceText);
  if (knownFor.length >= 3) {
    bullets.push({ label: "Known for", value: knownFor.join(", ") });
  }

  const identity = extractIdentity(sourceText, cityName);
  if (identity) bullets.push({ label: "Identity", value: identity });

  const cityOverride = CITY_FACT_OVERRIDES[cityName.toLowerCase()];
  if (
    cityOverride?.population &&
    !bullets.some(bullet => bullet.label === "Population")
  ) {
    bullets.push({ label: "Population", value: cityOverride.population });
  }
  if (
    cityOverride?.climate &&
    !bullets.some(bullet => bullet.label === "Climate")
  ) {
    bullets.push({ label: "Climate", value: cityOverride.climate });
  }
  if (
    cityOverride?.identity &&
    !bullets.some(bullet => bullet.label === "Identity")
  ) {
    bullets.push({ label: "Identity", value: cityOverride.identity });
  }

  const ordered = ["Location", "Population", "Climate", "Known for", "Identity"]
    .map(label => bullets.find(bullet => bullet.label === label))
    .filter((bullet): bullet is { label: string; value: string } =>
      Boolean(bullet)
    );

  const uniqueBullets = ordered.filter(
    (bullet, index, all) =>
      all.findIndex(
        item => item.value.toLowerCase() === bullet.value.toLowerCase()
      ) === index
  );

  const filteredBullets = uniqueBullets.filter(bullet =>
    validateNoBoilerplate(`${bullet.label}: ${bullet.value}`)
  );

  if (filteredBullets.length < 3) {
    console.warn(
      `[buildCityFactsCard] Sparse facts for ${cityName}: ${filteredBullets.length} bullets.`
    );
  }

  return {
    title: `About ${cityName}`,
    bullets: filteredBullets.slice(0, 5),
  };
};
