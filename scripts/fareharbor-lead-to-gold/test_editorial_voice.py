#!/usr/bin/env python3
"""Editorial-voice rules for FareHarbor city migrations."""

from __future__ import annotations

import unittest
from pathlib import Path

from editorial_voice import (
    EDITORIAL_PROMPT,
    apply_editorial_overlay,
    boilerplate_language_errors,
    compose_editorial,
    contrast_padding_errors,
    drop_contrast_padding,
    editorial_is_thin,
    editorial_substance_errors,
    editorial_voice_errors,
    field_dump_errors,
    fragment_errors,
    implementation_language_errors,
    is_structural_label,
    load_editorial_sample,
    prose_quality_errors,
    template_artifact_errors,
)


SAMPLE = Path(__file__).with_name("boston_editorial_sample.json")
SAMPLE_IDS = [
    "27344",
    "112945",
    "117124",
    "243407",
    "26483",
    "26504",
    "361612",
    "361623",
    "482166",
    "618195",
]


class EditorialVoiceTest(unittest.TestCase):
    def test_prompt_forbids_implementation_language_and_invention(self):
        lowered = EDITORIAL_PROMPT.lower()
        self.assertIn("named places", lowered)
        self.assertIn("do not invent", lowered)
        self.assertIn("third-person", lowered)

    def test_implementation_language_is_rejected(self):
        errors = implementation_language_errors(
            "Named places include Faneuil Hall. This guided outing takes place in Boston."
        )
        self.assertTrue(any("named places" in item for item in errors))
        self.assertTrue(any("takes place in" in item for item in errors))
        self.assertTrue(any("this guided outing" in item for item in errors))

    def test_boston_sample_has_ten_products_and_clean_voice(self):
        products = load_editorial_sample(SAMPLE)
        self.assertEqual(sorted(products), sorted(SAMPLE_IDS))
        for item_id in SAMPLE_IDS:
            overlay = products[item_id]
            paragraphs = overlay["paragraphs"]
            errors = editorial_voice_errors(
                paragraphs, overlay["highlights"], overlay["schemaDescription"]
            )
            self.assertEqual(errors, [], msg=f"{item_id}: {errors}")
            body = " ".join(paragraphs).lower()
            self.assertNotIn("facts panel", body)
            self.assertNotIn("103 atlantic", body)
            self.assertNotIn("91 charles", body)
            self.assertNotIn("60 rowes", body)
            self.assertNotRegex(body, r"\buses the\b")
            self.assertNotRegex(body, r"\btakes in\b")
            self.assertNotRegex(body, r"\bpoint(?:s|ing) out\b")
            self.assertNotRegex(body, r"\bcontinues toward\b")
            self.assertLessEqual(len(paragraphs), 4)
            self.assertGreaterEqual(len(paragraphs), 2)

    def test_overlay_replaces_template_copy_only(self):
        product = {
            "paragraphs": ["This guided outing takes place in Boston."],
            "highlights": ["Named places include Charles River"],
            "schemaDescription": "This guided outing takes place in Boston.",
        }
        overlay = load_editorial_sample(SAMPLE)["27344"]
        updated = apply_editorial_overlay(product, overlay)
        text = " ".join(updated["paragraphs"]).lower()
        self.assertIn("urban adventours", text)
        self.assertNotIn("takes place in", text)
        self.assertNotIn("named places", text)
        self.assertGreater(updated["wordCount"], 40)


    def test_boilerplate_and_field_dump_are_rejected(self):
        text = "The guide leads in English. Comfortable shoes are the packing notes."
        self.assertTrue(boilerplate_language_errors(text))
        errors = field_dump_errors(
            ["The guide leads in English.", "Groups are capped at 12."]
        )
        self.assertTrue(errors)
        self.assertTrue(
            fragment_errors(["Duration 3 hours.", "Lobster Rolls and Boston Baked Beans."])
        )

    def test_substance_requires_experience_not_logistics_padding(self):
        thin = [
            "Classic Downtown Boston is a three-hour food walk with Bites of Boston Food Tours.",
            "The guide leads in English. Groups are capped at 12.",
        ]
        self.assertTrue(editorial_is_thin(thin))
        errors = editorial_substance_errors(thin, [], thin[0], exception="OK")
        self.assertTrue(any("boilerplate" in item or "substance" in item for item in errors))
        overlay = load_editorial_sample(SAMPLE)["27344"]
        self.assertFalse(editorial_is_thin(overlay["paragraphs"]))
        self.assertEqual(
            editorial_substance_errors(
                overlay["paragraphs"],
                overlay["highlights"],
                overlay["schemaDescription"],
                exception="OK",
            ),
            [],
        )

    def test_composer_does_not_emit_language_or_packing_filler(self):
        catalog = {
            "title": "Classic Downtown Boston",
            "operator": "Bites of Boston Food Tours",
        }
        facts = {
            "duration": "3 hours",
            "description": "Stops include lobster rolls, New England clam chowder, Boston baked beans, and Boston cream pie in downtown Boston.",
            "languages": ["English"],
            "included": [],
            "bring": ["Comfortable shoes", "Water bottle"],
            "groupSize": "12",
            "minAge": 12,
            "maxAge": None,
            "meetingAddress": "100 Tremont st. Boston, MA 02108",
            "highlights": [],
            "itinerary": [],
            "restrictions": [],
            "cancellation": None,
            "accessibility": None,
            "properNames": ["Lobster Rolls", "Boston Baked Beans", "Boston Cream Pie"],
        }
        source = facts["description"]
        paragraphs, highlights, schema, _removed = compose_editorial(
            catalog, facts, source, {"disposition": "keep", "place": {"city": "Boston", "state": "Massachusetts"}}
        )
        body = " ".join(paragraphs).lower()
        self.assertNotIn("the guide leads in", body)
        self.assertNotIn("packing notes", body)
        self.assertRegex(body, r"sample|lobster|chowder|baked beans|cream pie")
        self.assertFalse(editorial_is_thin(paragraphs) or len(body.split()) < 28)

    def test_driving_tour_is_not_described_as_a_walk(self):
        title = "Half Day Driving Tour of Boston & Cambridge"
        description = (
            "This half-day driving tour takes guests through Boston and Cambridge in a heated "
            "and air-conditioned modern minivan. The drive includes the Old North Church, "
            "Paul Revere's house, Faneuil Hall, Boston Common, Beacon Hill, the Bunker Hill Monument, "
            "USS Constitution, Harvard, MIT, Copley Square, and the Boston Public Library. "
            "The tour is mainly driving, with a few optional stops of 5-10 minutes to step out "
            "for photographs. Guests hear stories about Boston's past, the American Revolution, "
            "and the mix of religious morals and corruption. Pickup can be at a hotel, Logan Airport, "
            "or the cruise terminal. The van seats 6 people."
        )
        paragraphs, _highlights, _schema, _removed = compose_editorial(
            {"title": title, "operator": "Boston Hidden Gems"},
            {
                "description": description,
                "duration": "4 hours",
                "included": [],
                "highlights": [],
                "itinerary": [],
                "languages": [],
                "restrictions": [],
                "cancellation": None,
                "accessibility": None,
                "bring": [],
                "meetingAddress": None,
            },
            description,
            {"disposition": "keep", "place": {"city": "Boston", "state": "Massachusetts"}},
        )
        body = " ".join(paragraphs)
        self.assertGreaterEqual(len(body.split()), 100)
        self.assertNotIn("the walk", body.lower())
        self.assertNotIn(title.lower(), body.lower())
        self.assertNotRegex(body.lower(), r"the (group|walk|outing) covers")
        self.assertEqual(prose_quality_errors(paragraphs, title, description), [])

    def test_studio_and_revue_sources_are_not_rewritten_as_outdoor_walks(self):
        workshop = (
            "Unleash your inner street artist in a workshop led by Studio W.I.P. artists. "
            "Over the session you'll learn spray paint handling, stencil application, lettering and textures "
            "while creating your own original canvas to take home."
        )
        paragraphs, _highlights, _schema, _removed = compose_editorial(
            {"title": "Spray Paint Workshop", "operator": "Studio Artists"},
            {
                "description": workshop,
                "duration": "90 minutes",
                "included": ["One canvas", "Staff instruction"],
                "highlights": [],
                "itinerary": ["Check in", "Paint", "Wrap"],
                "languages": [],
                "restrictions": [],
                "cancellation": None,
                "accessibility": None,
                "bring": [],
                "meetingAddress": None,
            },
            workshop,
            {"disposition": "keep", "place": {"city": "Chicago", "state": "Illinois"}},
        )
        body = " ".join(paragraphs)
        self.assertGreaterEqual(len(body.split()), 40)
        self.assertIn("canvas", body.lower())
        self.assertNotIn("nothing is staged indoors", body.lower())
        self.assertNotIn("walking route", body.lower())
        self.assertNotRegex(body.lower(), r"the (group|walk|outing) covers")
        self.assertEqual(contrast_padding_errors(paragraphs, workshop), [])
        self.assertEqual(prose_quality_errors(paragraphs, "Spray Paint Workshop", workshop), [])

        revue = (
            "Our male revue features male strippers and exotic dancers in an intimate setting. "
            "The Las Vegas Style show includes audience participation, and hosts encourage the crowd. "
            "Guests book it for a bachelorette or birthday party."
        )
        paragraphs, _highlights, schema, _removed = compose_editorial(
            {"title": "Male Revue Night", "operator": "Stage Productions"},
            {
                "description": revue,
                "duration": "2 hours",
                "included": ["Male revue show with exotic dancers", "Audience participation"],
                "highlights": [],
                "itinerary": [],
                "languages": [],
                "restrictions": [],
                "cancellation": None,
                "accessibility": None,
                "bring": [],
                "meetingAddress": None,
                "minAge": 21,
            },
            revue,
            {"disposition": "keep", "place": {"city": "Chicago", "state": "Illinois"}},
        )
        body = " ".join(paragraphs)
        self.assertGreaterEqual(len(body.split()), 40)
        self.assertIn("revue", body.lower())
        self.assertNotIn("Las Vegas Style, and they hear why", body)
        self.assertNotIn("nothing is staged indoors", body.lower())
        self.assertNotIn("walking route", body.lower())
        self.assertNotRegex(schema, r"passes Paint")
        self.assertEqual(contrast_padding_errors(paragraphs, revue), [])
        self.assertEqual(prose_quality_errors(paragraphs, "Male Revue Night", revue), [])

    def test_thin_trail_ride_is_not_padded_with_town_contrasts(self):
        description = (
            "Enjoy a beautiful walk ride in Joshua Tree. This is a peaceful way to start your day! "
            "Riders must be 8 years of age or older."
        )
        paragraphs, _highlights, _schema, _removed = compose_editorial(
            {
                "title": "Morning Trail Ride",
                "operator": "Cascade Trails Mustang Sanctuary",
            },
            {
                "description": description,
                "duration": "1 Hour",
                "included": ["1 hour trail ride"],
                "highlights": [],
                "itinerary": [],
                "languages": [],
                "restrictions": [],
                "cancellation": None,
                "accessibility": None,
                "bring": [],
                "meetingAddress": "6353 Cascade Rd Joshua Tree, CA 92252",
            },
            description,
            {
                "disposition": "keep",
                "place": {"city": "Joshua Tree", "state": "California"},
            },
        )
        body = " ".join(paragraphs)
        lowered = body.lower()
        self.assertNotIn("rather than touring town", lowered)
        self.assertNotIn("sightseeing loop", lowered)
        self.assertNotIn("town route", lowered)
        self.assertNotIn("not on a walk through town", lowered)
        self.assertNotIn("instead of being led", lowered)
        self.assertRegex(lowered, r"horse")
        self.assertRegex(body, r"\b[Mm]orning\b")
        self.assertGreaterEqual(len(body.split()), 20)
        self.assertLess(len(body.split()), 100)
        self.assertEqual(contrast_padding_errors(paragraphs, description), [])
        errors = editorial_substance_errors(
            paragraphs,
            [],
            paragraphs[0],
            exception="OK",
            title="Morning Trail Ride",
            description=description,
            allow_short=True,
        )
        self.assertEqual(errors, [], msg=errors)

    def test_same_negative_contrast_is_kept_once_and_only_from_source(self):
        padded = [
            "Guests walk with the horses from the ranch rather than touring town on their own.",
            "People stay with the horses for the booked session rather than on a sightseeing loop.",
            "Guests stay beside the horses instead of being led around a town route.",
            "Guests are with the horses for this booking, not on a walk through town.",
        ]
        kept_padded = drop_contrast_padding(padded, "A walk ride in Joshua Tree.")
        self.assertEqual(len(kept_padded), 1)
        self.assertNotRegex(kept_padded[0].lower(), r"rather than|sightseeing|town route|walk through town")
        source = "This is not a walking tour. Guests ride horses at the ranch."
        kept = drop_contrast_padding(
            [
                "This booking is a ranch ride, not a walking tour.",
                "Guests are with the horses rather than on a walking tour.",
            ],
            source,
        )
        denials = [item for item in kept if "walking tour" in item.lower()]
        self.assertEqual(len(denials), 1)
        banana = "Suture practice uses a banana rather than a live animal."
        self.assertEqual(
            drop_contrast_padding([banana], "Practice sutures on a banana."),
            [banana],
        )

    def test_source_labels_are_not_places(self):
        for label in (
            "Level Suitable",
            "Departure Location",
            "Important Information",
            "California Expedition Includes",
            "Tips Dress",
            "Bike Must",
            "On August",
            "Ticketed Charters",
            "Catamaran Yacht Charter",
            "Wildlife Disclaimer",
        ):
            self.assertTrue(is_structural_label(label), label)
        self.assertFalse(is_structural_label("Mission Bay"))
        self.assertFalse(is_structural_label("USS Midway"))
        self.assertFalse(is_structural_label("Coronado Bridge"))
        self.assertFalse(is_structural_label("San Diego Bay"))

    def test_private_bike_tour_does_not_invent_label_stops(self):
        description = (
            "Enjoy an exclusive and private tour experience by Bike. "
            "Must be at least 16 years old to participate. Riders under 18 must be accompanied by a guardian. "
            "2.5 Hours. Min. weight 100lbs, max 260lbs. "
            "Tips Dress appropriately for the weather and don't forget your camera!"
        )
        paragraphs, highlights, schema, _removed = compose_editorial(
            {"title": "Private San Diego Electric Bike Tour", "operator": "Unlimited Biking"},
            {
                "description": description,
                "duration": "2.5 Hours",
                "included": [],
                "highlights": [],
                "itinerary": [],
                "languages": [],
                "restrictions": [],
                "cancellation": None,
                "accessibility": None,
                "bring": [],
                "meetingAddress": "330 K Street San Diego, CA 92101",
            },
            description,
            {"disposition": "keep", "place": {"city": "San Diego", "state": "California"}},
        )
        body = " ".join(paragraphs)
        lowered = body.lower()
        self.assertIn("electric", lowered)
        self.assertIn("private", lowered)
        self.assertNotIn("tips dress", lowered)
        self.assertNotIn("bike must", lowered)
        self.assertEqual(template_artifact_errors(paragraphs + highlights + [schema]), [])
        self.assertGreaterEqual(len(body.split()), 20)
        self.assertLess(len(body.split()), 100)

    def test_harbor_cruise_uses_the_bay_route_not_charter_labels(self):
        description = (
            "Triton Charters is a catamaran that docked in the San Diego Bay. "
            "The boat is certified for a maximum of 100 passengers, and public departures carry up to 80 guests."
        )
        itinerary = (
            "This cruise goes through San Diego Bay past the USS Midway and under the Coronado Bridge. "
            "The captain and crew stay with the boat. Music plays, and drinks are available."
        )
        included = [
            "Coast Guard certified captain and crew members",
            "Full 13-seat bar",
            "Dance floor with music",
            "Bean bags on the bow",
            "Live music on select charters",
        ]
        paragraphs, _highlights, schema, _removed = compose_editorial(
            {"title": "2.5 Hour Harbor Cruise", "operator": "Triton Charters"},
            {
                "description": description,
                "duration": "2.5 hours",
                "included": included,
                "highlights": [],
                "itinerary": [itinerary],
                "languages": [],
                "restrictions": [],
                "cancellation": None,
                "accessibility": None,
                "bring": [],
                "meetingAddress": None,
            },
            description + " " + itinerary,
            {"disposition": "keep", "place": {"city": "San Diego", "state": "California"}},
        )
        body = " ".join(paragraphs)
        lowered = body.lower()
        self.assertIn("uss midway", lowered)
        self.assertIn("coronado bridge", lowered)
        self.assertIn("san diego bay", lowered)
        self.assertNotIn("ticketed charters", lowered)
        self.assertNotIn("on august", lowered)
        self.assertNotIn("catamaran yacht charter", lowered)
        self.assertEqual(template_artifact_errors(paragraphs + [schema]), [])

    def test_pelagic_page_describes_mola_not_section_headings(self):
        description = (
            "The trip swims alongside mola mola, also called ocean sunfish, off San Diego. "
            "Bait balls and other pelagic fish are part of the same water. "
            "Gray whales may be present in winter and spring, blue whales in summer, "
            "and humpback whales in the fall. Dolphins are here year-round. "
            "Beginners and intermediates can join. Scuba is not required, but snorkeling familiarity helps. "
            "Departure is Mission Bay. Snacks are included. Sightings are not guaranteed. "
            "The boat is usually back around 3:00 pm. The expedition runs 6 hours."
        )
        paragraphs, highlights, schema, _removed = compose_editorial(
            {"title": "Pelagic Wildlife Expedition (6 Hrs)", "operator": "Net Zero Expeditions"},
            {
                "description": description,
                "duration": "6 hours",
                "included": ["Refreshments and healthy snacks"],
                "highlights": [],
                "itinerary": [],
                "languages": [],
                "restrictions": [],
                "cancellation": None,
                "accessibility": None,
                "bring": [],
                "meetingAddress": None,
            },
            description,
            {"disposition": "keep", "place": {"city": "San Diego", "state": "California"}},
        )
        body = " ".join(paragraphs + highlights + [schema])
        lowered = body.lower()
        self.assertIn("mola", lowered)
        self.assertIn("mission bay", lowered)
        self.assertNotIn("level suitable", lowered)
        self.assertNotIn("departure location", lowered)
        self.assertNotIn("important information", lowered)
        self.assertNotIn("expedition includes", lowered)
        self.assertNotIn("wildlife disclaimer", lowered)
        self.assertEqual(template_artifact_errors(paragraphs + highlights + [schema]), [])


if __name__ == "__main__":
    unittest.main()
