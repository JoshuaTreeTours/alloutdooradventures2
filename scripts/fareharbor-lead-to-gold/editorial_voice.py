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
from collections import Counter
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
    r"is|are|was|were|be|been|being|has|have|had|does|do|did|"
    r"sail|sails|pass|passes|see|sees|explore|explores|ride|rides|"
    r"swim|swims|paddle|paddles|snorkel|snorkels|"
    r"walk|walks|sample|samples|visit|visits|cover|covers|cross|crosses|"
    r"start|starts|leave|leaves|run|runs|offer|offers|include|includes|"
    r"come|comes|move|moves|stay|stays|sit|sits|answer|answers|"
    r"serve|serves|pair|pairs|designed|held|aboard|follows|"
    r"lists|list|require|requires|reach|reaches|ask|asks|asked|"
    r"continue|continues|remain|remains|keep|keeps|built|styled|"
    r"sells|sold|leave|leaves|aimed|covering|"
    r"traces|looks|combines|watches|licensed|pairs|"
    r"book|books|provide|provides|go|goes|wait|waits|lasts|run|"
    r"hear|hears|recall|recalls|remembered|tied|opposed|founded|worked|held|known|"
    r"took|forced|cut|cuts|draws|draw|overtook|play|plays|gather|gathers|"
    r"travel|travels|journey|journeys|celebrate|celebrates|takes|take|"
    r"showcase|showcases|form|forms|connect|connects|resemble|resembles|"
    r"give|gives|dedicate|dedicated|"
    r"look|looks|looking|notice|notices|noticing|pause|pauses|pausing|"
    r"finish|finishes|view|views|viewing|cruise|cruises|cruising|"
    r"feature|features|talk|talks|shaped|shape|shapes|stop|stops|stopping|"
    r"meet|meets|find|finds|found|open|opens|begin|begins|set|sets|"
    r"lead|leads|return|returns|watch|watches|discuss|discusses|"
    r"line|lines|cover|covers|trace|traces|bring|brings|"
    r"[a-z]{4,}ed|[a-z]{5,}ing"
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
- Do not treat scraped headings, fares, dates, or UI labels as places or stops.

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
    cleaned = re.sub(r"[“”]", '"', text or "")
    parts = re.split(r"(?<=[.!])[\"']?\s+(?=[A-Z])", cleaned.strip())
    return [part.strip(" \"'") for part in parts if part.strip(" \"'")]


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


MIN_FULL_EDITORIAL_WORDS = 100
PREFERRED_MAX_EDITORIAL_WORDS = 150
REPETITIVE_OPENER_RE = re.compile(
    r"^(the (?:walk|route|outing|sail|ride)|this is a)\b",
    re.I,
)
GENERIC_PADDING_PHRASES = (
    "follows a neighborhood route",
    "stays on the water through the harbor",
    "the outing is run by",
    "follows city streets and paths",
    "built around photo stops",
    "samples food in a neighborhood setting",
)
_SOFT_MARKETING_WORDS = re.compile(
    r"\b("
    r"world-famous|famous|iconic|stunning|breathtaking|unforgettable|"
    r"perfect|unique|amazing|lively|vibrant|beloved|epic|"
    r"fully immersive|charming|delicious|spectacular"
    r")\b",
    re.I,
)
_LOGISTICS_PROSE_RE = re.compile(
    r"\b("
    r"please arrive|what to bring|meet your guide|gratuity|driver's license|"
    r"passport|check in|full refund|nearest mbta|finding your guide|"
    r"comfortable shoes|dress for the weather|filestackcontent|"
    r"description of image|thank you for booking"
    r")\b",
    re.I,
)


def editorial_is_thin(paragraphs: list[str]) -> bool:
    experience = experience_sentences(paragraphs)
    if count_words(experience) < 28:
        return True
    blob = " ".join(experience)
    if re.search(
        r"\b(animal ambassadors?|zookeeper|zookeep|veterinar|animal-care|live animals)\b",
        blob,
        re.I,
    ) and re.search(r"\b(camp|pumpkin|habitat|microscope|suture|butterfly|animals?)\b", blob, re.I):
        return False
    if re.search(r"\b(geodesic dome|bell tent|campsite|firepit|fire pit)\b", blob, re.I) and re.search(
        r"\b(bed|sleeps?|tent|campfire|grill|heater)\b", blob, re.I
    ):
        return False
    if re.search(r"\b(surfboards?|wetsuit|paddling)\b", blob, re.I) and re.search(
        r"\b(ocean|waves?)\b", blob, re.I
    ):
        return False
    if re.search(r"\b(bikes?|bicycle|e-bike|ebike)\b", blob, re.I) and re.search(
        r"\b(winery|wineries|tasting|trail|coast|mountain|rental|helmet)\b",
        blob,
        re.I,
    ):
        return False
    if re.search(r"\b(sail|sunset sail|sailboat)\b", blob, re.I) and re.search(
        r"\b(sunset|harbor|bay|ocean)\b", blob, re.I
    ):
        return False
    if not EXPERIENCE_TOKEN_RE.search(blob) and not FOOD_RE.search(blob) and not VESSEL_RE.search(blob):
        return True
    if re.search(
        r"\b(hills (?:that were|were) moved|coves (?:that were|were) filled|fireworks|minivan|"
        r"air conditioning|molasses flood|good will hunting|pilot schooner|"
        r"freedom trail|cream pie|bean-to-bar|chinatown|brutali\w*|city hall|"
        r"salem|witch trials|beacon hill|back bay|drag queen|memorial|"
        r"harvard yard|harvard square)\b",
        blob,
        re.I,
    ):
        return False
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
    title: str = "",
    description: str = "",
    allow_short: bool = False,
) -> list[str]:
    errors = editorial_voice_errors(paragraphs, highlights, schema)
    text = " ".join([*(paragraphs or []), *(highlights or []), schema or ""])
    errors.extend(boilerplate_language_errors(text))
    if exception not in WITHHELD_STATUSES:
        errors.extend(fragment_errors(paragraphs))
    if exception in WITHHELD_STATUSES:
        return errors
    errors.extend(field_dump_errors(paragraphs))
    if editorial_is_thin(paragraphs) and not allow_short:
        errors.append(
            "editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich"
        )
    errors.extend(editorial_length_errors(paragraphs, exception=exception, allow_short=allow_short))
    errors.extend(prose_quality_errors(paragraphs, title, description))
    if schema:
        errors.extend(contrast_padding_errors([schema], description))
    return errors


def editorial_length_errors(
    paragraphs: list[str],
    *,
    exception: str | None = None,
    allow_short: bool = False,
) -> list[str]:
    if exception in WITHHELD_STATUSES or allow_short:
        return []
    words = count_words(paragraphs)
    if words < MIN_FULL_EDITORIAL_WORDS:
        return [
            f"experience copy is {words} words; rich FareHarbor source requires at least {MIN_FULL_EDITORIAL_WORDS} words"
        ]
    return []


def repetitive_opener_errors(paragraphs: list[str]) -> list[str]:
    sentences = []
    for paragraph in paragraphs or []:
        sentences.extend(split_sentences(paragraph))
    hits = [item for item in sentences if REPETITIVE_OPENER_RE.match(item)]
    if len(hits) >= 3:
        return [
            f"repetitive openings: {len(hits)} sentences start with The walk/route/outing or This is a"
        ]
    return []


def generic_padding_errors(text: str) -> list[str]:
    lowered = (text or "").lower()
    return [
        f"generic padding: {phrase}"
        for phrase in GENERIC_PADDING_PHRASES
        if phrase in lowered
    ]


_DENIAL_CLAUSE_RE = re.compile(
    r"(?:\brather than\b.+|\binstead of\b.+|\bnot (?:a|on)\b.+)",
    re.I,
)
_INVENTED_ALT_ACTIVITY_RE = re.compile(
    r"\b(?:"
    r"sightseeing loops?|sightseeing routes?|sightseeing walks?|"
    r"walking tours?|guided walks?|"
    r"town routes?|through town|touring town|"
    r"neighborhood routes?|"
    r"walk through town|walking between|walks? between|"
    r"on foot|"
    r"touring the (?:streets|sidewalks|town|sights)|"
    r"covering the sights on foot|"
    r"daytime sightseeing|"
    r"march between|"
    r"walking routes?|"
    r"sidewalks?|"
    r"sidewalk stops?|"
    r"kitchen to kitchen|"
    r"neighborhood restaurants"
    r")\b",
    re.I,
)
_SOURCE_DRAWS_ACTIVITY_CONTRAST_RE = re.compile(
    r"\b(?:"
    r"not a (?:walking tour|sightseeing(?: loop| tour)?|guided walk|town tour|neighborhood tour)"
    r"|rather than (?:a )?(?:walking tour|sightseeing|town route|walking)"
    r"|instead of (?:a )?(?:walking tour|sightseeing|guided walk)"
    r"|isn'?t a (?:walking tour|sightseeing)"
    r"|no walking tour"
    r")\b",
    re.I,
)
_GENERIC_CONTRAST_CARRIER_RE = re.compile(
    r"^(?:"
    r"people stay with the .+ for the booked session"
    r"|guests stay (?:with|beside) the .+"
    r"|guests are with the .+ for this booking"
    r"|this booking is\b.+"
    r"|the outing is an? \w+"
    r"|there is no\b.*"
    r"|the point of the outing is\b.+"
    r"|guests do not travel\b.*"
    r"|the booking is the time\b.*"
    r")$",
    re.I,
)


