# Craft-to-Route Journey Controls QA

## Initial browser verification — 20 August 2026

The live Mysore Silk page settled with the repaired hero action row. **Location record** is now an accessible button that opens a dedicated in-page location and transport view; **Trace route for detour** remains linked to the intent-aware Planner; and **Maker visit** continues to target the managed public profile.

The location view opened with two optional external map actions: **Open location in Google Maps** and **Optional nearby transit directions**. The transit link uses Google Maps transit mode and correctly explains that schedules and coverage remain provider-controlled.

The Planner intent for Mysuru showed **Craft detour ready**, retained the Traveller’s current Bengaluru origin, prefilled Mysuru, Karnataka as destination, and rendered **Confirm origin & trace detour**. The discovery workspace also exposed **All moments / Maker-led** and the available **Karnataka** regional filter.

An initial confirmation attempt exposed a real validation gap: the display label `Mysuru, Karnataka` was not a supported route-directory value. The intent now retains that craft label but normalizes the calculation destination to the supported **Mysuru** route gateway. The corrected Planner state shows Bengaluru → Mysuru, Karnataka in the confirmation summary and **Mysuru** in the actual destination input.

**PASS — confirmed-origin one-click route calculation.** Clicking **Confirm origin & trace detour** moved into the existing tracing state and completed without a second Calculate action. The Planner rendered a persisted Bengaluru → Mysuru route at **145 km / 3 hr 09 min**, three cultural discoveries (Channapatna Toys, Mysore Silk, Rosewood Inlay), the Google route map, and the regional discovery controls.

**PASS — discovery filters.** Selecting **Maker-led** reduced the opportunity rail from 3 to 2 records (Channapatna Toys and Mysore Silk). Applying **Karnataka** retained the two relevant maker-led records and left the completed route, map, and origin/destination controls intact.

**Regression gates — PASS.** Focused craft-intent coverage passed, as did the complete Vitest suite (**34 tests across 16 files**), TypeScript validation, and the production build. Build output includes the existing non-blocking managed-storage resolution notices and a JavaScript chunk-size advisory; no route-control failure was reported.
