export const SYDNEY_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
  "184156P4",
  "6793P35",
  "3378WHALE",
  "5657BRIDGECLIMB",
  "24058P1",
  "22584P1",
  "156795P5",
  "14172P3",
  "392485P1",
  "3293SYDHARBOUR",
  "6770P22",
  "5507708P5",
  "146921P1",
  "455986P1",
  "6088P3",
  "5509792P1",
  "186752P1",
  "5951P10",
  "6912BEER",
  "3378GOLD",
] as const;

export type SydneyTargetedNarrativeDescriptionProductCode =
  (typeof SYDNEY_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const SYDNEY_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  SydneyTargetedNarrativeDescriptionProductCode,
  string
> = {
  "184156P4":
    "In Sydney, this walking circuit starts at Hyde Park and St. Mary's Cathedral, then continues past Hyde Park Barracks, Queen's Square, and Macquarie Street before the Royal Botanic Garden Sydney. The later stretch covers The Rocks lanes around Suez Canal, Nurses Walk, Playfair Street, Argyle Street, and Campbells Cove. The published format is on foot rather than a harbour cruise or coach day. The format suits visitors who want a compact historic-core walk without assembling those streets independently. Meeting points are confirmed at booking in Sydney, and the itinerary stays on Hyde Park, The Rocks, and the garden edge that define this outing rather than a Bondi beach circuit.",
  "6793P35":
    "In Sydney, this one-hour sightseeing cruise leaves Circular Quay and passes the Sydney Opera House, Royal Botanic Garden Sydney, Mrs Macquarie's Chair, Garden Island, Fort Denison, Taronga Zoo, the Sydney Harbour Bridge, Luna Park Sydney, and Barangaroo. The published format stays on the water with commentary rather than a walking circuit through The Rocks. The format suits visitors who want a short harbour orientation without booking a dinner cruise or helicopter hop. Meeting points are confirmed at booking in Sydney, and the itinerary stays on Sydney Harbour landmarks that define this outing rather than a Blue Mountains coach day.",
  "3378WHALE":
    "In Sydney, this seasonal whale-watching cruise departs Circular Quay Wharf 6 and spends the published block on Sydney Harbour looking for migrating whales. The public page lists a multi-hour outing from Circular Quay rather than a one-hour highlights loop past the Opera House. Sightings depend on the season and the day's conditions. The format suits visitors who want a guided harbour wildlife window without assembling a private charter. Meeting points are confirmed at booking in Sydney, and the itinerary stays on Sydney Harbour and Circular Quay that define this outing rather than a BridgeClimb ascent.",
  "5657BRIDGECLIMB":
    "In Sydney, BridgeClimb starts at 3 Cumberland Street in The Rocks and follows the published climb onto the Sydney Harbour Bridge. The public page lists a multi-hour guided ascent with the operator's safety briefing and climb gear rather than a harbour cruise viewed from the water. The format suits visitors who want the bridge structure itself rather than a lookout photo stop from Circular Quay. Meeting points are confirmed at booking in Sydney, and the itinerary stays on the Sydney Harbour Bridge and The Rocks that define this outing rather than a Bondi or Opera House walking circuit.",
  "24058P1":
    "In Sydney, this full-day coach outing combines a Parramatta River cruise with Blue Mountains time at Scenic World and the Three Sisters. The published route leaves from Central Station on Eddy Avenue rather than a private harbour half-day. The public page lists a long day covering river and plateau stops in one booking. The format suits visitors who want a combined river-and-mountains day without assembling separate cruise and coach tickets. Meeting points are confirmed at booking in Sydney, and the itinerary stays on Parramatta River, the Blue Mountains, Scenic World, and the Three Sisters that define this outing rather than a Port Stephens sand-dune day.",
  "22584P1":
    "In Sydney, this all-inclusive Blue Mountains day covers the Three Sisters, Scenic World, a wildlife stop at Sydney Zoo, and a Parramatta River segment, with lunch listed on the public page. The published format is a small-group coach day from Sydney rather than a self-paced train outing. The format suits visitors who want the plateau, scenic railway complex, and zoo window in one booking without assembling tickets independently. Meeting points are confirmed at booking in Sydney, and the itinerary stays on the Three Sisters, Scenic World, Sydney Zoo, and Parramatta River that define this outing rather than a sunset-only waterfall circuit.",
  "156795P5":
    "In Sydney, this deluxe Blue Mountains day lists Sydney Zoo, the Blue Mountains plateau, and Scenic World on a long coach outing from the city. The published format keeps the zoo and scenic-railway complex on one ticket rather than a harbour cruise plus a separate mountains day. The format suits visitors who want a wildlife-and-plateau circuit without booking Scenic World independently. Meeting points are confirmed at booking in Sydney, and the itinerary stays on Sydney Zoo, the Blue Mountains, and Scenic World that define this outing rather than a private Opera House and Bondi half-day.",
  "14172P3":
    "In Sydney, this private half-day circuit covers the Sydney Opera House, Sydney Harbour Bridge, and Bondi Beach with hotel pickup listed on the public page. The published format is a private vehicle outing rather than a shared harbour cruise or walking tour of The Rocks. The format suits visitors who want a compact private highlight window without a full-day Rocks-to-Watsons-Bay booking. Meeting points are confirmed at booking in Sydney, and the itinerary stays on the Sydney Opera House, Sydney Harbour Bridge, and Bondi Beach that define this outing rather than a Blue Mountains coach day.",
  "392485P1":
    "In Sydney, this long day trip heads north to Port Stephens, Nelson Bay, Stockton Beach, and Anna Bay with hotel pickup listed on the public page. The published format is a coastal dune and bay circuit rather than a harbour cruise or Blue Mountains plateau day. The format suits visitors who want a Port Stephens window without assembling transfers independently. Meeting points are confirmed at booking in Sydney, and the itinerary stays on Port Stephens, Nelson Bay, Stockton Beach, and Anna Bay that define this outing rather than a Circular Quay whale watch.",
  "3293SYDHARBOUR":
    "In Sydney, this scenic helicopter flight departs Sydney Helitours at 44-46 Airport Drive, Mascot, and passes the Sydney Harbour Bridge, Sydney Opera House, Sydney Harbour, and Bondi Beach. The published duration is a short aerial circuit rather than a multi-hour cruise or climb. The format suits visitors who want an aerial harbour window without booking a dinner cruise. Meeting points are confirmed at booking in Sydney, and the itinerary stays on Sydney Helitours and the harbour landmarks that define this outing rather than a Surry Hills food walk.",
  "6770P22":
    "In Sydney, this later-day Blue Mountains outing lists a nature-based circuit with waterfall lookouts and a sunset window on the plateau. The published format avoids the busiest Scenic World midday blocks and stays on Blue Mountains wilderness and waterfall stops rather than a zoo-inclusive coach package. The format suits visitors who want a quieter plateau afternoon without a harbour cruise add-on. Meeting points are confirmed at booking in Sydney, and the itinerary stays on the Blue Mountains and Blue Mountains waterfalls that define this outing rather than a Three Sisters plus Sydney Zoo day.",
  "5507708P5":
    "In Sydney, this guided electric-bike ride meets at 10 Beauchamp Lane, Surry Hills, then covers Pyrmont, Sydney Fish Market, Darling Harbour, Barangaroo, the Sydney Harbour Bridge cycleway, Circular Quay, the Sydney Opera House, and Chinatown. Bluetooth helmets are listed on the public page. The format suits visitors who want a guided harbour-edge ride without renting independently. Meeting points are confirmed at booking in Sydney, and the itinerary stays on Pyrmont, Darling Harbour, Circular Quay, and the Opera House that define this outing rather than a brewery-only walking circuit.",
  "146921P1":
    "In Sydney, this Forkabout food walk stays in Surry Hills for a guided tasting circuit through the inner-city neighborhood rather than a harbour cruise or Blue Mountains day. The published format is on foot with food stops listed for Surry Hills and the surrounding Sydney streets. The format suits visitors who want a neighborhood tasting window without a private full-day sightseeing booking. Meeting points are confirmed at booking in Sydney, and the itinerary stays on Surry Hills and Sydney tasting stops that define this outing rather than a Royal Botanic Garden forage.",
  "455986P1":
    "In Sydney, this secret foodie walking tour covers inner Sydney tasting stops on a guided foot circuit rather than a Surry Hills-only Forkabout booking or a harbour dinner cruise. The published format stays in the city with local food stops rather than a Blue Mountains lunch day. The format suits visitors who want a compact inner-city tasting window without assembling restaurant reservations independently. Meeting points are confirmed at booking in Sydney, and the itinerary stays on Sydney and inner Sydney tasting stops that define this outing rather than a Bondi beach half-day.",
  "6088P3":
    "In Sydney, this Taste of Sydney circuit is a guided tasting outing through city venues rather than a single-neighborhood Surry Hills walk or a harbour Gold dinner cruise. The published format keeps the focus on Sydney tasting rooms and food stops in one booking. The format suits visitors who want a broader city tasting window without a brewery-only circuit. Meeting points are confirmed at booking in Sydney, and the itinerary stays on Sydney and the city tasting venues that define this outing rather than a Circular Quay morning-tea cruise.",
  "5509792P1":
    "In Sydney, this native-food forage meets at the Royal Botanic Garden Sydney for a guided walk covering Australian plants, food, and wine context in the garden and adjoining Sydney grounds. The published format is a shorter garden-based outing rather than a three-hour inner-city food crawl. The format suits visitors who want a botanic-garden tasting window without a harbour cruise. Meeting points are confirmed at booking in Sydney, and the itinerary stays on the Royal Botanic Garden Sydney and Sydney that define this outing rather than a Port Stephens dune day.",
  "186752P1":
    "In Sydney, this full-day private outing lists The Rocks, Watsons Bay, and Bondi Beach with hotel pickup on the public page. The published format is an eight-hour private circuit rather than a four-hour Opera House and Bondi half-day. The format suits visitors who want a longer private harbour-and-beach window without a shared coach day to the Blue Mountains. Meeting points are confirmed at booking in Sydney, and the itinerary stays on The Rocks, Watsons Bay, and Bondi Beach that define this outing rather than a Mascot helicopter hop.",
  "5951P10":
    "In Sydney, this harbour discovery cruise leaves Circular Quay for a Sydney Harbour outing with morning tea listed on the public page. The published duration is longer than the one-hour highlights loop and shorter than a Gold dinner cruise. The format suits visitors who want a daytime harbour window with tea service without booking a whale-watch departure. Meeting points are confirmed at booking in Sydney, and the itinerary stays on Sydney Harbour and Circular Quay that define this outing rather than a BridgeClimb ascent.",
  "6912BEER":
    "In Sydney, this beer and brewery tour covers Sydney breweries on a guided tasting circuit rather than a Surry Hills food walk or a harbour dinner cruise. The published format stays on brewery stops in Sydney with tasting time listed for the outing. The format suits visitors who want a guided beer window without assembling brewery reservations independently. Meeting points are confirmed at booking in Sydney, and the itinerary stays on Sydney breweries and Sydney that define this outing rather than a native-food garden forage.",
  "3378GOLD":
    "In Sydney, this Gourmet Gold Penfolds dinner cruise runs on Sydney Harbour from Circular Quay with a plated dinner listed on the public page. The published format is an evening harbour dining outing rather than a morning-tea discovery cruise or a one-hour sightseeing loop. The format suits visitors who want a dinner-on-the-harbour window without a helicopter booking. Meeting points are confirmed at booking in Sydney, and the itinerary stays on Sydney Harbour and Circular Quay that define this outing rather than a Blue Mountains sunset walk.",
};

export const getSydneyTargetedNarrativeDescription = (productCode: string) =>
  SYDNEY_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as SydneyTargetedNarrativeDescriptionProductCode
  ];
