CREATE TABLE `traveller_reflections` (
	`id` varchar(64) NOT NULL,
	`travellerKey` varchar(191) NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `traveller_reflections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `traveller_reflections_traveller_created_idx` ON `traveller_reflections` (`travellerKey`,`createdAt`);