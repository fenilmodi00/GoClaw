PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_deployments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`email` text NOT NULL,
	`telegram_token` text NOT NULL,
	`akash_api_key` text NOT NULL,
	`llm_api_key` text NOT NULL,
	`llm_provider` text NOT NULL,
	`akash_deployment_id` text,
	`akash_lease_id` text,
	`provider_url` text,
	`status` text NOT NULL,
	`stripe_session_id` text NOT NULL,
	`stripe_payment_intent_id` text,
	`error_message` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_deployments`("id", "user_id", "email", "telegram_token", "akash_api_key", "llm_api_key", "llm_provider", "akash_deployment_id", "akash_lease_id", "provider_url", "status", "stripe_session_id", "stripe_payment_intent_id", "error_message", "created_at", "updated_at") SELECT "id", "user_id", "email", "telegram_token", "akash_api_key", "llm_api_key", "llm_provider", "akash_deployment_id", "akash_lease_id", "provider_url", "status", "stripe_session_id", "stripe_payment_intent_id", "error_message", "created_at", "updated_at" FROM `deployments`;--> statement-breakpoint
DROP TABLE `deployments`;--> statement-breakpoint
ALTER TABLE `__new_deployments` RENAME TO `deployments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `stripe_session_idx` ON `deployments` (`stripe_session_id`);--> statement-breakpoint
CREATE INDEX `id_idx` ON `deployments` (`id`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `deployments` (`user_id`);