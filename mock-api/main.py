"""
Mock API standing in for Software Factory phase 2 (infra, auth, Clayton client)
and phase 3 (buyer APIs, matching, home detail, favorites, customization).

Run: uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

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

FIXTURE_HOMES: list[dict[str, Any]] = [
    {
        "id": "home-001",
        "mls_id": "MLS-10001",
        "address": {"line1": "410 Riverbend Dr", "city": "Austin", "state": "TX", "zip": "78704"},
        "price_cents": 549_000_00,
        "beds": 4,
        "baths": 2.5,
        "sqft": 2140,
        "hero_image_url": "https://placehold.co/800x480/1a365d/white?text=Riverbend",
        "gallery_urls": [],
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
        "hero_image_url": "https://placehold.co/800x480/2c5282/white?text=Live+Oak",
        "gallery_urls": [],
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
        "hero_image_url": "https://placehold.co/800x480/276749/white?text=Vista+Ridge",
        "gallery_urls": [],
        "summary": "Two-story, flex room, near top-rated schools.",
        "match_score": 0.81,
        "community": "Teravista",
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
}

# In-memory session state
_sessions: dict[str, dict[str, Any]] = {}
_buyer_profiles: dict[str, dict[str, Any]] = {}
_favorites: dict[str, set[str]] = {}  # user_id -> set of home ids


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


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
    _require_session(authorization)
    ranked = sorted(FIXTURE_HOMES, key=lambda h: h.get("match_score", 0), reverse=True)
    return {
        "generated_at": _utc_now(),
        "homes": deepcopy(ranked),
        "used_questionnaire": body.use_questionnaire,
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
