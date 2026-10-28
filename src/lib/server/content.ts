import { and, asc, desc, eq, gte, isNull, or, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	jobOpening,
	newsPost,
	partner,
	serviceSetting,
	siteSettings,
	siteStat,
	teamMember,
	testimonial
} from '$lib/server/db/schema';
import type { Locale } from '$lib/paraglide/runtime';
import { SERVICE_SLUGS, type ServiceSlug } from '$lib/site/services';
import { paragraphs, pick } from '$lib/translated';
import { localToday } from '@nahu/admin-kit/time';

/**
 * What the public site reads from the database, already in the visitor's language — so a page
 * gets only the words it shows, never all four translations.
 */

/** The office details shown before anyone has saved /dashboard/settings. */
const DEFAULT_SETTINGS = {
	email: null,
	phone: null,
	whatsapp: null,
	telegram: null,
	linkedin: null,
	facebook: null,
	instagram: null,
	tiktok: null,
	mapQuery: 'Piassa, Addis Ababa, Ethiopia',
	addressEn: 'Piassa, Addis Ababa, Ethiopia',
	hoursWeekdaysEn: '',
	hoursSaturdayEn: ''
};

/** How to reach the company, for the header, the footer and the contact page. */
export async function contactDetails(locale: Locale) {
	const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
	const s = row ?? DEFAULT_SETTINGS;
	const digits = (value: string | null) => value?.replace(/\D/g, '') || null;
	return {
		email: s.email || null,
		phone: s.phone || null,
		whatsapp: digits(s.whatsapp),
		telegram: s.telegram?.replace(/^@/, '') || null,
		social: {
			linkedin: s.linkedin || null,
			facebook: s.facebook || null,
			instagram: s.instagram || null,
			tiktok: s.tiktok || null
		},
		mapQuery: s.mapQuery,
		address: pick(s, 'address', locale),
		hours: [pick(s, 'hoursWeekdays', locale), pick(s, 'hoursSaturday', locale)].filter(Boolean)
	};
}

export type ContactDetails = Awaited<ReturnType<typeof contactDetails>>;

/**
 * The services the site shows, in staff's order, each with its photo. A slug with no settings
 * row is shown, after the ordered ones, in its place in `SERVICE_SLUGS`.
 */
export async function visibleServices(): Promise<{ slug: ServiceSlug; photo: string | null }[]> {
	const rows = await db.select().from(serviceSetting);
	const bySlug = new Map(rows.map((r) => [r.slug, r]));
	return SERVICE_SLUGS.map((slug, i) => ({ slug, row: bySlug.get(slug), i }))
		.filter(({ row }) => row?.active ?? true)
		.sort((a, b) => (a.row?.sortOrder ?? 1000 + a.i) - (b.row?.sortOrder ?? 1000 + b.i))
		.map(({ slug, row }) => ({ slug, photo: row?.photo ?? null }));
}

export async function stats(locale: Locale) {
	const rows = await db
		.select()
		.from(siteStat)
		.where(eq(siteStat.active, true))
		.orderBy(asc(siteStat.sortOrder), asc(siteStat.id));
	return rows.map((r) => ({ id: r.id, value: r.value, label: pick(r, 'label', locale) }));
}

export async function team(locale: Locale) {
	const rows = await db
		.select()
		.from(teamMember)
		.where(eq(teamMember.active, true))
		.orderBy(asc(teamMember.sortOrder), asc(teamMember.id));
	return rows.map((r) => {
		const name = pick(r, 'name', locale);
		return {
			slug: r.slug,
			photo: r.photo,
			name,
			initials: initials(r.nameEn),
			role: pick(r, 'role', locale),
			summary: pick(r, 'summary', locale),
			bio: paragraphs(pick(r, 'bio', locale))
		};
	});
}

/** "Solomon Alemu" → "SA". From the English name, so the monogram reads the same in every language. */
const initials = (name: string) =>
	name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase())
		.join('');

