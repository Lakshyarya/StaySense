"""
Stay Sense API  —  FastAPI backend
=====================================
Endpoints:
  Rooms      GET    /api/rooms
             GET    /api/rooms/{room_id}
  Enquiries  POST   /api/enquiries
             GET    /api/enquiries
             GET    /api/enquiries/{id}
             PATCH  /api/enquiries/{id}/status
  Reviews    GET    /api/reviews
             POST   /api/reviews
             DELETE /api/reviews/{id}
  Analysis   POST   /api/analyse
             POST   /api/analyse/batch
  Health     GET    /health

Run:  uvicorn main:app --reload --port 8000
"""

import os, json, random, string
from datetime import datetime, date as dt_date
from typing import Optional, List
from collections import Counter
from enum import Enum

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator, model_validator
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────────
#  App
# ─────────────────────────────────────────────
app = FastAPI(
    title="Stay Sense API",
    description="Direct booking + review intelligence for Trishul Eco-Homestays",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─────────────────────────────────────────────
#  CORS
# ─────────────────────────────────────────────
_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
ALLOWED_ORIGINS = [o.strip() for o in _origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
#  Exception handlers
# ─────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={
            "error": "Validation Error",
            "detail": [
                {
                    "field":   " → ".join(str(l) for l in e["loc"] if l != "body"),
                    "message": e["msg"].replace("Value error, ", ""),
                }
                for e in exc.errors()
            ],
        },
    )

@app.exception_handler(Exception)
async def generic_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "detail": str(exc)},
    )

# ─────────────────────────────────────────────
#  Enums
# ─────────────────────────────────────────────
class RoomStatus(str, Enum):
    available = "available"
    limited   = "limited"

class InquiryStatus(str, Enum):
    pending   = "pending"
    contacted = "contacted"
    confirmed = "confirmed"
    declined  = "declined"

class Theme(str, Enum):
    food        = "food"
    host        = "host"
    location    = "location"
    cleanliness = "cleanliness"
    value       = "value"
    experience  = "experience"

# ─────────────────────────────────────────────
#  Pydantic models
# ─────────────────────────────────────────────
class EnquiryCreate(BaseModel):
    checkIn:   str
    checkOut:  str
    adults:    int = 1
    children:  int = 0
    room:      Optional[str] = None
    name:      str
    phone:     str
    email:     str
    requests:  Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip(): raise ValueError("Name cannot be empty")
        return v.strip()

    @field_validator("email")
    @classmethod
    def valid_email(cls, v):
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("A valid email address is required")
        return v.lower().strip()

    @field_validator("phone")
    @classmethod
    def valid_phone(cls, v):
        digits = "".join(c for c in v if c.isdigit())
        if len(digits) < 7: raise ValueError("Enter a valid phone number")
        return v.strip()

    @field_validator("adults")
    @classmethod
    def adults_positive(cls, v):
        if v < 1:  raise ValueError("At least 1 adult required")
        if v > 10: raise ValueError("Maximum 10 adults")
        return v

    @model_validator(mode="after")
    def dates_valid(self):
        try:
            ci = dt_date.fromisoformat(self.checkIn)
            co = dt_date.fromisoformat(self.checkOut)
        except ValueError:
            raise ValueError("Dates must be in YYYY-MM-DD format")
        if co <= ci:   raise ValueError("checkOut must be after checkIn")
        if ci < dt_date.today(): raise ValueError("checkIn cannot be in the past")
        return self


class InquiryStatusUpdate(BaseModel):
    status: InquiryStatus


class ReviewCreate(BaseModel):
    guest:    str
    location: Optional[str] = "Verified Guest"
    source:   str
    rating:   int           = 5
    verified: bool          = True
    themes:   List[Theme]
    text:     str

    @field_validator("text")
    @classmethod
    def text_length(cls, v):
        if len(v.strip()) < 10: raise ValueError("Review text must be at least 10 characters")
        return v.strip()

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v):
        if not (1 <= v <= 5): raise ValueError("Rating must be between 1 and 5")
        return v


class AnalyseRequest(BaseModel):
    text:   str
    source: Optional[str] = None

    @field_validator("text")
    @classmethod
    def text_length(cls, v):
        if len(v.strip()) < 10: raise ValueError("Review text must be at least 10 characters")
        return v.strip()


