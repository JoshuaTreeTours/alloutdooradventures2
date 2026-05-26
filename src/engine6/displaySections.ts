const MAX_SECTION_ITEMS = 5;

const normalizeKey = (value: string): string =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const scoreHighlight = (item: string): number => {
  const value = item.toLowerCase();
  let score = 0;

  if (/(unique|small\s*group|private|expert|local|guided|scenic|best|exclusive|award)/i.test(value)) score += 4;
  if (/(experience|visit|explore|enjoy|discover|view|stop|photo|tour|includes?)/i.test(value)) score += 3;
  if (/(hour|minute|duration|sunrise|sunset|timing|depart|return)/i.test(value)) score += 2;
  if (/(accessib|wheelchair)/i.test(value)) score += 1;
  if (/(fitness|physical|safety|risk|pregnan|medical)/i.test(value)) score += 1;

  return score;
};

const scoreAdditionalInfo = (item: string): number => {
  const value = item.toLowerCase();
  let score = 0;

  if (/(wheelchair|stroller|accessib|service\s+animal)/i.test(value)) score += 5;
  if (/(health|medical|pregnan|heart|back\s+problem|condition)/i.test(value)) score += 4;
  if (/(age|minimum|under\s+\d+|children|adult)/i.test(value)) score += 4;
  if (/(cancel|refund|meeting|pickup|drop\s*off|check\s*in|arrival|departure)/i.test(value)) score += 3;
  if (/(bring|wear|gear|equipment|prepare|passport|id|required)/i.test(value)) score += 3;

  return score;
};

const uniqueOrdered = (items: string[]): string[] => {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const raw of items) {
    const value = raw.trim();
    if (!value) continue;
    const key = normalizeKey(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(value);
  }
  return output;
};

const pickTopItems = (items: string[], scorer: (item: string) => number): string[] =>
  items
    .map((item, index) => ({ item, score: scorer(item), index }))
    .sort((a, b) => (b.score === a.score ? a.index - b.index : b.score - a.score))
    .slice(0, MAX_SECTION_ITEMS)
    .map(entry => entry.item);

export const buildEngine6DisplaySections = (
  highlights: string[],
  additionalInfo: string[]
): {
  highlights: string[];
  additionalInfo: string[];
} => {
  const uniqueHighlights = uniqueOrdered(highlights);
  const uniqueAdditional = uniqueOrdered(additionalInfo);

  const selectedHighlights = pickTopItems(uniqueHighlights, scoreHighlight);
  const highlightKeys = new Set(selectedHighlights.map(normalizeKey));

  const additionalWithoutHighlightDupes = uniqueAdditional.filter(
    item => !highlightKeys.has(normalizeKey(item))
  );
  const selectedAdditional = pickTopItems(
    additionalWithoutHighlightDupes,
    scoreAdditionalInfo
  );

  return {
    highlights: selectedHighlights,
    additionalInfo: selectedAdditional,
  };
};
