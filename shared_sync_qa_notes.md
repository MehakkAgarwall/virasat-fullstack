# Shared Traveller ↔ Artisan Synchronization QA Notes

## Browser evidence — managed experience transition

| Surface | Observation | Result |
| --- | --- | --- |
| Artisan experience list | `/artisan?tab=experiences` showed the seeded **Mysore Silk Weaving Experience** from the managed database with its persistent `Published` status and managed booking count. | Pass |
| Artisan experience editor | The Create Experience form now states that it saves a shared record owned by the current Artisan profile. It includes title, duration, description, price, capacity, dates, location, preview image path, managed draft, and publish actions. | Pass |
| Managed create and publish | Publishing **Mysuru Silk Loom Immersion** returned to the managed experience list with the explicit confirmation “Experience published to the shared Traveller catalogue.” The persisted record shows 45 minutes, Mysuru, Karnataka, ₹750, capacity 6, and zero managed bookings. | Pass |
| Traveller session | After switching roles, the Traveller home counts its workshop reservations from the shared managed booking list rather than a local reservation array. | Pass |
| Traveller Explore retrieval | Explore listed **Mysuru Silk Loom Immersion** with the exact persisted title, Priya Nair / Silk Heritage Studio identity, Mysuru location, 45-minute duration, capacity 6, ₹750 price, and a dynamic booking link. | Pass |
| Traveller booking creation | Opening the published record and clicking Book Experience created a managed request with date **2026-08-20**, time **2:00 PM**, current Artisan identity, and **Pending Artisan Confirmation** status. | Pass |
| Fresh Artisan session | After a role switch and page load, the Artisan dashboard reported **2 managed experience bookings**, including the newly created Traveller request; this demonstrates the count is not held in the Traveller page’s React state. | Pass |
| Artisan booking receipt | The refreshed Artisan inbox displayed **New Experience Request** for Mysuru Silk Loom Immersion with Demo Traveller, the persisted date, location, and Priya Nair / Silk Heritage Studio identity. | Pass |
| Artisan acceptance | Clicking **Accept** changed the shared row to **Experience accepted**, reduced the pending count to zero, and returned the confirmation “Booking status updated for the Traveller view.” | Pass |
| Traveller confirmation after refresh | After another role switch and page load, the Traveller ledger displayed **Mysuru Silk Loom Immersion · 2026-08-20 · 2:00 PM · Priya Nair · Silk Heritage Studio · Mysuru, Karnataka** with **Experience Confirmed** status. | Pass |

## Final quality gates

| Check | Result |
| --- | --- |
| Active identity audit | **Pass** — no `Lakshmi` / `lakshmi` tokens remain in active TypeScript or TSX frontend source. Legitimate Channapatna craft references remain as cultural context only. |
| Full Vitest suite | **28 tests passed** across 13 test files. |
| TypeScript | **Pass** — `pnpm check` completed without errors. |
| Production build | **Pass** — `pnpm build` completed. The existing managed-storage runtime-resolution notices and chunk-size advisory remain non-blocking. |
| Live Railway craft integration | Preserved — this change did not modify the Railway FastAPI contract, live craft catalogue, or route discovery behavior. |

The next browser step will publish a controlled additional experience and verify that the Traveller retrieves the exact same record.
