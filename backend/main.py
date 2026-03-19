"""
main.py — FastAPI backend for Rooted

Exposes a single endpoint:
  POST /recommend — receives user answers and climate data,
  filters plants from the SQLite database, and returns
  a list of matching plants to the Next.js frontend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import init_db, filter_plants

app = FastAPI()

# Initialize database on startup
init_db()

# Allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shape of the request body coming from Next.js
class RecommendRequest(BaseModel):
    soil: str
    sun: str
    goal: str
    max_temp: float
    min_temp: float

@app.get("/")
def root():
    return {"status": "Rooted backend is running"}

@app.post("/recommend")
def recommend(data: RecommendRequest):
    # Filter plants from database based on user answers
    plants = filter_plants(data.soil, data.sun, data.goal)

    if not plants:
        return {"plants": [], "message": "No exact matches found for your conditions"}

    return {"plants": plants}