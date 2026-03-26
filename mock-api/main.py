"""
Mock API standing in for Software Factory phase 2 (infra, auth, Clayton client)
and phase 3 (buyer APIs, matching, home detail, favorites, customization).

Run: uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import re
import uuid
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Clayton Demo Mock API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Fixtures (Clayton-style inventory + app domain) ---
# Photo stills: Unsplash — suburban / new-build US homes, warm-climate look (Central Texas–appropriate).


def _listing_img(photo_id: str) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w=1600&q=82"


FIXTURE_HOMES: list[dict[str, Any]] = [
    {
        "id": "home-001",
        "mls_id": "MLS-10001",
        "address": {"line1": "410 Riverbend Dr", "city": "Austin", "state": "TX", "zip": "78704"},
        "price_cents": 549_000_00,
        "beds": 4,
        "baths": 2.5,
        "sqft": 2140,
        "hero_image_url": _listing_img("1600585154340-be6161a56a0c"),
        "gallery_urls": [
            _listing_img("1600607687939-ce8a6c25118c"),
            _listing_img("1600210492486-724fe5c67fb0"),
            _listing_img("1564013799919-ab600027ffc6"),
            _listing_img("1582268611958-ebfd161ef9cf"),
        ],
        "summary": "Corner lot, updated kitchen, walkable to trails.",
        "match_score": 0.92,
        "community": "South Lamar",
    },
    {
        "id": "home-002",
        "mls_id": "MLS-10002",
        "address": {"line1": "88 Live Oak Ln", "city": "Austin", "state": "TX", "zip": "78745"},
        "price_cents": 489_000_00,
        "beds": 3,
        "baths": 2.0,
        "sqft": 1750,
        "hero_image_url": _listing_img("1600596542815-ffad4c1539a9"),
        "gallery_urls": [
            _listing_img("1605276374104-dee2a0ed3cd6"),
            _listing_img("1616594039964-ae9021a400a0"),
            _listing_img("1568605114967-8130f3a36994"),
            _listing_img("1600585154340-be6161a56a0c"),
        ],
        "summary": "Single story, mature trees, efficient layout.",
        "match_score": 0.88,
        "community": "Sunset Valley",
    },
    {
        "id": "home-003",
        "mls_id": "MLS-10003",
        "address": {"line1": "1200 Vista Ridge", "city": "Round Rock", "state": "TX", "zip": "78665"},
        "price_cents": 625_000_00,
        "beds": 5,
        "baths": 3.0,
        "sqft": 2680,
        "hero_image_url": _listing_img("1512917774080-9991f1c4c750"),
        "gallery_urls": [
            _listing_img("1613490493576-7fde63acd811"),
            _listing_img("1600585154526-990dced4db0d"),
            _listing_img("1600047509807-ba8f99d2cdde"),
            _listing_img("1568605114967-8130f3a36994"),
        ],
        "summary": "Two-story, flex room, near top-rated schools.",
        "match_score": 0.81,
        "community": "Teravista",
    },
    {
        "id": "home-004",
        "mls_id": "MLS-10004",
        "address": {"line1": "2210 Brushy Creek Trl", "city": "Cedar Park", "state": "TX", "zip": "78613"},
        "price_cents": 429_000_00,
        "beds": 3,
        "baths": 2.0,
        "sqft": 1820,
        "hero_image_url": _listing_img("1570129477492-45c003edd2be"),
        "gallery_urls": [
            _listing_img("1600585154340-be6161a56a0c"),
            _listing_img("1605276374104-dee2a0ed3cd6"),
            _listing_img("1616594039964-ae9021a400a0"),
            _listing_img("1600210492486-724fe5c67fb0"),
        ],
        "summary": "Craftsman elevation, open living, community pool and trails nearby.",
        "match_score": 0.79,
        "community": "Brushy Creek",
    },
    {
        "id": "home-005",
        "mls_id": "MLS-10005",
        "address": {"line1": "904 Pecan St", "city": "Georgetown", "state": "TX", "zip": "78626"},
        "price_cents": 395_000_00,
        "beds": 3,
        "baths": 2.0,
        "sqft": 1680,
        "hero_image_url": _listing_img("1582268611958-ebfd161ef9cf"),
        "gallery_urls": [
            _listing_img("1600585154340-be6161a56a0c"),
            _listing_img("1605276374104-dee2a0ed3cd6"),
            _listing_img("1615529328331-f8917597711f"),
            _listing_img("1600566753086-00f18fb6b3ea"),
        ],
        "summary": "Traditional brick, shaded backyard, short drive to historic square.",
        "match_score": 0.77,
        "community": "Old Town",
    },
    {
        "id": "home-006",
        "mls_id": "MLS-10006",
        "address": {"line1": "55 Hill Country Vw", "city": "Dripping Springs", "state": "TX", "zip": "78620"},
        "price_cents": 715_000_00,
        "beds": 4,
        "baths": 3.5,
        "sqft": 3020,
        "hero_image_url": _listing_img("1600047509807-ba8f99d2cdde"),
        "gallery_urls": [
            _listing_img("1613490493576-7fde63acd811"),
            _listing_img("1564013799919-ab600027ffc6"),
            _listing_img("1600607687939-ce8a6c25118c"),
            _listing_img("1512917774080-9991f1c4c750"),
        ],
        "summary": "Contemporary design, wall of windows, acre lot with Hill Country views.",
        "match_score": 0.84,
        "community": "Belterra",
    },
    {
        "id": "home-007",
        "mls_id": "MLS-10007",
        "address": {"line1": "1802 Falcon Pointe Blvd", "city": "Pflugerville", "state": "TX", "zip": "78660"},
        "price_cents": 512_000_00,
        "beds": 4,
        "baths": 2.5,
        "sqft": 2280,
        "hero_image_url": _listing_img("1600585154526-990dced4db0d"),
        "gallery_urls": [
            _listing_img("1613490493576-7fde63acd811"),
            _listing_img("1564013799919-ab600027ffc6"),
            _listing_img("1600596542815-ffad4c1539a9"),
            _listing_img("1512917774080-9991f1c4c750"),
        ],
        "summary": "Modern kitchen, game room, corner homesite near schools and parks.",
        "match_score": 0.8,
        "community": "Falcon Pointe",
    },
    {
        "id": "home-008",
        "mls_id": "MLS-10008",
        "address": {"line1": "312 Elm Creek Dr", "city": "Buda", "state": "TX", "zip": "78610"},
        "price_cents": 465_000_00,
        "beds": 3,
        "baths": 2.5,
        "sqft": 2010,
        "hero_image_url": _listing_img("1600566753086-00f18fb6b3ea"),
        "gallery_urls": [
            _listing_img("1600607687939-ce8a6c25118c"),
            _listing_img("1582268611958-ebfd161ef9cf"),
            _listing_img("1615529328331-f8917597711f"),
            _listing_img("1616594039964-ae9021a400a0"),
        ],
        "summary": "Modern farmhouse plan, covered patio, energy-efficient HVAC.",
        "match_score": 0.83,
        "community": "Elm Creek",
    },
    {
        "id": "home-009",
        "mls_id": "MLS-10009",
        "address": {"line1": "770 Sailmaster Dr", "city": "Lakeway", "state": "TX", "zip": "78734"},
        "price_cents": 899_000_00,
        "beds": 4,
        "baths": 3.5,
        "sqft": 3150,
        "hero_image_url": _listing_img("1564013799919-ab600027ffc6"),
        "gallery_urls": [
            _listing_img("1613490493576-7fde63acd811"),
            _listing_img("1600047509807-ba8f99d2cdde"),
            _listing_img("1568605114967-8130f3a36994"),
            _listing_img("1600566753086-00f18fb6b3ea"),
        ],
        "summary": "Lake lifestyle community, contemporary finishes, resort-style amenities.",
        "match_score": 0.76,
        "community": "Rough Hollow",
    },
    {
        "id": "home-010",
        "mls_id": "MLS-10010",
        "address": {"line1": "140 Bluebonnet Way", "city": "Manor", "state": "TX", "zip": "78653"},
        "price_cents": 338_000_00,
        "beds": 3,
        "baths": 2.0,
        "sqft": 1540,
        "hero_image_url": _listing_img("1568605114967-8130f3a36994"),
        "gallery_urls": [
            _listing_img("1600585154340-be6161a56a0c"),
            _listing_img("1615529328331-f8917597711f"),
            _listing_img("1600210492486-724fe5c67fb0"),
            _listing_img("1564013799919-ab600027ffc6"),
        ],
        "summary": "New construction, smart thermostat prewire, commuter-friendly to Austin.",
        "match_score": 0.74,
        "community": "Shadowglen",
    },
]

CUSTOMIZATION_OPTIONS: dict[str, list[dict[str, Any]]] = {
    "home-001": [
        {"id": "opt-flooring-oak", "category": "flooring", "label": "Wide-plank oak upgrade", "price_delta_cents": 12_000_00},
        {"id": "opt-kitchen-quartz", "category": "kitchen", "label": "Quartz counters + under-cabinet lighting", "price_delta_cents": 8_500_00},
        {"id": "opt-covered-patio", "category": "outdoor", "label": "Covered patio extension", "price_delta_cents": 18_000_00},
    ],
    "home-002": [
        {"id": "opt-garage-ext", "category": "garage", "label": "Extended garage bay", "price_delta_cents": 9_000_00},
    ],
    "home-003": [
        {"id": "opt-loft", "category": "layout", "label": "Loft conversion", "price_delta_cents": 22_000_00},
    ],
    "home-004": [
        {"id": "opt-craftsman-trim", "category": "exterior", "label": "Premium craftsman trim package", "price_delta_cents": 6_500_00},
    ],
    "home-005": [
        {"id": "opt-fence", "category": "outdoor", "label": "Privacy cedar fence", "price_delta_cents": 7_200_00},
    ],
    "home-006": [
        {"id": "opt-outdoor-kitchen", "category": "outdoor", "label": "Outdoor kitchen & fire pit", "price_delta_cents": 28_000_00},
    ],
    "home-007": [
        {"id": "opt-media", "category": "layout", "label": "Pre-wired media room", "price_delta_cents": 4_800_00},
    ],
    "home-008": [
        {"id": "opt-farmhouse-sink", "category": "kitchen", "label": "Farmhouse sink & faucet upgrade", "price_delta_cents": 3_200_00},
    ],
    "home-009": [
        {"id": "opt-boat-slip", "category": "lifestyle", "label": "Boat slip access add-on", "price_delta_cents": 35_000_00},
    ],
    "home-010": [
        {"id": "opt-solar-prep", "category": "energy", "label": "Solar panel prep package", "price_delta_cents": 5_500_00},
    ],
}

# In-memory session state
_sessions: dict[str, dict[str, Any]] = {}
_buyer_profiles: dict[str, dict[str, Any]] = {}
_favorites: dict[str, set[str]] = {}  # user_id -> set of home ids


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _coerce_number(v: Any) -> float | None:
    if isinstance(v, (int, float)) and not isinstance(v, bool):
        return float(v)
    if isinstance(v, str) and v.strip():
        try:
            return float(v)
        except ValueError:
            return None
    return None


def _score_home_with_questionnaire(home: dict[str, Any], q: dict[str, Any]) -> float:
    """Align with frontend src/lib/matchScore.ts scoreHomeWithQuestionnaire."""
    score = 0.32
    budget_max = _coerce_number(q.get("budgetMax")) or 2_000_000.0
    budget_cents = int(budget_max * 100)
    price = int(home.get("price_cents", 0))
    if price <= budget_cents:
        score += 0.26
    else:
        score += 0.26 * min(1.0, budget_cents / max(price, 1))

    min_beds = int(_coerce_number(q.get("minBeds")) or 1)
    min_baths = _coerce_number(q.get("minBaths")) or 1.0
    min_sqft = int(_coerce_number(q.get("minSqft")) or 0)
    beds = int(home.get("beds", 0))
    baths = float(home.get("baths", 0))
    sqft = int(home.get("sqft", 0))

    if beds >= min_beds:
        score += 0.14
    else:
        score += 0.14 * max(0.0, beds / max(min_beds, 1))

    if baths >= min_baths:
        score += 0.12
    else:
        score += 0.12 * max(0.0, baths / max(min_baths, 0.25))

    if min_sqft > 0:
        if sqft >= min_sqft:
            score += 0.12
        else:
            score += 0.12 * max(0.0, sqft / max(min_sqft, 1))
    else:
        score += 0.12

    if q.get("singleStory") is True:
        summary = str(home.get("summary", ""))
        if re.search(r"single[\s-]?story", summary, re.IGNORECASE):
            score += 0.1
        elif sqft < 2100 and beds <= 3:
            score += 0.04

    styles = q.get("styles")
    if isinstance(styles, list):
        hay = f"{home.get('summary', '')} {home.get('community', '')}".lower()
        for s in styles:
            if isinstance(s, str) and s:
                word = s.lower().split()[0]
                if len(word) > 2 and word in hay:
                    score += 0.025

    cities = str(q.get("preferredCities") or "").lower()
    if cities:
        city = str(home.get("address", {}).get("city", "")).lower()
        if city and city in cities:
            score += 0.06

    out = min(0.99, max(0.28, score))
    return round(out, 3)


def _require_session(authorization: str | None) -> tuple[str, dict[str, Any]]:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    sess = _sessions.get(token)
    if not sess:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return token, sess


# --- Auth (phase 2: WO5–6) ---


class LoginRequest(BaseModel):
    email: str = Field(examples=["buyer@example.com"])
    password: str = Field(examples=["any-for-mock"])


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600


@app.post("/auth/login", response_model=LoginResponse)
def auth_login(body: LoginRequest) -> LoginResponse:
    token = str(uuid.uuid4())
    user_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, body.email))
    _sessions[token] = {
        "user_id": user_id,
        "email": body.email,
        "logged_in_at": _utc_now(),
    }
    if user_id not in _buyer_profiles:
        _buyer_profiles[user_id] = {
            "user_id": user_id,
            "email": body.email,
            "questionnaire": {"completed": False, "answers": {}},
            "updated_at": _utc_now(),
        }
    if user_id not in _favorites:
        _favorites[user_id] = set()
    return LoginResponse(access_token=token)


@app.post("/auth/logout")
def auth_logout(authorization: str | None = Header(default=None)) -> dict[str, str]:
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        _sessions.pop(token, None)
    return {"status": "ok"}


@app.get("/auth/me")
def auth_me(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    _, sess = _require_session(authorization)
    user_id = sess["user_id"]
    profile = _buyer_profiles.get(user_id, {})
    return {
        "user_id": user_id,
        "email": sess["email"],
        "profile": profile,
    }


# --- Buyer profile & questionnaire (phase 3: WO13) ---


class QuestionnairePatch(BaseModel):
    answers: dict[str, Any] = Field(default_factory=dict)
    mark_completed: bool | None = None


@app.get("/api/buyer/profile")
def get_buyer_profile(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    _, sess = _require_session(authorization)
    user_id = sess["user_id"]
    return deepcopy(_buyer_profiles[user_id])


@app.put("/api/buyer/profile")
def put_buyer_profile(
    patch: QuestionnairePatch,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    _, sess = _require_session(authorization)
    user_id = sess["user_id"]
    rec = _buyer_profiles[user_id]
    rec["questionnaire"]["answers"].update(patch.answers)
    if patch.mark_completed is True:
        rec["questionnaire"]["completed"] = True
    rec["updated_at"] = _utc_now()
    return deepcopy(rec)


# --- Matching & homes (phase 3: WO15–17, inventory WO11–12 implied) ---


class MatchingRunRequest(BaseModel):
    use_questionnaire: bool = True


@app.post("/api/matching/run")
def run_matching(body: MatchingRunRequest, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    _, sess = _require_session(authorization)
    user_id = sess["user_id"]
    rec = _buyer_profiles.get(user_id, {})
    qn = rec.get("questionnaire") or {}
    completed = bool(qn.get("completed"))
    answers = qn.get("answers") or {}
    use_q = body.use_questionnaire and completed

    homes = deepcopy(FIXTURE_HOMES)
    if use_q and isinstance(answers, dict):
        for h in homes:
            h["match_score"] = _score_home_with_questionnaire(h, answers)
        homes.sort(key=lambda h: h.get("match_score", 0), reverse=True)
    else:
        homes.sort(key=lambda h: h.get("match_score", 0), reverse=True)

    return {
        "generated_at": _utc_now(),
        "homes": homes,
        "used_questionnaire": bool(use_q),
    }


@app.get("/api/homes")
def list_homes(
    authorization: str | None = Header(default=None),
    min_price_cents: int | None = None,
    max_price_cents: int | None = None,
) -> dict[str, Any]:
    _require_session(authorization)
    homes = deepcopy(FIXTURE_HOMES)
    if min_price_cents is not None:
        homes = [h for h in homes if h["price_cents"] >= min_price_cents]
    if max_price_cents is not None:
        homes = [h for h in homes if h["price_cents"] <= max_price_cents]
    return {"items": homes, "total": len(homes)}


@app.get("/api/homes/{home_id}")
def get_home(home_id: str, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    _require_session(authorization)
    for h in FIXTURE_HOMES:
        if h["id"] == home_id:
            detail = deepcopy(h)
            detail["description_long"] = (
                "Spacious layout with natural light, an open kitchen and dining area, and a private "
                "outdoor space ideal for entertaining. Energy-efficient windows and quality finishes throughout."
            )
            detail["schools"] = [{"name": "Lakewood High School", "rating": 8}]
            return detail
    raise HTTPException(status_code=404, detail="Home not found")


# --- Favorites (phase 3: WO19) ---


@app.get("/api/favorites")
def list_favorites(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    _, sess = _require_session(authorization)
    user_id = sess["user_id"]
    ids = _favorites.get(user_id, set())
    items = [deepcopy(h) for h in FIXTURE_HOMES if h["id"] in ids]
    return {"items": items}


class FavoriteMutation(BaseModel):
    home_id: str


@app.post("/api/favorites")
def add_favorite(body: FavoriteMutation, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    _, sess = _require_session(authorization)
    user_id = sess["user_id"]
    if body.home_id not in {h["id"] for h in FIXTURE_HOMES}:
        raise HTTPException(status_code=404, detail="Home not found")
    _favorites.setdefault(user_id, set()).add(body.home_id)
    return {"home_id": body.home_id, "favorited": True}


@app.delete("/api/favorites/{home_id}")
def remove_favorite(home_id: str, authorization: str | None = Header(default=None)) -> dict[str, str]:
    _, sess = _require_session(authorization)
    user_id = sess["user_id"]
    _favorites.get(user_id, set()).discard(home_id)
    return {"status": "ok"}


@app.get("/api/favorites/compare")
def compare_favorites(
    ids: str = Query(..., description="Comma-separated home ids"),
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    _require_session(authorization)
    id_list = [i.strip() for i in ids.split(",") if i.strip()]
    homes = [deepcopy(h) for h in FIXTURE_HOMES if h["id"] in id_list]
    return {"homes": homes}


# --- Customization (phase 3: WO21) ---


@app.get("/api/homes/{home_id}/customization/options")
def customization_options(home_id: str, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    _require_session(authorization)
    options = CUSTOMIZATION_OPTIONS.get(home_id, [])
    return {"home_id": home_id, "options": deepcopy(options)}


class SelectionState(BaseModel):
    selected_option_ids: list[str] = Field(default_factory=list)


@app.put("/api/homes/{home_id}/customization/selection")
def save_customization_selection(
    home_id: str,
    body: SelectionState,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    _require_session(authorization)
    available = {o["id"] for o in CUSTOMIZATION_OPTIONS.get(home_id, [])}
    picked = [i for i in body.selected_option_ids if i in available]
    total_delta = sum(
        o["price_delta_cents"]
        for o in CUSTOMIZATION_OPTIONS.get(home_id, [])
        if o["id"] in picked
    )
    return {
        "home_id": home_id,
        "selected_option_ids": picked,
        "total_price_delta_cents": total_delta,
        "updated_at": _utc_now(),
    }


@app.get("/")
def root() -> dict[str, Any]:
    return {
        "service": "clayton-demo-mock-api",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
