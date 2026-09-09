# Craft Detail Live Status and Retry QA

## Live record verification — 20 August 2026

The exact protected route `/craft/api-111?from_webdev=1` loaded the live Mysore Silk record after its normal source-record loading state. The hero now presents a compact **Live Railway data** badge directly below the provenance label, without changing the existing craft storytelling layout.

The route emitted a small session-only QA telemetry record containing only numeric craft ID, data source, lookup duration, timestamp, and a safe fallback reason when relevant. No Traveller or Artisan personal data is collected.

## Fallback and retry verification

The controlled unknown record `/craft/api-999999` rendered the existing unavailable-record fallback, surfaced the precise Railway response (`No craft found with id 999999`), and retained Explore and Cultural Trail exit paths. Selecting **Retry Railway lookup** safely started another request cycle and returned to the same understandable fallback when the record remained unavailable.

## Telemetry and quality gates

The session-only QA trail contained a successful live entry for craft `111` and fallback entries for the controlled unknown `999999` record. Each entry contained only `craftId`, `source`, `elapsedMs`, `occurredAt`, and the safe fallback reason where applicable.

| Check | Result |
| --- | --- |
| Live source badge | Pass — verified on `/craft/api-111`. |
| Controlled fallback and retry | Pass — verified on `/craft/api-999999`. |
| Full Vitest suite | Pass — **32 tests** across 15 files. |
| Production build | Pass — completed successfully; existing managed-storage and bundle-size notices remain non-blocking. |
