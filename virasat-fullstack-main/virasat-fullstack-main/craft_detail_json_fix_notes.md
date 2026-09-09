# Craft Detail JSON Response Investigation

## Reproduction — 19 August 2026

The protected route `/craft/api-111` opened successfully after the Traveller demo session was entered, but initially remained at the source-record loading state. The reported browser error indicates a query attempted to parse the HTML application shell (`<!doctype ...`) as JSON, so the next step is to identify the request URL emitted by the craft-detail page and correct its route or fallback behavior.

## Diagnosis

The craft lookup itself uses the live Railway request helper and completed correctly. The only page-independent tRPC query was the global `DemoStatePersistence` synchronization call. That query is not needed for a read-only numeric Railway craft-detail route, and its transient HTML response was the source of the global `[API Query Error]` console message. The route now explicitly omits this unrelated managed-demo query for `/craft/api-<id>` while retaining it for interactive Traveller and Artisan routes.

## Browser verification

After the route boundary was applied, `/craft/api-111?from_webdev=1` resolved the live Mysore Silk record, GI provenance content, and the linked managed experience normally. The browser console was empty; the reported `Unexpected token '<'` tRPC parser error did not recur.
