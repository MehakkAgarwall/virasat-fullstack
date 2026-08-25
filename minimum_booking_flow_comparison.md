# Minimum SIH Traveller–Artisan Booking Flow: Comparison and Plan

## Executive assessment

The additional attachment confirms the previous synchronization plan’s central finding: the current Railway FastAPI service exposes crafts and route discovery only, while the current frontend keeps Artisan experiences and Traveller bookings in separate local/demo state. True backend-sourced two-way booking synchronization is therefore **not already supported**.

The new attachment narrows the scope appropriately for a one-day SIH prototype. It does not conflict with the previous plan’s architectural conclusion; it reduces the first implementation slice from a general shared-experience system to one persisted booking lifecycle:

> **Traveller books Mysore Silk experience → booking is persisted → Artisan sees it → Artisan accepts/rejects → Traveller sees the updated status.**

No application code, schema, Railway contract, or deployment configuration was changed during this review.

## What the attachment confirms

| Requirement | Confirmed detail |
|---|---|
| Scope | Only the minimum booking flow; preserve all Phase 1–3 work, the 65 live crafts, Explore, Route Planner, GI/ODOP overlay, and experience previews. |
| Required records | Traveller/user identity, artisan, experience, and booking. The proposed booking fields are `id`, `experience_id`, `artisan_id`, `traveller_id`, `booking_date`, `status`, and `created_at`. |
| Experience fields | `id`, `artisan_id`, `craft_id`, `title`, `description`, `location`, and `available`. |
| State transition | `pending → accepted` or `pending → rejected`; no payments, carts, orders, notifications, authentication, marketplace, or analytics. |
| Required operations | Create booking, list Artisan bookings, change booking status, list Traveller bookings. |
| Required persistence | The database must be the source of truth; React state and localStorage alone are explicitly disallowed. Refresh must preserve the booking and status. |
| Demo anchor | Use the existing Mysore Silk craft and a Mysore Silk experience; verify both role views after refresh. |

## What is already supported

| Capability | Current state | Assessment |
|---|---|---|
| Live craft/craft ID data | Railway `/crafts`, numeric craft lookup, and route discovery are live. | **Reusable immediately.** The new experience should reference the verified live Railway craft ID, not replace the craft record. |
| Traveller experience entry | Traveller can reach experience detail pages through Craft → Maker/Experience flow. | **Reusable immediately.** Add the booking action only to the selected Mysore Silk experience path. |
| Artisan workspace | Artisan dashboard, Experiences, Tourist Interest, and local demo identity already exist. | **Reusable immediately.** Add a focused New Bookings panel; do not redesign the workspace. |
| Existing persistence bridge | Managed app API has generic `demoState.list/save` snapshots by visitor subject and scope; the current database contains `users` and `demo_states`. | **Useful infrastructure, but insufficient by itself.** It does not model a booking row or provide booking-specific queries/mutations. |
| Current Traveller reservation | The legacy Channapatna action writes a Traveller booking locally and an Artisan traveller signal locally, then mirrors role snapshots. | **Not sufficient.** It is a one-off local signal, not a canonical booking lifecycle. |
| Railway backend | Current service has no users, artisans, experiences, or bookings. | **Cannot be used for this flow without backend-owner changes.** |

## Conflicts with the previous synchronization plan

There is **one scope refinement, not an architectural conflict**. The previous plan recommended a broader normalized model for published experiences, media, actions, drafts, and visibility. The new attachment intentionally postpones most of that and asks for only the smallest booking slice.

The previous plan’s important constraints remain unchanged: Railway should not be modified casually; the managed application needs resource-level persistence; localStorage must not be presented as the source of truth; and without subscriptions the UI should refetch after successful mutations rather than claim real-time behavior.

The new attachment’s suggested `users/travellers` record also needs a prototype adjustment. Because the current demo login is not production authentication, the one-day implementation should use a clearly labelled deterministic prototype identity, such as `demo-traveller-1` and `demo-artisan-1`, or reuse the existing managed user subject when available. This avoids pretending the current role login is secure authentication.

## What can be implemented immediately after approval

The shortest safe implementation can use the existing managed application database and tRPC layer, without touching Railway:

