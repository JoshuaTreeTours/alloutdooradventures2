import { SITE_URL } from "../seo";

type ResolveFareHarborUrlFromBookPageInput = {
  pathname: string;
};

const extractHref = (anchorTag: string) => {
  const hrefMatch = anchorTag.match(/href\s*=\s*(["'])(.*?)\1/i);
  return hrefMatch?.[2]?.trim() ?? null;
};

const extractFareHarborCandidateFromTrackingUrl = (url: URL) => {
  for (const key of ["url", "u", "redirect", "target", "to", "dest"]) {
    const value = url.searchParams.get(key);
    if (!value) {
      continue;
    }

    try {
      const decoded = decodeURIComponent(value);
      if (/fareharbor\.com/i.test(decoded)) {
        return decoded;
      }
    } catch {
      if (/fareharbor\.com/i.test(value)) {
        return value;
      }
    }
  }

  return null;
};

const normalizeFareHarborUrl = (href: string, baseUrl: string) => {
  try {
    const absolute = new URL(href, baseUrl);
    const trackingCandidate =
      extractFareHarborCandidateFromTrackingUrl(absolute);

    if (trackingCandidate) {
      const trackedAbsolute = new URL(trackingCandidate, baseUrl);
      if (/fareharbor\.com$/i.test(trackedAbsolute.hostname)) {
        return trackedAbsolute.toString();
      }
    }

    if (/fareharbor\.com$/i.test(absolute.hostname)) {
      return absolute.toString();
    }
  } catch {
    return null;
  }

  return null;
};

export const resolveFareHarborUrlFromBookPage = async ({
  pathname,
}: ResolveFareHarborUrlFromBookPageInput): Promise<string | null> => {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const isPreview = process.env.VERCEL_ENV === "preview";
  const cacheBust = isPreview ? `?t=${Date.now()}` : "";
  const bookPageUrl = `${SITE_URL}${normalizedPath}/book${cacheBust}`;

  try {
    const response = await fetch(bookPageUrl, {
      cache: isPreview ? "no-store" : "force-cache",
    });

    const fetched = response.ok;
    if (/shared-san-andreas-fault-jeep-tour-34849/.test(pathname)) {
      console.info(`34849: bookPageFetched=${fetched}`);
    }

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const anchorMatches = Array.from(
      html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi),
      match => match[0]
    );
    const bookAnchor = anchorMatches.find(anchor => /\bbook\b/i.test(anchor));
    const href = bookAnchor ? extractHref(bookAnchor) : null;
    const fareharborUrl = href
      ? normalizeFareHarborUrl(href, bookPageUrl)
      : null;

    if (/shared-san-andreas-fault-jeep-tour-34849/.test(pathname)) {
      console.info(`34849: fhUrlFound=${fareharborUrl ? "true" : "false"}`);
      if (fareharborUrl) {
        const parsed = new URL(fareharborUrl);
        console.info(`34849: fhUrl=${parsed.hostname}${parsed.pathname}`);
      }
    }

    return fareharborUrl;
  } catch {
    if (/shared-san-andreas-fault-jeep-tour-34849/.test(pathname)) {
      console.info("34849: bookPageFetched=false");
      console.info("34849: fhUrlFound=false");
    }
    return null;
  }
};
