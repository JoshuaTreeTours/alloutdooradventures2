#!/usr/bin/env python3
"""Customer-facing editorial voice for FareHarbor city migrations.

This is the reusable description model. It writes natural travel copy from
harvested facts only. Template sentences such as "named places include" are
not used. Geography, price, schema-graph, terminal, and merchant-feed rules
stay elsewhere.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from build_stage_b_proof import MARKETING, SECOND_PERSON, clean_text, shingles

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
    "this walking tour takes place",
    "this food walk takes place",
    "this evening walking tour",
)

MECHANICAL_PHRASES = (
    r"\buses the\b",
    r"\btakes in\b",
    r"\bpoint(?:s|ing) out\b",
    r"\bcontinues toward\b",
)

BOILERPLATE_COPY_PHRASES = (
    "the guide leads in",
    "are the packing notes",
    "the packing notes",
    "the published maximum age",
)

FIELD_DUMP_SENTENCE_RE = re.compile(
    r"^(?:"
    r"the guide leads in [^.]+|"
    r"groups are capped at \d+|"
    r"guests must be (?:at least )?\d+ years old|"
    r"guests must be 21 or older|"
    r".{0,90} are the packing notes|"
    r"valid identification is required|"
    r"a full refund is available with at least \d+ hours' notice|"
    r"the published maximum age is .+"
    r")\.?$",
    re.I,
)
LOGISTICS_SENTENCE_RE = re.compile(
    r"\b("
    r"groups (?:are capped at|stay at)|"
    r"guests must be|"
    r"guide leads in|"
    r"packing notes|"
    r"full refund is available|"
    r"valid identification is required|"
    r"held in ordinary rain|"
    r"stroller and wheelchair accessible|"
    r"published maximum age|"
    r"tickets are not refundable"
    r")\b",
    re.I,
)
FRAGMENT_HEADING_RE = re.compile(
    r"^(?:includes?|duration|highlights|about|meeting place|what to bring|"
    r"important details|overview|please note)\b",
    re.I,
)
SENTENCE_VERB_RE = re.compile(
    r"\b("
    r"is|are|was|were|be|been|being|has|have|had|"
    r"sail|sails|pass|passes|see|sees|explore|explores|ride|rides|"
    r"walk|walks|sample|samples|visit|visits|cover|covers|cross|crosses|"
    r"start|starts|leave|leaves|run|runs|offer|offers|include|includes|"
    r"come|comes|move|moves|stay|stays|sit|sits|answer|answers|"
    r"serve|serves|pair|pairs|designed|held|aboard|follows|"
    r"lists|list|require|requires|reach|reaches|ask|asks|asked|"
    r"continue|continues|remain|remains|keep|keeps|built|styled|"
    r"sells|sold|leave|leaves|aimed|covering"
    r")\b",
    re.I,
)
EXPERIENCE_TOKEN_RE = re.compile(
    r"\b("
    r"sail|pass(?:es)?|see|explore|ride|walk|sample|visit|aboard|"
    r"come into view|covers?|cross(?:es|ing)?|neighborhood|schooner|"
    r"yacht|trail|harbor|tasting|chocolate|freedom trail|esplanade"
    r")\b",
    re.I,
)
FOOD_RE = re.compile(
    r"\b("
    r"lobster rolls?|clam chowder|baked beans|boston cream pie|"
    r"cannoli|truffles?|dumplings?|dim sum|chowder|oysters?|"
    r"bean-to-bar chocolate|chocolate tea|belgian tasting"
    r")\b",
    re.I,
)
VESSEL_RE = re.compile(
    r"\b("
    r"Adirondack(?:\s+(?:II|III|IV))?|Northern Lights|Yacht Manhattan|"
    r"Liberty|"
    r"(?:80|115)-foot (?:pilot )?schooners?|"
    r"(?:80|115)-foot motor yacht"
    r")\b",
)
WITHHELD_STATUSES = {
    "SOURCE_NOT_FOUND",
    "BOOKING_PAGE_NOT_FOUND",
    "INSUFFICIENT_SOURCE_CONTENT",
}

EDITORIAL_PROMPT = """
Write customer-facing travel editorial for one FareHarbor product.

