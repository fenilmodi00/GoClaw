ALTER TABLE `deployments` ADD `claw_api_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `deployments_claw_api_key_unique` ON `deployments` (`claw_api_key`);--> statement-breakpoint
ALTER TABLE `users` ADD `polar_customer_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_polar_customer_id_unique` ON `users` (`polar_customer_id`);--> statement-breakpoint
CREATE INDEX `polar_customer_idx` ON `users` (`polar_customer_id`);