export function extractFilestackImagesFromHtml(html: string, max = 6): string[] {
  const re = /https:\/\/cdn\.filestackcontent\.com\/([A-Za-z0-9]+)/g;

  const handles = [...html.matchAll(re)].map(m => m[1]);

  const unique: string[] = [];
  for (const handle of handles) {
    if (!unique.includes(handle)) unique.push(handle);
    if (unique.length >= max) break;
  }

  // 🔧 IMPORTANT FIX: add transform prefix to avoid 400 errors
  return unique.map(
    handle => `https://cdn.filestackcontent.com/resize=width:1400/${handle}`
  );
}
