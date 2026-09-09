# Craft Metadata Action Repair QA

## Verified controls — 20 August 2026

The Pattachitra live craft hero now renders all three metadata controls as real links with descriptive hover text.

| Control | Destination | Result |
| --- | --- | --- |
| Location record | Google Maps search using the live craft coordinates. | Link generated and visible. |
| Trace route for detour | `/planner?craft=api-115&place=Puri%2C+Odisha` | Pass — Planner opened with **Puri, Odisha** placed in Destination and an explanatory detour toast. |
| Find nearby makers | Same intent-aware Planner fallback when no published maker exists. | Link generated and visible. |

The Planner retains the Traveller’s starting point, deliberately marks the changed destination as pending, and asks the Traveller to calculate the route—avoiding a false claim that the existing route was recomputed automatically.

For Mysore Silk, the same three controls resolve Location record to live coordinates, Trace route for detour to an intent-aware Mysuru Planner destination, and **Maker visit** to the connected managed public profile at `/maker/artisan-studio`. The public profile rendered the persisted Silk Heritage Studio / Priya Nair identity and its managed experiences.

## Quality gates

| Check | Result |
| --- | --- |
| Craft-to-Planner intent | Pass — covered by two focused unit assertions. |
| Browser navigation | Pass — generic and connected-maker control states verified. |
| Full Vitest suite | Pass — **34 tests** across 16 files. |
| Production build | Pass — completed successfully. Existing managed-storage runtime notices and bundle-size advisory remain non-blocking. |
