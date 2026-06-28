# Stay Sense — FastAPI Backend

## Quick start

```bash
# 1. Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Mac / Linux
# venv\Scripts\activate         # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the development server
uvicorn main:app --reload --port 8000
```

Server runs at **http://localhost:8000**

Interactive API docs: **http://localhost:8000/docs**

---

## Endpoints

| Method   | Path                              | Status | Description                        |
|----------|-----------------------------------|--------|------------------------------------|
| GET      | `/health`                         | 200    | Live counts of all in-memory data  |
| GET      | `/api/rooms`                      | 200    | List rooms (optional `?status=`)   |
| GET      | `/api/rooms/{room_id}`            | 200    | Single room or 404                 |
| POST     | `/api/enquiries`                  | 201    | Submit booking enquiry             |
| GET      | `/api/enquiries`                  | 200    | List enquiries (optional `?status=`)|
| GET      | `/api/enquiries/{id}`             | 200    | Single enquiry or 404              |
| PATCH    | `/api/enquiries/{id}/status`      | 200    | Update enquiry status              |
| GET      | `/api/reviews`                    | 200    | List reviews (optional `?theme=`)  |
| POST     | `/api/reviews`                    | 201    | Publish a review (staff)           |
| DELETE   | `/api/reviews/{id}`               | 204    | Remove a review                    |
| POST     | `/api/analyse`                    | 200    | Analyse review text                |

## Status codes used

| Code | Meaning                  |
|------|--------------------------|
| 200  | Successful GET / PATCH   |
| 201  | Resource created (POST)  |
| 204  | Deleted — no body        |
| 400  | Validation / bad request |
| 404  | Resource not found       |
| 500  | Unexpected server error  |

## CORS

Configured in `.env`:

```
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Add additional origins as a comma-separated list.

## Postman collection

Import `stay-sense.postman_collection.json` into Postman or Thunder Client.
Contains 15 requests across 5 folders covering every endpoint,
including error cases (400, 404).

## Note on data

All data is in-memory — it resets when the server restarts.
Database integration (Supabase / PostgreSQL) is wired in Week 5.
