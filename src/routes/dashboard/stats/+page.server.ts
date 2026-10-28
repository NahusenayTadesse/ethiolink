import { contentCrud } from '@nahu/admin-kit/server/crud';
import { siteStat } from '$lib/server/db/schema';
import { blankToNull } from '$lib/dashboard/translatedSchema';
import { statEditSchema, statSchema } from './schema';

const crud = contentCrud({
	table: siteStat,
	label: 'Figure',
	addSchema: statSchema,
	editSchema: statEditSchema,
	uniqueField: 'value',
	transform: (values) => blankToNull(values)
});

export const load = crud.load;
export const actions = crud.actions;