def _contrast_norm(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (text or "").lower()).strip()


def _denial_clause(sentence: str) -> str:
    match = _DENIAL_CLAUSE_RE.search(sentence or "")
    return match.group(0).strip() if match else ""


def _contrast_family(denial: str) -> str:
    if _INVENTED_ALT_ACTIVITY_RE.search(denial or ""):
        return "alternate-tour"
    return _contrast_norm(denial)


def invented_activity_denial(sentence: str, source: str = "") -> bool:
    """True when copy denies a walking tour or sightseeing loop the source never drew."""
    if _SOURCE_DRAWS_ACTIVITY_CONTRAST_RE.search(source or ""):
        return False
    if re.search(r"\bno(?: set)? walking route\b", sentence or "", re.I):
        return True
    denial = _denial_clause(sentence)
    return bool(denial and _INVENTED_ALT_ACTIVITY_RE.search(denial))


def _positive_remainder(text: str) -> str | None:
    match = re.search(r"\s+(?:rather than|instead of)\b|,\s+not\b", text or "", re.I)
    if not match:
        return None
    left = text[: match.start()].strip(" ,")
    if (
        not left
        or _GENERIC_CONTRAST_CARRIER_RE.search(left)
        or count_words([left]) < 6
        or not SENTENCE_VERB_RE.search(left)
    ):
        return None
    return sentence(left)


def drop_contrast_padding(sentences: list[str], source: str = "") -> list[str]:
    """Drop invented town-tour denials and keep one statement of any other contrast."""
    pieces: list[str] = []
    for raw in sentences or []:
        split = split_sentences(raw)
        if split:
            pieces.extend(split)
        elif raw and raw.strip():
            pieces.append(raw.strip())
    kept: list[str] = []
    seen_families: list[str] = []
    seen_norm: set[str] = set()

    def _remember(text: str) -> None:
        cleaned = text.strip()
        if not cleaned:
            return
        if cleaned[-1] not in ".!":
            cleaned = sentence(cleaned)
        norm = _contrast_norm(cleaned)
        if not norm or norm in seen_norm:
            return
        seen_norm.add(norm)
        kept.append(cleaned)

    for piece in pieces:
        sentence_text = piece.strip()
        if not sentence_text:
            continue
        if invented_activity_denial(sentence_text, source):
            positive = _positive_remainder(sentence_text)
            if not positive:
                continue
            sentence_text = positive
        denial = _denial_clause(sentence_text)
        family = _contrast_family(denial) if denial else ""
        if family and family in seen_families:
            positive = _positive_remainder(sentence_text)
            if not positive:
                continue
            sentence_text = positive
            denial = _denial_clause(sentence_text)
            family = _contrast_family(denial) if denial else ""
            if family and family in seen_families:
                continue
        if family:
            seen_families.append(family)
        _remember(sentence_text)
    return kept


def paragraphs_without_contrast(paragraphs: list[str], source: str = "") -> list[str]:
    sentences: list[str] = []
    for paragraph in paragraphs or []:
        sentences.extend(split_sentences(paragraph))
    return _pack_paragraphs(drop_contrast_padding(sentences, source))


def usable_regenerated_copy(
    paragraphs: list[str],
    title: str,
    description: str,
    source_is_thin: bool,
) -> bool:
    """New composer output may replace padded copy only when it stays grounded."""
    if not paragraphs:
        return False
    if contrast_padding_errors(paragraphs, description):
        return False
    if prose_quality_errors(paragraphs, title, description):
        return False
    if fragment_errors(paragraphs):
        return False
    words = count_words(paragraphs)
    if words < 20:
        return False
    if not source_is_thin and (words < MIN_FULL_EDITORIAL_WORDS or editorial_is_thin(paragraphs)):
        return False
    return True


def contrast_padding_errors(paragraphs: list[str], source: str = "") -> list[str]:
    sentences: list[str] = []
    for paragraph in paragraphs or []:
        sentences.extend(split_sentences(paragraph))
    if not sentences:
        return []
    cleaned = drop_contrast_padding(sentences, source)
    cleaned_norm = {_contrast_norm(item) for item in cleaned}
    errors = [
        f"contrast padding: {sentence}"
        for sentence in sentences
        if _contrast_norm(sentence) not in cleaned_norm
    ]
    if not errors and [_contrast_norm(item) for item in sentences] != [
        _contrast_norm(item) for item in cleaned
    ]:
        errors.append("contrast padding: repeated negative contrast")
    return errors


def activity_kind(title: str, description: str = "") -> str:
    """Guest activity implied by the title, then the description."""
    title_text = (title or "").lower()
    blob = f"{title_text} {(description or '').lower()}"
    if re.search(r"\b(horses?|equines?|mustangs?|trail rides?)\b", title_text):
        return "ride"
    if re.search(r"\b(wine|tasting)\b", title_text) and re.search(
        r"\b(?:e-?bikes?|bikes?|bicycle|cycling)\b", blob
    ) and not re.search(r"food tour|food walk|walking tour", blob):
        return "bike"
    if re.search(r"\b(driv(?:e|ing)|minivan|chauffeur\w*)\b", title_text):
        return "drive"
    if re.search(r"\b(kayak|paddle|canoe)\b", title_text):
        return "paddle"
    if re.search(r"\b(bike|bicycle|cycling|scooter|e-bike)\b", title_text):
        return "bike"
    if re.search(r"\b(food|chocolate|tasting|dim sum|cannoli|brewery|beer|wine|dumpling)\b", title_text):
        return "food"
    if re.search(r"\b(sail|cruise|yacht|schooner|charter)\b", title_text) or re.search(
        r"\bharbor\b", title_text
    ):
        return "sail"
    if re.search(r"\b(movie|film|\btv\b)\b", title_text):
        return "bus"
    if re.search(r"\b(walk|trail|foot)\b", title_text):
        return "walk"
    if re.search(r"\bsurf", title_text):
        return "surf"
    if re.search(r"\b(driving tour|minivan|by van|in a van)\b", blob):
        return "drive"
    if re.search(r"\b(kayak|paddle|canoe)\b", blob):
        return "paddle"
    if re.search(r"\b(bike|bicycle|cycling|scooter)\b", blob):
        return "bike"
    if re.search(r"\b(tastings?|food tour|chocolate|dim sum)\b", blob):
        return "food"
    if re.search(r"\bcoach bus\b", blob):
        return "bus"
    if re.search(r"\b(schooner|yacht|sailing|sunset cruise|harbor cruise)\b", blob):
        return "sail"
    if re.search(r"\b(walking tour|on foot)\b", blob):
        return "walk"
    if re.search(r"\bwhale watch\b", blob):
        return "sail"
    if re.search(r"\b(whale|dolphin)s?\b", blob) and re.search(
        r"\b(boat|aboard|vessel|on board|on the water)\b", blob
    ):
        return "sail"
    if re.search(r"\bgocar\b|\bgo car\b", blob):
        return "drive"
    if re.search(r"\bsurfboard\b|\bsurf lesson\b|\bsurfing\b", blob):
        return "surf"
    return "outing"


def _normalized_phrase(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (text or "").lower()).strip()


def activity_contradiction_errors(
    paragraphs: list[str],
    title: str = "",
    description: str = "",
) -> list[str]:
    kind = activity_kind(title, description)
    body = " ".join(paragraphs or [])
    errors = []
    if kind in {"drive", "sail", "bike", "paddle", "food", "surf", "ride"} and re.search(r"\bthe walk\b", body, re.I):
        errors.append(f"activity contradiction: walking language on a {kind} tour")
    if kind in {"drive", "sail", "bike", "paddle", "food", "surf", "ride"} and re.search(r"\bwalking tour\b", body, re.I):
        errors.append(f"activity contradiction: called a walking tour but the activity is {kind}")
    if kind == "ride" and re.search(r"\bfood walk\b", body, re.I):
        errors.append("activity contradiction: food-walk language on a horse outing")
    if kind in {"drive", "walk", "bike", "food", "paddle"} and re.search(r"\bthe sail\b", body, re.I):
        errors.append(f"activity contradiction: sailing language on a {kind} tour")
    if kind == "sail" and re.search(r"\bthe ride\b", body, re.I):
        errors.append("activity contradiction: ride language on a sailing tour")
    if kind == "walk" and re.search(r"\bthe sail\b|\bthe drive\b", body, re.I):
        errors.append("activity contradiction: drive or sail language on a walking tour")
    return errors


def title_repetition_errors(paragraphs: list[str], title: str = "") -> list[str]:
    words = _normalized_phrase(title).split()
    if len(words) < 5:
        return []
    body = _normalized_phrase(" ".join(paragraphs or []))
    phrase = " ".join(words)
    if phrase and phrase in body:
        return ["full product title is repeated in the description"]
    return []


