CREATE TABLE `attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question_id` integer NOT NULL,
	`session_id` integer,
	`mode` text NOT NULL,
	`focus` text DEFAULT 'focused' NOT NULL,
	`selected_index` integer NOT NULL,
	`correct` integer NOT NULL,
	`time_seconds` real NOT NULL,
	`confidence` text NOT NULL,
	`error_type` text,
	`error_subtag` text,
	`scratch_image_path` text,
	`ai_feedback_md` text,
	`user_notes` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `attempts_question_idx` ON `attempts` (`question_id`);--> statement-breakpoint
CREATE INDEX `attempts_session_idx` ON `attempts` (`session_id`);--> statement-breakpoint
CREATE INDEX `attempts_created_idx` ON `attempts` (`created_at`);--> statement-breakpoint
CREATE TABLE `baseline_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`raw_text` text NOT NULL,
	`parsed` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `edits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer NOT NULL,
	`question_id` integer NOT NULL,
	`from_index` integer NOT NULL,
	`to_index` integer NOT NULL,
	`from_correct` integer NOT NULL,
	`to_correct` integer NOT NULL,
	`reason` text NOT NULL,
	`justification` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `elo_ratings` (
	`category` text PRIMARY KEY NOT NULL,
	`rating` real DEFAULT 1200 NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pattern_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text NOT NULL,
	`prompt_text` text NOT NULL,
	`correct_answer` text NOT NULL,
	`user_answer` text NOT NULL,
	`ms` integer NOT NULL,
	`correct` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `pattern_category_idx` ON `pattern_attempts` (`category`,`created_at`);--> statement-breakpoint
CREATE TABLE `questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source` text NOT NULL,
	`format` text NOT NULL,
	`content_domain` text NOT NULL,
	`context` text NOT NULL,
	`fundamental_skill` text NOT NULL,
	`subtopic` text NOT NULL,
	`difficulty` integer NOT NULL,
	`stem_md` text NOT NULL,
	`choices` text NOT NULL,
	`correct_index` integer NOT NULL,
	`solution_md` text NOT NULL,
	`fastest_path_md` text NOT NULL,
	`trap_map` text NOT NULL,
	`numeric_check` text,
	`verified` integer DEFAULT false NOT NULL,
	`twin_of` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `questions_skill_idx` ON `questions` (`fundamental_skill`);--> statement-breakpoint
CREATE INDEX `questions_subtopic_idx` ON `questions` (`subtopic`);--> statement-breakpoint
CREATE INDEX `questions_verified_idx` ON `questions` (`verified`);--> statement-breakpoint
CREATE TABLE `redo_queue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question_id` integer NOT NULL,
	`source_attempt_id` integer NOT NULL,
	`stage` integer DEFAULT 0 NOT NULL,
	`due_at` integer NOT NULL,
	`cleared` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_attempt_id`) REFERENCES `attempts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `redo_due_idx` ON `redo_queue` (`cleared`,`due_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`mode` text NOT NULL,
	`config` text NOT NULL,
	`started_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`ended_at` integer,
	`summary` text
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
