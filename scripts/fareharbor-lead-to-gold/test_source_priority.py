#!/usr/bin/env python3
"""Source-priority ingest for FareHarbor city migrations."""

from __future__ import annotations

import unittest

from editorial_voice import compose_editorial, editorial_is_thin
from source_priority import (
    SOURCE_PRIORITY,
    collect_authoritative_source,
    itinerary_stops,
    source_supports_editorial,
)


RICH_DETAILS = (
    "Step back in time to April 19, 1775, and relive the events of the first day "
    "of the American Revolution. This tour takes you along Paul Revere's famous "
    "midnight ride and follows the British troops as they march into Lexington and Concord. "
    "The tour starts with a visit to the Old North Church. Next, visit the Lexington Battle Green. "
    "Stand on the historic North Bridge. Travel back to Boston along the Battle Road Trail. "
    "Visit Harvard Yard and conclude the tour with a visit to the Bunker Hill Memorial. "
    "All our tour guides are trained and licensed by the town of Concord to conduct historical tours."
)

ITINERARY = (
    "1. Pick Ups\n2. Tour Begin\n3. Paul Revere Mall\n4. Old North Church\n"
    "5. Hancock-Clarke House\n6. Lexington Battle Green\n7. Buckman Tavern\n"
    "8. Old North Bridge\n9. Concord Museum\n10. Harvard Yard\n11. Bunker Hill Monument\n"
    "12. Tour Ends/Drop Offs"
)


