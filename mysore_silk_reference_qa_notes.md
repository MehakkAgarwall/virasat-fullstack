# Mysore Silk Reference-led Composition QA

## Desktop verification — 20 August 2026

The live `/craft/api-111` page now follows the supplied composition closely: a warm silk-work image carries the hero, the live source badge and existing craft actions remain visible, and the right-hand Mysuru panel is treated as an antique-gold museum card. The lower hero presents paired deep-green panels for the cultural route and the Mysore Silk experience map context.

The preserved actions remain available in the reworked view: **Live Railway data · Refresh**, **Location record**, **Trace route for detour**, **Maker visit**, **Open interactive trail**, and **Book experience**. The live Railway record settled successfully after loading.

## Quality gates

The route corridor is now sourced from a small tested content module rather than repeated visual copy. Focused coverage and the complete suite passed with **36 tests across 17 files**; TypeScript and the production build also passed. The responsive layout includes a single-column mobile variant. The isolated mobile screenshot runner reached the existing protected demo-login boundary rather than an authenticated craft route, so mobile sign-in state remains the only limitation of automated visual capture.

## Tighter reference-match verification

The refined live desktop page now follows the supplied hierarchy more literally: full-bleed handloom photography, text-led left column, a right-side **Mysuru** experience card with persisted capacity, duration, and price fields, plus the paired route summary and map-led experience panel directly below. The live Railway refresh, location record, Planner detour, maker visit, map route, and booking links remain visible and interactive.

The final verification passed with **36 tests across 17 files**, TypeScript validation, and a production build. The managed-storage resolution notices and JavaScript chunk-size advisory remain non-blocking build output only.

## Catalogue-wide live craft verification

The live Moradabad Brassware record (`/craft/api-105`) now uses the same image-led hero, right-side destination panel, and paired route/map cards as Mysore Silk. It correctly shows a **Trace this craft route** action rather than a booking or price, because no persisted paid managed experience belongs to Railway craft ID 105. The panel retains the loaded live source control, provenance, published maker/resource links, and Planner detour. No ₹0 price was displayed.

The live Mysore Silk page now selects the separate paid managed record for Railway craft ID 111: **Mysuru Silk Loom Immersion**, **up to 6 guests**, **45 minutes**, and **₹750 / person**. Its hero CTA opened the persisted managed experience route successfully. The retired zero-price prototype record is not used in traveller-facing craft cards.

Catalogue-wide quality gates passed: **38 tests across 18 files**, TypeScript, and production build. This rollout uses the live Railway craft ID to match managed experience data. Where no paid managed experience exists, the UI remains intentionally route-led and does not invent pricing, capacity, or booking availability.
