# Rooted 🌱

AI-powered plant advisor for self-managed communities. Answer a few questions about your land and get personalized planting recommendations based on your soil, climate, and goals.

---

## How it works

The user goes through a 4-step form:

1. **Soil type** — clay, sandy, silty, or unknown
2. **Sun exposure** — full sun, partial shade, or shade
3. **Space size** — small, medium, or large
4. **Main goal** — grow food, biodiversity, shade, or attract pollinators

On the last step, the app:

1. Asks the browser for the user's GPS coordinates
2. Calls **Open-Meteo API** with those coordinates to fetch local climate data (max/min temperatures, precipitation) for the next 16 days
3. Sends the form answers + climate data to the Next.js API route (`/api/recommend`)
4. The API route calls the **Python backend** which filters matching plants from the SQLite database
5. The filtered plants are passed to **Groq (Llama 3.3 70B)** which writes a personalized explanation for each one
6. The frontend displays the recommendations as cards

---

## Tech stack

| Layer | Tool | Why |
|---|---|---|
| Frontend + API routes | Next.js + Tailwind CSS | Routing, server-side API, fast UI |
| AI model | Groq API — Llama 3.3 70B | Free tier, very fast inference |
| Backend + database | FastAPI + SQLite | Plant filtering, extensible in Python |
| Climate data | Open-Meteo API | Free, no API key needed |
| Geolocation | Browser Geolocation API | Native, no external service |
| Deploy (frontend) | Vercel | One-click deploy, free for hobby |
| Deploy (backend) | Railway | Free tier for Python services |

---

## Project structure

```
rooted/
├── app/                        # Next.js routing and pages
│   ├── page.tsx                # Main page — multi-step form and recommendations UI
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles
│   └── api/
│       └── recommend/
│           └── route.ts        # Next.js API route — orchestrates backend + Groq
├── backend/                    # Python FastAPI backend
│   ├── main.py                 # FastAPI app and endpoints
│   ├── database.py             # SQLite setup and plant filtering
│   ├── plants.csv              # Plant data — edit this to add/remove plants
│   └── plants.db               # SQLite database (auto-generated, do not edit)
├── public/                     # Static assets
├── requirements.txt            # Python dependencies
├── .env.local                  # Secret keys (never commit this)
├── .env.example                # Template for environment variables
└── package.json                # Node.js dependencies
```

---

## Local installation

### Requirements

- Node.js v18 or higher → [nodejs.org](https://nodejs.org)
- Python v3.10 or higher → [python.org](https://python.org)
- A free Groq API key → [console.groq.com](https://console.groq.com)

### Steps

**1. Clone the repository**

```bash
git clone https://github.com/your-username/rooted.git
cd rooted
```

**2. Set up environment variables**

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Groq API key:

```
GROQ_API_KEY=your_key_here
```

**3. Install Node.js dependencies**

```bash
npm install
```

**4. Set up the Python backend**

```bash
cd backend
python -m venv venv
```

On Windows:
```bash
venv\Scripts\activate
```

On Mac/Linux:
```bash
source venv/bin/activate
```

Then install dependencies and initialize the database:

```bash
pip install -r requirements.txt
python database.py
```

---

## Running the app locally

Every time you want to run the app locally you need **two terminals open at the same time**.

**Terminal 1 — Next.js frontend (from the root folder)**

```bash
npm run dev
```

The frontend will be available at → http://localhost:3000

**Terminal 2 — Python backend (from the backend folder)**

```bash
cd backend
venv\Scripts\activate       # Windows
source venv/bin/activate    # Mac/Linux
uvicorn main:app --reload --port 8000
```

The backend API will be available at → http://localhost:8000
The interactive API docs will be available at → http://localhost:8000/docs

Both servers must be running at the same time for the app to work.

---

## Adding or editing plants

Plants are stored in `backend/plants.csv`. You can open it in Excel or Google Sheets and add rows freely.

Each row must have these columns:

| Column | Values |
|---|---|
| name | Any plant name |
| soil | `clay` / `sandy` / `silty` / `unknown` |
| sun | `full` / `partial` / `shade` |
| goal | `food` / `biodiversity` / `shade` / `pollinators` |
| season | `Spring` / `Summer` / `Autumn` / `Winter` |
| difficulty | `Easy` / `Medium` / `Hard` |
| companion | Any plant name |
| description | One sentence describing the plant |

After editing the CSV, delete the old database and regenerate it:

```bash
cd backend
del plants.db          # Windows
rm plants.db           # Mac/Linux
python database.py
```

---

## Future improvements

- [ ] Photo upload for soil analysis using a vision model
- [ ] Reverse geocoding to display the detected city name
- [ ] Trefle API integration for a larger plant database
- [ ] Seasonal calendar view showing when to plant what
- [ ] Multi-language support
- [ ] User accounts to save and revisit recommendations
- [ ] Admin panel to manage the plant database without touching CSV files

---

## License

MIT