class SourcePriorityTest(unittest.TestCase):
    def test_priority_order_is_documented(self):
        self.assertEqual(
            SOURCE_PRIORITY,
            (
                "structured_description",
                "booking_details_content",
                "itinerary_inclusions_logistics",
            ),
        )

    def test_structured_description_wins_when_substantial(self):
        source = collect_authoritative_source(
            content={"description": "Short content blurb only."},
            structured={"description": RICH_DETAILS, "itinerary": ITINERARY},
        )
        self.assertEqual(source["sourceUsed"], "structured_description")
        self.assertGreaterEqual(source["structuredDescriptionWords"], 40)
        self.assertTrue(source_supports_editorial(source))

    def test_content_details_used_when_structured_is_thin(self):
        source = collect_authoritative_source(
            content={"description": RICH_DETAILS, "itinerary": ITINERARY},
            structured={"description": "A brief note."},
        )
        self.assertEqual(source["sourceUsed"], "booking_details_content")
        self.assertIn("Old North Church", source["description"])

    def test_itinerary_supports_editorial_when_description_is_empty(self):
        source = collect_authoritative_source(
            content={"itinerary": ITINERARY, "description": ""},
            structured={},
        )
        self.assertGreaterEqual(len(source["itinerary"]), 3)
        self.assertNotIn("Pick Ups", source["itinerary"])
        self.assertTrue(source_supports_editorial(source))
        self.assertEqual(source["sourceUsed"], "itinerary_inclusions_logistics")

    def test_empty_payloads_do_not_support_editorial(self):
        source = collect_authoritative_source(content={}, structured={})
        self.assertFalse(source_supports_editorial(source, {"included": [], "highlights": []}))

    def test_description_plus_details_can_support_editorial(self):
        source = collect_authoritative_source(
            content={
                "description": (
                    "Available exclusively on Friday evenings, visit the local eateries "
                    "South End residents call home. Walk to 4 different locations, where "
                    "each visit includes an alcoholic beverage paired with a food tasting."
                ),
                "headline": "An Evening Off-the-Beaten-Path Boston Food and Cocktail Experience",
            },
            structured={},
        )
        self.assertTrue(source_supports_editorial(source))

    def test_private_booking_notes_do_not_support_editorial(self):
        source = collect_authoritative_source(
            content={
                "booking_notes": (
                    "Thank you for booking your wedding with Classic Sail Boston! "
                    "I have already booked your photographer. Reach us at info@example.com "
                    "or 844-724-5267."
                )
            },
            structured={},
        )
        self.assertFalse(source["detailsText"])
        self.assertFalse(source_supports_editorial(source))

    def test_itinerary_noise_is_removed(self):
        self.assertEqual(
            itinerary_stops("1. Pick Ups\n2. Old North Church\n3. Lunch Break\n4. Concord Museum"),
            ["Old North Church", "Concord Museum"],
        )
        self.assertEqual(
            itinerary_stops("30 min - Pick Up\n30 min - Paul Revere House\n15 min - Old North Church"),
            ["Paul Revere House", "Old North Church"],
        )

    def test_rich_details_compose_to_full_editorial(self):
        source = collect_authoritative_source(
            content={"description": RICH_DETAILS, "itinerary": ITINERARY},
            structured={"description": RICH_DETAILS, "itinerary": ITINERARY},
        )
        facts = {
            "duration": "7 hours",
            "description": source["description"],
            "itinerary": source["itinerary"],
            "included": [
                "Old North Church entry tickets",
                "Concord Museum entry tickets",
                "Harvard Yard entry fees",
            ],
            "highlights": [],
            "groupSize": "Maximum 9 People",
            "minAge": 2,
            "maxAge": 99,
            "meetingAddress": "Paul Revere Mall Boston, MA 02113",
            "languages": [],
            "restrictions": [],
            "bring": [],
            "cancellation": None,
            "accessibility": None,
            "properNames": [],
        }
        paragraphs, _highlights, schema, _removed = compose_editorial(
            {
                "title": "April 19, 1775: A Revolution Begins Semi-Private Tour",
                "operator": "Boston Hidden Gems",
            },
            facts,
            source["description"] + " " + " ".join(source["itinerary"]),
            {"disposition": "keep", "place": {"city": "Boston", "state": "Massachusetts"}},
            source["description"],
        )
        body = " ".join(paragraphs)
        self.assertFalse(editorial_is_thin(paragraphs), body)
        self.assertGreaterEqual(len(body.split()), 100)
        self.assertNotIn("lists this outing", body.lower())
        self.assertRegex(body, r"Old North Church|Lexington|Concord|Bunker Hill|Harvard")
        self.assertNotIn("you", body.lower().replace("youth", ""))
        self.assertLess(len(schema.split()), len(body.split()))
        sentences = [part.strip() for part in body.split(".") if part.strip()]
        self.assertEqual(len(sentences), len(set(sentences)), body)

    def test_rich_description_without_itinerary_composes_full_editorial(self):
        description = (
            "Explore the connection between architecture and politics in this tour "
            "along the charming streets of Beacon Hill's South Slope. Learn how "
            "Boston's elite created an exclusive neighborhood next to the site of "
            "the state capital. Experience Beacon Hill's past as you hear stories of "
            "independent female investor Hepzibah Swan; the fight for social justice "
            "at the Charles Street Meeting House; and the early American architecture "
            "of Charles Bulfinch. Walk through this historic collection of Federal "
            "and Greek Revival row homes on the shaded streets of Beacon Hill. "
            "After the tour, enjoy dinner or lunch at a charming restaurant along Charles Street."
        )
        facts = {
            "duration": "90 minutes",
            "description": description,
            "itinerary": [],
            "included": [
                "Guided 90 minute outdoor tour exploring the south slope of Boston's Beacon Hill neighborhood",
                "0.7 mile tour at a moderate pace, stopping at various sites along the tour",
            ],
            "highlights": [],
            "groupSize": "Maximum 15 People",
            "minAge": None,
            "maxAge": None,
            "meetingAddress": None,
            "languages": ["English", "Russian", "Italian"],
            "restrictions": [],
            "bring": [],
            "cancellation": None,
            "accessibility": None,
            "properNames": [],
        }
        paragraphs, _highlights, _schema, _removed = compose_editorial(
            {"title": "Beacon Hill", "operator": "Boston By Foot"},
            facts,
            description,
            {"disposition": "keep", "place": {"city": "Boston", "state": "Massachusetts"}},
            description,
        )
        body = " ".join(paragraphs)
        self.assertFalse(editorial_is_thin(paragraphs), body)
        self.assertGreaterEqual(len(body.split()), 100)
        self.assertRegex(body, r"architecture|South Slope|Federal|Greek Revival")
        self.assertNotIn("lists this outing", body.lower())


if __name__ == "__main__":
    unittest.main()
