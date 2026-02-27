import type { ViatorParsedTour } from "./types";

const PHOTO_CDN_HINTS = ["viator", "tripadvisor", "unsplash", "wikimedia"];

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toAbsoluteUrl = (url: string, pageUrl?: string) => {
  try {
    const absolute = pageUrl ? new URL(url, pageUrl) : new URL(url);
    if (absolute.protocol === "http:") {
      absolute.protocol = "https:";
    }
    return absolute.toString();
  } catch {
    return null;
  }
};

const normalizeImageUrl = (url: string) => {
  const parsed = new URL(url);
  const preservedKeys = new Set(["w", "h", "fit", "crop", "q", "fm", "auto"]);
  for (const key of [...parsed.searchParams.keys()]) {
    if (!preservedKeys.has(key)) {
      parsed.searchParams.delete(key);
    }
  }
  return parsed.toString().trim();
};

const isLikelyTourImage = (url: string) => {
  const lowered = url.toLowerCase();
  if (!(lowered.startsWith("https://") || lowered.startsWith("http://"))) {
    return false;
  }
  if (
    ["data:image", "sprite", "icon", "logo", "favicon", "avatar"].some(token =>
      lowered.includes(token)
    )
  ) {
    return false;
  }

  return (
    /(\.jpg|\.jpeg|\.png|\.webp)(\?|$)/i.test(lowered) ||
    PHOTO_CDN_HINTS.some(hint => lowered.includes(hint))
  );
};

const appendImage = (bucket: string[], candidate: string | null) => {
  if (!candidate) return;
  if (!isLikelyTourImage(candidate)) return;
  const normalized = normalizeImageUrl(candidate);
  if (!bucket.includes(normalized)) {
    bucket.push(normalized);
  }
};

const extractUrlsFromUnknown = (value: unknown, bucket: string[]) => {
  if (!value) return;

  if (typeof value === "string") {
    appendImage(bucket, toAbsoluteUrl(value));
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      extractUrlsFromUnknown(item, bucket);
    }
    return;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const [key, nested] of Object.entries(record)) {
      if (
        [
          "image",
          "photo",
          "url",
          "contentUrl",
          "src",
          "associatedMedia",
        ].includes(key)
      ) {
        extractUrlsFromUnknown(nested, bucket);
      } else if (nested && typeof nested === "object") {
        extractUrlsFromUnknown(nested, bucket);
      }
    }
  }
};

const parseJsonScript = (content: string): unknown => {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
};

const parseJsonLdNodes = (html: string): unknown[] =>
  Array.from(
    html.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    )
  )
    .map(match => parseJsonScript(match[1]))
    .filter(Boolean);

const parseApplicationJsonNodes = (html: string): unknown[] =>
  Array.from(
    html.matchAll(
      /<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi
    )
  )
    .map(match => parseJsonScript(match[1]))
    .filter(Boolean);

const parseStateAssignment = (html: string, symbol: string): unknown => {
  const regex = new RegExp(`${symbol}\\s*=\\s*(\\{[\\s\\S]*?\\});`, "i");
  const match = html.match(regex);
  if (!match) return null;

  const raw = match[1].endsWith(";") ? match[1].slice(0, -1) : match[1];
  return parseJsonScript(raw);
};

const extractByLabel = (html: string, label: string) => {
  const pattern = new RegExp(
    `${label}[\\s\\S]{0,300}?<[^>]+>([\\s\\S]{1,300}?)<\\/`,
    "i"
  );
  const match = html.match(pattern);
  return match ? stripHtml(match[1]) : undefined;
};