1. Add a minimal `experiences` table seeded with one source-approved Mysore Silk experience linked to the verified live Railway craft ID and one seeded prototype artisan.
2. Add a `bookings` table with `id`, `experienceId`, `artisanId`, `travellerKey` or `travellerId`, `bookingDate`, `status`, and timestamps. Use a stable application booking ID and `pending`, `accepted`, `rejected` status values.
3. Add four typed application procedures corresponding to the requested operations: `booking.create`, `booking.listForArtisan`, `booking.updateStatus`, and `booking.listForTraveller`. These are new managed-application APIs, not Railway endpoints.
4. Connect the existing Mysore Silk Experience page to a small confirmation modal/date selector. On success, show “Experience booked successfully” and “Pending artisan confirmation.”
5. Add a focused New Experience Bookings panel to the existing Artisan workspace. It should show traveller, experience, craft, date, and status, with Accept and Reject actions.
6. After each mutation, invalidate/refetch the relevant Traveller or Artisan query. This gives reliable refresh/revalidation without pretending cross-browser real-time subscriptions exist.
7. Add Vitest coverage for create, list-by-role, pending-to-accepted, pending-to-rejected, ownership/visibility, and reload-visible persistence. Then run the full test suite, TypeScript check, production build, and the exact demo flow.

## What requires backend or deployment access

| Requirement | Access needed | Why |
|---|---|---|
| Create normalized booking tables | Managed application database migration access | The current `demo_states` snapshot table cannot provide a canonical booking row, status transition, or relational queries. |
| Add booking procedures | Managed application server/tRPC code access | The current app router exposes only auth and generic demo-state list/save operations. |
| Seed the Mysore Silk experience | Managed database write/migration access | The current Phase 2/3 experience information is frontend-only and read-only. |
| Use Railway as the booking backend | Railway repository/deployment-owner access | Railway currently has no booking domain tables or endpoints. This is **not recommended for the one-day demo** because it risks the existing craft/route integration. |
| Multi-session real-time updates | New WebSocket/subscription infrastructure and deployment support | Not required for the shortest flow; refetch after mutations is sufficient. |
| Production authentication | Authentication/backend-owner work | Explicitly out of scope for this SIH slice; prototype identities must remain visibly labelled. |

## Shortest implementation path

| Step | Traveller | Backend/application | Artisan |
|---|---|---|---|
| 1 | Open existing Mysore Silk experience and choose a date. | Seed one published Mysore Silk experience linked to the verified live craft ID. | Existing demo Artisan identity owns the experience. |
| 2 | Confirm booking. | `booking.create` inserts `pending` booking and returns its ID/status. | — |
| 3 | See success message and pending status. | Persist row in managed database; no localStorage authority. | `booking.listForArtisan` returns the new row. |
| 4 | — | `booking.updateStatus({ id, status })` enforces `pending → accepted/rejected`. | Click Accept or Reject. |
| 5 | Refresh/open Traveller Bookings. | `booking.listForTraveller` reads the persisted current status. | — |
| 6 | See “Accepted by artisan” or “Rejected by artisan.” | Refetch after mutation; no fake realtime claim. | Booking remains in the Artisan list with final status. |

## Approval-gated result

| Requested final test | Current result before implementation |
|---|---|
| Traveller booking | **FAIL** — only the legacy Channapatna local demo reservation exists. |
| Backend persistence | **FAIL** — no booking table or booking API exists. |
| Artisan receives booking | **FAIL** — no booking query exists. |
| Artisan accept/reject | **FAIL** — no booking status mutation exists. |
| Traveller receives status | **FAIL** — no shared booking status query exists. |
| Persists after refresh | **FAIL for a shared booking** — role snapshots are not a canonical booking record. |
| Existing features preserved | **YES by plan** — no Railway changes, no Explore/Planner redesign, and no Phase 1–3 contract changes are proposed. |
| Remaining backend/deployment task | **YES** — managed application schema/API work is required; Railway owner access is not required if the managed app is used. |

**Approval request:** approve the managed-application-only implementation path above. Once approved, implementation should begin with the schema and four application procedures, not with Railway changes.
