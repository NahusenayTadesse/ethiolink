import { redirect } from '@sveltejs/kit';
import { hasPermission } from '@nahu/admin-kit/server/permissions';
import { and, count, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { contactMessage, quoteRequest } from '$lib/server/db/schema';

export const load = async ({ locals, url }) => {
	if (!locals.user) redirect(302, `/login?next=${encodeURIComponent(url.pathname)}`);

	// For the badges in the top bar, to those who can open what they count.
	const can = {
		messages: hasPermission(locals, 'messages.manage'),
		quotes: hasPermission(locals, 'quotes.manage')
	};
	const [unread, newQuotes] = await Promise.all([
		can.messages
			? db
					.select({ n: count() })
					.from(contactMessage)
					.where(and(eq(contactMessage.status, 'new')))
					.then(([r]) => r.n)
			: 0,
		can.quotes
			? db
					.select({ n: count() })
					.from(quoteRequest)
					.where(eq(quoteRequest.status, 'new'))
					.then(([r]) => r.n)
			: 0
	]);

	return {
		permList: locals.permList,
		isSuperAdmin: locals.isSuperAdmin,
		user: locals.user,
		can,
		unread,
		newQuotes
	};
};
