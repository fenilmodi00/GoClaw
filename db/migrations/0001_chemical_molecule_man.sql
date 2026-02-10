CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`akash_user_id` text NOT NULL,
	`akash_api_key` text NOT NULL,
	`plan_type` text NOT NULL,
	`trial_end_time` integer,
	`llm_quota` integer NOT NULL,
	`llm_usage` integer DEFAULT 0 NOT NULL,
	`weekly_cost` real DEFAULT 0 NOT NULL,
	`trial_expired` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);
--> statement-breakpoint
CREATE INDEX `akash_user_idx` ON `users` (`akash_user_id`);
--> statement-breakpoint
ALTER TABLE `deployments` ADD `user_id` text NOT NULL REFERENCES `users`(`id`);
--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `deployments` (`user_id`);
