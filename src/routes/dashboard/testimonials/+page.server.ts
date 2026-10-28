import { contentCrud } from '@nahu/admin-kit/server/crud';
import { testimonial } from '$lib/server/db/schema';
import { blankToNull } from '$lib/dashboard/translatedSchema';
import { testimonialEditSchema, testimonialSchema } from './schema';

const crud = contentCrud({
	table: testimonial,
	label: 'Testimonial',
	addSchema: testimonialSchema,
	editSchema: testimonialEditSchema,
	uniqueField: 'author',
	transform: (values) => blankToNull(values)
});

export const load = crud.load;
export const actions = crud.actions;
