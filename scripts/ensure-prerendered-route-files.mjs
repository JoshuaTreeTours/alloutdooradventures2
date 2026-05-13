import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const distDir = path.resolve('dist');
const templatePath = path.join(distDir, 'index.html');

const buildOutputPath = (pathname) => {
  if (!pathname || pathname === '/') return templatePath;
  const normalized = pathname.replace(/^\/+|\/+$/g, '');
  if (path.extname(normalized)) return path.join(distDir, normalized);
  return path.join(distDir, normalized, 'index.html');
};

const files = (await readdir(distDir)).filter(f => f.startsWith('sitemap') && f.endsWith('.xml'));
const urls = new Set();
for (const file of files) {
  const xml = await readFile(path.join(distDir, file), 'utf8');
  for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const loc = match[1];
    if (!/\.xml$/i.test(loc)) urls.add(loc);
  }
}

const template = await readFile(templatePath, 'utf8');

const expandedPathnames = new Set();
for (const url of urls) {
  const pathname = new URL(url).pathname;
  expandedPathnames.add(pathname);
  const match = pathname.match(/^\/tours\/([^/]+)\/([^/]+)\/([^/]+)$/);
  if (match) {
    const [, state, city, slug] = match;
    expandedPathnames.add(`/destinations/${state}/${city}/tours/${slug}`);
    expandedPathnames.add(`/destinations/${state}/${city}/tours/${slug}/book`);
  }
}

let created = 0;
for (const pathname of expandedPathnames) {
  const outputPath = buildOutputPath(pathname);
  if (outputPath === templatePath) continue;
  try {
    const s = await stat(outputPath);
    if (s.isFile()) continue;
  } catch {}
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, template, 'utf8');
  created += 1;
}

console.log(`[ensure-prerendered-route-files] created ${created} missing HTML files from sitemap URLs.`);
