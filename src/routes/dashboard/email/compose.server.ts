import { sanitizeRichHtml } from '@nahu/admin-kit/server/richText';
import { staffEmail, siteOrigin } from '$lib/server/mail';
import { richEmailHtml } from '$lib/server/email/template';
import type { Locale } from '$lib/paraglide/runtime';

/** The editor's HTML as it is kept: the sanitiser's allowlist, https images only. */
export const cleanBody = (html: string) =>
	sanitizeRichHtml(html, { imageSrc: (src) => /^https:\/\//i.test(src) });

/** The finished email for a composed message, shared by sending and the preview. */
export const composedEmail = (input: {
	body: string;
	subject: string;
	locale: Locale;
	writer: string;
}) =>
	staffEmail({
		bodyHtml: richEmailHtml(input.body, input.locale, siteOrigin()),
		subject: input.subject,
		writer: input.writer,
		locale: input.locale
	});
