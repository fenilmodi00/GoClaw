CREATE TABLE `deployments` (
	`id` text PRIMARY KEY NOT NULL,
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
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `stripe_session_idx` ON `deployments` (`stripe_session_id`);--> statement-breakpoint
CREATE INDEX `id_idx` ON `deployments` (`id`);