Voice:
- Natural third-person travel writing for a guest deciding whether to go.
- Prefer active guest-centered verbs: sail, pass, see, explore, come into view, ride, walk, sample.
- Avoid mechanical verbs: uses, takes in, points out, continues toward.
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

WORD_RE = re.compile(r"[A-Za-z0-9']+")
STREET_RE = re.compile(
    r"\b\d{1,6}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,4}\s+"
    r"(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Place|Pl|Wharf)\b",
    re.I,
)
PLACE_NOISE = {
    "notable sites",
    "local foods",
    "company events",
    "harbor fireworks",
    "fireworks cruise",
    "private charter",
    "coast guard",
    "certified captains",
    "scarano boat",
    "new england",
    "united states",
    "important details",
    "see you soon",
    "what to bring",
    "meeting place",
    "boston skyline",
    "main landmarks",
    "various sites",
    "urban landscape",
    "boston harbor now",
    "walking tours",
    "fireworks display",
}
PROPER_RE = re.compile(r"\b(?:[A-Z][A-Za-z0-9'&-]+(?:\s+[A-Z][A-Za-z0-9'&-]+){1,5})\b")
PLACE_LEAD_STRIP = re.compile(r"^(the|a|an)\s+", re.I)
PLACE_START_BLOCK = {
    "head",
    "join",
    "unwind",
    "cruise",
    "circles",
    "an",
    "during",
    "please",
    "come",
    "visit",
    "explore",
    "guided",
    "walk",
    "see",
    "in",
    "with",
    "crowd",
    "valid",
    "light",
    "the",
    "a",
    "our",
    "your",
}


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


def mechanical_verb_errors(text: str) -> list[str]:
    found = []
    for pattern in MECHANICAL_PHRASES:
        if re.search(pattern, text or "", re.I):
            found.append(f"mechanical verb: {pattern}")
    return found


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!])\s+(?=[A-Z])", (text or "").strip())
    return [part.strip() for part in parts if part.strip()]


def boilerplate_language_errors(text: str) -> list[str]:
    lowered = (text or "").lower()
    return [
        f"boilerplate language: {phrase}"
        for phrase in BOILERPLATE_COPY_PHRASES
        if phrase in lowered
    ]


def field_dump_errors(paragraphs: list[str]) -> list[str]:
    sentences = []
    for paragraph in paragraphs or []:
        sentences.extend(split_sentences(paragraph))
    if not sentences:
        return []
    dumped = [item for item in sentences if FIELD_DUMP_SENTENCE_RE.match(item)]
    if dumped and len(dumped) == len(sentences):
        return ["field-dump style copy: every sentence restates a form field"]
    errors = []
    for item in dumped:
        if re.search(r"guide leads in|packing notes|published maximum age", item, re.I):
            errors.append(f"field-dump sentence: {item}")
    return errors


def fragment_errors(paragraphs: list[str]) -> list[str]:
    errors = []
    for paragraph in paragraphs or []:
        for item in split_sentences(paragraph):
            if FRAGMENT_HEADING_RE.search(item) and len(WORD_RE.findall(item)) <= 6:
                errors.append(f"heading fragment: {item}")
                continue
            words = WORD_RE.findall(item)
            if len(words) >= 4 and not SENTENCE_VERB_RE.search(item):
                errors.append(f"sentence fragment: {item}")
    return errors


def experience_sentences(paragraphs: list[str]) -> list[str]:
    found = []
    for paragraph in paragraphs or []:
        for item in split_sentences(paragraph):
            if not LOGISTICS_SENTENCE_RE.search(item):
                found.append(item)
    return found


