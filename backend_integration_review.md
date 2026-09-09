# Backend integration review

Source repository: <https://github.com/Bhuvishree-11/kalatrail-backend> (reviewed 2026-08-15).

The repository is a FastAPI and MySQL craft-discovery backend. Its active public API surface is `GET /health`, `GET /health-db`, `GET /crafts`, `GET /crafts/{region}`, and `POST /trip/crafts-along-route`.

`POST /trip/crafts-along-route` accepts `start_lat`, `start_lng`, `end_lat`, `end_lng`, and optional `buffer_km`, then retrieves an OpenRouteService route and filters MySQL craft records near that route. The response contains `route_point_count`, `crafts_found`, and `crafts`.

No login, registration, current-user, logout, JWT, session, OAuth, user-role, or authorization endpoint exists in the reviewed application. The backend schema currently defines only a `crafts` table. Environment configuration requires MySQL details, an OpenRouteService key, and optional LLM settings; it has no auth-secret or auth-provider configuration.

The current Virāsat frontend can integrate the route and craft APIs once a deployed backend base URL is supplied. Real account login and protected pages require the backend owner to add an authentication contract or provide a separate auth service.

## Route planner integration update

The frontend now calls `POST /trip/crafts-along-route` first through `client/src/services/routeService.ts`. It sends the backend’s actual coordinate payload: `start_lat`, `start_lng`, `end_lat`, `end_lng`, and `buffer_km: 50`. Raw backend craft fields are normalized before they enter the existing map and discovery-card components.

During local verification, `http://localhost:8000/health` was unreachable because no FastAPI process was running in this environment. The UI therefore displays a labelled curated-demo fallback and a retry action instead of a broken screen. No backend or CORS change was made. Set `VITE_API_BASE_URL` to the deployed FastAPI origin through the project environment before expecting live data in a deployed frontend.
