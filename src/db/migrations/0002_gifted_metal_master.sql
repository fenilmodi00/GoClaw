ALTER TABLE `users` ADD `tier` text DEFAULT 'free';--> statement-breakpoint
ALTER TABLE `users` ADD `subscription_status` text DEFAULT 'incomplete';