#!/usr/bin/env python3
"""Authoritative FareHarbor source priority for city migrations.

INSUFFICIENT_SOURCE_CONTENT is used only after these sources are exhausted:

1. structured product description
2. booking/details content (item content description, booking notes, headline)
3. itinerary, inclusions, and other logistics fields

A second-person or marketing-laden description still counts as source. Editorial
rewrites it; it is not treated as missing.
"""

from __future__ import annotations

import re

from build_stage_b_proof import clean_text, list_values

SOURCE_PRIORITY = (
    "structured_description",
    "booking_details_content",
    "itinerary_inclusions_logistics",
)

ITINERARY_NOISE = {
    "pick ups",
    "pick up",
    "pickup",
    "pickups",
    "drop offs",
    "drop off",
    "dropoffs",
    "tour begin",
    "tour begins",
    "tour start",
    "tour starts",
    "tour end",
    "tour ends",
    "tour ends/drop offs",
    "lunch break",
    "lunch",
    "free time",
    "breaks",
    "break",
    "return",
    "returns",
}
ITINERARY_DURATION_PREFIX = re.compile(
    r"^(?:\d+(?:\.\d+)?\s*(?:min|mins|minutes|hr|hrs|hours?)\s*-+\s*)",
    re.I,
)
ITINERARY_LOGISTICS_RE = re.compile(
    r"located across|guest information|consider to bring|departing location|"
    r"paid public parking|full guest|bring consider|world war ii\b|"
    r"^bring\b",
    re.I,
)

MIN_DESCRIPTION_WORDS = 40
MIN_FULL_EDITORIAL_WORDS = 100
MIN_ITINERARY_STOPS = 3
_LOGISTICS_SOURCE_RE = re.compile(
    r"\b("
    r"please|what to bring|meet your guide|meeting place|gratuity|tip|"
    r"driver's license|passport|check-?in|hours early|full refund|"
    r"nearest mbta|finding your guide|comfortable shoes|dress for|"
    r"filestackcontent|thank you for booking|description of image|"
    r"parking|metal detector|security wand|not included|stroller|"
    r"recording will be emailed|virtual experience|feel free|bring a"
    r")\b|@|https?://",
    re.I,
)


def count_words(parts: list[str] | str) -> int:
    if isinstance(parts, str):
        parts = [parts]
    return len(re.findall(r"[A-Za-z0-9']+", " ".join(parts)))


def substantial_text(value: str | None, *, min_words: int = 12) -> str:
    text = clean_text(value or "")
    if count_words([text]) < min_words:
        return ""
    return text


def _place_from_itinerary_line(text: str) -> str:
    """Keep the place name. Drop the caption after a colon and step labels."""
    if ":" not in text:
        return text
    left, right = re.split(r"\s*:\s*", text, maxsplit=1)
    left = left.strip(" .-")
    right = right.strip(" .-")
    if re.match(r"^(?:stop|step)\s*\d+$", left, re.I):
        if re.match(
            r"^(?:hear|party|watch|enjoy|sample|see|visit|learn|dance|make|take)\b",
            right,
            re.I,
        ):
            return ""
        return right
    return left


def itinerary_stops(value) -> list[str]:
    stops = []
    seen = set()
    for item in list_values(value):
        text = ITINERARY_DURATION_PREFIX.sub("", clean_text(item)).strip(" .-")
        text = _place_from_itinerary_line(text)
        if not text:
            continue
        key = text.lower()
        if key in ITINERARY_NOISE or key in seen:
            continue
        if re.match(r"^(pick|drop|lunch|break|start|end|transfer)\b", key):
            continue
        if re.search(r"\b(travel time|snorkel time|return to shore)\b", key):
            continue
        if re.match(r"^(dive again|gear up|hop in)\b", key):
            continue
        if re.fullmatch(
            r"(monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?",
            key,
        ):
            continue
        if ITINERARY_LOGISTICS_RE.search(key):
            continue
        if re.search(r"\b(duration|terrain|about|highlights|information)\s*$", key):
            continue
        if key in {"views", "snorkeling", "snorkel"}:
            continue
        if re.search(
            r"\b(flight options|introductory dive|certified dive|"
            r"pre-course|week \d|knowledge sessions|briefing|training day)\b",
            key,
        ):
            continue
        seen.add(key)
        stops.append(text)
    return stops


def choose_description(structured: dict, content: dict) -> tuple[str, str]:
    structured_desc = substantial_text(structured.get("description"), min_words=12)
    content_desc = substantial_text(content.get("description"), min_words=12)
    if structured_desc and count_words([structured_desc]) >= MIN_DESCRIPTION_WORDS:
        return structured_desc, SOURCE_PRIORITY[0]
    if content_desc:
        return content_desc, SOURCE_PRIORITY[1]
    if structured_desc:
        return structured_desc, SOURCE_PRIORITY[0]
    return "", ""