def editorial_is_thin(paragraphs: list[str]) -> bool:
    experience = experience_sentences(paragraphs)
    if count_words(experience) < 28:
        return True
    blob = " ".join(experience)
    if not EXPERIENCE_TOKEN_RE.search(blob) and not FOOD_RE.search(blob) and not VESSEL_RE.search(blob):
        return True
    if not re.search(r"\b[A-Z][A-Za-z0-9'&.-]{2,}(?:\s+[A-Z][A-Za-z0-9'&.-]{2,})+\b", blob):
        if not FOOD_RE.search(blob) and not VESSEL_RE.search(blob):
            return True
    return False


def editorial_substance_errors(
    paragraphs: list[str],
    highlights: list[str],
    schema: str,
    *,
    exception: str | None = None,
) -> list[str]:
    errors = editorial_voice_errors(paragraphs, highlights, schema)
    text = " ".join([*(paragraphs or []), *(highlights or []), schema or ""])
    errors.extend(boilerplate_language_errors(text))
    if exception not in WITHHELD_STATUSES:
        errors.extend(fragment_errors(paragraphs))
    if exception in WITHHELD_STATUSES:
        return errors
    errors.extend(field_dump_errors(paragraphs))
    if editorial_is_thin(paragraphs):
        errors.append(
            "editorial lacks minimum experience substance; classify INSUFFICIENT_SOURCE_CONTENT rather than padding"
        )
    return errors


def editorial_voice_errors(paragraphs: list[str], highlights: list[str], schema: str) -> list[str]:
    text = " ".join([*(paragraphs or []), *(highlights or []), schema or ""])
    errors = implementation_language_errors(text)
    errors.extend(mechanical_verb_errors(text))
    errors.extend(boilerplate_language_errors(text))
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
    product["wordCount"] = len(WORD_RE.findall(" ".join(paragraphs)))
    return product


def count_words(parts: list[str] | str) -> int:
    if isinstance(parts, str):
        parts = [parts]
    return len(WORD_RE.findall(" ".join(parts)))


def join_and(items: list[str]) -> str:
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    if len(items) == 2:
        return f"{items[0]} and {items[1]}"
    return ", ".join(items[:-1]) + f", and {items[-1]}"


def sentence(text: str) -> str:
    text = clean_text(text).strip(" .")
    if not text:
        return ""
    if text[-1] not in ".!":
        text += "."
    return text[0].upper() + text[1:]


def duration_adjective(duration: str | None) -> str | None:
    if not duration:
        return None
    text = clean_text(duration)
    if re.search(r"custom", text, re.I):
        return None
    match = re.match(
        r"^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*hours?$", text, re.I
    )
    if match:
        return f"{match.group(1)}- to {match.group(2)}-hour"
    match = re.match(r"^(\d+(?:\.\d+)?)\s*hours?$", text, re.I)
    if match:
        words = {"1": "one", "2": "two", "3": "three", "4": "four"}
        number = match.group(1)
        if number in words:
            return f"{words[number]}-hour"
        return f"{number}-hour"
    match = re.match(r"^(\d+(?:\.\d+)?)\s*minutes?$", text, re.I)
    if match:
        return f"{match.group(1)}-minute"
    match = re.search(
        r"(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?)\s*(hours?|minutes?)", text, re.I
    )
    if match:
        amount, unit = match.group(1), match.group(2).lower()
        unit = "hour" if unit.startswith("hour") else "minute"
        amount = amount.replace(" ", "")
        if "-" in amount:
            left, right = re.split(r"-", amount, maxsplit=1)
            return f"{left}- to {right}-{unit}"
        return f"{amount}-{unit}"
    return None


def activity_phrase(title: str, description: str = "") -> str:
    text = (title or "").lower()
    desc = (description or "").lower()
    if re.search(r"bike|bicycle|cycling|e-bike|scooter", text):
        return "bicycle outing"
    if re.search(r"kayak|paddle|canoe", text):
        return "paddle outing"
    if re.search(r"sail|yacht|cruise|harbor|boat|ferry|schooner|charter|adirondack", text):
        return "harbor outing"
    if re.search(r"food|taste|dumpling|dinner|brunch|lunch|cannoli|beer|wine|chocolate", text) or re.search(
        r"lobster roll|clam chowder|dim sum|food tour|food walk|tastings", desc
    ):
        return "food walk"
    if re.search(r"photo", text):
        return "photography walk"
    if re.search(r"ghost|haunt", text):
        return "evening walking tour"
    if re.search(r"walk|trail|foot|history|heritage|architecture", text) or re.search(
        r"walking tour", desc
    ):
        return "walking tour"
    return "guided outing"


