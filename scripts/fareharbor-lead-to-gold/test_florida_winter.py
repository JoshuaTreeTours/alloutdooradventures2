#!/usr/bin/env python3
"""Selection rules for the Florida winter FareHarbor tranche."""

from __future__ import annotations

import unittest

from florida_winter import apply_winter_cohort, winter_cohort_decision


def decide(title: str, tags: list[str] | None = None) -> tuple[bool, str]:
    return winter_cohort_decision(
        {
            "title": title,
            "tags": tags or [],
            "categories": [],
            "primaryDisplayCategory": "",
        }
    )


class FloridaWinterCohortTest(unittest.TestCase):
    def test_keeps_priority_experiences(self) -> None:
        for title in [
            "Private Everglades Airboat Tour",
            "Morning 2-Tank Dive: Vandenberg Wreck",
            "Inshore Nearshore Fishing Charter",
            "Miami Beach Bikes, Bites & Views Food Tour (Adults Only)",
            "Dolphin Spotting Sail",
            "Private Snorkel Adventure",
            "Mangrove Wilderness Boat Tour",
            "SIX FINS KEY WEST: 2-HOUR FLAGSHIP GUIDED JET SKI TOUR",
            "Las Olas Coffee, Snacks & Shops Tour",
            "Ferreti Destiny 85 ft",
        ]:
            keep, reason = decide(title)
            self.assertTrue(keep, title)
            self.assertIn(reason, {"winter-priority-experience", "private-yacht"})

    def test_withholds_rentals_admissions_and_off_priority(self) -> None:
        withheld = [
            "Miami Beach Bike Rentals",
            "All Day Jet Ski Rental",
            "1 Hour ATV Tour",
            "General Admission",
            "Kennedy Space Center Transportation ONLY",
            "Open Water Diver - Sarasota",
            "2 Hour Kayak / Canoe Rental",
            "South Beach Segway Tour",
            "17' Boston Whaler Yacht Tender",
            "Venice Louisiana Marsh fishing",
            "Electric Bike Tour in South Beach",
        ]
        for title in withheld:
            keep, reason = decide(title)
            self.assertFalse(keep, title)
            self.assertNotEqual(reason, "winter-priority-experience")

    def test_boat_combo_is_not_dropped_for_a_free_rental_upsell(self) -> None:
        keep, _reason = decide(
            "Miami Boat Tour with FREE South Beach Bicycle Rental",
            ["Boat Tour"],
        )
        self.assertTrue(keep)

    def test_stage_b_proof_item_is_not_published_twice(self) -> None:
        selected = apply_winter_cohort(
            "orlando",
            [
                {
                    "itemId": "333279",
                    "title": "Date Night Neon Glow Clear Kayak or Paddleboard & Champagne Orlando",
                    "tags": ["Kayak"],
                    "categories": [],
                    "primaryDisplayCategory": "",
                }
            ],
        )
        self.assertEqual(selected, [])


if __name__ == "__main__":
    unittest.main()
