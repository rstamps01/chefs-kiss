CREATE TABLE `import_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`userId` int NOT NULL,
	`importType` enum('ingredients','recipes','recipeIngredients') NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`recordsCreated` int NOT NULL DEFAULT 0,
	`recordsUpdated` int NOT NULL DEFAULT 0,
	`totalRecords` int NOT NULL DEFAULT 0,
	`snapshotData` json,
	`status` enum('completed','rolled_back') NOT NULL DEFAULT 'completed',
	`rolledBackAt` timestamp,
	`rolledBackBy` int,
	`fileName` varchar(255),
	`notes` text,
	CONSTRAINT `import_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `restaurant_idx` ON `import_history` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `import_history` (`userId`);--> statement-breakpoint
CREATE INDEX `timestamp_idx` ON `import_history` (`timestamp`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `import_history` (`status`);