def strip_meeting(text: str, meeting: str | None) -> str:
    next_text = text
    if meeting:
        next_text = re.sub(re.escape(meeting), "", next_text, flags=re.I)
        match = STREET_RE.search(meeting)
        if match and len(match.group(0).split()) >= 2:
            next_text = re.sub(re.escape(match.group(0)), "", next_text, flags=re.I)
    next_text = STREET_RE.sub("", next_text)
    next_text = re.sub(r"\$\s?\d[\d,]*\.?\d*", "", next_text)
    next_text = re.sub(r"\s{2,}", " ", next_text)
    next_text = re.sub(r"\s+,", ",", next_text)
    return next_text.strip(" ,")


def is_guest_place(name: str, source_text: str) -> bool:
    text = PLACE_LEAD_STRIP.sub("", clean_text(name)).strip(" .,-'")
    text = re.sub(r"'s$", "", text)
    if len(text) < 4 or len(text) > 48:
        return False
    if MARKETING.search(text) or SECOND_PERSON.search(text):
        return False
    words = text.split()
    if "." in text or "," in text:
        return False
    if text.lower() in {
        "duration",
        "about",
        "highlights",
        "includes",
        "overview",
        "details",
        "illuminate",
    } or text.lower().startswith("about "):
        return False
    if words[0].lower() in PLACE_START_BLOCK:
        return False
    lowered = text.lower()
    if any(noise in lowered for noise in PLACE_NOISE):
        return False
    if re.search(r"\b(cruise|charter|tour|experience|package|hour|minute)\b", lowered):
        return False
    haystack = source_text or ""
    if not re.search(rf"\b{re.escape(text)}\b", haystack, re.I):
        return False
    return True


def unique_places(items: list[str], source_text: str) -> list[str]:
    seen = set()
    result = []
    for item in items:
        text = PLACE_LEAD_STRIP.sub("", clean_text(item)).strip(" .,-'")
        text = re.sub(r"'s$", "", text)
        if not is_guest_place(text, source_text):
            continue
        key = text.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(text)
    return result


def extract_places(facts: dict, source_text: str, title: str, operator: str) -> list[str]:
    blobs = []
    for key in ("highlights", "itinerary", "description"):
        value = facts.get(key)
        if isinstance(value, list):
            blobs.extend(value)
        elif value:
            blobs.append(str(value))
    candidates: list[str] = list(facts.get("properNames") or [])
    for blob in blobs:
        for match in PROPER_RE.findall(clean_text(blob)):
            candidates.append(match)
    blocked = {title.lower(), (operator or "").lower(), "boston", "massachusetts"}
    places = []
    for name in unique_places(candidates, source_text):
        if name.lower() in blocked:
            continue
        if operator and operator.lower() in name.lower():
            continue
        if re.search(rf"named by {re.escape(name)}", source_text or "", re.I):
            continue
        places.append(name)
        if len(places) == 6:
            break
    return places


def guest_inclusions(items: list[str]) -> list[str]:
    kept = []
    skip = re.compile(
        r"guided|exploring|outdoor tour|offered in|head out|located on|"
        r"join |come |please|gratuities|this tour is in english|urban landscape|"
        r"tour in english|dazzling|fully private|full catering|"
        r"commentary on main sights|fully narrated|licensed guide|"
        r"one way ticket|round trip|surcharges|air-conditioned|"
        r"60-minute experience|free photos|all transportation",
        re.I,
    )
    for item in items or []:
        text = clean_text(item).rstrip(" .")
        words = WORD_RE.findall(text)
        if not words or len(words) > 6:
            continue
        if "!" in text or re.search(r"[\u2600-\u27BF\U0001F300-\U0001FAFF]", text):
            continue
        if MARKETING.search(text) or SECOND_PERSON.search(text) or skip.search(text):
            continue
        if re.search(r"\b\d+\s*(?:hour|minute)s?\b", text, re.I):
            continue
        kept.append(text)
        if len(kept) == 3:
            break
    return kept


