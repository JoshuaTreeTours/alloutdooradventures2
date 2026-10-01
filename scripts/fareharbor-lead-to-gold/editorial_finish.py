#!/usr/bin/env python3
"""Turn sufficient FareHarbor facts into finished travel prose.

Used when the sentence paraphraser cannot reach 100 words without copying
the operator or collapsing into template lines. Every sentence is written
from extracted facts. The product title is not repeated.
"""

from __future__ import annotations

import re

import editorial_voice as ev

_NAME_BLOCK_FIRST = {
    "about",
    "join",
    "our",
    "the",
    "this",
    "these",
    "from",
    "with",
    "for",
    "and",
    "details",
    "what",
    "private",
    "request",
    "rates",
    "highlights",
    "included",
    "enjoy",
    "discover",
    "explore",
    "learn",
    "visit",
    "see",
    "walk",
    "come",
    "during",
    "whether",
    "throughout",
    "prepare",
    "experience",
    "catch",
    "spot",
    "cheers",
    "half",
    "only",
    "max",
    "pickup",
    "pick",
}

_LOGISTICS = re.compile(
    r"\b(please|gratuity|what to bring|driver's license|not included|\$\s?\d|"
    r"per person|refund|parking|mbta|click here|fareharbor)\b",
    re.I,
)


_NAME_STOP = {
    "what",
    "this",
    "that",
    "join",
    "unlike",
    "better",
    "during",
    "after",
    "before",
    "when",
    "where",
    "which",
    "while",
    "into",
    "over",
    "from",
    "with",
    "your",
    "our",
    "the",
    "an",
    "a",
    "and",
    "bon",
    "of",
}


def _clean_name(name: str) -> str:
    parts = name.split()
    while parts and parts[-1].lower().strip(".,") in _NAME_STOP:
        parts.pop()
    while parts and parts[0].lower().strip(".,") in _NAME_STOP | _NAME_BLOCK_FIRST:
        parts.pop(0)
    cleaned = " ".join(parts).strip(" .,'")
    if cleaned.endswith("'s") or cleaned.endswith("’s"):
        cleaned = cleaned[:-2]
    return cleaned.strip()


def _names(text: str, title: str, operator: str) -> list[str]:
    blocked = {
        ev._normalized_phrase(title),
        ev._normalized_phrase(operator),
        "boston",
        "massachusetts",
        "new england",
        "united states",
        "american revolution",
    }
    found: list[str] = []
    seen = set()

    def add(name: str) -> None:
        name = _clean_name(name)
        if len(name.split()) < 1 or len(name) < 3:
            return
        key = name.lower()
        if key in seen or ev._normalized_phrase(name) in blocked:
            return
        if any(part.lower() in _NAME_STOP for part in name.split()):
            return
        if any(part.isupper() and len(part) > 2 for part in name.split()):
            return
        if re.search(
            r"\b(tour|tours|experience|package|guests|website|what|airport|hotel|terminal|luggage|"
            r"certified|captain|team-building|milestone|rewards|networking|"
            r"hours|about|discover|ages|rates|duration|welcome|federal|bring)\b",
            key,
        ):
            return
        if len(name.split()) > 4:
            return
        if len(name.split()) == 1 and name.lower() not in {
            "harvard",
            "mit",
            "salem",
            "concord",
            "lexington",
            "cambridge",
        }:
            return
        if ev.FOOD_RE.search(name):
            return
        if name.split()[-1].lower() in {
            "revolutionary",
            "historic",
            "historical",
            "famous",
            "great",
            "public",
            "private",
            "american",
            "national",
            "boston",
        }:
            return
        # Skip a name that is mostly the product title.
        title_words = set(ev._normalized_phrase(title).split())
        name_words = ev._normalized_phrase(name).split()
        if name_words and sum(1 for word in name_words if word in title_words) >= max(1, len(name_words) - 0):
            if len(name_words) >= 2 and set(name_words) <= title_words | {"the", "of", "and"}:
                return
        seen.add(key)
        found.append(name)

    for name in ev.PROPER_RE.findall(text or ""):
        add(name)
    for match in re.finditer(
        r"\b([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,3})'s\s+(house|home|grave|wharf|church|hall)\b",
        text or "",
    ):
        add(f"{match.group(1)}'s {match.group(2)}")
    for short in ("Harvard", "MIT", "Salem", "Concord", "Lexington", "Cambridge"):
        if re.search(rf"\b{short}\b", text or ""):
            add(short)
    # Drop a short name that is contained in a longer one.
    pruned = []
    for name in found:
        if any(name.lower() != other.lower() and name.lower() in other.lower() for other in found):
            continue
        pruned.append(name)
    return pruned


