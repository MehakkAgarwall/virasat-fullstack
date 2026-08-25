# Experience Preview and Explore Contrast Refinement

## Preview scope

The Planner rail now treats motion as an **experience-only capability**. Its preview registry includes the existing Channapatna workshop reel and the newly generated six-second Mysuru heritage-craft visual. Artisan and craft-only moments continue to render their existing editorial stills; the application does not imply that non-experience stops are videos.

The live Bengaluru–Mysuru response returned two records categorised as Craft and Artisan, so both correctly remained still previews. The registry's generated preview is attached to the explicit curated `bengaluru-mysuru-rosewood-inlay` Heritage experience identifier, where it is semantically aligned rather than reused for unrelated live crafts.

## Asset preparation

The generated Mysuru clip is a browser-ready six-second H.264 1280×720 MP4 and is served from the project-managed static URL `/manus-storage/mysuru-heritage-experience-preview_eeaf71c2.mp4`.

## Contrast treatment

Explore's region/state treatments in the hanging cards, featured location, and archive metadata use an explicit deep ink color with a light paper shadow. This targets the previously low-contrast state labels without changing the collection structure or image treatments.

The settled authenticated Explore view retained all **65** live records and the **37** GI-tagged filter count. State names remained present throughout the live hanging and archive cards, including Tamil Nadu, Karnataka, Telangana, Rajasthan, Jammu and Kashmir, and Madhya Pradesh, under the stronger dark-label rule.

## Validation

The generated preview URL returned **200**, `video/mp4`, and 1,579,958 bytes from project-managed storage. The complete test suite passed with **18 tests across 9 files**; TypeScript and production build both passed. The existing responsive grid rules remain untouched, while the new label rule uses its same desktop/tablet/mobile card selectors rather than introducing a breakpoint-specific fork.
