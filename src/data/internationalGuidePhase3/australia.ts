import type { InternationalGuidePhase3Profile } from "./types";

export const AUSTRALIA_PHASE3_PROFILES: Record<
  string,
  InternationalGuidePhase3Profile
> = {
  "australia/cairns": {
    overview:
      "Cairns sits on a narrow tropical coastal plain between the Coral Sea and the forested escarpment of Queensland's Wet Tropics, making it a gateway city rather than a beach resort in the conventional sense. Its strongest guide identity comes from connecting the working waterfront and botanic landscapes with reef departures, rainforest access and the mountain country immediately inland.",
    context:
      "The city developed as a port serving mining and agricultural districts before tourism made Cairns one of Australia's principal jumping-off points for the Great Barrier Reef. Mangrove-lined tidal flats edge the central waterfront, while rainforest rises quickly toward the Atherton Tablelands and Barron Gorge, creating a striking transition from marine to upland environments.",
    planning:
      "Use the Esplanade, marina and central cultural stops as one compact walking block, then reserve separate full days for reef and rainforest excursions. Tropical weather, marine forecasts and seasonal road conditions can materially change plans, so avoid trying to lock every outdoor activity into a rigid sequence before checking current conditions.",
    season:
      "The drier period from roughly May through October usually brings lower humidity and more comfortable conditions for long days outside, while the warmer wet season can bring heavy tropical rain and occasional cyclonic weather. Reef access continues year-round, but visibility, sea state and rainfall vary considerably from day to day.",
    pack:
      "Bring strong sun protection, breathable clothing, insect repellent, a lightweight waterproof layer and footwear that can handle wet boardwalks or rainforest paths. A dry bag and reusable water bottle are useful for marine days, while higher tableland areas can feel noticeably cooler than the coast.",
    pois: [
      {
        title: "Cairns Esplanade",
        description:
          "The Cairns Esplanade follows the city's tidal waterfront through parkland, boardwalks and public recreation areas rather than a conventional surf beach. Walking the foreshore reveals mudflats, mangrove habitat and broad views toward Trinity Inlet, making it a useful introduction to the tropical coastal ecology beneath the city's tourism image.",
      },
      {
        title: "Cairns Botanic Gardens",
        description:
          "The Cairns Botanic Gardens sit beneath Mount Whitfield and focus heavily on tropical plants suited to the wet climate of far north Queensland. The collections, adjoining rainforest walks and proximity to the forested escarpment make the gardens a practical place to understand the vegetation visitors will encounter on larger Wet Tropics excursions.",
      },
      {
        title: "Cairns Marina and Reef Fleet Terminal",
        description:
          "The marina and Reef Fleet Terminal form the departure hub for many Great Barrier Reef day cruises, diving trips and island transfers from central Cairns. Spending time around the waterfront before departure helps clarify that the reef lies well offshore and that each operator reaches different pontoons, islands or mooring sites depending on itinerary and conditions.",
      },
      {
        title: "Great Barrier Reef",
        description:
          "Cairns is one of the principal mainland gateways to the Great Barrier Reef, with vessels traveling from Trinity Inlet to outer-reef sites and coral cays. The reef is a vast living system rather than a single attraction, so weather, operator route, snorkeling ability and the day's selected site strongly influence what a visitor actually experiences.",
      },
      {
        title: "Barron Gorge National Park",
        description:
          "Barron Gorge National Park protects steep rainforest-covered terrain northwest of Cairns where the Barron River cuts through the Wet Tropics escarpment. Lookouts, walking tracks and transport routes around the gorge provide an accessible way to see the abrupt elevation change between the coastal plain and the higher Atherton Tablelands.",
      },
      {
        title: "Kuranda",
        description:
          "Kuranda occupies the rainforest plateau above Cairns near Barron Gorge and is reached by road as well as well-known rail and cableway routes. The journey is as important as the village itself because it crosses dense Wet Tropics forest and exposes the steep topography that separates Cairns from the inland tablelands.",
      },
    ],
  },
  "australia/melbourne": {
    overview:
      "Melbourne spreads around the lower Yarra River and Port Phillip Bay as a city of nineteenth-century civic architecture, arcaded lanes, major cultural institutions and extensive parkland. A useful guide should connect the central grid with the river, markets and neighborhood culture rather than treating street art, coffee and sporting venues as disconnected clichés.",
    context:
      "Rapid growth during the nineteenth-century gold rush financed many of Melbourne's grand public buildings, while a formal street grid and rail network shaped the central city. The Yarra divides the business core from major arts and sports precincts to the south and east, creating a walkable sequence in which urban history, public space and contemporary culture overlap closely.",
    planning:
      "Walk the central lanes, Federation Square, riverfront and nearby cultural institutions as one core district, then use trams or trains for farther neighborhoods and gardens. Melbourne's weather can change several times in one day, so an itinerary works best when indoor museums, markets and galleries can substitute for exposed walks without dismantling the whole plan.",
    season:
      "Spring and autumn often provide comfortable walking temperatures, while summer can range from mild to very hot and winter is cool, damp and changeable. Sudden temperature shifts and wind are common enough that the local joke about four seasons in one day has a meteorological basis rather than being pure civic folklore.",
    pack:
      "Bring comfortable walking shoes, a light waterproof layer and clothing that can be added or removed as temperatures change. Sun protection remains important even on cool days, while a reusable transit card or contactless option makes it easy to shift between the central grid and farther neighborhoods.",
    pois: [
      {
        title: "Federation Square",
        description:
          "Federation Square occupies a prominent site opposite Flinders Street Station beside the Yarra and serves as a major civic and cultural gathering place. Its angular contemporary architecture, galleries and open plaza create a deliberate contrast with the ornate railway station and nineteenth-century city blocks immediately across the street.",
      },
      {
        title: "National Gallery of Victoria",
        description:
          "The National Gallery of Victoria's International building stands just south of the Yarra in Melbourne's arts precinct and holds extensive collections spanning European, Asian, Oceanic and contemporary art. Its large exhibitions and permanent galleries make it a substantial cultural visit rather than a brief shelter from variable weather.",
      },
      {
        title: "Queen Victoria Market",
        description:
          "Queen Victoria Market has operated on the northern edge of central Melbourne since the nineteenth century and remains a major produce, food and general-goods market. Walking its sheds and surrounding streets provides a direct connection to everyday commerce and immigration history that contrasts with the formal civic buildings farther south in the central grid.",
      },
      {
        title: "Royal Botanic Gardens Victoria",
        description:
          "Melbourne's Royal Botanic Gardens occupy a large landscaped area along the south bank of the Yarra beside the Domain parklands. Lakes, mature trees and curated plant collections create one of the city's most important green spaces and provide a quieter geographic transition between the central arts precinct and residential neighborhoods to the south.",
      },
      {
        title: "Hosier Lane and the Central Laneways",
        description:
          "Hosier Lane is the best-known example of Melbourne's constantly changing street-art environment, but the broader central laneway network also contains arcades, cafes, small businesses and service passages inherited from the city's grid. Exploring several lanes rather than one mural wall reveals how these narrow spaces function as an active layer of the central city rather than an outdoor gallery frozen in time.",
      },
      {
        title: "Melbourne Museum and Royal Exhibition Building",
        description:
          "Melbourne Museum stands beside the nineteenth-century Royal Exhibition Building in Carlton Gardens, pairing modern natural and cultural collections with one of the city's most important historic civic structures. Seeing the two together connects contemporary museum interpretation with the era when Melbourne projected its gold-rush wealth through international exhibitions and monumental architecture.",
      },
    ],
  },
};
