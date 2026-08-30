export const SEOUL_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
  "42053P19",
  "6780P36",
  "470724P1",
  "11214P21",
  "6780CITY_FULLDAY",
  "6780P26",
  "30023P9",
  "42053P14",
  "48881P11",
  "55262P2",
  "48881P82",
  "33054P5",
  "121170P1",
  "359901P1",
  "255235P5",
  "47013P23",
] as const;

export type SeoulTargetedNarrativeDescriptionProductCode =
  (typeof SEOUL_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const SEOUL_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  SeoulTargetedNarrativeDescriptionProductCode,
  string
> = {
  "42053P19":
    "In Seoul, this private eight-to-nine-hour circuit pairs an English-speaking driver-guide with an air-conditioned vehicle and hotel pickup. The published suggestion covers Gyeongbokgung Palace, Insadong, and Bukchon Hanok Village, with a hanbok rental listed as an add-on for palace photographs and lunch on the suggested plan. Entrance fees follow the booked option. The format suits visitors who want a single guided city sweep without assembling palace tickets and neighborhood transfers independently. Meeting points are confirmed at booking in Seoul, and the itinerary stays on Gyeongbokgung, Insadong, and Bukchon that define this outing rather than a DMZ crossing.",
  "6780P36":
    "In Seoul, this private six-hour DMZ day leaves a city hotel for Imjingak Park, Freedom Bridge, Dora Observatory, and the Third Tunnel of Aggression. A private guide and air-conditioned vehicle are listed, with DMZ admission included. The published page notes the DMZ Exhibition Hall among the Freedom Bridge stops. The format suits visitors who want a guided border circuit without joining a large coach. Meeting points are confirmed at booking in Seoul, and the itinerary stays on Imjingak, Freedom Bridge, Dora Observatory, and the Third Tunnel that define this outing rather than a palace loop.",
  "470724P1":
    "In Seoul, this private seven-to-eight-hour DMZ day travels with a North Korean defector guide who left in 2017, then sits down for a North Korean lunch at a restaurant run by defectors. Imjingak Park and Dora Observatory appear on the published route, with hotel pickup, drop-off, admission fees, and travel insurance listed. The format suits visitors who want a guided border day with first-person context rather than a standard coach briefing. Meeting points are confirmed at booking in Seoul, and the itinerary stays on Imjingak, Dora Observatory, and the defector-run lunch that define this outing rather than a Han River evening.",
  "11214P21":
    "In Seoul, this private nine-hour evening starts at Gyeongbokgung Palace after a hotel-lobby pickup, then continues onto a Han River night cruise. A driver-guide, private vehicle, fuel, and parking are listed; food and palace or cruise entrance fees follow the booked option. The format suits visitors who want a guided palace-and-river night without assembling a cruise ticket independently. Meeting points are confirmed at booking in Seoul, and the itinerary stays on Gyeongbokgung Palace and the Han River that define this outing rather than a Gwangjang Market walk.",
  "6780CITY_FULLDAY":
    "In Seoul, this eight-hour city day meets at Jogyesa Temple or adds downtown hotel pickup, then covers Gyeongbokgung Palace, the National Folk Museum of Korea, Gwanghwamun Gate, N Seoul Tower on Namsan, and Namsangol Hanok Village. A professional guide, air-conditioned vehicle, and listed admission fees are included. Drop-off is published for Myeongdong, City Hall, or Itaewon. The format suits first-time visitors who want a single guided landmark circuit. Meeting points are confirmed at booking in Seoul, and the itinerary stays on Jogyesa, Gyeongbokgung, N Seoul Tower, and Namsangol that define this outing rather than a Suwon fortress day.",
  "6780P26":
    "In Seoul, this eight-hour palace day leaves a hotel for Gyeongbokgung Palace, UNESCO-listed Changdeokgung Palace, Jogyesa Temple, and Insadong. A professional guide, air-conditioned vehicle, lunch, and hotel pickup are listed. On Tuesdays the public page notes a Deoksugung substitution if Gyeongbokgung is closed. The format suits visitors who want a guided two-palace day without assembling temple and market transfers independently. Meeting points are confirmed at booking in Seoul, and the itinerary stays on Gyeongbokgung, Changdeokgung, Jogyesa, and Insadong that define this outing rather than an N Seoul Tower finish.",
  "30023P9":
    "In Seoul, this three-and-a-half-hour morning covers Jogyesa Temple, the changing of the guard at Gwanghwamun Gate, Gyeongbokgung Palace, and the National Folk Museum of Korea. Hotel pickup, a guide, entrance fees, and transport are listed, with drop-off at City Hall or Insadong. The format suits visitors who want a short guided palace window before an afternoon on their own. Meeting points are confirmed at booking in Seoul, and the itinerary stays on Jogyesa, Gwanghwamun, Gyeongbokgung, and the Folk Museum that define this outing rather than a full Namsan day.",
  "42053P14":
    "In Seoul, this six-to-ten-hour DMZ day adds optional hotel pickup in Jongno-gu, Yongsan-gu, Jung-gu, Gangnam-gu, Songpa-gu, or Mapo-gu, then covers Imjingak Park, the Third Tunnel of Aggression, and Dora Observatory. A guide, DMZ entrance, an air-conditioned vehicle, and binoculars are listed, with Korean barbecue described on the public page. Drop-off is published for Hongdae, Myeongdong, Gwangjang Market, or Dongdaemun. The format suits visitors who want a guided border day without hiring a car. Meeting points are confirmed at booking in Seoul, and the itinerary stays on Imjingak, the Third Tunnel, and Dora Observatory that define this outing rather than a private defector lunch.",
  "48881P11":
    "In Seoul, this eleven-to-twelve-hour coach day leaves a central meeting point for the Garden of Morning Calm, Nami Island, and Gangchon Railbike Park. Round-trip transport, English- or Chinese-speaking staff, the three entry tickets, and traveler's insurance are listed. The railbike default is a shared four-seater. The format suits visitors who want a guided Gapyeong day without assembling island and garden tickets independently. Meeting points are confirmed at booking in Seoul, and the itinerary stays on the Garden of Morning Calm, Nami Island, and Gangchon Railbike that define this outing rather than a Seoraksan start.",
  "55262P2":
    "In Seoul, this fourteen-hour coach day reaches Seoraksan National Park and Shinheungsa, then continues to Nami Island and the Garden of Morning Calm. Round-trip transport, the Seoraksan entrance ticket, the Nami ferry ticket, and the garden ticket are listed. The public page notes that the Seorak cable car can close in weather and that a Nami zip wire is own expense. The format suits visitors who want a long guided mountain-and-island day from the capital. Meeting points are confirmed at booking in Seoul, and the itinerary stays on Seoraksan, Shinheungsa, Nami Island, and the Garden of Morning Calm that define this outing rather than a Gangchon railbike add-on.",
  "48881P82":
    "In Seoul, this seven-to-eight-hour coach day travels to the Korean Folk Village in Yongin and UNESCO-listed Suwon Hwaseong Fortress, with Suwon Nammun Market on the published route. Round-trip transport, English-speaking staff, and both admissions are listed. The village page notes Joseon-era houses and seasonal farmer-music or horseback performances. The format suits visitors who want a guided fortress-and-folk-village day without self-driving to Suwon. Meeting points are confirmed at booking in Seoul, and the itinerary stays on the Korean Folk Village, Hwaseong Fortress, and Nammun Market that define this outing rather than a Nami Island ferry.",
  "33054P5":
    "In Seoul, this three-and-a-half-hour class meets at Mangwon Station Exit 2, walks Mangwon Market for ingredients, then cooks four kimchi types at individual stations in a home kitchen. A cookbook, takeaway container, bottled water, and rice wine are listed, with a tasting of kimchi, boiled pork, and fried tofu. The group is capped at four. The format suits visitors who want a guided kimchi window without booking a full-day countryside transfer. Meeting points are confirmed at booking in Seoul, and the itinerary stays on Mangwon Market and the kimchi studio that define this class rather than a four-dish hanjeongsik dinner.",
  "121170P1":
    "In Seoul, this three-and-a-half-hour home class meets at Mangwon Station Exit 2, walks Mangwon Market for street-food snacks and ingredients, then cooks four Korean dishes such as dakgalbi, bibimbap, haemul pajeon, or doenjang jjigae. A hanjeongsik spread of more than ten side dishes, dessert, beverages, and makgeolli is listed. The format suits visitors who want a guided home-kitchen meal rather than a kimchi-only session. Meeting points are confirmed at booking in Seoul, and the itinerary stays on Mangwon Market and the home kitchen that define this class rather than a Gwangjang night walk.",
  "359901P1":
    "In Seoul, this three-hour guided ride meets outside Jayang Station Exit 2 at Ttukseom Recreation Area, then follows the Han River path through Seoul Forest and Seongsu-dong. Bicycle rental, a rain coat if needed, snacks, and a local guide are listed. Reviews on the public page mention an optional chicken picnic at the end. The format suits visitors who want a guided riverside ride without renting independently. Meeting points are confirmed at booking in Seoul, and the itinerary stays on the Han River, Seoul Forest, and Seongsu-dong that define this outing rather than a palace coach day.",
  "255235P5":
    "In Seoul, this guided Bukhansan summit course meets outside Exit 2 of Bukhansan Ui Station by 8:00 a.m. and hikes the published granite-peak route. The public page lists an optional post-hike tofu lunch paid on site and hiking-pole rental if requested in advance. The group is capped at twenty. The format suits visitors who want a guided summit without assembling trailheads independently. Meeting points are confirmed at booking in Seoul, and the itinerary stays on Bukhansan Ui Station and the Bukhansan summit that define this outing rather than a Han River bike path.",
  "47013P23":
    "In Seoul, this five-hour evening covers Changgyeonggung Palace, Gwangjang Market, Naksan Park on the Hanyang city wall, and Cheonggyecheon Stream. An air-conditioned vehicle, English-speaking staff, and admission fees are listed. Reviews on the public page describe the lit wall walk at Naksan as the late stop. The format suits visitors who want a guided night circuit without assembling palace and market transfers independently. Meeting points are confirmed at booking in Seoul, and the itinerary stays on Changgyeonggung, Gwangjang Market, Naksan Park, and Cheonggyecheon that define this outing rather than a Han River cruise.",
};

export const getSeoulTargetedNarrativeDescription = (productCode: string) =>
  SEOUL_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as SeoulTargetedNarrativeDescriptionProductCode
  ];
