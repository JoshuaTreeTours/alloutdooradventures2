import type { GuidePageData } from "../utils/loadGuide";

const sentenceCount = (text: string) =>
  (text.match(/[.!?](?:\s|$)/g) ?? []).length;

const bannedTemplatePhrases = [
  "build this stop into the day",
  "rather than treating it as a generic checklist item",
  "check current hours, reservations, closures and transit conditions before visiting",
];

const things: [string, string][] = [
  [
    "California State Capitol",
    "California's present Capitol was built between 1860 and 1874 after Sacramento became the permanent state capital in 1854. The building remains a working seat of government, housing the chambers of the State Assembly and State Senate as well as the Governor's office. A major restoration completed in 1982 strengthened the historic structure for earthquakes while returning many rooms and architectural details to their earlier appearance. Capitol Park surrounds the building with a forty-acre landscape of mature trees, memorials and gardens that began taking shape in the nineteenth century."
  ],
  [
    "Old Sacramento Waterfront",
    "Old Sacramento preserves the riverfront commercial district that grew rapidly during the California Gold Rush. The district became a transportation crossroads for riverboats, wagon trains, the Pony Express, the transcontinental telegraph and the western end of the first transcontinental railroad. Surviving landmarks include the 1853 B. F. Hastings Building, where the California Supreme Court once met, and the 1855 Big Four Building associated with the Central Pacific Railroad. The historic district was designated a National Historic Landmark in 1965, making the streets themselves part of the story rather than merely a backdrop for shops and restaurants."
  ],
  [
    "California State Railroad Museum",
    "The California State Railroad Museum interprets the railroads that transformed Sacramento, California and the American West. Sacramento merchants and investors helped organize the Central Pacific Railroad in 1862, and construction of its portion of the transcontinental railroad began on the Sacramento waterfront in 1863. The museum's full-size locomotives and passenger cars let visitors examine the technology and working environments behind that expansion instead of encountering railroad history only through photographs. Its location in Old Sacramento is especially meaningful because the surrounding waterfront was itself a major nineteenth-century rail and river transportation hub."
  ],
  [
    "Sutter's Fort State Historic Park",
    "Sutter's Fort preserves the site of John Sutter's agricultural and trading settlement, established in the Sacramento Valley in 1839. The fort became an important destination for overland migrants before the Gold Rush and stood at the center of the colonial and economic changes reshaping the region. Its story also requires attention to the Native peoples whose lands, labor and lives were profoundly affected by Sutter's enterprise and the influx of settlers. Visiting the reconstructed adobe complex adds essential context to Sacramento's growth before the riverfront boom and state-capital era."
  ],
  [
    "Crocker Art Museum",
    "The Crocker Art Museum traces its origins to the art collection assembled by Sacramento judge and railroad attorney Edwin B. Crocker and his wife Margaret during the nineteenth century. Their Italianate mansion and purpose-built gallery became a public museum in 1885, giving Sacramento one of the West's longest-established art institutions. The collection is particularly strong in California art while also spanning European works, ceramics, photography and art from several world traditions. The historic Crocker buildings and the modern Teel Family Pavilion make the museum useful both for its collections and for seeing how Sacramento's cultural institutions evolved beyond the Gold Rush narrative."
  ],
  [
    "American River Parkway",
    "The American River Parkway follows the lower American River through the Sacramento metropolitan area and provides a long green corridor through an otherwise urban landscape. The Jedediah Smith Memorial Trail forms its principal paved bicycle and walking route, connecting parks and river access points over many miles. Cottonwood and oak habitat along the river supports birds and other wildlife, while seasonal water levels and summer heat strongly affect how the corridor feels from month to month. For visitors, the parkway shows that Sacramento's identity is tied not only to government and Gold Rush history but also to the confluence of major rivers that determined where the city developed."
  ],
  [
    "Tower Bridge and Sacramento River",
    "Tower Bridge crosses the Sacramento River immediately west of downtown and links Sacramento with West Sacramento. The vertical-lift bridge opened in 1935 and remains one of the city's most recognizable pieces of transportation architecture. Walking the riverfront near the bridge gives a clear view of the waterway that carried people, agricultural products and freight long before highways became dominant. It also helps explain why Old Sacramento developed where it did: the river was an economic artery as well as a geographic boundary."
  ],
  [
    "Midtown Sacramento",
    "Midtown extends east of the central business district in a street grid shaded by many mature trees and lined with houses, apartments, restaurants, galleries and small businesses. Its surviving Victorian and early twentieth-century architecture provides a residential counterpoint to the monumental government buildings around the Capitol. The neighborhood is also one of the easiest parts of Sacramento to explore on foot, especially when paired with nearby Sutter's Fort or the Capitol. Spending time here reveals a living central-city neighborhood rather than presenting Sacramento only as a collection of museums and state offices."
  ]
];

