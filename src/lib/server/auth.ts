import { ORIGIN, BETTER_AUTH_SECRET } from '$env/static/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { count, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';

export const auth = betterAuth({
	baseURL: ORIGIN,
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'mysql' }),
	// Staff only: no one signs themselves up. The first account is made on /login while the
	// user table is empty (see `createFirstAdmin`); later ones by an admin.
	emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 10 },
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});

export async function hasUsers() {
	const [{ total }] = await db.select({ total: count() }).from(user);
	return total > 0;
}

/**
 * A staff account with an email and password: no sign-up endpoint exists, so accounts are made
 * here, by an administrator (Admin › Users), first-run setup, or `scripts/seed-admin.mjs`.
 */
export async function createAccount(input: {
	name: string;
	email: string;
	password: string;
	roleId: number | null;
	mustChangePassword?: boolean;
}) {
	const ctx = await auth.$context;
	const created = await ctx.internalAdapter.createUser(
		{ name: input.name.trim(), email: input.email.trim().toLowerCase(), emailVerified: true },
		{ method: 'admin' }
	);
	await ctx.internalAdapter.linkAccount({
		userId: created.id,
		providerId: 'credential',
		accountId: created.id,
		password: await ctx.password.hash(input.password)
	});
	await db
		.update(user)
		.set({ roleId: input.roleId, mustChangePassword: input.mustChangePassword ?? false })
		.where(eq(user.id, created.id));
	return created.id;
}

/**
 * Sets someone's password without the old one (an administrator resetting it), and ends their open
 * sessions so the old password stops working everywhere at once.
 */
export async function setPassword(userId: string, password: string) {
	const ctx = await auth.$context;
	await ctx.internalAdapter.updatePassword(userId, await ctx.password.hash(password));
	await ctx.internalAdapter.deleteUserSessions(userId);
}

/** Creates the very first staff account, as an administrator. Refuses once any account exists. */
export async function createFirstAdmin(input: { name: string; email: string; password: string }) {
	if (await hasUsers()) return false;
	const { administratorRoleId } = await import('$lib/server/permissions');
	await createAccount({ ...input, roleId: await administratorRoleId() });
	return true;
}
