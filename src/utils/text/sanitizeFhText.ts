export type FhTokenReplacements = {
  itemName?: string;
  durationText?: string;
};

export const decodeUnicodeEscapes = (input: string): string => {
  if (!input) return "";

  let text = input;
  text = text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
    String.fromCharCode(Number.parseInt(hex, 16))
  );
  text = text
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\r/g, "\r")
    .replace(/\\\//g, "/")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\");

  return text;
};

const cleanupSentence = (value: string) =>
  value
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/[\s,;:-]+$/g, "")
    .trim();

export const stripTemplateTokens = (
  input: string,
  replacements: FhTokenReplacements = {}
): string => {
  if (!input) return "";

  let text = input;
  text = text.replace(/\[!\s*item\.name\s*!\]/gi, replacements.itemName ?? "");
  text = text.replace(
    /%\(durationTypes\)/gi,
    replacements.durationText ?? ""
  );

  text = text.replace(/\[!\s*[^\]]+\s*!\]/g, "");
  text = text.replace(/%\([^)]+\)/g, "");

  return cleanupSentence(text);
};

export const isBadTokenString = (input: string) => {
  if (!input) return false;
  return (
    /\[!\s*.*?!\]/.test(input) ||
    /%\([^)]+\)/.test(input) ||
    /\\u00[0-9a-fA-F]{2}/.test(input) ||
    /\{\\u0022singular\\u0022:/.test(input) ||
    /FlowNode|Policy\{/.test(input)
  );
};

export const sanitizeFhText = (
  input: string,
  replacements: FhTokenReplacements = {}
) => stripTemplateTokens(decodeUnicodeEscapes(input), replacements);