const extractDomGalleryImages = (html: string, pageUrl?: string) => {
  const bucket: string[] = [];
  for (const match of Array.from(
    html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)
  )) {
    const src = match[1];
    const widthMatch = match[0].match(/width=["']?(\d+)/i);
    const heightMatch = match[0].match(/height=["']?(\d+)/i);
    const width = widthMatch ? Number(widthMatch[1]) : undefined;
    const height = heightMatch ? Number(heightMatch[1]) : undefined;
    if ((width && width < 200) || (height && height < 200)) continue;
    appendImage(bucket, toAbsoluteUrl(src, pageUrl));
    if (bucket.length >= 5) break;
  }
  return bucket;
};

export function parseViatorTour(
  html: string,
  pageUrl?: string
): ViatorParsedTour {
  const parsed: ViatorParsedTour = { images: [] };

  const jsonLdNodes = parseJsonLdNodes(html);
  const flatJsonLd = jsonLdNodes.flatMap(node =>
    Array.isArray(node) ? node : [node]
  );
  const productNode = flatJsonLd.find(
    node =>
      node &&
      typeof node === "object" &&
      (node as Record<string, unknown>)["@type"] === "Product"
  ) as Record<string, unknown> | undefined;
  const faqNode = flatJsonLd.find(
    node =>
      node &&
      typeof node === "object" &&
      (node as Record<string, unknown>)["@type"] === "FAQPage"
  ) as Record<string, unknown> | undefined;

  const orderedImages: string[] = [];

  for (const node of flatJsonLd) {
    extractUrlsFromUnknown(node, orderedImages);
    if (orderedImages.length >= 5) break;
  }

  if (orderedImages.length < 5) {
    const nextData = html.match(
      /<script[^>]*id=["']__NEXT_DATA__["'][^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/i
    );
    if (nextData?.[1]) {
      extractUrlsFromUnknown(parseJsonScript(nextData[1]), orderedImages);
    }
  }

  if (orderedImages.length < 5) {
    for (const node of parseApplicationJsonNodes(html)) {
      extractUrlsFromUnknown(node, orderedImages);
      if (orderedImages.length >= 5) break;
    }
  }

  if (orderedImages.length < 5) {
    extractUrlsFromUnknown(
      parseStateAssignment(html, "window\\.__APOLLO_STATE__"),
      orderedImages
    );
    extractUrlsFromUnknown(
      parseStateAssignment(html, "window\\.__INITIAL_STATE__"),
      orderedImages
    );
  }

  if (orderedImages.length < 1) {
    const ogImage = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    );
    if (ogImage?.[1]) {
      appendImage(orderedImages, toAbsoluteUrl(ogImage[1], pageUrl));
    }
  }

  if (orderedImages.length < 5) {
    for (const image of extractDomGalleryImages(html, pageUrl)) {
      appendImage(orderedImages, image);
      if (orderedImages.length >= 5) break;
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
      if (Number.isFinite(numeric)) parsed.priceFrom = numeric;
    }
    if (offers && typeof offers.priceCurrency === "string") {
      parsed.currency = offers.priceCurrency;
    }
    const aggregate = productNode.aggregateRating as
      | Record<string, unknown>
      | undefined;
    if (aggregate && typeof aggregate.ratingValue === "number")
      parsed.ratingValue = aggregate.ratingValue;
    if (aggregate && typeof aggregate.reviewCount === "number")
      parsed.reviewCount = aggregate.reviewCount;
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
    if (faqs.length) parsed.faqs = faqs;
  }

  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!parsed.title && titleMatch) parsed.title = stripHtml(titleMatch[1]);

  const duration = extractByLabel(html, "Duration");
  if (duration) parsed.durationText = duration;
  const destination = extractByLabel(html, "Location");
  if (destination) parsed.destinationText = destination;

  const meetingPoint = html.match(
    /Meeting point[\s\S]{0,800}?<address[^>]*>([\s\S]*?)<\/address>/i
  );
  if (meetingPoint)
    parsed.meetingPoint = { address: stripHtml(meetingPoint[1]) };
  const meetingName = html.match(
    /Meeting point[\s\S]{0,250}?<h\d[^>]*>([\s\S]*?)<\/h\d>/i
  );
  if (meetingName)
    parsed.meetingPoint = {
      ...(parsed.meetingPoint ?? {}),
      name: stripHtml(meetingName[1]),
    };
  const meetingNote = html.match(
    /Meeting point[\s\S]{0,900}?<p[^>]*>([\s\S]*?)<\/p>/i
  );
  if (meetingNote)
    parsed.meetingPoint = {
      ...(parsed.meetingPoint ?? {}),
      notes: stripHtml(meetingNote[1]),
    };

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
  const notIncludedMatches = Array.from(
    html.matchAll(/Not included[\s\S]{0,1200}?<li[^>]*>([\s\S]*?)<\/li>/gi)
  )
    .map(match => stripHtml(match[1]))
    .filter(Boolean);

  const notIncludedNormalized = Array.from(new Set(notIncludedMatches));
  const includedNormalized = Array.from(
    new Set(
      includedMatches.filter(item => {
        const lowered = item.toLowerCase();
        if (lowered.includes("gratuities")) return false;
        return !notIncludedNormalized.some(
          excluded => excluded.toLowerCase() === lowered
        );
      })
    )
  );
  if (includedNormalized.length)
    parsed.included = includedNormalized.slice(0, 12);
  if (notIncludedNormalized.length)
    parsed.notIncluded = notIncludedNormalized.slice(0, 12);

  const knowBefore = Array.from(
    html.matchAll(
      /Know before you go[\s\S]{0,1200}?<li[^>]*>([\s\S]*?)<\/li>/gi
    )
  )
    .map(match => stripHtml(match[1]))
    .filter(Boolean);
  if (knowBefore.length)
    parsed.knowBeforeYouGo = Array.from(new Set(knowBefore)).slice(0, 10);

  const cancellation = extractByLabel(html, "Cancellation policy");
  if (cancellation) parsed.cancellationText = cancellation;

  parsed.highlightsSourceText = [
    ...(parsed.overviewText ? [parsed.overviewText] : []),
    ...(parsed.itinerary ?? []).map(item => item.title),
    ...(parsed.included ?? []).slice(0, 3),
  ].slice(0, 8);

  parsed.images = orderedImages.slice(0, 5);
  parsed.primaryImage = parsed.images[0];

  return parsed;
}
