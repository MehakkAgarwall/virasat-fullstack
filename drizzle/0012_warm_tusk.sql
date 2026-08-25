CREATE TABLE `cultural_resources` (
	`id` varchar(64) NOT NULL,
	`craftId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`summary` text NOT NULL,
	`location` varchar(255) NOT NULL,
	`sourceLabel` varchar(255) NOT NULL,
	`sourceUrl` varchar(1024) NOT NULL,
	`imageUrl` varchar(1024) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cultural_resources_id` PRIMARY KEY(`id`),
	CONSTRAINT `cultural_resources_craft_unique` UNIQUE(`craftId`)
);

INSERT INTO `cultural_resources` (`id`, `craftId`, `title`, `summary`, `location`, `sourceLabel`, `sourceUrl`, `imageUrl`) VALUES
('banarasi-silk-saree-discovery', 104, 'Banarasi Silk Saree cultural discovery', 'A source-linked introduction to Varanasi’s Banarasi Silk Saree tradition, where silk is woven with gold and silver brocade. This record does not claim a workshop host, price, capacity, schedule, or booking availability.', 'Varanasi, Uttar Pradesh', 'Virāsat live Railway craft catalogue', 'https://virasat-backend.up.railway.app/crafts', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/%27Sari%27_from_Varanasi_%28north-central_India%29%2C_silk_and_gold-wrapped_silk_yarn_with_supplementary_weft_brocade.jpg/330px-%27Sari%27_from_Varanasi_%28north-central_India%29%2C_silk_and_gold-wrapped_silk_yarn_with_supplementary_weft_brocade.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail'),
('kanchipuram-silk-saree-discovery', 107, 'Kanchipuram Silk Saree cultural discovery', 'A source-linked introduction to Kanchipuram Silk Saree traditions, recognised in the live craft catalogue for heavy silk, contrast borders, and temple-inspired motifs. This record is informational only, with no named host or booking claim.', 'Kanchipuram, Tamil Nadu', 'Virāsat live Railway craft catalogue', 'https://virasat-backend.up.railway.app/crafts', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Kanchipuram_sarees_%287642282772%29.jpg/330px-Kanchipuram_sarees_%287642282772%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail'),
('channapatna-toys-discovery', 109, 'Channapatna Toys cultural discovery', 'A source-linked introduction to the Channapatna toy tradition of Ramanagara, Karnataka, where colourful lacquered wooden toys and dolls are part of the live craft catalogue. This is not a bookable workshop listing.', 'Ramanagara, Karnataka', 'Virāsat live Railway craft catalogue', 'https://virasat-backend.up.railway.app/crafts', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Wooden_toys.JPG/330px-Wooden_toys.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail'),
('pattachitra-painting-discovery', 115, 'Pattachitra Painting cultural discovery', 'A source-linked introduction to Pattachitra, the cloth-based scroll-painting tradition in Puri documented in the live craft catalogue. It is a read-only cultural record rather than a published Artisan experience.', 'Puri, Odisha', 'Virāsat live Railway craft catalogue', 'https://virasat-backend.up.railway.app/crafts', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Odisha_Pattachitara_Depicting_Unconditional_Love_between_Radha_Krushna.jpg/330px-Odisha_Pattachitara_Depicting_Unconditional_Love_between_Radha_Krushna.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail'),
('kutch-embroidery-discovery', 118, 'Kutch Embroidery cultural discovery', 'A source-linked introduction to Kutch Embroidery from Gujarat, described in the live craft catalogue through its mirror-work and pastoral-community traditions. This record does not infer an Artisan, schedule, capacity, price, or booking availability.', 'Kutch, Gujarat', 'Virāsat live Railway craft catalogue', 'https://virasat-backend.up.railway.app/crafts', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Prag_Mahal_Back_side_view%2C_Bhuj%2C_Gujarat%2C_India.jpg/330px-Prag_Mahal_Back_side_view%2C_Bhuj%2C_Gujarat%2C_India.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail');
