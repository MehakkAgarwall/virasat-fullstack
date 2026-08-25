# Focused Refinement Architecture Note

## Route inputs

The existing Railway endpoint is preserved. It accepts coordinates, and the frontend’s existing `resolveIndiaLocation()` converts the current curated Indian location directory into those coordinates before calling `POST /trip/crafts-along-route`. The implementation will keep both labelled fields mounted even after a route has results, add a swap action, validate blank/same/unsupported entries, and expose a truthful no-discovery or unavailable state. No FastAPI contract change is required.

> The current client-side resolver contains a curated, expandable Indian location directory rather than a nationwide geocoder. A genuinely arbitrary place-name lookup requires a verified geocoding source or a backend capability and is therefore left explicitly backend-dependent rather than inferred or fabricated.

## Traveller-to-Artisan state

The strongest existing mechanism is **local-first browser state mirrored through the current managed-database demo-state tRPC bridge**. `travellerDemoService` and `artisanDemoService` already write separate local snapshots and publish events; `DemoStatePersistence` mirrors those snapshots for the same demo identity when the managed database is reachable.

The minimal extension will add an Artisan-side `travellerSignals` collection. Only a real available Traveller action with an explicit existing artisan relationship—the Channapatna workshop reservation—will create or update a signal. The Artisan Interest screen will label the data as browser-local demo activity, mirrored for the same demo identity when available. This is not represented as a cross-user or live production synchronization feature.

## Scope protection

No Railway API, GI/ODOP overlay, published maker/resource record, authentication model, payment flow, marketplace flow, or collaborator-owned deployment task is changed by this refinement.
