import { desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { newsPost } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	posts: await db
		.select({
			id: newsPost.id,
			slug: newsPost.slug,
			cover: newsPost.cover,
			titleEn: newsPost.titleEn,
			titleAm: newsPost.titleAm,
			titleZh: newsPost.titleZh,
			titleAr: newsPost.titleAr,
			excerptEn: newsPost.excerptEn,
			excerptAm: newsPost.excerptAm,
			excerptZh: newsPost.excerptZh,
			excerptAr: newsPost.excerptAr,
			published: newsPost.published,
			publishedAt: newsPost.publishedAt,
			updatedAt: newsPost.updatedAt
		})
		.from(newsPost)
		.orderBy(desc(newsPost.updatedAt), desc(newsPost.id))
});
