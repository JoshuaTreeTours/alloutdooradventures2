const BANNED_PHRASES = [
  /travelers?\s+often/gi,
  /travelers?\s+comparing\s+attractions?/gi,
  /visitors?\s+(often|will\s+find)/gi,
  /consistently\s+ranked?/gi,
  /it\s+is\s+recommended/gi,
  /this\s+location\s+combines/gi,
  /you\s+can\s+pair\s+this\s+with/gi,
  /research\s+shows/gi,
  /popular\s+among/gi,
  /comparing\s+attractions?/gi,
  /one\s+of\s+the\s+most\s+valuable\s+things\s+to\s+do/gi,
  /easy\s+recommendation\s+for\s+travelers?/gi,
  /practical\s+stop\s+for\s+understanding/gi,
  /works\s+well\s+as\s+an\s+orientation\s+stop/gi,
  /the\s+surrounding\s+area\s+usually\s+offers[^.]*\./gi,
  /plan\s+for\s+\d+\s+to\s+\d+\s+minutes[^.]*\./gi,
];

const FILLER_PATTERNS = [
  /\s+if\s+you\s+want\s+to\s+visit[^.]*\./gi,
  /\s+for\s+outdoor\s+experiences[^.]*\./gi,
  /\s+it\s+works\s+well[^.]*\./gi,
  /\s+spend\s+time\s+here[^.]*\./gi,
  /\s+target\s+morning\s+or\s+golden\s+hour[^.]*\./gi,
  /\s+without\s+committing\s+to\s+a\s+long\s+hike\.?/gi,
];

const normalize = (value: string): string => value.replace(/\s+/g, ' ').trim();

const splitSentences = (value: string): string[] =>
  value
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

export function rewriteToAuthorityVoice(text: string, maxSentences = 4): string {
  let cleaned = text;

  for (const pattern of [...BANNED_PHRASES, ...FILLER_PATTERNS]) {
    cleaned = cleaned.replace(pattern, ' ');
  }

  cleaned = normalize(cleaned);

  const uniqueSentences: string[] = [];
  for (const sentence of splitSentences(cleaned)) {
    if (!uniqueSentences.includes(sentence)) {
      uniqueSentences.push(sentence);
    }
  }

  const bounded = uniqueSentences.slice(0, Math.min(4, Math.max(2, maxSentences)));
  return normalize(bounded.join(' '));
}
