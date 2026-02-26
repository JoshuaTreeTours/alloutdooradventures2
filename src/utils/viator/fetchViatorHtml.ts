const VIATOR_USER_AGENT =
  "Mozilla/5.0 (compatible; AllOutdoorAdventuresBot/1.0; +https://www.alloutdooradventures.com)";

async function doFetch(viatorUrl: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(viatorUrl, {
      method: "GET",
      headers: {
        "User-Agent": VIATOR_USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Viator fetch failed: ${response.status}`);
    }

    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchViatorHtml(viatorUrl: string): Promise<string> {
  try {
    return await doFetch(viatorUrl);
  } catch {
    return doFetch(viatorUrl);
  }
}
