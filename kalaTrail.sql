UPDATE crafts SET ai_description = 'Vibrant floral embroidery that turns everyday fabric into wearable art, Phulkari has been stitched by Punjabi women for generations to mark weddings, harvests, and joyful occasions. Each thread tells a story of celebration, making it one of India''s most heartfelt textile traditions.' WHERE name = 'Phulkari Embroidery';

UPDATE crafts SET ai_description = 'Tucked away in a small Kerala village, Aranmula Kannadi mirrors are unlike any other in the world — cast from a closely guarded metal alloy known to only a handful of families. Owning one connects you to a centuries-old secret passed down through generations of craftsmen.' WHERE name = 'Aranmula Kannadi';

UPDATE crafts SET ai_description = 'Woven from bamboo and cane by skilled Naga artisans, these baskets, mats, and everyday objects are as functional as they are beautiful, deeply woven into the rhythm of tribal life and festival traditions. Each piece carries the quiet craftsmanship of Nagaland''s hills.' WHERE name = 'Nagaland Bamboo Craft';

SELECT COUNT(*) FROM crafts WHERE ai_description IS NOT NULL;