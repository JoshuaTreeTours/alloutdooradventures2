export type ParsedFareHarborFields = {
  title?: string;
  description?: string;
  highlights?: string[];
  duration?: string;
  meetingPoint?: string;
  pickup?: string;
  included?: string[];
  notIncluded?: string[];
  ageMin?: string;
  groupSize?: string;
  accessibility?: string;
  cancellation?: string;
  faq?: Array<{ q: string; a: string }>;
  pricing?: Array<{ label: string; price: string }>;
};

const stripTags = (html: string) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const getMetaDescription = (html: string) => {
  const match = html.match(
    /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
  );
  return match?.[1]?.trim();
};

const parseJsonLdObjects = (html: string): unknown[] => {
  const objects: unknown[] = [];
  const regex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match = regex.exec(html);
  while (match) {
    try {
      const parsed = JSON.parse(match[1]);
      objects.push(parsed);
    } catch {
      // noop
    }
    match = regex.exec(html);
  }
  return objects;
};

const toStringArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .flatMap(item => (typeof item === "string" ? [item] : []))
      .map(item => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\n|•|\|/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
};

const findLabeledText = (text: string, label: string): string | undefined => {
  const pattern = new RegExp(`${label}\\s*[:\\-]\\s*([^\\n\\r]{3,140})`, "i");
  const matched = text.match(pattern);
  return matched?.[1]?.trim();
};

const collectFaq = (text: string) => {
  const faq: Array<{ q: string; a: string }> = [];
  const faqRegex = /(Q(?:uestion)?\s*[:\-]\s*[^\n]+)\s+(A(?:nswer)?\s*[:\-]\s*[^\n]+)/gi;
  let match = faqRegex.exec(text);
  while (match) {
    faq.push({
      q: match[1].replace(/^Q(?:uestion)?\s*[:\-]\s*/i, "").trim(),
      a: match[2].replace(/^A(?:nswer)?\s*[:\-]\s*/i, "").trim(),
    });
    match = faqRegex.exec(text);
  }
  return faq;
};

export const parseFareHarborHtml = (html: string): ParsedFareHarborFields => {
  if (!html) {
    return {};
  }

  const text = stripTags(html);
  const jsonLd = parseJsonLdObjects(html);
  const firstJsonLd = jsonLd.find(
    entry => entry && typeof entry === "object"
  ) as Record<string, unknown> | undefined;

  const titleFromHtml = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const titleFromJsonLd =
    typeof firstJsonLd?.name === "string" ? firstJsonLd.name : undefined;

  const descriptionFromJsonLd =
    typeof firstJsonLd?.description === "string"
      ? stripTags(firstJsonLd.description)
      : undefined;

  const offers = firstJsonLd?.offers;
  const pricing: Array<{ label: string; price: string }> = [];
  if (offers && typeof offers === "object") {
    const offerEntries = Array.isArray(offers) ? offers : [offers];
    for (const offer of offerEntries) {
      if (!offer || typeof offer !== "object") continue;
      const offerRecord = offer as Record<string, unknown>;
      const rawPrice = offerRecord.price;
      if (typeof rawPrice === "string" || typeof rawPrice === "number") {
        pricing.push({
          label:
            typeof offerRecord.name === "string"
              ? offerRecord.name
              : "Starting from",
          price: String(rawPrice),
        });
      }
    }
  }

  const parsed: ParsedFareHarborFields = {
    title: titleFromJsonLd ?? titleFromHtml,
    description: descriptionFromJsonLd ?? getMetaDescription(html),
    highlights: toStringArray(firstJsonLd?.keywords).slice(0, 8),
    duration: findLabeledText(text, "duration"),
    meetingPoint:
      findLabeledText(text, "meeting point") ?? findLabeledText(text, "meeting location"),
    pickup: findLabeledText(text, "pickup"),
    ageMin:
      findLabeledText(text, "minimum age") ?? findLabeledText(text, "age"),
    groupSize:
      findLabeledText(text, "group size") ?? findLabeledText(text, "max group"),
    accessibility:
      findLabeledText(text, "accessibility") ?? findLabeledText(text, "wheelchair"),
    cancellation: findLabeledText(text, "cancellation"),
    included: toStringArray(findLabeledText(text, "included")),
    notIncluded: toStringArray(findLabeledText(text, "not included")),
    faq: collectFaq(text).slice(0, 6),
    pricing: pricing.length ? pricing : undefined,
  };

  return parsed;
};
