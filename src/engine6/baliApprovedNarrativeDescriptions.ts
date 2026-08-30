export const BALI_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
  "86621P5",
  "86621P2",
  "86621P3",
  "60357P25",
  "206176P2",
  "11769P30",
  "243038P1",
  "416971P1",
  "52577P9",
  "92029P158",
  "117975P5",
  "66791P20",
] as const;

export type BaliTargetedNarrativeDescriptionProductCode =
  (typeof BALI_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const BALI_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  BaliTargetedNarrativeDescriptionProductCode,
  string
> = {
  "86621P5":
    "In Bali, this private eight-to-ten-hour circuit pairs an English-speaking driver-guide with an air-conditioned van and hotel pickup across Ubud and much of the south coast. The published day covers the Sacred Monkey Forest Sanctuary, Tegalalang Rice Terrace, a jungle swing and lunch at D Alas Warung, Tirta Empul Temple, and Tegenungan Waterfall, with entrance fees, bottled water, and the swing listed. The format suits visitors who want a single guided Ubud sweep without assembling separate tickets and transfers. Meeting points are confirmed at booking in Bali, and the itinerary stays on the Monkey Forest, Tegalalang, Tirta Empul, and Tegenungan that define this outing rather than a Nusa Penida crossing.",
  "86621P2":
    "In Bali, this private eight-to-ten-hour north-and-west day leaves a hotel in Ubud or south Bali for Ulun Danu Bratan Temple on Lake Beratan, photo stops at Buyan Lake and Tamblingan Lake, a swim window at Banyumala Twin Waterfalls, lunch-scale views at UNESCO-listed Jatiluwih Green Land, and a late stop at Pura Batu Bolong and Tanah Lot Temple. A driver-guide, air-conditioned van, parking, entrance fees, and bottled water are listed. The format suits visitors who want a guided water-temple and rice-terrace circuit without self-driving the Bedugul and Jatiluwih roads. Meeting points are confirmed at booking in Bali, and the itinerary stays on Ulun Danu Bratan, Banyumala, Jatiluwih, and Tanah Lot that define this outing rather than an Ubud Monkey Forest loop.",
  "86621P3":
    "In Bali, this private ten-hour east-island day starts early so the group can reach Lempuyang Temple's Gate of Heaven before cloud cover closes the Mount Agung view. A driver-guide and seven-seat air-conditioned car continue to Tirta Gangga Water Palace, a Mount Agung viewpoint, and Sidemen, with lunch and river-and-infinity-pool access listed at Sleeping Gajah Kitchen & Lounge at Wapa di Ume Sidemen. Entrance fees, bottled water, and hotel pickup are listed. The format suits visitors who want a guided Lempuyang morning without assembling the long east-Bali drive independently. Meeting points are confirmed at booking in Bali, and the itinerary stays on Lempuyang Temple, Tirta Gangga, and Sidemen that define this outing rather than a Tanah Lot sunset circuit.",
  "60357P25":
    "In Bali, this private twelve-hour Nusa Penida day starts with hotel pickup in Ubud, Nusa Dua, Jimbaran, Kuta, Legian, Seminyak, Sanur, or Canggu, then a fast-boat crossing from Sanur Beach Harbour. On the island a private car and English-speaking driver cover Pasih Uug Beach (Broken Beach), Angel's Billabong, Kelingking Beach, and Crystal Bay, with Indonesian lunch, entrance tickets, and the return boat listed. Snorkeling gear at Crystal Bay is own expense on the public page. The format suits visitors who want a guided west-Penida land circuit without assembling boat and island taxis independently. Meeting points are confirmed at booking in Bali, and the itinerary stays on Sanur Harbour, Broken Beach, Angel's Billabong, Kelingking, and Crystal Bay that define this outing rather than an Ubud temple day.",
  "206176P2":
    "In Bali, this guided ATV outing meets at the Payangan track or adds hotel pickup from Ubud, Kuta, Seminyak, Canggu, Sanur, Jimbaran, and Nusa Dua. After a safety briefing, insurance paperwork, boots, and helmet, the published route covers about eight kilometers of rice fields, jungle, river crossings, a waterfall plunge, and a natural tunnel. Solo riders are listed from age 13; tandem seats cover ages 6 to 13 with a parent. The ride window is about 90 minutes. The format suits visitors who want a guided off-road track without renting independently. Meeting points are confirmed at booking in Bali, and the itinerary stays on the Payangan rice-field, jungle, tunnel, and waterfall track that define this outing rather than an Ayung River raft.",
  "11769P30":
    "In Bali, this private ten-hour west-highland day leaves a hotel in Ubud or south Bali for Ulun Danu Bratan Temple on Lake Beratan, UNESCO-listed Jatiluwih Green Land, Luhur Batukaru Temple on the slopes of Mount Batukaru, and a late Indian Ocean stop at Tanah Lot Temple. A driver-guide, air-conditioned minivan, bottled water, and hotel pickup are listed; lunch and entrance fees follow the booked option. The format suits visitors who want a guided water-temple and rice-terrace circuit that includes Batukaru rather than a Banyumala swim add-on. Meeting points are confirmed at booking in Bali, and the itinerary stays on Ulun Danu Bratan, Jatiluwih, Luhur Batukaru, and Tanah Lot that define this outing rather than an east-Bali Lempuyang start.",
  "243038P1":
    "In Bali, this guided countryside bike day includes hotel transfers, then a downhill ride past rice harvest scenes and village lanes after stops at Tegalalang Rice Terrace, a coffee plantation, and viewpoints over Lake Batur and Mount Batur. Water, morning coffee, and an Indonesian lunch are listed. The pace is published as mellow rather than a technical mountain-bike route. The format suits visitors who want a guided rural ride without renting independently. Meeting points are confirmed at booking in Bali, and the itinerary stays on Tegalalang, the coffee plantation, Lake Batur, and Mount Batur that define this outing rather than a temple-ticket city loop.",
  "416971P1":
    "In Bali, this six-hour small-group downhill ride starts with a Mount Batur caldera and lake viewpoint, then follows an English-speaking guide through farms, villages, and rice fields, with stops at a local school, a family compound, and a temple. Cycling gear, insurance, lunch, bottled water, and Ubud-area hotel pickup are listed. The group is capped at four. Pickup outside Ubud is not listed as standard. The format suits visitors who want a short guided volcano-to-village ride without assembling bikes and transfers independently. Meeting points are confirmed at booking in Bali, and the itinerary stays on Mount Batur, the village compound, and the rice-field descent that define this outing rather than a Nusa Penida boat day.",
  "52577P9":
    "In Bali, this five-hour Subak class covers nine Balinese dishes in a family kitchen, with a morning option that adds Ubud traditional market shopping and a rice-paddy stop. Bottled water, a buffet lunch of the cooked dishes, a local guide, and a central-Ubud shuttle from Ubud Palace are listed. Afternoon sessions swap the market for a Balinese offering workshop. Pickup outside central Ubud is a surcharge. The format suits visitors who want a guided cooking window without booking a full-day countryside transfer. Meeting points are confirmed at booking in Bali, and the itinerary stays on the Ubud market, rice paddies, and Subak kitchen that define this class rather than a Paon home session.",
  "92029P158":
    "In Bali, this five-hour Paon class meets with hotel pickup for an afternoon session at Wayan's family home kitchen, or adds a morning market visit before the same hands-on cooking window. The group cooks listed Balinese dishes, then eats the meal, with a recipe book listed. Sessions are published around ten guests. The format suits visitors who want a guided home-kitchen class in Ubud without assembling a market-and-farm itinerary independently. Meeting points are confirmed at booking in Bali, and the itinerary stays on the Ubud market and Paon kitchen that define this class rather than a nine-dish Subak school session.",
  "117975P5":
    "In Bali, this private six-hour snorkeling outing collects the group from Ubud or south-coast hotels, then boards a traditional boat at Padangbai for Blue Lagoon Beach and Tanjung Jepun. A snorkeling instructor, gear, Indonesian lunch, bottled water, and entrance fees are listed. Optional add-ons for a canyon hike, ATV, or waterfalls appear on the booking page and are not part of the base circuit. The format suits visitors who want a guided reef morning without assembling a Padangbai boat independently. Meeting points are confirmed at booking in Bali, and the itinerary stays on Blue Lagoon and Tanjung Jepun that define this outing rather than a Nusa Penida manta crossing.",
  "66791P20":
    "In Bali, this half-day Ayung River raft covers about 12 kilometers of Class II and III water through forest, rice paddies, stone carvings, and waterfall banks, with a guide in each boat. A safety briefing, helmet, life jacket, paddle, buffet lunch, shower, and insurance are listed. Hotel pickup from Ubud, Seminyak, Kuta, Nusa Dua, Canggu, and Sanur is a listed upgrade. Boats hold five to six people. The format suits visitors who want a guided river window without assembling rafting gear independently. Meeting points are confirmed at booking in Bali, and the itinerary stays on the Ayung River and its waterfall banks that define this outing rather than an Ubud ATV tunnel track.",
};

export const getBaliTargetedNarrativeDescription = (productCode: string) =>
  BALI_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as BaliTargetedNarrativeDescriptionProductCode
  ];