class BatchReviewItem(BaseModel):
    text:   str
    source: Optional[str] = None


class BatchAnalyseRequest(BaseModel):
    reviews: List[BatchReviewItem]

    @field_validator("reviews")
    @classmethod
    def valid_batch(cls, v):
        if not v:       raise ValueError("At least one review is required")
        if len(v) > 50: raise ValueError("Maximum 50 reviews per batch")
        return v

# ─────────────────────────────────────────────
#  In-memory store
# ─────────────────────────────────────────────
ROOMS: list = [
    {
        "id": "deluxe-hill-view", "name": "Deluxe Hill View Room",
        "description": "Wake to panoramic views of Trishul and Nanda Devi from a private balcony.",
        "capacity_adults": 2, "capacity_children": 1, "bed_config": "1 King Bed",
        "price_per_night": 4500, "amenities": ["Hill View", "Private Balcony", "Hot Water", "Attached Bath"],
        "status": "available",
        "image_url": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    },
    {
        "id": "forest-cottage", "name": "Forest Cottage",
        "description": "A freestanding stone-and-wood cottage embedded in the oak forest.",
        "capacity_adults": 4, "capacity_children": 2, "bed_config": "2 Double Beds",
        "price_per_night": 7200, "amenities": ["Forest View", "Sitting Room", "Kitchenette", "Private Garden"],
        "status": "available",
        "image_url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    },
    {
        "id": "meadow-room", "name": "Meadow Room",
        "description": "Simple, cozy, completely quiet. Opens onto a flower meadow.",
        "capacity_adults": 2, "capacity_children": 0, "bed_config": "1 Queen Bed",
        "price_per_night": 2800, "amenities": ["Meadow View", "Reading Corner", "Hot Water"],
        "status": "limited",
        "image_url": "https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?w=800&q=80",
    },
]

ENQUIRIES: list = []

REVIEWS: list = [
    {
        "id": "seed-1", "guest": "Ananya Sharma", "location": "Delhi", "source": "Google",
        "rating": 5, "verified": True, "themes": ["food", "experience"],
        "text": "The meals here are unlike anything I have had at a hotel. Sunita ji's Kumaoni thali is something I still think about weeks later.",
        "added_at": "2026-04-12T08:00:00Z",
    },
    {
        "id": "seed-2", "guest": "Vikram Nair", "location": "Bangalore", "source": "TripAdvisor",
        "rating": 5, "verified": True, "themes": ["host", "experience"],
        "text": "Prerna and her family made us feel like we were staying with relatives. Hospitality like this simply does not exist at hotels.",
        "added_at": "2026-03-28T10:00:00Z",
    },
    {
        "id": "seed-3", "guest": "Meera and Rahul Joshi", "location": "Mumbai", "source": "Booking.com",
        "rating": 5, "verified": True, "themes": ["location", "experience"],
        "text": "The location is breathtaking. We saw a Himalayan Monal just outside our cottage window. Views of Trishul peak are clearest at dawn.",
        "added_at": "2026-03-10T09:00:00Z",
    },
    {
        "id": "seed-4", "guest": "Shruti Agarwal", "location": "Pune", "source": "Google",
        "rating": 5, "verified": True, "themes": ["cleanliness", "host"],
        "text": "The rooms were spotless. For a property in the middle of the forest the level of cleanliness was genuinely impressive.",
        "added_at": "2026-02-18T11:00:00Z",
    },
    {
        "id": "seed-5", "guest": "Aditi Mehta", "location": "Hyderabad", "source": "MakeMyTrip",
        "rating": 5, "verified": True, "themes": ["value", "experience"],
        "text": "We booked directly and saved around 20% compared to the OTA price. Exceptional value for what you get.",
        "added_at": "2026-02-05T07:00:00Z",
    },
    {
        "id": "seed-6", "guest": "Dev Kapoor", "location": "Chennai", "source": "TripAdvisor",
        "rating": 5, "verified": True, "themes": ["experience", "location"],
        "text": "The guided dawn trek, evening bonfire, stargazing — these are experiences you carry home. Best stay of my life.",
        "added_at": "2026-01-22T06:00:00Z",
    },
]

# ─────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────
def make_id(prefix: str = "ID") -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"{prefix}-{datetime.now().year}-{suffix}"

def now_iso() -> str:
    return datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

# ─────────────────────────────────────────────
#  LLM Analysis  (Claude API with keyword fallback)
# ─────────────────────────────────────────────
_THEME_KW = {
    "food":        ["food","meal","breakfast","lunch","dinner","cook","thali","taste","dish","kitchen"],
    "host":        ["host","staff","prerna","sunita","ramesh","family","hospitality","welcome","helpful"],
    "location":    ["location","view","forest","mountain","peak","nature","trek","scenic","valley"],
    "cleanliness": ["clean","dirty","hygiene","spotless","tidy","smell","linen","bathroom"],
    "value":       ["price","value","worth","expensive","affordable","money","save","cost","budget"],
    "experience":  ["experience","trek","bonfire","stars","stargazing","bird","wildlife","activity"],
}
_POS = {"amazing","excellent","fantastic","great","love","wonderful","outstanding","incredible","beautiful","breathtaking","perfect","superb"}
_NEG = {"terrible","dirty","worst","bad","poor","disappointed","awful","horrible","rude","broken","noisy","overpriced"}
_RESPONSES = {
    "positive": "Thank you so much for your wonderful review — it truly means the world to our family, and we hope to welcome you back soon!",
    "neutral":  "Thank you for taking the time to share your experience. We have noted your feedback and will keep working to improve every aspect of your stay.",
    "negative": "We sincerely apologise for falling short of your expectations. Please reach out to us directly so we can make it right.",
    "mixed":    "Thank you for your thoughtful review. We are glad parts of your stay resonated, and we will take your feedback seriously to improve what fell short.",
}

def _keyword_analyse(text: str) -> dict:
    lower = text.lower()
    words = set(lower.split())
    pos = len(words & _POS)
    neg = len(words & _NEG)
    sentiment = "mixed" if (pos > 0 and neg > 0) else "negative" if neg > 0 else "positive" if pos > 0 else "neutral"
    scores  = {t: sum(1 for kw in kws if kw in lower) for t, kws in _THEME_KW.items()}
    ranked  = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    matched = [t for t, s in ranked if s > 0]
    return {
        "sentiment":          sentiment,
        "confidence":         min(75 + (pos + neg) * 4, 97),
        "primary_theme":      matched[0] if matched else "experience",
        "secondary_themes":   matched[1:3],
        "suggested_response": _RESPONSES[sentiment],
    }

def _llm_analyse(text: str) -> dict:
    """Call Claude API. Returns keyword fallback if key not set or on error."""
    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        return _keyword_analyse(text)
    try:
        import anthropic as _anthropic
        client = _anthropic.Anthropic(api_key=api_key)
        msg = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=512,
            system=(
                "You are a hospitality review analyst for Trishul Eco-Homestays, "
                "a family-run eco property in the Kumaon Himalayas. "
                "Analyse the guest review and return ONLY valid JSON — no markdown, no preamble."
            ),
            messages=[{
                "role": "user",
                "content": (
                    f'Review: "{text}"\n\n'
                    'Return this exact JSON:\n'
                    '{\n'
                    '  "sentiment": "positive"|"neutral"|"negative"|"mixed",\n'
                    '  "confidence": <0-100>,\n'
                    '  "primary_theme": "food"|"host"|"location"|"cleanliness"|"value"|"experience",\n'
                    '  "secondary_themes": ["<theme>"],\n'
                    '  "suggested_response": "<1-2 sentence warm professional reply>"\n'
                    '}'
                ),
            }],
        )
        return json.loads(msg.content[0].text.strip())
    except Exception as e:
        print(f"[LLM error] {e} — using keyword fallback")
        return _keyword_analyse(text)

