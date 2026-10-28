import { getLocale } from '$lib/paraglide/runtime';
import { contactDetails, visibleServices } from '$lib/server/content';
import type { LayoutServerLoad } from './$types';

/**
 * What every public page shares: the office details (footer, contact page) and the services staff
 * have switched on (footer, forms). Switching language reloads the page, so this always matches it.
 */
export const load: LayoutServerLoad = async () => {
	const [contact, services] = await Promise.all([contactDetails(getLocale()), visibleServices()]);
	return { contact, services };
};
