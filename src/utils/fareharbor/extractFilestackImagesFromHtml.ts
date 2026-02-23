export function extractFilestackImagesFromHtml(
  html: string,
  max = 6
): string[] {
  const re = /https:\/\/cdn\.filestackcontent\.com\/[A-Za-z0-9]+/g;
  const found = html.match(re) ?? [];

  const unique: string[] = [];
  for (const url of found) {
    if (!unique.includes(url)) unique.push(url);
    if (unique.length >= max) break;
  }

  return unique;
}
