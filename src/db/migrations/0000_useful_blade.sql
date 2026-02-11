CREATE TABLE `deployments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`model` text NOT NULL,
	`channel` text NOT NULL,
	`channel_token` text NOT NULL,
	`channel_api_key` text,
	`akash_deployment_id` text,
	`akash_lease_id` text,
	`provider_url` text,
	`status` text NOT NULL,
	`payment_provider` text DEFAULT 'stripe' NOT NULL,
	`stripe_session_id` text,
	`stripe_payment_intent_id` text,
	`polar_id` text,
	`error_message` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `stripe_session_idx` ON `deployments` (`stripe_session_id`);--> statement-breakpoint
CREATE INDEX `id_idx` ON `deployments` (`id`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `deployments` (`user_id`);--> statement-breakpoint
CREATE TABLE `llm_usage_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`deployment_id` text,
	`tokens_used` integer NOT NULL,
	`provider` text NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deployment_id`) REFERENCES `deployments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `llm_usage_user_idx` ON `llm_usage_log` (`user_id`);--> statement-breakpoint
CREATE INDEX `llm_usage_timestamp_idx` ON `llm_usage_log` (`timestamp`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`clerk_user_id` text NOT NULL,
	`email` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_clerk_user_id_unique` ON `users` (`clerk_user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `clerk_user_idx` ON `users` (`clerk_user_id`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);