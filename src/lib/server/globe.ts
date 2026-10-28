import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { globeCity } from '$lib/server/db/schema';
import type { Locale } from '$lib/paraglide/runtime';
import type { GlobeCity } from '$lib/site/globeCity';

const NAME_COLUMN = {
	en: globeCity.nameEn,
	am: globeCity.nameAm,
	zh: globeCity.nameZh,
	ar: globeCity.nameAr
} as const;

/** The cities the hero globe draws lanes to, named in the visitor's language. */
export function globeCities(locale: Locale): Promise<GlobeCity[]> {
	return db
		.select({
			name: NAME_COLUMN[locale],
			longitude: globeCity.longitude,
			latitude: globeCity.latitude
		})
		.from(globeCity)
		.where(eq(globeCity.active, true))
		.orderBy(asc(globeCity.id));
}
