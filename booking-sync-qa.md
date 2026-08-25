# Traveller–Artisan Booking Synchronization QA

## Root-cause findings

The booking database already uses one canonical row with an `experienceId`, `artisanKey`, `travellerKey`, and persisted booking status. The traveller identity is intentionally browser-scoped so personal requests do not become a global demo account record; the connected Artisan key is stored directly on every booking.

The practical weakness was presentation and freshness: the Artisan’s accept/reject controls were buried under **Tourist Interest**, the main dashboard did not direct the Artisan to review a request, the Orders screen only displayed shared requests, and a Traveller was told to refresh manually after a response. The data was persisted, but the two roles did not make the lifecycle clear.

## Non-destructive browser verification

The Traveller ledger rendered its persisted shared requests with current accepted statuses and a clear automatic-sync message. After switching to the Artisan demo, the dashboard showed the managed booking count and a prominent **Review booking inbox** action. The renamed **Booking Inbox** showed the same managed database record set: five total records, four accepted, and one pending request. The pending request exposed clear **Accept request** and **Decline** controls. No existing Traveller’s pending request was changed during QA.

## Validation

The repaired client polls the managed booking lists every four seconds and refetches on window focus, while Artisan accept/decline mutations invalidate both Artisan and Traveller booking lists. The server now rejects missing bookings, non-owner Artisan responses, and repeated responses instead of silently reporting success. The full suite passed with **64 tests across 32 files**; TypeScript and the production build also passed.
