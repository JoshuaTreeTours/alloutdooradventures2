const fareHarborHtmlCache = new Map<string, string | null>();
const pendingQueue: Array<() => void> = [];
let inflightCount = 0;
const MAX_CONCURRENT_FETCHES = 2;

const runWithConcurrencyLimit = async <T>(task: () => Promise<T>) => {
  if (inflightCount >= MAX_CONCURRENT_FETCHES) {
    await new Promise<void>(resolve => {
      pendingQueue.push(resolve);
    });
  }

  inflightCount += 1;
  try {
    return await task();
  } finally {
    inflightCount -= 1;
    pendingQueue.shift()?.();
  }
};

export const fetchFareHarborHtml = async (
  fareharborUrl: string,
  timeoutMs = 5000
): Promise<string | null> => {
  if (fareHarborHtmlCache.has(fareharborUrl)) {
    return fareHarborHtmlCache.get(fareharborUrl) ?? null;
  }

  try {
    const html = await runWithConcurrencyLimit(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(fareharborUrl, {
          method: "GET",
          headers: {
            "User-Agent":
              "AllOutdoorAdventuresBot/1.0 (+https://alloutdooradventures.com)",
            Accept: "text/html,application/xhtml+xml",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          return null;
        }

        return await response.text();
      } finally {
        clearTimeout(timeoutId);
      }
    });

    fareHarborHtmlCache.set(fareharborUrl, html);
    return html;
  } catch {
    fareHarborHtmlCache.set(fareharborUrl, null);
    return null;
  }
};
