CREATE TABLE `product_enquiries` (
	`id` varchar(64) NOT NULL,
	`productId` varchar(64) NOT NULL,
	`artisanKey` varchar(191) NOT NULL,
	`travellerKey` varchar(191) NOT NULL,
	`travellerName` varchar(191) NOT NULL,
	`message` text NOT NULL,
	`productEnquiryStatus` enum('new','responded') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_enquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(64) NOT NULL,
	`artisanKey` varchar(191) NOT NULL,
	`craftId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`price` int NOT NULL,
	`imageUrl` varchar(1024) NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`available` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `product_enquiries_artisan_idx` ON `product_enquiries` (`artisanKey`);--> statement-breakpoint
CREATE INDEX `product_enquiries_product_idx` ON `product_enquiries` (`productId`);--> statement-breakpoint
CREATE INDEX `product_enquiries_traveller_idx` ON `product_enquiries` (`travellerKey`);--> statement-breakpoint
CREATE INDEX `products_artisan_idx` ON `products` (`artisanKey`);--> statement-breakpoint
CREATE INDEX `products_craft_idx` ON `products` (`craftId`);