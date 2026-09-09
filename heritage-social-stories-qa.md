# Heritage Notes Review Photos and Social Stories QA

## Privacy and presentation

The authenticated Heritage Notes composer now presents an **Optional review photo** control beside clear private-by-default wording. It states that an image remains attached to the Traveller’s private note unless the owner selects the explicit Board-sharing checkbox. The supported JPG, PNG, and WebP formats have a 2 MB managed-upload limit.

The Shared Trail Board now describes its public boundary: name, profile photo, review photo, and the **Share story** action appear only for notes that have already been published to the board. Existing published notes display their saved owner name and an owner profile-photo avatar only when one exists; no profile image is fabricated for Travellers without one.

## Transport check

The new multipart review-photo endpoint returned an Express **400 `application/json`** response with a structured identity/image error for an invalid request, rather than an HTML gateway page. No personal review image was uploaded during QA.

## Final validation

The database migration adds a single non-destructive `reviewPhotoUrl` field with an empty-string default, so existing private and published reflections remain intact. The complete suite passed with **67 tests across 34 files**, including review-photo format validation; TypeScript and the production build passed. The browser share action remains user-triggered and hands off to the device share sheet when available, or copies the public-story text and link when it is not.
