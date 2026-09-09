# Kalā Trail FastAPI Deployment-Readiness Report

**Scope.** This report reviews the existing backend at `Bhuvishree-11/kalatrail-backend` for the immediate hackathon goal: **Virāsat React frontend → public HTTPS FastAPI backend → hosted MySQL → real craft and route data**. No backend code, database architecture, authentication, or Virāsat visual layer was modified during this review.

> **Verdict:** The backend is structurally suitable for a two-day demo once one required dependency line is added, a MySQL database is initialized manually, the OpenRouteService key is configured, and a public HTTPS deployment URL is supplied to the frontend. It is **not deploy-ready as-is** because `fastapi` is absent from `requirements.txt`.[1]

## 1. Runtime and production start command

The application entry point is `app.main:app`. It creates the FastAPI application, installs CORS middleware, exposes health routes, and mounts the craft and trip routers.[2]

| Item | Exact value |
|---|---|
| FastAPI entry point | `app.main:app` |
| Local development command | `uvicorn app.main:app --reload --port 8000` |
| Recommended production command | `gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:$PORT` |
| Required build command | `pip install -r requirements.txt` |
| Health checks | `GET /health`, then `GET /health-db` |

Gunicorn and Uvicorn are already listed, so the production command is supported once FastAPI itself is declared.[1]

## 2. Required pre-deployment change

`requirements.txt` includes Uvicorn, Gunicorn, the MySQL driver, dotenv, requests, and pandas, but **does not include `fastapi`**. A fresh host will therefore fail to import `app.main`.

> **Required one-line change before deployment — do not make any other backend change for the demo:**

```diff
+fastapi
 uvicorn[standard]
 mysql-connector-python
 python-dotenv
 requests
 pandas
 gunicorn
```

No migration framework, container file, or authentication implementation is required for the immediate demo.

## 3. Existing API surface

| Endpoint | Request | Response / operational role |
|---|---|---|
| `GET /` | None | `{ "message": "Kala Trail API is running. See /docs for endpoints." }` |
| `GET /health` | None | Process-level health: `{ "status": "ok", "service": "kalatrail-backend" }` |
| `GET /health-db` | None | Tests an actual MySQL connection; returns database status or error detail. |
| `GET /crafts` | None | Array of all records from `crafts`. |
| `GET /crafts/{region}` | Path parameter such as `jaipur` or `karnataka` | Crafts whose `state` or `district` partially matches, or HTTP 404. |
| `POST /trip/crafts-along-route` | JSON shown below | Road-route craft matches, sorted nearest to the route. |

The route endpoint accepts this exact payload:[3]

```json
{
  "start_lat": 28.6139,
  "start_lng": 77.2090,
  "end_lat": 26.9124,
  "end_lng": 75.7873,
  "buffer_km": 50
}
```

Its actual response shape is:

```json
{
  "route_point_count": 318,
  "crafts_found": 3,
  "crafts": [
    {
      "id": 1,
      "name": "Example Craft",
      "category": "Pottery",
      "state": "Rajasthan",
      "district": "Jaipur",
      "description": "...",
      "ai_description": null,
      "lat": 26.91,
      "lng": 75.79,
      "image_url": null,
      "distance_from_route_km": 7.2
    }
  ]
}
```

`distance_from_route_km` is added by the route-matching service, although it is not part of the public `Craft` Pydantic model because the trip response has no `response_model`.[3] [4]

## 4. MySQL architecture and initialization

The backend uses direct `mysql.connector.connect()` calls; there is no ORM, connection pool, migration tool, or automatic table bootstrap. The connection is built from `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, and `MYSQL_DATABASE`.[5]

| Asset | What it does | Deployment decision |
|---|---|---|
| `app/data/schema.sql` | Creates the `crafts` table and two indexes. | **Run once manually** against the hosted MySQL database. |
| `app/data/seed_db.py` | Deletes all craft rows and inserts CSV rows. | Run once after schema import; safe to rerun only if replacing all demo craft data is acceptable. |
| `app/data/crafts_seed.csv` | 26 geo-located craft records used by route matching. | Required for useful live demo results. |
| `kalaTrail.sql` | Two supplemental `ai_description` updates and a count query only. | **Not** a schema or seed dump; run only after seed, if desired. |

The schema file uses `CREATE TABLE IF NOT EXISTS`, but its two `CREATE INDEX` statements do not use `IF NOT EXISTS`; therefore, treat schema import as a **one-time operation**.[6] There are no migrations to apply. The correct initialization order is:

```bash
# 1. Run once against the hosted MySQL database
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p "$MYSQL_DATABASE" < app/data/schema.sql

# 2. Run from the deployed backend service shell with its production variables
python -m app.data.seed_db

