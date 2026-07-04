/**
 * Extract live product page data via browser CDP helper.
 * Parent agent runs browser CDP evaluate with EXTRACT_JS on each product URL.
 */
export const EXTRACT_PRODUCT_JS = `(() => {
  const html = document.documentElement.innerHTML;
  const hero = (html.match(/https:\\/\\/media\\.tacdn\\.com\\/media\\/attractions-splice-spp-674x446\\/[^"'\\s]+/i) || [])[0] || null;
  const title = document.querySelector('h1')?.textContent?.trim() || null;
  const priceHeading = [...document.querySelectorAll('h2')].find(h => /^From \\$/.test(h.textContent || ''));
  const priceText = priceHeading?.textContent?.match(/\\$([0-9][0-9,]*(?:\\.[0-9]{2})?)/);
  const price = priceText ? parseFloat(priceText[1].replace(/,/g, '')) : null;
  const reviewBtn = [...document.querySelectorAll('button')].find(b => /Reviews/i.test(b.textContent || ''));
  const reviewMatch = reviewBtn?.textContent?.match(/([0-9][0-9,]*)\\s+Reviews/i);
  const reviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, ''), 10) : null;
  const ratingMatch = document.body.textContent?.match(/([0-9]\\.[0-9])\\s*\\([0-9,]+\\s+Reviews/i);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
  const durationLi = [...document.querySelectorAll('li')].map(li => li.textContent?.trim()).find(t => /hours?|minutes?|days?/i.test(t || '') && /approx/i.test(t || ''));
  const duration = durationLi || [...document.querySelectorAll('li')].map(li => li.textContent?.trim()).find(t => /\\d+\\s*(?:to\\s*\\d+\\s*)?(?:hours?|minutes?|days?)/i.test(t || '')) || null;
  const overviewSection = [...document.querySelectorAll('h2')].find(h => h.textContent === 'Overview');
  let overview = '';
  if (overviewSection) {
    const parent = overviewSection.parentElement;
    overview = (parent?.textContent || '').replace('Overview', '').trim().split('Travel through')[0].trim();
    if (!overview) overview = (parent?.textContent || '').replace('Overview', '').trim().slice(0, 600);
  }
  const highlights = [];
  if (overviewSection) {
    const lis = overviewSection.parentElement?.querySelectorAll('li') || [];
    for (const li of lis) {
      const t = li.textContent?.trim();
      if (t && t.length > 15 && t.length < 140) highlights.push(t);
    }
  }
  const itineraryHeading = [...document.querySelectorAll('h2')].find(h => h.textContent === 'Itinerary');
  const stops = [];
  if (itineraryHeading) {
    let el = itineraryHeading.nextElementSibling;
    while (el) {
      const h3s = el.querySelectorAll ? el.querySelectorAll('h3') : [];
      for (const h3 of h3s) {
        const t = h3.textContent?.trim();
        if (t && !['Pickup points','Pickup details','Arranged start time'].includes(t)) stops.push(t);
      }
      if (stops.length) break;
      el = el.nextElementSibling;
    }
    if (!stops.length) {
      let capture = false;
      for (const h of [...document.querySelectorAll('h2,h3')]) {
        if (h.textContent === 'Itinerary') { capture = true; continue; }
        if (capture && h.tagName === 'H2') break;
        if (capture && h.tagName === 'H3') stops.push(h.textContent?.trim());
      }
    }
  }
  const meetingHeading = [...document.querySelectorAll('h2')].find(h => h.textContent === 'Meeting and Pickup');
  let startDescription = '';
  if (meetingHeading) {
    const details = [...document.querySelectorAll('h3')].find(h => h.textContent === 'Pickup details');
    startDescription = details?.nextElementSibling?.textContent?.trim() || meetingHeading.parentElement?.textContent?.replace('Meeting and Pickup','').trim().slice(0,300) || '';
  }
  const inclusions = [];
  const inclHeading = [...document.querySelectorAll('h2')].find(h => h.textContent === "What's Included");
  if (inclHeading) {
    for (const li of inclHeading.parentElement?.querySelectorAll('li') || []) {
      const t = li.textContent?.trim();
      if (t) inclusions.push(t);
    }
  }
  const categories = [...new Set([...document.querySelectorAll('a')].map(a => a.textContent?.trim()).filter(t => t && /Tours|Rafting|Wildlife|Horseback|Safari|Float|Private|Day Trip/i.test(t)).slice(0, 6))];
  return JSON.stringify({
    productCode: (location.href.match(/d\\d+-([A-Z0-9_]+)/i) || [])[1],
    productUrl: location.href.split('?')[0],
    title, priceFrom: price ? 'From $' + price.toFixed(2) : null, price,
    rating, reviewCount, duration, heroUrl: hero,
    overview: overview.slice(0, 500), highlights: highlights.slice(0, 5),
    itineraryStops: stops.filter(s => s && !/Review|Response from Host/i.test(s)).slice(0, 10),
    startDescription: startDescription.slice(0, 300),
    endDescription: 'Return to your Jackson Hole pickup location after the final stop.',
    inclusions: inclusions.slice(0, 6),
    categories: categories.length ? categories : ['Sightseeing Tours']
  });
})()`;