def notice_hours(text: str | None) -> str | None:
    if not text:
        return None
    match = re.search(r"(\d+)\s*-?\s*hours?", text, re.I)
    if match:
        return match.group(1)
    return None


def overlap_with_source(text: str, source_text: str, title: str, operator: str) -> bool:
    reserved = shingles(" ".join(part for part in (title, operator) if part))
    overlap = (shingles(text) & shingles(source_text)) - reserved
    return bool(overlap)


def safe_sentence(text: str, meeting: str | None, source_text: str, title: str, operator: str) -> str | None:
    text = strip_meeting(text, meeting)
    if not text or SECOND_PERSON.search(text) or MARKETING.search(text):
        return None
    if implementation_language_errors(text) or mechanical_verb_errors(text):
        return None
    text = sentence(text)
    if not text:
        return None
    if overlap_with_source(text, source_text, title, operator):
        return None
    return text


def place_sentences(places: list[str], activity: str) -> list[str]:
    if not places:
        return []
    foodish = any(
        re.search(r"\b(roll|chowder|beans|pie|chocolate|dumpling|truffle|tasting|dim sum)\b", name, re.I)
        for name in places
    )
    if activity == "harbor outing":
        opener = "The sail passes"
        closer_kind = "view"
    elif activity == "bicycle outing":
        opener = "The ride passes"
        closer_kind = "view"
    elif activity == "paddle outing":
        opener = "The outing passes"
        closer_kind = "view"
    elif activity == "food walk" or foodish:
        opener = "The walk samples" if foodish else "The walk visits"
        closer_kind = "visit"
    else:
        opener = "The walk passes"
        closer_kind = "reach"
    if len(places) <= 2:
        return [f"{opener} {join_and(places)}."]
    first, rest = places[:2], places[2:5]
    rows = [f"{opener} {join_and(first)}."]
    if rest and closer_kind == "view":
        if len(rest) == 1:
            rows.append(f"{rest[0]} comes into view.")
        else:
            rows.append(f"{join_and(rest)} come into view.")
    elif rest and closer_kind == "visit":
        rows.append(f"Later stops sample {join_and(rest)}." if foodish else f"Later stops visit {join_and(rest)}.")
    elif rest:
        rows.append(f"The route also reaches {join_and(rest)}.")
    return rows


def extract_foods(source_text: str, places: list[str]) -> list[str]:
    found = []
    seen = set()
    for match in FOOD_RE.finditer(source_text or ""):
        name = match.group(0)
        key = name.lower()
        if key in seen:
            continue
        seen.add(key)
        found.append(name.lower() if name.islower() or name.istitle() else name)
    for name in places:
        if FOOD_RE.search(name):
            key = name.lower()
            if key not in seen:
                seen.add(key)
                found.append(name)
    return found[:4]


def extract_vessel(source_text: str, title: str) -> str | None:
    for blob in (title, source_text):
        match = VESSEL_RE.search(blob or "")
        if match:
            return match.group(0)
    return None


def try_draft(
    text: str,
    meeting: str | None,
    source_text: str,
    title: str,
    operator: str,
) -> str | None:
    return safe_sentence(text, meeting, source_text, title, operator)


