import {
	boolean,
	date,
	decimal,
	double,
	index,
	int,
	json,
	mysqlEnum,
	mysqlTable,
	text,
	timestamp,
	uniqueIndex,
	varchar
} from 'drizzle-orm/mysql-core';
import { MESSAGE_STATUSES } from '../../messageStatus';
import { QUOTE_STATUSES, TRANSPORT_MODES } from '../../quoteStatus';
import { APPLICATION_STATUSES, EMPLOYMENT_TYPES } from '../../careers';
import { user } from './auth.schema';

/**
 * One piece of text in the four site languages: `<name>En` (required) and `<name>Am`, `<name>Zh`,
 * `<name>Ar` (optional — the site falls back to English; see `$lib/translated`).
 */
function translated<N extends string, E, O>(
	name: N,
	column: string,
	english: (column: string) => E,
	other: (column: string) => O
) {
	return {
		[`${name}En`]: english(`${column}_en`),
		[`${name}Am`]: other(`${column}_am`),
		[`${name}Zh`]: other(`${column}_zh`),
		[`${name}Ar`]: other(`${column}_ar`)
	} as { [K in `${N}En`]: E } & { [K in `${N}${'Am' | 'Zh' | 'Ar'}`]: O };
}

const line = (name: string, length: number) => varchar(name, { length });
const translatedLine = <N extends string>(name: N, column: string, length: number) =>
	translated(
		name,
		column,
		(c) => line(c, length).notNull(),
		(c) => line(c, length)
	);
const translatedText = <N extends string>(name: N, column: string) =>
	translated(
		name,
		column,
		(c) => text(c).notNull(),
		(c) => text(c)
	);