const assertSacramentoQuality = () => {
  for (const [title, description] of things) {
    if (sentenceCount(description) < 4) {
      throw new Error(`Sacramento guide quality regression: ${title} has fewer than four sentences.`);
    }
    const lower = description.toLowerCase();
    const banned = bannedTemplatePhrases.find(phrase => lower.includes(phrase));
    if (banned) {
      throw new Error(`Sacramento guide quality regression: ${title} contains banned template phrase: ${banned}`);
    }
  }
};

export const enhanceSacramentoGuide = (
  stateSlug: string,
  citySlug: string,
  guide: GuidePageData
): GuidePageData => {
  if (stateSlug !== "california" || citySlug !== "sacramento") return guide;
  assertSacramentoQuality();

  return {
    ...guide,
    hero: {
      ...guide.hero,
      alt: "Sacramento, California skyline, riverfront and historic landmarks",
      subheadline: "Explore California's capital through its Gold Rush riverfront, railroad history, working Capitol, museums and river landscapes."
    },
    overview: [
      "Sacramento grew where the Sacramento and American rivers meet, a location that made it a Gold Rush supply center, transportation hub and eventually California's permanent capital. The city rewards travelers who connect those layers: Old Sacramento explains the river and railroad economy, the Capitol shows the continuing role of state government, and nearby museums and neighborhoods reveal a broader cultural history."
    ],
    highlights: [
      {
        title: "Capital and Gold Rush history",
        description: "Connect the working State Capitol with the riverfront district where Sacramento became a nineteenth-century transportation and commercial center."
      },
      {
        title: "Railroads and rivers",
        description: "Use the Railroad Museum, Sacramento River and American River Parkway to understand the transportation geography that shaped the city."
      }
    ],
    thingsToDo: things.map(([title, description]) => ({ title, description })),
    bestTimeToVisit: {
      title: "When to visit Sacramento",
      bullets: [
        "Spring brings mild temperatures and green park landscapes before the strongest summer heat.",
        "Autumn is often comfortable for walking between downtown, Midtown and the riverfront.",
        "Summer afternoons can be very hot, so museums and early outdoor starts make a more comfortable itinerary."
      ]
    },
    travelTips: [
      "Old Sacramento, the Railroad Museum, Tower Bridge and the downtown riverfront fit naturally into one walking-oriented cluster.",
      "The Capitol, Midtown and Sutter's Fort form a second useful cluster east of the riverfront.",
      "Use the American River Parkway as a dedicated outdoor block rather than squeezing it between museum stops."
    ],
    faq: [
      {
        q: "How many days should I spend in Sacramento?",
        a: "Two full days cover the major historic and civic landmarks at a comfortable pace; a third day makes room for the American River Parkway, additional museums or nearby excursions."
      },
      {
        q: "Is Sacramento walkable for visitors?",
        a: "The Capitol, Midtown and Old Sacramento are individually walkable, though the full city is spread out. Grouping landmarks into riverfront and Capitol/Midtown clusters reduces unnecessary driving."
      }
    ],
    seoLinks: {
      officialTourism: "https://www.visitsacramento.com/"
    },
    aboutCity: undefined
  };
};
