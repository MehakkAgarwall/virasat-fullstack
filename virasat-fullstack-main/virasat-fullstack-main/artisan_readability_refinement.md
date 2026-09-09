# Artisan Workspace Readability Refinement

## Reported issue

The Artisan Tourist Interest workspace used low-contrast dark text on forest/green metric surfaces, making the metric labels, helper copy, reservation details, and annotation text difficult to read.

## Repair

An Artisan-only late stylesheet now sets a clear contrast hierarchy: warm ivory for primary text, antique gold for labels and operational links, terracotta for numeric emphasis, and muted ivory for supporting copy. Dark cards retain their heritage atmosphere through forest gradients and fine gold outlines, but no longer rely on dark text.

The workspace headings and the `nearby` / `not invented demand` accents now use a measured Italianno/Pinyon calligraphic treatment with a restrained gold flourish. This improves editorial character while keeping the main content in the more readable Cormorant Garamond style.

## Browser evidence

The authenticated desktop Artisan dashboard and the originally reported **Tourist Interest** tab were rechecked. Metric labels, reservation title, helper text, traveller-signal note, and action links are now clearly readable on their dark cards; the primary heading and calligraphic accents remain visibly distinct.

The late Artisan stylesheet includes a narrow-screen refinement that scales the workspace heading, removes fixed metric-card height, and maintains the contrast variables for mobile. The full suite passed with **18 tests across 9 files**, TypeScript passed, and the production build succeeded. The retained managed-storage resolution notices and bundle-size advisory are non-blocking and unrelated to this contrast repair.
