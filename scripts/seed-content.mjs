// The site's starting content: company details, the leadership team, the home page figures and
// the services' order, in all four languages. Taken from the copy the site shipped with (the
// translation files as they stood at launch, frozen below) so nothing is typed twice.
//
// Run once on a fresh database, after `npm run db:push`:
//   node --env-file=.env scripts/seed-content.mjs
//
// Each table is filled only while it is empty, so running it again changes nothing. Staff edit
// all of it afterwards from the dashboard.
import mysql from 'mysql2/promise';
import { readFileSync } from 'node:fs';

const LOCALES = { En: 'en', Am: 'am', Zh: 'zh', Ar: 'ar' };
const copy = JSON.parse(readFileSync(new URL('./seed-content.json', import.meta.url), 'utf8'));

/** `{ fieldEn, fieldAm, … }` from a key in the frozen copy, joining several keys into paragraphs. */
function translated(field, ...keys) {
	return Object.fromEntries(
		Object.entries(LOCALES).map(([suffix, locale]) => [
			`${field}${suffix}`,
			keys.map((key) => copy[locale][key]).join('\n\n')
		])
	);
}

const SERVICES = [
	'customs',
	'storage',
	'bonded',
	'consolidation',
	'forwarding',
	'trade',
	'consultancy',
	'contracting'
];

const team = [
	{
		slug: 'solomon',
		...translated('name', 'team_solomon_name'),
		...translated('role', 'team_solomon_role'),
		...translated('summary', 'team_solomon_summary'),
		...translated(
			'bio',
			'team_solomon_p1',
			'team_solomon_p2',
			'team_solomon_p3',
			'team_solomon_p4',
			'team_solomon_p5'
		),
		sortOrder: 1
	},
	{
		slug: 'hiwot',
		...translated('name', 'team_hiwot_name'),
		...translated('role', 'team_hiwot_role'),
		...translated('summary', 'team_hiwot_summary'),
		...translated('bio', 'team_hiwot_p1', 'team_hiwot_p2', 'team_hiwot_p3', 'team_hiwot_p4'),
		sortOrder: 2
	}
];

const stats = ['years', 'services', 'modes', 'contact'].map((key, i) => ({
	value: copy.en[`stat_${key}`],
	...translated('label', `stat_${key}_label`),
	sortOrder: i + 1
}));

const settings = {
	id: 1,
	mapQuery: 'Monarch Parkview Hotel, Piassa, Addis Ababa, Ethiopia',
	...translated('address', 'contact_address'),
	...translated('hoursWeekdays', 'contact_hours_weekdays'),
	...translated('hoursSaturday', 'contact_hours_saturday')
};

const snake = (name) => name.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

async function fillIfEmpty(db, table, rows) {
	const [[{ n }]] = await db.query(`SELECT COUNT(*) AS n FROM \`${table}\``);
	if (n > 0) return console.log(`${table}: has ${n} rows, left alone`);
	for (const row of rows) {
		const columns = Object.keys(row);
		await db.query(
			`INSERT INTO \`${table}\` (${columns.map((c) => `\`${snake(c)}\``).join(', ')}) VALUES (?)`,
			[columns.map((c) => row[c])]
		);
	}
	console.log(`${table}: added ${rows.length}`);
}

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const db = await mysql.createConnection({ uri: process.env.DATABASE_URL });
try {
	await fillIfEmpty(db, 'site_settings', [settings]);
	await fillIfEmpty(db, 'team_member', team);
	await fillIfEmpty(db, 'site_stat', stats);
	await fillIfEmpty(
		db,
		'service_setting',
		SERVICES.map((slug, i) => ({ slug, active: true, sortOrder: i + 1 }))
	);
} finally {
	await db.end();
}
