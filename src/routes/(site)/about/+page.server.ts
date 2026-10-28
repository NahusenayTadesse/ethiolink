import { getLocale } from '$lib/paraglide/runtime';
import { stats, team } from '$lib/server/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const locale = getLocale();
	const [leaders, figures] = await Promise.all([team(locale), stats(locale)]);
	// The first home page figure also sits on the About page's photo.
	return { leaders, highlight: figures[0] ?? null };
};
