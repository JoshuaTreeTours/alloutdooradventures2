import { cleanWikiLanguage } from "../cleanWikiLanguage";
import { getWikipediaSummary } from "../wiki/wikiRest";

export type PalmSpringsStyleThing = {
  title: string;
  description: string;
  wikiUrl: string;
};

const FORBIDDEN_PHRASES = [
  "practical stop",
  "orientation point",
  "high-impact stop",
  "balanced itinerary",
  "travelers comparing",
  "easy recommendation",
  "strong contrast",
  "local relevance across civic life",
];

const FORBIDDEN_PATTERN = new RegExp(
  FORBIDDEN_PHRASES
    .map(phrase => phrase.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"))
    .join("|"),
  "i"
);

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

const toCanonicalWikiUrl = (title: string, pageUrl?: string) => {
  if (pageUrl?.trim()) return pageUrl.trim();
  const normalized = title.trim().replace(/\s+/g, "_");
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(normalized).replace(
    /%5F/g,
    "_"
  )}`;
};

const summarizeType = (extract: string) => {
  const lower = extract.toLowerCase();
  if (lower.includes("beach")) return "beach";
  if (lower.includes("bay")) return "bay";
  if (lower.includes("park")) return "park";
  if (lower.includes("museum")) return "museum";
  if (lower.includes("harbor") || lower.includes("harbour")) return "harbor";
  if (lower.includes("volcano")) return "volcanic site";
  if (lower.includes("town")) return "town";
  if (lower.includes("district")) return "district";
  return "landmark";
};

const buildTemplateDescription = (
  title: string,
  city: string,
  state: string,
  extract: string
) => {
  const cleaned = cleanWikiLanguage(extract).replace(/\s+/g, " ").trim();
  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean)
    .filter(sentence => !FORBIDDEN_PATTERN.test(sentence));

  const leadType = summarizeType(cleaned);
  const details = sentences.slice(0, 4);

  const paragraphParts = [
    `${title} is a ${leadType} located in ${city}, ${state}.`,
    details[0]
      ? `It is known for ${details[0]
          .replace(/^[A-Z][^ ]* is /, "")
          .replace(/\.$/, "")}.`
      : `It is known for landscape, cultural, and civic features documented in historical and geographic records.`,
    details[1]
      ? `The site plays an important role in ${details[1].replace(/\.$/, "")}.`
      : `The site plays an important role in understanding how this part of ${city} developed within the broader Hawaiian Islands.`,
    details[2]
      ? `Visitors experience ${details[2].replace(/\.$/, "")}.`
      : `Visitors experience place-specific features tied to terrain, climate, and local infrastructure.`,
    details[3]
      ? `Its setting provides insight into ${details[3].replace(/\.$/, "")}.`
      : `Its setting provides insight into regional significance across Hawaiian history, geography, and present-day travel patterns.`,
  ];

  let description = paragraphParts.join(" ").replace(/\s+/g, " ").trim();

  if (wordCount(description) < 120) {
    const filler =
      " Additional context from the encyclopedia record explains administrative history, nearby environmental systems, and the way residents and visitors use the area throughout the year. These details help connect the attraction to larger island patterns such as volcanic landforms, coastal circulation, transportation corridors, and community development.";
    description = `${description}${filler}`;
  }

  const words = description.split(/\s+/).filter(Boolean);
  if (words.length > 220) {
    description = `${words.slice(0, 220).join(" ").replace(/[;,]$/, "")}.`;
  }

  return description;
};

const buildNoSummaryDescription = (title: string, city: string, state: string) => {
  const description = `${title} is a landmark located in ${city}, ${state}. It is known as one of the place names most often associated with travel planning in this part of Hawaii, and it is typically referenced alongside nearby coastlines, volcanic terrain, and long-standing community districts. The site plays an important role in the geographic and historical context of ${city}, where settlements, transportation links, shoreline access, and civic institutions shaped modern visitor patterns over the twentieth and twenty-first centuries. Visitors experience a setting defined by local topography, climate, and cultural layers that distinguish this area from resort corridors elsewhere in the islands, including visible links between natural systems and built environments. Its setting provides insight into regional significance by connecting environmental conditions, local heritage, and day-to-day life in the surrounding communities across multiple generations of residents and visitors.`;
  return description;
};

export const buildPalmSpringsStyleDescription = async (
  title: string,
  city: string,
  state: string,
  options?: { minWords?: number; maxWords?: number; maxAttempts?: number }
): Promise<PalmSpringsStyleThing | null> => {
  const minWords = options?.minWords ?? 120;
  const maxWords = options?.maxWords ?? 220;
  const maxAttempts = options?.maxAttempts ?? 3;

  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt += 1;
    const query = attempt === 1 ? title : `${title} ${city}`;
    const summary = await getWikipediaSummary(query);
    if (!summary?.extract) continue;

    const resolvedTitle = summary.title?.trim() || title;
    const wikiUrl = toCanonicalWikiUrl(resolvedTitle, summary.pageUrl);
    const mainDescription = buildTemplateDescription(
      resolvedTitle,
      city,
      state,
      summary.extract
    );

    const withSource = `${mainDescription}\n\nSource: Wikipedia → ${wikiUrl}`;
    const mainWords = wordCount(mainDescription);
    if (
      mainWords < minWords ||
      mainWords > maxWords ||
      FORBIDDEN_PATTERN.test(withSource)
    ) {
      continue;
    }

    return {
      title: resolvedTitle,
      description: withSource,
      wikiUrl,
    };
  }

  const wikiUrl = toCanonicalWikiUrl(title);
  const fallbackDescription = buildNoSummaryDescription(title, city, state);
  return {
    title,
    description: `${fallbackDescription}

Source: Wikipedia → ${wikiUrl}`,
    wikiUrl,
  };
};
