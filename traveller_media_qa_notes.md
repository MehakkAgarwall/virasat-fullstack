# Traveller Profile, Artisan Media, and Detour QA

## Browser evidence — 19 August 2026

| Surface | Observation | Result |
| --- | --- | --- |
| Traveller profile | A fresh Traveller session rendered the separate persisted profile with **Aarav Mehta**, photo, introduction, preferences, and an explicit ownership statement. | Pass |
| Ownership boundary | The profile page states that its edits never change the maker connected to an experience; no Artisan profile controls appear in the Traveller form. | Pass |
| Traveller editor | The editor exposes Traveller name, profile-photo URL, short introduction, cultural preferences, cancel, and save controls. | Pass |
| Traveller identity persistence | Updating **Aarav Mehta** to **Aarav Raman** saved successfully, rendered the new name in the profile, and showed: “Traveller profile saved. Your bookings now use this identity.” | Pass |
| Shared booking ledger | The Traveller ledger retained confirmed managed bookings and resolved the current connected Artisan identity as **Priya Nair · Silk Heritage Studio · Mysuru, Karnataka**. | Pass |
| Fresh Artisan session | A new Artisan session loaded **Silk Heritage Studio / Priya Nair** in the workspace, confirming the Traveller profile update did not change the connected Artisan identity. | Pass |
| Artisan media editor | The persisted Mysuru Silk experience editor exposes title, description, cover image, gallery URLs, preview video URL, YouTube URL, preview caption, duration, maximum guests, location, availability dates/times, distance from route, detour minutes, and the detour explanation. | Pass |
| Controlled media input | The Artisan editor accepted a three-image managed gallery, hosted managed preview-video URL, distinct preview caption, and a route-specific detour explanation. | Pending save confirmation |
| Managed media save | The controlled publish completed and returned the Artisan workspace to the persisted experience list, confirming the managed experience write path accepted the new media payload. | Pass |
| Traveller media refresh | In a fresh Traveller session, the same managed experience displayed the persisted Artisan-owned preview video, three distinct gallery images, updated caption, and current connected Artisan identity **Priya Nair · Silk Heritage Studio**. | Pass |
| Preview-first flow | The experience page now presents **Watch → Discover maker → See location → Check availability → Book** before booking controls. The hosted video uses muted autoplay and native controls; the gallery is independently selectable. | Pass |
| Cultural detour clarity | The page showed a clear journey sequence **Your start → Planned route → Mysuru, Karnataka → Your destination**, plus a “Worth the detour?” card with 18 extra minutes, 4.8 km off route, duration, dates, and price. | Pass |
| Booking continuity | The existing confirmed booking remained readable after the media update, and the booking section addressed **Aarav Raman** while retaining the separate connected Artisan identity. | Pass |
| Artisan identity after Traveller update | A fresh Artisan session continued to render **Priya Nair / Silk Heritage Studio** throughout the workspace, confirming role-owned profile isolation. | Pass |
| Artisan booking identity | The Artisan booking inbox resolved **Aarav Raman** on existing managed booking rows while continuing to show **Priya Nair · Silk Heritage Studio** as the connected Artisan identity. | Pass |

## Final quality gates

| Check | Result |
| --- | --- |
| Managed schema | **Pass** — separate `traveller_profiles` ownership and additive experience media/detour fields applied without changing booking keys. |
| Focused contract coverage | **Pass** — managed experience media and Traveller-vs-Artisan profile-operation boundaries covered. |
| Full Vitest suite | **29 tests passed** across 13 test files. |
| TypeScript | **Pass** — `pnpm check` completed without errors. |
| Production build | **Pass** — `pnpm build` completed. Existing managed-storage runtime-resolution notices and chunk-size advisory remain non-blocking. |
| Existing live craft integration | **Preserved** — no Railway FastAPI, craft catalogue, or Route Planner API contract was modified. |

## Remaining QA

Save a controlled Traveller name change, confirm it appears in booking records without altering the Artisan; then test Artisan media edits, Traveller preview/media refresh, cultural-detour context, and the managed booking acceptance path.