def _llm_summarize(reviews: list) -> dict:
    """Generate batch summary. Falls back to computed summary if no API key."""
    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()

    sentiments  = [r.get("sentiment","neutral") for r in reviews]
    themes_flat = []
    for r in reviews:
        themes_flat.append(r.get("primary_theme","experience"))
        themes_flat.extend(r.get("secondary_themes",[]))
    s_counts = Counter(sentiments)
    t_counts = Counter(themes_flat)
    top_themes = [t for t,_ in t_counts.most_common(3)]
    pos_pct = round(s_counts.get("positive",0) / max(len(reviews),1) * 100)

    if not api_key:
        return {
            "summary": f"Analysed {len(reviews)} reviews. {pos_pct}% positive. Top themes: {', '.join(top_themes)}.",
            "insights": [
                f"{pos_pct}% of guests left positive reviews.",
                f"Most discussed topic: {top_themes[0] if top_themes else 'N/A'}.",
                f"{s_counts.get('negative',0)} negative review(s) need attention.",
            ],
            "top_praise":   top_themes[0] if pos_pct >= 50 else "N/A",
            "top_concern":  top_themes[0] if s_counts.get("negative",0) > 0 else "None",
        }

    try:
        import anthropic as _anthropic
        client = _anthropic.Anthropic(api_key=api_key)
        review_list = "\n".join(f'- "{r["text"]}"' for r in reviews[:20])
        msg = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=512,
            system="You are a hospitality analyst for Trishul Eco-Homestays. Return ONLY valid JSON.",
            messages=[{
                "role": "user",
                "content": (
                    f"Analyse these {len(reviews)} guest reviews:\n{review_list}\n\n"
                    "Return this exact JSON:\n"
                    '{\n'
                    '  "summary": "<2-3 sentence executive summary>",\n'
                    '  "insights": ["<actionable insight 1>","<actionable insight 2>","<actionable insight 3>"],\n'
                    '  "top_praise": "<most praised aspect>",\n'
                    '  "top_concern": "<biggest concern or None>"\n'
                    '}'
                ),
            }],
        )
        return json.loads(msg.content[0].text.strip())
    except Exception as e:
        print(f"[LLM summarize error] {e}")
        return {
            "summary": f"Analysed {len(reviews)} reviews. {pos_pct}% positive. Top themes: {', '.join(top_themes)}.",
            "insights": [
                f"{pos_pct}% of guests left positive reviews.",
                f"Most discussed: {top_themes[0] if top_themes else 'N/A'}.",
                f"{s_counts.get('negative',0)} negative review(s) need attention.",
            ],
            "top_praise":  top_themes[0] if pos_pct >= 50 else "N/A",
            "top_concern": "None",
        }

