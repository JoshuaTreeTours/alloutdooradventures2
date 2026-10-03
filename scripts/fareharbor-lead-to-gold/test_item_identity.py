#!/usr/bin/env python3
"""Item identity for FareHarbor prose, price, images, and ratings."""

from __future__ import annotations

import json
import unittest
from pathlib import Path

from build_stage_b_proof import clean_text, extract_price
from build_boston_legacy import extract_facts, identical_prose_without_shared_source
from editorial_finish import finish_experience
from editorial_voice import (
    invented_food_walk_errors,
    section_label_leak_errors,
)
from image_integrity import item_owned_image_urls

ROOT = Path(__file__).resolve().parents[2]


class CleanTextSectionLabelTest(unittest.TestCase):
    def test_strips_heading_labels_and_keeps_sentence_uses(self):
        leaked = clean_text(
            "##Duration\n8 hours\n##About\nAfter meeting at the office, the hike begins."
        )
        self.assertNotIn("Duration", leaked)
        self.assertNotIn("About", leaked)
        self.assertIn("After meeting at the office", leaked)

        glued = clean_text("Duration About After meeting at the office, the hike begins.")
        self.assertFalse(glued.lower().startswith("duration"))
        self.assertIn("After meeting at the office", glued)

        self.assertIn(
            "about geology",
            clean_text("The tour is about geology and the rock formations.").lower(),
        )
        self.assertTrue(
            clean_text("About 90 minutes are set aside for the museum.").startswith("About 90")
        )
        labeled = clean_text(
            "Duration, Distance, Terrain\n1 mile at a moderate pace.\nAbout\nVisit one of Boston's hidden districts."
        )
        self.assertFalse(labeled.startswith("Duration"))
        self.assertIn("moderate pace", labeled)
        self.assertIn("hidden districts", labeled)

    def test_section_label_detector_ignores_a_real_sentence(self):
        self.assertEqual(
            section_label_leak_errors(["About 90 minutes are set aside for the museum."]),
            [],
        )
        self.assertTrue(
            section_label_leak_errors(
                ["Duration About After meeting at the office, the hike begins."]
            )
        )


class DurationHeadingTest(unittest.TestCase):
    def test_duration_heading_survives_after_the_label_is_stripped_from_prose(self):
        raw = (
            "## Duration\nUp to 2 hours (depending on traffic conditions)\n"
            "## About\nHave you got limited time to spend in Los Angeles with a guide."
        )
        cleaned = clean_text(raw)
        self.assertNotIn("Duration", cleaned)
        facts = extract_facts(
            [{"description": raw}],
            "",
            {},
            {"description": cleaned},
        )
        self.assertEqual(facts["duration"], "2 hours")
        self.assertFalse(facts["description"].lower().startswith("duration"))

    def test_sentence_duration_is_not_replaced_by_a_different_heading(self):
        raw = (
            "## Duration\n8 hours\n## About\n"
            "The outing lasts 3 hours on the water with a guide and a small group."
        )
        facts = extract_facts(
            [{"description": raw}],
            "",
            {},
            {"description": clean_text(raw)},
        )
        self.assertEqual(facts["duration"], "3 hours")


class FoodWalkInventionTest(unittest.TestCase):
    def test_rejects_street_food_filler_that_is_not_in_the_source(self):
        paragraphs = [
            "The stops exist for the food. Streets and storefronts are the setting, and tasting is the point."
        ]
        self.assertTrue(
            invented_food_walk_errors(
                paragraphs,
                "In the Company of Horses and Wine",
                "Guests meet the horses and taste Wiley Wines.",
            )
        )
        self.assertEqual(
            invented_food_walk_errors(
                paragraphs,
                "North End Food Tour",
                "This food walk stays in the neighborhood.",
            ),
            [],
        )


class PriceAndImageIdentityTest(unittest.TestCase):
    def test_price_preview_uses_only_the_requested_item(self):
        preview = {
            "details": {"currency": "usd", "currency_decimal_places": 2},
            "items": [
                {
                    "id": 111,
                    "price": {"breakdown": {"customer_types": [{"singular": "Adult", "note": "", "price": 5000}]}},
                },
                {
                    "id": 222,
                    "price": {"breakdown": {"customer_types": [{"singular": "Adult", "note": "", "price": 9000}]}},
                },
            ],
        }
        own = extract_price(preview, "222")
        self.assertEqual(own["basis"]["amount"], 90)
        self.assertIsNone(extract_price(preview, "333"))

    def test_images_from_another_item_are_dropped(self):
        payloads = [
            {
                "images": [
                    {
                        "image_cdn_url": "https://cdn.filestackcontent.com/ownimage01",
                        "item": {"uri": "/api/v1/companies/demo/items/587300/"},
                    },
                    {
                        "image_cdn_url": "https://cdn.filestackcontent.com/otherimage",
                        "item": {"pk": 999999},
                    },
                ]
            }
        ]
        self.assertEqual(
            item_owned_image_urls(payloads, "587300"),
            ["https://cdn.filestackcontent.com/ownimage01"],
        )


class HorseAndWineEditorialTest(unittest.TestCase):
    def test_horse_and_wine_copy_is_not_a_food_walk(self):
        description = (
            "Meet the herd for a hands-on equine session, then sit down for wines from Wiley Wines. "
            "The pours come from Northern California vineyards, and Phineas Fittipaldi hosts the tasting "
            "with light bites. Staff talk through horse behavior and daily care on the desert ranch."
        )
        rows = finish_experience(
            {
                "description": description,
                "itinerary": [],
                "highlights": [],
                "included": ["Interactive Equine Experience"],
            },
            "In the Company of Horses and Wine",
            "Cascade Trails Mustang Sanctuary",
            None,
            description,
        )
        self.assertIsNotNone(rows)
        text = " ".join(rows or [])
        self.assertNotIn("food walk", text.lower())
        self.assertNotIn("Duration About", text)
        self.assertNotIn("streets and storefronts", text.lower())
        self.assertIn("horse", text.lower())


class PublishedProseIdentityTest(unittest.TestCase):
    def test_published_pages_do_not_reuse_unrelated_item_prose(self):
        generated = sorted((ROOT / "src" / "data").glob("fareharbor*Legacy.generated.ts"))
        catalog = {}
        rows = {}
        for path in generated:
            text = path.read_text()
            marker = text.find("= [")
            payload = text[marker + 2 :].strip()
            if payload.endswith(";"):
                payload = payload[:-1]
            for product in json.loads(payload):
                rows[product["itemId"]] = product
                catalog[product["itemId"]] = product
        borrowed = identical_prose_without_shared_source(rows, catalog)
        self.assertEqual(borrowed, set(), sorted(borrowed))


if __name__ == "__main__":
    unittest.main()
