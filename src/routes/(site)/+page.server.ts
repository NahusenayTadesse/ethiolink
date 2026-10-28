import { getLocale } from '$lib/paraglide/runtime';
import { globeCities } from '$lib/server/globe';
import { newsList, partners, stats, team, testimonials } from '$lib/server/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const locale = getLocale();
	const [cities, figures, leaders, logos, quotes, news] = await Promise.all([
		globeCities(locale),
		stats(locale),
		team(locale),
		partners(),
		testimonials(locale),
		newsList(locale, 3)
	]);
	return { cities, figures, leaders, logos, quotes, news };
};
