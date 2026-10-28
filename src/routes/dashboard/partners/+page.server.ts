import { contentCrud } from '@nahu/admin-kit/server/crud';
import { partner } from '$lib/server/db/schema';
import { partnerEditSchema, partnerSchema } from './schema';

const crud = contentCrud({
	table: partner,
	label: 'Partner',
	addSchema: partnerSchema,
	editSchema: partnerEditSchema,
	fileFields: ['logo'],
	transform: (values) => ({ ...values, url: values.url || null })
});

export const load = crud.load;
export const actions = crud.actions;
