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
2. Calls the **Open-Meteo API** with those coordinates to fetch local climate data (max/min temperatures, precipitation) for the next 16 days
3. Sends the form answers + climate data to an internal API route (`/api/recommend`)
4. The API route builds a prompt and calls **Groq** (Llama 3.3 70B) to generate 4 personalized plant recommendations
5. Each recommendation includes the plant name, why it suits the land, the best planting season, difficulty level, and a companion plant

---

## Tech stack

| Layer | Tool | Why |
|---|---|---|
| Frontend | Next.js + Tailwind CSS | Routing, API routes, fast UI |
| AI model | Groq API — Llama 3.3 70B | Free tier, very fast inference |
| Climate data | Open-Meteo API | Free, no API key needed |
| Geolocation | Browser Geolocation API | Native, no external service |
| Deploy | Vercel | One-click deploy, free for hobby projects |

---

## Project structure
```
rooted/
├── app/
│   ├── page.tsx              # Main page — multi-step form and recommendations UI
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── api/
│       └── recommend/
│           └── route.ts      # Server-side API route — calls Groq
├── public/                   # Static assets
├── .env.local                # Environment variables (not committed)
└── package.json              # Dependencies
```

---

## Local installation

### Requirements

- Node.js v18 or higher
- A free [Groq API key](https://console.groq.com)

### Steps

1. Clone the repository
```bash
git clone https://github.com/your-username/rooted.git
cd rooted
```

2. Install dependencies
```bash
npm install
```

3. Create the environment variables file
```bash
cp .env.example .env.local
```

Then open `.env.local` and add your Groq API key:
```
GROQ_API_KEY=your_key_here
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

---

## Future improvements

- [ ] Photo upload for soil analysis (vision model)
- [ ] Reverse geocoding to show the detected city name
- [ ] Plant database with filtering (FastAPI + Python microservice)
- [ ] Seasonal calendar view for planting schedule
- [ ] Multi-language support

---

## License

MIT
```