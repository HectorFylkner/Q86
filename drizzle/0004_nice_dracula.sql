CREATE TABLE `lesson_example_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subtopic` text NOT NULL,
	`example_n` integer NOT NULL,
	`strategy` text NOT NULL,
	`answer` text NOT NULL,
	`correct` integer,
	`time_seconds` real NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `lesson_example_idx` ON `lesson_example_attempts` (`subtopic`,`example_n`);