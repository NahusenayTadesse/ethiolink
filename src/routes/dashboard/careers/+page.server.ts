import { count, desc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { jobApplication, jobOpening } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

/** The openings, each with how many have applied, and every application, newest first. */
export const load: PageServerLoad = async () => {
	const [jobs, applications] = await Promise.all([
		db
			.select({
				id: jobOpening.id,
				slug: jobOpening.slug,
				titleEn: jobOpening.titleEn,
				titleAm: jobOpening.titleAm,
				titleZh: jobOpening.titleZh,
				titleAr: jobOpening.titleAr,
				location: jobOpening.location,
				employmentType: jobOpening.employmentType,
				closesOn: jobOpening.closesOn,
				active: jobOpening.active,
				applicants: count(jobApplication.id),
				unread: sql<number>`sum(${jobApplication.status} = 'new')`.mapWith(Number)
			})
			.from(jobOpening)
			.leftJoin(jobApplication, eq(jobApplication.jobId, jobOpening.id))
			.groupBy(jobOpening.id)
			.orderBy(desc(jobOpening.createdAt), desc(jobOpening.id)),
		db
			.select({
				id: jobApplication.id,
				name: jobApplication.name,
				email: jobApplication.email,
				phone: jobApplication.phone,
				job: jobOpening.titleEn,
				status: jobApplication.status,
				createdAt: jobApplication.createdAt
			})
			.from(jobApplication)
			.leftJoin(jobOpening, eq(jobOpening.id, jobApplication.jobId))
			.orderBy(desc(jobApplication.createdAt), desc(jobApplication.id))
	]);
	return { jobs, applications };
};