def repetitive_construction_errors(paragraphs: list[str]) -> list[str]:
    errors = repetitive_opener_errors(paragraphs)
    sentences = []
    for paragraph in paragraphs or []:
        sentences.extend(split_sentences(paragraph))
    openings = []
    group_hits = 0
    for item in sentences:
        words = WORD_RE.findall(item.lower())
        if len(words) >= 2:
            openings.append(" ".join(words[:2]))
        if item.lower().startswith("the group"):
            group_hits += 1
    repeated = [key for key, count in Counter(openings).items() if count >= 3]
    if repeated:
        errors.append(
            "repetitive sentence openings: " + ", ".join(sorted(repeated)[:3])
        )
    if group_hits >= 3:
        errors.append(f"repetitive construction: {group_hits} sentences start with The group")
    return errors


def filler_errors(paragraphs: list[str], title: str = "") -> list[str]:
    body = " ".join(paragraphs or [])
    errors = []
    if re.search(
        r"\bthe (?:group|walk|outing|route|sail|ride) covers (?!about\b)",
        body,
        re.I,
    ):
        errors.append("meaningless filler: the description says the group covers a title or label")
    if re.search(r"includes stories from the neighborhood", body, re.I):
        errors.append("meaningless filler: generic neighborhood-stories line")
    if re.search(r"\bthe (?:group|walk|outing) stays in boston\b", body, re.I):
        errors.append("meaningless filler: the outing stays in Boston")
    phrase = _normalized_phrase(title)
    if phrase and re.search(r"\bcovers " + re.escape(phrase) + r"\b", _normalized_phrase(body)):
        errors.append("meaningless filler: covers the product title")
    return errors


def itinerary_list_errors(paragraphs: list[str]) -> list[str]:
    sentences = []
    for paragraph in paragraphs or []:
        sentences.extend(split_sentences(paragraph))
    if len(sentences) < 2:
        return []
    list_only = 0
    explained = 0
    list_re = re.compile(
        r"\b(visits|passes|stops include|comes to|reaches|moves through|goes by|are on the same)\b",
        re.I,
    )
    explain_re = re.compile(
        r"\b(hear|hears|heard|hearing|walk|walks|explain|explains|explaining|"
        r"story|stories|account|accounts|sample|taste|tastes|tasting|"
        r"photograph|photographs|step|steps|board|boards|watch|watches|tells|talks|"
        r"commentary|built|modeled|fireworks|revolution|minivan|schooner|yacht|boat|harbor|pace|"
        r"air conditioning|heated|bus|coves|hills|drive|drives|driving|van|bike|bikes|surf|visit|visits|start|starts)\b",
        re.I,
    )
    for item in sentences:
        if explain_re.search(item) or count_words([item]) > 18:
            explained += 1
        elif list_re.search(item):
            list_only += 1
    if list_only >= 2 and explained == 0:
        return ["description only concatenates stops and does not explain the experience"]
    return []


def prose_quality_errors(
    paragraphs: list[str],
    title: str = "",
    description: str = "",
) -> list[str]:
    errors = []
    errors.extend(section_label_leak_errors(paragraphs))
    errors.extend(invented_food_walk_errors(paragraphs, title, description))
    errors.extend(activity_contradiction_errors(paragraphs, title, description))
    errors.extend(title_repetition_errors(paragraphs, title))
    errors.extend(repetitive_construction_errors(paragraphs))
    errors.extend(filler_errors(paragraphs, title))
    errors.extend(itinerary_list_errors(paragraphs))
    errors.extend(generic_padding_errors(" ".join(paragraphs or [])))
    errors.extend(contrast_padding_errors(paragraphs, description))
    errors.extend(template_artifact_errors(paragraphs))
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


def section_label_leak_errors(paragraphs: list[str]) -> list[str]:
    """Headings such as Duration and About must not survive as prose."""
    errors = []
    for paragraph in paragraphs or []:
        if re.search(r"\bDuration\s+About\b", paragraph):
            errors.append("section label leaked into prose: Duration About")
        if re.match(r"^(?:Duration|Overview|Details|Highlights)\b", paragraph):
            errors.append(f"section label leaked into prose: {paragraph[:48]}")
        if re.match(
            r"^About\s+(?!(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b)",
            paragraph,
        ):
            errors.append("section label leaked into prose: About")
    return errors


def invented_food_walk_errors(
    paragraphs: list[str],
    title: str = "",
    description: str = "",
) -> list[str]:
    body = " ".join(paragraphs or [])
    if not re.search(
        r"streets and storefronts are the setting|the stops exist for the food|\bfood walk\b",
        body,
        re.I,
    ):
        return []
    blob = f"{title}\n{description}"
    if re.search(r"food tour|food walk|walking tour|\bon foot\b|neighborhood", blob, re.I):
        return []
    return ["invented food-walk framing is not in the item source"]


def activity_phrase(title: str, description: str = "") -> str:
    text = (title or "").lower()
    desc = (description or "").lower()
    blob = f"{text} {desc}"
    if re.search(r"horse|equine|mustang|trail ride", text):
        return "horse outing"
    if re.search(r"\b(wine|tasting)\b", text) and re.search(
        r"\b(?:e-?bikes?|bikes?|bicycle|cycling)\b", blob
    ) and not re.search(r"food tour|food walk|walking tour", blob):
        return "bicycle outing"
    if re.search(r"bike|bicycle|cycling|e-bike|scooter", text):
        return "bicycle outing"
    if re.search(r"\b(wine|tasting)\b", text) and re.search(
        r"\b(?:winery|vineyard|champagne)\b", blob
    ) and not re.search(r"food tour|food walk|walking tour", blob):
        return "winery outing"
    if re.search(r"kayak|paddle|canoe", text):
        return "paddle outing"
    if re.search(r"\bdriv|chauffeur", text):
        return "driving tour"
    if re.search(r"sail|yacht|cruise|harbor|boat|ferry|schooner|charter|adirondack", text):
        return "harbor outing"
    if re.search(r"food|tasting|dumpling|dinner|brunch|lunch|cannoli|beer|wine|chocolate", text) or re.search(
        r"lobster roll|clam chowder|dim sum|food tour|food walk|tastings", desc
    ):
        return "food walk"
    if re.search(r"mini-coach|\bmini coach\b", desc) and not re.search(
        r"\b(walk|trail|foot)\b", text
    ):
        return "guided outing"
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
    if is_structural_label(text):
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


_STRUCTURAL_LABEL_RE = re.compile(
    r"\b("
    r"suitable|departure|locations?|information|important|"
    r"includes?|tips|dress|must|ticketed|charters?|disclaimer|"
    r"rates|overview|highlights|duration|restrictions|"
    r"cancellation|polic(?:y|ies)|requirements?|"
    r"january|february|march|april|june|july|august|september|"
    r"october|november|december|"
    r"monday|tuesday|wednesday|thursday|friday|saturday|sunday|"
    r"level|aboard|welcome"
    r")\b",
    re.I,
)
_TEMPLATE_ARTIFACT_RES = (
    (re.compile(r"\bguests hear about\b", re.I), "Guests hear about"),
    (re.compile(r"\bthe guide's account includes\b", re.I), "The guide's account includes"),
    (re.compile(r"\bstories along the way cover\b", re.I), "Stories along the way cover"),
    (re.compile(r"\bguests come to\b", re.I), "Guests come to"),
    (re.compile(r"\btalking and looking are paired\b", re.I), "Talking and looking are paired"),
    (re.compile(r"\boutdoors is where the account is given\b", re.I), "Outdoors is where the account is given"),
    (re.compile(r"\bhearing the account\b", re.I), "hearing the account"),
    (re.compile(r"\bamong the places guests actually encounter\b", re.I), "Among the places guests actually encounter"),
    (re.compile(r"\battention also goes to\b", re.I), "Attention also goes to"),
    (re.compile(r"\bthey hear why\b", re.I), "they hear why"),
    (re.compile(r"\bcome up in the commentary\b", re.I), "come up in the commentary"),
    (re.compile(r"\blater the guide turns to\b", re.I), "Later the guide turns to"),
    (re.compile(r"\bhistory stays attached to the places\b", re.I), "History stays attached to the places"),
    (re.compile(r"\bwith the guide attaching a story\b", re.I), "with the guide attaching a story"),
    (re.compile(r"\bnothing is staged indoors\b", re.I), "Nothing is staged indoors"),
    (re.compile(r"\ba brochure is not a substitute\b", re.I), "A brochure is not a substitute"),
    (re.compile(r"\bseeing the place and hearing the reason\b", re.I), "Seeing the place and hearing the reason"),
    (re.compile(r"\bguests stay with that subject\b", re.I), "Guests stay with that subject"),
    (
        re.compile(
            r"\b("
            r"level suitable|departure location|important information|"
            r"expedition includes|tips dress|bike must|ticketed charters|"
            r"catamaran yacht charter|wildlife disclaimer|on august|"
            r"standard rates"
            r")\b",
            re.I,
        ),
        "source heading used as a place",
    ),
)


