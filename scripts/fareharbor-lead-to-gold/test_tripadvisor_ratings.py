#!/usr/bin/env python3
"""The TripAdvisor rating parser must not infer a score from bubble art."""

from __future__ import annotations

import unittest

from tripadvisor_ratings import (
    google_review_pair,
    parse_tripadvisor_rating,
    ratings_payload_item_id,
)


PATRIOT = {
    "ratings": {
        "tripadvisor": {
            "rating_image_url": (
                "https://www.tripadvisor.com/img/cdsi/img2/ratings/traveler/4.5-70260-4.png"
            ),
            "rating": 4.7,
            "cached_at": "2026-09-29T12:11:46+0000",
            "num_reviews": 1645,
        },
        "item": {"name": "Boston History Harbor Tour aboard Yacht Patriot"},
    }
}


class TripadvisorRatingParserTest(unittest.TestCase):
    def test_reads_numeric_fields_and_ignores_the_bubble_filename(self):
        self.assertEqual(
            parse_tripadvisor_rating(PATRIOT),
            {
                "ratingValue": 4.7,
                "reviewCount": 1645,
                "provider": "TripAdvisor",
            },
        )

    def test_accepts_the_widget_camel_case_review_count(self):
        payload = {
            "ratings": {
                "tripadvisor": {
                    "rating": 5,
                    "numReviews": 12,
                    "ratingImageUrl": "https://example.test/4.0.png",
                }
            }
        }
        self.assertEqual(
            parse_tripadvisor_rating(payload),
            {"ratingValue": 5, "reviewCount": 12, "provider": "TripAdvisor"},
        )

    def test_rejects_missing_zero_and_non_numeric_pairs(self):
        self.assertIsNone(parse_tripadvisor_rating({}))
        self.assertIsNone(parse_tripadvisor_rating({"ratings": {}}))
        self.assertIsNone(
            parse_tripadvisor_rating(
                {"ratings": {"tripadvisor": {"rating": 0, "num_reviews": 10}}}
            )
        )
        self.assertIsNone(
            parse_tripadvisor_rating(
                {"ratings": {"tripadvisor": {"rating": 4.5, "num_reviews": 0}}}
            )
        )
        self.assertIsNone(
            parse_tripadvisor_rating(
                {"ratings": {"tripadvisor": {"rating": "4.7", "num_reviews": 1645}}}
            )
        )
        self.assertIsNone(
            parse_tripadvisor_rating(
                {"ratings": {"tripadvisor": {"rating": 4.7, "num_reviews": 10.5}}}
            )
        )

    def test_does_not_substitute_google_reviews(self):
        payload = {
            "ratings": {
                "google_reviews": {"rating": 4.9, "user_ratings_total": 80}
            }
        }
        self.assertIsNone(parse_tripadvisor_rating(payload))
        self.assertEqual(
            google_review_pair(payload),
            {"ratingValue": 4.9, "reviewCount": 80},
        )
        combined = {
            "ratings": {
                **PATRIOT["ratings"],
                "google_reviews": {"rating": 4.2, "user_ratings_total": 9},
            }
        }
        parsed = parse_tripadvisor_rating(combined)
        self.assertEqual(parsed["ratingValue"], 4.7)
        self.assertEqual(parsed["reviewCount"], 1645)
        self.assertEqual(parsed["provider"], "TripAdvisor")

    def test_item_pk_is_readable_without_changing_the_tripadvisor_parser(self):
        payload = {
            "ratings": {
                "item": {"pk": 587300},
                "google_reviews": {"rating": 5.0, "user_ratings_total": 373},
            }
        }
        self.assertEqual(ratings_payload_item_id(payload), "587300")
        self.assertIsNone(parse_tripadvisor_rating(payload))
        self.assertEqual(
            google_review_pair(payload),
            {"ratingValue": 5, "reviewCount": 373},
        )
        self.assertIsNone(ratings_payload_item_id({"ratings": {"tripadvisor": {}}}))


if __name__ == "__main__":
    unittest.main()
