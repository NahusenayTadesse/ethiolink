// Creates the first administrator for the dashboard, so the office never sees the first-run form.
//
//   ADMIN_PASSWORD='…' node --env-file=.env scripts/seed-admin.mjs
//
// ADMIN_EMAIL (admin@ethiolink.net) and ADMIN_NAME (EthioLink Admin) can be set the same way.
// Without ADMIN_PASSWORD a strong one is generated and printed once. Leaves an existing account
// alone unless --reset is passed, which sets the new password and ends that account's sessions.
//
// The Administrator role is created if the app has not run yet; the app gives it every permission
// on its first request (`syncAccessTables` in src/lib/server/permissions.ts).
import crypto from 'node:crypto';
import mysql from 'mysql2/promise';
import { hashPassword } from 'better-auth/crypto';

const email = (process.env.ADMIN_EMAIL || 'admin@ethiolink.net').trim().toLowerCase();
const name = process.env.ADMIN_NAME || 'EthioLink Admin';
const reset = process.argv.includes('--reset');

function generate() {
	const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	const pick = (set) => set[crypto.randomInt(set.length)];
	return pick(chars.slice(0, 48)) + Array.from({ length: 18 }, () => pick(chars + '-_.!#%+=')).join('') + pick('23456789');
}

const generated = !process.env.ADMIN_PASSWORD;
const password = process.env.ADMIN_PASSWORD || generate();
if (password.length < 10) {
	console.error('ADMIN_PASSWORD must be at least 10 characters.');
	process.exit(1);
}

const db = await mysql.createConnection(process.env.DATABASE_URL);
try {
	await db.query(
		"INSERT IGNORE INTO roles (name, description) VALUES ('Administrator', 'Everything, including staff accounts and roles')"
	);
	const [[role]] = await db.query("SELECT id FROM roles WHERE name = 'Administrator'");
	// If the app has run, the permissions exist: grant them all now rather than at the next boot.
	await db.query(
		'INSERT IGNORE INTO role_permissions (role_id, permission_id) SELECT ?, id FROM permissions',
		[role.id]
	);

	const hash = await hashPassword(password);
	const [[existing]] = await db.query('SELECT id FROM user WHERE email = ?', [email]);

	if (existing && !reset) {
		console.log(`${email} already exists: left alone. Pass --reset to set a new password.`);
	} else if (existing) {
		await db.query(
			"UPDATE account SET password = ?, updated_at = NOW(3) WHERE user_id = ? AND provider_id = 'credential'",
			[hash, existing.id]
		);
		await db.query(
			'UPDATE user SET role_id = ?, is_active = true, must_change_password = false WHERE id = ?',
			[role.id, existing.id]
		);
		await db.query('DELETE FROM session WHERE user_id = ?', [existing.id]);
		console.log(`${email}: password reset, Administrator role, signed out everywhere.`);
	} else {
		const id = crypto.randomUUID();
		await db.beginTransaction();
		await db.query(
			'INSERT INTO user (id, name, email, email_verified, role_id, is_active, must_change_password) VALUES (?, ?, ?, true, ?, true, false)',
			[id, name, email, role.id]
		);
		await db.query(
			"INSERT INTO account (id, account_id, provider_id, user_id, password, updated_at) VALUES (?, ?, 'credential', ?, ?, NOW(3))",
			[crypto.randomUUID(), id, id, hash]
		);
		await db.commit();
		console.log(`${email}: created as Administrator.`);
	}
	if (generated && (!existing || reset)) console.log(`Password (shown once): ${password}`);
} finally {
	await db.end();
}
