# Persistent Artisan Profile QA Notes

## Browser evidence — 19 August 2026

| Surface | Observation | Result |
| --- | --- | --- |
| Artisan editor | All requested profile fields are present: studio and personal names, craft, location/state, practice years, cultural story, contact, languages, experience information, and profile/cover image references. | Pass |
| Save feedback | Updating `demo-artisan-1` from **Mysuru Silk Studio / Saanvi Kulkarni** to **Silk Heritage Studio / Priya Nair** showed the explicit success state: “Public profile saved. Linked experiences and bookings now use this identity.” | Pass |
| Refresh persistence | Reloading `/artisan?tab=profile` retained **Silk Heritage Studio** and **Priya Nair** from the managed database. | Pass |
| Managed image paths | Seeded `/manus-storage/...` image references initially triggered native URL validation. The fields and server contract now accept managed project-storage paths or public HTTPS image URLs. | Fixed |
| Traveller experience | After the query settled, `/experience/mysore-silk-experience` resolved **Priya Nair · Silk Heritage Studio**, dynamic craft specialization, and a linked public maker page. | Pass |
| Public maker profile | `/maker/artisan-studio` rendered the same persisted studio and maker identity, cultural story, image treatment, experience information, and booking link. | Pass |
| Traveller booking ledger | `/traveller/bookings` showed the existing accepted booking as `Mysore Silk Weaving Experience · Priya Nair · Silk Heritage Studio · Mysuru, Karnataka`. | Pass |
| Workspace access | Switching to the Artisan role still reaches the protected Artisan workspace through the existing demo-login boundary. | Pass |
| Artisan dashboard | The refreshed Artisan dashboard shows **Silk Heritage Studio** in the workspace chrome and public-profile card, with **Priya Nair** in the sidebar, hero, and profile summary. | Pass |
| Per-artisan isolation | `artisan_profiles.artisanKey` is enforced by `UNIQUE KEY artisan_profiles_artisan_key_unique`, so a profile belongs to exactly one artisan identity. | Pass |

## Final quality gates

| Check | Result |
| --- | --- |
| Full Vitest suite | **26 tests passed** across 12 test files. |
| TypeScript validation | **Pass** — `pnpm check` completed with no errors. |
| Production build | **Pass** — `pnpm build` completed. Existing managed-storage runtime-resolution notices and the pre-existing chunk-size advisory remain non-blocking. |
| Railway craft integration | Preserved — no Railway FastAPI contract or data behavior was changed. |

## Remaining QA

The next checks are the Traveller booking ledger, Artisan dashboard after update, full Vitest suite, TypeScript/build gate, and per-artisan schema isolation review. No Railway API behavior is changed by this work.
