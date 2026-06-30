**Stay Sense**

## Run (two terminals)

**Terminal 1 — Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend**
```bash
cd ..
npm install && npm run dev
# → http://localhost:5173
```

## Optional: Enable real AI analysis
Add your Anthropic API key to `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
```
Without a key, the backend uses an accurate keyword-based fallback everything works either way.
