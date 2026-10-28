import { sanitizeRichHtml } from '@nahu/admin-kit/server/richText';
import type { Locale } from '$lib/paraglide/runtime';
import logo from './logo.png?inline';

/**
 * The look every email the company sends shares: the white-on-ink logo, an ember rule, a white
 * card on the brand's sand, and a footer with the office's details. Mail clients are not
 * browsers — Outlook lays out with Word, Gmail strips <style> in places — so the layout is tables
 * and every style is inline. The brand fonts load where the client allows (Apple Mail, iOS) and
 * fall back to the system's.
 */

export const BRAND = {
	ink: '#060c18',
	ink3: '#13203a',
	ember: '#ff7a45',
	emberDeep: '#e4572e',
	sand: '#f3ece1',
	paper: '#fbf8f3',
	stone: '#5d6578',
	mist: '#9fabc2',
	line: '#ece4d7'
};

const TEXT_FONT =
	"Inter,'Segoe UI','Noto Sans Ethiopic',Nyala,'IBM Plex Sans Arabic','Noto Sans SC','Microsoft YaHei',Helvetica,Arial,sans-serif";
const DISPLAY_FONT =
	"'Barlow Condensed','Arial Narrow','Noto Sans Ethiopic',Nyala,'IBM Plex Sans Arabic','Noto Sans SC','Microsoft YaHei',Helvetica,Arial,sans-serif";
const ACCENT_FONT = "'Instrument Serif','Noto Serif Ethiopic',Georgia,'Times New Roman',serif";

/** The logo travels inside the email (a CID attachment): it shows without a public URL, and in
 *  clients that block remote images until asked. */
const LOGO_CID = 'logo@ethiolink';
export const LOGO_ATTACHMENT = { filename: 'ethiolink.png', path: logo, cid: LOGO_CID };

export const escapeHtml = (value: unknown) =>
	String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');

const isRtl = (locale: Locale) => locale === 'ar';
const start = (locale: Locale) => (isRtl(locale) ? 'right' : 'left');
const end = (locale: Locale) => (isRtl(locale) ? 'left' : 'right');

export type Footer = {
	company: string;
	address?: string | null;
	phone?: string | null;
	email?: string | null;
	hours?: string[];
	links?: { label: string; href: string }[];
	/** Why the reader got this email, in small print. */
	note?: string;
};

/**
 * A whole email. `preheader` is the line inboxes show after the subject; `tagline` sits beside the
 * logo; `body` is HTML built from the blocks below.
 */
export function layout(input: {
	locale: Locale;
	subject: string;
	preheader?: string;
	tagline?: string;
	body: string;
	footer?: Footer;
}) {
	const { locale } = input;
	const dir = isRtl(locale) ? 'rtl' : 'ltr';
	const a = start(locale);
	const year = new Date().getFullYear();
	const f = input.footer;

	const contactLine = f
		? [
				f.phone &&
					`<a href="tel:${escapeHtml(f.phone.replace(/[^\d+]/g, ''))}" style="color:${BRAND.ink};text-decoration:none;font-weight:600" dir="ltr">${escapeHtml(f.phone)}</a>`,
				f.email &&
					`<a href="mailto:${escapeHtml(f.email)}" style="color:${BRAND.emberDeep};text-decoration:none;font-weight:600">${escapeHtml(f.email)}</a>`
			]
				.filter(Boolean)
				.join(`<span style="color:${BRAND.mist}">&nbsp;&nbsp;·&nbsp;&nbsp;</span>`)
		: '';

	const footer = f
		? `<tr><td style="background:${BRAND.paper};padding:28px 36px 30px;border-top:1px solid ${BRAND.line};text-align:${a}">
<p style="margin:0 0 6px;font-family:${DISPLAY_FONT};font-size:17px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:${BRAND.ink}">${escapeHtml(f.company)}</p>
${f.address ? `<p style="margin:0 0 4px;font-size:13px;color:${BRAND.stone}">${escapeHtml(f.address)}</p>` : ''}
${f.hours?.length ? `<p style="margin:0 0 10px;font-size:13px;color:${BRAND.stone}">${f.hours.map(escapeHtml).join('<br>')}</p>` : ''}
${contactLine ? `<p style="margin:0 0 12px;font-size:14px">${contactLine}</p>` : ''}
${
	f.links?.length
		? `<p style="margin:0;font-size:13px">${f.links
				.map(
					(l) =>
						`<a href="${escapeHtml(l.href)}" style="color:${BRAND.stone};text-decoration:underline">${escapeHtml(l.label)}</a>`
				)
				.join(`<span style="color:${BRAND.mist}">&nbsp;&nbsp;|&nbsp;&nbsp;</span>`)}</p>`
		: ''
}
${f.note ? `<p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:${BRAND.mist}">${escapeHtml(f.note)}</p>` : ''}
</td></tr>`
		: '';

	return `<!doctype html>
<html lang="${locale}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(input.subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Inter:wght@400;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
@media (max-width:620px){.card{border-radius:0!important}.pad{padding-left:22px!important;padding-right:22px!important}.stack{display:none!important}}
a{color:${BRAND.emberDeep}}
</style>
</head>
<body style="margin:0;padding:0;background:${BRAND.sand};-webkit-text-size-adjust:100%">
${
	input.preheader
		? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(input.preheader)}${'&#8199;&#65279;&#847; '.repeat(40)}</div>`
		: ''
}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.sand}" dir="${dir}">
<tr><td align="center" style="padding:32px 12px">
<table role="presentation" class="card" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;font-family:${TEXT_FONT};font-size:15px;line-height:1.65;color:${BRAND.ink}">
<tr><td class="pad" style="background:${BRAND.ink};padding:26px 36px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="text-align:${a};vertical-align:middle"><img src="cid:${LOGO_CID}" width="101" height="80" alt="EthioLink" style="display:block;border:0;width:101px;height:80px;color:#ffffff;font-family:${DISPLAY_FONT};font-size:26px;font-weight:700"></td>
${
	input.tagline
		? `<td class="stack" style="text-align:${end(locale)};vertical-align:middle;font-family:${ACCENT_FONT};font-style:italic;font-size:17px;line-height:1.3;color:${BRAND.mist}">${escapeHtml(input.tagline)}</td>`
		: ''
}
</tr></table>
</td></tr>
<tr><td style="height:4px;line-height:4px;font-size:0;background:${BRAND.ember}">&nbsp;</td></tr>
<tr><td class="pad" style="padding:38px 36px 34px;text-align:${a}">
${input.body}
</td></tr>
${footer}
</table>
<p style="margin:18px 0 0;font-family:${TEXT_FONT};font-size:12px;color:${BRAND.stone}">© ${year} ${escapeHtml(f?.company ?? 'EthioLink')}</p>
</td></tr>
</table>
</body>
</html>`;
}

