import { getLocale } from '$lib/paraglide/runtime';
import { newsList } from '$lib/server/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({ posts: await newsList(getLocale()) });
