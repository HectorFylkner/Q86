--
-- 0002 — multi-tenancy (ADR 0001, ADR 0002).
--
-- Adds the identity tables and gives every user-owned table an owner. The
-- generated form of this migration could not be used as-is: SQLite refuses
-- `ALTER TABLE ... ADD COLUMN x NOT NULL REFERENCES ...` (a NOT NULL column
-- added to an existing table must carry a non-NULL default, and a column
-- with a REFERENCES clause must default to NULL), and the rebuild steps
-- selected a `user_id` that did not exist yet. Every owned table is
-- therefore rebuilt uniformly with an explicit backfill.
--
-- On a populated database all existing rows are assigned to a single
-- legacy owner account, created here only when there is data to own. That
-- account has no password hash, so it cannot be signed into until it is
-- claimed with `pnpm claim-owner`. On a fresh database every INSERT ...
-- SELECT below moves zero rows and no owner is created.
--
-- libSQL runs migrations through `client.migrate()`, which disables
-- foreign-key enforcement for the batch; the PRAGMA pair is kept so the
-- file is also correct under the sqlite3 CLI.
--
PRAGMA foreign_keys=OFF;--> statement-breakpoint

CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`email_verified_at` integer,
	`password_hash` text,
	`name` text,
	`locale` text DEFAULT 'sv' NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint

CREATE TABLE `auth_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `auth_sessions_user_idx` ON `auth_sessions` (`user_id`);--> statement-breakpoint

CREATE TABLE `auth_accounts` (
	`provider` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`provider`, `provider_account_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `auth_accounts_user_idx` ON `auth_accounts` (`user_id`);--> statement-breakpoint

CREATE TABLE `auth_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `auth_tokens_user_idx` ON `auth_tokens` (`user_id`,`kind`);--> statement-breakpoint

CREATE TABLE `app_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint

-- The legacy owner, created only if this database already holds user data.
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `locale`, `role`)
SELECT 'usr_legacy_owner', 'owner@q86.local', NULL, 'Legacy owner', 'sv', 'admin'
WHERE EXISTS (SELECT 1 FROM `sessions`)
   OR EXISTS (SELECT 1 FROM `attempts`)
   OR EXISTS (SELECT 1 FROM `edits`)
   OR EXISTS (SELECT 1 FROM `redo_queue`)
   OR EXISTS (SELECT 1 FROM `pattern_attempts`)
   OR EXISTS (SELECT 1 FROM `elo_ratings`)
   OR EXISTS (SELECT 1 FROM `baseline_reports`)
   OR EXISTS (SELECT 1 FROM `settings`)
   OR EXISTS (SELECT 1 FROM `deck_reviews`)
   OR EXISTS (SELECT 1 FROM `question_flags`);
--> statement-breakpoint

-- Instance-wide keys leave `settings` before it becomes per-account, so no
-- user can read or write the operator's configuration.
INSERT INTO `app_settings` (`key`, `value`)
SELECT `key`, `value` FROM `settings`
WHERE `key` IN ('model', 'seed_progress', 'user_retired_qids');
--> statement-breakpoint

CREATE TABLE `__new_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`mode` text NOT NULL,
	`config` text NOT NULL,
	`started_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`ended_at` integer,
	`summary` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sessions` (`id`,`user_id`,`mode`,`config`,`started_at`,`ended_at`,`summary`)
SELECT `id`,'usr_legacy_owner',`mode`,`config`,`started_at`,`ended_at`,`summary` FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`,`mode`);--> statement-breakpoint

CREATE TABLE `__new_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
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
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_attempts` (`id`,`user_id`,`question_id`,`session_id`,`mode`,`focus`,`selected_index`,`correct`,`time_seconds`,`confidence`,`error_type`,`error_subtag`,`scratch_image_path`,`ai_feedback_md`,`user_notes`,`created_at`)
SELECT `id`,'usr_legacy_owner',`question_id`,`session_id`,`mode`,`focus`,`selected_index`,`correct`,`time_seconds`,`confidence`,`error_type`,`error_subtag`,`scratch_image_path`,`ai_feedback_md`,`user_notes`,`created_at` FROM `attempts`;--> statement-breakpoint
DROP TABLE `attempts`;--> statement-breakpoint
ALTER TABLE `__new_attempts` RENAME TO `attempts`;--> statement-breakpoint
CREATE INDEX `attempts_user_created_idx` ON `attempts` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `attempts_user_question_idx` ON `attempts` (`user_id`,`question_id`);--> statement-breakpoint
CREATE INDEX `attempts_session_idx` ON `attempts` (`session_id`);--> statement-breakpoint

CREATE TABLE `__new_edits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`session_id` integer NOT NULL,
	`question_id` integer NOT NULL,
	`from_index` integer NOT NULL,
	`to_index` integer NOT NULL,
	`from_correct` integer NOT NULL,
	`to_correct` integer NOT NULL,
	`reason` text NOT NULL,
	`justification` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_edits` (`id`,`user_id`,`session_id`,`question_id`,`from_index`,`to_index`,`from_correct`,`to_correct`,`reason`,`justification`,`created_at`)
SELECT `id`,'usr_legacy_owner',`session_id`,`question_id`,`from_index`,`to_index`,`from_correct`,`to_correct`,`reason`,`justification`,`created_at` FROM `edits`;--> statement-breakpoint
DROP TABLE `edits`;--> statement-breakpoint
ALTER TABLE `__new_edits` RENAME TO `edits`;--> statement-breakpoint
CREATE INDEX `edits_user_idx` ON `edits` (`user_id`);--> statement-breakpoint

