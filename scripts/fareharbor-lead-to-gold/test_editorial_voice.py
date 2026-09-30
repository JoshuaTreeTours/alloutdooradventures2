#!/usr/bin/env python3
"""Editorial-voice rules for FareHarbor city migrations."""

from __future__ import annotations

import unittest
from pathlib import Path

from editorial_voice import (
    EDITORIAL_PROMPT,
    apply_editorial_overlay,
    editorial_voice_errors,
    implementation_language_errors,
    load_editorial_sample,
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


if __name__ == "__main__":
    unittest.main()
