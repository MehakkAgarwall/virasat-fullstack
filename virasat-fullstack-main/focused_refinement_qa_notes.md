# Focused UX and Functional Refinement — QA Record

## Confirmed issues and resolutions

| Area | Finding | Resolution |
|---|---|---|
| Route inputs | Once a persisted journey had results, the Start and Destination fields were unmounted. A traveller could not visibly change both locations. | The Planner now keeps a compact, labelled **Starting point** and **Destination** form above results, with a dedicated swap control and a calculate action. |
| Route-result clarity | Swapping locations left the previous route discoveries visible without stating that they belonged to the old direction. | A pending-recalculation note now explicitly requires Calculate before locations and discoveries are treated as aligned. |
| Live-route resilience | The shared FastAPI request boundary had no timeout. A delayed unavailable service could leave the Planner in the tracing state indefinitely. | The existing request boundary now aborts after 12 seconds; `discoverRoute()` catches that existing error and uses its existing curated fallback. The behavior is covered by an API regression test. |
| Traveller-to-Artisan link | A genuine legacy Traveller workshop reservation had no Artisan-side representation. In addition, a newer local signal could be overwritten by an older managed demo-state snapshot at login. | A reservation creates a local-first Artisan interest signal. The Artisan Interest tab now shows that precise action and slot with a transparent local-demo label. Hydration merges newer local signals and mirrors the merged snapshot through the current managed demo-state bridge. |
| Interest presentation | The Artisan Interest page contained a broad static demand block disconnected from available Traveller actions. | A heritage-led evidence panel now distinguishes curated signals from a real Traveller action; it avoids implying cross-user, live-production synchronization. |

## Verified journey

The following supported path was checked in one browser: Traveller entered the existing Channapatna workshop, selected **4:30 PM**, and the Artisan role then displayed **Traditional Channapatna Toy-Making — 4:30 PM** under **Recorded actions, not invented demand**. This state is local-first and is mirrored only for the same demo identity when the existing managed bridge is reachable.

The live Delhi–Jaipur and Jaipur–Delhi route results were checked with the unchanged FastAPI request shape. The repaired route controls were visible above results, swapped values correctly, showed the tracing state during calculation, and resulted in live route discoveries. Existing Phase 1–3 live records, GI/ODOP overlay, maker/resource links, uncurated craft behavior, and fallback path remain structurally unchanged.

## Deliberate boundary and residual backend work

The form accepts typed values and exposes the project’s current curated Indian location directory, including aliases such as Bangalore/Mysore. It does **not** claim to geocode every arbitrary Indian place name: the existing Railway contract requires coordinates, while the current frontend has no verified nationwide geocoding service. Supporting any freely typed Indian place requires a verified geocoding capability or backend support; no such API was invented in this refinement.

The collaborator-owned Railway/GitHub deployment tasks remain deferred and untouched. No FastAPI contract, authentication implementation, payment feature, marketplace feature, cart flow, booking API, or Authority analytics behavior was added or changed.
