CREATE TABLE `question_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question_id` integer NOT NULL,
	`content_version` integer NOT NULL,
	`content_hash` text NOT NULL,
	`snapshot` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `question_revisions_version_idx` ON `question_revisions` (`question_id`,`content_version`);--> statement-breakpoint
ALTER TABLE `questions` ADD `uid` text;--> statement-breakpoint
ALTER TABLE `questions` ADD `content_version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `questions_uid_idx` ON `questions` (`uid`);