# Shop the Craft QA

## Artisan publishing surface

The authenticated Artisan **Add Product** route now presents all existing live Railway craft records in its required craft selector. The form requires a product name, published price, description, available quantity, visibility choice, and a real JPG, PNG, or WebP image smaller than 2 MB before publishing.

No product was created during QA because no verified Artisan-provided product image, name, price, availability, and ownership information was supplied. The persisted product catalogue therefore remains empty by design rather than being filled with fictional listings.

## Traveller discovery surface

The authenticated Traveller view of the managed Silk Heritage Studio profile now clearly connects the existing cultural experience to **Take a piece of the experience home**. Its product shelf returned the truthful **No products published yet** state, explaining that a Traveller-visible catalogue appears only after the linked Artisan publishes a real studio object. No product card, price, image, availability claim, cart, or purchase action was fabricated.

## Final validation

The generic `/product/:id` route is registered for any future published product. The public product detail includes maker, craft ID, publisher-provided price, availability statement, and a persistent **Send purchase enquiry** action. The linked Artisan has a **Product Enquiries** inbox with a deliberate “Mark responded” state; this is an enquiry only, never a payment, cart, shipping, or order-tracking flow.

The managed database holds **zero** newly seeded products and **zero** product enquiries, as intended. A full real-data end-to-end creation test is intentionally deferred until an Artisan provides a genuine product image, price, available quantity, description, and live craft selection. The complete regression suite passed with **69 tests across 35 files**, and TypeScript plus the production build passed.
