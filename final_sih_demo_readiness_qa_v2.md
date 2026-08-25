# Final SIH Demo Readiness QA — Redeployed Backend Follow-up

## Live Explore verification — 18 August 2026

The restarted development application loaded the redeployed Railway catalogue successfully. **65 live craft traditions** were displayed, and the recognition filter reported **37 GI-tagged** records.

The rebased enrichment overlay rendered GI provenance on the live record IDs that had shifted during the Railway redeployment. Directly observed examples included **Channapatna Toys** (`api-109`), **Blue Pottery** (`api-120`), **Kota Doria** (`api-133`), and **Chanderi Saree** (`api-159`). The uncurated **Nagaland Bamboo Craft** (`api-125`) remained unlabelled, confirming that the overlay did not infer provenance for a record without a published manifest entry.

This establishes that the frontend-only Phase 2 manifest is once again aligned with the current 65-record live Railway response while retaining its evidence-bound rules.

## Live Moradabad journey verification — 18 August 2026

The redeployed live detail route **`/craft/api-105`** resolved to **Moradabad Brassware**. It rendered both **GI provenance verified** and **ODOP provenance verified** with the existing public source links, then exposed the explicit Phase 3 journey links to **V. K. Gupta Metal Craft Industry** and the read-only **Moradabad Metal Craft documentary** resource. The maker and resource were presented as published source-linked context rather than a booking, product, price, contact, or marketplace claim.

## Redeployed Railway endpoint audit — 18 August 2026

The public backend returned **200** for `/health` in **2.25 seconds**, `/health-db` in **1.93 seconds**, `/crafts` with **65 records**, and `/crafts/id/105` with the expected Moradabad Brassware record. A browser-origin CORS preflight for the published Kalā Trail domain also returned **200**, explicitly allowing that origin and the standard HTTP methods.

Route discovery remained variable at the backend boundary. The exact Chennai–Madurai payload completed in **5.19 seconds**, returning **3,707 route points** and **four crafts**. The exact Delhi–Jaipur and Mumbai–Ahmedabad payloads did not return a byte within the 20-second diagnostic limit. This confirms a remaining collaborator-owned routing-performance issue: the frontend’s scoped 18-second timeout preserves a bounded, labelled fallback, but no client-side change can make a non-responsive ORS-backed computation return live results.

## Automated and production quality gates — 18 August 2026

The complete Vitest suite passed: **7 test files and 16 tests**. TypeScript validation had already passed after the repair, and the production build completed successfully. The build retained the project’s existing non-blocking warnings for runtime-resolved managed-storage assets and a large JavaScript chunk; neither warning was introduced by this rebase or prevented the build output.

## Planner desktop validation — 18 August 2026

The Planner retained labelled **Starting point** and **Destination** fields, an explicit swap control, a calculation action, live-discovery-first wording, route-specific opportunities, preview controls, craft links, and add-to-trail actions. The current Delhi–Jaipur view rendered the designed visual-preview rail and disclosed that only the workshop item is an editorial motion reel.

During this fresh development-session check, the route page selected its documented Leaflet atlas fallback and displayed the truthful message that the live map view was unavailable. The browser console contained no new errors. This is recorded for final investigation rather than being hidden or misrepresented as a live Google map.

The initial correction expanded the bounded cold-load window from nine to eighteen seconds and passed its focused test and TypeScript check. A fresh Planner session still selected the atlas fallback even though the Google Maps namespace and its single script element were present after the window. This indicates that the remaining issue is in map initialization rather than duplicate script loading or a merely slow namespace response; the fallback remains accurate and the issue requires further frontend diagnosis.

The root cause was then isolated to the shared loader: the Maps script can become ready before its namespace is available, and a later map mount could attach a `load` listener after that event had already fired. The final repair polls briefly for the namespace after script readiness and permits one remount attempt inside the same bounded eighteen-second total window. A fresh Planner session then rendered the **Google-backed map canvas**, route line, origin/destination markers, three interactive craft markers, and the **See in 3D** control. The atlas fallback did not render.

## Responsive capture note — 18 August 2026

At the 390-pixel mobile viewport, the public landing and responsive demo-login composition remained legible, touch-scaled, and free of horizontal clipping. The isolated visual runner has no persisted demo session; its protected Explore, Planner, craft, maker, and resource routes therefore correctly redirected to that login screen rather than exposing protected content. Authenticated desktop route checks above covered the Traveller content itself; the established mobile protected-route behavior was not bypassed for screenshot convenience.

## Authenticated craft-to-maker-to-resource verification — 18 August 2026

The published **V. K. Gupta Metal Craft Industry** profile rendered its source-labelled Moradabad context, cited ODOP origin, return path to **`/craft/api-105`**, and read-only cultural-resource bridge. The **Moradabad Metal Craft documentary** page then rendered as a clearly marked non-bookable, source-linked cultural reference with links back to the craft and maker. Both pages retained the intended premium heritage composition without introducing a transaction, contact, price, availability, booking, cart, or marketplace claim.

## Final regression and route diagnosis — 18 August 2026

After the final map repair, the complete test suite passed with **8 test files and 17 tests**, and the production build passed. The only retained non-blocking build notices are the pre-existing runtime managed-storage resolution warnings and the oversized JavaScript-chunk advisory.

All three exact route payloads were eventually accepted by the redeployed backend: Chennai–Madurai completed in **5.19 seconds** with **3,707 route points** and **four crafts**; an extended diagnostic confirmed Delhi–Jaipur in **33.95 seconds** with **1,801 route points** and **four crafts**; Mumbai–Ahmedabad completed in **33.34 seconds** with **2,881 route points** and **one craft**. Because the two slower live computations exceed the intentional **18-second frontend route boundary**, the UI will truthfully move to its existing bounded fallback for those slow attempts rather than hold the Traveller indefinitely. This remains a backend-owner ORS/routing-performance item, not a reason to increase the user-facing wait indefinitely.

## Production rollout follow-up — 18 August 2026

Immediately after the auto-published checkpoint, the production Explore route served the current **65-record** live Railway catalogue. Its first settled render still reported **0** GI-tagged overlays and displayed no live GI badge, unlike the verified development candidate. Production propagation or browser asset caching must therefore be rechecked before final delivery; this observation is recorded rather than treated as a successful live overlay verification.

A direct cache-busted production request to **`/craft/api-105?release=3d1ea5ad`** likewise rendered the prior neutral craft state with no published provenance, maker, or resource. This rules out a simple Explore filter display issue and indicates that the production domain had not yet begun serving the checkpoint’s rebased application bundle at the time of inspection.

After the deployment completion notice, a second fresh cache-busted request to **`/craft/api-105?release=3d1ea5ad-live`** served the final bundle correctly. It rendered **GI + ODOP provenance verified**, both cited source links, the **Meet maker** and **Cultural experience** journey steps, the published **V. K. Gupta Metal Craft Industry** card, and the read-only documentary card. The initial observation was therefore a brief deployment-propagation interval rather than a production application regression.
