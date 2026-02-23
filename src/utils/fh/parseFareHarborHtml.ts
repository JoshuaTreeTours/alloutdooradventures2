export type ParsedTour = {
  title: string;
  slug?: string;
  overview: string;
  highlights: string[];
  duration: string;
  meetingPoint: {
    name?: string;
    addressLine1?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    rawText?: string;
  };
  category: {
    primary: string;
    tags?: string[];
  };
  pricing: string[];
  priceAdult?: number;
  priceChild?: number;
  priceLabel?: string;
  inclusions: string[];
  exclusions: string[];
  faq: { q: string; a: string }[];
};

const stripTags = (value: string) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getSection = (html: string, key: string) => {
  const match = html.match(
    new RegExp(
      `<section[^>]*data-fh=["']${key}["'][^>]*>([\\s\\S]*?)<\\/section>`,
      "i"
    )
  );
  return match?.[1] ?? "";
};

const getListItems = (sectionHtml: string) =>
  Array.from(sectionHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
    .map(match => stripTags(match[1] ?? ""))
    .filter(Boolean);

const parseDollarAmount = (value: string) => {
  const match = value.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/);
  if (!match?.[1]) {
    return undefined;
  }

  const parsed = Number.parseFloat(match[1].replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const detectCategory = (value: { title?: string; slug?: string; activityType?: string }) => {
  const haystack = [value.title, value.slug, value.activityType]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const tags: string[] = [];

  let primary = "Guided tour";
  if (/\bjeep\b/.test(haystack)) {
    primary = "Jeep tour";
  } else if (/\bhike|trail|walk\b/.test(haystack)) {
    primary = "Hiking tour";
  } else if (/\bboat|cruise|sail\b/.test(haystack)) {
    primary = "Boat tour";
  } else if (/\btram|aerial\b/.test(haystack)) {
    primary = "Scenic ride";
  }

  if (/\bfault|geology|canyon\b/.test(haystack)) {
    tags.push("geology");
    tags.push("nature walk");
  }

  return {
    primary,
    tags: tags.length ? Array.from(new Set(tags)) : undefined,
  };
};

const parseMeetingPoint = (meetingPointText: string) => {
  const cleaned = meetingPointText.trim();
  if (!cleaned) {
    return {};
  }

  const [namePart, remainder = ""] = cleaned.split(/\s+[—-]\s+/, 2);
  const blob = remainder || cleaned;
  const addressMatch = blob.match(
    /([^,]+),\s*([^,]+),\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?(?:,\s*([A-Z]{2}|United States|USA))?/i
  );

  if (!addressMatch) {
    return {
      name: remainder ? namePart.trim() : undefined,
      rawText: cleaned,
    };
  }

  return {
    name: remainder ? namePart.trim() : undefined,
    addressLine1: addressMatch[1]?.trim(),
    city: addressMatch[2]?.trim(),
    region: addressMatch[3]?.trim(),
    postalCode: addressMatch[4]?.trim(),
    country: addressMatch[5]?.trim() || "US",
    rawText: cleaned,
  };
};

export const parseFareHarborHtml = (html: string): ParsedTour => {
  const title = stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
  const overviewSection = getSection(html, "overview");
  const overview = Array.from(
    overviewSection.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)
  )
    .map(match => stripTags(match[1] ?? ""))
    .filter(Boolean)
    .join(" ");

  const details = stripTags(getSection(html, "details"));
  const duration =
    details.match(/Duration:\s*([^\n]+?)(?:Meeting Point:|$)/i)?.[1]?.trim() ??
    "";
  const meetingPointText =
    details.match(/Meeting Point:\s*([^\n]+)$/i)?.[1]?.trim() ?? "";
  const meetingPoint = parseMeetingPoint(meetingPointText);

  const categoryText = stripTags(getSection(html, "category"));
  const category = detectCategory({
    title,
    activityType: categoryText,
  });

  const faqSection = getSection(html, "faq");
  const pricing = getListItems(getSection(html, "pricing"));
  const pricingText = pricing.join(" | ");
  const adultMatch = pricingText.match(
    /adult[^$]*(\$\s*[\d,]+(?:\.\d{1,2})?)/i
  );
  const childMatch = pricingText.match(
    /child[^$]*(\$\s*[\d,]+(?:\.\d{1,2})?)/i
  );
  const priceAdult = adultMatch?.[1]
    ? parseDollarAmount(adultMatch[1])
    : undefined;
  const priceChild = childMatch?.[1]
    ? parseDollarAmount(childMatch[1])
    : undefined;
  const priceLabel =
    priceAdult && priceChild
      ? `$${priceAdult.toFixed(0)} adult / $${priceChild.toFixed(0)} child`
      : undefined;

  const faq = Array.from(
    faqSection.matchAll(
      /<article[^>]*>\s*<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/article>/gi
    )
  )
    .map(match => ({
      q: stripTags(match[1] ?? ""),
      a: stripTags(match[2] ?? ""),
    }))
    .filter(item => item.q && item.a);

  return {
    title,
    overview,
    highlights: getListItems(getSection(html, "highlights")),
    duration,
    meetingPoint,
    category,
    pricing,
    priceAdult,
    priceChild,
    priceLabel,
    inclusions: getListItems(getSection(html, "inclusions")),
    exclusions: getListItems(getSection(html, "exclusions")),
    faq,
  };
};
