"""
Stay Sense API  —  FastAPI backend
=====================================
Endpoints
  Rooms      GET  /api/rooms
             GET  /api/rooms/{room_id}
  Enquiries  POST /api/enquiries
             GET  /api/enquiries
             GET  /api/enquiries/{id}
             PATCH /api/enquiries/{id}/status
  Reviews    GET  /api/reviews
             POST /api/reviews
             DELETE /api/reviews/{id}
  Analysis   POST /api/analyse
  Health     GET  /health

Run:  uvicorn main:app --reload --port 8000
"""

import os, random, string
from datetime import datetime, date as dt_date
from typing import Optional, List
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
    description="Direct booking engine + review intelligence for Trishul Eco-Homestays",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─────────────────────────────────────────────
#  CORS  —  allow the Vite dev server
# ─────────────────────────────────────────────
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",")]

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
    available  = "available"
    limited    = "limited"
    booked     = "booked"

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

class Sentiment(str, Enum):
    positive = "positive"
    neutral  = "neutral"
    negative = "negative"
    mixed    = "mixed"

# ─────────────────────────────────────────────
#  Pydantic models
# ─────────────────────────────────────────────
class EnquiryCreate(BaseModel):
    """Fields match the Enquiry.jsx form state exactly."""
    checkIn:   str
    checkOut:  str
    adults:    int   = 1
    children:  int   = 0
    room:      Optional[str] = None
    name:      str
    phone:     str
    email:     str
    requests:  Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()

    @field_validator("email")
    @classmethod
    def valid_email(cls, v: str) -> str:
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("A valid email address is required")
        return v.lower().strip()

    @field_validator("phone")
    @classmethod
    def valid_phone(cls, v: str) -> str:
        digits = "".join(c for c in v if c.isdigit())
        if len(digits) < 7:
            raise ValueError("Enter a valid phone number")
        return v.strip()

    @field_validator("adults")
    @classmethod
    def adults_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("At least 1 adult required")
        if v > 10:
            raise ValueError("Maximum 10 adults per booking")
        return v

    @model_validator(mode="after")
    def dates_valid(self):
        try:
            ci = dt_date.fromisoformat(self.checkIn)
            co = dt_date.fromisoformat(self.checkOut)
        except ValueError:
            raise ValueError("Dates must be in YYYY-MM-DD format")
        if co <= ci:
            raise ValueError("checkOut must be after checkIn")
        if ci < dt_date.today():
            raise ValueError("checkIn cannot be in the past")
        return self


class InquiryStatusUpdate(BaseModel):
    status: InquiryStatus


class ReviewCreate(BaseModel):
    """Shape matches what StaffDashboard.jsx writes to localStorage."""
    guest:    str
    location: Optional[str] = "Verified Guest"
    source:   str
    rating:   int           = 5
    verified: bool          = True
    themes:   List[Theme]
    text:     str

    @field_validator("text")
    @classmethod
    def text_length(cls, v: str) -> str:
        if len(v.strip()) < 10:
            raise ValueError("Review text must be at least 10 characters")
        return v.strip()

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v: int) -> int:
        if not (1 <= v <= 5):
            raise ValueError("Rating must be between 1 and 5")
        return v


class AnalyseRequest(BaseModel):
    text:   str
    source: Optional[str] = None

    @field_validator("text")
    @classmethod
    def text_length(cls, v: str) -> str:
        if len(v.strip()) < 10:
            raise ValueError("Review text must be at least 10 characters")
        return v.strip()

