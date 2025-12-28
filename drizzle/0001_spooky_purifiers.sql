CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`eventDate` date NOT NULL,
	`eventType` varchar(100),
	`expectedAttendance` int,
	`impactLevel` enum('low','medium','high'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forecasts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`forecastDate` date NOT NULL,
	`predictedSales` decimal(10,2) NOT NULL,
	`predictedOrders` int,
	`confidenceScore` decimal(5,2),
	`weatherFactor` decimal(5,2),
	`eventFactor` decimal(5,2),
	`trendFactor` decimal(5,2),
	`aiInsights` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forecasts_id` PRIMARY KEY(`id`),
	CONSTRAINT `location_date_idx` UNIQUE(`locationId`,`forecastDate`)
);
--> statement-breakpoint
CREATE TABLE `ingredients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100),
	`unit` varchar(50) NOT NULL,
	`costPerUnit` decimal(10,4),
	`supplier` varchar(255),
	`shelfLife` int,
	`minStock` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ingredients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `item_sales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`salesDataId` int NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`category` varchar(100),
	`quantity` int NOT NULL,
	`revenue` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `item_sales_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text,
	`city` varchar(100),
	`state` varchar(50),
	`zipCode` varchar(20),
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pos_integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`posSystem` varchar(50) NOT NULL,
	`apiKey` text,
	`lastSync` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pos_integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prep_plan_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`prepPlanId` int NOT NULL,
	`ingredientId` int NOT NULL,
	`plannedQuantity` decimal(10,2) NOT NULL,
	`actualQuantity` decimal(10,2),
	`unit` varchar(50) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prep_plan_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prep_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`planDate` date NOT NULL,
	`forecastId` int,
	`status` enum('draft','approved','completed') NOT NULL DEFAULT 'draft',
	`aiRecommendations` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prep_plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `location_date_idx` UNIQUE(`locationId`,`planDate`)
);
--> statement-breakpoint
CREATE TABLE `recipe_ingredients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipeId` int NOT NULL,
	`ingredientId` int NOT NULL,
	`quantity` decimal(10,4) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recipe_ingredients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`servings` int DEFAULT 1,
	`prepTime` int,
	`cookTime` int,
	`costPerServing` decimal(10,2),
	`sellingPrice` decimal(10,2),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recipes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`locationId` int,
	`reportType` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`startDate` date,
	`endDate` date,
	`pdfUrl` text,
	`status` enum('generating','completed','failed') NOT NULL DEFAULT 'generating',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`cuisine` varchar(100),
	`timezone` varchar(50) DEFAULT 'America/Los_Angeles',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `restaurants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`date` date NOT NULL,
	`totalSales` decimal(10,2) NOT NULL,
	`totalOrders` int NOT NULL,
	`averageOrderValue` decimal(10,2),
	`lunchSales` decimal(10,2),
	`dinnerSales` decimal(10,2),
	`dayOfWeek` int NOT NULL,
	`isHoliday` boolean DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sales_data_id` PRIMARY KEY(`id`),
	CONSTRAINT `location_date_idx` UNIQUE(`locationId`,`date`)
);
--> statement-breakpoint
CREATE TABLE `weather_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`date` date NOT NULL,
	`tempHigh` decimal(5,2),
	`tempLow` decimal(5,2),
	`tempAvg` decimal(5,2),
	`precipitation` decimal(5,2),
	`humidity` int,
	`windSpeed` decimal(5,2),
	`condition` varchar(100),
	`isForecast` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weather_data_id` PRIMARY KEY(`id`),
	CONSTRAINT `location_date_idx` UNIQUE(`locationId`,`date`)
);
--> statement-breakpoint
CREATE INDEX `location_date_idx` ON `events` (`locationId`,`eventDate`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `forecasts` (`forecastDate`);--> statement-breakpoint
CREATE INDEX `restaurant_idx` ON `ingredients` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `sales_data_idx` ON `item_sales` (`salesDataId`);--> statement-breakpoint
CREATE INDEX `restaurant_idx` ON `locations` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `location_idx` ON `pos_integrations` (`locationId`);--> statement-breakpoint
CREATE INDEX `prep_plan_idx` ON `prep_plan_items` (`prepPlanId`);--> statement-breakpoint
CREATE INDEX `recipe_idx` ON `recipe_ingredients` (`recipeId`);--> statement-breakpoint
CREATE INDEX `ingredient_idx` ON `recipe_ingredients` (`ingredientId`);--> statement-breakpoint
CREATE INDEX `restaurant_idx` ON `recipes` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `restaurant_idx` ON `reports` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `reports` (`createdAt`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `sales_data` (`date`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `weather_data` (`date`);