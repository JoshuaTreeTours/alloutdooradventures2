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
    load_editorial_sample,
    prose_quality_errors,
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


if __name__ == "__main__":
    unittest.main()
