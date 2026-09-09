# Focused Refinement Verification

| Check | Result |
|---|---|
| Route control visibility | The live Planner shows clear **Starting point** and **Destination** fields, a labelled swap button, and a calculate button even after a route has results. |
| Swap and live submission | Delhi–Jaipur was swapped to Jaipur–Delhi. The Planner marked existing discoveries as pending, showed the tracing state on submission, and settled to the live Jaipur–Delhi response with four discoveries and 1,553 route points. |
| Service resilience | A direct Railway Jaipur–Delhi call was observed taking longer than 25 seconds in one diagnostic attempt. The app now bounds live requests at 12 seconds and preserves the existing curated fallback route behavior; the timeout path has a focused automated test. |
| Traveller to Artisan | A Traveller changed the actual Channapatna workshop reservation to **4:30 PM**. The same browser’s Artisan Interest workspace showed exactly one recorded action: **Traditional Channapatna Toy-Making — 4:30 PM**. The card is explicitly labelled as local-first demo persistence. |
| Responsive review | The repaired form uses the existing desktop two-field layout, collapses its compact results form at tablet width, and renders controls as full-width, stacked elements below 700 px. A 375 px preview verified the responsive Traveller entry surface; protected Planner route controls require an authenticated session in the interactive browser and were verified there at desktop width. |
| Automated verification | All 15 tests pass. TypeScript passes. The production build passes. |

The existing build warning for a JavaScript chunk above 500 kB and runtime Manus-storage asset paths remains non-blocking and unchanged in kind. No Phase 1–3 contract, data, or visual identity regression was introduced.
