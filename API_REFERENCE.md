# KalaTrail API Reference (for Frontend)

Base URL (local dev): http://localhost:8000
Base URL (deployed): https://kalatrail-backend-production.up.railway.app/ 

Interactive docs (test endpoints live): <base-url>/docs

---

## GET /health
Quick check that the server is alive.

Response 200
{ "status": "ok", "service": "kalatrail-backend" }

---

## GET /health-db
Confirms the backend can actually reach MySQL, not just that the server is up.

Response 200
{ "status": "ok", "database": "connected" }

Response 200 (even on failure - check the "status" field)
{ "status": "error", "database": "not connected", "detail": "<error details>" }

---

## GET /crafts
Returns all crafts in the database.

Response 200 - array of craft objects
[
  {
    "id": 20,
    "name": "Blue Pottery",
    "category": "Handicraft",
    "state": "Rajasthan",
    "district": "Jaipur",
    "description": "Persian-influenced glazed pottery made without clay...",
    "ai_description": "Step into the vibrant world of Jaipur with Blue Pottery...",
    "lat": 26.9124,
    "lng": 75.7873,
    "image_url": null
  }
]

Use "ai_description" for display - it's the friendly, tourist-facing text. "description" is the raw factual version (backup/fallback only). "image_url" is currently always null (no images added yet).

---

## GET /crafts/id/{craft_id}
Returns a single craft by its numeric id. Useful for a craft detail/page view.

Example: GET /crafts/id/20

Response 200 - single craft object (same shape as one item in /crafts)
{
  "id": 20,
  "name": "Blue Pottery",
  "category": "Handicraft",
  "state": "Rajasthan",
  "district": "Jaipur",
  "description": "...",
  "ai_description": "...",
  "lat": 26.9124,
  "lng": 75.7873,
  "image_url": null
}

Response 404 - if no craft exists with that id:
{ "detail": "No craft found with id 999" }

---

## GET /crafts/{region}
Returns crafts filtered by state or district (case-insensitive, partial match).

Example: GET /crafts/karnataka or GET /crafts/jaipur

Response 200 - same shape as /crafts, filtered

Response 404 - if no crafts match that region:
{ "detail": "No crafts found for region 'xyz'" }

Note: this route matches any string not already handled by /crafts/id/{craft_id}, so a request like /crafts/id alone or /crafts/20 (a bare number) will be treated as a region search, not a lookup by id. Always use /crafts/id/{craft_id} for id-based lookups.

---

## POST /trip/crafts-along-route
The core feature. Given a start and end location, returns crafts along the driving route between them.

Request body
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

Fields:
- start_lat (float, required): -90 to 90
- start_lng (float, required): -180 to 180
- end_lat (float, required): -90 to 90
- end_lng (float, required): -180 to 180
- buffer_km (float, optional): default 50, max 500. How far from the route to search.
- start_label (string, optional): display name, used in the AI trip summary text
- end_label (string, optional): display name, used in the AI trip summary text
- include_summary (bool, optional): default true. Set false to skip AI summary generation (faster response).

Response 200
{
  "route_point_count": 1552,
  "crafts_found": 2,
  "crafts": [
    {
      "id": 20,
      "name": "Blue Pottery",
      "category": "Handicraft",
      "state": "Rajasthan",
      "district": "Jaipur",
      "description": "...",
      "ai_description": "...",
      "lat": 26.9124,
      "lng": 75.7873,
      "image_url": null,
      "distance_from_route_km": 0
    },
    {
      "id": 21,
      "name": "Bagru Hand Block Print",
      "...": "...",
      "distance_from_route_km": 24
    }
  ],
  "trip_summary": "A short AI-generated paragraph describing the craft trail, or null if generation failed/was skipped."
}

Notes for frontend:
- "crafts" array is sorted nearest-to-route first (distance_from_route_km ascending).
- "trip_summary" can be null - always handle that case gracefully in the UI (just hide that section, don't show "null" or crash).
- This endpoint can take a few seconds (external route API + AI call) - show a loading state.
- If "crafts_found" is 0, "crafts" will be an empty array and "trip_summary" will be null (nothing to summarize).

Response 422 - validation error (bad lat/lng, buffer_km out of range, etc.)
{
  "detail": [
    { "type": "less_than_equal", "loc": ["body", "start_lat"], "msg": "Input should be less than or equal to 90", "input": 999 }
  ]
}

Response 502 - route calculation failed (external routing API issue)
{ "detail": "Failed to fetch route: <error details>" }

Response 500 - unexpected server error (DB issue, etc.)
{ "detail": "Something went wrong on our end. Please try again." }

---

## General notes
- All responses are JSON.
- CORS is currently open (*) for development. Once the frontend has a deployed URL, the backend will restrict allowed origins via an ALLOWED_ORIGINS env var - ping the backend dev if CORS errors start appearing after that change.
- No authentication required currently.
- Any unhandled server error returns a clean 500 JSON response rather than a raw stack trace.