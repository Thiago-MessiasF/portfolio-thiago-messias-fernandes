CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`livestreamId` int NOT NULL,
	`userId` int,
	`authorName` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`isModerated` boolean NOT NULL DEFAULT false,
	`moderationReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `churches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`logoUrl` text,
	`bannerUrl` text,
	`primaryColor` varchar(20) DEFAULT '#7C3AED',
	`secondaryColor` varchar(20) DEFAULT '#4C1D95',
	`accentColor` varchar(20) DEFAULT '#DDD6FE',
	`website` text,
	`address` text,
	`city` varchar(100),
	`state` varchar(50),
	`country` varchar(50) DEFAULT 'Brasil',
	`phone` varchar(32),
	`email` varchar(320),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `churches_id` PRIMARY KEY(`id`),
	CONSTRAINT `churches_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `donations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`userId` int,
	`donorName` varchar(255),
	`donorEmail` varchar(320),
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'BRL',
	`method` enum('pix','cartao','boleto','transferencia') NOT NULL DEFAULT 'pix',
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`message` text,
	`isAnonymous` boolean NOT NULL DEFAULT false,
	`transactionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `donations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('culto','celula','conferencia','retiro','oracao','outro') NOT NULL DEFAULT 'culto',
	`startAt` timestamp NOT NULL,
	`endAt` timestamp,
	`location` text,
	`isOnline` boolean NOT NULL DEFAULT false,
	`coverUrl` text,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jitsi_rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`roomId` varchar(255) NOT NULL,
	`description` text,
	`type` enum('reuniao','celula','oracao','estudo','outro') NOT NULL DEFAULT 'reuniao',
	`isActive` boolean NOT NULL DEFAULT true,
	`maxParticipants` int DEFAULT 50,
	`createdBy` int,
	`scheduledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jitsi_rooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `jitsi_rooms_roomId_unique` UNIQUE(`roomId`)
);
--> statement-breakpoint
CREATE TABLE `livestreams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`eventId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`streamUrl` text,
	`thumbnailUrl` text,
	`status` enum('scheduled','live','ended') NOT NULL DEFAULT 'scheduled',
	`viewerCount` int DEFAULT 0,
	`scheduledAt` timestamp,
	`startedAt` timestamp,
	`endedAt` timestamp,
	`preacher` varchar(255),
	`topic` text,
	`aiSummary` text,
	`aiVerses` json,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `livestreams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prayer_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`userId` int,
	`authorName` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`isAnonymous` boolean NOT NULL DEFAULT false,
	`isPublic` boolean NOT NULL DEFAULT true,
	`status` enum('active','answered','archived') NOT NULL DEFAULT 'active',
	`prayerCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prayer_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recordings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`livestreamId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`videoUrl` text,
	`thumbnailUrl` text,
	`duration` int,
	`preacher` varchar(255),
	`topic` text,
	`aiSummary` text,
	`aiVerses` json,
	`viewCount` int DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT true,
	`recordedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recordings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `churchId` int;