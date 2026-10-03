#!/usr/bin/env python3
"""Perceptual hero/gallery duplicate detection for FareHarbor migrations.

Reuses the Stage B 145208 method: ffmpeg decode, 128x128 center-cropped RGB,
16x16 difference hash (256 bits), and mean absolute error. A gallery image is
NEAR_DUPLICATE of the hero when the hashes match, Hamming distance is <= 10,
or MAE is <= 0.05. Compare pixels, not URLs.
"""

from __future__ import annotations

import hashlib
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

FILESTACK_RE = re.compile(r"https://cdn\.filestackcontent\.com/([A-Za-z0-9]+)")
HARVEST_IMAGE_RE = re.compile(
    r"https://(?:cdn\.filestackcontent\.com|www\.filepicker\.io/api/file|cdn\.filepicker\.io/api/file)/([A-Za-z0-9]+)"
)


def _is_harvest_image_url(url: str) -> bool:
    return bool(HARVEST_IMAGE_RE.search(url or ""))


FRAME_SIZE = 128
FRAME_BYTES = FRAME_SIZE * FRAME_SIZE * 3
DHASH_SIZE = 16
NEAR_DUPLICATE_HAMMING = 10
NEAR_DUPLICATE_MAE = 0.05
CACHE_DIR = Path("/tmp/fareharbor-image-hash-cache")
FFMPEG_TIMEOUT_US = 20_000_000


def image_url(image) -> str:
    if isinstance(image, str):
        return image.strip()
    if not isinstance(image, dict):
        return ""
    for key in ("image_cdn_url", "image_url", "url", "image", "cropped_cdn_url"):
        value = image.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return ""


def bound_item_id(image) -> str | None:
    """Item id stamped on a harvest image, or None when the image is unbound."""
    if not isinstance(image, dict):
        return None
    item = image.get("item")
    if isinstance(item, dict) and item.get("pk") is not None:
        return str(item.get("pk"))
    uri = str(item.get("uri") or "") if isinstance(item, dict) else ""
    uri = uri or str(image.get("uri") or "")
    match = re.search(r"/items/(\d+)(?:/|$)", uri)
    return match.group(1) if match else None


def item_owned_image_urls(payloads: list, item_id: str) -> list[str]:
    """Filestack URLs that belong to this item, in first-seen order.

    An image whose payload names a different item is dropped. Unbound URLs are
    kept because the caller already loaded this item's harvest folder.
    """
    urls: list[str] = []
    seen: set[str] = set()
    wanted = str(item_id)
    for payload in payloads:
        if not isinstance(payload, dict):
            continue
        for image in payload.get("images") or []:
            bound = bound_item_id(image)
            if bound and bound != wanted:
                continue
            url = image_url(image)
            if not url or url in seen or not _is_harvest_image_url(url):
                continue
            seen.add(url)
            urls.append(url)
    return urls


def filestack_handle(url: str | None) -> str | None:
    if not url:
        return None
    match = FILESTACK_RE.search(url)
    return match.group(1) if match else None


def cache_key(url: str) -> str:
    handle = filestack_handle(url)
    if handle:
        return handle
    return hashlib.sha256(url.encode("utf-8")).hexdigest()[:32]


def _run_ffmpeg(source: str, dest: Path) -> None:
    cmd = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-rw_timeout",
        str(FFMPEG_TIMEOUT_US),
        "-y",
        "-i",
        source,
        "-vf",
        f"scale={FRAME_SIZE}:{FRAME_SIZE}:force_original_aspect_ratio=increase,crop={FRAME_SIZE}:{FRAME_SIZE}",
        "-frames:v",
        "1",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        str(dest),
    ]
    subprocess.run(cmd, check=True, capture_output=True, timeout=45)


