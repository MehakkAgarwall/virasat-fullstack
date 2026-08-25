# Traveller–Artisan Experience Synchronization: Integration Assessment

## Decision

The attached specification requires a **single canonical experience record** shared by both role flows. The current project does **not** meet that requirement. It has two local demo-state models plus a generic snapshot mirror; this is useful for the demo but is not a structured, authoritative experience system.

> **Recommendation:** Keep Railway responsible for its existing live craft and route contract. Add canonical experience, publication, media, and traveller-action persistence to the existing managed application database and expose it through the application API. Do not extend the Railway contract unless the backend owner explicitly wants Railway to become the owner of this new domain.

## What the attached specification provides

| Area | Required data or behavior | Relationship |
|---|---|---|
| Shared published experience | `id`, name/title, description, craft, location, cultural story, preview-media metadata, published status | One craft can have many experiences; one artisan can own many experiences. |
| Traveller action | Experience reference, action type, selected slot or equivalent supported action, time, traveller identity | Many actions belong to one experience and are visible to the owning artisan in an appropriate operational view. |
| Artisan management | Create/update experience, manage publication status, maintain traveller-visible information | A draft must not appear in traveller queries; publication changes invalidate the traveller-facing record. |
| Private information | Contact details, internal management data, draft-only fields, operational notes | Remains artisan-only and is never returned by public traveller queries. |
| Synchronization rule | Artisan update → traveller refresh; traveller action → artisan refresh; reload must preserve both | Requires database persistence and explicit API queries/mutations, not independent browser state. |

The currently modelled Artisan fields `duration`, `price`, `capacity`, and `dates` should be classified explicitly during implementation. They belong in the canonical experience record only if they are meant to be traveller-visible after publication; otherwise they should remain in a private operational projection.

## Current architecture comparison

| Layer | Current capability | Result against the attached requirement |
|---|---|---|
| Railway FastAPI | Live crafts, numeric craft lookup, and route discovery. No artisan, experience, publication, action, or booking resources. | **Cannot** support either synchronization direction. |
| Phase 2/3 enrichment manifest | Curated GI/ODOP provenance plus published source-linked maker and cultural-resource context. It is frontend-only and intentionally read-only. | Suitable as initial seed/reference data only; **not** a canonical writable source. |
| Traveller state | `localStorage` bookings and a legacy Channapatna reservation action. | A reservation writes a local Artisan signal, but it is not an experience record/action API. |
| Artisan state | Separate `localStorage` products, experiences, orders, and traveller signals. | Updates do not update traveller-visible experience content. |
| Managed application API/database | Generic `demoState.list/save` stores per-subject, per-role JSON snapshots. No normalized experience or action tables; no subscription mechanism. | Persists snapshots across reloads but **does not** provide a single shared source of truth. |

## Current status against the requested acceptance tests

| Acceptance criterion | Current result | Reason |
|---|---|---|
| Traveller → Artisan | **FAIL as canonical synchronization** | The legacy Channapatna action writes an Artisan-local signal and is mirrored as a snapshot, but no canonical experience-action record is created. |
| Artisan → Traveller | **FAIL** | `saveExperience` only changes the Artisan local dataset; traveller pages still read their separate hard-coded/manifest experience sources. |
| Persists after refresh | **PARTIAL** | Role-specific local snapshots can be restored, but there is no shared experience record to reload consistently across both roles. |
| Single source of truth | **FAIL** | Traveller bookings, Artisan experiences, frontend enrichment, and Railway crafts are independent data stores. |
| Backend changes required | **YES** | Structured persistence and resource-level API operations are absent. |

## Proposed canonical model

The recommended managed-database model keeps Railway IDs as optional craft references without changing Railway:

| Table / resource | Essential fields | Visibility |
|---|---|---|
| `artisans` | `id`, owner/subject reference, public name, published status | Internal ownership plus selected public profile fields. |
| `experiences` | `id`, `artisanId`, `railwayCraftId` nullable, title, description, location, culturalStory, previewMediaId nullable, publishedAt, `status`, timestamps | Public query exposes only published values. |
| `experience_media` | `id`, `experienceId`, storage key/URL, media type, alt text, preview flag | Public only when attached to a published experience. |
| `experience_actions` | `id`, `experienceId`, traveller subject reference, action type, slot/value, createdAt | Artisan sees scoped operational entries; traveller sees only their own action. |
| `experience_private_details` (optional) | `experienceId`, private contact/operations/draft notes | Artisan-only. |

Use a stable application UUID for experience records. Retain the existing Railway numeric craft ID only as `railwayCraftId`; do not depend on it as the experience primary key because Railway seed IDs have previously changed.

## Required API support

The existing managed application API needs the following resource-level procedures. These are **new application APIs**, not changes to the Railway FastAPI contract.

| Procedure group | Minimum operations | Consumer |
|---|---|---|
| Public experience read | List published experiences by craft/route context; get published experience by ID/slug | Traveller catalogue, craft detail, planner, preview rail. |
| Artisan experience management | List own records including drafts; create; update; publish/unpublish; attach/remove approved media | Artisan workspace. |
| Traveller action | Create supported action/reservation; list own actions | Traveller experience and booking pages. |
| Artisan action inbox | List actions for experiences owned by the artisan; update operational status if needed | Artisan Tourist Interest and Orders/Experiences views. |

There is no current WebSocket or subscription infrastructure. After a successful mutation, each role should invalidate/refetch its relevant query. This satisfies the specification’s reliable refresh/revalidation requirement without claiming real-time behavior. A later subscription channel can be added only if cross-session immediacy becomes a demonstrated need.

## Implementation sequence

| Phase | Scope | Dependency |
|---|---|---|
| 1. Contract and migration | Agree field visibility; add normalized tables and migration; seed only approved existing experience records. | Managed DB schema decision. |
| 2. Application API | Add typed read/mutation procedures with ownership and publication checks. | Phase 1. |
| 3. Shared frontend service | Replace the two local experience datasets with query/mutation adapters. Retain local-only Trail preferences separately. | Phase 2. |
| 4. Role flows | Artisan publishes/updates → Traveller refetches published data; Traveller creates action → Artisan refetches inbox. | Phase 3. |
| 5. Verification | Test both directions, a full reload, unpublished-draft exclusion, ownership enforcement, source-of-truth reads, TypeScript, production build. | Phase 4. |

## What can proceed now vs. what cannot

| Can proceed without Railway changes | Requires new backend/API support |
|---|---|
| Define the shared TypeScript contract and visibility rules; map existing curated records into a future seed file; replace hard-coded UI references behind a common service interface; keep route/craft lookup and GI/ODOP overlay unchanged. | True Artisan → Traveller publication updates; canonical Traveller actions; cross-role reload consistency; ownership/access control; draft isolation; action inbox; any multi-session refresh behavior. |

No application code, Railway code, database schema, or API contract was changed during this assessment.
