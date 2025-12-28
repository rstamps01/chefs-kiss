CREATE TABLE `ingredientUnits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`name` varchar(50) NOT NULL,
	`displayName` varchar(100) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`displayOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ingredientUnits_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_name_per_restaurant` UNIQUE(`restaurantId`,`name`)
);
--> statement-breakpoint
CREATE TABLE `recipeCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`displayOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recipeCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_name_per_restaurant` UNIQUE(`restaurantId`,`name`)
);
--> statement-breakpoint
CREATE INDEX `restaurant_idx` ON `ingredientUnits` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `restaurant_idx` ON `recipeCategories` (`restaurantId`);