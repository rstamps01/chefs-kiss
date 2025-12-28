CREATE TABLE `unitConversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`fromUnit` varchar(50) NOT NULL,
	`toUnit` varchar(50) NOT NULL,
	`conversionFactor` decimal(15,6) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `unitConversions_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_conversion` UNIQUE(`restaurantId`,`fromUnit`,`toUnit`)
);
--> statement-breakpoint
CREATE INDEX `restaurant_idx` ON `unitConversions` (`restaurantId`);