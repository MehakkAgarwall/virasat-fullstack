
## Current validation

The authenticated canonical Mysore Silk experience route rendered the data-driven **Generated experience preview**, with the managed video source mounted at `/manus-storage/mysuru-heritage-experience-preview_eeaf71c2.mp4`. Browser inspection confirmed `readyState: 4`, `paused: false`, `muted: true`, and `loop: true`. The existing persisted booking also rendered **Accepted by artisan** with the new **Booked → Artisan Review → Confirmed** progress row. No booking API or database procedure was changed in this presentation pass.

The authenticated Artisan Tourist Interest tab rendered the persisted booking with **Experience accepted**, **Mysore Silk Weaving Experience**, traveller/date/location metadata, and the new `Craft: Mysore Silk` line. The dashboard retained its managed-database disclosure and existing role navigation. The stored row is already accepted from the prior demo run, so no destructive status mutation was performed during this presentation audit.

The authenticated Cultural Trail retained Delhi → Jaipur route inputs, live discovery messaging, three route opportunities, the Google-backed map surface with craft markers and **See in 3D**, and existing Add to trail actions. The selected Jaipur Blue Pottery experience rendered a distinct relevant still at `/manus-storage/virasat-craft-terracotta_b9573ecd.jpg` with the caption **Blue pottery shaped by hand in Jaipur**; Kota Doria and Thewa retained distinct craft-specific fallbacks in their cards.

The 390 px responsive capture was completed for Experience Detail, Cultural Trail, Artisan Interest, and Explore. The isolated screenshot runner had no authenticated session, so protected routes correctly returned the existing responsive role-specific demo-login screen rather than exposing protected content. The Traveller and Artisan mobile entry screens remained readable, with no horizontal clipping; authenticated mobile content was previously validated in the shared browser session and the new changes use the existing mobile-safe layout rules.

The live Railway regression remained healthy after the frontend-only changes: `/health` returned `{"status":"ok","service":"kalatrail-backend"}`, `/health-db` returned `{"status":"ok","database":"connected"}`, `/crafts` returned **65** records, and CORS preflight returned HTTP 200 for the published Kalā Trail origin.

Quality gates passed: **24 tests across 11 files**, TypeScript validation, and production build. The build retained the existing non-blocking `/manus-storage` runtime-resolution notices and large JavaScript chunk warning. No Railway API or managed booking procedure was changed.
