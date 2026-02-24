const FILESTACK_BASE = "https://cdn.filestackcontent.com/";
const HANDLE_RE = /^[A-Za-z0-9]{15,}$/;

const cleanPathToken = (token: string) =>
  token.replace(/[),.;!?]+$/g, "").trim();

const toFilestackUrl = (candidateUrl: string): string | null => {
  try {
    const parsed = new URL(candidateUrl);
    if (parsed.origin !== "https://cdn.filestackcontent.com") {
      return null;
    }

    const segments = parsed.pathname
      .split("/")
      .map(part => cleanPathToken(part))
      .filter(Boolean);

    const handle = segments.at(-1);
    if (!handle || !HANDLE_RE.test(handle)) {
      return null;
    }

    return `${FILESTACK_BASE}${handle}`;
  } catch {
    return null;
  }
};

export function extractFilestackImagesFromHtml(
  html: string,
  max = 6
): string[] {
  const re = /https:\/\/cdn\.filestackcontent\.com\/[^")'\s<]+/g;
  const found = html.match(re) ?? [];

  const unique: string[] = [];
  for (const raw of found) {
    const normalized = toFilestackUrl(cleanPathToken(raw));
    if (!normalized) {
      continue;
    }

    if (!unique.includes(normalized)) {
      unique.push(normalized);
    }

    if (unique.length >= max) {
      break;
    }
  }

  return unique;
}
