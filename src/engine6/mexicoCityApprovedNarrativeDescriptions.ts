export const MEXICO_CITY_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
  "333644P5",
  "247495P2",
  "33804P2",
  "161745P6",
  "325968P1",
  "33804P1",
  "88859P7",
  "325968P5",
  "466992P2",
  "382677P1",
  "38551P1",
] as const;

export type MexicoCityTargetedNarrativeDescriptionProductCode =
  (typeof MEXICO_CITY_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const MEXICO_CITY_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  MexicoCityTargetedNarrativeDescriptionProductCode,
  string
> = {
  "333644P5": "Leave Mexico City by private vehicle for a sunrise hot-air balloon over Teotihuacan, then walk the archaeological zone with a SECTUR-certified guide. The eight-hour day includes hotel pickup from Reforma, Roma, Condesa, Polanco, or Centro, a 40-to-50-minute shared flight, breakfast, and a flight certificate. Stops include Teotihuacan, Pyramid of the Sun, Pyramid of the Moon. Private ground transport keeps the early departure coordinated so the group reaches the launch field without arranging a separate transfer. Ideal for visitors basing in Mexico City who want a balloon and pyramid day without self-driving the highland highway.",
  "247495P2": "A Mexico City departure option pairs a shared hot-air balloon flight over Teotihuacan with breakfast at La Cueva Teotihuacán. The three-to-nine-hour format includes a 30-to-60-minute flight and, on all-inclusive bookings, certified guiding in the archaeological zone. Stops include the Teotihuacan launch field, La Cueva Teotihuacán, and the Teotihuacan Pyramids. Guests who skip hotel pickup meet at the launch field rather than navigating the pyramids independently. The flight window stays over the highland basin around the Avenue of the Dead, then breakfast moves into the cave restaurant beside the ancient city. Ideal for visitors basing in Mexico City who want a balloon-and-cave-breakfast morning without coordinating a separate launch-field transfer.",
  "33804P2": "Ride a traditional trajinera through Xochimilco canals, then visit Frida Kahlo and Diego Rivera landmarks on this private Mexico City art day. Round-trip hotel transfers, a one-hour canal ride, and admission to the Frida Kahlo Museum and Museo Diego Rivera Anahuacalli are included, with mosaic murals at UNAM on the same circuit. Stops include Parque Ecologico Xochimilco, Museo Frida Kahlo, Coyoacán, Museo Diego Rivera Anahuacalli, UNAM Biblioteca Central. Private pacing keeps canal time and museum windows together instead of separate taxi hops across the south of the city. Ideal for visitors basing in Mexico City who want a guided Xochimilco and Coyoacán day without coordinating tickets alone.",
  "161745P6": "A private vehicle leaves Mexico City for Teotihuacan on a five-to-seven-hour outing reserved for one party. The guide covers the Pyramid of the Sun, Pyramid of the Moon, and the Avenue of the Dead, with snacks, bottled water, and site fees included. Stops include Teotihuacan, Pyramid of the Sun, Pyramid of the Moon. Hotel or vacation-rental pickup is arranged so the group avoids the public-bus transfer to the pyramids. Ideal for visitors basing in Mexico City who want a private Teotihuacan morning without joining a mixed coach.",
  "325968P1": "A 14-to-16-hour guided day from Mexico City reaches the thermal pools, river, and caves at Tolantongo. Breakfast, snacks, private transportation, and a sport-towel kit are included, with an English-speaking guide on the highland drive. Stops include Angel of Independence, Actopan, Tolantongo, Grutas Tolantongo. The meeting point sits on the Reforma rotunda facing the Angel of Independence, nearest the Sheraton Maria Isabel. Ideal for visitors basing in Mexico City who want a long thermal-canyon day without self-driving the Hidalgo route.",
  "33804P1": "A private Mexico City guide leads one party to Tlatelolco, the Basilica of Guadalupe, and Teotihuacan on a six-hour door-to-door outing. Hotel pickup from Polanco, Condesa, Roma, Centro, Reforma, or Santa Fe, site tickets, and bottled water are included. Stops include Zona Arqueologica Tlatelolco, the Basilica of Guadalupe, and the Teotihuacan Pyramids. The private format keeps Aztec ruins, the pilgrimage shrine, and the pyramid avenue on one circuit instead of three separate transfers. Commentary stays with Tlatelolco plaza layers, the Guadalupe shrine complex, and the Avenue of the Dead rather than a rushed photo loop. Ideal for visitors basing in Mexico City who want a guided Teotihuacan and Guadalupe day without a large coach.",
  "88859P7": "This seven-hour Mexico City day links a Xochimilco trajinera ride with Casa Azul and Coyoacán streets. Hotel pickup, a bilingual driver-guide, the canal boat, and Frida Kahlo Museum admission are included so the south-city sights sit on one booking. Stops include Xochimilco, Casa Azul, Coyoacán. The guided format covers far-flung meeting points that are awkward to sequence by metro and taxi in a single afternoon. Ideal for visitors basing in Mexico City who want a full-day canal and Casa Azul outing without arranging each ticket separately.",
  "325968P5": "A small-group day from central Mexico City covers Teotihuacan in seven to eight hours, with time at the Temple of Quetzalcóatl and the Pyramid of the Sun plus a descent into caves below the ancient city. Round-trip transfer and a five-course local lunch are included; optional mezcal and tequila tastings can follow. Stops include Temple of Quetzalcóatl, Pyramid of the Sun, Teotihuacan Caves. Guide commentary stays with pyramid plazas and underground chambers rather than a rushed photo loop. Ideal for visitors basing in Mexico City who want a guided Teotihuacan day with lunch handled on site.",
  "466992P2": "A six-hour guided hike from Mexico City reaches the Puerta del Cielo viewpoint, with a ladder section, canyon overlooks, and a river-corridor return. Helmet, safety harness, bottled water, and park access fees are included. Stops include Fuente de Cibeles, Puerta del Cielo. The group meets at Fuente de Cibeles in Roma Norte beside the CDMX sign, then rides about 45 minutes to the trailhead. Ideal for visitors basing in Mexico City who want an intermediate highland hike without arranging trail transport or safety gear independently.",
  "382677P1": "A private three-hour walk through Mexico City's Centro Histórico starts at the Monument to the Revolution and ends at the Mexico City Metropolitan Cathedral on the Zócalo. A local guide reserved for one party covers historic-center streets, plazas, and landmark façades. Stops include Monument to the Revolution, Mexico City Metropolitan Cathedral, Zócalo. The compact format orients first-time visitors without a full-day coach loop. Ideal for visitors basing in Mexico City who want a private historic-center walk without joining a mixed group.",
  "38551P1": "A four-hour small-group bike ride follows Paseo de la Reforma into Chapultepec Park, using one of Mexico City's longest dedicated bike lanes. A local guide supplies the bicycle, helmet, water, and a street-food snack. Stops include Paseo de la Reforma, Chapultepec Park. Morning or afternoon departures keep the Emperor Route monuments and park paths on a paced ride rather than an independent rental. Ideal for visitors basing in Mexico City who want a guided bike outing covering Reforma and Chapultepec without navigating traffic alone.",
};

export const getMexicoCityTargetedNarrativeDescription = (
  productCode: string
) =>
  MEXICO_CITY_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as MexicoCityTargetedNarrativeDescriptionProductCode
  ];