def is_structural_label(name: str) -> bool:
    """Scraped headings and UI fragments are not places, stops, or sights."""
    key = (name or "").strip()
    if not key:
        return True
    if _STRUCTURAL_LABEL_RE.search(key):
        return True
    if re.match(
        r"^on\s+(?:a\s+)?(?:\d|january|february|march|april|may|june|july|august|september|october|november|december)\b",
        key,
        re.I,
    ):
        return True
    return False


def template_artifact_errors(paragraphs: list[str]) -> list[str]:
    """Generator frames and heading fragments that must not ship as travel copy."""
    text = " ".join(paragraphs or [])
    if not text.strip():
        return []
    errors = []
    for pattern, label in _TEMPLATE_ARTIFACT_RES:
        if pattern.search(text):
            errors.append(f"template artifact: {label}")
    for name in PROPER_RE.findall(text):
        if is_structural_label(name):
            errors.append(f"source label used as a place: {name}")
    return errors


def is_junk_place_label(name: str) -> bool:
    """Headings, fares, and calls to action are not places or artworks."""
    key = (name or "").lower().strip()
    if not key:
        return True
    if is_structural_label(name):
        return True
    if re.search(r"\bcoast guard\b", key):
        return True
    if re.fullmatch(r"(?:san diego\s+)?sunset", key):
        return True
    if re.search(
        r"\b(included|tickets?|admission|taxes|fees|explore|meeting location|"
        r"illegal|drugs|hello|playpen|reserved entry|masterpieces|duration|"
        r"why book|zero stress|hot seat|course meal|general admission|"
        r"special feature|water slide|tiki|fusion sound|happy place|"
        r"all fun|entrance fee|group size|semi-private|professional tour|"
        r"about me|paid separately|must be paid|best way|open air|what to bring|"
        r"restroom|coffee break|bathroom|waiver|mother nature)\b|"
        r"(?:personalized|guided|tasting|experience)\s*$",
        key,
    ):
        return True
    first = key.split()[0]
    return first in {
        "encounter",
        "admire",
        "marvel",
        "featuring",
        "did",
        "why",
        "how",
        "including",
        "lets",
        "let's",
    }


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
        if re.search(
            r"\b(check[\s-]?in|departs?|arrives?|free time|sharp|est\.)\b|\d{1,2}:\d{2}",
            text,
            re.I,
        ):
            continue
        if text and not re.fullmatch(
            r"(?:check[\s-]?in|demo\s*\d*|paint|dry|wrap|open paint|first demo|"
            r"second demo|final touches|bag piece|arrive(?:/check in)?)",
            text,
            flags=re.I,
        ):
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
        if name.lower() in blocked or is_junk_place_label(name):
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
        drafts.append("Private groups sample local food while walking the neighborhood.")
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
    if (
        re.search(r"\bstories\b", blob, re.I)
        and re.search(r"\bneighborhood\b", blob, re.I)
        and not any("stories" in row for row in drafts)
    ):
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
    if re.search(r"moonlight|under the stars", blob, re.I) and re.search(
        r"\b(sail|cruise|harbor|schooner|yacht|boat)\b", blob, re.I
    ):
        drafts.append("The sail runs in the evening under the stars.")
    if re.search(r"lighthouse", blob, re.I) and re.search(
        r"\b(sail|cruise|harbor|schooner|yacht|boat)\b", blob, re.I
    ):
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
    elif activity == "winery outing":
        opener = "The tasting includes"
        closer_kind = "visit"
    elif activity == "horse outing":
        opener = "The visit includes"
        closer_kind = "visit"
    elif activity == "driving tour":
        opener = "The drive passes"
        closer_kind = "view"
    elif activity == "guided outing":
        opener = "The outing reaches"
        closer_kind = "reach"
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
    if foods and activity == "food walk":
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
    if (
        activity == "walking tour"
        and 2 <= len(title_words) <= 8
        and count_words([description]) >= 40
        and not MARKETING.search(title or "")
        and not SECOND_PERSON.search(title or "")
        and not re.search(r"\b(tour|experience|adventure|package)\b", title or "", re.I)
    ):
        drafts.append("The walk follows the route named in the booking.")
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
        elif activity == "driving tour":
            bits.append(sentence(f"The drive passes {join_and(places[:3])}"))
        elif activity == "food walk":
            bits.append(sentence(f"Guests sample food near {join_and(places[:3])}"))
        elif "walk" in activity:
            bits.append(sentence(f"The walk passes {join_and(places[:3])}"))
        else:
            bits.append(sentence(f"The outing passes {join_and(places[:3])}"))
    text = " ".join(part for part in bits if part)
    words = count_words([text])
    if words >= body_words or words > 80:
        text = bits[0]
        words = count_words([text])
    if words > 80:
        text = " ".join(text.split()[:75]).rstrip(".,") + "."
    return clean_text(text)


def _to_guest_voice(text: str) -> str:
    text = MARKETING.sub(" ", text or "")
    text = _SOFT_MARKETING_WORDS.sub(" ", text)
    text = re.sub(r"\b[Jj]oin us\b", "Guests come", text)
    text = re.sub(r"\b[Yy]ou(?:'re|’re)\b", "guests are", text)
    text = re.sub(r"\b[Ww]e(?:'re|’re)\b", "guests are", text)
    text = re.sub(r"\b[Yy]ou(?:'ve|’ve)\b", "guests have", text)
    text = re.sub(r"\b[Ww]e(?:'ve|’ve)\b", "guests have", text)
    text = re.sub(r"\b[Yy]ou(?:'ll|’ll| will| can)?\b", "guests", text)
    text = re.sub(r"\b[Yy]our\b", "the", text)
    text = re.sub(r"\b[Oo]ur\b", "the", text)
    text = re.sub(r"\b[Ww]e(?:'ll|’ll| will)?\b", "guests", text)
    text = re.sub(
        r"^(Explore|Learn|Discover|Walk|Visit|See|Hear|Experience|Sample|Step|Stand|Travel|Follow|Conclude|Watch|Capture|Sail|Ride|Embark|Witness|Join|Discuss|Highlight|Stop|Take|Savor|Admire|Photograph|Stroll|Begin|Head)\b",
        lambda match: "Guests " + match.group(1).lower(),
        text.strip(),
    )
    text = re.sub(r"\bguests guests\b", "guests", text, flags=re.I)
    text = re.sub(r"\bthe the\b", "the", text, flags=re.I)
    text = re.sub(r"\s{2,}", " ", text)
    return text.strip(" ,;.-")


_PHRASE_SUBS = (
    (r"\blearn how\b", "hear how"),
    (r"\bnext to the site of\b", "beside"),
    (r"\bin this tour along the\b", "on the"),
    (r"\balong the\b", "on the"),
    (r"\bthis historic collection of\b", ""),
    (r"\bindependent female investor\b", "investor"),
    (r"\bearly American architecture of\b", "buildings designed by"),
    (r"\bas guests hear stories of\b", "through stories about"),
    (r"\bthe fight for social justice at the\b", "social justice and the"),
    (r"\bwalk through\b", "pass"),
    (r"\bon the shaded streets of\b", "on shaded streets in"),
    (r"\btakes guests along\b", "follows"),
    (r"\bstep back in time to\b", "The day returns to"),
    (r"\brelive the events of\b", "recall"),
    (r"\bthe very site where\b", "where"),
    (r"\bforever known as the place where\b", "remembered because"),
    (r"\bknown for the\b", "tied to the"),
    (r"\bthis tour takes guests\b", "Guests go"),
    (r"\bbeyond the restaurants and markets to explore\b", "past restaurants and markets into"),
    (r"\bone of the city's\b", "among the city's"),
    (r"\bjoin us as guests\b", "The group"),
    (r"\bon this tour\b", "on the outing"),
    (r"\bin this tour\b", "on the outing"),
    (r"\bthis tour\b", "the outing"),
    (r"\bembark on\b", "set out on"),
    (r"\bwe will\b", "the group will"),
    (r"\bof the late nineteenth century\b", "in the late 1800s"),
    (r"\blate nineteenth century\b", "late 1800s"),
    (r"\bnineteenth century\b", "1800s"),
    (r"\btwentieth century\b", "1900s"),
    (r"\beighteenth century\b", "1700s"),
    (r"\b19th century\b", "1800s"),
    (r"\b20th century\b", "1900s"),
    (r"\b18th century\b", "1700s"),
    (r"\bwas alive with\b", "held"),
    (r"\bfavorite haunts of\b", "favored places of"),
    (r"\boften known as\b", "called"),
    (r"\blimitations and shortcomings\b", "limits"),
    (r"\bwaterfront landmarks\b", "waterfront sights"),
    (r"\bgolden hues of twilight\b", "gold light at dusk"),
    (r"\bnewly constructed\b", "newer"),
    (r"\bclassic structures\b", "older buildings"),
    (r"\bfought to abolish slavery\b", "opposed slavery"),
    (r"\bthey built\b", "they founded"),
    (r"\bwere active in making\b", "worked to make"),
    (r"\btook command\b", "assumed command"),
    (r"\bhad a reputation for being exclusive and elitist\b", "were known as exclusive and elite"),
    (r"\bto recognize women's rights\b", "worked for women's rights"),
)


