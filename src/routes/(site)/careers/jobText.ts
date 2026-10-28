import { m } from '$lib/paraglide/messages.js';
import { getLocale } from '$lib/paraglide/runtime';
import type { EmploymentType } from '$lib/careers';

/** "Full time", in the visitor's language. */
export const jobType = (type: EmploymentType) =>
	({
		full_time: m.job_type_full_time,
		part_time: m.job_type_part_time,
		contract: m.job_type_contract,
		internship: m.job_type_internship
	})[type]();

/** "Applications close 30 November 2026", or "Open until filled". */
export function closing(closesOn: string | null) {
	if (!closesOn) return m.careers_until_filled();
	const date = new Intl.DateTimeFormat(getLocale(), { dateStyle: 'long', timeZone: 'UTC' }).format(
		new Date(`${closesOn}T00:00:00Z`)
	);
	return m.careers_closes({ date });
}
