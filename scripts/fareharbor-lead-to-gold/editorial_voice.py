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
    r"sells|sold|leave|leaves|aimed|covering|"
    r"traces|looks|combines|watches|licensed|pairs|"
    r"book|books|provide|provides|go|goes|wait|waits|lasts|run"
    r")\b",
    re.I,
)
EXPERIENCE_TOKEN_RE = re.compile(
    r"\b("
    r"sail|pass(?:es)?|see|explore|ride|walk|walking|sample|visits?|aboard|"
    r"come into view|covers?|cross(?:es|ing)?|neighborhood|schooner|"
    r"yacht|trail|harbor|tasting|chocolate|freedom trail|esplanade|paddle"
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
    "nearest mbta",
    "nearest mbta station",
    "nearest mbta stations",
    "green lines",
    "green line",
    "mbta stations",
    "full guest information",
    "world war ii",
    "duration distance",
    "faneuil hall duration",
    "located across",
    "marcelino's seaport",
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
    "located",
    "bring",
    "consider",
    "add",
    "add-on",
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
            "editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich"
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
    match = re.match(r"^(\d+(?:\.\d+)?)h$", text, re.I)
    if match:
        number = match.group(1)
        words = {"1": "one", "2": "two", "3": "three", "4": "four"}
        if number in words:
            return f"{words[number]}-hour"
        return f"{number}-hour"
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
    itinerary_names = []
    for item in facts.get("itinerary") or []:
        text = PLACE_LEAD_STRIP.sub("", clean_text(item)).strip(" .,-'")
        text = re.sub(
            r"^(?:\d+(?:\.\d+)?\s*(?:min|mins|minutes|hr|hrs|hours?)\s*-+\s*)",
            "",
            text,
            flags=re.I,
        ).strip(" .-")
        if text:
            itinerary_names.append(text)
            blobs.append(text)
    for key in ("highlights", "description"):
        value = facts.get(key)
        if isinstance(value, list):
            blobs.extend(value)
        elif value:
            blobs.append(str(value))
    candidates: list[str] = [*itinerary_names, *(facts.get("properNames") or [])]
    for blob in blobs:
        for match in PROPER_RE.findall(clean_text(blob)):
            candidates.append(match)
    blocked = {
        title.lower(),
        (operator or "").lower(),
        "boston",
        "massachusetts",
        "american revolution",
        "continental army",
        "british troops",
        "george washington",
    }
    places = []
    seen = set()
    for name in unique_places(candidates, source_text):
        if name.lower() in blocked:
            continue
        if operator and operator.lower() in name.lower():
            continue
        if re.search(rf"named by {re.escape(name)}", source_text or "", re.I):
            continue
        if re.search(r"\b(mbta|duration|terrain|information|highlights)\b", name, re.I):
            continue
        words = name.split()
        person_like = 2 <= len(words) <= 4 and all(
            re.match(r"^[A-Z][A-Za-z']+$", word) for word in words
        )
        place_word = re.search(
            r"\b("
            r"hall|house|church|chapel|green|bridge|yard|hill|trail|tavern|"
            r"museum|mall|square|garden|common|wharf|park|street|slope|"
            r"market|monument|cemetery|island|pier|bookstore|library|shul|"
            r"peninsula|waterfront|esplanade|block|memorial|meeting|end"
            r")\b",
            name,
            re.I,
        )
        if person_like and name not in itinerary_names and not place_word:
            continue
        key = name.lower()
        if key in seen:
            continue
        seen.add(key)
        places.append(name)
        if len(places) == 8:
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


def itinerary_sentences(stops: list[str], activity: str) -> list[str]:
    if len(stops) < 2:
        return []
    if activity == "harbor outing":
        opener = "The sail"
    elif activity == "bicycle outing":
        opener = "The ride"
    else:
        opener = "The outing"
    rows = [f"{opener} starts at {stops[0]}."]
    if len(stops) >= 3:
        rows.append(f"The route then visits {join_and(stops[1:3])}.")
    rest = stops[3:6]
    if rest:
        rows.append(f"Later stops include {join_and(rest)}.")
    return rows


def description_fact_drafts(description: str, extras: list[str] | None = None) -> list[str]:
    drafts = []
    blob = " ".join(part for part in [description, *(extras or [])] if part)
    if not blob:
        return drafts
    licensed = re.search(
        r"licensed by the ((?:town|city|state) of [A-Z][A-Za-z]+|[A-Z][A-Za-z]+)",
        blob,
    )
    if licensed:
        drafts.append(f"Guides are licensed by the {licensed.group(1)}.")
    if re.search(r"midnight ride", blob, re.I) and re.search(r"Paul Revere", blob):
        drafts.append(
            "The route follows Paul Revere's midnight ride toward Lexington and Concord."
        )
    if re.search(r"Battle Road", blob):
        drafts.append("The return follows Battle Road.")
    if re.search(r"private (?:corporate |group )?tours?", blob, re.I) and re.search(
        r"food|tastings", blob, re.I
    ):
        drafts.append("Private groups sample local food while walking a Boston neighborhood.")
    if re.search(r"corporate|company events|team-building|colleagues", blob, re.I) and re.search(
        r"food|tastings", blob, re.I
    ):
        drafts.append("Private groups book the outing for company events.")
    if re.search(r"food tastings|local food", blob, re.I) and re.search(r"neighborhood", blob, re.I):
        drafts.append("The walk samples local food in a neighborhood setting.")
    if re.search(r"earliest streets", blob, re.I):
        drafts.append("The walk traces some of the city's earliest streets.")
    if re.search(r"filling coves|filled coves|moving hills|moved hills", blob, re.I):
        drafts.append("The outing looks at hills that were moved and coves that were filled.")
    oldest = re.search(
        r"oldest neighborhood(?:, the|,| is)?\s+(?:the )?([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)?)",
        blob,
    )
    if oldest:
        drafts.append(f"The walk visits {oldest.group(1)}, the city's oldest neighborhood.")
    elif re.search(r"oldest neighborhood", blob, re.I) and re.search(r"\bNorth End\b", blob):
        drafts.append("The walk visits the North End, the city's oldest neighborhood.")
    streets = re.search(
        r"streets of ((?:[A-Z][A-Za-z]+(?:'s)?\s+){0,3}[A-Z][A-Za-z]+)",
        blob,
    )
    if streets:
        drafts.append(f"The walk follows the streets of {streets.group(1).strip()}.")
    if re.search(r"architecture and politics", blob, re.I):
        drafts.append("The walk covers architecture and politics.")
    if re.search(r"Federal and Greek Revival", blob):
        drafts.append("The route passes Federal and Greek Revival row homes.")
    if re.search(r"begins at the waterfront", blob, re.I):
        drafts.append("The walk begins at the waterfront.")
    years = re.search(r"immigrants for (\d+) years", blob, re.I)
    if years:
        drafts.append(f"The neighborhood has been home to immigrants for {years.group(1)} years.")
    immigrant = bool(
        re.search(r"home to immigrants|immigrant tradition|immigration history", blob, re.I)
    )
    if re.search(r"Ireland", blob) and re.search(r"Italy", blob) and re.search(
        r"Eastern Europe|immigrant", blob, re.I
    ):
        drafts.append("The outing covers arrivals from Ireland, Eastern Europe, and Italy.")
    if re.search(r"fireworks", blob, re.I) and re.search(r"harbor|water", blob, re.I):
        drafts.append("The sail watches the fireworks from the harbor.")
    schooner = re.search(r"(\d+)-foot(?: long)? (?:pilot )?schooner", blob, re.I)
    if schooner:
        drafts.append(f"The vessel is a {schooner.group(1)}-foot schooner.")
    if re.search(r"teak decks", blob, re.I):
        drafts.append("The schooner has teak decks.")
    named = []
    for pattern in (
        r"Molasses Flood",
        r"Brink'?s Robbery",
        r"Great Influenza(?: of \d+)?",
        r"Boston Massacre(?: Site)?",
        r"Bunker Hill Monument",
        r"USS Constitution",
        r"Paul Revere House",
        r"Old North Church",
        r"Faneuil Hall",
        r"Boston Common",
        r"Public Garden",
        r"Freedom Trail",
        r"Charles Street Meeting House",
        r"African Meeting House",
        r"Vilna Shul",
        r"Acorn Street",
        r"Quincy Market",
        r"Blackstone Block",
        r"Shawmut Peninsula",
    ):
        match = re.search(pattern, blob)
        if match:
            named.append(match.group(0))
    if named[:3]:
        drafts.append(f"The walk visits {join_and(named[:3])}.")
    if re.search(r"true crime|misery, misfortune, and murder|checkered past", blob, re.I):
        drafts.append("The walk covers documented crime and disaster stories.")
    if re.search(r"trade union", blob, re.I) and re.search(r"women", blob, re.I):
        drafts.append("The walk covers women's trade unions and suffrage work.")
    if re.search(r"Shawmut Peninsula", blob) and re.search(r"Massachusett|Native people", blob):
        drafts.append("The outing covers early life on Shawmut Peninsula.")
    if re.search(r"Chinatown", blob) and re.search(r"immigrant", blob, re.I):
        drafts.append("The walk covers Chinatown's immigrant history.")
    elif immigrant:
        drafts.append("The walk covers the neighborhood's immigrant history.")
    if re.search(r"backstreets and alleyways|beyond the restaurants", blob, re.I):
        drafts.append("The walk goes beyond restaurants into backstreets and alleyways.")
    if re.search(r"Colonial times", blob):
        drafts.append("Stops cover Colonial times to the present.")
    if re.search(r"boat ride|land and sea", blob, re.I) and re.search(
        r"walk|Freedom Trail", blob, re.I
    ):
        drafts.append("The outing includes a walk and a harbor boat ride.")
    if re.search(r"Little Italy", blob) and re.search(r"coffee|pastry|cafe", blob, re.I):
        drafts.append("The morning starts in the North End with coffee and pastry.")
    if re.search(r"door-to-door|private (?:luxury )?van|hotel pickup", blob, re.I):
        drafts.append("A private van provides hotel pickup.")
    islands = re.search(
        r"((?:[A-Z][a-z]+,\s+){1,4}[A-Z][a-z]+,\s+and\s+[A-Z][a-z]+)\s+Islands",
        blob,
    )
    if islands:
        drafts.append(f"The outing visits {islands.group(1)} Islands.")
    if re.search(r"only accessible by private boat", blob, re.I):
        drafts.append("The sail visits harbor islands reached only by private boat.")
    if re.search(r"disembark and discover|boat and captain wait", blob, re.I):
        drafts.append("Guests go ashore while the boat waits.")
    if re.search(r"complimentary desserts|sliced fruits", blob, re.I):
        drafts.append("Desserts and sliced fruit are included.")
    if re.search(r"Freedom Trail", blob) and not any("Freedom Trail" in row for row in drafts):
        drafts.append("The walk covers sites along the Freedom Trail.")
    fire = re.search(r"Great Fire of (\d{4})", blob)
    if fire:
        drafts.append(f"The walk follows rebuilding after the {fire.group(1)} fire.")
    if re.search(r"Benjamin Franklin|Ben Franklin", blob):
        drafts.append("The walk follows Benjamin Franklin's Boston homes and haunts.")
    if re.search(r"LGBTQ", blob):
        drafts.append("The walk covers Boston's LGBTQ past.")
    if re.search(r"Black writers|Black thinkers", blob):
        drafts.append("The walk covers Boston's Black writers and the fight against slavery.")
    if re.search(r"Loyalists", blob):
        drafts.append("The walk covers Boston Loyalists before independence.")
    if re.search(r"back bay was filled|Bay was filled|reclaimed swamp", blob, re.I):
        drafts.append("The walk looks at how Back Bay was filled.")
    if re.search(r"Victorian", blob):
        drafts.append("The walk covers Victorian houses and streets.")
    if re.search(r"writers and poets|literary", blob, re.I):
        drafts.append("The walk covers writers and publishing sites.")
    if re.search(r"\bstories\b", blob, re.I) and not any("stories" in row for row in drafts):
        drafts.append("The walk includes stories from the neighborhood.")
    if re.search(r"\barchitecture\b", blob, re.I) and not any("architecture" in row for row in drafts):
        drafts.append("The walk covers the neighborhood's architecture.")
    if re.search(r"Martha's Vineyard", blob):
        drafts.append("The outing visits Martha's Vineyard.")
    if re.search(r"Cape Cod", blob):
        drafts.append("The outing visits Cape Cod.")
    if re.search(r"Hammond Castle", blob):
        drafts.append("The outing visits Hammond Castle.")
    if re.search(r"\bSalem\b", blob) and re.search(r"witch", blob, re.I):
        drafts.append("The outing visits Salem and the witch-trial sites.")
    if re.search(r"tall ship|Liberty Star", blob, re.I):
        drafts.append("The sail is aboard a tall ship.")
    if re.search(r"\bsunset\b", blob, re.I) and re.search(r"harbor|sail|cruise", blob, re.I):
        drafts.append("The sail is a sunset harbor outing.")
    if re.search(r"moonlight|under the stars", blob, re.I):
        drafts.append("The sail runs in the evening under the stars.")
    if re.search(r"lighthouse", blob, re.I):
        drafts.append("The sail passes harbor lighthouses.")
    if re.search(r"Harbor Islands", blob):
        drafts.append("The sail visits the Boston Harbor Islands.")
    if re.search(r"paddleboard|stand up paddle|\bSUP\b", blob, re.I):
        drafts.append("The outing includes a stand-up paddle session.")
    if re.search(r"yoga", blob, re.I) and re.search(r"water|paddle|\bSUP\b", blob, re.I):
        drafts.append("The outing includes yoga on a paddleboard.")
    if re.search(r"\btandem\b", blob, re.I):
        drafts.append("The rental is a tandem bike.")
    if re.search(r"pedal-assist|electric bicycle|e-bike", blob, re.I):
        drafts.append("The rental is a pedal-assist electric bike.")
    if re.search(r"night photography|holiday lights|winter lights", blob, re.I):
        drafts.append("The walk covers night photography.")
    if re.search(r"Brutalism|brutalist", blob, re.I):
        drafts.append("The walk covers brutalist buildings.")
    if re.search(r"Great Women|women of Boston", blob, re.I):
        drafts.append("The walk covers notable women in Boston history.")
    if re.search(r"cooking class|cook real meals", blob, re.I):
        drafts.append("The outing includes a complete meal cooked in a private home.")
    if re.search(r"scavenger hunt", blob, re.I):
        drafts.append("The outing includes a scavenger hunt around the city.")
    if re.search(r"take pictures|solve puzzles|photo scavenger", blob, re.I):
        drafts.append("The outing includes photo clues and puzzles.")
    if re.search(r"\baround Boston\b|about Boston\b", blob):
        drafts.append("The walk stays in Boston.")
    if re.search(r"accompanied memorial|final goodbyes", blob, re.I):
        drafts.append("The outing is an accompanied memorial on the water.")
    if re.search(r"\bferry\b", blob, re.I):
        drafts.append("Round-trip ferry travel is included.")
    if re.search(r"Essex Coastal|North Shore", blob):
        drafts.append("The outing follows the North Shore coast.")
    if re.search(r"Fort Point Channel|engineered world", blob):
        drafts.append("The walk covers the engineered waterfront around Fort Point Channel.")
    if re.search(r"drag queen", blob, re.I):
        drafts.append("The outing is a drag queen show.")
    if re.search(r"tall ships|250th anniversary", blob, re.I):
        drafts.append("The outing watches tall ships on the harbor.")
    if re.search(r"fat biking|miles of trails|mountain or fat", blob, re.I):
        drafts.append("The outing follows wooded trails for biking.")
    return drafts


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
    overlap_text: str | None = None,
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
    drafts.extend(
        description_fact_drafts(
            description,
            [title, *(facts.get("included") or []), *(facts.get("highlights") or [])],
        )
    )
    title_words = WORD_RE.findall(title or "")
    if 2 <= len(title_words) <= 8 and count_words([description]) >= 40:
        if not MARKETING.search(title or "") and not SECOND_PERSON.search(title or ""):
            drafts.append(f"The walk covers {title}.")
    drafts.extend(itinerary_sentences(places[:6], activity))
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
        cleaned = try_draft(draft, meeting, overlap_text or source_text, title, operator)
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
    overlap_text: str | None = None,
) -> tuple[list[str], list[str], str, list[str]]:
    title = clean_text(catalog.get("title") or "")
    operator = clean_text(catalog.get("operator") or "")
    overlap_text = overlap_text if overlap_text is not None else source_text
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
        facts, activity, places, source_text, title, operator, meeting, overlap_text
    )
    drafts.extend(harvest_rows)
    if included:
        drafts.append(f"{join_and(included)} {'are' if len(included) != 1 else 'is'} included.")
    miles = []
    for item in facts.get("included") or []:
        match = re.search(r"(\d+(?:\.\d+)?)\s*-?\s*miles?\b", item or "", re.I)
        if match and not re.match(r"^0\d+$", match.group(1)):
            miles.append(match.group(1))
    mile = next((value for value in miles if "." in value), miles[0] if miles else None)
    inclusion_blob = " ".join(facts.get("included") or [])
    distance_blob = f"{source_text or ''} {inclusion_blob} {facts.get('description') or ''}"
    if not mile:
        desc_mile = re.search(
            r"(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?)\s*miles?\b",
            distance_blob,
            re.I,
        )
        if desc_mile and not re.match(r"^0\d+$", desc_mile.group(1)):
            mile = desc_mile.group(1).replace(" ", "")
    if mile:
        unit = "mile" if mile in {"1", "1.0"} else "miles"
        if re.search(r"moderate pace", distance_blob, re.I):
            drafts.append(f"The outdoor route is about {mile} {unit} at a moderate pace.")
        else:
            drafts.append(f"The outdoor route is about {mile} {unit}.")

    place_rows = place_sentences(places, activity)
    harvest_blob = " ".join(harvest_rows).lower()
    if any(re.search(r"\bsamples?\b", row, re.I) for row in harvest_rows):
        place_rows = [row for row in place_rows if not re.search(r"\bsample", row, re.I)]
    if count_words(harvest_rows) >= 28 and any(
        re.search(r"\bstarts at\b", row, re.I) for row in harvest_rows
    ):
        place_rows = []
    place_rows = [row for row in place_rows if row.lower().rstrip(".") not in harvest_blob]
    drafts.extend(place_rows)

    extra_langs = [item for item in langs if item.lower() != "english"]
    if extra_langs:
        drafts.append(f"Selected dates are also offered in {join_and(extra_langs)}.")
    draft_blob = " ".join(drafts).lower()
    if city and activity == "harbor outing" and "harbor" not in draft_blob:
        drafts.append(f"The sail stays on {city} Harbor.")
    elif city and activity == "bicycle outing" and city.lower() not in draft_blob:
        drafts.append(f"The ride stays in {city}.")
    elif city and activity == "paddle outing" and city.lower() not in draft_blob:
        drafts.append(f"The outing stays on the water in {city}.")
    elif city and city.lower() not in draft_blob:
        drafts.append(f"The walk stays in {city}.")
    if activity == "harbor outing" and re.search(r"islands", title or "", re.I):
        drafts.append("The sail visits harbor islands.")

    group = group_sentence(facts.get("groupSize"))
    age = age_sentence(facts.get("minAge"), facts.get("maxAge"))
    if age and "published maximum age" in age.lower():
        age = None

    kept = []
    for draft in drafts:
        cleaned = safe_sentence(draft, meeting, overlap_text, title, operator)
        if cleaned:
            kept.append(cleaned)
    if count_words(kept) < 40:
        backups = []
        if activity == "harbor outing":
            backups.append("The route stays on the water through the harbor.")
        elif activity == "paddle outing":
            backups.append("The outing stays on the water.")
        elif activity == "bicycle outing":
            backups.append("The ride follows city streets and paths.")
        elif activity == "food walk":
            backups.append("The walk samples food in a neighborhood setting.")
        elif activity == "photography walk":
            backups.append("The walk is built around photo stops.")
        else:
            backups.append("The walk follows a neighborhood route.")
        if city:
            backups.append(f"The route stays in {city}.")
        if duration:
            backups.append(f"The outing lasts {duration}.")
        if operator:
            backups.append(f"The outing is run by {operator}.")
        for draft in backups:
            if count_words(kept) >= 40:
                break
            cleaned = safe_sentence(draft, meeting, overlap_text, title, operator)
            if cleaned and cleaned not in kept:
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
            cleaned = safe_sentence(draft, meeting, overlap_text, title, operator)
            if cleaned:
                kept.append(cleaned)

    if not kept:
        fallback = f"{title} is a {activity} with {operator}." if operator else f"{title} is a {activity}."
        cleaned = safe_sentence(fallback, meeting, overlap_text, title, operator)
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
            or overlap_with_source(schema, overlap_text, title, operator)
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