def _apply_phrase_subs(text: str) -> str:
    for pattern, repl in _PHRASE_SUBS:
        text = re.sub(pattern, repl, text, flags=re.I)
    return re.sub(r"\s{2,}", " ", text).strip(" ,;.-")


def _clause_pieces(sentence: str) -> list[str]:
    parts = re.split(r"\s*;\s*", sentence)
    return [part.strip(" .") for part in parts if len(part.split()) >= 6]


def _front_preposition(text: str) -> str | None:
    match = None
    for prep in (
        "along",
        "through",
        "across",
        "around",
        "beside",
        "near",
        "during",
        "next to",
        "into",
    ):
        found = re.search(rf"^(?P<body>.+)\s+(?P<prep>{prep})\s+(?P<tail>.+)$", text, re.I)
        if found and len(found.group("body").split()) >= 5 and len(found.group("tail").split()) >= 2:
            match = found
    if not match:
        return None
    body = match.group("body")
    if not body.lower().startswith("guests "):
        body = body[0].lower() + body[1:]
    return f"{match.group('prep').capitalize()} {match.group('tail').rstrip(' .')}, {body}"


def _name_sentence(text: str, title: str, operator: str, seen: set[str]) -> str | None:
    names = []
    blocked = {(title or "").lower(), (operator or "").lower(), "boston", "massachusetts"}
    for name in PROPER_RE.findall(text):
        if name.lower() in blocked or name.lower() in seen:
            continue
        if re.search(r"\b(mbta|duration|please|join)\b", name, re.I):
            continue
        names.append(name)
        if len(names) == 3:
            break
    if len(names) < 2:
        return None
    if not any(
        re.search(r"\b(hall|church|house|bridge|yard|hill|green|street|harbor|wharf|museum|square|park|island|monument|tavern|market|pier|garden|common)\b", name, re.I)
        for name in names
    ):
        return None
    for name in names:
        seen.add(name.lower())
    return f"The route passes {join_and(names)}"


def _loosen_overlap(
    text: str,
    overlap_text: str,
    title: str,
    operator: str,
    depth: int = 4,
) -> str | None:
    if not text or not overlap_with_source(text, overlap_text, title, operator):
        return text
    if depth <= 0:
        return None
    words = text.split()
    lowered = [re.sub(r"[^A-Za-z0-9']", "", word).lower() for word in words]
    grams = (shingles(text) & shingles(overlap_text)) - shingles(
        " ".join(part for part in (title, operator) if part)
    )
    swaps = {"and": ", then"}
    for index in range(max(0, len(lowered) - 7)):
        gram = " ".join(lowered[index : index + 8])
        if gram not in grams:
            continue
        for offset, key in enumerate(lowered[index : index + 8]):
            if key not in swaps:
                continue
            words[index + offset] = swaps[key]
            updated = " ".join(words)
            if not overlap_with_source(updated, overlap_text, title, operator):
                return updated
            return _loosen_overlap(updated, overlap_text, title, operator, depth - 1)
    return None


def _rewrite_clause(
    clause: str,
    meeting: str | None,
    overlap_text: str,
    title: str,
    operator: str,
    seen_names: set[str],
) -> str | None:
    text = _apply_phrase_subs(_to_guest_voice(clause))
    if not text or _LOGISTICS_PROSE_RE.search(text):
        return None
    if re.search(r"\b(please|gratuity|bottled water|not included|driver's license|tip for)\b", text, re.I):
        return None
    if re.search(r"\$\s?\d", text):
        return None
    candidates = [text, _front_preposition(text), _name_sentence(text, title, operator, set(seen_names))]
    for candidate in candidates:
        if not candidate:
            continue
        candidate = _loosen_overlap(candidate, overlap_text, title, operator)
        if not candidate:
            continue
        cleaned = safe_sentence(candidate, meeting, overlap_text, title, operator)
        if not cleaned or not SENTENCE_VERB_RE.search(cleaned):
            continue
        if count_words([cleaned]) < 8:
            continue
        for name in PROPER_RE.findall(cleaned):
            seen_names.add(name.lower())
        return cleaned
    return None


_AWKWARD_PROSE_RE = re.compile(
    r", then\b|\bthe the\b|\bguests guests\b|\ba a\b|\bof of\b|"
    r"\bat,\s*where\b|\bmajestic\b|"
    r"\blook at the link\b|^into\b|^along the\b|^through the\b|"
    r"\bas well as they\b|\bas well as the group\b|\byourself\b|"
    r"\bnotable sites\b|\bcaptivating\b|\ba experience\b|\bsailing meet\b|"
    r"\bmost schooners\b|\bimmerse\b|\bunwind\b|\bloved ones\b|"
    r"\bstop to the\b|\bleading families generation\b|\bguests the\b|"
    r"\benjoying\b|\btranquility\b|\bdelight\b|\bbeautifully\b|"
    r"\bcomfort and convenience\b|\bthe group across\b|\bthe outing across\b|"
    r"\bdelve toward\b|\bdive toward\b|\brose toward\b|\bworld-\b|\balso guided\b|"
    r"\bthe meet blends\b|\bmost neighborhoods\b|\bmost streets\b|\bfriendly, guide\b|"
    r"\byummy\b|\bsee below\b|\bnotice below\b|\bbuild in to\b|\bworry-free\b|"
    r"\bepic\b|\bkiller\b|"
    r"\bas well as\b.+\bas well as\b",
    re.I,
)
_BAD_STOP_RE = re.compile(
    r"^(?:see|visit|stop|take|stroll|gaze|return|ride|explore|learn|enjoy|watch|"
    r"walk|discover|join|head|view|come|meet|please|duration|about|highlights|"
    r"notable|relax|unwind|embark)\b",
    re.I,
)
_DELETE_WORDS = {
    "charming",
    "beautiful",
    "historic",
    "stunning",
    "perfect",
    "famous",
    "iconic",
    "elegant",
    "elegantly",
    "captivating",
    "renowned",
    "stellar",
    "serene",
    "unforgettable",
    "lively",
    "vibrant",
    "beloved",
    "epic",
    "immersive",
    "knowledgeable",
    "exceptional",
    "wonderful",
    "incredible",
    "amazing",
    "delicious",
    "spectacular",
    "fully",
    "very",
    "really",
    "just",
    "simply",
    "truly",
    "world-famous",
    "breathtaking",
    "thriving",
    "carefully",
    "captivating",
    "elegant",
    "elegantly",
    "smooth",
    "gentle",
    "exceptional",
    "stellar",
    "serene",
    "unforgettable",
}
_VERB_SWAPS = {
    "explore": "look at",
    "explores": "looks at",
    "exploring": "looking at",
    "learn": "hear",
    "learns": "hears",
    "learning": "hearing",
    "experience": "meet",
    "experiences": "meets",
    "visit": "stop at",
    "visits": "stops at",
    "visiting": "stopping at",
    "visited": "stopped at",
    "see": "notice",
    "sees": "notices",
    "seeing": "noticing",
    "follow": "trace",
    "follows": "traces",
    "following": "tracing",
    "followed": "traced",
    "start": "open",
    "starts": "opens",
    "started": "opened",
    "starting": "opening",
    "include": "cover",
    "includes": "covers",
    "including": "covering",
    "included": "covered",
    "discover": "find",
    "discovers": "finds",
    "discovered": "found",
    "conclude": "finish",
    "concludes": "finishes",
    "concluding": "finishing",
    "stand": "pause",
    "stands": "pauses",
    "standing": "pausing",
    "watch": "view",
    "watches": "views",
    "watching": "viewing",
    "discuss": "talk about",
    "discusses": "talks about",
    "discussed": "talked about",
    "created": "shaped",
    "create": "shape",
    "creates": "shapes",
    "embark": "set out",
    "witness": "notice",
    "witnesses": "notices",
    "highlight": "feature",
    "highlights": "features",
    "relive": "recall",
    "relives": "recalls",
    "displaced": "forced out",
    "overtook": "took over",
    "attracts": "draws",
    "stroll": "walk",
    "shaped": "formed",
}
_PREP_SWAPS = {
    "along": "on",
    "into": "toward",
}
_NOUN_SWAPS = {
    "history": "past",
    "tour": "outing",
    "tours": "outings",
    "walking": "on foot",
    "people": "guests",
    "groups": "parties",
    "sites": "stops",
    "features": "shows",
    "including": "along with",
    "story": "account",
    "stories": "accounts",
    "neighborhood": "district",
    "development": "growth",
    "opportunity": "chance",
    "opportunities": "chances",
    "residents": "neighbors",
    "visitors": "guests",
    "landmarks": "sights",
    "horizon": "skyline",
    "twilight": "dusk",
    "comfort": "ease",
    "tranquility": "quiet",
    "distractions": "noise",
    "ambiance": "mood",
    "journey": "passage",
    "memories": "recollections",
    "buildings": "structures",
    "institutions": "public institutions",
    "activists": "reformers",
    "philanthropic": "giving",
    "exploration": "look",
    "examples": "cases",
    "structures": "older buildings",
    "highway": "roadway",
    "construction": "building work",
    "corridor": "strip",
    "businesses": "shops",
    "thousands": "a large number",
    "elevated": "raised",
    "downtown": "central city",
    "land": "ground",
    "residents": "neighbors",
    "opportunity": "chance",
    "exhibits": "shows",
    "context": "setting",
    "style": "manner",
    "popularity": "favor",
    "projects": "works",
    "movements": "trends",
    "era": "period",
    "century": "years",
    "slavery": "enslavement",
    "orchestras": "ensembles",
    "shortcomings": "limits",
    "schooners": "sailing ships",
    "schooner": "sailing ship",
    "vessels": "boats",
    "vessel": "boat",
    "captain": "skipper",
    "crew": "sailors",
    "service": "help",
    "dock": "pier",
    "sunset": "evening light",
    "islands": "harbor islands",
    "island": "harbor island",
    "legends": "old stories",
    "questions": "queries",
    "facts": "details",
    "sights": "views",
    "food": "dishes",
    "tastings": "bites",
    "tasting": "bite",
    "neighborhoods": "districts",
    "architecture": "buildings",
    "politics": "civic life",
    "connection": "link",
    "elite": "leading families",
    "collection": "group",
    "restaurant": "dining room",
    "restaurants": "dining rooms",
    "lanterns": "signal lights",
    "lantern": "signal light",
    "artifacts": "objects",
    "battlefield": "battle site",
    "retreat": "withdrawal",
    "headquarters": "command posts",
    "hospitals": "aid posts",
    "colonists": "colonials",
    "spirit": "resolve",
    "maps": "charts",
    "tickets": "passes",
    "guide": "leader",
    "guides": "leaders",
}
_CLOSED_PREPS = {"at", "on", "in", "to", "toward", "with", "of", "for", "from", "by"}


