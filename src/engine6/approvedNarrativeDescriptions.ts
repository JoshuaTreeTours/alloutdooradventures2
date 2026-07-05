import { getBostonTargetedNarrativeDescription } from "./bostonApprovedNarrativeDescriptions";
import { getGreatSmokyMountainsTargetedNarrativeDescription } from "./greatSmokyMountainsApprovedNarrativeDescriptions";
import { getMoabTargetedNarrativeDescription } from "./moabApprovedNarrativeDescriptions";
import { getPhiladelphiaTargetedNarrativeDescription } from "./philadelphiaApprovedNarrativeDescriptions";
import { getRockyMountainNationalParkTargetedNarrativeDescription } from "./rockyMountainNationalParkApprovedNarrativeDescriptions";

export const ENGINE6_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
  "5615689P4",
  "5614063P8",
  "62527P11",
  "3857PHI",
  "5250LIBERTYELLIS",
  "122012P17",
  "3780P45",
  "3780SUPER",
  "276551P2",
  "58347P1",
  "391021P1",
  "18808P14",
  "6004HIKE",
  "7011P8",
  "6004P8",
  "6004PRHIKE",
  "69029P14",
  "18808P20",
  "18808P17",
  "18808P15",
  "69029P8",
  "7011P11",
  "19970P1",
  "460648P15",
  "5582835P5",
  "449449P2",
] as const;

