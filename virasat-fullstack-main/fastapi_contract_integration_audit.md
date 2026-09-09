# Kalā Trail FastAPI Contract and Virāsat Integration Audit

**Audit scope:** This document is a read-only comparison of the current `main` branch at `Bhuvishree-11/virasat-backend`—the GitHub destination currently reached from the user-supplied `kalatrail-backend` URL—and the current Virāsat frontend. No backend, API, frontend service, database, route, authentication, or deployment code was changed for this audit.

> **Scope distinction:** The audit distinguishes what the Python source actually returns from what the frontend currently renders. It does not treat the backend’s README/API reference prose as a substitute for route code.

## 1. Implemented API surface

The application creates a single `FastAPI(title="Kala Trail API", version="0.1.0")` instance, mounts the craft and trip routers, and defines three app-level endpoints. The route handlers use no FastAPI dependency that checks a user, bearer token, cookie, or role; the repository’s API reference also states that no authentication is required currently. [1] [2] [3]

| Method | Path | Implemented request contract | Success response | Error behavior / notes |
|---|---|---|---|---|
| `GET` | `/` | No parameters | `{ "message": "Kala Trail API is running.", "docs": "/docs", "endpoints": [...] }` | App-level informational endpoint. |
| `GET` | `/health` | No parameters | `{ "status": "ok", "service": "kalatrail-backend" }` | No authentication. |
| `GET` | `/health-db` | No parameters | `{ "status": "ok", "database": "connected" }` | A handled database failure instead returns HTTP `200` with `{ "status": "error", "database": "not connected", "detail": "<exception text>" }`. |
| `GET` | `/crafts` | No parameters | Array of `Craft` response objects described in Section 2 | Database query errors are converted to HTTP `500` with `{ "detail": "Failed to fetch crafts." }`. |
| `GET` | `/crafts/id/{craft_id}` | Required path parameter: `craft_id: int` | One `Craft` response object | Invalid non-integer path input is FastAPI/Pydantic validation (`422`). Unknown numeric ID returns `404` with `{ "detail": "No craft found with id <id>" }`. Query errors return `500`. |
| `GET` | `/crafts/{region}` | Required path parameter: `region: str` | Array of `Craft` response objects matching `state` or `district` by case-insensitive partial match | No match returns `404` with `{ "detail": "No crafts found for region '<region>'" }`. Query errors return `500`. `/crafts/id/{craft_id}` is registered first so it does not collide with the region matcher. |
| `POST` | `/trip/crafts-along-route` | JSON object described in Section 3 | Route-point count, matched crafts, and optional trip summary | Invalid request body is `422`; OpenRouteService failures are `502`; uncaught failures are converted to clean `500` JSON. |

The root endpoint explicitly points users to `/docs`. Because the app does not disable FastAPI defaults, `/docs`, `/redoc`, and `/openapi.json` are framework-provided documentation endpoints rather than separately authored business APIs. [1]

## 2. Craft records and database contract

### Public `Craft` response model

The craft-list, region, and single-craft handlers declare `response_model=Craft`. Their public response model is exactly:

| Field | Type / nullability | Source meaning |
|---|---|---|
| `id` | `int`, required | Numeric primary key. |
| `name` | `str`, required | Craft name. |
| `category` | `str \| null` | Craft category. |
| `state` | `str \| null` | State. |
| `district` | `str \| null` | District. |
| `description` | `str \| null` | Stored factual description. |
| `ai_description` | `str \| null` | Stored AI-generated description, if populated. |
| `lat` | `float \| null` | Latitude. |
| `lng` | `float \| null` | Longitude. |
| `image_url` | `str \| null` | Image URL. |

The only application database table defined in `app/data/schema.sql` is `crafts`. It has the preceding fields plus `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`; indexes exist on `state` and `district`. There are no tables or fields for GI tags, ODOP tags, users, sessions, artisans, vendors, products, experiences, reservations, carts, cultural trails, verification queues, analytics, or reports. [4] [5]

The seed script deletes all existing craft rows before inserting CSV values into `name`, `category`, `state`, `district`, `description`, `lat`, `lng`, and `image_url`. It does not seed any other entity. In particular, `ai_description` is not populated by this seed script. [6]

