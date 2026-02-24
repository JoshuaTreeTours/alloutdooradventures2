const normalizeHighlight = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const dedupeHighlights = (
  highlights: string[],
  maxItems = 10
): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const highlight of highlights) {
    const clean = highlight.trim();
    if (!clean) continue;
    const normalized = normalizeHighlight(clean);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(clean);
    if (result.length >= maxItems) break;
  }

  return result;
};