# 3. Optional supplemental text updates, only after seed
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p "$MYSQL_DATABASE" < kalaTrail.sql
```

## 5. External API dependency assessment

**OpenRouteService is required.** `POST /trip/crafts-along-route` calls the ORS driving GeoJSON endpoint to obtain the actual road route. If `ORS_API_KEY` is missing, the service raises an error; ORS failures are returned by the route handler as HTTP 502.[3] [7]

**The LLM is not required for the current route-discovery flow.** The AI service is not mounted as an API route and is only invoked by a manual enrichment workflow. It currently reads `GEMINI_API_KEY`, despite `.env.example` documenting `LLM_API_KEY` and `LLM_PROVIDER=anthropic`; this mismatch affects optional enrichment only, not API startup, `GET /crafts`, or `POST /trip/crafts-along-route`.[8]

The live route endpoint does **not** return road geometry, total road distance, travel duration, artisan records, or experience records. It returns craft matches, coordinates, and `distance_from_route_km`. This is sufficient for real craft discovery; richer map geometry and itinerary timing would require a future endpoint enhancement.

## 6. CORS assessment

The app currently uses `allow_origins=["*"]`, all methods, all headers, and `allow_credentials=True`.[2] For the current token-free React demo, basic cross-origin `fetch` requests are permitted, so CORS is **not a deployment blocker**.

For the hackathon demo, no CORS change is required. Before a real authenticated release, replace the wildcard with the published Virāsat origin and set `allow_credentials=False` unless cookie-based auth is intentionally added. This is a recommended security hardening, not a required route-planner fix.

## 7. Required production variables

| Variable | Required now | Notes |
|---|---:|---|
| `MYSQL_HOST` | Yes | Hosted MySQL hostname. |
| `MYSQL_PORT` | Yes | Hosted MySQL port. |
| `MYSQL_USER` | Yes | Database user. |
| `MYSQL_PASSWORD` | Yes | Database password; store as a sealed secret. |
| `MYSQL_DATABASE` | Yes | The database provisioned by the hosting platform. It need not be named `kalatrail` because the code reads this variable. |
| `ORS_API_KEY` | Yes | Mandatory for live route discovery. |
| `PORT` | Platform-provided | Do not hardcode it; bind Gunicorn to `$PORT`. |
| `GEMINI_API_KEY` | No | Needed only for manual AI enrichment. |
| `LLM_API_KEY`, `LLM_PROVIDER` | No | Present in template but unused by current code. |
| `VITE_API_BASE_URL` | Yes, frontend | Set to the public HTTPS FastAPI origin and rebuild/redeploy the Vite frontend. |

## 8. Simplest reliable two-day deployment plan

**Recommended platform: Railway.** It supports deploying a FastAPI service from a GitHub repository and generating a public domain, while its MySQL template exposes internal database variables to services in the same project.[9] [10]

1. **Make the one-line dependency fix** shown above, commit it to the backend repository, and do not alter application architecture.
2. **Create one Railway project** with two services: a managed MySQL service and a FastAPI service deployed from `Bhuvishree-11/kalatrail-backend`.
3. **Set the FastAPI service start command** to `gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:$PORT`.
4. **Map the private MySQL service variables into the FastAPI service**. If the database service is named `MySQL`, use Railway reference variables:[11]

   ```dotenv
   MYSQL_HOST=${{ MySQL.MYSQLHOST }}
   MYSQL_PORT=${{ MySQL.MYSQLPORT }}
   MYSQL_USER=${{ MySQL.MYSQLUSER }}
   MYSQL_PASSWORD=${{ MySQL.MYSQLPASSWORD }}
   MYSQL_DATABASE=${{ MySQL.MYSQLDATABASE }}
   ORS_API_KEY=<sealed OpenRouteService key>
   ```

5. **Initialize the database once.** Use the database provider’s SQL console or a temporary public TCP proxy to import `app/data/schema.sql`; then open the FastAPI service shell and run `python -m app.data.seed_db`. Keep the database private after initialization whenever possible.[10]
6. **Generate a public HTTPS domain** for the FastAPI service, then verify `/health`, `/health-db`, `/crafts`, and a Delhi→Jaipur `POST /trip/crafts-along-route` request.
7. **Set the Virāsat frontend configuration** to `VITE_API_BASE_URL=https://<fastapi-public-domain>` and rebuild/redeploy the existing frontend. Its route service is already configured to use this variable and normalize the backend response.
8. **Run the six demo journeys** only after the backend and seed data are live: Delhi→Jaipur, Bengaluru→Mysore, Mumbai→Ahmedabad, Kolkata→Varanasi, Chennai→Madurai, and Srinagar→Jammu. Confirm the live planner labels results as live records rather than fallback data.

## 9. Practical readiness checklist

| Check | Current state | Required action |
|---|---|---|
| FastAPI dependency | Blocked | Add `fastapi` to `requirements.txt`. |
| Production command | Ready | Configure Gunicorn command in hosting settings. |
| Hosted MySQL | Not provisioned | Add managed MySQL and map variables. |
| Schema and data | Manual | Import schema, then run seed script. |
| ORS route calls | Not configured | Supply valid `ORS_API_KEY`. |
| CORS | Demo-compatible | Leave as-is for demo; tighten later. |
| Public backend URL | Not created | Generate FastAPI HTTPS domain. |
| Frontend link | Code-ready | Set `VITE_API_BASE_URL` and redeploy. |
| Authentication | Not implemented | Out of scope for this phase. |

## References

[1]: https://github.com/Bhuvishree-11/kalatrail-backend/blob/main/requirements.txt "Kalā Trail backend requirements"
[2]: https://github.com/Bhuvishree-11/kalatrail-backend/blob/main/app/main.py "FastAPI entry point and CORS configuration"
[3]: https://github.com/Bhuvishree-11/kalatrail-backend/blob/main/app/routes/trip_routes.py "Trip route API"
[4]: https://github.com/Bhuvishree-11/kalatrail-backend/blob/main/app/models/craft.py "Craft response model"
[5]: https://github.com/Bhuvishree-11/kalatrail-backend/blob/main/app/services/db_service.py "MySQL connection service"
[6]: https://github.com/Bhuvishree-11/kalatrail-backend/blob/main/app/data/schema.sql "Manual MySQL schema"
[7]: https://github.com/Bhuvishree-11/kalatrail-backend/blob/main/app/services/geo_service.py "OpenRouteService and route matching"
[8]: https://github.com/Bhuvishree-11/kalatrail-backend/blob/main/app/services/ai_service.py "Optional AI enrichment service"
[9]: https://docs.railway.com/guides/fastapi "Railway FastAPI deployment guide"
[10]: https://docs.railway.com/databases/mysql "Railway MySQL service guide"
[11]: https://docs.railway.com/variables "Railway reference variables guide"