# ─────────────────────────────────────────────
#  In-memory store  (replaced by DB in Week 5)
# ─────────────────────────────────────────────
ROOMS: list = [
    {
        "id":               "deluxe-hill-view",
        "name":             "Deluxe Hill View Room",
        "description":      "Wake to panoramic views of Trishul and Nanda Devi from a private balcony. Handwoven throws, local art, and the hush of the forest.",
        "capacity_adults":  2,
        "capacity_children":1,
        "bed_config":       "1 King Bed",
        "price_per_night":  4500,
        "amenities":        ["Hill View", "Private Balcony", "Hot Water", "Attached Bath"],
        "status":           "available",
        "image_url":        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    },
    {
        "id":               "forest-cottage",
        "name":             "Forest Cottage",
        "description":      "A freestanding stone-and-wood cottage embedded in the oak forest. Two rooms, a sitting area — perfect for families wanting real privacy.",
        "capacity_adults":  4,
        "capacity_children":2,
        "bed_config":       "2 Double Beds",
        "price_per_night":  7200,
        "amenities":        ["Forest View", "Sitting Room", "Kitchenette", "Private Garden"],
        "status":           "available",
        "image_url":        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    },
    {
        "id":               "meadow-room",
        "name":             "Meadow Room",
        "description":      "Simple, cozy, completely quiet. Opens onto a flower meadow — ideal for solo travellers who just want the forest, the stars, and good food.",
        "capacity_adults":  2,
        "capacity_children":0,
        "bed_config":       "1 Queen Bed",
        "price_per_night":  2800,
        "amenities":        ["Meadow View", "Reading Corner", "Hot Water"],
        "status":           "limited",
        "image_url":        "https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?w=800&q=80",
    },
]

ENQUIRIES: list = []

