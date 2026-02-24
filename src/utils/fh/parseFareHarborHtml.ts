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
  galleryImages: string[];
};

const parseSrcsetFirstUrl = (value: string) =>
  value
    .split(",")
    .map(candidate => candidate.trim().split(/\s+/)[0]?.trim())
    .find(Boolean);

const normalizeImageUrl = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!/^https:\/\//i.test(trimmed)) {
    return undefined;
  }

  return trimmed;
};

const extractImageUrlsFromTag = (tagHtml: string) => {
  const urls: string[] = [];
  const attrPatterns: Array<{
    matcher: RegExp;
    transform?: (value: string) => string | undefined;
  }> = [
    {
      matcher: /\ssrcset\s*=\s*["']([^"']+)["']/i,
      transform: parseSrcsetFirstUrl,
    },
    { matcher: /\ssrc\s*=\s*["']([^"']+)["']/i },
    { matcher: /\sdata-src\s*=\s*["']([^"']+)["']/i },
    { matcher: /\sdata-lazy\s*=\s*["']([^"']+)["']/i },
  ];

  attrPatterns.forEach(({ matcher, transform }) => {
    const rawValue = tagHtml.match(matcher)?.[1];
    const transformed = transform ? transform(rawValue ?? "") : rawValue;
    const normalized = normalizeImageUrl(transformed);
    if (normalized) {
      urls.push(normalized);
    }
  });

  return urls;
};

const extractGalleryImages = (html: string) => {
  const ordered: string[] = [];
  const seen = new Set<string>();

  const sliderBlocks = Array.from(
    html.matchAll(
      /<(section|div)[^>]*(?:gallery|slider|carousel|slideshow|fh-image|fh-photo)[^>]*>[\s\S]*?<\/\1>/gi
    )
  ).map(match => match[0]);

  const extractionSources = sliderBlocks.length ? sliderBlocks : [html];
  extractionSources.forEach(source => {
    Array.from(source.matchAll(/<(?:img|source)[^>]*>/gi)).forEach(match => {
      extractImageUrlsFromTag(match[0]).forEach(url => {
        if (!seen.has(url)) {
          seen.add(url);
          ordered.push(url);
        }
      });
    });
  });

  return ordered;
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

const detectCategory = (value: {
  title?: string;
  slug?: string;
  activityType?: string;
}) => {
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
    galleryImages: extractGalleryImages(html),
  };
};
