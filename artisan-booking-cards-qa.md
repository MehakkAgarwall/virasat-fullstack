# Actionable Artisan Booking Cards QA

## Browser verification

The Booking Inbox now exposes three keyboard-reachable summary-card buttons, backed by the same persisted query: **5 persisted experience bookings**, **1 awaiting artisan confirmation**, and **4 accepted visits**. The default All card displayed all five managed booking records.

Selecting **Awaiting artisan confirmation** immediately changed the active card state, updated the panel title to *Awaiting your confirmation*, and narrowed the list to the single pending Mysuru Silk Loom Immersion request. The visible record retained its Accept request and Decline actions. No booking state was changed during this interaction verification.

Selecting **Accepted visits** changed the active-card state and narrowed the list to exactly four persisted confirmed requests. The panel heading, supporting copy, count, and displayed records all reflected the selected card. Full validation passed with **64 tests across 32 files**, TypeScript, and the production build.
