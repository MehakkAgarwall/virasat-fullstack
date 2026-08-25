# Authority Atlas and Cultural Route QA

## Verified live inputs

The Authority **Planned Routes** workspace returned five anonymous persisted route summaries and eight saved route plans through the new managed route-summary projection. The view displays route origin, destination, craft-stop count, route source, aggregate plan count, and last-saved time only; it intentionally does not display traveller identities, profiles, or private saved items.

The Authority **Live Craft Atlas** loaded the existing Google Maps surface with **65** Railway-backed craft records, **65** source-located markers, and **19** mapped regions. Marker clusters and individual markers rendered successfully, including Kanchipuram Silk Saree, Channapatna Toys, Bidriware, Pochampally Ikat, Kutch Embroidery, Patan Patola, and others. The atlas does not create synthetic map points when live coordinates are unavailable.

## Interaction boundary

Both new Authority sections were reached through the role workspace navigation. The Atlas uses the existing singleton map loader and live Railway adapter, preserving the prior protection against duplicate Google Maps API loading. The planned-route view is read-only and refreshes its persisted anonymous summaries on demand and at a short interval.
