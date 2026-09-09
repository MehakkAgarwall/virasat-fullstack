# Shared Traveller ↔ Artisan Data Audit

## Confirmed managed relationships

The managed database already contains a normalized core relationship: `artisan_profiles.artisanKey` → `experiences.artisanKey` → `bookings.experienceId` and `bookings.artisanKey`. Booking reads join back through the experience to resolve the current profile name, craft specialization, and location. This correctly prevents a saved profile edit from requiring manual updates to booking display data.

## Remaining synchronization gaps

| Area | Current behavior | Required correction |
| --- | --- | --- |
| Artisan experience editor | Uses `artisanDemoService.saveExperience()` and browser local storage. | Replace with managed create/update/list procedures under the current `artisanKey`. |
| Traveller experience route | Only `mysore-silk-experience` uses the managed database; other experience routes can still be static/read-only or local demo behavior. | Resolve any managed experience slug through the same managed query and booking flow. |
| Traveller local toy booking | `reserveExperience()` creates a fixed `Lakshmi Crafts` local booking and local Artisan signal. | Remove this cross-role local booking path; retain Channapatna only as an unbookable cultural resource until a managed Artisan publishes it. |
| Public maker page | Dynamic profile is present, but its experience card is fixed to Mysore Silk. | Query the published experiences owned by that Artisan profile. |
| Legacy routes | A legacy maker route remains for compatibility. | Preserve the redirect-compatible route but ensure it resolves the managed profile, never a fixed identity. |

## Scope decision

Products, cart/pickup state, Authority review fixtures, and the live Railway craft catalogue remain outside this synchronization change. The work focuses only on the canonical relationship **Artisan Profile → Managed Experience → Managed Booking**.
