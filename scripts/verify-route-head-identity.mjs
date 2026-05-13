import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
const homeTitle = 'All Outdoor Adventures | Tours, Guides & Outdoor Experiences';
const homeCanonical = 'https://www.alloutdooradventures.com/';

async function walk(dir){
  const out=[]; const ents=await readdir(dir,{withFileTypes:true});
  for(const e of ents){const p=path.join(dir,e.name); if(e.isDirectory()) out.push(...await walk(p)); else if(e.isFile()&&e.name==='index.html') out.push(p);}return out;
}
const files=await walk(dist);
const failures=[];
for(const file of files){
  const rel='/'+path.relative(dist,path.dirname(file)).replace(/\\/g,'/').replace(/(^|\/)index$/,'');
  const route=rel==='/'?'/':rel;
  const html=await readFile(file,'utf8');
  const t=(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]?.trim()||'';
  const c=(html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)||[])[1]||'';
  const og=(html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i)||[])[1]||'';
  const ld=(html.match(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/i)||[])[1]||'';
  if(route!=='/' && t===homeTitle) failures.push(`${route}:home-title`);
  if(route!=='/' && c===homeCanonical) failures.push(`${route}:home-canonical`);
  if(route!=='/' && og===homeCanonical) failures.push(`${route}:home-og-url`);
  if(c && og && c!==og) failures.push(`${route}:og-mismatch`);
  if(route!=='/' && ld && ld.includes(homeCanonical)) failures.push(`${route}:jsonld-home-url`);
  if(c && ld && !ld.includes(c)) failures.push(`${route}:jsonld-url-mismatch`);
  if(html.includes('__SEO_')) failures.push(`${route}:placeholder`);
}
if(failures.length){console.error('[verify-route-head-identity]\n'+failures.slice(0,200).join('\n'));process.exit(1);} 
console.log(`[verify-route-head-identity] verified ${files.length} route files.`);
