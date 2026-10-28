import { getLocale } from '$lib/paraglide/runtime';
import { openJobs } from '$lib/server/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({ jobs: await openJobs(getLocale()) });
