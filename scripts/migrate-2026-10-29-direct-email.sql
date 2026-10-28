-- Lets /dashboard/email log emails that answer no message, quote or application.
-- Run once on a database created before 2026-10-29 (drizzle-kit push fails on this MariaDB):
--   mysql ethiolink < scripts/migrate-2026-10-29-direct-email.sql
-- Safe to run twice.
ALTER TABLE email_reply
	MODIFY kind ENUM('message', 'quote', 'application', 'direct') NOT NULL,
	MODIFY record_id INT NULL;
