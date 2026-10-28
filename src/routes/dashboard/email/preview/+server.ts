import { error, text } from '@sveltejs/kit';
import { isLocale } from '$lib/paraglide/runtime';
import { LOGO_ATTACHMENT } from '$lib/server/email/template';
import { cleanBody, composedEmail } from '../compose.server';
import type { RequestHandler } from './$types';

/** The email as it will arrive, for the preview on /dashboard/email. Nothing is sent. */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401);
	const input = (await request.json().catch(() => null)) as {
		subject?: string;
		body?: string;
		locale?: string;
	} | null;
	if (!input) error(400);

	const html = await composedEmail({
		body: cleanBody(String(input.body ?? '').slice(0, 100_000)),
		subject: String(input.subject ?? '').slice(0, 200),
		locale: isLocale(input.locale) ? input.locale : 'en',
		writer: locals.user.name
	});
	// In a mail client the logo is an attachment; here it is inlined.
	return text(html.replace(`cid:${LOGO_ATTACHMENT.cid}`, LOGO_ATTACHMENT.path), {
		headers: { 'content-type': 'text/html; charset=utf-8' }
	});
};
