const USER_AGENT =
  "Mozilla/5.0 (compatible; AOA-MerchantFeedBot/1.0; +https://www.alloutdooradventures.com)";
const FETCH_TIMEOUT_MS = 10_000;

const cache = new Map<string, string | null>();

const isHttpUrl = (value: unknown): value is string =>
  typeof value === "string" && /^https?:\/\//i.test(value.trim());

const resolveAbsoluteUrl = (
  candidate: unknown,
  baseUrl: string
): string | null => {
  if (typeof candidate !== "string") {
    return null;
  }

  const trimmed = candidate.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed, baseUrl);
    if (!/^https?:$/i.test(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
};

const collectJsonLdImageCandidates = (node: unknown): string[] => {
  if (!node || typeof node !== "object") {
    return [];
  }

  if (Array.isArray(node)) {
    return node.flatMap(item => collectJsonLdImageCandidates(item));
  }

  const asRecord = node as Record<string, unknown>;
  const candidates: string[] = [];

  const imageValue = asRecord.image;
  if (typeof imageValue === "string") {
    candidates.push(imageValue);
  } else if (Array.isArray(imageValue)) {
    imageValue.forEach(item => {
      if (typeof item === "string") {
        candidates.push(item);
        return;
      }
      if (
        item &&
        typeof item === "object" &&
        typeof (item as { url?: unknown }).url === "string"
      ) {
        candidates.push((item as { url: string }).url);
      }
    });
  } else if (imageValue && typeof imageValue === "object") {
    const imageObject = imageValue as { url?: unknown; contentUrl?: unknown };
    if (typeof imageObject.url === "string") {
      candidates.push(imageObject.url);
    }
    if (typeof imageObject.contentUrl === "string") {
      candidates.push(imageObject.contentUrl);
    }
  }

  if (Array.isArray(asRecord["@graph"])) {
    candidates.push(...collectJsonLdImageCandidates(asRecord["@graph"]));
  }

  return candidates;
};

const extractJsonLdImage = (html: string, pageUrl: string): string | null => {
  const jsonLdRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match: RegExpExecArray | null;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    const raw = match[1]?.trim();
    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw);
      const candidates = collectJsonLdImageCandidates(parsed);
      for (const candidate of candidates) {
        const absolute = resolveAbsoluteUrl(candidate, pageUrl);
        if (absolute) {
          return absolute;
        }
      }
    } catch {
      continue;
    }
  }

  return null;
};

const extractMetaContent = (
  html: string,
  attrName: "property" | "name",
  attrValue: string
) => {
  const regex = new RegExp(
    `<meta[^>]*${attrName}=["']${attrValue}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "i"
  );
  const reverseRegex = new RegExp(
    `<meta[^>]*content=["']([^"']+)["'][^>]*${attrName}=["']${attrValue}["'][^>]*>`,
    "i"
  );

  return regex.exec(html)?.[1] ?? reverseRegex.exec(html)?.[1] ?? null;
};

export const extractPageImage = async (url: string): Promise<string | null> => {
  if (!isHttpUrl(url)) {
    return null;
  }

  if (cache.has(url)) {
    return cache.get(url) ?? null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      cache.set(url, null);
      return null;
    }

    const html = await response.text();

    const jsonLdImage = extractJsonLdImage(html, url);
    if (jsonLdImage) {
      cache.set(url, jsonLdImage);
      return jsonLdImage;
    }

    const ogImage = extractMetaContent(html, "property", "og:image");
    const ogAbsolute = resolveAbsoluteUrl(ogImage, url);
    if (ogAbsolute) {
      cache.set(url, ogAbsolute);
      return ogAbsolute;
    }

    const twitterImage = extractMetaContent(html, "name", "twitter:image");
    const twitterAbsolute = resolveAbsoluteUrl(twitterImage, url);
    if (twitterAbsolute) {
      cache.set(url, twitterAbsolute);
      return twitterAbsolute;
    }

    cache.set(url, null);
    return null;
  } catch {
    cache.set(url, null);
    return null;
  } finally {
    clearTimeout(timeout);
  }
};
