type ResolveFareHarborUrlArgs = {
  origin: string;
  pathname: string;
};

const resolvedBookUrlCache = new Map<string, Promise<string | null>>();

const cleanHref = (value: string): string =>
  value
    .trim()
    .replace(/&amp;/g, "&")
    .replace(/^\"|\"$/g, "");

const extractFareHarborLinks = (html: string): string[] => {
  const links: string[] = [];
  const anchorHrefRegex = /<a\b[^>]*href\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi;
  let match = anchorHrefRegex.exec(html);
  while (match) {
    const href = cleanHref(match[1] ?? match[2] ?? match[3] ?? "");
    if (href.includes("fareharbor.com")) {
      links.push(href);
    }
    match = anchorHrefRegex.exec(html);
  }

  return links;
};

const normalizeFareHarborUrl = (href: string): string | null => {
  if (!href.includes("fareharbor.com")) {
    return null;
  }

  try {
    const parsed = new URL(href.startsWith("http") ? href : `https:${href}`);
    if (!parsed.hostname.includes("fareharbor.com")) {
      return null;
    }

    if (!parsed.pathname.includes("/items/")) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
};

const pickBestFareHarborUrl = (links: string[]): string | null => {
  const normalized = links
    .map(normalizeFareHarborUrl)
    .filter((value): value is string => Boolean(value));

  if (!normalized.length) {
    return null;
  }

  const embeds = normalized.find(
    link => link.includes("/embeds/book/") || link.includes("/book/")
  );

  return embeds ?? normalized[0];
};

export const resolveFareHarborUrlFromBookPage = async ({
  origin,
  pathname,
}: ResolveFareHarborUrlArgs): Promise<string | null> => {
  if (!origin || !pathname) {
    return null;
  }

  const trimmedPath = pathname.replace(/\/$/, "");
  const cacheKey = `${origin}${trimmedPath}`;
  const cached = resolvedBookUrlCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const resolverPromise = (async () => {
    const previewBust =
      typeof process !== "undefined" && process.env.NODE_ENV !== "production"
        ? `?t=${Date.now()}`
        : "";
    const bookPageUrl = `${origin}${trimmedPath}/book${previewBust}`;

    try {
      const response = await fetch(bookPageUrl, {
        cache:
          typeof process !== "undefined" && process.env.NODE_ENV !== "production"
            ? "no-store"
            : "default",
      });
      if (!response.ok) {
        return null;
      }

      const html = await response.text();
      const links = extractFareHarborLinks(html);
      return pickBestFareHarborUrl(links);
    } catch {
      return null;
    }
  })();

  resolvedBookUrlCache.set(cacheKey, resolverPromise);
  return resolverPromise;
};
