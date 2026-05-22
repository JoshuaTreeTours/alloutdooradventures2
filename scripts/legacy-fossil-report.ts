import { tours as allTours } from "../src/data/tours";
import { buildLegacyTourRouteSeo } from "../src/lib/legacyRouteSeo";
import { buildTourMeta } from "../src/lib/tourMeta";

const SITE = "https://www.alloutdooradventures.com";
const HOMEPAGE_CANONICAL = `${SITE}/`;
const HOMEPAGE_IMAGE = `${SITE}/hero.jpg`;

const isEngine6 = (tour: any) => tour?.engine === "engine6";
const toLegacyPath = (tour: any) => `/tours/${tour.destination.stateSlug}/${tour.destination.citySlug}/${tour.slug}`;

const legacyTours = allTours.filter(tour => !isEngine6(tour));

const homepageFallback: string[] = [];
const noRecoverableImage: string[] = [];
const heroJpgResidual: string[] = [];
const unresolved: string[] = [];

for (const tour of legacyTours) {
  const path = toLegacyPath(tour);
  const seo = buildLegacyTourRouteSeo({ pathname: path, tours: legacyTours as any, buildTourMetaFn: buildTourMeta as any, site: SITE });
  if (!seo) {
    unresolved.push(path);
    continue;
  }

  if (!seo.url || seo.url === HOMEPAGE_CANONICAL) homepageFallback.push(path);
  if (!seo.image) noRecoverableImage.push(path);
  if (seo.image === "/hero.jpg" || seo.image === HOMEPAGE_IMAGE) heroJpgResidual.push(path);
}

console.log("[legacy-fossil-report] summary");
console.log(`legacy_tours_scanned=${legacyTours.length}`);
console.log(`homepage_fallback_count=${homepageFallback.length}`);
console.log(`no_recoverable_image_count=${noRecoverableImage.length}`);
console.log(`hero_jpg_residual_count=${heroJpgResidual.length}`);
console.log(`unresolved_route_count=${unresolved.length}`);

const printList = (name: string, rows: string[]) => {
  console.log(`\n## ${name} (${rows.length})`);
  rows.slice(0, 200).forEach(route => console.log(route));
  if (rows.length > 200) console.log(`... truncated ${rows.length - 200} more`);
};

printList("homepage_fallback_routes", homepageFallback);
printList("no_recoverable_image_routes", noRecoverableImage);
printList("hero_jpg_residual_routes", heroJpgResidual);
printList("unresolved_routes", unresolved);
