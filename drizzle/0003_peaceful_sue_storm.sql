CREATE TABLE `lesson_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subtopic` text NOT NULL,
	`kind` text NOT NULL,
	`ordinal` integer NOT NULL,
	`front` text NOT NULL,
	`back` text NOT NULL,
	`ease` real DEFAULT 2.5 NOT NULL,
	`interval_days` integer DEFAULT 0 NOT NULL,
	`reps` integer DEFAULT 0 NOT NULL,
	`lapses` integer DEFAULT 0 NOT NULL,
	`due_at` integer NOT NULL,
	`retired` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `lesson_reviews_due_idx` ON `lesson_reviews` (`retired`,`due_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `lesson_reviews_card_idx` ON `lesson_reviews` (`subtopic`,`kind`,`ordinal`);