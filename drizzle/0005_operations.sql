-- M6: operations — metered AI usage and cookieless page counts.
--
-- Both tables are new and neither has a foreign key, so this applies to a
-- populated database without touching a row. `api_usage.user_id` is
-- deliberately unconstrained: deleting an account must not delete the
-- operator's record of what that account cost.

CREATE TABLE `api_usage` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`route` text NOT NULL,
	`month` text NOT NULL,
	`input_tokens` integer DEFAULT 0 NOT NULL,
	`output_tokens` integer DEFAULT 0 NOT NULL,
	`cost_ore` integer DEFAULT 0 NOT NULL,
	`ok` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `api_usage_month_idx` ON `api_usage` (`user_id`,`month`);--> statement-breakpoint
CREATE INDEX `api_usage_recent_idx` ON `api_usage` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `page_views` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`path` text NOT NULL,
	`views` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `page_views_day_idx` ON `page_views` (`day`);