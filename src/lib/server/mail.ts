import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';
import { m } from '$lib/paraglide/messages.js';
import { isLocale, localizeHref, type Locale } from '$lib/paraglide/runtime';
import { contactDetails } from '$lib/server/content';
import {
	LOGO_ATTACHMENT,
	buttons,
	escapeHtml,
	eyebrow,
	heading,
	htmlToPlain,
	layout,
	panel,
	paragraphs,
	signOff,
	type Footer
} from '$lib/server/email/template';

export { escapeHtml } from '$lib/server/email/template';

/**
 * Email: staff notifications, the confirmation a visitor gets after writing in, and emails sent
 * from the dashboard. Optional: with no SMTP settings in the environment nothing is sent and
 * everything still arrives in the dashboard, so a missing mailbox never breaks a public form.
 *
 * SMTP_HOST, SMTP_PORT (465), SMTP_USER, SMTP_PASSWORD, and CONTACT_NOTIFY_TO — one or more
 * comma-separated addresses; defaults to SMTP_USER. SMTP_HOST must be a name the mail server's
 * certificate covers: on shared hosting that is the server's own name, not mail.<domain>.
 */
function transport() {
	if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) return null;
	const port = Number(env.SMTP_PORT || 465);
	return nodemailer.createTransport({
		host: env.SMTP_HOST,
		port,
		secure: port === 465,
		auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
	});
}

/** Whether the server can send email at all — the dashboard says so when it cannot. */
export const mailConfigured = () => Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);

/** The public site's address, for links in an email: the page that sent it is not at hand. */
export const siteOrigin = () => (env.ORIGIN || 'https://ethiolink.net').replace(/\/$/, '');

const asLocale = (value: string): Locale => (isLocale(value) ? value : 'en');

/** Sends one email. The logo rides along as an inline image, and a plain-text copy is derived. */
export async function sendEmail(mail: {
	to: string;
	subject: string;
	html: string;
	replyTo?: string;
}) {
	const mailer = transport();
	if (!mailer) return false;
	await mailer.sendMail({
		from: `"EthioLink" <${env.SMTP_USER}>`,
		...mail,
		text: htmlToPlain(mail.html),
		attachments: [LOGO_ATTACHMENT]
	});
	return true;
}