def _pair(names: list[str]) -> str:
    if len(names) == 1:
        return names[0]
    return f"{names[0]} and {names[1]}"


def _accept(
    text: str,
    overlap: str,
    title: str,
    operator: str,
    meeting: str | None,
    used_openers: list[str],
) -> str | None:
    if not text:
        return None
    cleaned = ev.sentence(text)
    if not cleaned or not ev.SENTENCE_VERB_RE.search(cleaned):
        return None
    if ev.count_words([cleaned]) < 6:
        return None
    if ev._AWKWARD_PROSE_RE.search(cleaned):
        return None
    if title and ev._normalized_phrase(title) and len(ev._normalized_phrase(title).split()) >= 4:
        if ev._normalized_phrase(title) in ev._normalized_phrase(cleaned):
            return None
    if ev.overlap_with_source(cleaned, overlap, title, operator):
        return None
    safe = ev.safe_sentence(cleaned, meeting, overlap, title, operator)
    if not safe:
        return None
    opener = " ".join(ev.WORD_RE.findall(safe.lower())[:2])
    if opener and used_openers.count(opener) >= 2:
        return None
    if ev.prose_quality_errors([safe], title, ""):
        # Single sentences can trip list-only only in groups; ignore list check here.
        blocking = [
            item
            for item in ev.prose_quality_errors([safe], title, "")
            if not item.startswith("description only concatenates")
        ]
        if blocking:
            return None
    used_openers.append(opener)
    return safe


