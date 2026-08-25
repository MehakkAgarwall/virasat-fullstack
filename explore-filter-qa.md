# Explore Filter Repair QA

## Initial investigation

The authenticated Explorer loaded the live 65-record Railway catalogue and rendered the available controls: **All**, **GI Tagged**, **ODOP**, **Textile**, **Handicraft**, **Metalwork**, and **Art**. The existing component stores a selected filter in local React state and derives the visible set from the enrichment-overlay catalogue.

Browser interaction inspection was interrupted by a stale action snapshot that reset the browser view. The implementation and subsequent targeted coverage will verify the filter state transition and resulting collection count independently of the browser automation state.

## Live verification

After the repair, the authenticated live catalogue displays a count on every filter control and a live status line directly beneath the controls. Selecting **Textile** changed the control state and narrowed the collection from 65 to **33** craft records, updating the hanging card row, archive count, and archive records to Textile-labelled crafts only. The interaction remained within the existing live Railway catalogue rather than replacing it with demo data.

Selecting **GI Tagged** independently narrowed the same live collection to **37** source-backed GI-labelled records. The status line, active-button treatment, featured craft, discovery row, and archive count updated to the selected recognition lens. Focus styling and `aria-pressed` semantics are also now present on every filter button.

The final regression suite passed with **56 tests across 28 files**, including three focused Explore-filter contracts for category normalization, recognition matching, query matching, and option ordering. TypeScript validation and the production build also completed successfully.
