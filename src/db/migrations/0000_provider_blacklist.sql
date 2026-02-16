CREATE TABLE IF NOT EXISTS `provider_blacklist` (
	`provider_address` text PRIMARY KEY NOT NULL,
	`reason` text DEFAULT 'Provider blacklisted' NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `blacklist_created_at_idx` ON `provider_blacklist` (`created_at`);