# Stay Sense

Two terminals, two commands — full stack running locally.

## Terminal 1 — Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# → http://localhost:8000
# → http://localhost:8000/docs   (interactive API docs)
```

## Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```
