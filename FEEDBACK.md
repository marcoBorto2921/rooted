# Notes for the next conversation — Rooted 🌱

This file is for the project owner to share with collaborators or use
as a reference for the next development session. It contains open questions,
feedback needed, and future directions.

---

## Questions for your friend (domain expert)

These are things a developer cannot decide alone — they require knowledge
of how self-managed communities actually work and what their members need.

### About the users

- Who exactly will use this? Experienced gardeners, or complete beginners with no knowledge of soil or plants?
- Will it be used on mobile (in the field, while looking at the land) or on desktop?
- What language should the interface be in? Only English, or does it need to support Italian or other languages?
- Are the communities urban (rooftops, courtyards) or rural (fields, forests)?

### About the form

- Are the 4 current questions (soil, sun, size, goal) enough? What important information is missing?
- Is "soil type" too technical for the target users? Would they know the difference between clay and silty?
- Should we add altitude? It matters a lot for mountain communities.
- Should we add water availability? (rain-fed, irrigation, near a stream)
- Should we add the current state of the land? (abandoned field, already cultivated, virgin forest)

### About the plants

- The current database has 30 generic plants. Which plants are most relevant for self-managed communities in your region?
- Are there traditional or local varieties that should be prioritized?
- Should the app suggest only annual plants, or also perennials and trees?
- Should there be a distinction between plants for immediate results (this season) and long-term plants (fruit trees, hedges)?

### About the recommendations

- Is 4 plants the right number, or should it suggest more or fewer?
- Should the app explain what NOT to plant as well?
- Should companion planting be more prominent? (which plants grow well together)
- Should the app generate a seasonal calendar showing what to plant month by month?

---

## Possible future features — ranked by impact

### High impact, relatively easy to build

**Bigger plant database**
The current CSV has 30 plants. The app works much better with 200-300 plants
covering more combinations. Your friend could help curate a list of plants
suited to self-managed communities. Alternatively, integrate the Trefle API
(400,000+ plants, free tier available).

**Detected city name**
Currently the app uses GPS coordinates but never tells the user which city
was detected. Adding reverse geocoding (free with Nominatim/OpenStreetMap)
would make the experience feel more personal: "Recommendations for Milan, Italy".

**Better fallback when no plants match**
If the database has no plants for a specific combination of soil + sun + goal,
the app currently returns nothing. A better experience would be to show the
closest matches with a note explaining why they might still work.

### High impact, more work to build

**Seasonal calendar**
Instead of just listing plants, show a month-by-month calendar of what to
plant when. This is very useful for communities planning ahead for the whole year.

**Photo upload for soil analysis**
Let the user take a photo of their soil and use a vision model to help
identify the soil type. This removes the need for the user to know the
difference between clay and sandy soil — the most technically difficult
question in the current form.

**Admin panel for the plant database**
Right now adding plants requires editing a CSV file and regenerating the
database from the terminal. A simple web interface where your friend can
add, edit, and remove plants without touching code would make the project
much more maintainable long-term.

**Multi-language support**
If the target communities are Italian (or other languages), the interface
should be localized. Next.js has good internationalization support built in.

### Lower priority

**User accounts**
Let users save their land profile and revisit recommendations without
filling the form again. Requires a proper database (PostgreSQL) and
authentication — significant added complexity.

**Community map**
Show a map of all the communities using the app and what they are growing.
Requires user accounts and consent. Very engaging but complex to build
and maintain.

---

## Technical debt to address before scaling

- The plant database has only 30 plants and many combinations return no results.
  This needs to be expanded before sharing the app publicly.
- The backend URL (`http://localhost:8000`) is hardcoded in the Next.js API route.
  Before deploying to production, this must be moved to an environment variable.
- The `venv` folder in `backend/` should be added to `.gitignore` if not already there.
- Error handling is minimal — if Groq is down or returns malformed JSON, the app crashes.
  Add try/catch blocks around all external API calls.

---

## How to continue in the next session

Tell your developer:

> "Let's continue building Rooted. The current state is:
> frontend (Next.js) and backend (FastAPI + SQLite) are both working locally.
> The form collects soil, sun, size, and goal. The backend filters plants
> from a CSV-based SQLite database and Groq generates the explanations.
> Next steps are: expand the plant database, move the backend URL to
> an environment variable, and deploy both services."
