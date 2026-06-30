# Stay Sense — FastAPI Backend

## Quick start

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Server: **http://localhost:8000**  ·  Docs: **http://localhost:8000/docs**

---

## LLM Integration (optional)

By default the backend uses a **keyword-based fallback** for sentiment/theme analysis — works immediately, no API key needed, but less accurate.


1. Get an API key at https://console.anthropic.com
2. Open `backend/.env` and set:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Restart the server. `GET /` will now show `"llm_enabled": true`.

The `/api/analyse` and `/api/analyse/batch` endpoints automatically switch to Claude
when the key is present, and gracefully fall back to keyword matching if the API call
fails for any reason (rate limit, network error, etc.) — review classification never breaks.

---

## Endpoints

| Method | Path                              | Status | Description                              |
|--------|------------------------------------|--------|-------------------------------------------|
| GET    | `/health`                          | 200    | Live counts of all in-memory data         |
| GET    | `/api/rooms`                       | 200    | List rooms (optional `?status=`)          |
| GET    | `/api/rooms/{id}`                  | 200    | Single room or 404                        |
| POST   | `/api/enquiries`                   | 201    | Submit booking enquiry                    |
| GET    | `/api/enquiries`                   | 200    | List enquiries (optional `?status=`)      |
| GET    | `/api/enquiries/{id}`              | 200    | Single enquiry or 404                     |
| PATCH  | `/api/enquiries/{id}/status`       | 200    | Update enquiry status                     |
| GET    | `/api/reviews`                     | 200    | List reviews (optional `?theme=`)         |
| POST   | `/api/reviews`                     | 201    | Publish a review (staff)                  |
| DELETE | `/api/reviews/{id}`                | 204    | Remove a review                           |
| POST   | `/api/analyse`                     | 200    | Analyse one review (sentiment + theme)    |
| POST   | `/api/analyse/batch`               | 200    | Analyse up to 50 reviews + AI insights    |

## Status codes

| Code | Meaning                  |
|------|--------------------------|
| 200  | Successful GET / PATCH   |
| 201  | Resource created (POST)  |
| 204  | Deleted — no body        |
| 400  | Validation / bad request |
| 404  | Resource not found       |
| 500  | Unexpected server error  |

## CORS

`.env` → `ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`

## Postman collection
