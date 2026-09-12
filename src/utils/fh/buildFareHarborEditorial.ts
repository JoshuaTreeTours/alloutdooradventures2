export type FareHarborEditorialInput = {
  key: string;
  title: string;
  city: string;
  region: string;
  country?: string;
  operator?: string;
  type?: "tour" | "rental";
  activity?: string;
  description?: string;
  headline?: string;
  supplemental?: Record<string, string>;
  sourceStatus?: number | null;
  sourceEndpoint?: string | null;
  sourceHash?: string | null;
};

export type FareHarborEditorialEntry = {
  title: string;
  city: string;
  region: string;
  overview: string;
  highlights: string[];
  metaDescription: string;
  sourceBacked: boolean;
  sourceDescriptionLength: number;
  sourceFields: string[];
  sourceStatus: number | null;
  sourceEndpoint: string | null;
  sourceHash: string | null;
};

const clean = (value?: string) =>
  (value ?? "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, ". ")
    .replace(/<\/p>/gi, ". ")
    .replace(/<\/li>/gi, ". ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\[[^\]]+\]\([^)]*\)/g, match => match.replace(/^\[|\]\([^)]*\)$/g, ""))
    .replace(/[*_#>`~]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const sentenceCase = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const stableIndex = (key: string, modulo: number) => {
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }
  return modulo > 0 ? hash % modulo : 0;
};

const unique = (items: string[]) =>
  Array.from(new Set(items.map(item => clean(item)).filter(Boolean)));

const withArticle = (label: string) => {
  const normalized = label.trim();
  if (!normalized) return "outdoor experience";
  if (/^[aeiou]/i.test(normalized)) return `an ${normalized}`;
  return `a ${normalized}`;
};

const inferActivity = (input: FareHarborEditorialInput, sourceText: string) => {
  if (input.type === "rental" || /\brental\b/i.test(input.title)) return "equipment rental";

  const combined = `${input.title} ${input.activity ?? ""} ${sourceText}`.toLowerCase();
  const activityMatchers: Array<[RegExp, string]> = [
    [/\b(raft|rafting|whitewater)\b/, "rafting trip"],
    [/\b(kayak|kayaking)\b/, "kayaking outing"],
    [/\b(canoe|canoeing)\b/, "canoeing outing"],
    [/\b(snorkel|snorkeling)\b/, "snorkeling excursion"],
    [/\b(scuba|dive|diving)\b/, "diving excursion"],
    [/\b(sail|sailing|catamaran|yacht)\b/, "sailing outing"],
    [/\b(whale|dolphin|wildlife|eco tour)\b/, "wildlife outing"],
    [/\b(hike|hiking|trek|walking tour|walk)\b/, "walking and hiking experience"],
    [/\b(bike|biking|cycling|e-bike|ebike)\b/, "cycling experience"],
    [/\b(zipline|zip line)\b/, "zipline experience"],
    [/\b(balloon|hot air)\b/, "hot-air balloon flight"],
    [/\b(jeep|4x4|off-road|off road)\b/, "guided vehicle tour"],
    [/\b(segway)\b/, "Segway tour"],
    [/\b(food|culinary|tasting|brewery|wine|cocktail)\b/, "food and drink experience"],
    [/\b(history|historic|heritage|museum|architecture)\b/, "history-focused tour"],
    [/\b(photo|photography)\b/, "photography experience"],
    [/\b(fishing|angling)\b/, "fishing trip"],
    [/\b(surf|surfing)\b/, "surfing experience"],
    [/\b(horse|horseback|equestrian)\b/, "horseback riding experience"],
  ];

  return activityMatchers.find(([pattern]) => pattern.test(combined))?.[1] ??
    clean(input.activity) ||
    "local tour";
};

const inferThemes = (sourceText: string) => {
  const themes: Array<[RegExp, string]> = [
    [/\bgeolog|fault|tectonic|rock formation|volcan/i, "geology"],
    [/\bhistor|heritage|architecture|landmark|museum/i, "local history"],
    [/\bwildlife|whale|dolphin|bird|seal|turtle|bear|moose|elk/i, "wildlife"],
    [/\bwaterfall|river|lake|ocean|coast|shore|bay|harbor|reef/i, "water and shoreline scenery"],
    [/\bmountain|canyon|valley|glacier|desert|forest|rainforest/i, "landscape"],
    [/\bsunset|sunrise|golden hour/i, "changing light"],
    [/\bfood|culinary|restaurant|tasting|brewery|wine|cocktail/i, "local food and drink"],
    [/\bculture|cultural|tradition|indigenous|native/i, "local culture"],
  ];
  return themes.filter(([pattern]) => pattern.test(sourceText)).map(([, label]) => label).slice(0, 3);
};

const inferDuration = (sourceText: string) => {
  const patterns = [
    /\b(\d+(?:\.\d+)?)\s*(hours?|hrs?|hr)\b/i,
    /\b(\d+)\s*(minutes?|mins?|min)\b/i,
    /\b(\d+)\s*(days?|day)\b/i,
    /\bhalf[- ]day\b/i,
    /\bfull[- ]day\b/i,
  ];
  for (const pattern of patterns) {
    const match = sourceText.match(pattern);
    if (!match) continue;
    if (/half[- ]day/i.test(match[0])) return "a half-day format";
    if (/full[- ]day/i.test(match[0])) return "a full-day format";
    return `about ${match[0].replace(/hrs?/i, "hours").replace(/mins?/i, "minutes")}`;
  }
  return "";
};

const inferNamedPlaces = (sourceText: string, city: string, region: string) => {
  const suffix = "(?:National\\s+Park|State\\s+Park|Park|River|Lake|Bay|Harbor|Harbour|Beach|Canyon|Glacier|Mountain|Mount|Valley|Falls|Island|Trail|District|Museum|Monument|Reserve|Preserve|Forest|Reef|Creek|Route\\s+66|Old\\s+Town|Downtown)";
  const pattern = new RegExp(`\\b(?:[A-Z][A-Za-z'’.-]+(?:\\s+|$)){0,5}${suffix}\\b`, "g");
  const matches = sourceText.match(pattern) ?? [];
  const blocked = new Set([city.toLowerCase(), region.toLowerCase()]);
  return unique(matches)
    .filter(place => place.length <= 70)
    .filter(place => !blocked.has(place.toLowerCase()))
    .slice(0, 4);
};

const inferInclusions = (sourceText: string) => {
  const inclusions: Array<[RegExp, string]> = [
    [/\b(local |professional |experienced )?guide\b/i, "guide support"],
    [/\bhelmet(s)?\b/i, "helmet"],
    [/\blife\s*(jacket|vest)s?\b|\bpfd\b/i, "flotation gear"],
    [/\bpaddle(s)?\b/i, "paddling equipment"],
    [/\blunch\b/i, "lunch"],
    [/\bsnack(s)?\b/i, "snacks"],
    [/\bwater\b/i, "water"],
    [/\btransportation|transport|shuttle|hotel pickup|pick[- ]?up\b/i, "transportation"],
    [/\bsafety (gear|equipment)\b/i, "safety equipment"],
  ];
  return unique(inclusions.filter(([pattern]) => pattern.test(sourceText)).map(([, label]) => label)).slice(0, 4);
};

const inferPreparation = (sourceText: string) => {
  const prep: Array<[RegExp, string]> = [
    [/\bsunscreen\b/i, "sunscreen"],
    [/\bwater bottle|bring water|drinking water\b/i, "water"],
    [/\bclosed[- ]toe|sturdy shoes|walking shoes|hiking shoes\b/i, "suitable footwear"],
    [/\blayer(s)?\b|\bjacket\b|\bwarm clothing\b/i, "weather-appropriate layers"],
    [/\bswimsuit|bathing suit\b/i, "swimwear"],
    [/\btowel\b/i, "a towel"],
    [/\bhat\b/i, "a hat"],
  ];
  return unique(prep.filter(([pattern]) => pattern.test(sourceText)).map(([, label]) => label)).slice(0, 3);
};

const joinNatural = (items: string[]) => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
};

const cap = (value: string, max: number) => {
  const text = clean(value);
  if (text.length <= max) return text;
  const truncated = text.slice(0, max - 1);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${(lastSpace > max * 0.7 ? truncated.slice(0, lastSpace) : truncated).trim()}…`;
};

export const buildFareHarborEditorial = (
  input: FareHarborEditorialInput
): FareHarborEditorialEntry => {
  const description = clean(input.description);
  const headline = clean(input.headline);
  const supplemental = Object.fromEntries(
    Object.entries(input.supplemental ?? {})
      .map(([key, value]) => [key, clean(value)] as const)
      .filter(([, value]) => Boolean(value))
  );
  const supplementalText = Object.values(supplemental).join(" ");
  const sourceText = clean(`${headline} ${description} ${supplementalText}`);
  const sourceBacked = sourceText.length >= 40;
  const activity = inferActivity(input, sourceText);
  const themes = inferThemes(sourceText);
  const duration = inferDuration(sourceText);
  const places = inferNamedPlaces(sourceText, input.city, input.region);
  const inclusions = inferInclusions(supplementalText || sourceText);
  const preparation = inferPreparation(supplementalText || sourceText);
  const destination = [clean(input.city), clean(input.region)].filter(Boolean).join(", ");
  const placePhrase = places.length ? joinNatural(places) : "the surrounding destination";
  const themePhrase = themes.length ? joinNatural(themes) : "the character of the area";
  const durationPhrase = duration ? ` Published trip details describe ${duration}.` : "";
  const inclusionPhrase = inclusions.length
    ? ` The listing also identifies ${joinNatural(inclusions)} as part of the experience.`
    : "";
  const preparationPhrase = preparation.length
    ? ` Guests are advised to plan for ${joinNatural(preparation)}.`
    : "";
  const isRental = input.type === "rental" || activity === "equipment rental";
  const variant = stableIndex(input.key, 4);

  const sourceOpeners = [
    `${input.title} is ${withArticle(activity)} in ${destination} built around ${placePhrase} and ${themePhrase}.`,
    `In ${destination}, ${input.title} focuses on ${placePhrase}, with the published itinerary emphasizing ${themePhrase}.`,
    `${input.title} uses ${destination} as the setting for ${withArticle(activity)} centered on ${placePhrase} and ${themePhrase}.`,
    `The defining features of ${input.title} are its ${activity} format, ${placePhrase}, and an emphasis on ${themePhrase} in ${destination}.`,
  ];
  const metadataOpeners = [
    `${input.title} is ${withArticle(activity)} based in ${destination}.`,
    `Travelers looking for ${withArticle(activity)} in ${destination} can consider ${input.title}.`,
    `${input.title} adds ${withArticle(activity)} option to the ${destination} catalog.`,
    `This ${destination} listing is organized around ${input.title}, ${withArticle(activity)} offered by ${clean(input.operator) || "a local operator"}.`,
  ];

  const operatorSentence = clean(input.operator)
    ? isRental
      ? `${input.operator} manages the booking and current pickup, return, availability, and equipment details shown at checkout.`
      : `${input.operator} operates the experience; current departure details, availability, and any participation requirements are confirmed during booking.`
    : isRental
      ? "Current pickup, return, availability, and equipment details are confirmed during booking."
      : "Current departure details, availability, and participation requirements are confirmed during booking.";

  const sourceParagraph = sourceBacked
    ? `${sourceOpeners[variant]}${durationPhrase}${inclusionPhrase}`
    : metadataOpeners[variant];
  const logisticsParagraph = `${operatorSentence}${preparationPhrase}`;
  const overview = `${sourceParagraph}\n\n${logisticsParagraph}`;

  const highlights = unique([
    places.length ? `${sentenceCase(activity)} featuring ${joinNatural(places.slice(0, 2))}` : `${sentenceCase(activity)} in ${destination}`,
    themes.length ? `Focus on ${joinNatural(themes)}` : `Destination-specific outing in ${input.city}`,
    duration ? sentenceCase(duration) : "Schedule and departure details confirmed at booking",
    inclusions.length ? `Published inclusions mention ${joinNatural(inclusions)}` : "Operated by an independent local provider",
    preparation.length ? `Plan for ${joinNatural(preparation)}` : "Check current requirements before departure",
  ]).slice(0, 5);

  const metaCore = sourceBacked
    ? `${input.title} in ${destination}: ${activity} focused on ${places[0] ?? themes[0] ?? "local highlights"}. Check current departure details and availability.`
    : `${input.title} in ${destination}. ${sentenceCase(activity)} with current scheduling, requirements, and availability confirmed by the operator.`;

  return {
    title: input.title,
    city: input.city,
    region: input.region,
    overview,
    highlights,
    metaDescription: cap(metaCore, 155),
    sourceBacked,
    sourceDescriptionLength: description.length,
    sourceFields: [
      ...(description ? ["description"] : []),
      ...(headline ? ["headline"] : []),
      ...Object.keys(supplemental),
    ],
    sourceStatus: input.sourceStatus ?? null,
    sourceEndpoint: input.sourceEndpoint ?? null,
    sourceHash: input.sourceHash ?? null,
  };
};
