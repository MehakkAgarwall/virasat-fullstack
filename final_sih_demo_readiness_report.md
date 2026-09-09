# Virāsat / Kalā Trail — Final SIH Demo Readiness Report

**Scope.** This final pass validates the existing Traveller journey without adding backend APIs, authentication, payments, carts, bookings, marketplace behavior, or Authority analytics. The live craft source remains the redeployed Railway FastAPI service at [virasat-backend.up.railway.app](https://virasat-backend.up.railway.app), while GI/ODOP, maker, and cultural-resource context remains the intentionally versioned, source-linked frontend overlay.

## PASSED

| Area | Final result | Evidence |
|---|---|---|
| Backend reachability | `/health` returned **200** in 2.25 s; `/health-db` returned **200** in 1.93 s. | [Live health](https://virasat-backend.up.railway.app/health) and [database health](https://virasat-backend.up.railway.app/health-db) checks. |
| Live craft catalogue | `/crafts` returned **65** records. `/crafts/id/105` returned Moradabad Brassware. | [Live catalogue](https://virasat-backend.up.railway.app/crafts) and [Moradabad record](https://virasat-backend.up.railway.app/crafts/id/105). |
| CORS | Browser-origin preflight returned **200**, explicitly allowing `https://kalatrail-5abzgwkm.manus.space`. | Final live CORS audit. |
| Explore | The authenticated live catalogue settled at **65** traditions; the GI filter reported **37** curated, source-backed overlays. Blue Pottery (`api-120`), Kota Doria (`api-133`), and Chanderi Saree (`api-159`) displayed GI badges; uncurated Nagaland Bamboo Craft (`api-125`) remained neutral. | In-browser live Explore audit. |
| Craft provenance journey | `/craft/api-105` displayed GI + ODOP provenance, then the published V. K. Gupta maker context and the source-linked Moradabad documentary. | Authenticated browser audit of the craft route. |
| Maker and resource routes | The maker and documentary pages retained safe return links to `api-105`, clear source labelling, and explicit read-only/no-booking disclosure. | Authenticated browser audit. |
| Planner controls and visuals | Start and destination fields, swap, recalculation, preview, craft-link, and add-to-trail controls remained visible. A fresh Planner session rendered a Google-backed map, route geometry, origin/destination markers, craft markers, and the 3D control. | Authenticated browser audit. |
| Preview integrity | The screen disclosed the Channapatna workshop as the actual editorial motion reel and used distinct curated still treatments elsewhere, without fake media controls. | Planner preview rail audit. |
| Automated gates | **17/17 tests** passed across **8** test files. TypeScript and production build passed. | Final `pnpm test`, `pnpm check`, and `pnpm build`. |
| Responsive access | The mobile public demo-login screen remained legible at 390 px with no horizontal clipping. Protected routes redirected to login without a session, as designed. | Isolated mobile capture audit. |
| Published production candidate | After deployment propagation completed, cache-busted production `/craft/api-105` rendered GI + ODOP provenance, the published V. K. Gupta maker card, and the read-only documentary bridge. | [Published Virāsat app](https://kalatrail-5abzgwkm.manus.space/craft/api-105?release=3d1ea5ad-live). |

## FIXED

| Finding | Safe frontend repair | Outcome |
|---|---|---|
| Route request boundary was too short for some slow live route computations. | Kept the route-only request finite but increased it from **12 s** to **18 s**; retained the existing labelled fallback. | The UI never waits indefinitely or presents fallback as live data. |
| Redeployed backend seed IDs changed from the prior 29–84 range to 104–159. | Rebased the versioned Phase 2 manifest by the verified deterministic +75 mapping and bumped it to `2026.08.18.v2`; updated regression coverage. | Live GI/ODOP badges and the Moradabad maker/resource journey now resolve against current Railway IDs. |
| Planner could select the atlas fallback even after the Maps script existed because the Google namespace became available asynchronously and a later mount could miss the original script event. | Preserved the single-flight script loader, added bounded namespace readiness polling, and allowed one map remount inside an 18-second total window. Added focused regression coverage. | Fresh Planner validation rendered the real Google map, route line, markers, and 3D control without duplicate-loader warnings. |

## DEFERRED — BACKEND OWNER

| Item | Why it remains deferred | Recommended owner action |
|---|---|---|
| Route-discovery latency | Chennai–Madurai completed in 5.19 s, while Delhi–Jaipur and Mumbai–Ahmedabad required extended diagnostics of 33.95 s and 33.34 s respectively. Those two exceed the intentional 18-second UI boundary. | Profile ORS geocoding/routing, reuse geocoded locations, cache common corridors, and constrain route computation at the FastAPI layer. |
| Stability of slow route calls | All three exact audited payloads eventually returned 200, but two did not return bytes in the standard 20-second probe. | Establish backend performance budgets and an endpoint-level timeout/error response that lets clients distinguish overload from no discoveries. |
| Managed-storage and chunk advisories | The production build continues to warn about runtime-resolved `/manus-storage` assets and a large JavaScript chunk. The build is successful and these predate the final fixes. | Treat as a post-demo performance optimization: retain S3 URLs and evaluate lazy loading/code splitting. |

> **Demo guidance.** For the most reliable live Planner demonstration, use a route that responds within the 18-second UI boundary. If a slower corridor falls back, the screen remains truthful and usable; it does not claim a local curated result is a live backend response.

## References

1. [Railway FastAPI health endpoint](https://virasat-backend.up.railway.app/health)
2. [Railway FastAPI database health endpoint](https://virasat-backend.up.railway.app/health-db)
3. [Railway FastAPI craft catalogue](https://virasat-backend.up.railway.app/crafts)
4. [Railway FastAPI Moradabad craft record](https://virasat-backend.up.railway.app/crafts/id/105)
