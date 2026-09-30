#!/usr/bin/env python3
"""Customer-facing editorial voice for FareHarbor city migrations.

This is the reusable description model. It writes natural travel copy from
harvested facts only. Template sentences such as "named places include" are
not used. Geography, price, schema-graph, terminal, and merchant-feed rules
stay elsewhere.

The first Boston pass applies this voice to a 10-product sample only.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

IMPLEMENTATION_PHRASES = (
    "named places",
    "short route labels",
    "short listed inclusions",
    "short listed exclusions",
    "short listed items to bring",
    "published cancellation note",
    "published group size",
    "published age limits",
    "source-backed",
    "stored outing",
    "facts panel",
    "product-level",
    "price not found",
    "price-preview",
    "listed operator",
    "takes place in",
    "guided outing lasts",
    "this guided outing",
    "this harbor outing",
    "this walking tour lasts",
    "this bicycle outing",
)

EDITORIAL_PROMPT = """
Write customer-facing travel editorial for one FareHarbor product.

Voice:
- Natural third-person travel writing for a guest deciding whether to go.
- 2 to 4 short paragraphs when the harvest supports it; fewer when it does not.
- Lead with what the guest actually does, sees, eats, or sails past.
- Weave specific place names into sentences. Do not dump lists.
- Keep meeting-point street addresses out of the body when they belong on the facts panel.
- Keep ticket prices, fares, and dollar amounts out of the body.
- Logistics (duration, group size, age floor, rain policy, what is included) come after the experience, and only when the harvest states them.
- If the harvest is thin, write less. Do not pad.

Hard limits:
- Use only facts present in the harvest packet. Do not invent attractions, schedules, amenities, history, or claims.
- Do not use second person (you, your, we, our).
- Do not use marketing superlatives (enjoy, iconic, stunning, unforgettable, world-class, famous, best).
- Do not explain omitted data, ratings, schema, pricing behavior, or migration logic.
- Do not use implementation language: named places, short route labels, short listed inclusions, published cancellation note, source-backed, stored, facts panel, product-level, price not found.
- Schema description: 1 to 3 sentences, shorter than the body, same facts, no implementation language.
- Highlights: up to 3 short guest-facing phrases, not labels about the data model.
"""


def load_editorial_sample(path: Path) -> dict[str, dict]:
    if not path.exists():
        return {}
    payload = json.loads(path.read_text())
    return payload.get("products") or payload


def implementation_language_errors(text: str) -> list[str]:
    lowered = (text or "").lower()
    return [
        f"implementation language: {phrase}"
        for phrase in IMPLEMENTATION_PHRASES
        if phrase in lowered
    ]


def editorial_voice_errors(paragraphs: list[str], highlights: list[str], schema: str) -> list[str]:
    text = " ".join([*(paragraphs or []), *(highlights or []), schema or ""])
    errors = implementation_language_errors(text)
    count = len([part for part in (paragraphs or []) if part.strip()])
    if count > 4:
        errors.append(f"editorial has {count} paragraphs; keep 2-4 or fewer")
    if count < 1:
        errors.append("editorial is missing")
    return errors


def apply_editorial_overlay(product: dict, overlay: dict | None) -> dict:
    if not overlay:
        return product
    paragraphs = list(overlay.get("paragraphs") or [])
    highlights = list(overlay.get("highlights") or [])
    schema = (overlay.get("schemaDescription") or "").strip()
    if not paragraphs:
        return product
    product["paragraphs"] = paragraphs
    product["highlights"] = highlights
    if schema:
        product["schemaDescription"] = schema
    if overlay.get("removedClaims"):
        product["removedClaims"] = list(overlay["removedClaims"])
    product["wordCount"] = len(re.findall(r"[A-Za-z0-9']+", " ".join(paragraphs)))
    return product