def normalize_rgb(source: str, *, cache_dir: Path | None = None) -> bytes | None:
    """Return 128x128 center-cropped RGB bytes, or None if decode fails."""
    cache_dir = cache_dir or CACHE_DIR
    cache_dir.mkdir(parents=True, exist_ok=True)
    dest = cache_dir / f"{cache_key(source)}.rgb"
    if dest.exists() and dest.stat().st_size == FRAME_BYTES:
        return dest.read_bytes()
    try:
        if source.startswith(("http://", "https://")):
            _run_ffmpeg(source, dest)
        else:
            _run_ffmpeg(source, dest)
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, OSError):
        if dest.exists():
            dest.unlink(missing_ok=True)
        return None
    if not dest.exists() or dest.stat().st_size != FRAME_BYTES:
        if dest.exists():
            dest.unlink(missing_ok=True)
        return None
    return dest.read_bytes()


def grayscale_pixels(rgb: bytes) -> list[int]:
    pixels = []
    for index in range(0, len(rgb), 3):
        red, green, blue = rgb[index], rgb[index + 1], rgb[index + 2]
        pixels.append(int(0.299 * red + 0.587 * green + 0.114 * blue))
    return pixels


def resize_gray(pixels: list[int], src_w: int, src_h: int, dst_w: int, dst_h: int) -> list[int]:
    out = []
    for y in range(dst_h):
        y0 = int(y * src_h / dst_h)
        y1 = max(y0 + 1, int((y + 1) * src_h / dst_h))
        for x in range(dst_w):
            x0 = int(x * src_w / dst_w)
            x1 = max(x0 + 1, int((x + 1) * src_w / dst_w))
            total = 0
            count = 0
            for row in range(y0, y1):
                start = row * src_w
                for col in range(x0, x1):
                    total += pixels[start + col]
                    count += 1
            out.append(total // count if count else 0)
    return out


def dhash_bits(rgb: bytes) -> list[int]:
    gray = grayscale_pixels(rgb)
    sampled = resize_gray(gray, FRAME_SIZE, FRAME_SIZE, DHASH_SIZE + 1, DHASH_SIZE)
    bits = []
    width = DHASH_SIZE + 1
    for y in range(DHASH_SIZE):
        row = sampled[y * width : (y + 1) * width]
        for x in range(DHASH_SIZE):
            bits.append(1 if row[x] > row[x + 1] else 0)
    return bits


def dhash_hex(bits: list[int]) -> str:
    value = 0
    for bit in bits:
        value = (value << 1) | bit
    return f"{value:064x}"


def hamming_distance(left: list[int], right: list[int]) -> int:
    return sum(a != b for a, b in zip(left, right))


def mean_absolute_error(left: bytes, right: bytes) -> float:
    if not left or not right or len(left) != len(right):
        return 1.0
    total = 0
    for a, b in zip(left, right):
        total += abs(a - b)
    return total / (len(left) * 255.0)


def fingerprint(source: str, *, cache_dir: Path | None = None) -> dict | None:
    rgb = normalize_rgb(source, cache_dir=cache_dir)
    if rgb is None:
        return None
    bits = dhash_bits(rgb)
    return {
        "url": source,
        "handle": filestack_handle(source),
        "pixelSha256": hashlib.sha256(rgb).hexdigest(),
        "dhash": dhash_hex(bits),
        "dhashBits": bits,
        "rgb": rgb,
    }


def classify_pair(hero: dict, other: dict) -> dict:
    distance = hamming_distance(hero["dhashBits"], other["dhashBits"])
    mae = mean_absolute_error(hero["rgb"], other["rgb"])
    exact = hero["pixelSha256"] == other["pixelSha256"]
    near = exact or mae <= NEAR_DUPLICATE_MAE or (
        distance <= NEAR_DUPLICATE_HAMMING and mae <= 0.10
    )
    return {
        "url": other["url"],
        "handle": other.get("handle"),
        "pixelSha256": other["pixelSha256"],
        "differenceHashDistanceFromHero": distance,
        "normalizedPixelMeanAbsoluteErrorFromHero": round(mae, 5),
        "classification": "NEAR_DUPLICATE" if near else "DISTINCT_HARVESTED_PRODUCT_IMAGE",
    }


def is_near_duplicate(comparison: dict) -> bool:
    return comparison.get("classification") == "NEAR_DUPLICATE"


def prefetch(urls: list[str], *, cache_dir: Path | None = None, workers: int = 8) -> None:
    unique = list(dict.fromkeys(url for url in urls if url))
    if not unique:
        return
    workers = max(1, min(workers, len(unique)))
    with ThreadPoolExecutor(max_workers=workers) as pool:
        list(pool.map(lambda url: fingerprint(url, cache_dir=cache_dir), unique))


def select_visible_gallery(
    hero: str | None,
    harvest_urls: list[str],
    *,
    cache_dir: Path | None = None,
) -> tuple[list[str], dict]:
    """Return at most one harvest image that is perceptually distinct from the hero."""
    audit = {
        "hero": hero,
        "heroHandle": filestack_handle(hero),
        "candidates": [],
        "rejected": [],
        "selected": None,
        "action": "none",
        "reason": "no harvest images",
    }
    candidates = list(dict.fromkeys(url for url in harvest_urls if url))
    if not hero or not candidates:
        return [], audit

    prefetch([hero, *candidates], cache_dir=cache_dir)
    hero_fp = fingerprint(hero, cache_dir=cache_dir)
    if hero_fp is None:
        audit["reason"] = "hero image could not be decoded"
        return [], audit

    hero_handle = filestack_handle(hero)
    skipped_duplicate = False
    for url in candidates:
        row = {"url": url, "handle": filestack_handle(url)}
        if row["handle"] and row["handle"] == hero_handle:
            row["classification"] = "SAME_HANDLE"
            audit["rejected"].append(row)
            continue
        other = fingerprint(url, cache_dir=cache_dir)
        if other is None:
            row["classification"] = "UNREADABLE"
            audit["rejected"].append(row)
            continue
        comparison = classify_pair(hero_fp, other)
        audit["candidates"].append(comparison)
        if is_near_duplicate(comparison):
            skipped_duplicate = True
            audit["rejected"].append(comparison)
            continue
        audit["selected"] = url
        audit["action"] = "substituted" if skipped_duplicate else "kept"
        audit["reason"] = (
            "distinct harvested image after removing a hero duplicate"
            if skipped_duplicate
            else "harvest image is already distinct from the hero"
        )
        return [url], audit

    if skipped_duplicate:
        audit["action"] = "removed"
        audit["reason"] = "harvest images were identical or near-identical to the hero"
    else:
        audit["action"] = "none"
        audit["reason"] = "no distinct harvested image"
    return [], audit


def hero_gallery_duplicate_errors(
    hero: str | None,
    gallery: list[str],
    *,
    cache_dir: Path | None = None,
) -> list[str]:
    errors = []
    visible = [url for url in gallery if url]
    if len(visible) != len(set(visible)):
        errors.append("duplicate gallery image")
    if not hero:
        return errors
    hero_handle = filestack_handle(hero)
    hero_fp = None
    for url in visible:
        if url == hero or (hero_handle and filestack_handle(url) == hero_handle):
            errors.append("gallery image repeats the hero URL or Filestack handle")
            continue
        if hero_fp is None:
            hero_fp = fingerprint(hero, cache_dir=cache_dir)
        other = fingerprint(url, cache_dir=cache_dir)
        if hero_fp is None or other is None:
            errors.append(f"unable to compare gallery image content: {url}")
            continue
        comparison = classify_pair(hero_fp, other)
        if is_near_duplicate(comparison):
            errors.append("gallery image is a perceptual duplicate of the hero")
    return errors


def write_synthetic_rgb(path: Path, rgb: bytes) -> Path:
    """Write a PPM that ffmpeg can decode for tests."""
    path.parent.mkdir(parents=True, exist_ok=True)
    header = f"P6 {FRAME_SIZE} {FRAME_SIZE} 255\n".encode("ascii")
    path.write_bytes(header + rgb)
    return path


def solid_rgb(red: int, green: int, blue: int) -> bytes:
    return bytes([red, green, blue] * (FRAME_SIZE * FRAME_SIZE))