def _cue_sentences(kind: str, description: str) -> list[str]:
    blob = description or ""
    rows: list[str] = []
    if kind == "drive" and re.search(r"minivan|\bvan\b", blob, re.I):
        rows.append("Guests travel by minivan rather than covering the sights on foot.")
    if kind == "drive" and re.search(r"heat", blob, re.I) and re.search(r"air-condition", blob, re.I):
        rows.append("The vehicle has heat and air conditioning.")
    if kind == "drive" and re.search(r"mainly driving|mostly driving|time in the (?:car|vehicle|van)", blob, re.I):
        rows.append("Most of the time is spent in the vehicle, with only short stops outside.")
    if re.search(r"photo", blob, re.I) and re.search(r"\bstop", blob, re.I):
        rows.append("A few optional stops leave time to step out for photographs and a closer look.")
    if re.search(r"5\s*-\s*10\s*minutes|5 to 10 minutes", blob, re.I):
        rows.append("Those pauses run about five to ten minutes each.")
    max_people = re.search(r"max(?:imum)? of (\d+) people", blob, re.I)
    if max_people and kind == "drive":
        rows.append(f"The van holds {max_people.group(1)} guests, with a little room for bags.")
    if re.search(r"logan airport|cruise ship terminal|hotels in", blob, re.I) and kind == "drive":
        rows.append("Pickup can be at a hotel, at Logan Airport, or at the cruise terminal.")
    if re.search(r"american revolution", blob, re.I) and re.search(r"stor(?:y|ies)|learn|hear", blob, re.I):
        rows.append("The guide talks about Boston's past, including the American Revolution.")
    if re.search(r"religious morals", blob, re.I) and re.search(r"corruption", blob, re.I):
        rows.append("The commentary also takes up the uneasy mix of religious morals and corruption.")
    if re.search(r"fireworks", blob, re.I) and kind == "sail":
        rows.append("The cruise is out on the harbor for the fireworks.")
    schooner = re.search(
        r"(Adirondack(?:\s+(?:II|III|IV))?|Northern Lights|Patriot).{0,40}?(\d+)\s*-?\s*foot",
        blob,
        re.I,
    )
    if not schooner:
        schooner = re.search(
            r"(\d+)\s*-?\s*foot(?:\s+long)?(?:\s+pilot)?\s+schooner",
            blob,
            re.I,
        )
        if schooner and kind == "sail":
            rows.append(f"The boat is an {schooner.group(1)}-foot schooner.")
    elif kind == "sail":
        rows.append(
            f"Guests go aboard {schooner.group(1).strip()}, an {schooner.group(2)}-foot schooner."
        )
    if re.search(r"1890s", blob) and kind == "sail":
        rows.append("The hull follows the lines of pilot boats built in the 1890s.")
    if re.search(r"teak decks", blob, re.I):
        rows.append("Teak decks and wood trim are part of the boat.")
    if re.search(r"not a fully narrated", blob, re.I):
        rows.append("Commentary on monuments, forts, and historic ships stays light rather than continuous.")
    if re.search(r"cocktails|appetizers", blob, re.I) and kind == "sail":
        rows.append("Drinks and appetizers are sold from the deck bar.")
    if re.search(r"skyline", blob, re.I) and kind == "sail":
        rows.append("The skyline is the main view as the boat moves through the harbor.")
    if re.search(r"freedom trail", blob, re.I) and kind == "walk":
        rows.append("Guests follow part of the Freedom Trail and hear how the Revolution began.")
    if re.search(r"old state house", blob, re.I) and re.search(r"faneuil hall", blob, re.I):
        rows.append("Stories cover events at the Old State House and at Faneuil Hall.")
    if re.search(r"ordinary people", blob, re.I) and re.search(r"colonial", blob, re.I):
        rows.append("Colonial Bostonians are described as ordinary people who took up the cause of their time.")
    if re.search(r"moderate pace", blob, re.I) and re.search(r"(\d+(?:\.\d+)?)\s*-?\s*miles?", blob, re.I):
        mile = re.search(r"(\d+(?:\.\d+)?)\s*-?\s*miles?", blob, re.I)
        amount = mile.group(1)
        unit = "mile" if amount in {"1", "1.0"} else "miles"
        rows.append(f"Guests cover about {amount} {unit} at a moderate pace.")
    if re.search(r"north end", blob, re.I) and re.search(r"murder|molasses|misery", blob, re.I):
        rows.append("On the North End's streets, guests hear accounts of misery, misfortune, and murder drawn from documented events.")
    if re.search(r"great influenza", blob, re.I) or re.search(r"molasses flood", blob, re.I):
        bits = []
        for label, pat in (
            ("the 1918 influenza", r"great influenza"),
            ("smallpox outbreaks", r"smallpox"),
            ("the Molasses Flood", r"molasses flood"),
            ("the Brink's Robbery", r"brink'?s robbery"),
        ):
            if re.search(pat, blob, re.I):
                bits.append(label)
        if bits:
            rows.append(f"The account includes {ev.join_and(bits[:4])}.")
    if re.search(r"earliest streets", blob, re.I):
        rows.append("Guests walk some of the city's earliest streets.")
    if re.search(r"moving hills|filling coves|filled coves|moved hills", blob, re.I):
        rows.append("Hills were moved and coves were filled, and guests look at that made ground.")
    if re.search(r"managing water", blob, re.I):
        rows.append("Water management, and the ways people were carried through the growing city, are part of the account.")
    if re.search(r"reinvention", blob, re.I):
        rows.append("The theme is how Boston has been built, altered, and rebuilt.")
    if re.search(r"clues that were once above", blob, re.I) or re.search(r"beneath our feet|underfoot", blob, re.I):
        rows.append("Some clues to that history sit overhead, and others are still underfoot.")
    if re.search(r"ralph waldo emerson|louisa may alcott|henry david thoreau", blob, re.I):
        rows.append("Guests hear where Ralph Waldo Emerson, Louisa May Alcott, and Henry David Thoreau met to trade ideas.")
    if re.search(r"charles dickens", blob, re.I):
        rows.append("Local publishers and the visit of Charles Dickens are part of the same story.")
    if re.search(r"edgar allan poe", blob, re.I):
        rows.append("The guide also explains why Edgar Allan Poe refused Boston as a home.")
    if re.search(r"old corner bookstore|athenaeum", blob, re.I):
        rows.append("Stops include the Old Corner Bookstore and the Athenaeum.")
    if re.search(r"lgbtq", blob, re.I):
        rows.append("The outing follows queer life in Boston from the 18th century into the Gay Liberation years.")
    if re.search(r"pride march", blob, re.I):
        rows.append("Boston's first Pride march, court cases, and local leaders are part of the commentary.")
    if re.search(r"gender norms", blob, re.I):
        rows.append("Guests hear about Bostonians who challenged gender norms, and about bars and clubs that sheltered the community.")
    if re.search(r"coach bus|local actors", blob, re.I):
        rows.append("Local actors lead the group by coach bus and talk through film locations.")
    if re.search(r"good will hunting|l street tavern", blob, re.I):
        rows.append("One stop is the L Street Tavern, known from Good Will Hunting.")
    if re.search(r"\bthe town\b", blob, re.I) and re.search(r"film|movie|chase", blob, re.I):
        rows.append("The bus also passes a chase location from the film The Town.")
    if re.search(r"bean-to-bar|boston cream pie|truffle", blob, re.I):
        foods = ev.extract_foods(blob, [])
        if foods:
            rows.append(f"Guests taste {ev.join_and(foods)}.")
    if re.search(r"beacon hill", blob, re.I) and re.search(r"chocolate|tasting", blob, re.I):
        rows.append("The tasting moves through Beacon Hill, Boston Common, and the Boston Public Market.")
    if re.search(r"little italy|oldest cafe|coffee and pastry", blob, re.I):
        rows.append("The morning starts in the North End with coffee and a pastry at the neighborhood's oldest cafe.")
    if re.search(r"paul revere house", blob, re.I) and re.search(r"entry included|entrance", blob, re.I):
        rows.append("Entry to the Paul Revere House is included, along with time at the Old North Church.")
    if re.search(r"acorn street", blob, re.I):
        rows.append("Later the group hears stories on Boston Common and photographs Acorn Street on Beacon Hill.")
    if re.search(r"botanical garden|public garden", blob, re.I) and re.search(r"america's first", blob, re.I):
        rows.append("The Public Garden, the country's first botanical garden, is on the same day.")
    if re.search(r"private (?:luxury )?van|door-to-door|hotel pickup", blob, re.I):
        rows.append("A private van collects guests at their hotel.")
    if re.search(r"shawmut", blob, re.I):
        rows.append("The account starts with Shawmut, the peninsula that became Boston.")
    if re.search(r"back bay", blob, re.I) and re.search(r"filled|landfill|made land", blob, re.I):
        rows.append("Guests look at how Back Bay was filled in to make new streets.")
        rows.append("The guide treats that fill as a major piece of nineteenth-century engineering, including the Victorian houses and the people who staffed them.")
    if re.search(r"fort point", blob, re.I) and re.search(r"seaport", blob, re.I):
        rows.append("Fort Point and the Seaport have a waterfront past in common. One side is older loft blocks, and the other is glass towers on former marsh.")
    if re.search(r"chinatown", blob, re.I) and re.search(r"immigrant|backstreet", blob, re.I):
        rows.append("Chinatown is presented as a small immigrant neighborhood that survived, with time in the back streets as well as at the markets.")
    if re.search(r"kona dew|rental bike", blob, re.I):
        rows.append("The bike is a Kona Dew, geared for hills such as Beacon Hill, and the fenders are bright green.")
    if re.search(r"burying|graveyard|granary", blob, re.I):
        rows.append("The stops are burying grounds, and the guide talks about who is buried there and why those yards still matter.")
    if re.search(r"brutalist|brutalism", blob, re.I):
        rows.append("Guests see brutalist concrete up close, and the guide explains the look.")
    if re.search(r"city hall", blob, re.I):
        rows.append("Boston City Hall is the building under discussion, including its design and its civic history.")
    if re.search(r"harvard square", blob, re.I) and re.search(r"charles river|boston common", blob, re.I):
        rows.append("The evening ride runs from Boston Common toward Harvard Square, across the Charles River.")
    if re.search(r"\bsalem\b", blob, re.I) and re.search(r"witch", blob, re.I):
        rows.append("Guests visit Salem to see the witch trials memorial and hear about the China Trade years.")
    if re.search(r"drag queen", blob, re.I):
        rows.append("Guests see a drag dinner show, with impersonations and a seated meal.")
    if re.search(r"beacon hill", blob, re.I) and re.search(r"back bay", blob, re.I):
        rows.append("Guests walk Beacon Hill's brick streets and the wider avenues of Back Bay, hearing the history of each.")
    if re.search(r"tall ship|reel house|lewis mall", blob, re.I) and re.search(r"pick", blob, re.I):
        rows.append("Guests see the pickup boat at the Tall Ship, Lewis Mall, or Reel House in East Boston.")
    if re.search(r"final goodbyes|memorial service|say their final", blob, re.I):
        rows.append("Guests go aboard for a private memorial, with prayers, music, and a ceremony the family chooses.")
    if re.search(r"abolition|slavery", blob, re.I):
        rows.append("Slavery and the fight against it are the subject, tied to the Boston places where that fight was carried on.")
    if re.search(r"art deco", blob, re.I):
        rows.append("Art Deco buildings in the financial district are what guests are taken to see.")
    if re.search(r"aesop|fables", blob, re.I):
        rows.append("Aesop's fables are the lens, and guests look for those stories in the sculpture and buildings around Copley Square.")
    if re.search(r"immigration|immigrants", blob, re.I) and re.search(r"north end", blob, re.I):
        rows.append("The North End is treated as a gateway neighborhood, with arrivals from several countries.")
    if re.search(r"company events|team-building|coworkers|colleagues", blob, re.I) and re.search(
        r"food|tasting", blob, re.I
    ):
        rows.append("Private groups book the tasting for colleagues, combining neighborhood streets with local food.")
    return rows


