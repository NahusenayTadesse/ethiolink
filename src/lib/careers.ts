/** Job openings and applications. Outside the server folder so table cells can label them. */

export const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract', 'internship'] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
	full_time: 'Full time',
	part_time: 'Part time',
	contract: 'Contract',
	internship: 'Internship'
};

export const APPLICATION_STATUSES = ['new', 'review', 'shortlisted', 'rejected', 'hired'] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_LABELS: Record<ApplicationStatus, string> = {
	new: 'New',
	review: 'Reviewing',
	shortlisted: 'Shortlisted',
	rejected: 'Not selected',
	hired: 'Hired'
};
