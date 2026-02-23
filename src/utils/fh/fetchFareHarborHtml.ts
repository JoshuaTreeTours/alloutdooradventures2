const FH_HTML_CACHE = new Map<string, Promise<string | null>>();
const FH_TIMEOUT_MS = 9_000;

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

export const fetchFareHarborHtml = async (
  fareharborUrl: string
): Promise<string | null> => {
  if (!fareharborUrl || !fareharborUrl.includes("fareharbor.com")) {
    return null;
  }

  const cacheKey = hashString(fareharborUrl);
  const cached = FH_HTML_CACHE.get(cacheKey);
  if (cached) {
    return cached;
  }

  const requestPromise = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FH_TIMEOUT_MS);

    try {
      const response = await fetch(fareharborUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; alloutdooradventures-fh-parser/1.0; +https://www.alloutdooradventures.com)",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        return null;
      }

      return await response.text();
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  })();

  FH_HTML_CACHE.set(cacheKey, requestPromise);
  return requestPromise;
};