/** The office's details in the reader's language, for an email's footer. */
export async function emailFooter(locale: Locale, note?: string): Promise<Footer> {
	const contact = await contactDetails(locale);
	const origin = siteOrigin();
	const links = [
		{ label: origin.replace(/^https?:\/\//, ''), href: origin + localizeHref('/', { locale }) },
		contact.whatsapp && { label: 'WhatsApp', href: `https://wa.me/${contact.whatsapp}` },
		contact.telegram && { label: 'Telegram', href: `https://t.me/${contact.telegram}` },
		contact.social.linkedin && { label: 'LinkedIn', href: contact.social.linkedin },
		contact.social.facebook && { label: 'Facebook', href: contact.social.facebook },
		contact.social.instagram && { label: 'Instagram', href: contact.social.instagram }
	].filter((l): l is { label: string; href: string } => Boolean(l));
	return {
		company: m.company_name({}, { locale }),
		address: contact.address,
		phone: contact.phone,
		email: contact.email,
		hours: contact.hours,
		links,
		note
	};
}

const tagline = (locale: Locale) =>
	`${m.hero_title_a({}, { locale })} ${m.hero_title_b({}, { locale })}`;

/** A staff notification, in English: what came in, its details, what they wrote, and a link to it. */
export function staffNotice(
	title: string,
	rows: [string, unknown][],
	text: string | null,
	link: string
) {
	return `${eyebrow('Website')}${heading(title)}${panel(
		'en',
		'Details',
		rows.map(([k, v]) => [k, String(v ?? '—')]),
		text ?? undefined
	)}${buttons([{ label: 'Open in the dashboard', href: link }])}`;
}

export async function notifyStaff(subject: string, body: string, replyTo?: string) {
	return sendEmail({
		to: env.CONTACT_NOTIFY_TO || env.SMTP_USER || '',
		subject,
		html: layout({
			locale: 'en',
			subject,
			preheader: subject,
			body,
			footer: { company: m.company_name({}, { locale: 'en' }), note: 'Sent by the website.' }
		}),
		replyTo
	});
}

type Confirmation = 'message' | 'quote' | 'application';

/**
 * Tells a visitor, in the language they wrote in, that what they sent has arrived — the old site
 * claimed that and sent nothing. `summary` repeats what they sent, so the email is a receipt.
 * Never throws: a failed confirmation must not fail the form.
 */
export async function confirmToVisitor(input: {
	kind: Confirmation;
	to: string;
	name: string;
	locale: string;
	/** A quote number, or the job title applied for. */
	reference?: string;
	summary?: { rows: [string, string][]; text?: string };
}) {
	const locale = asLocale(input.locale);
	const o = { locale };
	const reference = input.reference ?? '';
	const copy = {
		message: {
			subject: m.email_subject_message({}, o),
			eyebrow: m.email_eyebrow_message({}, o),
			text: m.email_confirm_message({}, o)
		},
		quote: {
			subject: m.email_subject_quote({ reference }, o),
			eyebrow: m.email_eyebrow_quote({}, o),
			text: m.email_confirm_quote({ reference }, o)
		},
		application: {
			subject: m.email_subject_application({}, o),
			eyebrow: m.email_eyebrow_application({}, o),
			text: m.email_confirm_application({ job: reference }, o)
		}
	}[input.kind];

	try {
		const origin = siteOrigin();
		const contact = await contactDetails(locale);
		const actions: Parameters<typeof buttons>[0] = [];
		if (input.kind === 'message') {
			actions.push({ label: m.email_cta_quote({}, o), href: origin + localizeHref('/quote', o) });
		}
		if (contact.whatsapp) {
			actions.push({
				label: m.email_cta_whatsapp({}, o),
				href: `https://wa.me/${contact.whatsapp}`,
				style: 'outline'
			});
		}

		const body = [
			eyebrow(copy.eyebrow),
			heading(m.email_thanks_heading({ name: input.name.split(/\s+/)[0] }, o)),
			paragraphs(copy.text),
			input.summary
				? panel(locale, m.email_your_message({}, o), input.summary.rows, input.summary.text)
				: '',
			actions.length
				? `<p style="margin:0 0 12px">${escapeHtml(m.email_meanwhile({}, o))}</p>`
				: '',
			buttons(actions),
			signOff(m.email_closing({}, o), m.email_team({}, o))
		].join('');

		await sendEmail({
			to: input.to,
			subject: copy.subject,
			html: layout({
				locale,
				subject: copy.subject,
				preheader: copy.text.split('\n')[0],
				tagline: tagline(locale),
				body,
				footer: await emailFooter(locale, m.email_footer_why({}, o))
			})
		});
	} catch (err) {
		console.error(`Could not send the ${input.kind} confirmation`, err);
	}
}

/**
 * An email written in the dashboard — a reply to a record, or a new email — in the company frame
 * and signed with the writer's name. `bodyHtml` is already safe: escaped plain text, or rich text
 * through `richEmailHtml`.
 */
export async function staffEmail(input: {
	bodyHtml: string;
	subject: string;
	writer: string;
	locale: string;
}) {
	const locale = asLocale(input.locale);
	return layout({
		locale,
		subject: input.subject,
		preheader: htmlToPlain(input.bodyHtml).slice(0, 140),
		tagline: tagline(locale),
		body: `${input.bodyHtml}${signOff(m.email_closing({}, { locale }), input.writer, m.company_name({}, { locale }))}`,
		footer: await emailFooter(locale)
	});
}

/** A reply typed as plain text in a record's reply box. */
export const replyEmail = (body: string, writer: string, locale: string, subject = '') =>
	staffEmail({ bodyHtml: paragraphs(body), subject, writer, locale });
