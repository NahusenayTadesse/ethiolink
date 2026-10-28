import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { postedForm, storeFileFields, UploadRefused } from '@nahu/admin-kit/server/files';
import { htmlToText, sanitizeRichHtml, summarize } from '@nahu/admin-kit/server/richText';
import { isDuplicateKey } from '@nahu/admin-kit/server/dbErrors';
import { db } from '$lib/server/db';
import { newsPost } from '$lib/server/db/schema';
import { blankToNull, slugify } from '$lib/dashboard/translatedSchema';
import { LANGUAGES } from '$lib/translated';
import { newsSchema } from '../schema';
import type { Actions, PageServerLoad } from './$types';

/** `new`, or the id of a post that exists. */
async function findPost(param: string) {
	if (param === 'new') return null;
	const id = Number(param);
	const [post] = Number.isInteger(id)
		? await db.select().from(newsPost).where(eq(newsPost.id, id))
		: [];
	if (!post) error(404, 'Post not found');
	return post;
}

export const load: PageServerLoad = async ({ params }) => {
	const post = await findPost(params.id);
	const values = post
		? Object.fromEntries(Object.entries(post).map(([k, v]) => [k, v ?? '']))
		: undefined;
	return {
		post,
		form: await superValidate({ ...values, cover: undefined }, zod4(newsSchema), { errors: false })
	};
};

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		const post = await findPost(params.id);
		const posted = await postedForm(request);
		const form = await superValidate(posted, zod4(newsSchema));
		if (!form.valid)
			return message(form, { type: 'error', text: 'Check the post' }, { status: 400 });

		const values: Record<string, unknown> = { ...form.data };
		for (const { suffix } of LANGUAGES) {
			const body = sanitizeRichHtml(form.data[`body${suffix}`], {
				imageSrc: (src) => src.startsWith('/media/')
			});
			values[`body${suffix}`] = body;
			// No summary given: the opening of the article, for the list and for Google.
			if (!form.data[`excerpt${suffix}`] && body)
				values[`excerpt${suffix}`] = summarize(htmlToText(body), 280);
		}
		if (!values.bodyEn) {
			setError(form, 'bodyEn', 'Write the article in English');
			return message(
				form,
				{ type: 'error', text: 'The English article is empty' },
				{ status: 400 }
			);
		}
		values.slug ||= post?.slug || slugify(form.data.titleEn) || `post-${Date.now()}`;
		if (form.data.published && !post?.publishedAt) values.publishedAt = new Date();

		try {
			await storeFileFields(values, ['cover'], posted);
		} catch (err) {
			if (!(err instanceof UploadRefused)) throw err;
			setError(form, 'cover', err.message);
			return message(form, { type: 'error', text: err.message }, { status: 400 });
		}

		const row = blankToNull(values) as typeof newsPost.$inferInsert;
		try {
			if (post) {
				await db.update(newsPost).set(row).where(eq(newsPost.id, post.id));
			} else {
				const [result] = await db
					.insert(newsPost)
					.values({ ...row, createdBy: locals.user?.id ?? null });
				redirect(303, `/dashboard/news/${result.insertId}`);
			}
		} catch (err) {
			if (!isDuplicateKey(err)) throw err;
			setError(form, 'slug', 'Another post already uses this link');
			return message(
				form,
				{ type: 'error', text: 'Another post already uses this link' },
				{ status: 400 }
			);
		}
		return message(form, {
			type: 'success',
			text: form.data.published ? 'Saved — live on the News page' : 'Draft saved'
		});
	},

	delete: async ({ params }) => {
		const post = await findPost(params.id);
		if (post) await db.delete(newsPost).where(eq(newsPost.id, post.id));
		redirect(303, '/dashboard/news');
	}
};
