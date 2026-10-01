#!/usr/bin/env python3
"""Perceptual hero/gallery duplicate detection."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from image_integrity import (
    classify_pair,
    fingerprint,
    hero_gallery_duplicate_errors,
    is_near_duplicate,
    select_visible_gallery,
    solid_rgb,
    write_synthetic_rgb,
)


class ImageIntegrityTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.cache = Path(self.tmp.name) / "cache"
        self.cache.mkdir()
        self.red = write_synthetic_rgb(Path(self.tmp.name) / "red.ppm", solid_rgb(220, 30, 30))
        self.red_copy = write_synthetic_rgb(
            Path(self.tmp.name) / "red-copy.ppm", solid_rgb(220, 30, 30)
        )
        near = bytearray(solid_rgb(220, 30, 30))
        near[0] = 210
        near[1] = 28
        near[2] = 28
        self.red_near = write_synthetic_rgb(Path(self.tmp.name) / "red-near.ppm", bytes(near))
        self.blue = write_synthetic_rgb(Path(self.tmp.name) / "blue.ppm", solid_rgb(20, 40, 210))

    def tearDown(self):
        self.tmp.cleanup()

    def test_identical_frames_are_near_duplicates(self):
        hero = fingerprint(str(self.red), cache_dir=self.cache)
        other = fingerprint(str(self.red_copy), cache_dir=self.cache)
        comparison = classify_pair(hero, other)
        self.assertEqual(comparison["differenceHashDistanceFromHero"], 0)
        self.assertLess(comparison["normalizedPixelMeanAbsoluteErrorFromHero"], 0.001)
        self.assertTrue(is_near_duplicate(comparison))

    def test_near_identical_noise_is_still_a_duplicate(self):
        hero = fingerprint(str(self.red), cache_dir=self.cache)
        other = fingerprint(str(self.red_near), cache_dir=self.cache)
        comparison = classify_pair(hero, other)
        self.assertLessEqual(comparison["differenceHashDistanceFromHero"], 10)
        self.assertLessEqual(comparison["normalizedPixelMeanAbsoluteErrorFromHero"], 0.05)
        self.assertTrue(is_near_duplicate(comparison))

    def test_different_colors_are_distinct(self):
        hero = fingerprint(str(self.red), cache_dir=self.cache)
        other = fingerprint(str(self.blue), cache_dir=self.cache)
        comparison = classify_pair(hero, other)
        self.assertGreater(comparison["normalizedPixelMeanAbsoluteErrorFromHero"], 0.05)
        self.assertEqual(comparison["classification"], "DISTINCT_HARVESTED_PRODUCT_IMAGE")

    def test_select_visible_gallery_keeps_already_distinct_image(self):
        gallery, audit = select_visible_gallery(
            str(self.red),
            [str(self.blue)],
            cache_dir=self.cache,
        )
        self.assertEqual(gallery, [str(self.blue)])
        self.assertEqual(audit["action"], "kept")

    def test_select_visible_gallery_substitutes_distinct_image(self):
        gallery, audit = select_visible_gallery(
            str(self.red),
            [str(self.red_copy), str(self.blue)],
            cache_dir=self.cache,
        )
        self.assertEqual(gallery, [str(self.blue)])
        self.assertEqual(audit["action"], "substituted")

    def test_select_visible_gallery_removes_when_only_duplicates_exist(self):
        gallery, audit = select_visible_gallery(
            str(self.red),
            [str(self.red_copy), str(self.red_near)],
            cache_dir=self.cache,
        )
        self.assertEqual(gallery, [])
        self.assertEqual(audit["action"], "removed")

    def test_validator_rejects_perceptual_duplicate_gallery(self):
        errors = hero_gallery_duplicate_errors(
            str(self.red),
            [str(self.red_near)],
            cache_dir=self.cache,
        )
        self.assertTrue(any("perceptual duplicate" in item for item in errors))
        self.assertEqual(
            hero_gallery_duplicate_errors(
                str(self.red),
                [str(self.blue)],
                cache_dir=self.cache,
            ),
            [],
        )


if __name__ == "__main__":
    unittest.main()