/** A note sent from the public contact form. Staff read and answer it from /dashboard/messages. */
export const contactMessage = mysqlTable(
	'contact_message',
	{
		id: int('id').autoincrement().primaryKey(),
		name: varchar('name', { length: 120 }).notNull(),
		company: varchar('company', { length: 160 }),
		email: varchar('email', { length: 255 }).notNull(),
		phone: varchar('phone', { length: 40 }).notNull(),
		/** A service slug from `$lib/services`, or `general`. */
		service: varchar('service', { length: 40 }).notNull().default('general'),
		message: text('message').notNull(),
		/** The site language the visitor wrote from, so staff can answer in it. */
		locale: varchar('locale', { length: 8 }).notNull().default('en'),
		status: mysqlEnum('status', MESSAGE_STATUSES).notNull().default('new'),
		/** Who marked it replied. */
		repliedBy: varchar('replied_by', { length: 36 }).references(() => user.id, {
			onDelete: 'set null'
		}),
		repliedAt: timestamp('replied_at'),
		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(table) => [
		index('contact_message_status_idx').on(table.status),
		index('contact_message_created_idx').on(table.createdAt)
	]
);

/**
 * A city the hero globe draws a trade lane to from Addis Ababa, named in every site language.
 * Staff manage these from /dashboard/globe; the globe reads them on each visit, so no rebuild.
 */
export const globeCity = mysqlTable('globe_city', {
	id: int('id').autoincrement().primaryKey(),
	nameEn: varchar('name_en', { length: 80 }).notNull(),
	nameAm: varchar('name_am', { length: 80 }).notNull(),
	nameZh: varchar('name_zh', { length: 80 }).notNull(),
	nameAr: varchar('name_ar', { length: 80 }).notNull(),
	/** Degrees, east positive. */
	longitude: double('longitude').notNull(),
	/** Degrees, north positive. */
	latitude: double('latitude').notNull(),
	/** Hidden cities stay in the list but get no lane. */
	active: boolean('active').notNull().default(true),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

/**
 * The company's own details, as one row (id 1): how to reach the office and when it is open.
 * Edited from /dashboard/settings; the header, footer and contact page read it on every visit.
 */
export const siteSettings = mysqlTable('site_settings', {
	id: int('id').primaryKey(),
	email: line('email', 255),
	phone: line('phone', 40),
	/** International format, digits only once stored: 251911234567. */
	whatsapp: line('whatsapp', 40),
	/** A Telegram username or channel, without the @. */
	telegram: line('telegram', 80),
	linkedin: line('linkedin', 255),
	facebook: line('facebook', 255),
	instagram: line('instagram', 255),
	tiktok: line('tiktok', 255),
	/** What the map on the contact page searches for. */
	mapQuery: line('map_query', 255).notNull(),
	...translatedLine('address', 'address', 255),
	...translatedLine('hoursWeekdays', 'hours_weekdays', 120),
	...translatedLine('hoursSaturday', 'hours_saturday', 120),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});

/**
 * How each of the eight services shows on the site. The words stay in the translation files
 * (`messages/*.json`) — they are the client's approved copy — so a row only switches a service off,
 * moves it, or gives it a photo. A service with no row shows, in its place in `SERVICE_SLUGS`.
 */
export const serviceSetting = mysqlTable('service_setting', {
	slug: varchar('slug', { length: 40 }).primaryKey(),
	active: boolean('active').notNull().default(true),
	sortOrder: int('sort_order').notNull().default(0),
	/** A stored image name, served publicly from /media. */
	photo: line('photo', 255)
});

/** A member of the leadership team, on the home page and in full on /about. */
export const teamMember = mysqlTable('team_member', {
	id: int('id').autoincrement().primaryKey(),
	/** The anchor on /about (`/about#solomon`), so links to a profile survive a rename. */
	slug: varchar('slug', { length: 60 }).notNull().unique(),
	photo: line('photo', 255),
	...translatedLine('name', 'name', 120),
	...translatedLine('role', 'role', 120),
	/** The card on the home page. */
	...translatedText('summary', 'summary'),
	/** The full profile; paragraphs separated by a blank line. */
	...translatedText('bio', 'bio'),
	sortOrder: int('sort_order').notNull().default(0),
	active: boolean('active').notNull().default(true),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

/** One of the figures on the home page: "20+ years of leadership experience". */
export const siteStat = mysqlTable('site_stat', {
	id: int('id').autoincrement().primaryKey(),
	/** As shown, digits and all: "20+", "8". The digits count up as the figure scrolls in. */
	value: varchar('value', { length: 16 }).notNull(),
	...translatedLine('label', 'label', 160),
	sortOrder: int('sort_order').notNull().default(0),
	active: boolean('active').notNull().default(true)
});

/** A client, carrier or partner shown by its logo. */
export const partner = mysqlTable('partner', {
	id: int('id').autoincrement().primaryKey(),
	name: varchar('name', { length: 120 }).notNull(),
	logo: line('logo', 255).notNull(),
	url: line('url', 255),
	sortOrder: int('sort_order').notNull().default(0),
	active: boolean('active').notNull().default(true)
});

/** What a client said about working with EthioLink. Shown only with the client's permission. */
export const testimonial = mysqlTable('testimonial', {
	id: int('id').autoincrement().primaryKey(),
	author: varchar('author', { length: 120 }).notNull(),
	/** Their role and company, as it should be printed: "Import Manager, Abyssinia Foods". */
	...translatedLine('position', 'position', 160),
	...translatedText('quote', 'quote'),
	sortOrder: int('sort_order').notNull().default(0),
	active: boolean('active').notNull().default(true)
});

/**
 * A request for a price, from /quote. Richer than a contact message — route, mode, cargo — so
 * staff can price it without a first round of questions, and it carries a pipeline status.
 */
export const quoteRequest = mysqlTable(
	'quote_request',
	{
		id: int('id').autoincrement().primaryKey(),
		name: varchar('name', { length: 120 }).notNull(),
		company: varchar('company', { length: 160 }),
		email: varchar('email', { length: 255 }).notNull(),
		phone: varchar('phone', { length: 40 }).notNull(),
		/** A service slug from `$lib/site/services`, or `general`. */
		service: varchar('service', { length: 40 }).notNull().default('general'),
		mode: mysqlEnum('mode', TRANSPORT_MODES).notNull().default('any'),
		origin: varchar('origin', { length: 160 }).notNull(),
		destination: varchar('destination', { length: 160 }).notNull(),
		cargo: text('cargo').notNull(),
		weightKg: decimal('weight_kg', { precision: 12, scale: 2 }),
		volumeCbm: decimal('volume_cbm', { precision: 12, scale: 3 }),
		/** An Incoterm from `INCOTERMS`, or null for "not sure". */
		incoterm: varchar('incoterm', { length: 3 }),
		readyDate: date('ready_date', { mode: 'string' }),
		/** Stored file names of the documents sent with it (invoice, packing list). Private. */
		documents: json('documents').$type<string[]>().notNull().default([]),
		locale: varchar('locale', { length: 8 }).notNull().default('en'),
		status: mysqlEnum('status', QUOTE_STATUSES).notNull().default('new'),
		/** The price offered, once quoted. */
		amount: decimal('amount', { precision: 14, scale: 2 }),
		currency: varchar('currency', { length: 3 }).notNull().default('ETB'),
		/** For staff only: what was agreed, why it was lost. */
		notes: text('notes'),
		updatedBy: varchar('updated_by', { length: 36 }).references(() => user.id, {
			onDelete: 'set null'
		}),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date())
	},
	(table) => [
		index('quote_request_status_idx').on(table.status),
		index('quote_request_created_idx').on(table.createdAt)
	]
);

/** What a reply was answering. */
/** What a sent email answered; `direct` is a new email written on /dashboard/email. */
export const REPLY_SUBJECTS = ['message', 'quote', 'application', 'direct'] as const;

/** An email staff sent from the dashboard, kept so the next person sees what was said. */
export const emailReply = mysqlTable(
	'email_reply',
	{
		id: int('id').autoincrement().primaryKey(),
		kind: mysqlEnum('kind', REPLY_SUBJECTS).notNull(),
		/** The message, quote or application answered; empty for a direct email. */
		recordId: int('record_id'),
		toEmail: varchar('to_email', { length: 255 }).notNull(),
		subject: varchar('subject', { length: 200 }).notNull(),
		/** Plain text for a reply; sanitised HTML for a direct email. */
		body: text('body').notNull(),
		sentBy: varchar('sent_by', { length: 36 }).references(() => user.id, { onDelete: 'set null' }),
		sentAt: timestamp('sent_at').notNull().defaultNow()
	},
	(table) => [index('email_reply_record_idx').on(table.kind, table.recordId)]
);

/** A news post or customs update, on /news. The body is sanitised HTML from the rich editor. */
export const newsPost = mysqlTable(
	'news_post',
	{
		id: int('id').autoincrement().primaryKey(),
		slug: varchar('slug', { length: 120 }).notNull().unique(),
		cover: line('cover', 255),
		...translatedLine('title', 'title', 200),
		/** One or two sentences for the list and for search results. */
		...translatedLine('excerpt', 'excerpt', 300),
		...translatedText('body', 'body'),
		published: boolean('published').notNull().default(false),
		/** Set the first time it is published; the date readers see. */
		publishedAt: timestamp('published_at'),
		createdBy: varchar('created_by', { length: 36 }).references(() => user.id, {
			onDelete: 'set null'
		}),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date())
	},
	(table) => [index('news_post_published_idx').on(table.published, table.publishedAt)]
);

/** A job opening on /careers. The description is sanitised HTML from the rich editor. */
export const jobOpening = mysqlTable('job_opening', {
	id: int('id').autoincrement().primaryKey(),
	slug: varchar('slug', { length: 120 }).notNull().unique(),
	...translatedLine('title', 'title', 160),
	...translatedText('description', 'description'),
	location: varchar('location', { length: 120 }).notNull().default('Addis Ababa'),
	employmentType: mysqlEnum('employment_type', EMPLOYMENT_TYPES).notNull().default('full_time'),
	/** The last day applications are taken; none means open until it is closed by hand. */
	closesOn: date('closes_on', { mode: 'string' }),
	active: boolean('active').notNull().default(true),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

/** Someone applying for an opening, with their CV. The CV is a private file. */
export const jobApplication = mysqlTable(
	'job_application',
	{
		id: int('id').autoincrement().primaryKey(),
		jobId: int('job_id')
			.notNull()
			.references(() => jobOpening.id, { onDelete: 'cascade' }),
		name: varchar('name', { length: 120 }).notNull(),
		email: varchar('email', { length: 255 }).notNull(),
		phone: varchar('phone', { length: 40 }).notNull(),
		cv: varchar('cv', { length: 255 }).notNull(),
		coverLetter: text('cover_letter'),
		locale: varchar('locale', { length: 8 }).notNull().default('en'),
		status: mysqlEnum('status', APPLICATION_STATUSES).notNull().default('new'),
		notes: text('notes'),
		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(table) => [
		index('job_application_job_idx').on(table.jobId),
		index('job_application_status_idx').on(table.status)
	]
);

/* ——— Who may do what (/dashboard/admin) ——— */

/** A named set of permissions given to staff: "Sales", "Content editor". */
export const roles = mysqlTable('roles', {
	id: int('id').autoincrement().primaryKey(),
	name: varchar('name', { length: 80 }).notNull().unique(),
	description: varchar('description', { length: 255 }),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

/** One thing a role can allow. Written from `PERMISSIONS` in `$lib/access` on boot; never by hand. */
export const permissions = mysqlTable('permissions', {
	id: int('id').autoincrement().primaryKey(),
	name: varchar('name', { length: 80 }).notNull().unique(),
	description: varchar('description', { length: 255 }).notNull().default(''),
	/** The group the roles screen shows it under. */
	area: varchar('area', { length: 40 }).notNull().default('')
});

export const rolePermissions = mysqlTable(
	'role_permissions',
	{
		id: int('id').autoincrement().primaryKey(),
		roleId: int('role_id')
			.notNull()
			.references(() => roles.id, { onDelete: 'cascade' }),
		permissionId: int('permission_id')
			.notNull()
			.references(() => permissions.id, { onDelete: 'cascade' })
	},
	(t) => [uniqueIndex('role_permission_idx').on(t.roleId, t.permissionId)]
);

export * from './auth.schema';
