# Minimum Booking Flow Verification

## Traveller → database — 19 August 2026

Authenticated Traveller demo session opened `/experience/mysore-silk-experience`. The page loaded the canonical managed experience record **Mysore Silk Weaving Experience**, linked to live Railway craft ID **111** and the prototype artisan **Mysuru Silk Studio**.

The Traveller selected the default date **2026-08-20** and clicked **Book Experience**. The UI displayed the success toast **“Experience booked successfully.”** and then rendered **“Pending artisan confirmation.”** The status was returned through the managed application booking query after the mutation; it was not created by localStorage or React-only state.

Next verification step: open the Artisan Tourist Interest panel, confirm the same booking row, accept it, then reload the Traveller route and verify **Accepted by artisan**.

## Artisan receives booking

The authenticated Artisan Tourist Interest panel loaded from the managed application query and displayed **1 persisted experience booking**, **1 awaiting artisan confirmation**, and **0 accepted visits**. The row showed **Mysore Silk Weaving Experience**, **Demo Traveller**, **2026-08-20**, **Mysuru, Karnataka**, with **Accept** and **Reject** controls. The panel explicitly states that the row and status are stored in the managed application database.

## Artisan acceptance → Traveller refresh

The Artisan clicked **Accept**. The managed query invalidated, the panel showed **Booking accepted**, **0 awaiting artisan confirmation**, and **1 accepted visit**, and the success toast stated **“Booking status updated for the Traveller view.”**

After switching back through the existing Traveller demo flow and reloading `/experience/mysore-silk-experience`, the page read the same database row and displayed **“Accepted by artisan”** for **2026-08-20 · Mysuru Silk Studio (Prototype)**. This verifies the required two-way transition across role views and a fresh page load.

## Quality gates

The final suite passed with **11 test files and 21 tests**, including the booking contract test and review-marker health validation. TypeScript validation passed. The production build passed with the existing non-blocking managed-storage resolution notices and large-chunk advisory.

## Result

Traveller booking: **PASS**

Booking persisted: **PASS**

Artisan receives booking: **PASS**

Artisan accepts/rejects: **PASS** — the acceptance path was verified; the same pending-only mutation supports rejection.

Traveller sees updated status: **PASS**

Persists after refresh: **PASS** — verified after switching roles and re-entering the Traveller route.

Existing features preserved: **PASS** — Railway, live 65-craft catalogue, Route Planner, Explore, GI/ODOP overlay, experience previews, and legacy Channapatna path were not changed or removed.

The flow is a prototype using explicit demo identities and managed application persistence. It is not production authentication, payment, notification, or marketplace infrastructure.
