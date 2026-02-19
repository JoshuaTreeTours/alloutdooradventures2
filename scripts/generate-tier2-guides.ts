import fs from 'node:fs';
import path from 'node:path';
import { states } from '../src/data/destinations';
import { slugify } from '../src/utils/slugify';

type GuideJson = {
  tier: 'tier2';
  title: string;
  country: 'United States';
  state: string;
  city: string;
  slug: string;
  hero: { image: string; alt: string; headline: string; subheadline: string };
  overview: string[];
  highlights: Array<{ title: string; description: string }>;
  thingsToDo: Array<{ title: string; description: string }>;
  bestTimeToVisit: { title: string; bullets: string[] };
  travelTips: string[];
  faq: Array<{ q: string; a: string }>;
  tours: { stateSlug: string; citySlug: string; limit: number; title: string };
  seoLinks: { wikipedia: string; officialTourism: string; reference: string };
};

const STATE_TOURISM_FALLBACKS: Record<string, string> = {
  alaska: 'https://www.travelalaska.com/', arizona: 'https://www.visitarizona.com/', california: 'https://www.visitcalifornia.com/', colorado: 'https://www.colorado.com/', 'district-of-columbia': 'https://washington.org/', florida: 'https://www.visitflorida.com/', georgia: 'https://www.exploregeorgia.org/', hawaii: 'https://www.gohawaii.com/', illinois: 'https://www.enjoyillinois.com/', indiana: 'https://www.visitindiana.com/', louisiana: 'https://www.explorelouisiana.com/', maryland: 'https://www.visitmaryland.org/', massachusetts: 'https://www.massvacation.com/', michigan: 'https://www.michigan.org/', minnesota: 'https://www.exploreminnesota.com/', missouri: 'https://www.visitmo.com/', montana: 'https://www.visitmt.com/', nevada: 'https://travelnevada.com/', 'new-mexico': 'https://www.newmexico.org/', 'new-york': 'https://www.iloveny.com/', 'north-carolina': 'https://www.visitnc.com/', ohio: 'https://www.ohiotheheartofitall.com/', oregon: 'https://traveloregon.com/', pennsylvania: 'https://www.visitpa.com/', 'south-carolina': 'https://discoversouthcarolina.com/', tennessee: 'https://www.tnvacation.com/', texas: 'https://www.traveltexas.com/', utah: 'https://www.visitutah.com/', washington: 'https://stateofwatourism.com/', wisconsin: 'https://www.travelwisconsin.com/', wyoming: 'https://travelwyoming.com/'
};

const guidesBase = path.resolve('src/data/guides/us');
const existing = new Set<string>();
for (const stateSlug of fs.readdirSync(guidesBase)) {
  const stateDir = path.join(guidesBase, stateSlug);
  if (!fs.statSync(stateDir).isDirectory()) continue;
  for (const fileName of fs.readdirSync(stateDir)) {
    if (!fileName.endsWith('.json') || fileName === 'index.json') continue;
    existing.add(`${stateSlug}/${fileName.replace(/\.json$/, '')}`);
  }
}

