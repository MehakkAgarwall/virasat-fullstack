# Live Railway Data Control QA

## Reproduction — 20 August 2026

The numeric live craft page `/craft/api-111` successfully loaded the Railway-backed Mysore Silk Saree record. The **Live Railway data** element was rendered as a non-interactive status `<span>` rather than a button, so it had no accessible click action or manual refresh behavior. The source lookup itself completed successfully; the defect is the status control’s missing interaction, not a failed Railway response.

## Browser repair verification

The repaired craft hero now exposes **Live Railway data · Refresh** as a semantic button with the accessible name “Refresh Live Railway data for Mysore Silk Saree.” Triggering it retained the loaded live craft state after the refresh interaction; request-log verification is recorded with the final quality checks.

The browser network log confirmed the control emitted a new `GET https://virasat-backend.up.railway.app/crafts/id/111` request and received **HTTP 200** in 775 ms. The full regression suite passed with **35 tests across 16 files**, and TypeScript plus the production build also passed. Existing managed-storage notices and the bundle-size advisory remain non-blocking.