/* ——— Blocks for the body ——— */

/** The small capitals above a heading: "MESSAGE RECEIVED". */
export const eyebrow = (text: string) =>
	`<p style="margin:0 0 10px;font-family:${DISPLAY_FONT};font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${BRAND.emberDeep}">${escapeHtml(text)}</p>`;

export const heading = (text: string) =>
	`<h1 style="margin:0 0 18px;font-family:${DISPLAY_FONT};font-size:32px;line-height:1.1;font-weight:700;color:${BRAND.ink}">${escapeHtml(text)}</h1>`;

/** Plain text as paragraphs: blank lines split them, single line breaks stay. */
export const paragraphs = (text: string) =>
	text
		.trim()
		.split(/\n\s*\n/)
		.map((p) => `<p style="margin:0 0 16px">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
		.join('');

/** A sand panel with an ember edge, for what the reader sent us. */
export function panel(locale: Locale, title: string, rows: [string, string][], quote?: string) {
	const edge = isRtl(locale) ? 'border-right' : 'border-left';
	return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 26px"><tr><td style="background:${BRAND.paper};${edge}:4px solid ${BRAND.ember};border-radius:10px;padding:20px 22px">
<p style="margin:0 0 12px;font-family:${DISPLAY_FONT};font-size:13px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${BRAND.stone}">${escapeHtml(title)}</p>
${rows
	.map(
		([k, v]) =>
			`<p style="margin:0 0 6px;font-size:14px"><span style="color:${BRAND.stone}">${escapeHtml(k)}:</span> <strong style="color:${BRAND.ink}">${escapeHtml(v)}</strong></p>`
	)
	.join('')}
${quote ? `<p style="margin:${rows.length ? '12px' : '0'} 0 0;font-size:14px;line-height:1.6;color:${BRAND.ink3};white-space:pre-line">${escapeHtml(quote)}</p>` : ''}
</td></tr></table>`;
}

/** Buttons that hold up in Outlook: a table cell with the colour, the link inside it. */
export function buttons(list: { label: string; href: string; style?: 'solid' | 'outline' }[]) {
	if (!list.length) return '';
	const cells = list
		.map(({ label, href, style = 'solid' }) => {
			const solid = style === 'solid';
			return `<td style="padding:0 10px 10px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-radius:999px;background:${solid ? BRAND.ember : '#ffffff'};border:2px solid ${solid ? BRAND.ember : BRAND.ink}"><a href="${escapeHtml(href)}" style="display:inline-block;padding:11px 24px;font-family:${DISPLAY_FONT};font-size:16px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:${solid ? '#ffffff' : BRAND.ink};text-decoration:none">${escapeHtml(label)}</a></td></tr></table></td>`;
		})
		.join('');
	return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 20px"><tr>${cells}</tr></table>`;
}

