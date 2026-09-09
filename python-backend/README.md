# Virasat Backend

AI-powered API that discovers GI-tagged Indian handicrafts along a tourist's travel route, generates
tourist-friendly descriptions and a trip summary, and helps connect travelers to underrepresented craft
regions.

Built for Smart India Hackathon 2026 - Tourism (Open Innovation).

## What it does

Given a start and end location, this API:
1. Calculates the actual driving route between the two points (via OpenRouteService)
2. Finds GI-tagged handicrafts from a curated dataset that fall within a configurable distance of that route
3. Returns them sorted by proximity, each with an AI-generated, engaging description
4. Optionally generates a short narrative "trip summary" tying the matched crafts into a cultural trail

## Tech stack

- **FastAPI** - REST API framework
- **MySQL** - craft data storage
- **OpenRouteService** - route/directions calculation
- **Google Gemini API** - AI-generated craft descriptions and trip summaries

## Project structure

```
app/
├── main.py                    # FastAPI app entrypoint, CORS, health checks
├── models/
│   └── craft.py                # Pydantic response model for craft data
├── routes/
│   ├── craft_routes.py         # GET /crafts, GET /crafts/{region}
│   └── trip_routes.py          # POST /trip/crafts-along-route
├── services/
│   ├── db_service.py           # MySQL connection helper
│   ├── geo_service.py          # Route fetching + distance matching (Haversine)
│   └── ai_service.py           # Gemini API calls for descriptions/summaries
└── data/
    ├── schema.sql               # DB schema (crafts table)
    ├── crafts_seed.csv          # Curated dataset of 25 GI-tagged crafts
    ├── seed_db.py                # Loads crafts_seed.csv into MySQL
    └── enrich_crafts.py          # One-time script: generates + caches AI descriptions
```

## Setup

1. Clone the repo and create a virtual environment:
   ```
   python -m venv venv
   venv\Scripts\Activate.ps1      # Windows
   source venv/bin/activate        # Mac/Linux
   pip install -r requirements.txt
   ```

2. Copy `.env.example` to `.env` and fill in real values:
   - MySQL connection details
   - `ORS_API_KEY` - free at openrouteservice.org/dev
   - `GEMINI_API_KEY` - free at aistudio.google.com/apikey

3. Create the database and schema:
   ```sql
   CREATE DATABASE kalatrail;
   ```
   Then run `app/data/schema.sql` against it.

4. Seed the craft data:
   ```
   python -m app.data.seed_db
   ```

5. (Optional) Generate AI descriptions for all crafts - only needs to run once, results are cached:
   ```
   python -m app.data.enrich_crafts
   ```

6. Run the server:
   ```
   uvicorn app.main:app --reload --port 8000
   ```

7. Visit `http://localhost:8000/docs` for interactive API documentation.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Server health check |
| GET | `/health-db` | Confirms MySQL connectivity |
| GET | `/crafts` | Returns all crafts in the database |
| GET | `/crafts/{region}` | Returns crafts filtered by state or district (case-insensitive partial match) |
| POST | `/trip/crafts-along-route` | Core feature - given start/end coordinates, returns crafts near the calculated route |

### Example request: `POST /trip/crafts-along-route`

```json
{
  "start_lat": 26.9124,
  "start_lng": 75.7873,
  "end_lat": 28.6139,
  "end_lng": 77.2090,
  "buffer_km": 50,
  "start_label": "Jaipur",
  "end_label": "Delhi",
  "include_summary": true
}
```

Returns matched crafts (sorted nearest-first) plus an optional AI-generated trip summary paragraph.

## Data source

Craft data is manually curated from India's Geographical Indication (GI) registry, covering 25 crafts
across 15 states with verified region-level coordinates. See `app/data/crafts_seed.csv`.

## Notes

- AI descriptions are pre-generated and cached in the database (`ai_description` column) rather than
  generated live, to keep API responses fast and avoid rate-limit issues during demos.
- Gemini's free tier has a daily request quota; `enrich_crafts.py` is safe to re-run and only processes
  crafts that don't already have a cached description.