REVIEWS: list = [
    {
        "id":       "seed-1",
        "guest":    "Ananya Sharma",
        "location": "Delhi",
        "source":   "Google",
        "rating":   5,
        "verified": True,
        "themes":   ["food", "experience"],
        "text":     "The meals here are unlike anything I have had at a hotel. Sunita ji's Kumaoni thali is something I still think about weeks later. Breakfast with fresh eggs while looking at the mountains — absolute perfection.",
        "added_at": "2026-04-12T08:00:00Z",
    },
    {
        "id":       "seed-2",
        "guest":    "Vikram Nair",
        "location": "Bangalore",
        "source":   "TripAdvisor",
        "rating":   5,
        "verified": True,
        "themes":   ["host", "experience"],
        "text":     "Prerna and her family made us feel like we were staying with relatives, not paying guests. They arranged a last-minute trek, remembered my daughter's dairy allergy, and left wildflowers in our room.",
        "added_at": "2026-03-28T10:00:00Z",
    },
    {
        "id":       "seed-3",
        "guest":    "Meera and Rahul Joshi",
        "location": "Mumbai",
        "source":   "Booking.com",
        "rating":   5,
        "verified": True,
        "themes":   ["location", "experience"],
        "text":     "The location is breathtaking. We saw a Himalayan Monal just outside our cottage window on the second morning. Views of Trishul peak are clearest at dawn — set an alarm.",
        "added_at": "2026-03-10T09:00:00Z",
    },
    {
        "id":       "seed-4",
        "guest":    "Shruti Agarwal",
        "location": "Pune",
        "source":   "Google",
        "rating":   5,
        "verified": True,
        "themes":   ["cleanliness", "host"],
        "text":     "The rooms were spotless — fresh linen every day, bathrooms cleaned thoroughly. For a property in the middle of the forest the level of cleanliness was genuinely impressive.",
        "added_at": "2026-02-18T11:00:00Z",
    },
    {
        "id":       "seed-5",
        "guest":    "Aditi Mehta",
        "location": "Hyderabad",
        "source":   "MakeMyTrip",
        "rating":   5,
        "verified": True,
        "themes":   ["value", "experience"],
        "text":     "We booked directly and saved around 20% compared to the OTA price. For everything you get — meals, guided nature walks, bonfire evenings, one of the most beautiful spots in Uttarakhand — this is exceptional value.",
        "added_at": "2026-02-05T07:00:00Z",
    },
    {
        "id":       "seed-6",
        "guest":    "Dev Kapoor",
        "location": "Chennai",
        "source":   "TripAdvisor",
        "rating":   5,
        "verified": True,
        "themes":   ["experience", "location"],
        "text":     "The guided dawn trek, evening bonfire with chai, stargazing with zero light pollution, morning bird walk with Ramesh ji — these are not amenities, they are experiences you carry home.",
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
#  Keyword-based analysis  (LLM plug-in point)
# ─────────────────────────────────────────────
_THEME_KEYWORDS: dict = {
    "food":        ["food", "meal", "breakfast", "lunch", "dinner", "cook", "thali", "taste", "dish", "kitchen", "eat", "menu"],
    "host":        ["host", "staff", "prerna", "sunita", "ramesh", "family", "hospitality", "welcome", "helpful", "care", "friendly"],
    "location":    ["location", "view", "forest", "mountain", "peak", "nature", "surroundings", "altitude", "trek", "scenic", "valley"],
    "cleanliness": ["clean", "dirty", "hygiene", "spotless", "tidy", "smell", "linen", "bathroom", "dust", "fresh"],
    "value":       ["price", "value", "worth", "expensive", "cheap", "affordable", "money", "save", "cost", "budget", "overpriced"],
    "experience":  ["experience", "trek", "bonfire", "stars", "stargazing", "bird", "wildlife", "activity", "walk", "guide", "sunset"],
}

_POS_WORDS = {"amazing", "excellent", "fantastic", "great", "love", "wonderful", "outstanding",
              "incredible", "beautiful", "breathtaking", "perfect", "superb", "delicious", "exceptional"}
_NEG_WORDS = {"terrible", "dirty", "worst", "bad", "poor", "disappointed", "awful",
              "horrible", "rude", "broken", "cold", "noisy", "overpriced", "pathetic"}

_RESPONSES: dict = {
    "positive": "Thank you so much for your wonderful review — feedback like yours truly means the world to us. We hope to welcome you back to the forest soon!",
    "neutral":  "Thank you for taking the time to share your experience. We have noted your feedback carefully and will keep working to improve every aspect of your stay.",
    "negative": "We sincerely apologise for falling short of your expectations — this is not the experience we strive to provide. Please reach out to us directly so we can make it right.",
    "mixed":    "Thank you for your thoughtful review. We are glad parts of your stay resonated, and we will take your feedback seriously to address what fell short.",
}

def _analyse(text: str) -> dict:
    lower = text.lower()
    words = set(lower.split())

    pos = len(words & _POS_WORDS)
    neg = len(words & _NEG_WORDS)

    if neg > 0 and pos > 0:
        sentiment = "mixed"
    elif neg > 0:
        sentiment = "negative"
    elif pos > 0:
        sentiment = "positive"
    else:
        sentiment = "neutral"

    scores = {t: sum(1 for kw in kws if kw in lower) for t, kws in _THEME_KEYWORDS.items()}
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    matched = [t for t, s in ranked if s > 0]

    primary   = matched[0] if matched else "experience"
    secondary = matched[1:3]
    confidence = min(78 + (pos + neg) * 4, 98)

    return {
        "sentiment":          sentiment,
        "confidence":         confidence,
        "primary_theme":      primary,
        "secondary_themes":   secondary,
        "suggested_response": _RESPONSES[sentiment],
    }

# ═════════════════════════════════════════════
#  ROUTES
# ═════════════════════════════════════════════

# ── Health ───────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "app": "Stay Sense API", "version": "1.0.0"}

@app.get("/health", tags=["Health"])
def health():
    return {
        "status":    "ok",
        "rooms":     len(ROOMS),
        "enquiries": len(ENQUIRIES),
        "reviews":   len(REVIEWS),
    }

# ── Rooms ─────────────────────────────────────
@app.get("/api/rooms", status_code=200, tags=["Rooms"],
         summary="List all room types")
def list_rooms(status: Optional[str] = Query(None, description="Filter by status: available | limited | booked")):
    """Return all rooms. Optionally filter by availability status."""
    if status:
        allowed = {"available", "limited", "booked"}
        if status not in allowed:
            raise HTTPException(status_code=400, detail=f"status must be one of: {', '.join(sorted(allowed))}")
        return [r for r in ROOMS if r["status"] == status]
    return ROOMS


@app.get("/api/rooms/{room_id}", status_code=200, tags=["Rooms"],
         summary="Get a single room by ID")
def get_room(room_id: str):
    """Return one room or 404 if the ID does not exist."""
    room = next((r for r in ROOMS if r["id"] == room_id), None)
    if not room:
        raise HTTPException(status_code=404, detail=f"Room '{room_id}' not found.")
    return room

# ── Enquiries ─────────────────────────────────
@app.post("/api/enquiries", status_code=201, tags=["Enquiries"],
          summary="Submit a booking enquiry")
def create_enquiry(body: EnquiryCreate):
    """
    Accepts the Enquiry form payload.
    Validates dates, stores in memory, returns the saved enquiry with a
    generated reference ID (format: TSH-YYYY-XXXXX).
    """
    # Extra check: room must exist if specified
    if body.room:
        match = next((r for r in ROOMS if r["name"] == body.room or r["id"] == body.room), None)
        if not match:
            raise HTTPException(status_code=404, detail=f"Room '{body.room}' not found.")

    enquiry = {
        "id":         make_id("TSH"),
        **body.model_dump(),
        "status":     "pending",
        "created_at": now_iso(),
    }
    ENQUIRIES.append(enquiry)
    return enquiry


@app.get("/api/enquiries", status_code=200, tags=["Enquiries"],
         summary="List all booking enquiries (staff)")
def list_enquiries(
    status: Optional[str] = Query(None, description="Filter by status: pending | contacted | confirmed | declined"),
):
    """Return all enquiries, newest first. Staff use only."""
    items = ENQUIRIES
    if status:
        allowed = {"pending", "contacted", "confirmed", "declined"}
        if status not in allowed:
            raise HTTPException(status_code=400, detail=f"status must be one of: {', '.join(sorted(allowed))}")
        items = [i for i in items if i["status"] == status]
    return sorted(items, key=lambda x: x["created_at"], reverse=True)


@app.get("/api/enquiries/{enquiry_id}", status_code=200, tags=["Enquiries"],
         summary="Get a single enquiry by reference ID")
def get_enquiry(enquiry_id: str):
    """Return one enquiry or 404."""
    enquiry = next((i for i in ENQUIRIES if i["id"] == enquiry_id), None)
    if not enquiry:
        raise HTTPException(status_code=404, detail=f"Enquiry '{enquiry_id}' not found.")
    return enquiry


@app.patch("/api/enquiries/{enquiry_id}/status", status_code=200, tags=["Enquiries"],
           summary="Update enquiry status")
def update_enquiry_status(enquiry_id: str, body: InquiryStatusUpdate):
    """Set status to pending | contacted | confirmed | declined."""
    enquiry = next((i for i in ENQUIRIES if i["id"] == enquiry_id), None)
    if not enquiry:
        raise HTTPException(status_code=404, detail=f"Enquiry '{enquiry_id}' not found.")
    enquiry["status"]     = body.status
    enquiry["updated_at"] = now_iso()
    return enquiry

# ── Reviews ───────────────────────────────────
@app.get("/api/reviews", status_code=200, tags=["Reviews"],
         summary="List all public reviews")
def list_reviews(
    theme: Optional[str] = Query(None, description="Filter by theme: food | host | location | cleanliness | value | experience"),
):
    """Return published reviews, newest first. Optionally filtered by theme."""
    valid = {"food", "host", "location", "cleanliness", "value", "experience"}
    if theme:
        if theme not in valid:
            raise HTTPException(status_code=400, detail=f"theme must be one of: {', '.join(sorted(valid))}")
        results = [r for r in REVIEWS if theme in r["themes"]]
    else:
        results = list(REVIEWS)
    return sorted(results, key=lambda x: x["added_at"], reverse=True)


@app.post("/api/reviews", status_code=201, tags=["Reviews"],
          summary="Publish a review (staff action)")
def add_review(body: ReviewCreate):
    """
    Staff publishes a guest review from the classifier tool.
    Shape matches localStorage staySenseFeaturedReviews exactly.
    """
    review = {
        "id":       make_id("REV"),
        **body.model_dump(),
        "added_at": now_iso(),
    }
    REVIEWS.append(review)
    return review


@app.delete("/api/reviews/{review_id}", status_code=204, tags=["Reviews"],
            summary="Remove a review")
def delete_review(review_id: str):
    """Delete a review by ID. Returns 204 No Content on success."""
    idx = next((i for i, r in enumerate(REVIEWS) if r["id"] == review_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail=f"Review '{review_id}' not found.")
    REVIEWS.pop(idx)
    return None

# ── Analysis ──────────────────────────────────
@app.post("/api/analyse", status_code=200, tags=["Analysis"],
          summary="Analyse a guest review")
def analyse_review(body: AnalyseRequest):
    """
    Keyword-based sentiment + theme classification.
    Returns: sentiment, confidence, primary_theme, secondary_themes, suggested_response.

    This is the LLM plug-in point — swap _analyse() with an API call in Week 5.
    """
    result = _analyse(body.text)
    return result