/** "Kind regards," and who it is from, with an ember rule above. */
export const signOff = (closing: string, from: string, role?: string) =>
	`<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 0"><tr><td style="width:40px;height:3px;line-height:3px;font-size:0;background:${BRAND.ember}">&nbsp;</td></tr></table>
<p style="margin:16px 0 0">${escapeHtml(closing)}<br><strong style="font-size:16px">${escapeHtml(from)}</strong>${
		role ? `<br><span style="font-size:13px;color:${BRAND.stone}">${escapeHtml(role)}</span>` : ''
	}</p>`;

/* ——— Rich text from the dashboard editor ——— */

const RICH_STYLES: Record<string, string> = {
	p: 'margin:0 0 16px',
	h2: `margin:26px 0 12px;font-family:${DISPLAY_FONT};font-size:24px;line-height:1.2;font-weight:700;color:${BRAND.ink}`,
	h3: `margin:22px 0 10px;font-family:${DISPLAY_FONT};font-size:19px;line-height:1.25;font-weight:700;color:${BRAND.ink}`,
	ul: 'margin:0 0 16px;padding:0 0 0 22px',
	ol: 'margin:0 0 16px;padding:0 0 0 22px',
	li: 'margin:0 0 6px',
	blockquote: `margin:0 0 18px;padding:14px 18px;border-left:4px solid ${BRAND.ember};background:${BRAND.paper};border-radius:8px;color:${BRAND.ink3}`,
	a: `color:${BRAND.emberDeep};text-decoration:underline;font-weight:600`,
	hr: `border:0;border-top:1px solid ${BRAND.line};margin:26px 0`,
	pre: `margin:0 0 16px;padding:14px;background:${BRAND.sand};border-radius:8px;font-family:Consolas,Menlo,monospace;font-size:13px;white-space:pre-wrap`,
	code: `font-family:Consolas,Menlo,monospace;font-size:13px;background:${BRAND.sand};padding:1px 5px;border-radius:4px`,
	img: 'display:block;max-width:100%;height:auto;border:0;border-radius:8px;margin:0 0 16px',
	strong: `color:${BRAND.ink}`
};

/**
 * HTML from the rich editor, made safe and made to look right in a mail client: the sanitiser's
 * allowlist first (it adds no `style`, so one can be put on each tag), then the brand's styles
 * inline. Site paths in links become full addresses; only https images are kept.
 */
export function richEmailHtml(html: string, locale: Locale, origin: string) {
	const clean = sanitizeRichHtml(html, { imageSrc: (src) => /^https:\/\//i.test(src) });
	const rtl = isRtl(locale);
	return (
		clean
			// The editor wraps a list item's or a quote's text in <p>; its margin would open gaps
			// between bullets and under a quote, so paragraphs there become line breaks.
			.replace(/<li>\s*<p>((?:(?!<\/?p>)[\s\S])*?)<\/p>(?=\s*(?:<\/li>|<ul|<ol))/g, '<li>$1')
			.replace(/<blockquote>\s*<p>/g, '<blockquote>')
			.replace(/<\/p>\s*<\/blockquote>/g, '</blockquote>')
			.replace(
				/<blockquote>((?:(?!<\/?blockquote)[\s\S])*?)<\/blockquote>/g,
				(_, inner: string) =>
					`<blockquote>${inner.replace(/<\/p>\s*<p>/g, '<br><br>')}</blockquote>`
			)
			.replace(/<(\w+)(?=[\s>/])/g, (tag, name: string) => {
				let style = RICH_STYLES[name.toLowerCase()];
				if (!style) return tag;
				if (rtl)
					style = style
						.replace('padding:0 0 0 22px', 'padding:0 22px 0 0')
						.replace('border-left', 'border-right');
				return `${tag} style="${style}"`;
			})
			.replace(/href="\/(?!\/)/g, `href="${origin.replace(/\/$/, '')}/`)
	);
}

/** The plain-text part sent beside the HTML, which spam filters and text-only readers want. */
export function htmlToPlain(html: string) {
	return html
		.replace(/<(style|title|head)[\s\S]*?<\/\1>/gi, '')
		.replace(/<div style="display:none[\s\S]*?<\/div>/i, '')
		.replace(
			/<a [^>]*href="(https?:[^"]+|mailto:[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
			(_, href, text) => {
				const label = text.replace(/<[^>]+>/g, '').trim();
				const target = href.replace(/^mailto:/, '');
				return label === target ? label : `${label} (${target})`;
			}
		)
		.replace(/<li[^>]*>/gi, '\n• ')
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/(p|h1|h2|h3|tr|blockquote|ul|ol|pre)>/gi, '\n\n')
		.replace(/<[^>]+>/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&amp;/g, '&')
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}