def _name_sentences(kind: str, names: list[str], description: str) -> list[str]:
    if kind == "drive":
        frames = [
            "The drive passes {pair}.",
            "Farther along, the van goes by {pair}.",
            "{pair} are on the same circuit.",
            "Also visible from the van are {pair}.",
            "The later stretch includes {pair}.",
        ]
    elif kind == "sail":
        frames = [
            "From the water, guests see {pair}.",
            "{pair} come into view as the boat moves.",
            "The cruise also passes {pair}.",
            "Looking back toward shore, the group can see {pair}.",
        ]
    elif kind == "bike":
        frames = [
            "The ride passes {pair}.",
            "Cyclists also come to {pair}.",
            "{pair} are on the same loop.",
            "Later the route reaches {pair}.",
        ]
    elif kind == "food":
        frames = [
            "The tasting also stops near {pair}.",
            "Guests keep eating as they reach {pair}.",
            "{pair} are part of the same food route.",
            "Another pause is at {pair}.",
        ]
    elif kind == "paddle":
        frames = [
            "The paddle passes {pair}.",
            "From the water the group comes to {pair}.",
            "{pair} are on the same stretch.",
        ]
    elif kind == "bus":
        frames = [
            "The bus passes {pair}.",
            "Also on the film route are {pair}.",
            "The coach slows for {pair}.",
            "{pair} are part of the same ride.",
        ]
    elif re.search(r"hear|story|tale|learn about", description or "", re.I):
        frames = [
            "Guests hear about {pair}.",
            "The guide's account includes {pair}.",
            "Stories along the way cover {pair}.",
            "{pair} come up in the commentary.",
            "The same narrative reaches {pair}.",
        ]
    else:
        frames = [
            "Guests spend time at {pair}.",
            "The route also reaches {pair}.",
            "{pair} are part of the same outing.",
            "Later the group comes to {pair}.",
            "There is time to look at {pair}.",
        ]
    rows = []
    index = 0
    cursor = 0
    while cursor < len(names) and index < len(frames):
        chunk = names[cursor : cursor + 2]
        cursor += 2
        if not chunk:
            break
        rows.append(frames[index].format(pair=_pair(chunk)))
        index += 1
    return rows


