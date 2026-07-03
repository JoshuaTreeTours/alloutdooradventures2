import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { WASHINGTON_DC_VIATOR_PUBLIC_RATINGS } from "../src/engine6/washingtonDcViatorPublicRatings";

type ItineraryItem = {
  title: string;
  description: string;
  duration?: string;
  stopType: "stop" | "pass-by";
};

type WashingtonDcTourFixture = {
  productCode: string;
  productUrl: string;
  title: string;
  description: string;
  duration: string;
  priceFrom: number;
  heroUrl: string;
  rating: number;
  reviewCount: number;
  highlights: string[];
  startDescription: string;
  endDescription: string;
  itineraryItems: ItineraryItem[];
  inclusions: string[];
  categories: string[];
};

const TACDN = "https://media.tacdn.com/media/attractions-splice-spp-674x446";

const WASHINGTON_DC_TOURS: WashingtonDcTourFixture[] = [
  {
    productCode: "67327P4",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Night-Tour-of-Washington-DC/d657-67327P4",
    title: "Private Night-Time Monuments Tour of DC",
    description:
      "See Washington's most iconic memorials after dark on a private evening tour built around your group's pace and photo priorities. A professional guide leads your party through the National Mall corridor with stops at the Lincoln Memorial, Vietnam Veterans Memorial, and Jefferson Memorial when lighting and crowds allow. Travel in a private vehicle with flexible routing past the Washington Monument and World War II Memorial. This premium format suits travelers who want an unhurried monuments experience without joining a large motorcoach group.",
    duration: "3 hours (approx.)",
    priceFrom: 425,
    heroUrl: `${TACDN}/06/ff/ad/1b.jpg`,
    rating: 5,
    reviewCount: 278,
    highlights: [
      "Private night monuments tour for your party only",
      "Lincoln Memorial and Reflecting Pool photo stops",
      "Jefferson Memorial and Tidal Basin viewpoints",
      "Flexible vehicle routing along the National Mall",
      "Professional guide with evening lighting commentary",
    ],
    startDescription:
      "Pickup from downtown Washington, D.C. hotels or a central meeting point confirmed when booking. Evening departure times vary by season.",
    endDescription:
      "Return to your pickup location or downtown hotel after the final memorial stop.",
    itineraryItems: [
      {
        title: "Lincoln Memorial",
        description:
          "Evening stop at the Lincoln Memorial steps with views across the Reflecting Pool.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Vietnam Veterans Memorial",
        description:
          "Walk the black granite wall panels with guide commentary on the memorial design.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "World War II Memorial",
        description:
          "Photo stop at the WWII Memorial fountains with the Washington Monument backdrop.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Jefferson Memorial",
        description:
          "Visit the Tidal Basin viewpoint for the Jefferson Memorial dome at night.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Washington Monument",
        description:
          "Pass-by views of the illuminated Washington Monument along the Mall.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Private professional guide",
      "Private vehicle transport",
      "Hotel pickup and drop-off",
      "Bottled water",
    ],
    categories: ["Private Tours", "Night Tours", "Sightseeing Tours"],
  },
  {
    productCode: "7953P7",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Private-Night-City-Tour/d657-7953P7",
    title: "Private Washington DC Night City Tour",
    description:
      "Explore the capital after sunset on a four-hour private city tour that combines National Mall memorials with Georgetown and Capitol Hill viewpoints. Your guide adjusts the route to your interests, whether that means extended time at the Lincoln Memorial or a drive through Embassy Row and Dupont Circle. Private vehicle transport keeps the evening comfortable while maximizing stops at illuminated landmarks. Ideal for first-time visitors who want a comprehensive night overview tailored to their group.",
    duration: "4 hours (approx.)",
    priceFrom: 392,
    heroUrl: `${TACDN}/11/7d/78/0a.jpg`,
    rating: 4.9,
    reviewCount: 450,
    highlights: [
      "Four-hour private night tour of Washington, D.C.",
      "National Mall memorials with flexible photo time",
      "Capitol Hill and Library of Congress exterior views",
      "Georgetown waterfront and Embassy Row routing options",
      "Private vehicle with hotel pickup",
    ],
    startDescription:
      "Evening pickup from select Washington, D.C. hotels or a downtown meeting point confirmed at booking.",
    endDescription:
      "Return to your hotel or original pickup location after the final city viewpoint.",
    itineraryItems: [
      {
        title: "US Capitol",
        description:
          "Exterior photo stop at the Capitol building with the National Mall approach.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Lincoln Memorial",
        description:
          "Evening visit to the Lincoln Memorial with Reflecting Pool panoramas.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Korean War Veterans Memorial",
        description:
          "Walk among the stainless-steel soldier statues with guide interpretation.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Georgetown",
        description:
          "Drive through Georgetown streets with optional waterfront stop.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "White House",
        description:
          "North Lawn viewpoint for the White House exterior at night.",
        duration: "15 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private driver-guide",
      "Private air-conditioned vehicle",
      "Hotel pickup and drop-off",
      "Bottled water",
    ],
    categories: ["Private Tours", "Night Tours", "City Tours"],
  },
  {
    productCode: "32453P11",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Private-SUV-Night-Tour-with-Professional-Guide/d657-32453P11",
    title: "Private Under the Stars Night Tour",
    description:
      "Tour Washington's illuminated monuments from a private SUV with a professional guide who knows the best after-dark viewpoints. The three-hour route covers the National Mall memorials, Capitol Hill exteriors, and selective neighborhood passes timed for evening light. SUV transport suits small groups who want door-to-door convenience and climate-controlled comfort between stops. Your guide paces the outing for photography and storytelling rather than rigid bus schedules.",
    duration: "3 hours (approx.)",
    priceFrom: 479,
    heroUrl: `${TACDN}/0a/9a/0d/f8.jpg`,
    rating: 4.9,
    reviewCount: 312,
    highlights: [
      "Private SUV night tour with professional guide",
      "National Mall memorial loop with photo stops",
      "Capitol and Supreme Court exterior viewpoints",
      "Door-to-door hotel pickup in Washington, D.C.",
      "Flexible pacing for evening photography",
    ],
    startDescription:
      "Pickup from your Washington, D.C. hotel or a confirmed downtown meeting point at your scheduled evening time.",
    endDescription:
      "Return to your pickup location after the final National Mall memorial.",
    itineraryItems: [
      {
        title: "Washington Monument",
        description:
          "Ground-level stop near the Washington Monument with Mall panoramas.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Lincoln Memorial",
        description:
          "Evening walk at the Lincoln Memorial with Reflecting Pool views.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Martin Luther King Jr. Memorial",
        description:
          "Stop at the MLK Memorial along the Tidal Basin promenade.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "US Capitol",
        description:
          "Capitol Hill exterior stop with views toward the National Mall.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "Private SUV transport",
      "Hotel pickup and drop-off",
      "Bottled water",
    ],
    categories: ["Private Tours", "Night Tours", "Luxury Tours"],
  },
  {
    productCode: "149066P1",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Luxury-Tour-of-Washington-DC-at-Night-with-a-Chauffeur-Late-Model-SUV/d657-149066P1",
    title: "DC After Dark Luxury SUV Tour",
    description:
      "Experience Washington after dark in a late-model luxury SUV with a chauffeur and guide who curate a premium four-hour monuments itinerary. The route emphasizes unhurried stops at the Lincoln Memorial, Jefferson Memorial, and Capitol Hill with optional extensions to Embassy Row or Georgetown. This top-tier outing suits travelers who want white-glove transport, flexible timing, and a private format for special occasions or executive entertaining in the capital.",
    duration: "4 hours (approx.)",
    priceFrom: 821,
    heroUrl: `${TACDN}/12/37/ef/f1.jpg`,
    rating: 5,
    reviewCount: 189,
    highlights: [
      "Luxury late-model SUV with chauffeur and guide",
      "Extended evening stops at major National Mall memorials",
      "Capitol Hill and White House exterior routing",
      "Premium private format for up to your party size",
      "Flexible four-hour itinerary tailored to your interests",
    ],
    startDescription:
      "Chauffeur pickup from your Washington, D.C. hotel or private address confirmed at booking.",
    endDescription:
      "Return to your hotel or requested drop-off point after the final monuments stop.",
    itineraryItems: [
      {
        title: "White House",
        description:
          "Evening exterior stop at the White House North Lawn viewpoint.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Lincoln Memorial",
        description:
          "Extended visit at the Lincoln Memorial with Reflecting Pool photography time.",
        duration: "35 minutes",
        stopType: "stop",
      },
      {
        title: "Jefferson Memorial",
        description:
          "Tidal Basin approach to the Jefferson Memorial with dome views.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "US Capitol",
        description:
          "Capitol building exterior stop with illuminated dome views.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Embassy Row",
        description:
          "Scenic drive along Massachusetts Avenue embassy corridors.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Chauffeur and professional guide",
      "Late-model luxury SUV",
      "Hotel pickup and drop-off",
      "Bottled water and refreshments",
    ],
    categories: ["Private Tours", "Luxury Tours", "Night Tours"],
  },
  {
    productCode: "255730P191",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Night-time-Walking-Tour-of-DCs-National-Mall/d657-255730P191",
    title: "National Mall at Dusk Private Tour",
    description:
      "Walk the National Mall at dusk on a private two-hour tour focused on the memorials between the Lincoln Memorial and the Capitol. Your guide leads a paced stroll with stops at the Vietnam Veterans Memorial, World War II Memorial, and Washington Monument viewpoints as daylight fades to monument lighting. This walking format suits travelers who want an intimate Mall experience without vehicle transfers. Meet near the Mall for a compact evening outing with flexible photo time.",
    duration: "2 hours (approx.)",
    priceFrom: 185,
    heroUrl: `${TACDN}/12/3b/11/77.jpg`,
    rating: 4.8,
    reviewCount: 95,
    highlights: [
      "Private dusk walking tour of the National Mall",
      "Lincoln Memorial and Reflecting Pool stop",
      "Vietnam and World War II Memorial visits",
      "Washington Monument viewpoints at twilight",
      "Two-hour format ideal for evening plans",
    ],
    startDescription:
      "Meet your guide at the Lincoln Memorial circle or a confirmed National Mall meeting point at dusk.",
    endDescription:
      "Tour concludes near the World War II Memorial or your agreed Mall endpoint.",
    itineraryItems: [
      {
        title: "Lincoln Memorial",
        description:
          "Begin at the Lincoln Memorial with overview of the Mall memorial layout.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Vietnam Veterans Memorial",
        description:
          "Walk the memorial wall with guide commentary on its design and history.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "World War II Memorial",
        description:
          "Stop at the WWII Memorial fountains with Atlantic and Pacific pavilions.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Washington Monument",
        description:
          "Approach the Washington Monument grounds for twilight skyline views.",
        duration: "15 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Private professional guide", "Walking tour of the National Mall"],
    categories: ["Private Tours", "Walking Tours", "Night Tours"],
  },
  {
    productCode: "67327P5",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Mount-Vernon-and-Arlington-Cemetery-Tour/d657-67327P5",
    title: "Private Mt Vernon and Arlington Cemetery Tour",
    description:
      "Day-trip to Mount Vernon and Arlington National Cemetery on a private eight-hour tour with a dedicated guide and vehicle. Explore George Washington's estate along the Potomac, then continue to Arlington for the Changing of the Guard at the Tomb of the Unknown Soldier and visits to notable gravesites. Your guide handles timing between Virginia sites while allowing flexible lunch and photo stops. This premium outing suits history-focused travelers who want both founding-era and military heritage in one private day.",
    duration: "8 hours (approx.)",
    priceFrom: 650,
    heroUrl: `${TACDN}/06/73/40/d0.jpg`,
    rating: 5,
    reviewCount: 142,
    highlights: [
      "Private full-day Mount Vernon and Arlington tour",
      "Guided visit to George Washington's estate and mansion",
      "Arlington National Cemetery with Tomb of the Unknown Soldier",
      "Changing of the Guard viewing when schedule allows",
      "Private vehicle with hotel pickup in Washington, D.C.",
    ],
    startDescription:
      "Morning pickup from your Washington, D.C. hotel. Confirm pickup window when booking.",
    endDescription:
      "Return to your Washington, D.C. hotel after the Arlington Cemetery visit.",
    itineraryItems: [
      {
        title: "Mount Vernon",
        description:
          "Tour George Washington's mansion, gardens, and Potomac River grounds.",
        duration: "2 hours 30 minutes",
        stopType: "stop",
      },
      {
        title: "George Washington's Tomb",
        description:
          "Visit the Washington family tomb on the Mount Vernon estate.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Arlington National Cemetery",
        description:
          "Enter Arlington Cemetery for guided visits to major memorial sections.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Tomb of the Unknown Soldier",
        description:
          "Watch the Changing of the Guard ceremony at the Tomb of the Unknown Soldier.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Arlington House",
        description:
          "Viewpoint stop at Arlington House with cemetery and city panoramas.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private professional guide",
      "Private vehicle transport",
      "Mount Vernon admission",
      "Hotel pickup and drop-off",
    ],
    categories: ["Private Tours", "Day Trips", "Historical Tours"],
  },
  {
    productCode: "41503P1",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Private-DC-Monuments-at-Night-by-Bike/d657-41503P1",
    title: "Private DC Monuments at Night Bike Tour",
    description:
      "Cycle the National Mall after dark on a private three-hour bike tour with a guide who leads your party along lighted memorial paths. The route connects the Lincoln Memorial, Jefferson Memorial, and Capitol Hill approaches with stops timed for evening photography and fewer daytime crowds. Bikes, helmets, and safety briefing are included with pacing matched to your group's fitness. This active format suits travelers who want monuments sightseeing with an outdoor evening workout.",
    duration: "3 hours (approx.)",
    priceFrom: 580,
    heroUrl: `${TACDN}/07/8e/dd/db.jpg`,
    rating: 5,
    reviewCount: 55,
    highlights: [
      "Private night bike tour of DC monuments",
      "Lincoln and Jefferson Memorial stops by bicycle",
      "Capitol Hill and National Mall riding route",
      "Bikes, helmets, and safety briefing included",
      "Guide-paced outing for your party only",
    ],
    startDescription:
      "Meet at the bike rental staging area near the National Mall confirmed when booking. Arrive 15 minutes early for fitting.",
    endDescription:
      "Return bikes to the staging area after the final memorial stop.",
    itineraryItems: [
      {
        title: "National Mall",
        description:
          "Bike orientation and safety briefing before entering the Mall paths.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Lincoln Memorial",
        description:
          "Evening stop at the Lincoln Memorial with bike rack parking.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Jefferson Memorial",
        description:
          "Ride along the Tidal Basin to the Jefferson Memorial viewpoint.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "US Capitol",
        description:
          "Capitol Hill approach with exterior photo stop.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Washington Monument",
        description:
          "Pass the Washington Monument grounds on the return Mall loop.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Private bike guide",
      "Bike and helmet rental",
      "Safety briefing",
      "Bottled water",
    ],
    categories: ["Private Tours", "Bike Tours", "Night Tours"],
  },
  {
    productCode: "41503P2",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Customized-DC-Sights-Bike-Tour/d657-41503P2",
    title: "Customized Private Bike Tour",
    description:
      "Design your own Washington, D.C. bike route on a private three-hour tour with a guide who adapts stops to your interests. Choose emphasis on National Mall memorials, Capitol Hill landmarks, Georgetown waterfront paths, or a mix of monument and neighborhood riding. Bikes and helmets are included with route pacing adjusted to your group's ability. This flexible private format suits repeat visitors and active travelers who want sightseeing on two wheels rather than a motorcoach.",
    duration: "3 hours (approx.)",
    priceFrom: 595,
    heroUrl: `${TACDN}/06/6c/30/76.jpg`,
    rating: 4.9,
    reviewCount: 48,
    highlights: [
      "Customizable private DC bike tour itinerary",
      "National Mall or Georgetown routing options",
      "Capitol Hill and memorial stops on your schedule",
      "Bikes, helmets, and guide included",
      "Three-hour active sightseeing format",
    ],
    startDescription:
      "Meet at the National Mall bike staging location or Georgetown depot confirmed at booking.",
    endDescription:
      "Return to the starting depot after completing your customized route.",
    itineraryItems: [
      {
        title: "Route Planning",
        description:
          "Brief with your guide to set priorities among Mall, Capitol, or Georgetown stops.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "Lincoln Memorial",
        description:
          "Optional memorial stop at the Lincoln Memorial when included in your route.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "US Capitol",
        description:
          "Capitol Hill exterior stop when your customized route includes the east end of the Mall.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Georgetown Waterfront",
        description:
          "Optional ride along the Georgetown waterfront and C&O Canal paths.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private bike guide",
      "Bike and helmet rental",
      "Custom route planning",
      "Bottled water",
    ],
    categories: ["Private Tours", "Bike Tours", "Sightseeing Tours"],
  },
  {
    productCode: "6349P24",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Small-Group-Mount-Vernon-and-Arlington-National-Cemetery-Tour/d657-6349P24",
    title: "Small-Group Mount Vernon and Arlington Tour",
    description:
      "Visit Mount Vernon and Arlington National Cemetery on a small-group six-hour tour from Washington, D.C. with a professional guide and comfortable transport. Tour George Washington's Potomac estate, then continue to Arlington for the Tomb of the Unknown Soldier and notable memorial sections. Group size stays limited for a social but uncrowded Virginia day trip. Mount Vernon admission and cemetery access are included with hotel pickup options downtown.",
    duration: "6 hours (approx.)",
    priceFrom: 109,
    heroUrl: `${TACDN}/09/1f/52/93.jpg`,
    rating: 4.8,
    reviewCount: 890,
    highlights: [
      "Small-group Mount Vernon and Arlington day trip",
      "Guided tour of George Washington's estate",
      "Arlington Cemetery with Tomb of the Unknown Soldier",
      "Changing of the Guard when ceremony schedule allows",
      "Transport from Washington, D.C. with limited group size",
    ],
    startDescription:
      "Morning departure from select downtown Washington, D.C. hotels or a central meeting point.",
    endDescription:
      "Return to downtown Washington, D.C. after the Arlington Cemetery visit.",
    itineraryItems: [
      {
        title: "Mount Vernon",
        description:
          "Guided visit to the mansion, museum, and Potomac River grounds.",
        duration: "2 hours",
        stopType: "stop",
      },
      {
        title: "George Washington's Tomb",
        description:
          "Stop at the Washington family tomb on the estate.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Arlington National Cemetery",
        description:
          "Guided walk through major cemetery sections and memorials.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Tomb of the Unknown Soldier",
        description:
          "View the Changing of the Guard ceremony at Arlington.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "Air-conditioned transport",
      "Mount Vernon admission",
      "Hotel pickup",
    ],
    categories: ["Small Group Tours", "Day Trips", "Historical Tours"],
  },
  {
    productCode: "2890P28",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Mt-Vernon-and-Arlington-Cemetery-Tour/d657-2890P28",
    title: "Mt Vernon and Arlington Cemetery Tour",
    description:
      "Combine Mount Vernon and Arlington National Cemetery on a full-day seven-hour tour from Washington, D.C. with extended time at George Washington's estate and a comprehensive Arlington visit. Your guide covers founding-era history at Mount Vernon before transitioning to military heritage at the Tomb of the Unknown Soldier and Kennedy gravesite area. This popular group format delivers both Virginia landmarks in one outing with transport and admissions handled. Suitable for history-minded travelers with a full day available.",
    duration: "7 hours (approx.)",
    priceFrom: 95,
    heroUrl: `${TACDN}/07/36/99/d5.jpg`,
    rating: 4.7,
    reviewCount: 1200,
    highlights: [
      "Full-day Mount Vernon and Arlington Cemetery tour",
      "Extended time at George Washington's Potomac estate",
      "Arlington National Cemetery guided walk",
      "Tomb of the Unknown Soldier ceremony viewing",
      "Round-trip transport from Washington, D.C.",
    ],
    startDescription:
      "Board at select Washington, D.C. hotels or the confirmed downtown departure point in the morning.",
    endDescription:
      "Return to Washington, D.C. after the Arlington Cemetery portion.",
    itineraryItems: [
      {
        title: "Mount Vernon",
        description:
          "Tour the mansion, museum exhibits, and riverside outbuildings.",
        duration: "2 hours 30 minutes",
        stopType: "stop",
      },
      {
        title: "Mount Vernon Gardens",
        description:
          "Walk the estate gardens and farm areas with guide commentary.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Arlington National Cemetery",
        description:
          "Enter the cemetery for a guided overview of major sections.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Tomb of the Unknown Soldier",
        description:
          "Attend the Changing of the Guard at the Tomb of the Unknown Soldier.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "John F. Kennedy Gravesite",
        description:
          "Visit the Kennedy gravesite and Eternal Flame memorial.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "Motorcoach transport",
      "Mount Vernon admission",
      "Arlington Cemetery access",
    ],
    categories: ["Bus Tours", "Day Trips", "Historical Tours"],
  },
  {
    productCode: "67327P3",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Washington-DC-and-Arlington-Cemetery-Tour/d657-67327P3",
    title: "Private DC and Arlington Cemetery Tour",
    description:
      "See Washington landmarks and Arlington National Cemetery on a private six-hour tour combining National Mall memorials with a guided cemetery visit. Your guide leads stops at the Lincoln Memorial, White House exterior, and Capitol Hill before crossing the Potomac to Arlington for the Tomb of the Unknown Soldier. Private vehicle transport keeps the day efficient while allowing flexible photo time at each site. Ideal for travelers who want both city monuments and military heritage without self-navigating Virginia traffic.",
    duration: "6 hours (approx.)",
    priceFrom: 520,
    heroUrl: `${TACDN}/06/ff/aa/03.jpg`,
    rating: 5,
    reviewCount: 167,
    highlights: [
      "Private six-hour DC monuments and Arlington tour",
      "National Mall memorial stops with guide commentary",
      "White House and US Capitol exterior viewpoints",
      "Arlington Cemetery with Tomb of the Unknown Soldier",
      "Private vehicle with hotel pickup",
    ],
    startDescription:
      "Morning pickup from your Washington, D.C. hotel. Confirm pickup time when booking.",
    endDescription:
      "Return to your hotel after the Arlington Cemetery visit.",
    itineraryItems: [
      {
        title: "White House",
        description:
          "Exterior photo stop at the White House North Lawn viewpoint.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Lincoln Memorial",
        description:
          "Visit the Lincoln Memorial with Reflecting Pool views.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "US Capitol",
        description:
          "Capitol Hill exterior stop with National Mall panoramas.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Arlington National Cemetery",
        description:
          "Guided walk through Arlington with major memorial stops.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "Tomb of the Unknown Soldier",
        description:
          "View the Changing of the Guard ceremony at Arlington.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private professional guide",
      "Private vehicle transport",
      "Hotel pickup and drop-off",
      "Bottled water",
    ],
    categories: ["Private Tours", "Historical Tours", "Sightseeing Tours"],
  },
  {
    productCode: "5713P68",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Sample-Tastes-of-H-Street-Walking-Tour-With-Craft-Beer-Tasting/d657-5713P68",
    title: "Private H Street Walking Food Tour",
    description:
      "Explore H Street NE on a private three-hour food and history walking tour with craft beer tastings at neighborhood establishments. Your guide connects the corridor's revival story with stops at local eateries serving regional flavors and brews. The route covers historic blocks between Union Station and the Atlas District with time to sample dishes and learn about Capitol Hill-adjacent neighborhood change. This premium food outing suits travelers who want a curated taste of DC beyond the National Mall.",
    duration: "3 hours (approx.)",
    priceFrom: 89,
    heroUrl: `${TACDN}/06/71/9c/28.jpg`,
    rating: 4.6,
    reviewCount: 47,
    highlights: [
      "Private H Street food and history walking tour",
      "Craft beer tastings at local establishments",
      "Multiple food sample stops along the corridor",
      "Guide commentary on H Street neighborhood history",
      "Three-hour format near Union Station",
    ],
    startDescription:
      "Meet your guide near Union Station or the confirmed H Street NE meeting point at your scheduled time.",
    endDescription:
      "Tour ends on H Street NE near the final tasting stop.",
    itineraryItems: [
      {
        title: "Washington Union Station",
        description:
          "Orientation near Union Station before entering the H Street corridor.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "H Street NE",
        description:
          "Walk the main H Street corridor with history commentary on neighborhood revival.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Food Sample Stop",
        description:
          "Taste regional dishes at a curated H Street restaurant.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Craft Beer Tasting",
        description:
          "Sample local craft beers at a neighborhood taproom or brewery.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private food guide",
      "Food samples",
      "Craft beer tastings",
      "Walking tour",
    ],
    categories: ["Private Tours", "Food Tours", "Walking Tours"],
  },
  {
    productCode: "6349DAYTOUR",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-in-One-Day-Guided-Sightseeing-Tour/d657-6349DAYTOUR",
    title: "Washington DC in One Day",
    description:
      "See the capital's essential landmarks on a six-hour guided sightseeing tour covering the National Mall, Capitol Hill, and major memorials. A professional guide narrates the route with stops at the Lincoln Memorial, White House exterior, and Smithsonian area viewpoints. Motorcoach transport links the east and west ends of the Mall efficiently for first-time visitors with limited time. This comprehensive day tour delivers a solid DC overview without requiring separate monument visits.",
    duration: "6 hours (approx.)",
    priceFrom: 89,
    heroUrl: `${TACDN}/07/72/0b/48.jpg`,
    rating: 4.7,
    reviewCount: 2941,
    highlights: [
      "Full-day DC highlights sightseeing tour",
      "Lincoln Memorial and National Mall stops",
      "White House and US Capitol exterior views",
      "Professional guide with city history commentary",
      "Motorcoach transport with hotel pickup options",
    ],
    startDescription:
      "Pickup from select downtown Washington, D.C. hotels or a central departure point in the morning.",
    endDescription:
      "Return to downtown Washington, D.C. after the final National Mall stop.",
    itineraryItems: [
      {
        title: "US Capitol",
        description:
          "Exterior stop at the Capitol with views down the National Mall.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "White House",
        description:
          "Photo stop at the White House North Lawn viewpoint.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Lincoln Memorial",
        description:
          "Visit the Lincoln Memorial with Reflecting Pool panoramas.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Vietnam Veterans Memorial",
        description:
          "Walk the Vietnam Memorial wall with guide interpretation.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "National Mall",
        description:
          "Drive the length of the National Mall with Smithsonian building pass-by views.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["Professional guide", "Air-conditioned motorcoach", "Hotel pickup"],
    categories: ["Bus Tours", "Full-day Tours", "Sightseeing Tours"],
  },
  {
    productCode: "6349NIGHT",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Guided-Night-Tour/d657-6349NIGHT",
    title: "DC Monument Night Tour",
    description:
      "Tour Washington's illuminated monuments on a three-hour evening motorcoach outing with stops at the Lincoln Memorial, Vietnam Veterans Memorial, and Iwo Jima Memorial. A guide provides commentary as you travel the National Mall corridor after dark when memorial lighting creates dramatic photo opportunities. This popular night format suits first-time visitors who want an efficient monuments loop without walking long distances. Hotel pickup options are available from downtown Washington, D.C.",
    duration: "3 hours (approx.)",
    priceFrom: 69,
    heroUrl: `${TACDN}/07/8e/dc/db.jpg`,
    rating: 4.7,
    reviewCount: 6284,
    highlights: [
      "Guided three-hour DC monuments night tour",
      "Lincoln Memorial and Reflecting Pool stop",
      "Vietnam Veterans Memorial visit",
      "Iwo Jima Memorial photo opportunity",
      "Motorcoach transport with evening hotel pickup",
    ],
    startDescription:
      "Evening pickup from select Washington, D.C. hotels or the confirmed downtown departure point.",
    endDescription:
      "Return to downtown Washington, D.C. after the final memorial stop.",
    itineraryItems: [
      {
        title: "Lincoln Memorial",
        description:
          "Evening stop at the Lincoln Memorial with Reflecting Pool views.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Vietnam Veterans Memorial",
        description:
          "Walk the memorial wall panels with guide commentary.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Korean War Veterans Memorial",
        description:
          "Stop at the Korean War Memorial soldier statues.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "US Marine Corps War Memorial",
        description:
          "Photo stop at the Iwo Jima Memorial across the Potomac.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Professional guide", "Motorcoach transport", "Hotel pickup"],
    categories: ["Bus Tours", "Night Tours", "Sightseeing Tours"],
  },
  {
    productCode: "6766P11",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Moonlit-Motorcoach-Tour-of-National-Mall/d657-6766P11",
    title: "DC National Mall Night Tour",
    description:
      "Ride a motorcoach through the National Mall on a three-hour moonlit tour with stops at major memorials between the Capitol and Lincoln Memorial. Your guide highlights evening lighting at the Washington Monument, World War II Memorial, and Jefferson Memorial when the route includes Tidal Basin viewpoints. This efficient night outing covers the Mall's core monuments without extensive walking. Departure from downtown Washington, D.C. hotels makes it easy to pair with an evening dinner plan.",
    duration: "3 hours (approx.)",
    priceFrom: 69,
    heroUrl: `${TACDN}/06/73/46/37.jpg`,
    rating: 4.6,
    reviewCount: 4189,
    highlights: [
      "Moonlit motorcoach tour of the National Mall",
      "Washington Monument and WWII Memorial stops",
      "Lincoln Memorial evening visit",
      "Jefferson Memorial Tidal Basin viewpoint when routed",
      "Three-hour format with hotel pickup",
    ],
    startDescription:
      "Evening boarding at select Washington, D.C. hotels or the confirmed downtown pickup point.",
    endDescription:
      "Return to downtown Washington, D.C. after completing the Mall memorial loop.",
    itineraryItems: [
      {
        title: "Washington Monument",
        description:
          "Grounds stop near the Washington Monument with Mall views.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "World War II Memorial",
        description:
          "Evening visit to the WWII Memorial fountains and pavilions.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Lincoln Memorial",
        description:
          "Stop at the Lincoln Memorial with Reflecting Pool panoramas.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "Jefferson Memorial",
        description:
          "Tidal Basin viewpoint for the Jefferson Memorial dome at night.",
        duration: "20 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Professional guide", "Motorcoach transport", "Hotel pickup"],
    categories: ["Bus Tours", "Night Tours", "Sightseeing Tours"],
  },
  {
    productCode: "41377P2",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Capitol-Hill-Guided-Small-Group-Tour/d657-41377P2",
    title: "Capitol Hill Small-Group Tour",
    description:
      "Explore Capitol Hill on a small-group two-and-a-half-hour walking tour covering the US Capitol exterior, Supreme Court, and Library of Congress viewpoints. Your guide explains the legislative campus layout, neoclassical architecture, and neighborhood history around the eastern end of the National Mall. Group size stays limited for easy movement through security-conscious federal blocks. This focused outing suits travelers who want Capitol Hill depth without a full-day city tour.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 89,
    heroUrl: `${TACDN}/0b/ef/3b/86.jpg`,
    rating: 4.8,
    reviewCount: 1584,
    highlights: [
      "Small-group Capitol Hill walking tour",
      "US Capitol exterior and grounds overview",
      "Supreme Court and Library of Congress viewpoints",
      "Guide commentary on legislative branch history",
      "Two-and-a-half-hour format near the National Mall",
    ],
    startDescription:
      "Meet your guide at the Capitol South Metro area or confirmed Capitol Hill meeting point.",
    endDescription:
      "Tour ends near the Library of Congress or your agreed Capitol Hill endpoint.",
    itineraryItems: [
      {
        title: "US Capitol",
        description:
          "Exterior tour of the Capitol building and east front plaza.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Supreme Court",
        description:
          "View the Supreme Court building facade with guide commentary.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Library of Congress",
        description:
          "Exterior stop at the Thomas Jefferson Building with photo time.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Capitol Hill Neighborhood",
        description:
          "Walk residential blocks with history of the Hill community.",
        duration: "25 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Professional guide", "Small-group walking tour"],
    categories: ["Small Group Tours", "Walking Tours", "Historical Tours"],
  },
  {
    productCode: "60725P1",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/See-the-City-Segway-Tour/d657-60725P1",
    title: "See the City Segway Tour",
    description:
      "Glide through Washington, D.C. on a two-and-a-half-hour Segway tour with stops at the White House, Lincoln Memorial, and Pennsylvania Avenue viewpoints. After a training session, your guide leads a paced route along National Mall paths and downtown corridors with commentary on monuments and federal landmarks. Segways and helmets are included with instruction for first-time riders. This active sightseeing format covers more ground than a walking tour in less time.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 75,
    heroUrl: `${TACDN}/0b/8d/fe/ac.jpg`,
    rating: 4.9,
    reviewCount: 1828,
    highlights: [
      "Segway tour of DC monuments and downtown",
      "Training session and safety briefing included",
      "White House and Lincoln Memorial stops",
      "National Mall riding route with guide commentary",
      "Two-and-a-half-hour active sightseeing format",
    ],
    startDescription:
      "Meet at the Segway staging area near the National Mall confirmed when booking. Allow time for training.",
    endDescription:
      "Return Segways to the staging area after the final downtown stop.",
    itineraryItems: [
      {
        title: "Segway Training",
        description:
          "Instruction and practice session before entering the tour route.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "White House",
        description:
          "Segway stop at the White House exterior viewpoint.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Lincoln Memorial",
        description:
          "Ride to the Lincoln Memorial with photo time at the steps.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Pennsylvania Avenue",
        description:
          "Segway segment along Pennsylvania Avenue with federal building views.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "National Mall",
        description:
          "Ride the Mall paths with Washington Monument pass-by views.",
        stopType: "pass-by",
      },
    ],
    inclusions: ["Professional guide", "Segway rental and helmet", "Training session"],
    categories: ["Segway Tours", "Sightseeing Tours", "Active Tours"],
  },
  {
    productCode: "14782P1",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Walking-Food-Tour-Of-The-Historic-U-Street-Neighborhood/d657-14782P1",
    title: "U Street Walking Food Tour",
    description:
      "Discover U Street on a three-hour walking food tour through the historic corridor known for jazz heritage, civil rights history, and vibrant dining. Sample dishes at local establishments while your guide explains the neighborhood's role in Black Broadway and DC cultural life. Stops may include soul food, Ethiopian cuisine, and classic DC flavors along the main U Street strip. This food-focused outing suits travelers who want local culture beyond monument sightseeing.",
    duration: "3 hours (approx.)",
    priceFrom: 112,
    heroUrl: `${TACDN}/07/69/43/13.jpg`,
    rating: 4.8,
    reviewCount: 253,
    highlights: [
      "U Street food and history walking tour",
      "Multiple food tastings at neighborhood restaurants",
      "Guide commentary on Black Broadway heritage",
      "Civil rights and jazz history along the corridor",
      "Three-hour format in central Washington, D.C.",
    ],
    startDescription:
      "Meet your guide at the confirmed U Street Metro area meeting point at your scheduled departure time.",
    endDescription:
      "Tour ends on U Street near the final tasting stop.",
    itineraryItems: [
      {
        title: "Washington U Street Corridor",
        description:
          "Orientation walk along U Street with neighborhood history introduction.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Ben's Chili Bowl Area",
        description:
          "Learn the history of this landmark corridor near Ben's Chili Bowl.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Food Tasting Stop",
        description:
          "Sample signature dishes at a curated U Street restaurant.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Ethiopian Dining District",
        description:
          "Taste Ethiopian cuisine on the eastern U Street dining strip.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Food guide", "Food tastings", "Walking tour"],
    categories: ["Food Tours", "Walking Tours", "Cultural Tours"],
  },
  {
    productCode: "5046WAS_MON",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-by-Moonlight-Night-Tour-by-Trolley/d657-5046WAS_MON",
    title: "Monuments by Moonlight Trolley Tour",
    description:
      "Ride an open-air trolley through Washington's monuments on a two-and-a-half-hour moonlight tour with stops at the Lincoln Memorial, Vietnam Veterans Memorial, and Iwo Jima Memorial. The trolley format adds a classic sightseeing feel while your guide narrates the illuminated National Mall corridor. Evening departures capture memorial lighting with fewer daytime crowds. This budget-friendly night tour suits families and first-time visitors who want an efficient monuments loop.",
    duration: "2 hours 30 minutes (approx.)",
    priceFrom: 53,
    heroUrl: `${TACDN}/09/93/c5/b9.jpg`,
    rating: 4.6,
    reviewCount: 3748,
    highlights: [
      "Open-air trolley moonlight monuments tour",
      "Lincoln Memorial and Reflecting Pool stop",
      "Vietnam Veterans Memorial visit",
      "Iwo Jima Memorial photo stop",
      "Evening departure from downtown Washington, D.C.",
    ],
    startDescription:
      "Board the trolley at the confirmed downtown Washington, D.C. departure point in the evening.",
    endDescription:
      "Return to the downtown departure point after the final memorial stop.",
    itineraryItems: [
      {
        title: "Lincoln Memorial",
        description:
          "Evening trolley stop at the Lincoln Memorial with photo time.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Vietnam Veterans Memorial",
        description:
          "Walk the memorial wall during the trolley stop.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Korean War Veterans Memorial",
        description:
          "Brief stop at the Korean War Memorial statues.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "US Marine Corps War Memorial",
        description:
          "Photo stop at the Iwo Jima Memorial across the Potomac.",
        duration: "15 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Professional guide", "Trolley transport"],
    categories: ["Trolley Tours", "Night Tours", "Sightseeing Tours"],
  },
  {
    productCode: "6349VIPDC",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Viator-VIP-Best-of-DC-Including-US-Capitol-and-National-Archives-Reserved-Access-the-White-House-and-Lincoln-Memorial/d657-6349VIPDC",
    title: "Best of DC VIP Capitol and Archives Tour",
    description:
      "Experience Washington's top landmarks on an eight-hour VIP tour with reserved access to the US Capitol and National Archives alongside exterior stops at the White House and Lincoln Memorial. Skip-the-line entry at key federal sites saves hours compared to independent visits while your guide provides Capitol and founding-documents context. Motorcoach transport links the National Mall with Capitol Hill and Archives appointments. This comprehensive VIP day suits travelers who want interior access plus monuments in one guided outing.",
    duration: "8 hours (approx.)",
    priceFrom: 117,
    heroUrl: `${TACDN}/07/72/0b/bc.jpg`,
    rating: 4.5,
    reviewCount: 2349,
    highlights: [
      "VIP tour with reserved Capitol and Archives access",
      "US Capitol interior visit with guide",
      "National Archives viewing of founding documents",
      "White House and Lincoln Memorial exterior stops",
      "Full-day motorcoach transport from Washington, D.C.",
    ],
    startDescription:
      "Morning pickup from select Washington, D.C. hotels or the confirmed VIP departure point.",
    endDescription:
      "Return to downtown Washington, D.C. after the Lincoln Memorial stop.",
    itineraryItems: [
      {
        title: "US Capitol",
        description:
          "Reserved-access interior tour of the Capitol with guide commentary.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "National Archives",
        description:
          "View the Declaration of Independence, Constitution, and Bill of Rights.",
        duration: "1 hour",
        stopType: "stop",
      },
      {
        title: "White House",
        description:
          "Exterior photo stop at the White House North Lawn viewpoint.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Lincoln Memorial",
        description:
          "Visit the Lincoln Memorial with Reflecting Pool panoramas.",
        duration: "25 minutes",
        stopType: "stop",
      },
      {
        title: "National Mall",
        description:
          "Drive the Mall corridor with Smithsonian and monument pass-by views.",
        stopType: "pass-by",
      },
    ],
    inclusions: [
      "Professional guide",
      "Reserved Capitol and Archives entry",
      "Motorcoach transport",
      "Hotel pickup",
    ],
    categories: ["VIP Tours", "Full-day Tours", "Historical Tours"],
  },
  {
    productCode: "2384P1",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Monuments-and-Memorials-Bike-Tour/d657-2384P1",
    title: "Monuments and Memorials Bike Tour",
    description:
      "Cycle the National Mall on a three-hour guided bike tour connecting the Lincoln Memorial, Jefferson Memorial, and Capitol Hill approaches. Your guide leads a paced route along Mall paths with stops for photos and history at major memorials. Bikes and helmets are included with a brief safety orientation before departure. This active group tour covers more monuments than a walking tour while keeping a social, guided format.",
    duration: "3 hours (approx.)",
    priceFrom: 65,
    heroUrl: `${TACDN}/12/e8/2e/02.jpg`,
    rating: 4.8,
    reviewCount: 890,
    highlights: [
      "Guided bike tour of DC monuments and memorials",
      "Lincoln and Jefferson Memorial stops",
      "Capitol Hill and National Mall riding route",
      "Bikes, helmets, and safety briefing included",
      "Three-hour active sightseeing format",
    ],
    startDescription:
      "Meet at the National Mall bike rental location confirmed when booking. Arrive early for helmet fitting.",
    endDescription:
      "Return bikes to the rental staging area after the final memorial stop.",
    itineraryItems: [
      {
        title: "Bike Orientation",
        description:
          "Safety briefing and bike fitting before entering the Mall route.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Lincoln Memorial",
        description:
          "Stop at the Lincoln Memorial with Reflecting Pool views.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Jefferson Memorial",
        description:
          "Ride along the Tidal Basin to the Jefferson Memorial.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "US Capitol",
        description:
          "Capitol Hill exterior stop at the east end of the National Mall.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Vietnam Veterans Memorial",
        description:
          "Brief stop at the Vietnam Memorial wall during the Mall loop.",
        duration: "15 minutes",
        stopType: "stop",
      },
    ],
    inclusions: ["Professional guide", "Bike and helmet rental", "Safety briefing"],
    categories: ["Bike Tours", "Sightseeing Tours", "Active Tours"],
  },
  {
    productCode: "2890P2",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Mount-Vernon-Day-Trip-from-Washington-DC/d657-2890P2",
    title: "Mount Vernon Day Trip",
    description:
      "Day-trip to George Washington's Mount Vernon estate on a five-hour tour from Washington, D.C. with guided visits to the mansion, museum, and Potomac River grounds. Your guide covers Washington's life at the estate before allowing free time in the gardens and farm areas. Motorcoach transport handles the Virginia drive while admission is included. This half-day outing suits travelers who want founding-era history without a full-day Arlington combination.",
    duration: "5 hours (approx.)",
    priceFrom: 85,
    heroUrl: `${TACDN}/06/70/75/5d.jpg`,
    rating: 4.7,
    reviewCount: 650,
    highlights: [
      "Half-day Mount Vernon trip from Washington, D.C.",
      "Guided tour of George Washington's mansion",
      "Estate gardens and Potomac River grounds",
      "Museum and education center visit time",
      "Round-trip motorcoach transport included",
    ],
    startDescription:
      "Morning departure from select Washington, D.C. hotels or the confirmed downtown meeting point.",
    endDescription:
      "Return to Washington, D.C. after free time on the Mount Vernon grounds.",
    itineraryItems: [
      {
        title: "Mount Vernon Estate",
        description:
          "Arrive at Mount Vernon and begin the guided mansion tour.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "George Washington's Mansion",
        description:
          "Interior guided tour of the Washington family home.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "George Washington's Tomb",
        description:
          "Visit the Washington family tomb on the estate.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Mount Vernon Gardens",
        description:
          "Free time in the formal gardens and riverside walking paths.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "Motorcoach transport",
      "Mount Vernon admission",
      "Hotel pickup",
    ],
    categories: ["Day Trips", "Historical Tours", "Bus Tours"],
  },
];

const buildFixture = (tour: WashingtonDcTourFixture) => {
  const viatorRatings = WASHINGTON_DC_VIATOR_PUBLIC_RATINGS[tour.productCode];
  const rating = viatorRatings?.rating ?? tour.rating;
  const reviewCount = viatorRatings?.reviewCount ?? tour.reviewCount;

  return {
    product: {
      productCode: tour.productCode,
      productUrl: tour.productUrl,
      title: tour.title,
      description: { text: tour.description },
      location: { city: "Washington", state: "District of Columbia" },
      duration: tour.duration,
      priceFrom: `From $${tour.priceFrom.toFixed(2)}`,
      reviews: {
        combinedAverageRating: rating,
        totalReviews: reviewCount,
      },
      media: {
        images: [
          {
            isCover: true,
            variants: {
              FULL: {
                url: tour.heroUrl,
                width: 674,
                height: 446,
              },
            },
          },
        ],
      },
      highlights: tour.highlights,
      logistics: {
        start: { description: tour.startDescription },
        end: { description: tour.endDescription },
      },
      itinerarySummary: `${tour.description.split(".").slice(0, 1).join(".")}.`,
      itineraryItems: tour.itineraryItems.map(item => ({
        ...item,
        description: "",
      })),
      inclusions: tour.inclusions,
      additionalInfo: [
        "Confirmation will be received at time of booking",
        "Not wheelchair accessible",
        "Near public transportation",
        "Most travelers can participate",
      ],
      faqs: [
        {
          question: `How long is the ${tour.title}?`,
          answer: `The planned duration is ${tour.duration.replace(" (approx.)", "")}.`,
        },
        {
          question: "Where does the tour depart from in Washington, D.C.?",
          answer: tour.startDescription,
        },
      ],
      categories: tour.categories.map(label => ({ label })),
      pricing: {
        summary: { fromPrice: tour.priceFrom },
        currency: "USD",
      },
    },
  };
};

const main = async () => {
  if (process.argv.includes("--bootstrap")) {
    const outputDir = path.join(process.cwd(), "data", "engine6", "viator");
    mkdirSync(outputDir, { recursive: true });

    for (const tour of WASHINGTON_DC_TOURS) {
      const filePath = path.join(
        outputDir,
        `${tour.productCode}.exact-product.json`
      );
      writeFileSync(
        filePath,
        `${JSON.stringify(buildFixture(tour), null, 2)}\n`,
        "utf8"
      );
      console.log(`Wrote ${filePath}`);
    }

    console.log(
      `Bootstrapped ${WASHINGTON_DC_TOURS.length} Washington D.C. Engine6 fixtures.`
    );
    return;
  }

  const { runEngine6ParagonFixtureGeneration } = await import(
    "./lib/runEngine6ParagonFixtureGeneration"
  );

  await runEngine6ParagonFixtureGeneration({
    destinationLabel: "Washington, D.C.",
    destinationCitySlug: "washington",
    viatorDestinationSlug: "Washington-DC",
    targetPremiumShare: 0.5,
    tours: WASHINGTON_DC_TOURS,
    buildFixture,
    destinationLogLabel: "Washington D.C.",
  });
};

await main();
