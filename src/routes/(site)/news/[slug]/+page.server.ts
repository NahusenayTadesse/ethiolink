import { error } from '@sveltejs/kit';
import { getLocale } from '$lib/paraglide/runtime';
import { newsArticle } from '$lib/server/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const post = await newsArticle(params.slug, getLocale());
	if (!post) error(404, 'Not found');
	return { post };
};
