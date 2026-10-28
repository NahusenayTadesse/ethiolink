/**
 * Staff accounts: listing, adding, editing, switching off and on, resetting passwords.
 *
 * - **Nobody locks the office out.** You cannot switch off your own account or change your own
 *   role, and the last active administrator can neither be switched off nor given another role.
 * - **Switching someone off ends their sessions**, so they are signed out everywhere at once.
 * - **Passwords an administrator sets are temporary**: generated here, shown once, and changed by
 *   the person at their next sign-in.
 */
import crypto from 'node:crypto';
import { and, asc, count, eq, ne, sql } from 'drizzle-orm';
import { WriteRefused } from '@nahu/admin-kit/server/childCrud';
import { db } from '$lib/server/db';
import { roles, session, user } from '$lib/server/db/schema';
import { createAccount, setPassword } from '$lib/server/auth';
import { ADMINISTRATOR } from '$lib/server/roles';

/** When they last signed in: their newest session. */
const lastSignIn =
	sql<Date | null>`(SELECT MAX(s.created_at) FROM session s WHERE s.user_id = ${user.id})`.mapWith(
		(v: Date | string | null) =>
			v instanceof Date ? v : v ? new Date(`${String(v).replace(' ', 'T')}Z`) : null
	);

const columns = {
	id: user.id,
	name: user.name,
	email: user.email,
	isActive: user.isActive,
	mustChangePassword: user.mustChangePassword,
	roleId: user.roleId,
	role: roles.name,
	createdAt: user.createdAt,
	lastSignIn
};

export function listUsers() {
	return db
		.select(columns)
		.from(user)
		.leftJoin(roles, eq(user.roleId, roles.id))
		.orderBy(asc(user.name));
}

export async function findUser(id: string) {
	const [row] = await db
		.select(columns)
		.from(user)
		.leftJoin(roles, eq(user.roleId, roles.id))
		.where(eq(user.id, id));
	return row;
}

export const roleOptions = () =>
	db.select({ value: roles.id, name: roles.name }).from(roles).orderBy(asc(roles.name));

/**
 * A password to hand over in person: 16 characters without the ones that read alike (l/I/1, O/0),
 * so it survives being read out or copied by hand.
 */
export function temporaryPassword() {
	const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	const symbols = '-_.!#%+=';
	const pick = (set: string) => set[crypto.randomInt(set.length)];
	const body = Array.from({ length: 14 }, () => pick(chars + symbols)).join('');
	// A letter first and a digit last, so it never starts or ends with punctuation.
	return pick(chars.slice(0, 48)) + body + pick('23456789');
}

async function administratorRoleId() {
	const [row] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, ADMINISTRATOR));
	return row?.id ?? null;
}

/** Refuses when `userId` is the last active administrator and the change would remove them. */
async function keepOneAdministrator(
	userId: string,
	currentRoleId: number | null,
	field: string | null
) {
	const admin = await administratorRoleId();
	if (!admin || currentRoleId !== admin) return;
	const [{ others }] = await db
		.select({ others: count() })
		.from(user)
		.where(and(eq(user.roleId, admin), eq(user.isActive, true), ne(user.id, userId)));
	if (!others) {
		throw new WriteRefused(
			field,
			'This is the only active administrator. Make someone else an administrator first.'
		);
	}
}

async function emailTaken(email: string, exceptId?: string) {
	const [row] = await db
		.select({ id: user.id })
		.from(user)
		.where(exceptId ? and(eq(user.email, email), ne(user.id, exceptId)) : eq(user.email, email));
	return Boolean(row);
}

/** Creates an account with a temporary password; returns its id and that password, once. */
export async function addUser(input: { name: string; email: string; roleId: number }) {
	const email = input.email.trim().toLowerCase();
	if (await emailTaken(email))
		throw new WriteRefused('email', 'Another account already uses that email.');
	const password = temporaryPassword();
	const id = await createAccount({ ...input, email, password, mustChangePassword: true });
	return { id, email, password };
}

export async function updateUser(
	actorId: string | undefined,
	id: string,
	values: { name: string; email: string; roleId: number }
) {
	const before = await findUser(id);
	if (!before) throw new WriteRefused(null, 'That account no longer exists.');
	if (values.roleId !== before.roleId) {
		if (actorId === id) {
			throw new WriteRefused(
				'roleId',
				'You cannot change your own role. Ask another administrator.'
			);
		}
		await keepOneAdministrator(id, before.roleId, 'roleId');
	}
	const email = values.email.trim().toLowerCase();
	if (await emailTaken(email, id))
		throw new WriteRefused('email', 'Another account already uses that email.');
	await db
		.update(user)
		.set({ name: values.name.trim(), email, roleId: values.roleId })
		.where(eq(user.id, id));
}

export async function setUserActive(actorId: string | undefined, id: string, active: boolean) {
	const before = await findUser(id);
	if (!before) throw new WriteRefused(null, 'That account no longer exists.');
	if (!active) {
		if (actorId === id) throw new WriteRefused(null, 'You cannot switch off your own account.');
		await keepOneAdministrator(id, before.roleId, null);
	}
	await db.transaction(async (tx) => {
		await tx.update(user).set({ isActive: active }).where(eq(user.id, id));
		if (!active) await tx.delete(session).where(eq(session.userId, id));
	});
}

/** A new temporary password: their sessions end, and they choose their own at the next sign-in. */
export async function resetPassword(id: string) {
	const before = await findUser(id);
	if (!before) throw new WriteRefused(null, 'That account no longer exists.');
	const password = temporaryPassword();
	await setPassword(id, password);
	await db.update(user).set({ mustChangePassword: true }).where(eq(user.id, id));
	return { name: before.name, email: before.email, password };
}
