import { isHttpError, redirect } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { getTextDirection } from '$lib/paraglide/runtime.js';
import { paraglideMiddleware } from '$lib/paraglide/server.js';
import { configureKit } from '@nahu/admin-kit/server/db';
import { db } from '$lib/server/db';
import { kitHandle } from '@nahu/admin-kit/server/hooks';
import { access } from '$lib/access';
import { session as sessionTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { loadAccess, syncAccessTables } from '$lib/server/permissions';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

/** The permission and role tables, brought in step with `$lib/access` on the first request. */
let accessSync: Promise<void> | undefined;
function syncOnce() {
	if (building) return Promise.resolve();
	accessSync ??= syncAccessTables()
		.then((r) => {
			if (r.permissions) console.log(`[access] added ${r.permissions} permission(s)`);
			if (r.roles) console.log(`[access] created ${r.roles} role(s)`);
		})
		.catch((err: unknown) => {
			// Logged, not fatal: the site should open and say what is wrong rather than not start.
			console.error('[access] sync failed:', err);
			accessSync = undefined;
		});
	return accessSync;
}

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	await syncOnce();
	event.locals.permList = [];
	event.locals.isSuperAdmin = false;
	event.locals.mustChangePassword = false;

	const session = await auth.api.getSession({ headers: event.request.headers });
	if (session) {
		const state = await loadAccess(session.user.id);
		if (state.isActive) {
			event.locals.session = session.session;
			event.locals.user = session.user;
			event.locals.permList = state.permList;
			event.locals.isSuperAdmin = state.isSuperAdmin;
			event.locals.mustChangePassword = state.mustChangePassword;
		} else {
			// Deactivated: their open sessions end here, not when the cookie expires.
			await db.delete(sessionTable).where(eq(sessionTable.userId, session.user.id));
		}
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

configureKit({ db, loginPath: '/login' });

/** The kit's gate: the permissions `handleBetterAuth` loaded decide which /dashboard pages open. */
const handleKit = kitHandle({
	access,
	permissions: (event) => ({
		permList: event.locals.permList,
		isSuperAdmin: event.locals.isSuperAdmin
	})
});

/**
 * The kit refuses with `error(403)` inside `handle`, where SvelteKit can only show its bare error
 * page. A *page* the viewer may not open goes to /dashboard/denied instead, inside the dashboard,
 * which says what is missing. Form posts and endpoints keep the plain 403.
 */
const handleGate: Handle = async (input) => {
	const { event } = input;
	const pageRequest =
		(event.request.method === 'GET' || event.request.method === 'HEAD') &&
		(event.isDataRequest || (event.request.headers.get('accept') ?? '').includes('text/html'));

	// An admin chose this password: nothing else opens until they choose their own.
	if (
		event.locals.mustChangePassword &&
		pageRequest &&
		event.url.pathname.startsWith('/dashboard') &&
		!event.url.pathname.startsWith('/dashboard/change-password')
	) {
		redirect(303, '/dashboard/change-password');
	}

	try {
		return await handleKit(input);
	} catch (err) {
		if (!isHttpError(err) || err.status !== 403 || !pageRequest) throw err;
		redirect(303, `/dashboard/denied?${new URLSearchParams({ from: event.url.pathname })}`);
	}
};

export const handle: Handle = sequence(handleParaglide, handleBetterAuth, handleGate);