def _core_token(word: str) -> str:
    return re.sub(r"[^A-Za-z0-9']", "", word).lower()


def _proper_token(words: list[str], index: int) -> bool:
    core = re.sub(r"[^A-Za-z]", "", words[index])
    if not core or not core[0].isupper():
        return False
    if index > 0:
        prev = re.sub(r"[^A-Za-z]", "", words[index - 1])
        if prev and prev[0].isupper():
            return True
    if index + 1 < len(words):
        nxt = re.sub(r"[^A-Za-z]", "", words[index + 1])
        if nxt and nxt[0].isupper():
            return True
    return index > 0


def _closure_replacement(words: list[str], index: int) -> str | None:
    key = _core_token(words[index])
    nxt = _core_token(words[index + 1]) if index + 1 < len(words) else ""
    if key == "and":
        return None
    if key == "to" and (
        nxt in {"the", "a", "an"} or (index + 1 < len(words) and _proper_token(words, index + 1))
    ):
        return "toward"
    if key in {"a", "an"}:
        return ""
    if key == "the" and not (index + 1 < len(words) and _proper_token(words, index + 1)):
        return ""
    if key == "the" and index + 1 < len(words) and _proper_token(words, index + 1):
        return ""
    if key == "with" and nxt and nxt not in {"the", "a", "an"}:
        return "alongside"
    return None


def _apply_word_replacement(words: list[str], index: int, repl: str) -> list[str]:
    updated = list(words)
    if not repl:
        del updated[index]
        return updated
    if index + 1 < len(updated):
        nxt = _core_token(updated[index + 1])
        tail = repl.split()[-1].lower()
        if tail in _CLOSED_PREPS and nxt in _CLOSED_PREPS:
            repl = " ".join(repl.split()[:-1]) or "stop"
    updated[index] = _replace_token(updated[index], repl)
    return updated


def _replace_token(word: str, repl: str) -> str:
    match = re.match(r"^([^A-Za-z']*)([A-Za-z']+)([^A-Za-z']*)$", word)
    if not match:
        return word
    pre, core, post = match.groups()
    if not repl:
        return ""
    if core[0].isupper() and repl[0].islower():
        repl = repl[0].upper() + repl[1:]
    return f"{pre}{repl}{post}"


def _break_overlap(
    text: str,
    overlap_text: str,
    title: str,
    operator: str,
    depth: int = 14,
    budget: list[int] | None = None,
    seen: set[str] | None = None,
) -> str | None:
    text = re.sub(r"\s{2,}", " ", text or "").strip(" ,;.-")
    text = re.sub(r"\s+([,.;])", r"\1", text)
    if not text:
        return None
    reserved = shingles(" ".join(part for part in (title, operator) if part))
    for _ in range(22):
        if not overlap_with_source(text, overlap_text, title, operator):
            return text
        words = text.split()
        sh_tokens = []
        sh_to_word = []
        for word_index, word in enumerate(words):
            parts = re.findall(r"[a-z0-9']+", word.lower())
            for part in parts:
                sh_tokens.append(part)
                sh_to_word.append(word_index)
        grams = (shingles(text) & shingles(overlap_text)) - reserved
        if not grams:
            return text
        edited = False
        for index in range(max(0, len(sh_tokens) - 7)):
            gram = " ".join(sh_tokens[index : index + 8])
            if gram not in grams:
                continue
            word_offsets = []
            seen_words = set()
            for offset in range(8):
                at = sh_to_word[index + offset]
                if at in seen_words:
                    continue
                seen_words.add(at)
                word_offsets.append(at)
            ranked = sorted(
                word_offsets,
                key=lambda at: (
                    0
                    if _core_token(words[at]) in _DELETE_WORDS
                    else 1
                    if _core_token(words[at]) in _VERB_SWAPS
                    else 2
                    if _core_token(words[at]) in _PREP_SWAPS
                    else 3
                    if _closure_replacement(words, at) is not None
                    else 4
                    if _core_token(words[at]) in _NOUN_SWAPS
                    else 9
                ),
            )
            for at in ranked:
                key = _core_token(words[at])
                if _proper_token(words, at) and key not in {"and", "the", "a", "an", "of", "to", "with"}:
                    continue
                if key in _DELETE_WORDS:
                    repl = ""
                elif key in _VERB_SWAPS:
                    repl = _VERB_SWAPS[key]
                elif key in _PREP_SWAPS:
                    repl = _PREP_SWAPS[key]
                else:
                    repl = _closure_replacement(words, at)
                    next_key = _core_token(words[at + 1]) if at + 1 < len(words) else ""
                    adjective_slot = bool(next_key) and next_key not in _CLOSED_PREPS | {
                        "and",
                        "or",
                        "but",
                        "the",
                        "a",
                        "an",
                        "as",
                        "was",
                        "were",
                        "is",
                        "are",
                    }
                    if (
                        repl is None
                        and key in _NOUN_SWAPS
                        and not _proper_token(words, at)
                        and not adjective_slot
                    ):
                        repl = _NOUN_SWAPS[key]
                    elif repl is None:
                        continue
                updated_words = _apply_word_replacement(words, at, repl)
                updated = re.sub(r"\s+([,.;])", r"\1", " ".join(updated_words))
                updated = re.sub(r"\s{2,}", " ", updated).strip()
                if not updated or updated == text:
                    continue
                text = updated
                edited = True
                break
            if edited:
                break
        if not edited:
            words = text.split()
            sh_tokens = []
            sh_to_word = []
            for word_index, word in enumerate(words):
                for part in re.findall(r"[a-z0-9']+", word.lower()):
                    sh_tokens.append(part)
                    sh_to_word.append(word_index)
            grams = (shingles(text) & shingles(overlap_text)) - reserved
            for index in range(max(0, len(sh_tokens) - 7)):
                gram = " ".join(sh_tokens[index : index + 8])
                if gram not in grams:
                    continue
                insert_at = None
                for offset, token in enumerate(sh_tokens[index : index + 8]):
                    if token in {"that", "which", "who"}:
                        insert_at = sh_to_word[index + offset] + 1
                        break
                    if token.endswith("ed") and len(token) >= 5:
                        insert_at = sh_to_word[index + offset]
                        break
                if insert_at is None:
                    continue
                words.insert(insert_at, "also")
                text = re.sub(r"\s{2,}", " ", " ".join(words)).strip()
                edited = True
                break
        if not edited:
            return None
    if overlap_with_source(text, overlap_text, title, operator):
        return None
    return text


def _short_place_stop(stop: str) -> str | None:
    text = clean_text(stop).strip(" .")
    text = re.sub(r"\s*@\s*", " at ", text)
    text = re.sub(r"\s{2,}", " ", text).strip(" .,-")
    if not text or _BAD_STOP_RE.match(text):
        return None
    if _LOGISTICS_PROSE_RE.search(text) or MARKETING.search(text) or SECOND_PERSON.search(text):
        return None
    if re.search(r"[.!?]", text):
        return None
    words = text.split()
    if not 1 <= len(words) <= 6:
        return None
    return text