# ═════════════════════════════════════════════
#  ROUTES
# ═════════════════════════════════════════════

@app.get("/", tags=["Health"])
def root():
    llm_enabled = bool(os.getenv("ANTHROPIC_API_KEY","").strip())
    return {"status":"ok","app":"Stay Sense API","version":"1.0.0","llm_enabled": llm_enabled}

@app.get("/health", tags=["Health"])
def health():
    return {"status":"ok","rooms":len(ROOMS),"enquiries":len(ENQUIRIES),"reviews":len(REVIEWS)}

# ── Rooms ──────────────────────────────────────────────────
@app.get("/api/rooms", status_code=200, tags=["Rooms"])
def list_rooms(status: Optional[str] = Query(None)):
    if status:
        if status not in {"available","limited"}:
            raise HTTPException(400, "status must be: available | limited")
        return [r for r in ROOMS if r["status"] == status]
    return ROOMS

@app.get("/api/rooms/{room_id}", status_code=200, tags=["Rooms"])
def get_room(room_id: str):
    room = next((r for r in ROOMS if r["id"] == room_id), None)
    if not room: raise HTTPException(404, f"Room '{room_id}' not found.")
    return room

# ── Enquiries ──────────────────────────────────────────────
@app.post("/api/enquiries", status_code=201, tags=["Enquiries"])
def create_enquiry(body: EnquiryCreate):
    if body.room:
        match = next((r for r in ROOMS if r["name"] == body.room or r["id"] == body.room), None)
        if not match:
            raise HTTPException(404, f"Room '{body.room}' not found.")
    enquiry = {"id": make_id("TSH"), **body.model_dump(), "status": "pending", "created_at": now_iso()}
    ENQUIRIES.append(enquiry)
    return enquiry

