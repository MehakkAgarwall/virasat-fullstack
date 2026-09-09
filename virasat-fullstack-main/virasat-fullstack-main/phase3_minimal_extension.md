# Phase 3 Minimal Extension — Curated Journey Layer

The Phase 2 overlay already contains the only approved source-backed relationship: Railway craft ID **30** → published Moradabad maker profile → published ODOP documentary. The smallest safe Phase 3 extension therefore adds **no new identities, availability, prices, contact details, locations, or source claims**.

Instead, the existing lookup service will derive a `PublishedCraftJourney` from that same published overlay record. It will expose the numeric Railway craft ID, the already-cited GI/ODOP provenance, the linked published artisan, and the linked read-only cultural resource. Any craft without that explicit relationship remains `undefined` and continues through the existing clean Phase 2 presentation.

The traveller UI will use this derived journey in three additive places. Craft Detail will render a compact four-stage rail — **Discover craft → Learn heritage → Meet maker → Cultural experience** — with direct links only when a stage has verified data. The published maker and experience pages will add a cited “return to craft” continuation so the story is circular rather than a dead-end. Contextual direct-visit fallbacks will point to the linked `/craft/api-{id}` route when the source-backed relationship is known; all legacy mock routes retain their present fallback paths.

No Route Planner, Railway request, craft normalizer, GI/ODOP mapping, database schema, authentication, transaction, cart, booking, or marketplace behavior will change.
