const encoded = encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'>
  <defs>
    <linearGradient id='bg' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' stop-color='#1f3d2d'/>
      <stop offset='100%' stop-color='#6b8f71'/>
    </linearGradient>
  </defs>
  <rect width='1200' height='800' fill='url(#bg)'/>
  <circle cx='960' cy='180' r='90' fill='rgba(255,255,255,0.18)'/>
  <path d='M0 640 L260 460 L420 590 L640 380 L860 610 L1200 430 L1200 800 L0 800 Z' fill='rgba(0,0,0,0.18)'/>
  <text x='70' y='120' fill='white' font-family='Arial, sans-serif' font-size='42' font-weight='700'>All Outdoor Adventures</text>
  <text x='70' y='172' fill='white' font-family='Arial, sans-serif' font-size='28'>Viator experience image unavailable</text>
</svg>
`);

export const VIATOR_PLACEHOLDER_SVG = `data:image/svg+xml;charset=UTF-8,${encoded}`;