export async function partners() {
	return db
		.select({ id: partner.id, name: partner.name, logo: partner.logo, url: partner.url })
		.from(partner)
		.where(eq(partner.active, true))
		.orderBy(asc(partner.sortOrder), asc(partner.id));
}

export async function testimonials(locale: Locale) {
	const rows = await db
		.select()
		.from(testimonial)
		.where(eq(testimonial.active, true))
		.orderBy(asc(testimonial.sortOrder), asc(testimonial.id));
	return rows.map((r) => ({
		id: r.id,
		author: r.author,
		position: pick(r, 'position', locale),
		quote: pick(r, 'quote', locale)
	}));
}

// ─────────────────────────────── News ───────────────────────────────

const isPublished = and(eq(newsPost.published, true), sql`${newsPost.publishedAt} <= now()`);

export async function newsList(locale: Locale, limit = 50) {
	const rows = await db
		.select()
		.from(newsPost)
		.where(isPublished)
		.orderBy(desc(newsPost.publishedAt), desc(newsPost.id))
		.limit(limit);
	return rows.map((r) => ({
		slug: r.slug,
		cover: r.cover,
		title: pick(r, 'title', locale),
		excerpt: pick(r, 'excerpt', locale),
		publishedAt: r.publishedAt!
	}));
}

export async function newsArticle(slug: string, locale: Locale) {
	const [r] = await db
		.select()
		.from(newsPost)
		.where(and(eq(newsPost.slug, slug), isPublished));
	if (!r) return null;
	return {
		slug: r.slug,
		cover: r.cover,
		title: pick(r, 'title', locale),
		excerpt: pick(r, 'excerpt', locale),
		body: pick(r, 'body', locale),
		publishedAt: r.publishedAt!,
		updatedAt: r.updatedAt
	};
}

// ─────────────────────────────── Careers ───────────────────────────────

/** Open, and not past its closing day (Addis Ababa's today, not the server's). */
const isOpen = () =>
	and(
		eq(jobOpening.active, true),
		or(isNull(jobOpening.closesOn), gte(jobOpening.closesOn, localToday()))
	);

export async function openJobs(locale: Locale) {
	const rows = await db
		.select()
		.from(jobOpening)
		.where(isOpen())
		.orderBy(desc(jobOpening.createdAt), desc(jobOpening.id));
	return rows.map((r) => ({
		id: r.id,
		slug: r.slug,
		title: pick(r, 'title', locale),
		location: r.location,
		employmentType: r.employmentType,
		closesOn: r.closesOn
	}));
}

export async function openJob(slug: string, locale: Locale) {
	const [r] = await db
		.select()
		.from(jobOpening)
		.where(and(eq(jobOpening.slug, slug), isOpen()));
	if (!r) return null;
	return {
		id: r.id,
		slug: r.slug,
		title: pick(r, 'title', locale),
		description: pick(r, 'description', locale),
		location: r.location,
		employmentType: r.employmentType,
		closesOn: r.closesOn
	};
}

// ─────────────────────────────── Media ───────────────────────────────

/**
 * Whether a stored file is one of the site's public images. The file store also holds CVs and
 * customers' shipping documents, so /media serves only names an image column vouches for.
 */
export async function isPublicImage(name: string) {
	const [hit] = await db.execute(sql`
		SELECT 1 FROM ${teamMember} WHERE ${teamMember.photo} = ${name}
		UNION ALL SELECT 1 FROM ${partner} WHERE ${partner.logo} = ${name}
		UNION ALL SELECT 1 FROM ${serviceSetting} WHERE ${serviceSetting.photo} = ${name}
		UNION ALL SELECT 1 FROM ${newsPost} WHERE ${newsPost.cover} = ${name} AND ${newsPost.published} = true
		LIMIT 1`);
	return (hit as unknown as unknown[]).length > 0;
}
