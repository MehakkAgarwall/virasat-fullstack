# Kalā Trail — Generation 1 Design Direction

## Three possible approaches

### Theme Name: Museum in Motion
**Very Brief Intro:** An editorial, tactile travel experience where Indian craft becomes a living museum layer around the journey. Warm materials, asymmetric composition, and restrained motion make the product feel collectible and premium.
**Probability:** 0.07

### Theme Name: Monsoon Atlas
**Very Brief Intro:** A poetic cartographic system built from ink lines, rain-washed paper, and deep regional color. The route becomes a story map with a quieter, more geographic mood.
**Probability:** 0.03

### Theme Name: Bazaar After Dusk
**Very Brief Intro:** A darker, cinematic marketplace aesthetic with lantern warmth, carved textures, and selective glow. It makes local commerce feel atmospheric without becoming a gaming interface.
**Probability:** 0.09

## Chosen approach: Museum in Motion

### Design Movement
Contemporary editorial luxury rooted in Indian material culture: part travel journal, part museum label, part product film. The interface should feel like a carefully curated cultural object rather than a conventional tourism portal.

### Core Principles
1. **Material first:** Use warm ivory, forest green, terracotta, and antique gold as if they were paper, wood, fired clay, and patinated metal.
2. **Route as narrative:** Every interaction should clarify the movement from travel to discovery to experience to maker.
3. **Asymmetric calm:** Use editorial offsets, generous negative space, and quiet alignment rather than generic centered SaaS blocks.
4. **Motion with restraint:** 3D objects drift and breathe slowly; UI transitions are brief, purposeful, and never compete with the route or readable content.

### Color Philosophy
Warm ivory is the canvas: it evokes handmade paper and keeps the experience open and legible. Deep forest green is the anchor: it carries trust, earth, and the authority of a cultural institution. Muted terracotta adds human warmth and signals fired clay, lacquer, and red earth. Antique gold is used only for provenance moments, route highlights, and small moments of delight. Deep charcoal keeps the editorial copy grounded.

### Layout Paradigm
Compose pages like spreads in a premium travel journal. The homepage uses a split hero with an offset content rail and a 3D stage bleeding into the negative space. Explore uses a broad editorial introduction followed by a staggered field of craft cards. Route Planner uses a decisive left intelligence rail and right map canvas, with the trail panel acting as a floating folded-paper annotation.

### Signature Elements
1. A small **gold route stitch** motif: a dotted or broken line that reappears in dividers, map annotations, and the trail sequence.
2. **Museum labels**: compact uppercase metadata, provenance badges, and coordinates that make every craft feel catalogued without becoming bureaucratic.
3. **Floating craft stage**: lightweight low-poly diya, pottery, spool, and toy forms with soft shadows, slow drift, and cursor-responsive parallax.

### Interaction Philosophy
Interactions should feel like handling a crafted object: hover states lift and reveal, clicks commit with a soft tactile response, and selected discoveries move into the trail as if being placed on a route. The UI never hides important information behind spectacle.

### Animation
Use Framer Motion for 180–280ms entrances, drawers, and hover transitions, with opacity and transform only. Stagger cards by 45–65ms. Use React Three Fiber for slow 8–14 second float cycles, gentle rotation, and small pointer parallax. The hero should feel alive at rest but settle into stillness as the user reads. Respect `prefers-reduced-motion` and reduce object count on small screens.

### Typography System
Display: **Cormorant Garamond**, italic and roman weights for editorial headlines and pull quotes. UI and body: **Manrope**, with medium or semibold weights for controls and generous line-height for descriptions. Eyebrows use Manrope 10–11px uppercase with tracking around 0.18em. Headings should be large, slightly compressed in line-height, and never over-decorated.

### Brand Essence
**Positioning:** Kalā Trail is the cultural route companion for curious travellers who want to discover the makers and living traditions already waiting along the way.

**Personality:** Curated, warm, quietly adventurous.

### Brand Voice
Headlines are short, evocative, and specific. CTAs are active invitations, never generic conversion language. Microcopy should sound like a thoughtful guide who knows the region.

Example lines:

> You're already going there. Take the meaningful turn.

> Add a living tradition to your route.

### Wordmark & Logo
The mark is a minimal **stitched route loop**: one continuous forest-green line that bends into a small terracotta seed/diya shape, with a single antique-gold stitch interrupting the loop. The wordmark pairs a refined serif “Kalā” with a compact, tracked “TRAIL” sans-serif label. In Generation 1 the symbol is rendered as a simple CSS/SVG mark so it remains crisp at favicon and navigation sizes.

### Signature Brand Color
**Trail Green — #163C35.** It is darker and earthier than a generic emerald, carrying the feeling of forest shade, hand-dyed textile, and a trusted field guide.

## Generation 1 scope

This release intentionally focuses on the premium homepage, traveller role selection/login, Explore, and Route Planner. Other role dashboards, craft detail, artisan, product, and booking surfaces remain outside this pass. All content uses realistic local mock data and all user actions are frontend-only.

## Style Decisions

- The 3D craft layer now prioritises recognisable, handcrafted silhouettes over abstract geometry: the hero uses a pull-along Channapatna-inspired wooden animal, diya, terracotta vessel, textile spool, and carved wood finial.
- The route stitch remains a restrained material/provenance motif; this visual-only pass preserves the existing layout, typography, and colour palette rather than extending the interface into new pages or flows.
- **Cultural Detour Engine refinement:** Treat maps as warm field artifacts with stitched route lines, restrained atlas labels, and paper-like annotation panels; every craft visual must depict the named maker, material, process, or region.
- **Editorial cadence:** Preserve serif-and-terracotta-italic display moments as a signature accent, but interleave them with field notes, museum labels, and quieter route-guidance blocks to avoid a formulaic rhythm.
