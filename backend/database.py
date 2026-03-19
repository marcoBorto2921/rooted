"""
database.py — SQLite database setup for Rooted

Creates the plants table and imports data from plants.csv.
Run this script once to initialize the database:
  python database.py
"""

import sqlite3
import csv

DB_PATH = "plants.db"

def get_connection():
    return sqlite3.connect(DB_PATH)

def init_db():
    """Create the plants table and import data from plants.csv."""
    conn = get_connection()
    cursor = conn.cursor()

    # Create plants table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS plants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            soil TEXT NOT NULL,
            sun TEXT NOT NULL,
            goal TEXT NOT NULL,
            season TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            companion TEXT NOT NULL,
            description TEXT NOT NULL
        )
    """)

    # Import from CSV if table is empty
    cursor.execute("SELECT COUNT(*) FROM plants")
    count = cursor.fetchone()[0]

    if count == 0:
        with open("plants.csv", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute("""
                    INSERT INTO plants (name, soil, sun, goal, season, difficulty, companion, description)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    row["name"], row["soil"], row["sun"], row["goal"],
                    row["season"], row["difficulty"], row["companion"], row["description"]
                ))

    conn.commit()
    conn.close()
    print("Database initialized successfully")

def filter_plants(soil: str, sun: str, goal: str) -> list:
    """Return plants matching the filters, with fallback if no exact match."""
    conn = get_connection()
    cursor = conn.cursor()

    # Try exact match first
    cursor.execute("""
        SELECT name, season, difficulty, companion, description
        FROM plants
        WHERE soil = ? AND sun = ? AND goal = ?
    """, (soil, sun, goal))
    rows = cursor.fetchall()

    # Fallback — match only soil and goal
    if not rows:
        cursor.execute("""
            SELECT name, season, difficulty, companion, description
            FROM plants
            WHERE soil = ? AND goal = ?
        """, (soil, goal))
        rows = cursor.fetchall()

    # Last resort — match only goal
    if not rows:
        cursor.execute("""
            SELECT name, season, difficulty, companion, description
            FROM plants
            WHERE goal = ?
        """, (goal,))
        rows = cursor.fetchall()

    conn.close()

    return [
        {
            "name": row[0],
            "season": row[1],
            "difficulty": row[2],
            "companion": row[3],
            "description": row[4],
        }
        for row in rows
    ]

if __name__ == "__main__":
    init_db()