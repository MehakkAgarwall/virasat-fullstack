# Traveller Craft Atlas Verification Notes

The authenticated Traveller route loaded the live Railway catalogue as **65 craft records across 19 states/regions**, with **37** currently enriched through the existing GI/ODOP overlay. The Google map rendered clustered interactive gold markers and showed **65 source-located records** with no atlas-location fallbacks. The desktop navigation now exposes **Craft Atlas** directly.

The first map render shows the full all-India marker extent, but its framing can be tightened one zoom level toward India so the craft canvas feels more focused. Search, marker selection, selected-record detail, filter, and Planner handoff remain to be exercised before release.

The initial map framing was tightened to an India-focused view without preventing Traveller zoom exploration. Search for **Mysore Silk** reduced the map to the source-located Mysore Silk Saree marker and opened its selected craft record. The selected panel exposed verified managed-experience context along with **View experience**, **Explore craft**, and **Trace detour** links.

Selecting **Trace detour** from the Atlas carried the existing numeric craft intent (`api-111`) and the real Mysuru, Karnataka location into the established Planner. The Planner showed the source-honest Craft detour ready state, retained the Traveller’s current Delhi origin, and exposed the existing confirmation action rather than creating a second route engine.

Final validation passed: TypeScript validation, the complete Vitest suite (**52 tests across 27 files**), and the production build. The Craft Atlas continues to reuse the established live craft adapter and Planner intent service rather than duplicating a catalogue or route engine.

The visual refinement loads over the live all-India map without obscuring Google map labels. It adds a thin antique-gold map frame, restrained warm vignette, archival surround, compact live-catalogue record line, uppercase existing-category filters, an unobtrusive lower-right Craft Atlas legend, and terracotta/gold individual-and-cluster marker hierarchy. The real 65-record clustered map remains interactive.

Searching **Mysore** presented the source-backed Mysore Silk Saree suggestion and selecting it opened the floating map card with verified Mysuru location, Textile/GI label, live description, managed maker link, craft story, and detour actions. A late inherited pale heading/action rule makes parts of the new light card less readable; the issue is recorded for a final scoped contrast override.

The scoped dark-ink contrast boundary was applied and browser-verified: the selected Mysore Silk Saree title, Mysuru location, verified tags, live description, maker link, craft-story link, and detour link are now clearly legible on parchment. The selected marker retains its ring and slow optional thread accent. The complete Vitest suite passed with 52 tests across 27 files and the production build completed successfully.
