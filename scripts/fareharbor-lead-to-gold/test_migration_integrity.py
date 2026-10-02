#!/usr/bin/env python3
"""Geography and editorial-quality rules for FareHarbor city migrations."""

from __future__ import annotations

import unittest

from migration_integrity import (
    assess_geography,
    collect_place_signals,
    editorial_errors,
    is_natural_place_name,
    normalize_activity_duration,
)


BOSTON = {
    "city": "Boston",
    "state": "Massachusetts",
    "citySlug": "boston",
    "stateSlug": "massachusetts",
}
CATALOG = {
    ("maine", "portland"): {
        "city": "Portland",
        "state": "Maine",
        "citySlug": "portland",
        "stateSlug": "maine",
    }
}


class GeographyRulesTest(unittest.TestCase):
    def test_hardwick_vermont_is_excluded_not_kept_under_boston(self):
        signals = collect_place_signals(
            meeting="Hardwick, VT",
            item_location="Hardwick, VT",
            headline="Visit our Sister Company in Vermont!",
            title="Wheels in the Woods",
            description=(
                "Nestled in the woods of the Northeast Kingdom in Hardwick, VT, "
                "Camp Wapanacki was originally founded as the first camp for blind children."
            ),
            start_city="Boston",
            start_province="MA",
            start_lat=42.361579,
            start_lng=-71.052411,
        )
        result = assess_geography(
            expected=BOSTON, catalog_destinations=CATALOG, signals=signals
        )
        self.assertTrue(result["conflictsWithExpected"])
        self.assertEqual(result["disposition"], "exclude")
        self.assertEqual(result["city"], "Hardwick")
        self.assertEqual(result["state"], "Vermont")
        self.assertEqual(result["place"]["source"], "meeting_point")

    def test_portland_maine_moves_to_existing_catalog_destination(self):
        signals = collect_place_signals(
            title="Portland, Maine Highlights",
            description="Portland, Maine is a wonderful combination of rich and unexpected history.",
            start_city="Boston",
            start_province="MA",
        )
        result = assess_geography(
            expected=BOSTON, catalog_destinations=CATALOG, signals=signals
        )
        self.assertTrue(result["conflictsWithExpected"])
        self.assertEqual(result["disposition"], "moved")
        self.assertEqual(result["citySlug"], "portland")
        self.assertEqual(result["stateSlug"], "maine")

    def test_chicago_street_address_stays_chicago(self):
        chicago = {
            "city": "Chicago",
            "state": "Illinois",
            "citySlug": "chicago",
            "stateSlug": "illinois",
        }
        signals = collect_place_signals(
            meeting="111 S Michigan Ave Chicago, IL US 60603",
            title="Art Institute of Chicago Skip-the-Line Tour",
        )
        result = assess_geography(
            expected=chicago, catalog_destinations=CATALOG, signals=signals
        )
        self.assertFalse(result["conflictsWithExpected"])
        self.assertEqual(result["disposition"], "keep")
        self.assertEqual(result["citySlug"], "chicago")
        self.assertEqual(result["stateSlug"], "illinois")

    def test_miami_beach_meeting_point_moves_off_chicago_bucket(self):
        chicago = {
            "city": "Chicago",
            "state": "Illinois",
            "citySlug": "chicago",
            "stateSlug": "illinois",
        }
        catalog = {
            **CATALOG,
            ("florida", "miami-beach"): {
                "city": "Miami Beach",
                "state": "Florida",
                "citySlug": "miami-beach",
                "stateSlug": "florida",
            },
        }
        signals = collect_place_signals(
            meeting="Caffe Umbria, 959 West Ave Suite 1, Miami Beach, FL 33139",
            title="Miami Beach Ultimate City Bike Tour",
        )
        result = assess_geography(
            expected=chicago, catalog_destinations=catalog, signals=signals
        )
        self.assertTrue(result["conflictsWithExpected"])
        self.assertEqual(result["disposition"], "moved")
        self.assertEqual(result["citySlug"], "miami-beach")
        self.assertEqual(result["stateSlug"], "florida")

    def test_street_address_in_boston_stays_boston(self):
        for meeting in (
            "103 Atlantic Avenue, Boston, MA",
            "60 Rowes Wharf Boston, Massachusetts",
            "Faneuil Hall Boston, MA",
            "Downtown Boston, Massachusetts",
            "1 Tyler Street Boston, Massachusetts",
        ):
            signals = collect_place_signals(meeting=meeting)
            result = assess_geography(
                expected=BOSTON, catalog_destinations=CATALOG, signals=signals
            )
            self.assertEqual(result["disposition"], "keep", meeting)
            self.assertFalse(result["conflictsWithExpected"], meeting)
            self.assertEqual(result["citySlug"], "boston", meeting)

    def test_same_state_itinerary_mention_does_not_exclude(self):
        signals = collect_place_signals(
            title="Boston and North East Coast Explorer - 4 Day Experience",
            description="The route continues in Plymouth, Massachusetts after leaving Boston.",
            start_city="Boston",
            start_province="MA",
        )
        result = assess_geography(
            expected=BOSTON, catalog_destinations=CATALOG, signals=signals
        )
        self.assertEqual(result["disposition"], "keep")
        self.assertFalse(result["conflictsWithExpected"])

    def test_cambridge_meeting_stays_in_boston_area(self):
        signals = collect_place_signals(meeting="Harvard Square, Cambridge, MA")
        result = assess_geography(
            expected=BOSTON, catalog_destinations=CATALOG, signals=signals
        )
        self.assertFalse(result["conflictsWithExpected"])
        self.assertEqual(result["disposition"], "keep")
        self.assertEqual(result["citySlug"], "boston")

    def test_company_office_does_not_override_out_of_area_activity(self):
        signals = collect_place_signals(
            item_location="Portland, Maine",
            start_city="Boston",
            start_province="MA",
        )
        result = assess_geography(
            expected=BOSTON, catalog_destinations=CATALOG, signals=signals
        )
        self.assertEqual(result["disposition"], "moved")
        self.assertEqual(result["place"]["weight"], "strong")


class EditorialRulesTest(unittest.TestCase):
    def test_process_commentary_is_rejected(self):
        text = (
            "Guest ratings are omitted on this page. Promotional inclusion lists are omitted. "
            "Any published fare appears only in the facts panel."
        )
        errors = editorial_errors(text, expected_city="Boston")
        self.assertTrue(any("process commentary" in item for item in errors))

    def test_boston_inference_is_rejected_when_geography_conflicts(self):
        text = "This bicycle outing lasts 3.5 hours and takes place in Boston, Massachusetts."
        errors = editorial_errors(
            text,
            expected_city="Boston",
            geography={"conflictsWithExpected": True},
        )
        self.assertTrue(any("locates the outing in Boston" in item for item in errors))

    def test_heading_fragments_are_not_natural_place_names(self):
        source = "##About\nNestled in the woods of the Northeast Kingdom"
        self.assertFalse(is_natural_place_name("About Nestled", source))
        self.assertFalse(is_natural_place_name("Hours About Available", "9 Hours About Available in English"))
        self.assertTrue(is_natural_place_name("Camp Wapanacki", "Camp Wapanacki was founded in 1938."))

    def test_travel_time_is_not_activity_duration(self):
        self.assertIsNone(
            normalize_activity_duration(
                "3.5 hours from Boston",
                "Wapanacki is located 3.5 hours from Boston on 230 acres.",
            )
        )
        self.assertEqual(normalize_activity_duration("3 hours", None), "3 hours")
        self.assertIsNone(normalize_activity_duration("Varies", None))


if __name__ == "__main__":
    unittest.main()
