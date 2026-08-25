# Traveller Booking Entry-Point QA

## Published managed experience

The authenticated Traveller view of the published **Mysore Silk Weaving Experience** and **Mysuru Silk Loom Immersion** now presents a high-visibility **Book this experience** control in the hero, above the media and detour sections. The control navigates directly to the persisted booking form using the `#book-experience` anchor.

## Persisted booking state

Both verified existing demo records already have a persisted accepted booking for the current Traveller identity. The booking section therefore intentionally shows **Experience Confirmed** rather than a duplicate submit action, along with the booking date, time, linked Artisan identity, progress state, and My Bookings link. A Traveller with no existing request sees the date/time fields and the persisted **Book this experience** submit action.

## Source-honesty boundary

The new cultural-discovery records remain read-only and do not gain a booking control because no Artisan, availability, capacity, price, or booking contract has been verified for them. This prevents source-linked cultural context from being presented as a bookable workshop.

## Demo reset verification

With the Traveller’s explicit confirmation, the two accepted bookings owned by the active browser-specific Traveller identity were removed through the guarded `booking.removeForTraveller` procedure. A follow-up query returned an empty Traveller booking ledger, and the two reset booking identifiers no longer appeared in the linked Artisan inbox query. Other browser-specific demo booking records were left untouched. The current Traveller can now submit fresh booking requests for both published Mysuru Silk experiences during judging.

The final Traveller experience check showed the clean **Ready when you are** booking state with a hero-level **Book this experience** action, the date selector, time selector, and enabled persisted booking submit button. No duplicate booking was created during this reset validation.
