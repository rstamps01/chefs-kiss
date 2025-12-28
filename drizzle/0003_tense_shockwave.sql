CREATE TABLE `ingredientConversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`ingredientId` int NOT NULL,
	`fromUnit` varchar(50) NOT NULL,
	`toUnit` varchar(50) NOT NULL,
	`conversionFactor` decimal(15,6) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ingredientConversions_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_conversion_per_ingredient` UNIQUE(`restaurantId`,`ingredientId`,`fromUnit`,`toUnit`)
);
--> statement-breakpoint
CREATE TABLE `unitCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`baseUnit` varchar(50),
	`description` text,
	`canAutoConvert` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `unitCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_category_name` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `ingredientUnits` ADD `categoryId` int;--> statement-breakpoint
ALTER TABLE `ingredientUnits` ADD `conversionFactor` decimal(15,6);--> statement-breakpoint
ALTER TABLE `ingredientUnits` ADD `isStandard` boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `restaurant_idx` ON `ingredientConversions` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `ingredient_idx` ON `ingredientConversions` (`ingredientId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `ingredientUnits` (`categoryId`);