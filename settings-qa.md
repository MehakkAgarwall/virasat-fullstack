# Settings QA

## Traveller verification

The protected `/settings` route opened inside the authenticated Traveller session and showed the desktop Settings entry in the top navigation. The page correctly offered the existing Traveller profile editor, My Journey shortcut, role switching, and leave-demo action without creating duplicate profile data.

The **Reduce motion** setting changed from “Cinematic motion is enabled” to “Gentle static presentation enabled,” showed its persisted success state, and applies a browser-scoped reduced-motion preference. The light parchment cards use final dark-ink contrast overrides for heading, description, toggle, and action readability.

## Artisan verification

The Artisan workspace now exposes **Settings** from both its persistent sidebar and workspace header. The shared protected route displayed Artisan-specific content: an **Edit public profile** link, Artisan studio shortcut, role switcher, and the persisted display-comfort preference. No additional Artisan identity data was fabricated or duplicated.

## Final validation

The complete suite passed with **58 tests across 29 files**, including the interface preference normalization contract. TypeScript and the production build passed after the final readable-contrast repair.
