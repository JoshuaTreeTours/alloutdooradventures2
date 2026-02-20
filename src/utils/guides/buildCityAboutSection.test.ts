import { describe, expect, it } from "vitest";

import { buildCityAboutSection } from "./buildCityAboutSection";

const FACTUAL_PATTERN =
  /\b(1[6-9]\d{2}|20\d{2}|river|coast|bay|mountain|climate|founded|established|war|population|census|architecture|architectural|skyline|museum|university|industry|economy|economic|port|trade|technology|festival)\b/i;

const TRAVEL_ADVICE_PATTERN =
  /\b(itinerary|plan your|book ahead|first-time visitors|must-see|best time to visit|day trip|build each day|anchor area|reduce transit time)\b/i;

const noRepeatedSentences = (paragraphs: string[]) => {
  const seen = new Set<string>();
  for (const paragraph of paragraphs) {
    const sentences = paragraph
      .split(/(?<=[.!?])\s+/)
      .map(sentence => sentence.trim())
      .filter(Boolean);

    for (const sentence of sentences) {
      if (seen.has(sentence)) {
        return false;
      }
      seen.add(sentence);
    }
  }
  return true;
};

const fixtures = [
  {
    cityName: "Los Angeles",
    stateName: "California",
    countryName: "United States",
    wikiSummaryText:
      "Los Angeles was founded in 1781 and became California's largest city during the twentieth century, with a metropolitan population above 12 million and a globally recognized role in film, trade, and aerospace.",
    wikiExtractText:
      "The city occupies a coastal basin between the Pacific Ocean and surrounding mountain ranges, with the Los Angeles River crossing broad alluvial plains and a Mediterranean climate marked by dry summers. Major expansion followed railroad links in the late nineteenth century and port growth after 1909, while postwar highway construction reshaped neighborhoods and employment geography. The Port of Los Angeles and Port of Long Beach support one of the world's largest container trade complexes and anchor logistics, manufacturing, and warehousing activity across Southern California. Downtown and Westside districts include landmark architecture from Art Deco towers to mid-century civic complexes, reflecting waves of redevelopment after earthquakes and infrastructure modernization. Cultural institutions such as the Los Angeles County Museum of Art, Getty Center, and major universities sustain a large arts and research economy linked to media industries. Film and television production, recorded music, and design firms contribute to the city's international cultural identity and reinforce a diverse multilingual population recorded in recent census updates. Regional parks, coastal wetlands, and the Santa Monica Mountains frame urban development and support biodiversity corridors that connect shoreline habitats with inland ecological zones. In 1984 the city hosted the Summer Olympics, a defining event that accelerated transit investment and stadium redevelopment. Regional universities and medical centers expanded research employment through the 1990s and 2000s. Census reporting shows sustained immigration from Latin America and Asia, reshaping neighborhood commerce and language patterns. Historic preservation programs protect mission-era, Victorian, and mid-century architectural assets across multiple districts. Aerospace production and technology services remain major contributors to the regional economy alongside entertainment exports.",
  },
  {
    cityName: "Portland",
    stateName: "Oregon",
    countryName: "United States",
    wikiSummaryText:
      "Portland was incorporated in 1851 and grew from a river port into Oregon's largest city, known for planning policy, bridge infrastructure, and a metropolitan economy spanning technology, logistics, and higher education.",
    wikiExtractText:
      "Portland stands near the confluence of the Willamette and Columbia rivers within the Pacific Northwest, where volcanic foothills, floodplains, and a temperate marine climate shape settlement and transportation corridors. Nineteenth-century growth accelerated through lumber exports, railroad connections, and grain trade, then shifted toward manufacturing and professional services during twentieth-century metropolitan expansion. Historic districts preserve cast-iron commercial architecture and early civic buildings, while modern skyline construction reflects reinvestment tied to regional population growth and seismic standards. The city hosts major cultural institutions including the Portland Art Museum, Oregon Historical Society, and several universities that support research and creative industries. Economic activity includes athletic apparel headquarters, software firms, and port logistics serving inland agricultural regions and ocean shipping networks. Public identity is associated with neighborhood business corridors, independent music venues, and culinary institutions that developed through immigrant and local food traditions. Forest Park, the Willamette riverfront, and nearby Cascade and Coast Range landscapes create an urban-natural interface with significant watershed and habitat management responsibilities. Portland's 1973 urban growth framework influenced metropolitan land policy and constrained outward sprawl. The city's bridge network and street grid along the Willamette supported industrial districts and later mixed-use redevelopment. Population growth in recent census periods increased pressure on housing supply and transit capacity across eastside neighborhoods. Historic terminals, warehouses, and civic landmarks document shifts from resource extraction to service and innovation sectors. Public libraries, performing arts venues, and university campuses act as long-standing cultural institutions in the central city.",
  },
  {
    cityName: "New York City",
    stateName: "New York",
    countryName: "United States",
    wikiSummaryText:
      "New York City was founded as New Amsterdam in 1624 and evolved into the United States' largest city, with a metropolitan population above 19 million and unmatched global influence in finance, media, shipping, and culture.",
    wikiExtractText:
      "The city is located at the mouth of the Hudson River on a coastal archipelago, where deep natural harbors, tidal estuaries, and a humid subtropical climate influenced port development and dense urban form. Colonial trade and nineteenth-century immigration expanded commercial districts, while the Erie Canal era and railroad integration connected Atlantic shipping to continental markets. Twentieth-century growth produced signature skyline architecture, including steel-frame towers and landmark civic structures that symbolize modern urban development. Wall Street, corporate headquarters, and global exchanges define a central economic role in international finance, legal services, and media production. Cultural institutions such as the Metropolitan Museum of Art, Lincoln Center, and major universities sustain an extensive network of arts, scholarship, and public programming. Neighborhood identities reflect successive migration waves documented by census and demographic research, shaping language diversity, religious institutions, and community economies across boroughs. Waterfront parks, estuary restoration projects, and urban forests in large park systems demonstrate how ecological planning interacts with coastal risk, sea-level adaptation, and public space policy. The consolidation of New York City's five boroughs in 1898 established the current municipal framework and expanded infrastructure planning. The 2001 attacks on the World Trade Center marked a major historical event that reshaped security policy and Lower Manhattan redevelopment. Census data records persistent population growth and extreme demographic diversity across boroughs and neighborhoods. Architectural landmarks from Beaux-Arts terminals to contemporary supertall towers illustrate successive building eras and engineering methods. The city's airport system, freight terminals, and maritime facilities reinforce its role in national and international transportation economics.",
  },
] as const;

describe("buildCityAboutSection", () => {
  it.each(fixtures)(
    "builds authoritative, factual, non-repetitive sections for $cityName",
    fixture => {
      const sections = buildCityAboutSection(fixture);
      expect(sections).not.toBeNull();
      const concreteSections = sections ?? [];

      expect(concreteSections).toHaveLength(5);
      expect(
        noRepeatedSentences(concreteSections.map(s => s.paragraphs[0]))
      ).toBe(true);

      for (const section of concreteSections) {
        expect(TRAVEL_ADVICE_PATTERN.test(section.paragraphs[0])).toBe(false);
        expect(FACTUAL_PATTERN.test(section.paragraphs[0])).toBe(true);
      }
    }
  );
});