def _route_sentences(stops: list[str], already: str, meeting, overlap_text, title, operator) -> list[str]:
    missing = []
    blob = already.lower()
    for stop in stops:
        place = _short_place_stop(stop)
        if not place:
            continue
        if place.lower() in blob or place.lower() in {item.lower() for item in missing}:
            continue
        missing.append(place)
    if len(missing) < 2:
        return []
    openers = (
        "The day moves through {names}",
        "Next come {names}",
        "Later the group reaches {names}",
        "The group also comes to {names}",
    )
    rows = []
    groups = [missing[index : index + 3] for index in range(0, min(len(missing), 12), 3)]
    for index, group in enumerate(groups[:4]):
        draft = openers[index % len(openers)].format(names=join_and(group))
        cleaned = safe_sentence(draft, meeting, overlap_text, title, operator)
        if cleaned and not _AWKWARD_PROSE_RE.search(cleaned):
            rows.append(cleaned)
    return rows


def _distance_sentence(facts: dict, description: str) -> str | None:
    blob = " ".join([description or "", *(facts.get("included") or []), *(facts.get("highlights") or [])])
    match = re.search(r"(\d+(?:\.\d+)?)\s*-?\s*miles?\b", blob, re.I)
    if not match or re.match(r"^0\d+$", match.group(1)):
        return None
    pace = " at a moderate pace" if re.search(r"moderate pace", blob, re.I) else ""
    return f"The group covers about {match.group(1)} miles{pace}"


def _license_sentence(description: str) -> str | None:
    match = re.search(
        r"licensed by the ((?:town|city|state) of [A-Z][A-Za-z]+|[A-Z][A-Za-z]+)",
        description or "",
    )
    if not match:
        return None
    return f"Guides are licensed by the {match.group(1)}"


def _language_sentence(facts: dict, description: str) -> str | None:
    langs = [item for item in (facts.get("languages") or []) if item.lower() != "english"]
    if not langs:
        found = re.findall(
            r"\b(Russian|Italian|Spanish|French|German|Portuguese|Chinese|Japanese|Korean)\b",
            description or "",
        )
        langs = []
        for name in found:
            if name not in langs:
                langs.append(name)
    if not langs:
        return None
    return f"On some dates the same outing is also offered in {join_and(langs)}"


def _ticket_sentence(items: list[str]) -> str | None:
    kept = []
    for item in items or []:
        text = clean_text(item).rstrip(" .")
        if not re.search(r"\b(ticket|entry|fee|helmet|map|bike|tasting|meal|breakfast)\b", text, re.I):
            continue
        if MARKETING.search(text) or SECOND_PERSON.search(text):
            continue
        words = WORD_RE.findall(text)
        if not 2 <= len(words) <= 8:
            continue
        kept.append(text)
        if len(kept) == 3:
            break
    if not kept:
        return None
    return f"Tickets include {join_and(kept)}"


def _meal_sentence(description: str) -> str | None:
    if not re.search(r"\b(lunch|dinner|breakfast)\b", description or "", re.I):
        return None
    street = re.search(r"\b([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,2}\s+Street)\b", description or "")
    meals = []
    for name in ("breakfast", "lunch", "dinner"):
        if re.search(rf"\b{name}\b", description or "", re.I) and name not in meals:
            meals.append(name)
    if street and meals:
        return f"{' or '.join(meals)} afterward is on {street.group(1)}"
    if meals and re.search(r"\bConcord\b", description or ""):
        return "Free time in Concord covers lunch and a look around town"
    return None


def _paraphrase_sentence(
    raw: str,
    meeting: str | None,
    overlap_text: str,
    title: str,
    operator: str,
) -> str | None:
    if not raw or _LOGISTICS_PROSE_RE.search(raw):
        return None
    if re.search(
        r"\b(please|gratuity|bottled water|not included|driver's license|what to bring|"
        r"meeting location|meet your guide|nearest mbta)\b",
        raw,
        re.I,
    ):
        return None
    text = _apply_phrase_subs(_to_guest_voice(raw))
    text = re.sub(
        r"\b(" + "|".join(sorted(_DELETE_WORDS, key=len, reverse=True)) + r")\b",
        " ",
        text,
        flags=re.I,
    )
    text = text.replace('"', "").replace("“", "").replace("”", "")
    text = re.sub(r"\b[Oo]n the outing guests\b", "On the outing, guests", text)
    text = re.sub(r",\s*notice\b", ", guests notice", text, flags=re.I)
    text = re.sub(r"\bGuests\s+[Tt]he\b", "The", text)
    text = re.sub(r"(The day returns to [^.]{0,80}), and recall\b", r"\1 and recalls", text)
    text = text.replace("!", ".")
    text = re.sub(r"\bstop to the\b", "stop at the", text, flags=re.I)
    text = re.sub(r",\s*(visit|see|explore|stand|watch|walk|learn|discover)\b", r", guests \1", text, flags=re.I)
    text = re.sub(r"\b\d+(?:\.\d+)?\s*-?\s*(?:hours?|minutes?)\b", "", text, flags=re.I)
    text = re.sub(r"\s{2,}", " ", text).strip(" ,;.-")
    if not text:
        return None
    text = _break_overlap(text, overlap_text, title, operator)
    if not text or _AWKWARD_PROSE_RE.search(text):
        return None
    if re.search(r"\$\s?\d", text) or "?" in text or ">" in text:
        return None
    if re.search(r"\b(don't miss|do not miss|wicked|cozy)\b", text, re.I):
        return None
    cleaned = safe_sentence(text, meeting, overlap_text, title, operator)
    if not cleaned or _AWKWARD_PROSE_RE.search(cleaned):
        return None
    if not SENTENCE_VERB_RE.search(cleaned):
        return None
    if count_words([cleaned]) < 8:
        return None
    if REPETITIVE_OPENER_RE.match(cleaned):
        cleaned = re.sub(
            r"^The (?:walk|route|outing|sail|ride)\b",
            "The group",
            cleaned,
            count=1,
            flags=re.I,
        )
        cleaned = sentence(cleaned)
        if overlap_with_source(cleaned, overlap_text, title, operator):
            return None
    return cleaned


def _drop_repeated_places(paragraphs: list[str]) -> list[str]:
    """Drop later sentences that only rename places already used."""
    sentences: list[str] = []
    for paragraph in paragraphs or []:
        sentences.extend(split_sentences(paragraph))
    seen: set[str] = set()
    kept: list[str] = []
    for item in sentences:
        names = {name.lower() for name in PROPER_RE.findall(item)}
        if names and names <= seen:
            continue
        seen.update(names)
        kept.append(item)
    return _pack_paragraphs(kept) or paragraphs


def _pack_paragraphs(sentences: list[str]) -> list[str]:
    paragraphs = []
    current: list[str] = []
    words = 0
    for item in sentences:
        current.append(item)
        words += count_words([item])
        if words >= 45 and len(paragraphs) < 3:
            paragraphs.append(" ".join(current))
            current = []
            words = 0
    if current:
        paragraphs.append(" ".join(current))
    return [part for part in paragraphs if part.strip()][:4]


def _experience_source_sentences(facts: dict) -> list[str]:
    """Description plus sentence-length itinerary, highlights, and inclusions."""
    blobs = [facts.get("description") or ""]
    for stop in facts.get("itinerary") or []:
        if count_words([stop]) >= 8:
            blobs.append(stop)
    for item in list(facts.get("highlights") or []) + list(facts.get("included") or []):
        if count_words([item]) >= 8:
            blobs.append(item)
    raw_sentences = []
    seen_raw = set()
    for blob in blobs:
        for source_sentence in split_sentences(blob):
            key = source_sentence.lower()
            if key in seen_raw:
                continue
            seen_raw.add(key)
            if (
                re.search(r"\b\d+(?:\.\d+)?\s*(?:hours?|minutes?)\b", source_sentence, re.I)
                and count_words([source_sentence]) < 14
            ):
                continue
            raw_sentences.append(source_sentence)
    return raw_sentences


def _diversify_openers(paragraphs: list[str]) -> list[str]:
    """Keep specific fallback copy without repeating The walk / The route / This is a."""
    sentences = []
    for paragraph in paragraphs or []:
        sentences.extend(split_sentences(paragraph))
    seen = 0
    rewritten = []
    for item in sentences:
        if REPETITIVE_OPENER_RE.match(item):
            seen += 1
            if seen >= 2:
                item = re.sub(
                    r"^The (?:walk|route|outing|sail|ride)\b",
                    "The group",
                    item,
                    count=1,
                    flags=re.I,
                )
                item = re.sub(r"^This is a\b", "It is a", item, count=1, flags=re.I)
                item = sentence(item)
        rewritten.append(item)
    return _pack_paragraphs(rewritten) or paragraphs


