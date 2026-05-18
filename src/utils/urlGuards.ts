const BAD_URL_TOKENS = [
  "__seo",
  "seo_canonical",
  "undefined",
  "null",
  "placeholder",
];

export const hasMalformedUrlToken = (value: string): boolean => {
  const lower = value.toLowerCase();
  if (BAD_URL_TOKENS.some((token) => lower.includes(token))) return true;
  if (lower.includes("/canonical/canonical") || lower.includes("-canonical-canonical")) return true;
  return false;
};

export const sanitizePathOrNull = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (hasMalformedUrlToken(normalized)) return null;
  return normalized.replace(/\/+/g, "/");
};
