export const BANGKOK_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
  "24380P161",
  "18897P6",
  "36435P43",
  "30727P34",
  "90546P140",
  "5086TUD",
  "198444P1",
  "112650P5",
  "6924BKKGHTB07",
  "8374P24",
] as const;

export type BangkokTargetedNarrativeDescriptionProductCode =
  (typeof BANGKOK_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const BANGKOK_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  BangkokTargetedNarrativeDescriptionProductCode,
  string
> = {
  "24380P161":
    "In Bangkok, this private eight-hour day leaves a central hotel for Ayutthaya, the former Siamese capital and a UNESCO World Heritage Site about an hour north of the city. A private guide and air-conditioned car cover Bang Pa-In Summer Palace, Wat Phra Sri Sanphet, and Wat Mahathat, including the stone Buddha head held in a bodhi tree. A boat circuit around Ayutthaya island and a quieter stop at Wat Worachettharam are listed after lunch, which stays own expense on the public page. Ayutthaya admission tickets and hotel pickup and drop-off in Bangkok are included. The format suits visitors who want a guided former-capital day without assembling train and temple tickets independently. Meeting points are confirmed at booking in Bangkok, and the itinerary stays on Bang Pa-In, Wat Phra Sri Sanphet, Wat Mahathat, and Wat Worachettharam that define this outing rather than a Grand Palace city loop.",
  "18897P6":
    "In Bangkok, this private eight-hour circuit pairs a licensed local guide with an air-conditioned vehicle and hotel pickup in the city center. The published day covers the Grand Palace, Wat Pho, Wat Arun, Chinatown, and Pak Khlong Talat, with lunch and bottled water listed. Cruise-port pickup is a surcharge, not a standard inclusion. Dress rules for the Grand Palace and Temple of the Emerald Buddha are published on the product page. The format suits first-time visitors who want a single guided sweep of the river temples and markets without assembling separate tickets and transfers. Meeting points are confirmed at booking in Bangkok, and the itinerary stays on the Grand Palace, Wat Pho, Wat Arun, and Chinatown that define this full-day window rather than an Ayutthaya transfer.",
  "36435P43":
    "In Bangkok, this private four-hour city outing pairs a driver and guide with hotel pickup so the group can reach the Grand Palace, Wat Pho, and Wat Arun without navigating Rattanakosin traffic independently. The published window is a half-day rather than an eight-hour city cram, which keeps the pace on the three river temples. Entrance fees and meals follow the published inclusions list on the booking page. The format suits visitors with a short stay who want a compact temple circuit instead of a full-day market add-on. Meeting points are confirmed at booking in Bangkok, and the itinerary stays on the Grand Palace, Wat Pho, and Wat Arun that shape this half-day rather than a Damnoen Saduak transfer.",
  "30727P34":
    "In Bangkok, this private five-to-six-hour outing leaves a city hotel for Damnoen Saduak Floating Market and Maeklong Railway Market instead of a temple circuit. A local guide and private vehicle handle the transfer so the group can paddle through canal stalls, then watch vendors pack goods off an active railway line. Fruit, snacks, bottled water, and a pad boat are listed. The format suits visitors who want a guided market morning without assembling taxis to Samut Songkhram independently. Meeting points are confirmed at booking in Bangkok, and the itinerary stays on Damnoen Saduak and Maeklong Railway Market that define this outing rather than a Grand Palace walk.",
  "90546P140":
    "In Bangkok, this three-hour class at Silom Thai Cooking School covers five classic dishes such as pad thai and tom yum, then sits the group down to eat what they cooked. Morning bookings add a short walk to a nearby market for fresh ingredients; afternoon and evening sessions stay at the school on Soi Decho near Chong Nonsi BTS. A recipe book is listed. Hotel pickup is not listed. The format suits visitors who want a guided cooking window in Silom without booking a full-day countryside market transfer. Meeting points are confirmed at booking in Bangkok, and the itinerary stays on Silom Market and Silom Thai Cooking School that define this class rather than a Chinatown food walk.",
  "5086TUD":
    "In Bangkok, this two-and-a-half-hour small-group walk leaves Si Phraya pier for Talad Noi lanes, Holy Rosary Church, Chow Sue Kong Shrine, Chinatown, and Wat Mangkon Kamalawat. A local guide keeps the route on street-food stalls and neighborhood shrines rather than a Grand Palace ticket window. Vegetarian notes can be sent at least a day ahead; other diets are not listed. The walk covers about two kilometers. The format suits visitors who want a guided evening food circuit without assembling a self-directed Yaowarat route. Meeting points are confirmed at booking in Bangkok, and the itinerary stays on Talad Noi, Holy Rosary Church, and Chinatown that define this outing rather than a Damnoen Saduak boat.",
  "198444P1":
    "In Bangkok, this three-and-a-half-hour class pairs a morning market walk with a hands-on kitchen session at Tingly Thai Cooking School. The chef covers common ingredients at the market, then the group prepares listed recipes such as tom yum, pad thai, green curry, and mango sticky rice before eating the meal. All ingredients are listed for the morning class. Hotel pickup is not listed. The format suits visitors who want a guided cooking morning without booking a Silom evening session or a countryside market transfer. Meeting points are confirmed at booking in Bangkok, and the itinerary stays on the morning market and Tingly Thai Cooking School that define this class rather than a Grand Palace circuit.",
  "112650P5":
    "In Bangkok, this two-hour longtail outing meets a licensed English-speaking guide near Wat Pho, then boards a traditional boat for the Thonburi canals off the Chao Phraya River. The published stop is Baan Silapin, the restored Artist House on Khlong Bang Luang, with a photo pause at Wat Paknam Phasi Charoen from the water. The group does not disembark at Wat Paknam. Several departure times are listed. The format suits visitors who want a guided canal window without chartering a private longtail independently. Meeting points are confirmed at booking in Bangkok, and the itinerary stays on the Thonburi canals, Baan Silapin, and Wat Paknam Phasi Charoen that define this ride rather than a Damnoen Saduak market boat.",
  "6924BKKGHTB07":
    "In Bangkok, this four-hour small-group bike ride leaves Discova Day Tour Shop on Maha Chai Road in Phra Nakhon for backstreets, local neighborhoods, and the Rama 8 Bridge, with a Chao Phraya River ferry segment on the return. A cycling guide, bike, safety gear, ferry fare, snacks, and drinks are listed for a group of up to ten. The pace is published as relaxed, with clothing that covers shoulders and knees for temple stops. Hotel pickup is not listed. The format suits visitors who want a guided historic-city ride without renting independently. Meeting points are confirmed at booking in Bangkok, and the itinerary stays on Phra Nakhon, Rama 8 Bridge, and the Chao Phraya River that define this outing rather than a Grand Palace coach loop.",
  "8374P24":
    "In Bangkok, this six-hour small-group outing starts with hotel pickup, then rides the train to Mae Klong Railway Market before a boat circuit at Damnoen Saduak Floating Market. A guide handles the transfer so the group can watch vendors clear the tracks and then move through canal stalls without assembling the train and boat tickets independently. The tour ends at MBK Center rather than returning to every hotel. The group is capped at fifteen. The format suits visitors who want a coordinated market morning from Bangkok without a private-vehicle surcharge. Meeting points are confirmed at booking in Bangkok, and the itinerary stays on Mae Klong Railway Market and Damnoen Saduak Floating Market that define this outing rather than a Grand Palace temple day.",
};

export const getBangkokTargetedNarrativeDescription = (productCode: string) =>
  BANGKOK_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as BangkokTargetedNarrativeDescriptionProductCode
  ];