def collect_authoritative_source(content: dict, structured: dict, item: dict | None = None) -> dict:
    """Merge FareHarbor payloads in priority order. Does not invent fields."""
    content = content or {}
    structured = structured or {}
    item = item or {}
    description, source_used = choose_description(structured, content)
    details_bits = []
    for blob in (
        content.get("booking_notes"),
        structured.get("booking_notes"),
        content.get("check_in_details"),
        structured.get("check_in_details"),
        content.get("headline"),
        item.get("headline"),
        structured.get("headline"),
    ):
        text = clean_text(blob or "")
        if not text or count_words([text]) < 4:
            continue
        if re.search(
            r"@|thank you for booking|your wedding|reached directly|"
            r"\b\d{3}[-.)]\s*\d{3}[-.)]\s*\d{4}\b",
            text,
            re.I,
        ):
            continue
        details_bits.append(text)
    itinerary = itinerary_stops(content.get("itinerary")) or itinerary_stops(
        structured.get("itinerary")
    )
    if not source_used:
        if details_bits and count_words(details_bits) >= MIN_DESCRIPTION_WORDS:
            source_used = SOURCE_PRIORITY[1]
        elif itinerary:
            source_used = SOURCE_PRIORITY[2]
    return {
        "description": description,
        "detailsText": " ".join(details_bits),
        "itinerary": itinerary[:18],
        "sourceUsed": source_used or "",
        "structuredDescriptionWords": count_words(
            [clean_text(structured.get("description") or "")]
        ),
        "contentDescriptionWords": count_words([clean_text(content.get("description") or "")]),
        "itineraryStopCount": len(itinerary),
    }


def prose_for_overlap(source: dict) -> str:
    """Operator prose only. Lists are restatable facts, not overlap haystack."""
    return " ".join(
        part
        for part in (
            source.get("description") or "",
            source.get("detailsText") or "",
        )
        if part
    )


def _source_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!])\s+(?=[A-Z])", clean_text(text or ""))
    return [part.strip() for part in parts if part.strip()]


def _is_logistics_source(sentence: str) -> bool:
    if not _LOGISTICS_SOURCE_RE.search(sentence or ""):
        return False
    if count_words([sentence]) >= 30 and re.search(
        r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}\b", sentence
    ):
        return False
    return True


def experience_source_words(source: dict, facts: dict | None = None) -> int:
    """Words of experience prose, stops, and inclusions available to rewrite.

    Logistics, meeting instructions, and private booking notes do not count.
    """
    facts = facts or {}
    seen = set()
    chunks: list[str] = []
    for blob in (
        source.get("description"),
        facts.get("description"),
    ):
        for sentence in _source_sentences(blob or ""):
            key = sentence.lower()
            if key in seen or _is_logistics_source(sentence):
                continue
            if count_words([sentence]) < 6:
                continue
            seen.add(key)
            chunks.append(sentence)
    for stop in source.get("itinerary") or facts.get("itinerary") or []:
        text = clean_text(stop)
        key = text.lower()
        if text and key not in seen:
            seen.add(key)
            chunks.append(text)
    for item in list(facts.get("included") or []) + list(facts.get("highlights") or []):
        text = clean_text(item)
        key = text.lower()
        if not text or key in seen or _is_logistics_source(text):
            continue
        if count_words([text]) < 2:
            continue
        seen.add(key)
        chunks.append(text)
    return count_words(chunks)


def source_can_support_full_editorial(source: dict, facts: dict | None = None) -> bool:
    """True when authoritative FareHarbor material can support 100 words of prose."""
    return experience_source_words(source, facts) >= MIN_FULL_EDITORIAL_WORDS


def source_supports_editorial(source: dict, facts: dict | None = None) -> bool:
    facts = facts or {}
    description = source.get("description") or facts.get("description") or ""
    details = source.get("detailsText") or ""
    if count_words([description]) >= MIN_DESCRIPTION_WORDS:
        return True
    if count_words([details]) >= MIN_DESCRIPTION_WORDS:
        return True
    if count_words([description, details]) >= MIN_DESCRIPTION_WORDS:
        return True
    stops = source.get("itinerary") or facts.get("itinerary") or []
    if len(itinerary_stops(stops) if isinstance(stops, (list, str)) else stops) >= MIN_ITINERARY_STOPS:
        return True
    highlights = facts.get("highlights") or []
    if len([item for item in highlights if count_words([item]) >= 2]) >= 3:
        return True
    included = facts.get("included") or []
    place_like = [
        item
        for item in included
        if re.search(r"\b([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,4})\b", item or "")
    ]
    if len(place_like) >= 3:
        return True
    return False