CREATE TABLE `__new_redo_queue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`question_id` integer NOT NULL,
	`source_attempt_id` integer NOT NULL,
	`stage` integer DEFAULT 0 NOT NULL,
	`due_at` integer NOT NULL,
	`cleared` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_attempt_id`) REFERENCES `attempts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_redo_queue` (`id`,`user_id`,`question_id`,`source_attempt_id`,`stage`,`due_at`,`cleared`)
SELECT `id`,'usr_legacy_owner',`question_id`,`source_attempt_id`,`stage`,`due_at`,`cleared` FROM `redo_queue`;--> statement-breakpoint
DROP TABLE `redo_queue`;--> statement-breakpoint
ALTER TABLE `__new_redo_queue` RENAME TO `redo_queue`;--> statement-breakpoint
CREATE INDEX `redo_due_idx` ON `redo_queue` (`user_id`,`cleared`,`due_at`);--> statement-breakpoint

CREATE TABLE `__new_pattern_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`category` text NOT NULL,
	`prompt_text` text NOT NULL,
	`correct_answer` text NOT NULL,
	`user_answer` text NOT NULL,
	`ms` integer NOT NULL,
	`correct` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_pattern_attempts` (`id`,`user_id`,`category`,`prompt_text`,`correct_answer`,`user_answer`,`ms`,`correct`,`created_at`)
SELECT `id`,'usr_legacy_owner',`category`,`prompt_text`,`correct_answer`,`user_answer`,`ms`,`correct`,`created_at` FROM `pattern_attempts`;--> statement-breakpoint
DROP TABLE `pattern_attempts`;--> statement-breakpoint
ALTER TABLE `__new_pattern_attempts` RENAME TO `pattern_attempts`;--> statement-breakpoint
CREATE INDEX `pattern_category_idx` ON `pattern_attempts` (`user_id`,`category`,`created_at`);--> statement-breakpoint

CREATE TABLE `__new_elo_ratings` (
	`user_id` text NOT NULL,
	`category` text NOT NULL,
	`rating` real DEFAULT 1200 NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`user_id`, `category`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_elo_ratings` (`user_id`,`category`,`rating`,`updated_at`)
SELECT 'usr_legacy_owner',`category`,`rating`,`updated_at` FROM `elo_ratings`;--> statement-breakpoint
DROP TABLE `elo_ratings`;--> statement-breakpoint
ALTER TABLE `__new_elo_ratings` RENAME TO `elo_ratings`;--> statement-breakpoint

CREATE TABLE `__new_baseline_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`raw_text` text NOT NULL,
	`parsed` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_baseline_reports` (`id`,`user_id`,`raw_text`,`parsed`,`created_at`)
SELECT `id`,'usr_legacy_owner',`raw_text`,`parsed`,`created_at` FROM `baseline_reports`;--> statement-breakpoint
DROP TABLE `baseline_reports`;--> statement-breakpoint
ALTER TABLE `__new_baseline_reports` RENAME TO `baseline_reports`;--> statement-breakpoint
CREATE INDEX `baseline_reports_user_idx` ON `baseline_reports` (`user_id`,`created_at`);--> statement-breakpoint

CREATE TABLE `__new_settings` (
	`user_id` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`user_id`, `key`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_settings` (`user_id`,`key`,`value`)
SELECT 'usr_legacy_owner',`key`,`value` FROM `settings`
WHERE `key` NOT IN ('model', 'seed_progress', 'user_retired_qids');--> statement-breakpoint
DROP TABLE `settings`;--> statement-breakpoint
ALTER TABLE `__new_settings` RENAME TO `settings`;--> statement-breakpoint

CREATE TABLE `__new_deck_reviews` (
	`user_id` text NOT NULL,
	`question_id` integer NOT NULL,
	`ease` real DEFAULT 2.5 NOT NULL,
	`interval_days` integer DEFAULT 0 NOT NULL,
	`reps` integer DEFAULT 0 NOT NULL,
	`lapses` integer DEFAULT 0 NOT NULL,
	`due_at` integer NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`user_id`, `question_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_deck_reviews` (`user_id`,`question_id`,`ease`,`interval_days`,`reps`,`lapses`,`due_at`,`updated_at`)
SELECT 'usr_legacy_owner',`question_id`,`ease`,`interval_days`,`reps`,`lapses`,`due_at`,`updated_at` FROM `deck_reviews`;--> statement-breakpoint
DROP TABLE `deck_reviews`;--> statement-breakpoint
ALTER TABLE `__new_deck_reviews` RENAME TO `deck_reviews`;--> statement-breakpoint
CREATE INDEX `deck_reviews_due_idx` ON `deck_reviews` (`user_id`,`due_at`);--> statement-breakpoint

CREATE TABLE `__new_question_flags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`question_id` integer NOT NULL,
	`reason` text NOT NULL,
	`note` text,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_question_flags` (`id`,`user_id`,`question_id`,`reason`,`note`,`status`,`created_at`)
SELECT `id`,'usr_legacy_owner',`question_id`,`reason`,`note`,`status`,`created_at` FROM `question_flags`;--> statement-breakpoint
DROP TABLE `question_flags`;--> statement-breakpoint
ALTER TABLE `__new_question_flags` RENAME TO `question_flags`;--> statement-breakpoint
CREATE INDEX `question_flags_status_idx` ON `question_flags` (`status`,`created_at`);--> statement-breakpoint

PRAGMA foreign_keys=ON;
