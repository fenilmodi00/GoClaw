DROP INDEX "deployments_claw_api_key_unique";--> statement-breakpoint
DROP INDEX "stripe_session_idx";--> statement-breakpoint
DROP INDEX "id_idx";--> statement-breakpoint
DROP INDEX "user_id_idx";--> statement-breakpoint
DROP INDEX "llm_usage_user_idx";--> statement-breakpoint
DROP INDEX "llm_usage_timestamp_idx";--> statement-breakpoint
DROP INDEX "users_clerk_user_id_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "users_polar_customer_id_unique";--> statement-breakpoint
DROP INDEX "clerk_user_idx";--> statement-breakpoint
DROP INDEX "email_idx";--> statement-breakpoint
DROP INDEX "polar_customer_idx";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "tier" TO "tier" text DEFAULT 'starter';--> statement-breakpoint
CREATE UNIQUE INDEX `deployments_claw_api_key_unique` ON `deployments` (`claw_api_key`);--> statement-breakpoint
CREATE INDEX `stripe_session_idx` ON `deployments` (`stripe_session_id`);--> statement-breakpoint
CREATE INDEX `id_idx` ON `deployments` (`id`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `deployments` (`user_id`);--> statement-breakpoint
CREATE INDEX `llm_usage_user_idx` ON `llm_usage_log` (`user_id`);--> statement-breakpoint
CREATE INDEX `llm_usage_timestamp_idx` ON `llm_usage_log` (`timestamp`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_clerk_user_id_unique` ON `users` (`clerk_user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_polar_customer_id_unique` ON `users` (`polar_customer_id`);--> statement-breakpoint
CREATE INDEX `clerk_user_idx` ON `users` (`clerk_user_id`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `polar_customer_idx` ON `users` (`polar_customer_id`);--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "subscription_status" TO "subscription_status" text DEFAULT 'active';