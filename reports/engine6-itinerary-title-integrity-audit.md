# Engine6 Itinerary Title Integrity Audit

Generated: 2026-06-20T16:02:06.106Z

## Totals

- Total Engine6 tours audited: 133
- Total itinerary rows audited: 614
- Suspicious rows: 29
- Affected tours: 17

## Top suspicious patterns

| Pattern | Count |
| --- | ---: |
| more-than-eight-words | 20 |
| more-than-sixty-characters | 17 |
| sentence-punctuation | 14 |
| generic-description-start | 5 |
| supplier-marketing-prose | 4 |
| matches-description-first-sentence | 1 |

## Affected products

| Route | Product ID | Suspicious rows | Examples |
| --- | --- | ---: | --- |
| /destinations/california/san-diego/tours/san-diego-sunday-brunch-cruise | 5144BRUNCH | 4 | Cruise San Diego Bay on a Sunday brunch cruise experience with skyline views and live onboard entertainment; Sail past the Coronado Bridge, Seaport Village, USS Midway Museum, and downtown skyline during San Diego Bay sightseeing; Continue along the waterfront with clear views of the Coronado Bridge and central harbor landmarks from the dining deck |
| /destinations/wyoming/jackson/tours/4-day-yellowstone-and-grand-teton-national-parks-wildlife-adventure | 6029_4DAYPARK | 4 | Day 1: Grand Teton National Park Dusk Adventure; Day 2: Grand Teton & Yellowstone Wildlife and the Grand Canyon of Yellowstone; Day 3: Buffalo Bill Cody Museum, Yellowstone Wildlife & Scenic Upper Loop Adventure |
| /destinations/california/san-diego/tours/san-diego-bay-day-sail | 37126P9 | 3 | Sail under the bow of the aircraft carrier Midway for an out-of-this-world experience; The Rady Shell at Jacobs Park is a stunning open-air concert venue on the San Diego waterfront; The San Diego Convention Center |
| /destinations/switzerland/zurich/tours/exclusive-zurich-tour-old-town-lake-zurich-cruise-and-lindt-museum | 5553984P5 | 3 | Zurich Main Station (Zürich Hauptbahnhof) is a bustling hub of activity and a must-visit for anyone traveling to the city; This prominent 13th-century Gothic cathedral is perhaps best known for one of its more recent additions; The "Home of Chocolate Lindt" offers a truly enchanting journey into the world of Swiss chocolate |
| /destinations/california/los-angeles/tours/hollywood-hills-hiking-tour-in-los-angeles | 5569HIKE | 3 | We'll meet you in front of the Greek Theatre; See the gorgeous LA River on this Hollywood Hills Tour; Check out Warner Brothers, the most famous film studio in LA, in a bird's eye view on this Hollywood Hills Tour |
| /destinations/california/los-angeles/tours/hollywood-private-helicopter-tour-15131P4 | 15131P4 | 1 | Crypto.com Arena |
| /destinations/california/san-diego/tours/san-diego-private-balboa-park-segway-tour | 18125P5 | 1 | Pass the Spanish Village Art Center to see colorful courtyards and artist studios that reflect the park's creative side |
| /destinations/louisiana/new-orleans/tours/new-orleans-city-bike-tour | 276551P2 | 1 | Lafayette Cemetery No. 1 |
| /destinations/california/los-angeles/tours/2-hour-inside-adventure-tour-on-catalina-island-32779P6 | 32779P6 | 1 | As you venture ten miles into the rugged interior, you will view the protected side of Catalina Island seldom seen by most visitors |
| /destinations/new-york/new-york/tours/1-hour-central-park-pedicab-tour-27491 | 414460P1 | 1 | Strawberry Fields, John Lennon Memorial |
| /destinations/new-york/new-york/tours/new-york-city-private-walking-tour-with-a-local-guide | 474891P3 | 1 | New York Public Library - Stephen A. Schwarzman Building |
| /destinations/california/san-diego/tours/san-diego-seal-tour-5046PRTSANSEA | 5046SAN_SEA | 1 | This 90-minute shore excursion is a fantastic way to see the best of the Bay and San Diego during your limited time in port |
| /destinations/new-york/new-york/tours/nyc-bustronome-gourmet-sightseeing-lunch-panoramic-bus | 5515296P1 | 1 | Solomon R. Guggenheim Museum |
| /destinations/nevada/las-vegas/tours/deluxe-las-vegas-helicopter-night-flight-with-vip-transportation | 5516ST5 | 1 | MSG Sphere, High Roller, and LINQ district |
| /destinations/california/santa-barbara/tours/santa-barbara-stargazing-tour-with-phd-student-guide-5603847P4 | 5603847P4 | 1 | Escape the city lights and experience Santa Barbara’s night sky on a PhD-led stargazing tour |
| /destinations/new-york/new-york/tours/washington-d-c-tour-from-new-york | 5614063P8 | 1 | Washington, D.C. Landmarks |
| /destinations/switzerland/lucerne/tours/short-catamaran-cruise-on-lake-lucerne | 6400P7 | 1 | Enjoy the best of the lake Lucerne and |

## Full suspicious rows

See `reports/engine6-itinerary-title-integrity-audit.json` for product ID, route, tour title, itinerary index, rendered title, rendered description, titleSource, duration, admission status, and suspicious reasons for each row.
