const resolvedFareHarborUrlCache = new Map<string, string | null>();

type ResolveFareHarborUrlFromBookPageInput = {
  origin: string;
  pathname: string;
};

const normalizeFareHarborUrl = (href: string) => {
  try {
    const url = new URL(href);
    if (!/fareharbor\.com$/i.test(url.hostname)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
};

const extractFareHarborHref = (html: string): string | null => {
  const anchorMatches =
    html.match(/<a\b[^>]*href=["'][^"']*["'][^>]*>/gi) ?? [];
  for (const anchor of anchorMatches) {
    const hrefMatch = anchor.match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) {
      continue;
    }

    if (/fareharbor\.com/i.test(hrefMatch[1])) {
      return hrefMatch[1];
    }
  }

  return null;
};

export const resolveFareHarborUrlFromBookPage = async ({
  origin,
  pathname,
}: ResolveFareHarborUrlFromBookPageInput): Promise<string | null> => {
  const normalizedPathname = pathname.replace(/\/$/, "");
  const cacheKey = normalizedPathname;
  if (resolvedFareHarborUrlCache.has(cacheKey)) {
    return resolvedFareHarborUrlCache.get(cacheKey) ?? null;
  }

  const isPreview =
    typeof process !== "undefined" && process.env.VERCEL_ENV === "preview";
  const bookUrl = new URL(`${normalizedPathname}/book`, origin);
  if (isPreview) {
    bookUrl.searchParams.set("t", `${Date.now()}`);
  }

  try {
    const response = await fetch(bookUrl.toString(), {
      cache: isPreview ? "no-store" : "default",
    });
    if (!response.ok) {
      resolvedFareHarborUrlCache.set(cacheKey, null);
      return null;
    }

    const html = await response.text();
    const rawHref = extractFareHarborHref(html);
    if (!rawHref) {
      resolvedFareHarborUrlCache.set(cacheKey, null);
      return null;
    }

    const normalizedHref = normalizeFareHarborUrl(
      rawHref.startsWith("http") ? rawHref : new URL(rawHref, origin).toString()
    );
    resolvedFareHarborUrlCache.set(cacheKey, normalizedHref);
    return normalizedHref;
  } catch {
    resolvedFareHarborUrlCache.set(cacheKey, null);
    return null;
  }
};