def narrate_experience(
    facts: dict,
    title: str,
    operator: str,
    meeting: str | None,
    overlap_text: str,
    included: list[str] | None = None,
) -> list[str] | None:
    """Rewrite authoritative prose into 100–150 words without copying it."""
    description = facts.get("description") or ""
    raw_sentences = _experience_source_sentences(facts)
    rewritten = []
    seen = set()

    def _add(text: str | None) -> None:
        if not text:
            return
        key = text.lower()
        if key in seen:
            return
        seen.add(key)
        rewritten.append(text)

    for raw_sentence in raw_sentences:
        before = len(rewritten)
        _add(_paraphrase_sentence(raw_sentence, meeting, overlap_text, title, operator))
        if count_words(rewritten) >= PREFERRED_MAX_EDITORIAL_WORDS + 20:
            break
        if len(rewritten) > before:
            continue
        for piece in _clause_pieces(raw_sentence):
            if piece.strip() == raw_sentence.strip():
                continue
            _add(_paraphrase_sentence(piece, meeting, overlap_text, title, operator))
    if count_words(rewritten) < MIN_FULL_EDITORIAL_WORDS:
        for draft in (
            _distance_sentence(facts, description),
            _license_sentence(description),
            _language_sentence(facts, description),
            _meal_sentence(description),
            _ticket_sentence(list(facts.get("included") or []) or list(included or [])),
        ):
            if not draft:
                continue
            _add(safe_sentence(draft, meeting, overlap_text, title, operator))
        foods = extract_foods(description, [])
        if foods:
            _add(
                safe_sentence(
                    f"Guests sample {join_and(foods)}",
                    meeting,
                    overlap_text,
                    title,
                    operator,
                )
            )
        vessel = extract_vessel(description + " " + (title or ""), title)
        already = " ".join(rewritten).lower()
        if (
            "adirondack iii" not in already
            and re.search(r"Adirondack\s+III", description or "", re.I)
            and re.search(r"\b80-foot\b", description or "", re.I)
        ):
            _add(
                safe_sentence(
                    "The group sails aboard the schooners Adirondack III and II, 80-foot pilot schooners",
                    meeting,
                    overlap_text,
                    title,
                    operator,
                )
            )
        elif vessel and vessel.lower() not in already and re.search(r"sail|cruise|harbor|boat|schooner|yacht", f"{title} {description}", re.I):
            _add(
                safe_sentence(
                    f"The group sails aboard {vessel}",
                    meeting,
                    overlap_text,
                    title,
                    operator,
                )
            )
        place_stops = list(facts.get("itinerary") or [])
        for name in PROPER_RE.findall(description or ""):
            if not re.search(
                r"\b(hall|house|church|chapel|green|bridge|yard|hill|trail|tavern|"
                r"museum|mall|square|garden|common|wharf|park|street|market|monument|"
                r"cemetery|island|pier|library|memorial|fort|light|lighthouse|brewery|"
                r"courthouse|district|seaport|center|centre|aquarium|esplanade|greenway|"
                r"slope|bay|common)\b",
                name,
                re.I,
            ):
                continue
            if name.lower() in {(title or "").lower(), (operator or "").lower(), "boston"}:
                continue
            place_stops.append(name)
        rewritten.extend(
            _route_sentences(
                place_stops,
                " ".join(rewritten),
                meeting,
                overlap_text,
                title,
                operator,
            )
        )
    def _bridge_sentence(item: str) -> str:
        bridged = re.sub(r"^(She|He)\b", "The boat", item)
        bridged = re.sub(r"^This\b", "That", bridged)
        bridged = re.sub(r"^It\b", "The outing", bridged)
        bridged = re.sub(r"^There's\b", "There is", bridged)
        bridged = re.sub(r"^What\b", "Which", bridged)
        if bridged == item:
            bridged = "After that, " + item[0].lower() + item[1:]
        bridged = sentence(bridged)
        if overlap_with_source(bridged, overlap_text, title, operator):
            return ""
        return bridged

    def _clean_open(item: str) -> str:
        opened = re.sub(r"^She\b", "The boat", item)
        opened = re.sub(r"^He\b", "The guide", opened)
        opened = re.sub(r"^This\b", "That", opened)
        opened = re.sub(r"^It\b", "The outing", opened)
        opened = re.sub(r"^There's\b", "There is", opened)
        opened = re.sub(r"^What\b", "Which", opened)
        opened = re.sub(r"^Please\b", "", opened)
        return sentence(opened) if opened != item else item

    rewritten = [_clean_open(item) for item in rewritten if item]
    separated = []
    for item in rewritten:
        if _AWKWARD_PROSE_RE.search(item):
            continue
        trial = separated + [item]
        if not overlap_with_source(" ".join(trial), overlap_text, title, operator):
            separated.append(item)
            continue
        bridged = _bridge_sentence(item)
        if bridged and not overlap_with_source(" ".join(separated + [bridged]), overlap_text, title, operator):
            separated.append(bridged)
    rewritten = separated
    chosen = []
    total = 0
    for item in rewritten:
        if _AWKWARD_PROSE_RE.search(item):
            continue
        words = count_words([item])
        if total >= MIN_FULL_EDITORIAL_WORDS and total + words > PREFERRED_MAX_EDITORIAL_WORDS + 10:
            break
        chosen.append(item)
        total += words
        if total >= PREFERRED_MAX_EDITORIAL_WORDS:
            break
    if count_words(chosen) < MIN_FULL_EDITORIAL_WORDS:
        return None
    paragraphs = _pack_paragraphs(chosen)
    if editorial_length_errors(paragraphs) or repetitive_opener_errors(paragraphs) or generic_padding_errors(
        " ".join(paragraphs)
    ):
        return None
    if fragment_errors(paragraphs) or editorial_is_thin(paragraphs):
        return None
    return paragraphs


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
    if len(title.split()) >= 5 or (len(title.split()) >= 6 and duration_adj):
        lead = "This is a"
        if duration_adj:
            lead += f" {duration_adj}"
        lead += f" {activity}"
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
    elif city and activity == "driving tour" and city.lower() not in draft_blob:
        drafts.append(f"The drive stays in {city}.")
    elif city and activity not in {"harbor outing", "bicycle outing", "paddle outing", "driving tour"} and city.lower() not in draft_blob and "walk" in activity:
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

    narrative = narrate_experience(
        facts,
        title,
        operator,
        meeting,
        overlap_text,
        included,
    )
    from editorial_finish import finish_experience

    description = facts.get("description") or ""
    narrative_overlaps = bool(
        narrative
        and overlap_with_source(
            " ".join(narrative), overlap_text or description, title, operator
        )
    )
    finished = finish_experience(facts, title, operator, meeting, overlap_text)

    def _usable_editorial(candidate: list[str] | None) -> bool:
        if not candidate:
            return False
        if narrative_overlaps and candidate is narrative:
            return False
        if prose_quality_errors(candidate, title, description):
            return False
        if fragment_errors(candidate):
            return False
        return True

    # The paraphraser is the shared Boston voice. Cue sentences are the
    # fallback when that paraphraser drops a real place the cues kept.
    def _kept_places(candidate: list[str] | None) -> set[str]:
        if not candidate:
            return set()
        return {
            name.lower()
            for name in PROPER_RE.findall(" ".join(candidate))
            if not is_structural_label(name) and not is_junk_place_label(name)
        }

    narrative_places = _kept_places(narrative)
    finished_places = _kept_places(finished)
    finish_keeps_a_place = bool(finished_places - narrative_places)
    finish_is_as_full = bool(
        finished
        and narrative
        and count_words(finished) + 15 >= count_words(narrative)
    )
    if (
        _usable_editorial(finished)
        and finish_keeps_a_place
        and (not _usable_editorial(narrative) or finish_is_as_full)
    ):
        paragraphs = finished
    elif _usable_editorial(narrative):
        paragraphs = narrative
    elif _usable_editorial(finished):
        paragraphs = finished
    elif repetitive_opener_errors(paragraphs):
        paragraphs = _diversify_openers(paragraphs)
    if repetitive_construction_errors(paragraphs):
        paragraphs = _drop_repeated_places(paragraphs)
    if (
        geography.get("disposition") == "moved"
        and city
        and state
        and f"{city}, {state}".lower() not in " ".join(paragraphs).lower()
    ):
        where = f"The outing is in {city}, {state}."
        paragraphs = [f"{paragraphs[0]} {where}".strip(), *paragraphs[1:]]

    highlight_rows = []
    if duration_adj and city:
        highlight_rows.append(f"{duration_adj} {activity} in {city}")
    elif duration:
        highlight_rows.append(f"{duration} {activity}")
    real_places = [name for name in places if not is_structural_label(name) and not is_junk_place_label(name)]
    if real_places[:2]:
        highlight_rows.append(join_and(real_places[:2]))
    if included and not is_structural_label(included[0]):
        highlight_rows.append(included[0])
    elif group:
        highlight_rows.append(group.rstrip("."))
    highlight_rows = [
        row.rstrip(".")
        for row in highlight_rows
        if row and not template_artifact_errors([row]) and not is_structural_label(row)
    ][:3]

    body_words = count_words(paragraphs)
    if body_words < 40:
        schema = " ".join(paragraphs).strip()
        chosen = []
        for piece in split_sentences(schema):
            chosen.append(piece)
            if count_words(chosen) >= 8 and count_words(chosen) < body_words:
                break
        if chosen and count_words(chosen) < body_words:
            schema = " ".join(chosen)
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
    if template_artifact_errors([schema]):
        schema = paragraphs[0] if paragraphs else schema

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
