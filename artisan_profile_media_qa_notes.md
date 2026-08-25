# Artisan public-profile media repair QA

The managed profile retained a saved `profilePhotoUrl`, but its managed-storage object was unavailable after redirecting through the project storage route, which caused the blank portrait frame shown in the report. The profile still retained a usable saved cover image.

The public profile now attempts the editable profile photo first, then the editable cover photo, then a project-owned heritage visual. In browser verification, the initial missing profile asset was bypassed and the saved Mysuru heritage cover rendered correctly inside the portrait frame, with the studio identity and both existing experience actions preserved.

The focused image-source regression coverage passed, as did the complete suite with **40 tests across 19 files**, TypeScript validation, and production build. The managed-storage resolution notices and JavaScript chunk-size advisory remain non-blocking build output only.
