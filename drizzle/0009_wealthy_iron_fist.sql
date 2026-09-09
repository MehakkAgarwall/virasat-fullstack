ALTER TABLE `traveller_reflections` ADD `isShared` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `traveller_reflections` ADD `sharedAt` timestamp;--> statement-breakpoint
CREATE INDEX `traveller_reflections_shared_created_idx` ON `traveller_reflections` (`isShared`,`sharedAt`);