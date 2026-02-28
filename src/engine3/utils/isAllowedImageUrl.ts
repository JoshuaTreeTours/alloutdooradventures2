const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

export function normalizeImageUrl(u?: string): string | null {
  if (!u) {
    return null;
  }

  const value = u.trim();
  if (!value) {
    return null;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return null;
}

export function isAllowedImageUrl(u?: string): boolean {
  const url = normalizeImageUrl(u);
  if (!url) {
    return false;
  }

  const lower = url.toLowerCase();
  const match = lower.match(/\.([a-z0-9]+)(?:\?|#|$)/);
  const ext = match?.[1];

  if (ext) {
    return ALLOWED_EXT.has(ext);
  }

  if (lower.includes("cache.vtrcdn.com/")) {
    return true;
  }

  return false;
}
