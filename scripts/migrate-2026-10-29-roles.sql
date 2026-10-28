-- Users and roles (/dashboard/admin). Run once on a database created before 2026-10-29,
-- after migrate-2026-10-29-direct-email.sql (drizzle-kit push fails on this MariaDB):
--   mysql ethiolink < scripts/migrate-2026-10-29-roles.sql
-- Safe to run twice. The permission rows and default roles are written by the app on its first
-- request; existing accounts get the Administrator role there too, so nobody is locked out.
CREATE TABLE IF NOT EXISTS `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(80) NOT NULL,
	`description` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_unique` UNIQUE(`name`)
);
CREATE TABLE IF NOT EXISTS `permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(80) NOT NULL,
	`description` varchar(255) NOT NULL DEFAULT '',
	`area` varchar(40) NOT NULL DEFAULT '',
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_name_unique` UNIQUE(`name`)
);
CREATE TABLE IF NOT EXISTS `role_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role_id` int NOT NULL,
	`permission_id` int NOT NULL,
	CONSTRAINT `role_permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `role_permission_idx` UNIQUE(`role_id`,`permission_id`),
	CONSTRAINT `role_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade,
	CONSTRAINT `role_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE cascade
);
ALTER TABLE `user`
	ADD COLUMN IF NOT EXISTS `role_id` int,
	ADD COLUMN IF NOT EXISTS `is_active` boolean NOT NULL DEFAULT true,
	ADD COLUMN IF NOT EXISTS `must_change_password` boolean NOT NULL DEFAULT false;
