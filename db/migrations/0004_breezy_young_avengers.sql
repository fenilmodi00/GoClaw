ALTER TABLE `users` ADD `clerk_user_id` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_clerk_user_id_unique` ON `users` (`clerk_user_id`);--> statement-breakpoint
CREATE INDEX `clerk_user_idx` ON `users` (`clerk_user_id`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `password_hash`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `llm_quota`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `llm_usage`;