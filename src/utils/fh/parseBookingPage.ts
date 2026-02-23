import type { FareHarborStructuredData } from "./transformFareHarborToAOAContent";

const stripHtml = (value: string) =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

const asString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const clean = stripHtml(value);
  return clean.length > 0 ? clean : undefined;
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(asString).filter((item): item is string => Boolean(item));
};

const parseJsonLdBlocks = (html: string): Array<Record<string, unknown>> => {
  const blocks = Array.from(
    html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  );

  return blocks.flatMap(match => {
    const raw = match[1]?.trim();
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => typeof item === "object" && item !== null);
      }
      if (typeof parsed === "object" && parsed !== null) {
        return [parsed as Record<string, unknown>];
      }
      return [];
    } catch {
      return [];
    }
  }) as Array<Record<string, unknown>>;
};

const matchMetaDescription = (html: string) => {
  const metaDescription =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["'][^>]*>/i)?.[1];

  return metaDescription ? stripHtml(metaDescription) : undefined;
};

const extractListByHeading = (html: string, labels: string[]) => {
  const pattern = labels.map(label => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const sectionRegex = new RegExp(
    `<h[1-6][^>]*>\\s*(?:${pattern})\\s*<\\/h[1-6]>([\\s\\S]*?)(?:<h[1-6][^>]*>|$)`,
    "i"
  );
  const section = html.match(sectionRegex)?.[1];
  if (!section) {
    return [];
  }

  const bullets = Array.from(section.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
    .map(item => stripHtml(item[1] ?? ""))
    .filter(Boolean);

  if (bullets.length) {
    return bullets;
  }

  const paragraph = stripHtml(section);
  return paragraph ? [paragraph] : [];
};

const extractTextByHeading = (html: string, labels: string[]) => {
  const values = extractListByHeading(html, labels);
  return values[0];
};

export const parseBookingPage = (html: string): FareHarborStructuredData => {
  const jsonLd = parseJsonLdBlocks(html);
  const product = jsonLd.find(item => {
    const type = item["@type"];
    if (typeof type === "string") {
      return /Product|TouristTrip|Service|Event/i.test(type);
    }
    if (Array.isArray(type)) {
      return type.some(value => typeof value === "string" && /Product|TouristTrip|Service|Event/i.test(value));
    }
    return false;
  });

  const operator =
    asString((product?.provider as Record<string, unknown> | undefined)?.name) ??
    asString((product?.brand as Record<string, unknown> | undefined)?.name);

  const description =
    asString(product?.description) ??
    matchMetaDescription(html) ??
    extractTextByHeading(html, ["Overview", "Description", "About"]);

  const highlights =
    asStringArray(product?.keywords)
      .flatMap(item => item.split(",").map(part => part.trim()).filter(Boolean))
      .slice(0, 10) || [];

  const semanticHighlights = extractListByHeading(html, ["Highlights", "Why you'll love it", "What to expect"]);

  const inclusions = extractListByHeading(html, ["Included", "What's included", "Inclusions"]);

  return {
    title: asString(product?.name) ?? asString(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]),
    description,
    operator,
    duration:
      asString((product?.duration as string | undefined) ?? undefined) ??
      extractTextByHeading(html, ["Duration"]),
    meetingLocation:
      asString((product?.location as Record<string, unknown> | undefined)?.name) ??
      extractTextByHeading(html, ["Meeting point", "Meeting location", "Location"]),
    included: inclusions,
    rawHighlights: semanticHighlights.length ? semanticHighlights : highlights,
    requirements: extractListByHeading(html, ["Requirements", "Need to know"]),
    cancellation: extractTextByHeading(html, ["Cancellation", "Cancellation policy"]),
  };
};
