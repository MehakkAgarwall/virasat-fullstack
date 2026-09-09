# Source-verified craft import audit

## Attachment result

The supplied source file contains **product requirements only**. It names no verified artisan, studio, price, capacity, availability, media, or experience record for a Railway craft. Consequently, there are **zero new attachment-supported records to import** and no existing owner, price, or experience row was changed from attachment content.

## Stable mapping and safe implementation

The managed profile now has an optional `primaryCraftId` field, while every managed experience retains its required numeric `craftId`. Both values are chosen from the live Railway catalogue rather than craft names. The Artisan experience form was browser-verified with the full 65-record live selector, including non-Mysore records such as Aranmula Kannadi, Moradabad Brassware, and Pattachitra Painting.

## Existing verified managed data

The managed database currently has two pre-existing experience rows for Railway craft ID 111 only. The active paid Traveller-facing selection is **Mysuru Silk Loom Immersion** at ₹750; the stored zero-price prototype remains excluded from Traveller craft cards. No additional craft has a verified managed experience in the supplied file.

## Verification

The optional `primaryCraftId` migration was applied without assigning a craft to either existing artisan profile. The configured Artisan workspace was browser-verified to display all 65 live Railway craft choices in the reusable Experience editor. The existing managed Craft → Experience → Traveller → Booking → Artisan response → Traveller status contracts remain covered by the full suite: **38 tests across 18 files**, TypeScript validation, and production build all passed.

The existing persisted Priya Nair / Silk Heritage Studio profile was also rechecked after the live profile query settled. Its optional primary-craft field remains intentionally unset, and the same 65-record Railway selector is available to associate a verified craft when the Artisan provides one.
