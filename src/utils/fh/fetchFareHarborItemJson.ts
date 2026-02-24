export type FHItemImage = {
  id?: string | number;
  url?: string;
  secure_url?: string;
  original?: string;
  src?: string;
  full?: string;
  large?: string;
  medium?: string;
  thumb?: string;
  [key: string]: unknown;
};

export type FHItem = {
  id?: string | number;
  item_id?: string | number;
  pk?: string | number;
  images?: FHItemImage[];
  gallery?: FHItemImage[];
  [key: string]: unknown;
};

const itemCache = new Map<string, Promise<FHItem | null>>();

const getItemEndpoint = ({
  operator,
  itemId,
}: {
  operator: string;
  itemId: string | number;
}) =>
  `https://fareharbor.com/api/v1/companies/${encodeURIComponent(operator)}/items/${encodeURIComponent(String(itemId))}/`;

const userAgent =
  "AllOutdoorAdventuresBot/1.0 (+https://www.alloutdooradventures.com)";

export const fetchFareHarborItemJson = async ({
  operator,
  itemId,
}: {
  operator: string;
  itemId: string | number;
}): Promise<FHItem | null> => {
  const cacheKey = `${operator}:${itemId}`;
  const cached = itemCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const requestPromise = (async () => {
    const response = await fetch(getItemEndpoint({ operator, itemId }), {
      headers: {
        Accept: "application/json",
        "user-agent": userAgent,
      },
      cache: "force-cache",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as unknown;
    if (!payload || typeof payload !== "object") {
      return null;
    }

    return payload as FHItem;
  })().catch(() => null);

  itemCache.set(cacheKey, requestPromise);
  return requestPromise;
};