### Important route-response distinction

`POST /trip/crafts-along-route` does **not** declare a Pydantic response model. It performs `SELECT * FROM crafts`, copies each matched row, then appends `distance_from_route_km`. Consequently, the source-level nested craft object can contain every `crafts` table column—including `created_at`—as well as `distance_from_route_km`. The published API reference illustrates the commonly useful craft fields and distance but omits `created_at`; a frontend should therefore consume the documented fields and safely ignore extra properties. [3] [4] [7]

## 3. Route-discovery API contract

### Request body

`POST /trip/crafts-along-route` accepts the following Pydantic `RouteRequest` JSON body. The first four fields are required.

| Field | Type | Required | Validation / default | Used for |
|---|---|---:|---|---|
| `start_lat` | `float` | Yes | `-90` to `90` inclusive | Origin latitude. |
| `start_lng` | `float` | Yes | `-180` to `180` inclusive | Origin longitude. |
| `end_lat` | `float` | Yes | `-90` to `90` inclusive | Destination latitude. |
| `end_lng` | `float` | Yes | `-180` to `180` inclusive | Destination longitude. |
| `buffer_km` | `float \| null` | No | Default `50`; strictly greater than `0`; maximum `500` | Maximum distance from a sampled route point used to match crafts. |
| `start_label` | `str \| null` | No | Default `""` | Optional text used only when forming the AI trip-summary prompt. |
| `end_label` | `str \| null` | No | Default `""` | Optional text used only when forming the AI trip-summary prompt. |
| `include_summary` | `bool \| null` | No | Default `true` | Whether the server attempts an AI trip summary when crafts match. |

The service calls OpenRouteService’s driving-car GeoJSON endpoint with `[longitude, latitude]` coordinate pairs. It samples up to roughly 200 route points, calculates a Haversine distance to each craft’s stored `lat`/`lng`, discards crafts with either coordinate missing, keeps crafts within `buffer_km`, appends `distance_from_route_km` rounded to one decimal place, and sorts nearest first. [3] [8]

### Response body

There is no declared FastAPI response schema, but the handler always returns the following top-level object on a successful route request:

| Field | Runtime shape | Meaning |
|---|---|---|
| `route_point_count` | `int` | Number of route-coordinate points returned by OpenRouteService. |
| `crafts_found` | `int` | Count of matched craft rows. |
| `crafts` | `array` | Raw matching craft rows plus `distance_from_route_km`, ordered nearest first. |
| `trip_summary` | `str \| null` | AI-generated summary only when `include_summary` is true, at least one craft matched, and Gemini succeeds; otherwise `null`. |

The code handles failure to get the road route by returning `502` with `detail` text. It intentionally swallows Gemini summary failures, logs a warning, and still returns successful discovery results with `trip_summary: null`. [3]

## 4. Runtime configuration, external dependencies, CORS, and authentication

| Configuration / concern | What the source actually uses | Requirement level |
|---|---|---|
| MySQL | `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`. The connector uses a lazy five-connection MySQL pool. Fallbacks are `localhost`, `3306`, `root`, empty password, and `kalatrail`. | Required for database-backed endpoints and `/health-db`; deployment must provide valid production values. |
| Route provider | `ORS_API_KEY` is read by `geo_service.py`; missing it causes the trip route lookup to throw, which becomes `502`. | Required for `POST /trip/crafts-along-route`. Not required for craft or health routes. |
| AI summary | `GEMINI_API_KEY` is the variable actually read by `ai_service.py`, using model `gemini-3.5-flash`. | Optional for core route discovery; without it, requested summaries become `null` and matched craft results still return. |
| CORS | `ALLOWED_ORIGINS` is optionally split on commas. If absent, the app configures `allow_origins=["*"]`, `allow_credentials=True`, `allow_methods=["*"]`, and `allow_headers=["*"]`. | Configure the production Virāsat origin in `ALLOWED_ORIGINS` before a production connection. |
| Authentication | No router uses a security dependency; no user/session route or auth table is present. | No authentication is required or implemented for current APIs. |
| `.env.example` drift | The committed template lists `LLM_API_KEY` and `LLM_PROVIDER`, while the current live-route code reads `GEMINI_API_KEY`. | Use the variable named in current source (`GEMINI_API_KEY`) if AI summaries are desired; do not rely on the stale template names. |

