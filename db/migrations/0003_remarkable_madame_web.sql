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
CREATE INDEX `llm_usage_timestamp_idx` ON `llm_usage_log` (`timestamp`);