def harvest_experience_drafts(
    facts: dict,
    activity: str,
    places: list[str],
    source_text: str,
    title: str,
    operator: str,
    meeting: str | None,
) -> list[str]:
    drafts: list[str] = []
    foods = extract_foods(source_text, places)
    vessel = extract_vessel(source_text, title)
    description = facts.get("description") or ""
    if vessel and activity == "harbor outing":
        drafts.append(f"The outing is aboard {vessel}.")
    if foods and (activity == "food walk" or foods):
        if len(foods) <= 2:
            drafts.append(f"The walk samples {join_and(foods)}.")
        else:
            drafts.append(f"The walk samples {join_and(foods[:2])}.")
            drafts.append(f"Later tastings include {join_and(foods[2:4])}.")
    family = re.search(
        r"families with children(?: ages?)?\s+(\d+)\s*(?:-|to)\s*(\d+)",
        description,
        re.I,
    )
    if family:
        drafts.append(
            f"The walk is aimed at families with children ages {family.group(1)} to {family.group(2)}."
        )
    elif re.search(r"family-friendly|families with young children", description, re.I):
        drafts.append("The outing is aimed at families, including guests who prefer an easier pace.")
    if re.search(r"bike paths along the Charles River", description, re.I):
        drafts.append("The ride stays on bike paths along the Charles River.")
    if re.search(r"does not include travel into Downtown Boston", description, re.I):
        drafts.append("The route stays out of downtown neighborhoods.")
    if re.search(r"not a fully narrated", description, re.I):
        drafts.append("Commentary stays moderate rather than a fully narrated tour.")
    if re.search(r"individually(?:-|\s+)fitted bike", description, re.I):
        drafts.append("Each guest rides an individually fitted bike.")
    kept = []
    seen = set()
    for draft in drafts:
        cleaned = try_draft(draft, meeting, source_text, title, operator)
        if not cleaned:
            continue
        key = cleaned.lower()
        if key in seen:
            continue
        seen.add(key)
        kept.append(cleaned)
    return kept


def group_sentence(group: str | None) -> str | None:
    if not group:
        return None
    text = clean_text(group)
    if MARKETING.search(text) or SECOND_PERSON.search(text):
        return None
    match = re.search(r"maximum\s+(\d+)\s+(?:people|guests|persons)", text, re.I)
    if match and re.search(r"per guide", text, re.I):
        return f"Groups stay at up to {match.group(1)} guests per guide."
    match = re.search(r"maximum\s+(\d+)", text, re.I)
    if match:
        return f"Groups stay at a maximum of {match.group(1)} guests."
    match = re.search(r"\b(\d+)\b", text)
    if match and len(WORD_RE.findall(text)) <= 4:
        return f"Groups are capped at {match.group(1)}."
    return None


def age_sentence(min_age, max_age) -> str | None:
    bits = []
    if min_age not in (None, ""):
        try:
            age = int(str(min_age).strip())
        except ValueError:
            age = None
        if age == 21:
            bits.append("Guests must be 21 or older.")
        elif age is not None:
            bits.append(f"Guests must be at least {age} years old.")
    if max_age not in (None, "") and not bits:
        bits.append(f"The published maximum age is {max_age}.")
    return " ".join(bits) if bits else None


def compose_schema(
    title: str,
    operator: str,
    activity: str,
    duration_adj: str | None,
    duration: str | None,
    city: str | None,
    places: list[str],
    body_words: int,
) -> str:
    bits = []
    lead_bits = []
    if duration_adj:
        lead_bits.append(f"A {duration_adj} {activity}")
    elif duration:
        lead_bits.append(f"A {activity} lasting {duration}")
    else:
        lead_bits.append(f"A {activity}")
    if operator:
        lead_bits.append(f"with {operator}")
    if city:
        if activity == "harbor outing":
            lead_bits.append(f"on {city} Harbor" if "harbor" not in city.lower() else f"in {city}")
        else:
            lead_bits.append(f"in {city}")
    bits.append(sentence(" ".join(lead_bits)))
    if places[:3]:
        if activity == "harbor outing":
            bits.append(sentence(f"The sail passes {join_and(places[:3])}"))
        elif activity == "food walk":
            bits.append(sentence(f"The walk visits {join_and(places[:3])}"))
        else:
            bits.append(sentence(f"The walk passes {join_and(places[:3])}"))
    text = " ".join(part for part in bits if part)
    words = count_words([text])
    if words >= body_words or words > 80:
        text = bits[0]
        words = count_words([text])
    if words > 80:
        text = " ".join(text.split()[:75]).rstrip(".,") + "."
    return clean_text(text)


