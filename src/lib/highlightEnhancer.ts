export function enhanceHighlights(
  input: string[] | undefined,
  max = 3
): string[] {
  if (!input?.length) return [];

  const cleaned = input
    .map(s => (s || "").trim())
    .filter(Boolean)
    .map(s =>
      s
        .replace(/\s+/g, " ")
        .replace(/[.!]+$/g, "")
        .replace(/^(enjoy|experience|discover|explore)\s+/i, "")
    );

  const unique: string[] = [];
  for (const s of cleaned) {
    const key = s.toLowerCase().replace(/[^a-z0-9 ]/g, "");
    if (!unique.some(u => u.toLowerCase().replace(/[^a-z0-9 ]/g, "") === key)) {
      unique.push(s.charAt(0).toUpperCase() + s.slice(1));
    }
    if (unique.length >= max) break;
  }

  return unique;
}