@app.get("/api/enquiries", status_code=200, tags=["Enquiries"])
def list_enquiries(status: Optional[str] = Query(None)):
    items = ENQUIRIES
    if status:
        if status not in {"pending","contacted","confirmed","declined"}:
            raise HTTPException(400, "Invalid status value.")
        items = [i for i in items if i["status"] == status]
    return sorted(items, key=lambda x: x["created_at"], reverse=True)

@app.get("/api/enquiries/{enquiry_id}", status_code=200, tags=["Enquiries"])
def get_enquiry(enquiry_id: str):
    e = next((i for i in ENQUIRIES if i["id"] == enquiry_id), None)
    if not e: raise HTTPException(404, f"Enquiry '{enquiry_id}' not found.")
    return e

@app.patch("/api/enquiries/{enquiry_id}/status", status_code=200, tags=["Enquiries"])
def update_enquiry_status(enquiry_id: str, body: InquiryStatusUpdate):
    e = next((i for i in ENQUIRIES if i["id"] == enquiry_id), None)
    if not e: raise HTTPException(404, f"Enquiry '{enquiry_id}' not found.")
    e["status"]     = body.status
    e["updated_at"] = now_iso()
    return e

# ── Reviews ────────────────────────────────────────────────
@app.get("/api/reviews", status_code=200, tags=["Reviews"])
def list_reviews(theme: Optional[str] = Query(None)):
    valid = {"food","host","location","cleanliness","value","experience"}
    if theme:
        if theme not in valid:
            raise HTTPException(400, f"theme must be one of: {', '.join(sorted(valid))}")
        return sorted([r for r in REVIEWS if theme in r.get("themes", [])], key=lambda x: x["added_at"], reverse=True)
    return sorted(REVIEWS, key=lambda x: x["added_at"], reverse=True)

@app.post("/api/reviews", status_code=201, tags=["Reviews"])
def add_review(body: ReviewCreate):
    review = {"id": make_id("REV"), **body.model_dump(), "added_at": now_iso()}
    REVIEWS.append(review)
    return review

@app.delete("/api/reviews/{review_id}", status_code=204, tags=["Reviews"])
def delete_review(review_id: str):
    idx = next((i for i, r in enumerate(REVIEWS) if r["id"] == review_id), None)
    if idx is None: raise HTTPException(404, f"Review '{review_id}' not found.")
    REVIEWS.pop(idx)
    return None

# ── Analysis ───────────────────────────────────────────────
@app.post("/api/analyse", status_code=200, tags=["Analysis"])
def analyse_review(body: AnalyseRequest):
    """
    Analyse a single guest review.
    Uses Claude API if ANTHROPIC_API_KEY is set, otherwise keyword matching.
    """
    return _llm_analyse(body.text)

@app.post("/api/analyse/batch", status_code=200, tags=["Analysis"])
def batch_analyse(body: BatchAnalyseRequest):
    """
    Analyse multiple reviews and return per-review results + aggregated insights.
    Uses Claude API if ANTHROPIC_API_KEY is set.
    """
    results = []
    for item in body.reviews:
        if len(item.text.strip()) < 10:
            results.append({
                "text": item.text, "source": item.source,
                "error": "Review too short (min 10 characters)",
                "sentiment": "neutral", "confidence": 0,
                "primary_theme": "experience", "secondary_themes": [],
                "suggested_response": "",
            })
            continue
        analysis = _llm_analyse(item.text)
        results.append({"text": item.text, "source": item.source, **analysis})

    valid_results = [r for r in results if not r.get("error")]
    summary_data  = _llm_summarize(valid_results) if valid_results else {
        "summary": "No valid reviews to summarise.",
        "insights": [], "top_praise": "N/A", "top_concern": "N/A",
    }

    sentiments = Counter(r.get("sentiment","neutral") for r in valid_results)
    themes_all = Counter(
        t for r in valid_results
        for t in ([r.get("primary_theme")] + r.get("secondary_themes",[]))
        if t
    )

    return {
        "results":            results,
        "total":              len(results),
        "failed":             len(results) - len(valid_results),
        "sentiment_breakdown": dict(sentiments),
        "top_themes":         [t for t,_ in themes_all.most_common(3)],
        "llm_used":           bool(os.getenv("ANTHROPIC_API_KEY","").strip()),
        **summary_data,
    }