export type Engine6TargetedNarrativeDescriptionProductCode =
  (typeof ENGINE6_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const ENGINE6_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  Engine6TargetedNarrativeDescriptionProductCode,
  string
> = {
  "5615689P4":
    "Pedal through downtown Las Vegas on an e-bike route that moves beyond the resort corridor into the 18b Arts District, where murals, galleries, and neighborhood landmarks reveal a very different side of the city. The ride continues to recognizable stops such as the STRAT, the Gold & Silver Pawn Shop, and the Las Vegas Boulevard Gateway Arches while a guide shares stories about local culture, architecture, and how the city has changed block by block. The pace stays relaxed enough for most riders while still covering meaningful distance across the urban core.",
  "5614063P8":
    "Leave Manhattan for a full day in Washington, D.C., where Capitol Hill, the White House area, and major memorials anchor a fast-paced introduction to the capital. A guide connects each stop to the institutions and history that shaped the United States, while round-trip transportation keeps the day focused on the monuments rather than logistics. You return to New York in the evening with a clear sense of how the city's political landmarks fit together in a single coordinated itinerary across the National Mall corridor.",
  "62527P11":
    "Stand at the edge of Niagara Falls on a long day trip from New York City, with round-trip transportation and time at major viewpoints over the American and Horseshoe Falls. The pace is built around the waterfalls themselves, with a guide adding context on the region's geology and history while you move between scenic overlooks. It is a strong choice when you want one of North America's signature natural sights without planning the long drive yourself or juggling tickets and timing at the falls on your own.",
  "3857PHI":
    "Split a full day between Philadelphia's founding-era landmarks and the quieter farmland of Amish Country on a trip from New York City. The morning focuses on historic Philadelphia streets and the stories behind the nation's early government, while the afternoon shifts to rural Pennsylvania traditions and open countryside. The combination gives you both urban history and a contrasting pastoral landscape in a single itinerary before returning to Manhattan with a fuller picture of Pennsylvania beyond the city limits.",
  "5250LIBERTYELLIS":
    "Ferry across New York Harbor to Liberty Island and Ellis Island, two landmarks that define the city's immigration story and its place in American history. On Liberty Island, the Statue of Liberty dominates the skyline; on Ellis Island, exhibits and preserved halls recall the millions who entered the country through this port. Included ferry transport and guide commentary tie the harbor views to the human history behind the monuments throughout the visit, making this a focused half-day on the water.",
  "122012P17":
    "Roll through Midtown, Central Park, Lincoln Center, and other signature New York neighborhoods on a half-day coach tour designed as a first-timer's orientation. Photo stops are timed for skyline and street-level views you would struggle to assemble on your own in one morning, while a guide fills in architectural and cultural context between neighborhoods. The format covers a wide slice of Manhattan without switching trains, tickets, or routes on your own, which makes it especially useful for visitors with limited time.",
  "3780P45":
    "Board the Riverboat CITY of NEW ORLEANS at the French Quarter riverfront for a 75-minute Mississippi River cruise with live captain narration. Jackson Square, St. Louis Cathedral, the Crescent City Connection, the Aquarium of the Americas, Mardi Gras World, Caesars Casino, and Woldenberg Riverfront Park pass in sequence from the water, giving you open river views of downtown New Orleans. The round-trip cruise finishes back at the dock behind JAX Brewery with the French Quarter skyline still in view.",
  "3780SUPER":
    "Combine a French Quarter walk, lunch time at the French Market, a 75-minute Mississippi River cruise aboard the Riverboat CITY of NEW ORLEANS, and a narrated coach segment through the Garden District, City Park, the National WWII Museum, and Audubon Aquarium. Starting and finishing at Cafe Beignet in the JAX Brewery Building, the day layers walking, river, and street-level perspectives on New Orleans in one coordinated itinerary with varied viewpoints and a mix of independent lunch time and guided segments.",
  "276551P2":
    "Cycle from the French Quarter through Jackson Square and Congo Square into the Garden District and Lafayette Cemetery No. 1 on a city bike route that covers more ground than a walking tour. Beginning and ending on Washington Avenue, the ride moves at a comfortable pace with a local guide adding neighborhood history and practical recommendations along the way. Bicycle, helmet, bottled water, and weather support are included for the full loop through historic streets and garden-district architecture.",
  "58347P1":
    "Ride beyond the French Quarter into Faubourg Marigny, Bywater, and Treme on a small-group bicycle tour departing from North Rampart Street. Stops near the Mississippi River, Jackson Square, and St. Roch Community Church anchor a three-hour route that connects neighborhood scenery to New Orleans' multicultural roots and Creole culture. Bicycle, helmet, and bottled water are included, with the loop returning to the meeting point after varied district scenery and frequent pauses for photos along the way.",
  "391021P1":
    "Explore Yosemite Valley on a small-group guided tour with a naturalist guide who shares park history, geology, and wildlife stories throughout the day. Photo stops include Tunnel View, Bridalveil Fall, and El Capitan Meadow with time to walk short trails near Yosemite Falls while your guide explains how glaciation shaped the granite walls around Half Dome and Cathedral Rocks. The itinerary concentrates on iconic valley overlooks rather than rushed transit, and transport by air-conditioned vehicle keeps the group comfortable between viewpoints. Professional guide service and valley transport are included for this full-day loop from select Yosemite gateway meeting points.",
  "18808P14":
    "Enjoy a semi-private Yosemite day tour with hotel pickup and lunch at The Ahwahnee, limited to a small group so your guide can tailor pacing at each stop. Visit Tunnel View, Yosemite Valley landmarks including Yosemite Falls and El Capitan Meadow, and Glacier Point when seasonal access permits for rim views over Half Dome and the high country. The format balances guided commentary with photo time at valley viewpoints without the feel of a large bus tour. Lunch, hotel pickup and drop-off, and a professional guide are included for this relaxed full-day valley and rim route from Fresno-area hotels.",
  "6004HIKE":
    "Hit the trail with a certified Yosemite hiking guide on a small-group excursion tailored to current trail conditions and your group's fitness. Routes may include Yosemite Valley meadows, waterfall viewpoints near Lower Yosemite Fall, or moderate valley loops with naturalist commentary on granite geology, meadow ecology, and seasonal water flow. The guide selects sustainable trail segments away from the busiest pullouts whenever possible. Professional guide service, trail snacks, and bottled water are included for this half-day to full-day hiking experience in Yosemite Valley.",
  "7011P8":
    "Design your own Yosemite Valley adventure on a private hiking tour built exclusively for your group. A local guide customizes the route to your interests, whether that means waterfall walks near Bridalveil Fall, meadow strolls beneath El Capitan, or moderate climbs with less-crowded trail segments chosen from insider knowledge of the valley floor. The private format allows flexible pacing, rest stops, and photo breaks without sharing the day with strangers. Private guide service and custom itinerary planning are included for this tailored valley hiking experience.",
  "6004P8":
    "Take the family on a private Yosemite hike paced for all ages with a guide who selects kid-friendly valley trails and frequent rest stops. Easy-to-moderate routes through meadow and riverside paths near El Capitan Meadow leave time for wildlife spotting, short lessons on Yosemite's granite cliffs and waterfalls, and unhurried photos of Half Dome from valley viewpoints. The private format keeps children engaged without the pressure of a large group schedule. Private guide service, snacks, and bottled water are included for this family-focused valley hike.",
  "6004PRHIKE":
    "Book a private guided hike with a Yosemite expert who builds a route around your fitness level and seasonal access. Options range from valley waterfall walks to longer treks with views toward Half Dome, Glacier Point when roads are open, or Tuolumne Grove among giant sequoias depending on conditions and your goals. Extended time on trail keeps the day away from crowded pullouts while your guide shares naturalist insight on flora, geology, and park history. Private guide service, trail planning, and snacks are included for this fully customized hiking day.",
  "69029P14":
    "Discover Yosemite Valley on a guided discovery walk focused on waterfalls, meadows, and iconic granite landmarks on an easy valley-floor route. Your guide leads an unhurried path with stops near Lower Yosemite Fall and viewpoints toward Half Dome while sharing stories of John Muir, Ansel Adams, and the park's climbing and conservation history. The small-group format suits travelers who want context and conversation rather than a driving tour. Professional guide service is included for this leisurely guided walk through Yosemite Valley.",
  "18808P20":
    "Experience Yosemite on a full-day private Jeep tour with hotel pickup, picnic lunch, and a guide who handles park entry logistics while you focus on the views. Stops include Tunnel View, Bridalveil Fall, Yosemite Falls, El Capitan Meadow, and Glacier Point when seasonal access permits, with a rugged open-air ride between valley pullouts. The private format lets your group customize pacing at each overlook without sharing the day with strangers. Hotel pickup and drop-off, lunch, bottled water, and guide service are included for this premium valley and rim loop from gateway hotels.",
  "18808P17":
    "Take a private SUV or van day tour of Yosemite with hotel pickup, picnic lunch, and a driver-guide who tailors stops to your group. Visit Tunnel View, Bridalveil Fall, Sentinel Bridge, Yosemite Falls, El Capitan Meadow, and Glacier Point when roads are open for rim views over Half Dome and the high country. Vehicle size scales to your party so you avoid crowded buses while keeping a comfortable pace between valley landmarks. Hotel pickup and drop-off, lunch, bottled water, and guide service are included for this customizable full-day route.",
  "18808P15":
    "Explore Yosemite on a private Hummer 4x4 tour with hotel pickup, picnic lunch, and flexible routing through the valley and Glacier Point when access permits. Your guide can keep the group in the Hummer for scenic drives or stop for short hikes at overlooks like Tunnel View, Bridalveil Fall, and El Capitan Meadow. The off-road-capable vehicle and private format deliver a high-value, crowd-free alternative to standard bus tours. Hotel pickup and drop-off, lunch, bottled water, and guide service are included for this full-day adventure.",
  "69029P8":
    "Pack Yosemite Valley, Glacier Point, and giant sequoias into one private guided day with a naturalist who adjusts hiking distance to your group. Pickup is available along Highway 120 between Groveland and the valley, with day packs, water filtration, snacks, and a custom hiker's lunch included for trail time between Bridalveil Fall, Tuolumne Grove, and rim overlooks. The private format keeps the pace flexible for photo stops and short swims near waterfalls when conditions allow. Private guide service, park entry, lunch, and transport from select Groveland pickup points are included.",
  "7011P11":
    "Backpack Yosemite's backcountry on a four-day guided trek culminating at Half Dome with permits, camp meals, and an expert guide handling logistics. Routes through Happy Isles, Little Yosemite Valley, and Sunrise Creek keep you away from valley crowds while building toward the cable ascent on the summit day. Group size is capped for an intimate wilderness experience with breakfasts, lunches, and dinners prepared in camp. Guide service and multi-day camp meals are included; personal camping gear such as a tent, sleeping bag, and pad is required.",
  "19970P1":
    "Ride a 4x4 Jeep from Fish Camp into Sierra National Forest for an off-road approach to a giant sequoia grove near Yosemite's south entrance. After a thrilling forest drive, take an easy guided hike among massive trees with commentary on Sierra Nevada ecology and the park gateway landscape. The half-day format pairs adventure with accessible walking suitable for most travelers seeking sequoias without a full valley tour. Driver-guide service and taxes are included for this Fish Camp departure.",
  "460648P15":
    "Book an Ultimate Yosemite private day shaped by a pre-trip questionnaire and led by local guides who route you to iconic overlooks and quieter corners of the park. The tailor-made itinerary runs four to eight hours with a picnic lunch in a scenic setting and optional trekking poles for trail segments your group selects. This is a premium private format without hotel transfers, focused on maximizing time inside the park with expert guidance. Professional guide service, lunch, and Yosemite entry reservation support are included.",
  "5582835P5":
    "Join a four-day guided Half Dome backpacking trip with wilderness permits, camp meals, and a Wilderness First Responder guide from Mono Meadows Trailhead. The route covers Illilouette Creek, Clouds Rest, the Half Dome cables, and Panorama Trail descents past Nevada Fall with group gear such as water filters, stoves, and bear cans supplied. Expect hearty breakfasts and dinners on trail with routing designed to hit bucket-list summits without self-managed permit logistics. Guide service, permits, group gear, and camp meals are included; personal backpacking equipment is required.",
  "449449P2":
    "Follow a private guide through Yosemite's waterfall country on a customizable six- to eight-hour tour that may include Bridalveil Fall, Yosemite Falls, Vernal Fall, and Nevada Fall depending on season and trail access. Meet at Curry Village for a hiking or car-based route tailored to your fitness, with Yosemite entry reservation handled for the day and trekking poles available on request. Spring and early summer deliver peak flow, while your guide adjusts routing when falls run lighter later in the year. Private guide service, park entry reservation, and private transport are included for this waterfall-focused day.",
};

export const getEngine6TargetedNarrativeDescription = (productCode: string) =>
  getGreatSmokyMountainsTargetedNarrativeDescription(productCode) ??
  getBostonTargetedNarrativeDescription(productCode) ??
  getPhiladelphiaTargetedNarrativeDescription(productCode) ??
  getRockyMountainNationalParkTargetedNarrativeDescription(productCode) ??
  getMoabTargetedNarrativeDescription(productCode) ??
  ENGINE6_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as Engine6TargetedNarrativeDescriptionProductCode
  ];
