# Final SIH Demo Readiness and QA Notes

**Date:** 2026-08-18

## Findings in progress

| Area | Observation | Disposition |
|---|---|---|
| Traveller home | Traveller entry actions, field-note state, empty saved-crafts message, and Planner links were visible and actionable. | Passed. |
| Explore live catalogue | The screen initially displayed the retained seven-record fallback while the live request resolved, then settled correctly to 65 live records with 37 curated GI overlays. This transient fallback could confuse a judge during a rapid demo. | **Fixed:** explicit “Tracing living traditions” loading state now replaces the fallback flash and settles to the unchanged 65-record live catalogue with 37 curated GI overlays. |
| Explore empty search | A deliberately unmatched search returned a clear “No craft found yet” state without broken layout. | Passed. |
| Live Planner | Delhi–Jaipur showed 1,801 live route points and four discoveries. Add-to-trail displayed a toast and the reciprocal remove action restored the empty trail state. | Passed. |
| Mobile landing and login | The 375 px landing page and Traveller demo entry remain legible, vertically structured, and visually consistent with the approved Virāsat design system. | Passed. |
| Invalid numeric craft deep link | `/craft/api-99999` briefly showed the live-loading state, then incorrectly rendered the unrelated local Channapatna craft and its legacy maker/booking presentation. | **Fixed:** the settled state now truthfully says the numeric live record is unavailable and offers only Explore and Cultural Trail recovery actions. |
| Enriched live craft regression | The valid Moradabad Railway craft (`/craft/api-30`) retained its GI/ODOP source links and the complete read-only Maker and Cultural Experience continuation after the error-state fix. | Passed. |
| Unknown maker deep link | `/maker/unknown-maker` rendered the unrelated legacy Lakshmi profile, including mock products and a workshop reservation action. | **Fixed:** unknown maker routes now state that no published profile is available and offer Explore/Cultural Trail exits; `/maker/lakshmi-crafts` remains the explicit legacy route. |
| Unknown cultural-experience deep link | `/experience/unknown-experience` rendered the unrelated Channapatna workshop reservation demo. | **Fixed:** unknown experience routes now state that no published cultural story is available and offer Explore/Cultural Trail exits; `/experience/channapatna-toy-making` remains the explicit legacy route. |
| Published cultural-resource regression | The Moradabad read-only documentary retained its cited source, craft return link, maker continuation, and no-booking disclosure after direct-link recovery fixes. | Passed. |
| Browser performance signal | The current Traveller cultural-resource page reported approximately 210 ms DOM-content-loaded, 212 ms load, and 368,833 transferred bytes in the local preview. This is a lightweight smoke signal, not a field-network performance benchmark. | Passed within the local demo environment; existing production chunk-size warning remains documented. |
| Uncurated live craft regression | Nagaland Bamboo Craft (`/craft/api-50`) settled to its live Railway record and showed only the neutral Discover craft → Meet maker → Support heritage ladder plus a Cultural Trail continuation. | Passed; no inferred maker, experience, availability, or transaction content appeared. |
| Public responsive visual QA | Full-page desktop and 375 px mobile captures of the landing page and Traveller demo entry retained readable editorial type, responsive role selection, visible calls to action, coherent gold-on-forest contrast, and consistent heritage imagery. | Passed. |

## Validation summary

The final regression suite passed with **14 tests across 7 files**. TypeScript validation completed with no errors, and the production build completed successfully. The existing build-time notes for runtime Manus-storage asset URLs and a JavaScript chunk above 500 kB remain known non-blocking demo warnings; no new performance regression was introduced during this QA pass.

Recent browser-console output contained no application errors. Recent server log entries labelled “Missing session cookie” arose from unauthenticated screenshot and preview requests against the optional managed-auth layer; the Traveller demo’s local session flow continued to operate normally in the audited browser session.

## Final disposition

The QA scope deliberately excluded new backend APIs, Railway/FastAPI changes, payments, marketplace flows, cart changes, booking changes, and authentication changes. The collaborator-owned Railway/GitHub deployment checklist items remain deferred and untouched.