const normalizeTitle = (source: string, fallback: string) => {
  const cleaned = source
    .replace(/^(walk|hike|bike|paddle|explore|visit|take|spend|plan|ride|tour)\s+/i, '')
    .replace(/\.$/, '')
    .trim();
  if (!cleaned) return fallback;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const makeThingDescription = (city: string, place: string, idx: number) => {
  const variants = [
    `Start with ${place} to experience a signature side of ${city}. This stop works well as a morning anchor, then pair it with nearby cafes, neighborhood walks, or a short guided outing to keep your ${city} plan efficient and varied.`,
    `${place} is a reliable addition to any ${city} itinerary. You can spend an hour or two here, then connect to local dining, waterfront paths, or cultural stops nearby so your day in ${city} feels balanced without extra transit time.`,
    `If you are choosing only a few highlights in ${city}, include ${place}. It delivers a memorable sense of place and combines easily with nearby districts, outdoor viewpoints, and local experiences, making it a practical and rewarding part of your ${city} trip.`,
    `Plan time at ${place} for one of the most approachable experiences in ${city}. It is easy to pair with local neighborhoods, seasonal events, and short outdoor breaks, giving first-time visitors a strong, low-stress way to explore ${city}.`,
  ];
  return variants[idx % variants.length];
};

const created: string[] = [];
for (const state of states) {
  for (const city of state.cities) {
    const key = `${state.slug}/${city.slug}`;
    if (existing.has(key)) continue;

    const things = (city.thingsToDo.length ? city.thingsToDo : [
      `Visit downtown ${city.name}.`,
      `Explore local neighborhoods in ${city.name}.`,
      `Spend time at a nearby park in ${city.name}.`,
      `Try a locally guided experience in ${city.name}.`,
    ]).slice(0, 4).map((item, idx) => {
      const title = normalizeTitle(item, `${city.name} highlight ${idx + 1}`);
      return {
        title,
        description: makeThingDescription(city.name, title, idx),
      };
    });

    const tourism = STATE_TOURISM_FALLBACKS[state.slug] ?? 'https://www.usa.gov/visit-state-tourism-offices';
    const wikiCity = city.name.replace(/\s+/g, '_');
    const brit = city.name.replace(/\s+/g, '-');

    const guide: GuideJson = {
      tier: 'tier2',
      title: `${city.name}, ${state.name} Travel Guide`,
      country: 'United States',
      state: state.name,
      city: city.name,
      slug: `guides/us/${state.slug}/${city.slug}`,
      hero: {
        image: '',
        alt: `${city.name}, ${state.name} skyline and attractions`,
        headline: `${city.name}, ${state.name} Travel Guide`,
        subheadline: `Quick planning notes, practical activities, and local context to help you build a focused ${city.name} itinerary.`,
      },
      overview: [
        `${city.name}, ${state.name} is a practical base for travelers who want a mix of recognizable landmarks, local neighborhoods, and easy outdoor access. This Tier-2 guide highlights a concise set of high-value stops so you can plan faster without missing the essentials. Use one anchor area each day, then add a nearby experience to keep logistics simple and give your ${city.name} trip a balanced rhythm.`,
      ],
      highlights: [
        { title: `Core ${city.name} landmarks`, description: `Start with a signature location to orient your trip.` },
        { title: `${city.name} local character`, description: `Add one neighborhood or culture-focused stop each day.` },
      ],
      thingsToDo: things,
      bestTimeToVisit: {
        title: `Spring and fall are typically the easiest seasons in ${city.name}`,
        bullets: [
          'Shoulder seasons usually offer more comfortable walking conditions.',
          'Book popular activities early during peak travel windows.',
          'Use early starts for major landmarks and scenic areas.',
        ],
      },
      travelTips: [
        `Cluster activities by area so your ${city.name} itinerary stays efficient.`,
        'Reserve top tours and timed attractions before arrival when possible.',
        'Leave one flexible block each day for weather or local recommendations.',
      ],
      faq: [
        { q: `How many days do I need in ${city.name}?`, a: `A focused two- to three-day trip covers major ${city.name} highlights and one local experience.` },
        { q: `Should I pre-book activities in ${city.name}?`, a: 'Yes for top-rated tours, weekends, and seasonal peak dates.' },
      ],
      tours: { stateSlug: state.slug, citySlug: city.slug, limit: 6, title: `Top ${city.name} tours` },
      seoLinks: {
        wikipedia: `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiCity)}`,
        officialTourism: tourism,
        reference: `https://www.britannica.com/place/${encodeURIComponent(brit)}`,
      },
    };

    const stateDir = path.join(guidesBase, state.slug);
    fs.mkdirSync(stateDir, { recursive: true });
    const outPath = path.join(stateDir, `${city.slug}.json`);
    fs.writeFileSync(outPath, `${JSON.stringify(guide, null, 2)}\n`, 'utf8');
    created.push(key);
  }
}

console.log(`Created ${created.length} tier2 guides.`);
