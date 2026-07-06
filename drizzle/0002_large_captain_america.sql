CREATE TABLE `lesson_progress` (
	`subtopic` text PRIMARY KEY NOT NULL,
	`read_at` integer,
	`checklist` text DEFAULT '[]' NOT NULL,
	`checklist_total` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
