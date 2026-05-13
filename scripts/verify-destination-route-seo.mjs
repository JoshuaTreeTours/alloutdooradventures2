import { readFile } from 'node:fs/promises';
import path from 'node:path';

const required = [
  '/destinations',
  '/destinations/california',
  '/destinations/california/san-diego',
  '/destinations/california/san-diego/tours',
];
const dist = path.resolve('dist');
const home = 'https://www.alloutdooradventures.com/';
const fails = [];
for (const route of required) {
  const file = path.join(dist, route.replace(/^\//,''), 'index.html');
  let html='';
  try { html = await readFile(file,'utf8'); } catch { fails.push(`${route}:missing-file`); continue; }
  const url = `https://www.alloutdooradventures.com${route}`;
  if (html.includes(`href="${home}"`)) fails.push(`${route}:home-canonical`);
  if (!html.includes(`href="${url}"`)) fails.push(`${route}:canonical`);
  if (!html.includes(`property="og:url" content="${url}"`)) fails.push(`${route}:og:url`);
  if (!html.includes('application/ld+json') || !html.includes(url)) fails.push(`${route}:jsonld`);
}
if (fails.length) { console.error('[verify-destination-route-seo]\n'+fails.join('\n')); process.exit(1);} 
console.log('[verify-destination-route-seo] ok');
