# Traveller Personal Photo QA

## Profile surface verification

The authenticated Traveller profile no longer renders the unrelated workshop image. Its previous stored legacy fallback is treated as an empty photo value and the profile now shows an initial-based **Add your photo** invitation for the current Traveller identity.

The page continues to show the persisted Traveller name, introduction, preferences, and booking-identity context. The next verification checks the edit surface’s file chooser, client-side validation, and managed upload response.

## Edit-surface verification

The editor exposes a dedicated **Choose your photo** file control beside the personal initial preview. It declares the accepted formats—JPG, PNG, and WebP—and its 2 MB constraint before any upload begins. The control has an explicit high-contrast parchment treatment so it remains easy to find and use.

No generic sample image was uploaded during QA: a personal image should only be selected by the Traveller. The implementation validates file type and size locally, then stores an accepted image through the managed storage procedure and persists its returned URL on that Traveller’s existing profile.

## Final validation

The full suite passed with **60 tests across 30 files**, including Traveller photo validation and the expanded Traveller profile router contract. TypeScript and the production build passed. The upload control was not used with a substitute image during QA so the existing Traveller identity remains ready for a real photo chosen by its user.

## Upload response repair

The failed requests were confirmed to reach the external gateway as large base64 JSON tRPC mutations and receive a **403 `text/html`** response before the app server could return a tRPC error. The photo flow now uses a multipart endpoint at `/api/upload/traveller-photo`, which accepts the same JPG, PNG, and WebP limit and persists the managed image URL to the Traveller profile.

Both local and externally proxied multipart rejection checks returned an Express **400 `application/json`** response rather than HTML. The client also safely handles a non-JSON failure response without surfacing a JSON parse error. The full 60-test suite and production build passed after the transport repair. A real personal image was not uploaded during QA.
