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
    productCode: "67327P13",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Black-History-Tour-Washington-DC/d657-67327P13",
    title: "Private Black History Tour DC",
    description:
      "Explore Washington, D.C. through a private Black History tour with a dedicated guide and luxury vehicle for your party. The route connects the Martin Luther King Jr. Memorial, Lincoln Memorial, and U.S. Capitol with stops at Howard University, Ben's Chili Bowl, and the National Museum of African American History and Culture with admission included. Your guide shares context on civil rights landmarks, neighborhood stories, and museum highlights at a pace suited to your group. This premium private format suits travelers who want an immersive cultural history day without joining a large motorcoach group.",
    duration: "3 hours (approx.)",
    priceFrom: 475,
    heroUrl: `${TACDN}/0a/26/be/ce.jpg`,
    rating: 5,
    reviewCount: 13,
    highlights: [
      "Private Black History tour for your party only",
      "NMAAHC admission tickets included",
      "MLK Memorial and Lincoln Memorial photo stops",
      "Howard University and Ben's Chili Bowl landmarks",
      "Luxury private vehicle with hotel pickup",
    ],
    startDescription:
      "Morning pickup from your Washington, D.C. hotel, vacation rental, or confirmed meeting point.",
    endDescription:
      "Return to your pickup location after the National Museum of African American History and Culture visit.",
    itineraryItems: [
      {
        title: "MLK Memorial",
        description:
          "Guided stop at the MLK Memorial with Tidal Basin and memorial design commentary.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Lincoln Memorial",
        description:
          "Photo stop at the Lincoln Memorial steps with Reflecting Pool views.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "African American Civil War Memorial",
        description:
          "Visit the African American Civil War Memorial and museum plaza.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Howard University",
        description:
          "Drive-by and photo stop at historic Howard University campus viewpoints.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Ben's Chili Bowl",
        description:
          "Photo stop at the Ben's Chili Bowl mural on U Street.",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "National Museum of African American History and Culture",
        description:
          "Guided visit with included admission to the Smithsonian NMAAHC.",
        duration: "1 hour",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Private professional guide",
      "NMAAHC admission tickets",
      "Private luxury vehicle transport",
      "Hotel pickup",
    ],
    categories: ["Private Tours", "Historical Tours", "Cultural Tours"],
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
    productCode: "6349P59",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Old-Town-Alexandria-and-Mount-Vernon-Tour/d657-6349P59",
    title: "Mount Vernon Estate and Old Town Alexandria",
    description:
      "Visit George Washington's Mount Vernon estate and explore Old Town Alexandria on a guided day trip from Washington, D.C. with comfortable transport and a professional guide. Tour the mansion, museum, and Potomac River grounds at Mount Vernon before continuing to Alexandria's cobblestone streets, waterfront, and historic King Street corridor. Group size stays manageable for a social but uncrowded Virginia outing. Mount Vernon admission and guided commentary are included with hotel pickup options downtown.",
    duration: "6 hours (approx.)",
    priceFrom: 119,
    heroUrl: `${TACDN}/09/1f/52/93.jpg`,
    rating: 4.8,
    reviewCount: 288,
    highlights: [
      "Guided Mount Vernon estate tour from Washington, D.C.",
      "Old Town Alexandria waterfront and King Street walk",
      "George Washington mansion and museum visit",
      "Air-conditioned transport with limited group size",
      "Professional guide with founding-era commentary",
    ],
    startDescription:
      "Morning departure from select downtown Washington, D.C. hotels or a central meeting point.",
    endDescription:
      "Return to downtown Washington, D.C. after the Old Town Alexandria visit.",
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
        title: "Old Town Alexandria",
        description:
          "Walk King Street and the waterfront with guide commentary on colonial history.",
        duration: "1 hour 30 minutes",
        stopType: "stop",
      },
      {
        title: "Alexandria Waterfront",
        description:
          "Photo stop along the Potomac waterfront promenade.",
        duration: "20 minutes",
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
    productCode: "6766SIGTOUR",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Guided-Tour-of-Washington-DC/d657-6766SIGTOUR",
    title: "DC in a Day Monuments Sightseeing Tour",
    description:
      "See the capital's essential landmarks on a full-day guided sightseeing tour covering ten or more monuments, seasonal cherry blossom viewpoints, and a Potomac River boat cruise. A professional guide narrates the route with stops at the Lincoln Memorial, White House exterior, and Smithsonian area viewpoints before boarding the cruise for river-level city perspectives. Motorcoach transport links the east and west ends of the Mall efficiently for first-time visitors with a full day available. This comprehensive outing delivers a solid D.C. overview with a memorable water segment.",
    duration: "8 hours (approx.)",
    priceFrom: 99,
    heroUrl: `${TACDN}/07/36/99/d5.jpg`,
    rating: 4.7,
    reviewCount: 1215,
    highlights: [
      "Full-day DC highlights with ten or more monument stops",
      "Seasonal cherry blossom viewpoints when in bloom",
      "Potomac River boat cruise included",
      "Lincoln Memorial and National Mall photo stops",
      "Motorcoach transport with hotel pickup options",
    ],
    startDescription:
      "Pickup from select downtown Washington, D.C. hotels or a central departure point in the morning.",
    endDescription:
      "Return to downtown Washington, D.C. after the Potomac River cruise.",
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
        title: "Tidal Basin",
        description:
          "Cherry blossom and Jefferson Memorial viewpoints when in season.",
        duration: "20 minutes",
        stopType: "stop",
      },
      {
        title: "Potomac River Cruise",
        description:
          "Board a sightseeing cruise for river-level views of the monuments.",
        duration: "45 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Professional guide",
      "Air-conditioned motorcoach",
      "Potomac River cruise ticket",
      "Hotel pickup",
    ],
    categories: ["Bus Tours", "Full-day Tours", "Sightseeing Tours"],
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
    productCode: "7812P219",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-walking-tasting-tour-with-Secret-Food-Tours/d657-7812P219",
    title: "Georgetown Walking Food Tour",
    description:
      "Explore Georgetown in Washington, D.C. on a Secret Food Tours walking route with curated dishes at local eateries and guide commentary on the capital's culinary history. The three-hour format covers historic blocks with stops for regional specialties, artisan bites, and neighborhood stories beyond the National Mall. Your licensed guide connects each course to the city's immigrant communities and evolving food scene. This small-group outing suits travelers who want an authentic taste of D.C. on foot.",
    duration: "3 hours (approx.)",
    priceFrom: 89,
    heroUrl: `${TACDN}/12/72/ff/7c.jpg`,
    rating: 4.9,
    reviewCount: 210,
    highlights: [
      "Secret Food Tours walking route with multiple food stops",
      "Curated stops at local Washington, D.C. eateries",
      "Guide commentary on neighborhood culinary history",
      "Small-group format near downtown meeting points",
      "Three-hour guided food experience on foot",
    ],
    startDescription:
      "Meet your guide at the confirmed downtown Washington, D.C. meeting point at your scheduled time.",
    endDescription:
      "Tour ends near the final tasting stop in the neighborhood covered on your route.",
    itineraryItems: [
      {
        title: "Georgetown Meeting Point",
        description:
          "Meet your guide and receive an overview of the Georgetown tasting route.",
        duration: "10 minutes",
        stopType: "stop",
      },
      {
        title: "Georgetown Historic Neighborhood Walk",
        description:
          "Walk Georgetown blocks with guide commentary on local history.",
        duration: "45 minutes",
        stopType: "stop",
      },
      {
        title: "Georgetown First Food Stop",
        description:
          "Sample a signature regional dish at a curated Georgetown restaurant.",
        duration: "30 minutes",
        stopType: "stop",
      },
      {
        title: "Georgetown Second Food Stop",
        description:
          "Continue with additional tastings at Georgetown establishments.",
        duration: "30 minutes",
        stopType: "stop",
      },
    ],
    inclusions: [
      "Licensed food guide",
      "Food samples",
      "Walking tour",
    ],
    categories: ["Food Tours", "Walking Tours", "Small Group Tours"],
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
    productCode: "2384P20",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Bike-Tour-of-the-National-Mall/d657-2384P20",
    title: "Washington DC Bike Tour of the National Mall",
    description:
      "Cycle the National Mall on a three-hour guided bike tour connecting the Lincoln Memorial, Jefferson Memorial, and Capitol Hill approaches. Your guide leads a paced route along Mall paths with stops for photos and history at major memorials. Bikes and helmets are included with a brief safety orientation before departure. This active group tour covers more monuments than a walking tour while keeping a social, guided format ideal for first-time visitors.",
    duration: "3 hours (approx.)",
    priceFrom: 59,
    heroUrl: `${TACDN}/12/e8/2e/02.jpg`,
    rating: 4.8,
    reviewCount: 1245,
    highlights: [
      "Guided bike tour of the National Mall monuments",
      "Lincoln and Jefferson Memorial stops",
      "Capitol Hill and Mall riding route",
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
    productCode: "5769MTVN",
    productUrl:
      "https://www.viator.com/tours/Washington-DC/Mt-Vernon-and-Old-Town-Alexandria-Day-Trip-from-Washington-DC/d657-5769MTVN",
    title: "Mount Vernon and Old Town Alexandria Day Trip",
    description:
      "Day-trip to George Washington's Mount Vernon estate and Old Town Alexandria on a six-hour tour from Washington, D.C. with guided visits to the mansion, museum, and Potomac River grounds followed by time in Alexandria's historic waterfront district. Your guide covers Washington's life at the estate before allowing exploration of King Street shops and cobblestone lanes. Motorcoach transport handles the Virginia drive while Mount Vernon admission is included. This outing suits travelers who want founding-era history paired with a charming colonial town visit.",
    duration: "6 hours (approx.)",
    priceFrom: 95,
    heroUrl: `${TACDN}/06/70/75/5d.jpg`,
    rating: 4.7,
    reviewCount: 806,
    highlights: [
      "Mount Vernon and Old Town Alexandria day trip",
      "Guided tour of George Washington's mansion",
      "Estate gardens and Potomac River grounds",
      "Old Town Alexandria waterfront and King Street",
      "Round-trip motorcoach transport included",
    ],
    startDescription:
      "Morning departure from select Washington, D.C. hotels or the confirmed downtown meeting point.",
    endDescription:
      "Return to Washington, D.C. after free time in Old Town Alexandria.",
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
        title: "Old Town Alexandria",
        description:
          "Explore King Street and the waterfront with guide orientation.",
        duration: "1 hour",
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