def compose_editorial(
    catalog: dict,
    facts: dict,
    source_text: str,
    geography: dict,
) -> tuple[list[str], list[str], str, list[str]]:
    title = clean_text(catalog.get("title") or "")
    operator = clean_text(catalog.get("operator") or "")
    activity = activity_phrase(title, facts.get("description") or "")
    duration = facts.get("duration")
    duration_adj = duration_adjective(duration)
    meeting = facts.get("meetingAddress")
    place = geography.get("place") or {}
    city = place.get("city") or (
        geography.get("city") if geography.get("disposition") == "moved" else None
    )
    state = place.get("state") or (
        geography.get("state") if geography.get("disposition") == "moved" else None
    )
    places = extract_places(facts, source_text, title, operator)
    included = guest_inclusions(facts.get("included") or [])
    langs = facts.get("languages") or []
    rain = bool(
        re.search(
            r"rain or shine",
            " ".join(facts.get("restrictions") or []) + " " + (facts.get("cancellation") or ""),
            re.I,
        )
    )
    access = clean_text(facts.get("accessibility") or "")
    bring = guest_inclusions(facts.get("bring") or [])
    cancel_hours = notice_hours(facts.get("cancellation"))

    drafts: list[str] = []
    setting = ""
    if city and state and geography.get("disposition") == "moved":
        setting = f"in {city}, {state}"
    elif city and city.lower() not in title.lower():
        if activity == "harbor outing" and "harbor" not in title.lower():
            setting = f"on {city} Harbor"
        else:
            setting = f"in {city}"
    if len(title.split()) >= 6 and duration_adj:
        lead = f"This is a {duration_adj} {activity}"
        if operator:
            lead += f" with {operator}"
        if setting:
            lead += f" {setting}"
    elif duration_adj:
        lead = f"{title} is a {duration_adj} {activity}"
        if operator:
            lead += f" with {operator}"
        if setting:
            lead += f" {setting}"
    elif duration:
        lead = f"{title} is a {activity} lasting {duration}"
        if operator:
            lead += f" with {operator}"
        if setting:
            lead += f" {setting}"
    else:
        lead = f"{title} is a {activity}"
        if operator:
            lead += f" with {operator}"
        if setting:
            lead += f" {setting}"
    drafts.append(lead + ".")
    harvest_rows = harvest_experience_drafts(
        facts, activity, places, source_text, title, operator, meeting
    )
    drafts.extend(harvest_rows)
    if included:
        drafts.append(f"{join_and(included)} {'are' if len(included) != 1 else 'is'} included.")
    miles = []
    for item in facts.get("included") or []:
        match = re.search(r"(\d+(?:\.\d+)?)\s*miles?\b", item or "", re.I)
        if match:
            miles.append(match.group(1))
    mile = next((value for value in miles if "." in value), miles[0] if miles else None)
    if mile and re.search(r"moderate pace", source_text or "", re.I):
        drafts.append(f"The outdoor route is about {mile} miles at a moderate pace.")

    place_rows = place_sentences(places, activity)
    harvest_blob = " ".join(harvest_rows).lower()
    if any(re.search(r"\bsamples?\b", row, re.I) for row in harvest_rows):
        place_rows = [row for row in place_rows if not re.search(r"\bsample", row, re.I)]
    place_rows = [row for row in place_rows if row.lower().rstrip(".") not in harvest_blob]
    drafts.extend(place_rows)

    extra_langs = [item for item in langs if item.lower() != "english"]
    if extra_langs:
        drafts.append(f"Selected dates are also offered in {join_and(extra_langs)}.")

    group = group_sentence(facts.get("groupSize"))
    age = age_sentence(facts.get("minAge"), facts.get("maxAge"))
    if age and "published maximum age" in age.lower():
        age = None

    kept = []
    for draft in drafts:
        cleaned = safe_sentence(draft, meeting, source_text, title, operator)
        if cleaned:
            kept.append(cleaned)
    experience_kept = [item for item in kept if not LOGISTICS_SENTENCE_RE.search(item)]
    if len(experience_kept) >= 2 or (experience_kept and count_words(experience_kept) >= 28):
        logistics_drafts = []
        if group:
            logistics_drafts.append(group)
        if age:
            logistics_drafts.append(age)
        if rain:
            logistics_drafts.append("The outing is held in ordinary rain as well as clear weather.")
        if access and re.search(r"stroller|wheelchair", access, re.I) and not SECOND_PERSON.search(access):
            logistics_drafts.append("The walk is stroller and wheelchair accessible.")
        if any(re.search(r"identification", item, re.I) for item in bring):
            logistics_drafts.append("Adult beverages require valid identification.")
        if cancel_hours:
            logistics_drafts.append(
                f"A full refund is available with at least {cancel_hours} hours' notice."
            )
        for draft in logistics_drafts:
            cleaned = safe_sentence(draft, meeting, source_text, title, operator)
            if cleaned:
                kept.append(cleaned)

    if not kept:
        fallback = f"{title} is a {activity} with {operator}." if operator else f"{title} is a {activity}."
        cleaned = safe_sentence(fallback, meeting, source_text, title, operator)
        kept = [cleaned] if cleaned else [sentence(fallback)]

    if len(kept) <= 2:
        paragraphs = kept
    else:
        experience = [kept[0]]
        idx = 1
        while idx < len(kept) and not LOGISTICS_SENTENCE_RE.search(kept[idx]):
            experience.append(kept[idx])
            idx += 1
            if len(experience) == 3:
                break
        rest = kept[len(experience) :]
        paragraphs = [" ".join(experience)]
        if rest:
            if len(rest) <= 2:
                paragraphs.append(" ".join(rest))
            else:
                split = max(1, len(rest) // 2)
                paragraphs.append(" ".join(rest[:split]))
                paragraphs.append(" ".join(rest[split:]))
        paragraphs = [part for part in paragraphs if part.strip()][:4]

    highlight_rows = []
    if duration_adj and city:
        highlight_rows.append(f"{duration_adj} {activity} in {city}")
    elif duration:
        highlight_rows.append(f"{duration} {activity}")
    if places[:2]:
        highlight_rows.append(join_and(places[:2]))
    if included:
        highlight_rows.append(included[0])
    elif group:
        highlight_rows.append(group.rstrip("."))
    highlight_rows = [row.rstrip(".") for row in highlight_rows if row][:3]

    body_words = count_words(paragraphs)
    if body_words < 40:
        schema = " ".join(paragraphs).strip()
    else:
        schema = compose_schema(
            title, operator, activity, duration_adj, duration, city, places, body_words
        )
        schema = strip_meeting(schema, meeting)
        if (
            not schema
            or overlap_with_source(schema, source_text, title, operator)
            or implementation_language_errors(schema)
            or mechanical_verb_errors(schema)
            or SECOND_PERSON.search(schema)
            or MARKETING.search(schema)
            or count_words([schema]) >= body_words
            or count_words([schema]) < 8
        ):
            schema = paragraphs[0]
            if count_words([schema]) >= body_words and len(paragraphs) > 1:
                schema = " ".join(paragraphs[0].split()[: max(8, body_words // 2)]).rstrip(".,") + "."

    removed = [
        "Catalog quality_score and availability_count were not treated as ratings.",
        "Marketing headlines and structured-description pricing prose were not used as Offer prices.",
        "Process commentary about omitted lists, ratings, schema, and facts-panel behavior was not used as page copy.",
    ]
    if meeting:
        removed.append("Verified meeting and check-in details stay in the facts panel.")
    if geography.get("conflictsWithExpected"):
        removed.append(geography.get("reason") or "Source geography does not match the legacy city bucket.")
    return paragraphs, highlight_rows, schema, removed