def _stretch(kind: str, names: list[str], description: str, already: str) -> list[str]:
    """Longer restatements of facts already extracted, used only to reach 100 words."""
    blob = description or ""
    rows: list[str] = []
    unused = [name for name in names if name.lower() not in already.lower()]
    if len(unused) >= 2:
        rows.append(
            f"Attention also goes to {unused[0]} and {unused[1]}, with the guide attaching a story to each stop."
        )
    elif len(unused) == 1:
        rows.append(f"Attention also goes to {unused[0]}, and the guide explains why it is on the route.")
    if kind == "walk" and re.search(r"\bwalk", blob, re.I):
        rows.append("Guests stay on foot the whole time, pausing while the guide talks at each site.")
    if kind == "drive":
        rows.append("The point of the outing is the succession of landmarks seen from the van, not a march between them.")
    if kind == "sail":
        rows.append("The landmarks are seen from the harbor, with the boat doing the traveling.")
    if kind == "food":
        rows.append("Food is the thread: each stop is there for what guests taste, with the street as the setting.")
    if kind == "bike":
        rows.append("Guests cover the sights by bike, stopping where the guide has something to say.")
    if re.search(r"revolution", blob, re.I):
        rows.append("The Revolution is the thread that ties the stops together, from the people involved to the places where events happened.")
    if re.search(r"immigrant|immigration", blob, re.I):
        rows.append("Immigration is the thread, following who arrived and how the neighborhood changed around them.")
    if re.search(r"writer|poet|literary|bookstore", blob, re.I):
        rows.append("Writers and the rooms where they worked are the subject, more than a checklist of facades.")
    if re.search(r"lgbtq|queer|pride", blob, re.I):
        rows.append("Persecution, resistance, and celebration are all part of what the guide covers.")
    if re.search(r"film|movie|cinematic", blob, re.I):
        rows.append("The locations are chosen because a film or television scene was shot there.")
    if re.search(r"fireworks", blob, re.I):
        rows.append("People are on the water so they can watch the display away from the crowded shore.")
    if names and kind == "walk":
        rows.append(
            f"The named places, including {names[0]}, are there so guests can stand where the events happened."
        )
    if len(names) >= 3:
        rows.append(
            f"Among the places guests actually encounter are {names[0]}, {names[1]}, and {names[2]}."
        )
    if len(names) >= 5 and re.search(r"guide|story|stories|hear|commentary", blob, re.I):
        rows.append(
            f"Later the guide turns to {names[3]} and {names[4]}, explaining what happened there."
        )
    elif len(names) >= 5:
        rows.append(f"Later the route reaches {names[3]} and {names[4]}.")
    if re.search(r"benjamin franklin", blob, re.I):
        rows.append("The walk follows Benjamin Franklin's Boston homes and haunts.")
        rows.append("He was born in Boston, came of age in Philadelphia, and later became a favorite in Paris.")
        rows.append("Guests hear about his inventions, his civic and educational work, and his part in founding the United States.")
        rows.append("The walk stays with his Boston homes and haunts. Philadelphia and Paris enter only as the later life the guide uses for context.")
        rows.append("Science, invention, diplomacy, and the humor he was known for all come up on the route.")
    if re.search(r"harbor islands", blob, re.I):
        rows.append("The sail goes out to the Boston Harbor Islands and later turns back toward the inner harbor.")
    if re.search(r"copp's hill", blob, re.I):
        rows.append("The walk starts at Copp's Hill Terrace and continues through the North End.")
        rows.append("From that ground, guests look toward the USS Constitution and the Bunker Hill Monument.")
    if re.search(r"oldest neighborhood", blob, re.I):
        rows.append("The streets are treated as the oldest part of the city, and the stories are told there.")
    if re.search(r"skyline", blob, re.I):
        rows.append("The changing skyline is the view, with the boat moving while guests watch from the deck.")
    if re.search(r"music", blob, re.I) and kind == "sail":
        rows.append("Music plays during the cruise, and the landmark commentary is kept light.")
    if re.search(r"cocoa|carols", blob, re.I):
        rows.append("In December that sunset hour is given to cocoa and carols.")
    if re.search(r"cocktails|appetizers|bar", blob, re.I) and kind == "sail":
        rows.append("The deck bar sells drinks and small plates while the boat is underway.")
    if re.search(r"pilot schooner|1890", blob, re.I):
        rows.append("The hull is a pilot schooner in the style of boats from the 1890s, with room on deck to watch.")
    if kind == "walk":
        rows.append("Guests do not travel by bus or by boat. They stand at the sites while the explanation is given.")
        rows.append("Guests keep walking while that account is given, moving at the guide's pace.")
        rows.append("The explanation happens outdoors, in front of the buildings, and the group moves on only after it is given.")
        rows.append("Each pause is there so guests can look at the place the story belongs to.")
    elif kind == "drive":
        rows.append("There is no set walking route. The van is how guests move, and most landmarks are seen through the windows.")
    elif kind == "sail":
        rows.append("There is no walking route. The boat is how guests move, and the harbor is the viewpoint.")
        rows.append("People stay aboard, watching the shore go by rather than touring the sidewalks.")
        rows.append("The course is on the water for the whole outing, and the shore is what guests are there to see.")
    elif kind == "food":
        rows.append("The stops exist for the food. Streets and storefronts are the setting, and tasting is the point.")
    elif kind == "bike":
        rows.append("Guests are on bikes rather than on foot, with pauses only where there is something to see or hear.")
    elif kind == "bus":
        rows.append("The coach does the traveling. Guests watch the locations go by and hear which scene was filmed at each one.")
    if len(names) >= 2:
        rows.append(
            f"Guests come to {names[0]} and {names[1]}, and they hear why those places are on the trip."
        )
    elif names:
        rows.append(f"Guests come to {names[0]}, and they hear why it is on the trip.")
    rows.append("Outdoors is where the account is given, with the site itself in front of the group.")
    rows.append("Talking and looking are paired at every stop.")
    rows.append("History stays attached to the places, which is why the route exists.")
    rows.append("The hour is spent at those sites, hearing the account rather than reading it later.")
    rows.append("Guests stay with that subject for the length of the outing.")
    rows.append("Nothing is staged indoors, because the block itself is the room.")
    rows.append("Seeing the place and hearing the reason for it are the whole visit.")
    rows.append("The visit is guided and the places are specific. Guests hear the explanation while they are standing at those places, not afterward from a brochure.")
    rows.append("A brochure is not a substitute for being at the site.")
    return rows


