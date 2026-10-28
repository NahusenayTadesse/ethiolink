import { contentCrud } from '@nahu/admin-kit/server/crud';
import { teamMember } from '$lib/server/db/schema';
import { blankToNull, slugify } from '$lib/dashboard/translatedSchema';
import { teamEditSchema, teamSchema } from './schema';

const crud = contentCrud({
	table: teamMember,
	label: 'Team member',
	addSchema: teamSchema,
	editSchema: teamEditSchema,
	fileFields: ['photo'],
	uniqueField: 'slug',
	transform: (values) => {
		// The /about anchor: typed, or made from the English name the first time it is saved.
		if (!values.slug)
			values.slug =
				slugify(values.nameEn).slice(0, 60).replace(/-+$/, '') || `member-${Date.now()}`;
		return blankToNull(values);
	}
});

export const load = crud.load;
export const actions = crud.actions;
