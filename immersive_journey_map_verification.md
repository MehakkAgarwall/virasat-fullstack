# Immersive Cultural Journey Verification

## Implemented journey surfaces

The populated Cultural Journey now renders a live Google Maps baselayer behind the existing route geometry and craft markers. The existing Leaflet atlas remains an automatic visual fallback if the Google script does not load. The live-map frame exposes a **See in 3D** control that requests tilted terrain/building depth; Google Maps coverage determines where 3D detail is visible.

The new **Before you go / visual preview** rail is intentionally labelled as an editorial preview, not live footage from the destination. It uses the selected craft’s existing contextual imagery and a second craft-material frame to preview the route → place → craft → maker sequence without representing generated or editorial imagery as on-site video.

## Visual checks

Authenticated desktop and 390 px mobile planner captures confirmed that the preserved origin/destination form, route opportunities, Google map, trail panel, and route actions remain visible. The real map loaded in the authenticated desktop and mobile captures, and the preview rail remains distinct from the route controls and map.

## Validation status

TypeScript validation and production build pass. The automated suite currently has **14 passing tests and one external-service failure**: the existing live health assertion calls the collaborator-owned Railway URL and receives HTTP 404 from `https://kalatrail-backend-production.up.railway.app/health`. Direct curl confirmed the same 404. This was not caused by the map or preview code, and no Railway/FastAPI source was changed in this frontend task.
