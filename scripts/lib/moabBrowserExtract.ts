/**
 * Moab product extraction JS for Browser MCP Runtime.evaluate.
 * Also supports JSON-LD and embedded page JSON per user spec.
 */
export const EXTRACT_MOAB_PRODUCT_JS = `(() => {
  const html = document.documentElement.innerHTML;

  const deepFind = (input, key) => {
    if (!input || typeof input !== 'object') return undefined;
    if (Array.isArray(input)) {
      for (const item of input) {
        const found = deepFind(item, key);
        if (found !== undefined) return found;
      }
      return undefined;
    }
    if (key in input) return input[key];
    for (const value of Object.values(input)) {
      const found = deepFind(value, key);
      if (found !== undefined) return found;
    }
    return undefined;
  };

  const deepCollect = (input, key, values = []) => {
    if (!input || typeof input !== 'object') return values;
    if (Array.isArray(input)) {
      for (const item of input) deepCollect(item, key, values);
      return values;
    }
    for (const [k, value] of Object.entries(input)) {
      if (k === key && typeof value === 'string' && value.trim()) {
        if (!values.includes(value.trim())) values.push(value.trim());
      }
      deepCollect(value, key, values);
    }
    return values;
  };

  const jsonScripts = [];
  for (const script of document.querySelectorAll('script')) {
    const body = (script.textContent || '').trim();
    if (!body.startsWith('{') && !body.startsWith('[')) continue;
    try { jsonScripts.push(JSON.parse(body)); } catch {}
  }

  const jsonLd = [];
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try { jsonLd.push(JSON.parse(script.textContent || '')); } catch {}
  }

  let title = document.querySelector('h1')?.textContent?.trim().replace(/\\s+/g, ' ') || null;
  if (!title) {
    for (const ld of jsonLd) {
      const name = deepFind(ld, 'name');
      if (typeof name === 'string' && name.trim()) { title = name.trim(); break; }
    }
  }

  let priceNum = null;
  const priceHeading = [...document.querySelectorAll('h2')].find(h => /^From \\$/.test(h.textContent || ''));
  const priceText = priceHeading?.textContent?.match(/\\$([0-9][0-9,]*(?:\\.[0-9]{2})?)/);
  if (priceText) {
    priceNum = parseFloat(priceText[1].replace(/,/g, ''));
  } else {
    const priceMatch = html.match(/From[\\s$€£]*([0-9][0-9,]*(?:\\.[0-9]{2})?)/i);
    if (priceMatch) priceNum = parseFloat(priceMatch[1].replace(/,/g, ''));
    else {
      for (const script of jsonScripts) {
        const fromPrice = deepFind(script, 'fromPrice');
        if (typeof fromPrice === 'number') { priceNum = fromPrice; break; }
      }
    }
  }
  const priceFrom = priceNum !== null ? 'From $' + priceNum.toFixed(2) : null;

  let rating = null;
  const ratingMatch = html.match(/"combinedAverageRating"\\s*:\\s*([0-9.]+)/i) ||
    html.match(/"averageRating"\\s*:\\s*([0-9.]+)/i);
  if (ratingMatch) rating = parseFloat(ratingMatch[1]);
  else {
    for (const script of jsonScripts) {
      const r = deepFind(script, 'combinedAverageRating') ?? deepFind(script, 'averageRating');
      if (typeof r === 'number') { rating = r; break; }
    }
  }
  if (rating === null) {
    const bodyRating = document.body.textContent?.match(/([0-9]\\.[0-9])\\s*\\([0-9,]+\\s+Reviews/i);
    if (bodyRating) rating = parseFloat(bodyRating[1]);
  }

  let reviewCount = null;
  const reviewMatch = html.match(/"totalReviews"\\s*:\\s*(\\d+)/i) ||
    html.match(/"reviewCount"\\s*:\\s*(\\d+)/i);
  if (reviewMatch) reviewCount = parseInt(reviewMatch[1].replace(/,/g, ''), 10);
  else {
    for (const script of jsonScripts) {
      const r = deepFind(script, 'totalReviews') ?? deepFind(script, 'reviewCount');
      if (typeof r === 'number') { reviewCount = r; break; }
    }
  }
  if (reviewCount === null) {
    const reviewBtn = [...document.querySelectorAll('button')].find(b => /Reviews/i.test(b.textContent || ''));
    const btnMatch = reviewBtn?.textContent?.match(/([0-9][0-9,]*)\\s+Reviews/i);
    if (btnMatch) reviewCount = parseInt(btnMatch[1].replace(/,/g, ''), 10);
  }

  let duration = null;
  const durationLi = [...document.querySelectorAll('li')].map(li => li.textContent?.trim())
    .find(t => /hours?|minutes?|days?/i.test(t || '') && /approx/i.test(t || ''));
  duration = durationLi || [...document.querySelectorAll('li')].map(li => li.textContent?.trim())
    .find(t => /\\d+\\s*(?:to\\s*\\d+\\s*)?(?:hours?|minutes?|days?)/i.test(t || '')) || null;
  if (!duration) {
    const durationMatch = html.match(/(\\d+(?:\\s*to\\s*\\d+)?\\s*(?:hours?|minutes?|days?)(?:\\s*\\d+\\s*minutes?)?(?:\\s*\\(approx\\.\\))?)/i);
    if (durationMatch) duration = durationMatch[1];
  }

  const hero = (html.match(/https:\\/\\/media\\.tacdn\\.com\\/media\\/attractions-splice-spp-674x446\\/[^"'\\s]+/i) || [])[0] || null;

  const categories = [];
  for (const match of html.matchAll(/"categoryName"\\s*:\\s*"([^"]+)"/gi)) {
    if (!categories.includes(match[1])) categories.push(match[1]);
  }
  for (const script of jsonScripts) {
    for (const name of deepCollect(script, 'categoryName')) {
      if (!categories.includes(name)) categories.push(name);
    }
  }

  const itineraryStops = [];
  for (const match of html.matchAll(/"pointOfInterestName"\\s*:\\s*"([^"]+)"/gi)) {
    if (!itineraryStops.includes(match[1])) itineraryStops.push(match[1]);
  }
  for (const script of jsonScripts) {
    for (const name of deepCollect(script, 'pointOfInterestName')) {
      if (!itineraryStops.includes(name)) itineraryStops.push(name);
    }
  }
  if (!itineraryStops.length) {
    const itineraryHeading = [...document.querySelectorAll('h2')].find(h => h.textContent === 'Itinerary');
    if (itineraryHeading) {
      for (const h3 of itineraryHeading.parentElement?.querySelectorAll('h3') || []) {
        const t = h3.textContent?.trim();
        if (t && !['Pickup points','Pickup details','Arranged start time'].includes(t)) itineraryStops.push(t);
      }
    }
  }

  let overview = null;
  const overviewMatch = html.match(/"overview"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"/i);
  if (overviewMatch) {
    overview = overviewMatch[1].replace(/\\\\n/g, ' ').replace(/\\\\"/g, '"').trim();
  } else {
    for (const script of jsonScripts) {
      const o = deepFind(script, 'overview');
      if (typeof o === 'string' && o.trim().length > 50) { overview = o.trim(); break; }
    }
  }
  if (!overview) {
    const overviewSection = [...document.querySelectorAll('h2')].find(h => h.textContent === 'Overview');
    if (overviewSection) {
      overview = (overviewSection.parentElement?.textContent || '').replace('Overview', '').trim().slice(0, 600);
    }
  }

  return JSON.stringify({
    productCode: (location.href.match(/d\\d+-([A-Z0-9_]+)/i) || [])[1],
    productUrl: location.href.split('?')[0],
    title,
    priceFrom,
    rating,
    reviewCount,
    duration,
    heroUrl: hero,
    overview,
    itineraryStops,
    categories
  });
})()`;