The dependency manifest contains `fastapi`, `uvicorn`, `mysql-connector-python`, `requests`, `python-dotenv`, and the Pydantic stack required by the current source. It does **not** define a separate authentication SDK or ORM. [8] [9] [10]

## 5. Comparison with the current Virāsat frontend

### What can connect immediately

| Current frontend surface / service | Existing implementation | Backend contract fit | Immediate integration status |
|---|---|---|---|
| **Cultural Detour Engine / Planner** | `client/src/services/routeService.ts` already POSTs `start_lat`, `start_lng`, `end_lat`, `end_lng`, and `buffer_km` to `/trip/crafts-along-route`, normalizes returned crafts, and preserves a curated fallback. | **Direct match.** All sent fields are valid and required fields are present. | **Ready now.** Set `VITE_API_BASE_URL` to the deployed backend URL. No UI rewrite is required. |
| Planner live/fallback indicator | `Planner.tsx` recognizes `source: "api"` versus `"mock"`, shows a live-record label, and keeps a retry path. | **Direct match.** | **Ready now.** |
| Route planner loading/error state | Planner already wraps `discoverRoute` in `isTracing` and `traceError` states. | Backend may take time due to OpenRouteService and optional Gemini, and can return `502`. | **Ready now.** Existing UI can surface failures and fallback. |
| Route summary | The backend can return `trip_summary`. Current `BackendRouteResponse` does not type or render it. | **Compatible but unused.** | **Small frontend-only extension needed** to include labels in payload and present the nullable summary. |
| Exact route detour distance | The backend returns `distance_from_route_km`. Current frontend ignores it and fabricates display distance/detour timing in `normalizeCraft`. | **Compatible but unused.** | **Small frontend-only extension needed** to show the real distance and clearly retain estimated time separately. |

The Planner currently submits only the core coordinate/body fields. Since `start_label`, `end_label`, and `include_summary` are optional, that request is contract-valid today; it simply causes labels to default to empty strings while a summary is attempted by default. [3] [11] [12]

### What is only partially compatible

| Frontend surface | Existing frontend data approach | Why it is not a drop-in connection | Safe next integration step |
|---|---|---|---|
| **Explore catalogue** | Imports `crafts` and category metadata from `client/src/data/mock.ts`. | `GET /crafts` can supply core craft identity, category, location, description, coordinates, and image URL, but provides no GI or ODOP field used by the current filter UI. | Add a craft-catalogue service with API-first fetch and mock fallback. Treat GI/ODOP as unavailable until the backend schema exposes them, rather than inventing flags. |
| **Craft detail** | Looks up a local route-catalogue entry by slug-like frontend `id` such as `kota-doria`. | The backend single-record endpoint accepts only numeric `id` at `/crafts/id/{craft_id}`. It does not offer a slug lookup or all of the detail-page editorial metadata. | Add a stable backend-ID mapping or add a backend slug field/endpoint in a later backend change; then API-fetch the core craft record and keep editorial/provenance UI as a frontend layer. |
| **Images** | Uses curated Manus storage imagery. | Backend has `image_url`, but the seed script can store null and the API reference says its images are currently null. | Continue current visual imagery as a presentational fallback; use `image_url` only when non-null. |

### What the current backend cannot power

The following existing Virāsat flows should remain local-demo or database-bridge backed until the FastAPI repository implements tables and endpoints for them. The present schema and routers do not provide an API contract for any of these domains. [4] [5]

| Virāsat capability | Missing backend capability |
|---|---|
| Frontend mock login, signup, role persistence, logout, protected role routing | User identity, authentication/session/token endpoints, role model, and authorization policy. |
| Traveller bookings, cart, saved crafts, personal trail state | User-scoped booking, cart, saved-item, and trail tables/endpoints. |
| Artisan product CRUD, stock, orders, experience listings, tourist-interest dashboard | Artisan/vendor, product, inventory, order, experience, and analytics data models/endpoints. |
| Authority verification, craft review, regional reports, demand analytics | Verification, moderation, region metrics, report-generation, and authority authorization endpoints. |
| Explore GI/ODOP filtering | GI/ODOP storage fields and query/filter parameters. |

