import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const filePath = path.resolve('dist/index.html');
const html = await readFile(filePath, 'utf8');

const title = 'All Outdoor Adventures | Tours, Guides & Outdoor Experiences';
const description = 'Discover outdoor tours, travel guides, and curated adventure experiences across top destinations with All Outdoor Adventures.';
const url = 'https://www.alloutdooradventures.com/';

const replacements = {
  '__SEO_TITLE__': title,
  '__SEO_DESCRIPTION__': description,
  '__SEO_CANONICAL__': url,
  '__SEO_OG_TITLE__': title,
  '__SEO_OG_DESCRIPTION__': description,
  '__SEO_OG_URL__': url,
  '__SEO_TWITTER_TITLE__': title,
  '__SEO_TWITTER_DESCRIPTION__': description,
};

const image = `${url}hero.jpg`;
replacements['__SEO_OG_IMAGE__'] = image;
replacements['__SEO_TWITTER_IMAGE__'] = image;

let output = html;
for (const [token, value] of Object.entries(replacements)) {
  output = output.replaceAll(token, value);
}

await writeFile(filePath, output, 'utf8');
console.log('[fix-root-index-seo] Root index SEO placeholders resolved.');
