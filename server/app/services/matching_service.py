import re
from difflib import SequenceMatcher
from typing import List, Tuple

from sqlalchemy.orm import Session

from app.models.item import Item, ItemStatus, ItemType

# Weights sum to 100 -- see spec section 11.
CATEGORY_WEIGHT = 30
LOCATION_WEIGHT = 25
KEYWORD_WEIGHT = 30
DATE_WEIGHT = 15

MIN_MATCH_SCORE = 50
DATE_PROXIMITY_WINDOW_DAYS = 14

_STOPWORDS = {
    "a", "an", "the", "and", "or", "of", "in", "on", "at", "with",
    "for", "to", "is", "it", "my", "was", "were", "near", "found",
    "lost", "college", "campus",
}


def _tokenize(text: str) -> set:
    words = re.findall(r"[a-z0-9]+", text.lower())
    return {w for w in words if len(w) > 2 and w not in _STOPWORDS}


def _keyword_similarity(item_a: Item, item_b: Item) -> float:
    tokens_a = _tokenize(f"{item_a.title} {item_a.description}")
    tokens_b = _tokenize(f"{item_b.title} {item_b.description}")

    if not tokens_a or not tokens_b:
        return 0.0

    intersection = tokens_a & tokens_b
    union = tokens_a | tokens_b
    return len(intersection) / len(union)


def _location_similarity(item_a: Item, item_b: Item) -> float:
    return SequenceMatcher(None, item_a.location.lower(), item_b.location.lower()).ratio()


def _date_proximity(item_a: Item, item_b: Item) -> float:
    diff_days = abs((item_a.date - item_b.date).days)
    if diff_days >= DATE_PROXIMITY_WINDOW_DAYS:
        return 0.0
    return 1 - (diff_days / DATE_PROXIMITY_WINDOW_DAYS)


def calculate_match_score(item_a: Item, item_b: Item) -> int:
    """Rule-based match score, 0-100, per spec section 11:
        Category match       +30
        Location similarity  +25
        Keyword similarity   +30
        Date proximity       +15
    """
    score = 0.0

    if item_a.category_id == item_b.category_id:
        score += CATEGORY_WEIGHT

    score += _location_similarity(item_a, item_b) * LOCATION_WEIGHT
    score += _keyword_similarity(item_a, item_b) * KEYWORD_WEIGHT
    score += _date_proximity(item_a, item_b) * DATE_WEIGHT

    return round(min(score, 100))


def find_matches_for_item(db: Session, item: Item, limit: int = 10) -> List[Tuple[Item, int]]:
    opposite_type = ItemType.FOUND if item.type == ItemType.LOST else ItemType.LOST

    candidates = (
        db.query(Item)
        .filter(
            Item.type == opposite_type,
            Item.status.in_([ItemStatus.LOST, ItemStatus.FOUND]),
            Item.reporter_id != item.reporter_id,
            Item.id != item.id,
        )
        .all()
    )

    scored = [(candidate, calculate_match_score(item, candidate)) for candidate in candidates]
    scored = [(candidate, score) for candidate, score in scored if score >= MIN_MATCH_SCORE]
    scored.sort(key=lambda pair: pair[1], reverse=True)

    return scored[:limit]


def get_matches_for_user(db: Session, user_id: int) -> List[dict]:
    my_items = (
        db.query(Item)
        .filter(Item.reporter_id == user_id, Item.status.in_([ItemStatus.LOST, ItemStatus.FOUND]))
        .all()
    )

    results = []
    for my_item in my_items:
        for matched_item, score in find_matches_for_item(db, my_item):
            results.append(
                {
                    "id": f"{my_item.id}-{matched_item.id}",
                    "score": score,
                    "myItem": {"id": my_item.id, "title": my_item.title},
                    "matchedItem": {
                        "id": matched_item.id,
                        "title": matched_item.title,
                        "type": matched_item.type,
                        "location": matched_item.location,
                    },
                }
            )

    results.sort(key=lambda m: m["score"], reverse=True)
    return results