## 6. Recommended phased integration plan

| Phase | Change scope | Exact work | Outcome / guardrails |
|---|---|---|---|
| **0. Deploy and prove the existing service** | Deployment only | Set valid MySQL variables, `ORS_API_KEY`, and `ALLOWED_ORIGINS=<Virāsat production origin>`; seed `crafts`; verify `/health`, `/health-db`, `/crafts`, and one `POST /trip/crafts-along-route`. | No endpoint or frontend design change. Confirm the live response before setting the frontend base URL. |
| **1. Enable the planner’s existing live path** | Frontend configuration only | Set `VITE_API_BASE_URL` to the verified HTTPS service URL and redeploy the frontend. | The existing `routeService` already attempts the API first and falls back cleanly. Verify its `source` changes to `api`. |
| **2. Consume optional route metadata** | Small frontend change | Send `start_label`, `end_label`, and optionally `include_summary`; extend the TypeScript response type for `trip_summary` and `distance_from_route_km`; render them only when supplied. | Preserve the existing fallback and do not derive false detour timings from route distance. |
| **3. Make Explore API-first** | Frontend service + UI data adapter | Fetch `GET /crafts`, normalize only fields the backend provides, and retain current curated cards as fallback. | Keep GI/ODOP controls disabled, absent, or mock-labelled unless corresponding backend fields are added. |
| **4. Make craft details API-aware** | Contract alignment | Decide whether backend numeric IDs become frontend route IDs, or add a real backend slug mapping. Then use `GET /crafts/id/{craft_id}` for core detail facts. | Do not guess a mapping from a craft name; use a stable identifier owned by the backend. |
| **5. Add new domain APIs intentionally** | Backend design + frontend integration | Model users/roles, artisans, products, experiences, bookings, carts, trails, verification, and analytics before replacing local-demo flows. | This is new backend functionality, not a configuration exercise. Define authorization and user-scoping before wiring the UI. |

## 7. Immediate conclusion

The **Route Planner is the only current Virāsat surface already wired to the actual FastAPI business contract**. It can use the live backend as soon as a verified public URL is placed in `VITE_API_BASE_URL` and CORS permits the deployed frontend. `GET /crafts` and `GET /crafts/id/{id}` are useful next integrations, but Explore and craft-detail pages require adapters because their current UI uses fields and identifiers the backend does not expose. All three role-workspace ecosystems remain outside the present FastAPI contract.

## References

[1]: https://raw.githubusercontent.com/Bhuvishree-11/virasat-backend/main/app/main.py "FastAPI application entry point"
[2]: https://raw.githubusercontent.com/Bhuvishree-11/virasat-backend/main/app/routes/craft_routes.py "Craft route handlers"
[3]: https://raw.githubusercontent.com/Bhuvishree-11/virasat-backend/main/app/routes/trip_routes.py "Trip route handler and request schema"
[4]: https://raw.githubusercontent.com/Bhuvishree-11/virasat-backend/main/app/models/craft.py "Craft Pydantic response model"
[5]: https://raw.githubusercontent.com/Bhuvishree-11/virasat-backend/main/app/data/schema.sql "Craft database schema"
[6]: https://raw.githubusercontent.com/Bhuvishree-11/virasat-backend/main/app/data/seed_db.py "Craft seeding script"
[7]: https://raw.githubusercontent.com/Bhuvishree-11/virasat-backend/main/API_REFERENCE.md "Current backend API reference"
[8]: https://raw.githubusercontent.com/Bhuvishree-11/virasat-backend/main/app/services/geo_service.py "OpenRouteService and route-distance implementation"
[9]: https://raw.githubusercontent.com/Bhuvishree-11/virasat-backend/main/app/services/db_service.py "MySQL connection-pool configuration"
[10]: https://raw.githubusercontent.com/Bhuvishree-11/virasat-backend/main/app/services/ai_service.py "Gemini trip-summary implementation"
[11]: https://raw.githubusercontent.com/Bhuvishree-11/virasat-backend/main/.env.example "Committed environment template"
[12]: https://raw.githubusercontent.com/Bhuvishree-11/virasat-backend/main/requirements.txt "Backend dependency manifest"
