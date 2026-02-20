const BANNED_PATTERNS = [
  /coverage for .*?\./gi,
  /the same article set references .*?\./gi,
  /distinct article language .*?\./gi,
  /cross-?links? .*?\./gi,
  /article set .*?\./gi,
  /dataset .*?\./gi,
  /this article .*?\./gi,
  /coverage .*?\./gi,
  /evidence-based .*?\./gi,
];

export function cleanLandmarkText(text: string): string {
  if (!text) return text;

  let cleaned = text;

  for (const pattern of BANNED_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }

  return cleaned.replace(/\s+/g, " ").trim();
}
