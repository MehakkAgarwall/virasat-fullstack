# Duplicate public Mysore Silk experience repair QA

The public Silk Heritage Studio profile showed two experience records because the managed database contained both a paid current record and an older zero-price prototype for the same Artisan and Railway craft ID 111.

The current **Mysuru Silk Loom Immersion** record remains Traveller-visible at ₹750, 45 minutes, and six guests. The older **Mysore Silk Weaving Experience** record was marked unavailable rather than deleted. This removes it from `listPublishedExperiences` while preserving its two accepted historic bookings. The current record’s three bookings also remain intact (one accepted and two pending).

Browser verification confirmed the public studio profile now displays only the paid current experience and links to its persisted experience route.

The full regression suite passed with **41 tests across 20 files**, alongside TypeScript validation and production build. Managed-storage resolution notices and the JavaScript chunk-size advisory remain non-blocking build output only.
