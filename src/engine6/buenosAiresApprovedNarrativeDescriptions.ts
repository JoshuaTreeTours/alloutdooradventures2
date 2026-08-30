export const BUENOS_AIRES_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
  "50158P1",
  "5030REC",
  "26466P5",
  "14659P1",
  "52462P4",
] as const;

export type BuenosAiresTargetedNarrativeDescriptionProductCode =
  (typeof BUENOS_AIRES_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const BUENOS_AIRES_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  BuenosAiresTargetedNarrativeDescriptionProductCode,
  string
> = {
  "50158P1": "In Buenos Aires, this private day leaves the city for San Antonio de Areco, a gaucho town on the Pampas, then continues to a working estancia. A local guide covers the town streets and ranch activities, with horseback riding or a carriage ride, an asado lunch, folkloric dance, and an equestrian demonstration listed on the published itinerary. Hotel pickup from any Buenos Aires hotel or address is included, with an 8:30am start and a published duration of about 10 hours. Empanadas and drinks appear at the ranch reception. The format suits visitors who want a private gaucho cultural day without coordinating rural driving or ranch reservations independently. Meeting points are confirmed at booking in Buenos Aires, and the itinerary stays on San Antonio de Areco and the working estancia that define this outing rather than a city-neighborhood loop or a Tigre delta cruise.",
  "5030REC": "In Buenos Aires, this private afternoon walk covers Recoleta on a two-mile circuit from La Biela cafe to Floralis Generica. The published route includes Gomero de la Recoleta, La Recoleta Cemetery, Eva Peron's Tomb, Basilica de Nuestra Senora Del Pilar, Palais de Glace, Museo Nacional de Bellas Artes, and Floralis Generica, with a pass-by at MALBA. Cemetery admission is included; hotel pickup is not listed. The published duration is about three hours. A local guide covers Spanish, British, Italian, and French influences in the neighborhood. The format suits visitors who want a private Recoleta walk without assembling cemetery tickets independently. Meeting points are confirmed at booking in Buenos Aires, and the itinerary stays on Recoleta landmarks that shape this outing rather than a full-city coach circuit or a La Boca stop.",
  "26466P5": "In Buenos Aires, this guided urban-art bike outing covers street murals and graffiti walls in San Telmo, La Boca, Barracas, and Pasaje Lanin. A cycling guide handles bikes and neighborhood routing so the published four-hour window stays on mural streets rather than a generic plaza hop. The format suits visitors who want a guided look at southern-neighborhood street art without renting independently. Meeting points are confirmed at booking in Buenos Aires, and the itinerary stays on San Telmo, La Boca, Barracas, and Pasaje Lanin that define this outing rather than a Palermo park loop or a Recoleta cemetery walk. Routes stay oriented to those four stops, with a guide handling bike fit and street pacing so the day stays focused on the mural circuit rather than navigation.",
  "14659P1": "In Buenos Aires, this five-hour small-group city outing covers Plaza de Mayo, Puerto Madero, San Telmo, La Boca, Recoleta, and Palermo, with hotel pickup and drop-off listed. A local guide handles neighborhood pacing and live commentary; an optional street-food snack upgrade appears separately from the From price. The published cap is about 16. The format suits visitors who want a longer guided sightseeing introduction without coordinating each district independently. Meeting points are confirmed at booking in Buenos Aires, and the itinerary stays on those six districts that shape this city day rather than a private Recoleta walk or a gaucho ranch outing.",
  "52462P4": "In Buenos Aires, this small-group bike outing covers Plaza de Mayo, La Boca, Puerto Madero, and San Telmo, with mate, alfajores, and a local sandwich listed. Bikes, helmets, and water are included; the meeting point is a parking garage on Avenida Hipolito Yrigoyen near Plaza de Mayo. The published duration is about five hours, and the group is capped. The format suits visitors who want a guided cultural bike day without renting independently. Meeting points are confirmed at booking in Buenos Aires, and the itinerary stays on those four historic-south stops that define this outing rather than a Tigre kayak add-on or a Recoleta cemetery walk.",
};

export const getBuenosAiresTargetedNarrativeDescription = (
  productCode: string
) =>
  BUENOS_AIRES_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as BuenosAiresTargetedNarrativeDescriptionProductCode
  ];
