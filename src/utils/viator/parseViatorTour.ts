import type { ViatorParsedTour } from "./types";

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toAbsoluteUrl = (url: string, pageUrl?: string) => {
  try {
    if (pageUrl) {
      return new URL(url, pageUrl).toString();
    }
    return new URL(url).toString();
  } catch {
    return null;
  }
};

const isLikelyTourImage = (url: string) => {
  const lowered = url.toLowerCase();
  return ![
    "sprite",
    "icon",
    "logo",
    ".svg",
    "avatar",
    "placeholder",
    "1x1",
  ].some(token => lowered.includes(token));
};

const parseJsonLdNodes = (html: string): Record<string, unknown>[] => {
  const scripts = Array.from(
    html.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    )
  );
  return scripts
    .map(match => {
      try {
        const parsed = JSON.parse(match[1]);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [];
      }
    })
    .flat()
    .filter(Boolean) as Record<string, unknown>[];
};

const extractByLabel = (html: string, label: string) => {
  const pattern = new RegExp(
    `${label}[\\s\\S]{0,300}?<[^>]+>([\\s\\S]{1,300}?)<\\/`,
    "i"
  );
  const match = html.match(pattern);
  return match ? stripHtml(match[1]) : undefined;
};

const extractImageCandidates = (html: string, pageUrl?: string) => {
  const candidates: string[] = [];

  const ogImage = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
  );
  if (ogImage?.[1]) {
    candidates.push(ogImage[1]);
  }

  for (const match of Array.from(
    html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)
  )) {
    const src = match[1];
    const widthMatch = match[0].match(/width=["']?(\d+)/i);
    const heightMatch = match[0].match(/height=["']?(\d+)/i);
    const width = widthMatch ? Number(widthMatch[1]) : undefined;
    const height = heightMatch ? Number(heightMatch[1]) : undefined;
    if (
      (typeof width === "number" && width < 200) ||
      (typeof height === "number" && height < 200)
    ) {
      continue;
    }
    candidates.push(src);
  }

  return Array.from(
    new Set(
      candidates
        .map(item => toAbsoluteUrl(item, pageUrl))
        .filter((item): item is string =>
          Boolean(item && isLikelyTourImage(item))
        )
    )
  );
};

export function parseViatorTour(
  html: string,
  pageUrl?: string
): ViatorParsedTour {
  const parsed: ViatorParsedTour = {};
  const jsonLdNodes = parseJsonLdNodes(html);

  const productNode = jsonLdNodes.find(node => node["@type"] === "Product");
  const faqNode = jsonLdNodes.find(node => node["@type"] === "FAQPage");

  const jsonLdImages: string[] = [];
  for (const node of jsonLdNodes) {
    const imageField = node.image ?? node.photo;
    if (typeof imageField === "string") {
      jsonLdImages.push(imageField);
    }
    if (Array.isArray(imageField)) {
      for (const entry of imageField) {
        if (typeof entry === "string") {
          jsonLdImages.push(entry);
        } else if (
          entry &&
          typeof entry === "object" &&
          typeof (entry as Record<string, unknown>).url === "string"
        ) {
          jsonLdImages.push((entry as Record<string, unknown>).url as string);
        }
      }
    }
  }

  if (productNode) {
    parsed.title =
      typeof productNode.name === "string" ? productNode.name : undefined;
    parsed.overviewText =
      typeof productNode.description === "string"
        ? stripHtml(productNode.description)
        : undefined;
    const offers = productNode.offers as Record<string, unknown> | undefined;
    if (offers && typeof offers.price === "string") {
      const numeric = Number(offers.price.replace(/[^\d.]/g, ""));
      if (Number.isFinite(numeric)) {
        parsed.priceFrom = numeric;
      }
    }
    if (offers && typeof offers.priceCurrency === "string") {
      parsed.currency = offers.priceCurrency;
    }

    const aggregate = productNode.aggregateRating as
      | Record<string, unknown>
      | undefined;
    if (aggregate && typeof aggregate.ratingValue === "number") {
      parsed.ratingValue = aggregate.ratingValue;
    }
    if (aggregate && typeof aggregate.reviewCount === "number") {
      parsed.reviewCount = aggregate.reviewCount;
    }
  }

  if (faqNode && Array.isArray(faqNode.mainEntity)) {
    const faqs = faqNode.mainEntity
      .map((entry: Record<string, unknown>) => {
        const q = typeof entry.name === "string" ? stripHtml(entry.name) : "";
        const a =
          entry.acceptedAnswer &&
          typeof (entry.acceptedAnswer as Record<string, unknown>).text ===
            "string"
            ? stripHtml(
                (entry.acceptedAnswer as Record<string, unknown>).text as string
              )
            : "";
        return q && a ? { q, a } : null;
      })
      .filter(Boolean) as Array<{ q: string; a: string }>;

    if (faqs.length) {
      parsed.faqs = faqs;
    }
  }

  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!parsed.title && titleMatch) {
    parsed.title = stripHtml(titleMatch[1]);
  }

  const duration = extractByLabel(html, "Duration");
  if (duration) parsed.durationText = duration;

  const destination = extractByLabel(html, "Location");
  if (destination) parsed.destinationText = destination;

  const meetingPoint = html.match(
    /Meeting point[\s\S]{0,800}?<address[^>]*>([\s\S]*?)<\/address>/i
  );
  if (meetingPoint) {
    parsed.meetingPoint = {
      address: stripHtml(meetingPoint[1]),
    };
  }
  const meetingName = html.match(
    /Meeting point[\s\S]{0,250}?<h\d[^>]*>([\s\S]*?)<\/h\d>/i
  );
  if (meetingName) {
    parsed.meetingPoint = {
      ...(parsed.meetingPoint ?? {}),
      name: stripHtml(meetingName[1]),
    };
  }

  const meetingNote = html.match(
    /Meeting point[\s\S]{0,900}?<p[^>]*>([\s\S]*?)<\/p>/i
  );
  if (meetingNote) {
    parsed.meetingPoint = {
      ...(parsed.meetingPoint ?? {}),
      notes: stripHtml(meetingNote[1]),
    };
  }

  const itineraryMatches = Array.from(
    html.matchAll(
      /<h3[^>]*>([^<]{3,200})<\/h3>[\s\S]{0,240}?([0-9]+\s*(?:hour|hr|min|minute)s?)/gi
    )
  );
  if (itineraryMatches.length) {
    parsed.itinerary = itineraryMatches.map(match => ({
      title: stripHtml(match[1]),
      duration: stripHtml(match[2]),
    }));
  }

  const includedMatches = Array.from(
    html.matchAll(/Included[\s\S]{0,1200}?<li[^>]*>([\s\S]*?)<\/li>/gi)
  )
    .map(match => stripHtml(match[1]))
    .filter(Boolean);
  if (includedMatches.length) {
    parsed.included = Array.from(new Set(includedMatches)).slice(0, 12);
  }

  const notIncludedMatches = Array.from(
    html.matchAll(/Not included[\s\S]{0,1200}?<li[^>]*>([\s\S]*?)<\/li>/gi)
  )
    .map(match => stripHtml(match[1]))
    .filter(Boolean);
  if (notIncludedMatches.length) {
    parsed.notIncluded = Array.from(new Set(notIncludedMatches)).slice(0, 12);
  }

  const knowBefore = Array.from(
    html.matchAll(
      /Know before you go[\s\S]{0,1200}?<li[^>]*>([\s\S]*?)<\/li>/gi
    )
  )
    .map(match => stripHtml(match[1]))
    .filter(Boolean);
  if (knowBefore.length) {
    parsed.knowBeforeYouGo = Array.from(new Set(knowBefore)).slice(0, 10);
  }

  const cancellation = extractByLabel(html, "Cancellation policy");
  if (cancellation) {
    parsed.cancellationText = cancellation;
  }

  parsed.highlightsSourceText = [
    ...(parsed.overviewText ? [parsed.overviewText] : []),
    ...(parsed.itinerary ?? []).map(item => item.title),
    ...(parsed.included ?? []).slice(0, 3),
  ].slice(0, 8);

  const normalizedJsonLdImages = jsonLdImages
    .map(image => toAbsoluteUrl(image, pageUrl))
    .filter((item): item is string => Boolean(item && isLikelyTourImage(item)));
  const fallbackDomImages = extractImageCandidates(html, pageUrl);
  parsed.images = Array.from(
    new Set([...normalizedJsonLdImages, ...fallbackDomImages])
  );
  parsed.primaryImage = parsed.images[0];

  return parsed;
}