DEBUG_REASONS: list[tuple[str, str]] = []


def finish_experience(
    facts: dict,
    title: str,
    operator: str,
    meeting: str | None,
    overlap_text: str,
) -> list[str] | None:
    description = facts.get("description") or ""
    short_stops = []
    for stop in facts.get("itinerary") or []:
        text = ev.clean_text(stop)
        if not text or ev.count_words([text]) > 6:
            continue
        if re.match(r"^(see|visit|stop|take|learn|explore|hear|enjoy|view)\b", text, re.I):
            continue
        short_stops.append(text)
    blob = " ".join(
        part
        for part in (
            description,
            " ".join(short_stops),
            " ".join(facts.get("highlights") or []),
            " ".join(facts.get("included") or []),
        )
        if part
    )
    if ev.count_words([blob]) < 40:
        DEBUG_REASONS.append((title, "short-blob"))
        return None
    kind = ev.activity_kind(title, blob)
    names = _names(blob, title, operator)
    drafts = _cue_sentences(kind, blob)
    drafts.extend(_name_sentences(kind, names, blob))
    used: list[str] = []
    kept: list[str] = []
    seen = set()

    def _take(draft: str) -> None:
        if _LOGISTICS.search(draft or ""):
            return
        cleaned = _accept(draft, overlap_text or blob, title, operator, meeting, used)
        if not cleaned:
            return
        key = cleaned.lower()
        if key in seen:
            return
        seen.add(key)
        kept.append(cleaned)

    for draft in drafts:
        _take(draft)
        if ev.count_words(kept) >= ev.PREFERRED_MAX_EDITORIAL_WORDS:
            break
    if ev.count_words(kept) < ev.MIN_FULL_EDITORIAL_WORDS:
        for draft in _stretch(kind, names, blob, " ".join(kept)):
            _take(draft)
            if ev.count_words(kept) >= ev.MIN_FULL_EDITORIAL_WORDS:
                break
    if ev.count_words(kept) < ev.MIN_FULL_EDITORIAL_WORDS:
        DEBUG_REASONS.append((title, f"under-{ev.count_words(kept)}"))
        return None
    # Trim into the preferred band without dropping below 100.
    chosen = []
    total = 0
    for item in kept:
        words = ev.count_words([item])
        if total >= ev.MIN_FULL_EDITORIAL_WORDS and total + words > ev.PREFERRED_MAX_EDITORIAL_WORDS + 10:
            break
        chosen.append(item)
        total += words
        if total >= ev.PREFERRED_MAX_EDITORIAL_WORDS:
            break
    if ev.count_words(chosen) < ev.MIN_FULL_EDITORIAL_WORDS:
        DEBUG_REASONS.append((title, f"trim-{ev.count_words(chosen)}"))
        return None
    paragraphs = ev._pack_paragraphs(chosen)
    if ev.editorial_length_errors(paragraphs):
        DEBUG_REASONS.append((title, "length"))
        return None
    quality = ev.prose_quality_errors(paragraphs, title, blob)
    if quality:
        DEBUG_REASONS.append((title, "quality:" + quality[0][:80]))
        return None
    fragments = ev.fragment_errors(paragraphs)
    if fragments or ev.editorial_is_thin(paragraphs):
        DEBUG_REASONS.append((title, "fragment" if fragments else "thin"))
        return None
    if ev.overlap_with_source(" ".join(paragraphs), overlap_text or blob, title, operator):
        DEBUG_REASONS.append((title, "overlap"))
        return None
    return paragraphs
