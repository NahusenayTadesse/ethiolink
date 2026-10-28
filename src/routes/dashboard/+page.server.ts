import { and, count, desc, eq, gte, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { contactMessage, jobApplication, quoteRequest } from '$lib/server/db/schema';
import { hasPermission } from '@nahu/admin-kit/server/permissions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Each part shows only to roles that can open the page it summarises.
	const can = {
		quotes: hasPermission(locals, 'quotes.manage'),
		messages: hasPermission(locals, 'messages.manage'),
		careers: hasPermission(locals, 'careers.manage')
	};
	const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

	const [
		[{ unread }],
		[{ month }],
		[{ openQuotes }],
		[{ newQuotes }],
		[{ won }],
		[{ applicants }],
		latest,
		quotes
	] = await Promise.all([
		db.select({ unread: count() }).from(contactMessage).where(eq(contactMessage.status, 'new')),
		db
			.select({ month: count() })
			.from(contactMessage)
			.where(gte(contactMessage.createdAt, monthAgo)),
		db
			.select({ openQuotes: count() })
			.from(quoteRequest)
			.where(inArray(quoteRequest.status, ['new', 'review', 'quoted'])),
		db.select({ newQuotes: count() }).from(quoteRequest).where(eq(quoteRequest.status, 'new')),
		db
			.select({ won: count() })
			.from(quoteRequest)
			.where(and(eq(quoteRequest.status, 'won'), gte(quoteRequest.updatedAt, monthAgo))),
		db.select({ applicants: count() }).from(jobApplication).where(eq(jobApplication.status, 'new')),
		db
			.select({
				id: contactMessage.id,
				createdAt: contactMessage.createdAt,
				name: contactMessage.name,
				company: contactMessage.company,
				email: contactMessage.email,
				phone: contactMessage.phone,
				service: contactMessage.service,
				message: contactMessage.message,
				locale: contactMessage.locale,
				status: contactMessage.status
			})
			.from(contactMessage)
			.orderBy(desc(contactMessage.createdAt), desc(contactMessage.id))
			.limit(5),
		db
			.select({
				id: quoteRequest.id,
				createdAt: quoteRequest.createdAt,
				name: quoteRequest.name,
				company: quoteRequest.company,
				service: quoteRequest.service,
				mode: quoteRequest.mode,
				origin: quoteRequest.origin,
				destination: quoteRequest.destination,
				status: quoteRequest.status,
				amount: quoteRequest.amount,
				currency: quoteRequest.currency
			})
			.from(quoteRequest)
			.orderBy(desc(quoteRequest.createdAt), desc(quoteRequest.id))
			.limit(5)
	]);

	return {
		can,
		counts: {
			unread: can.messages ? unread : 0,
			month: can.messages ? month : 0,
			openQuotes: can.quotes ? openQuotes : 0,
			newQuotes: can.quotes ? newQuotes : 0,
			won: can.quotes ? won : 0,
			applicants: can.careers ? applicants : 0
		},
		latest: can.messages ? latest : [],
		quotes: can.quotes ? quotes : []
	};
};
