import { access, permissionDescription } from '$lib/access';
import type { PageServerLoad } from './$types';

/** Where a page the viewer may not open sends them (hooks.server.ts): what it needed, in words. */
export const load: PageServerLoad = ({ url }) => {
	const from = url.searchParams.get('from') ?? '';
	const permission = from.startsWith('/dashboard') ? access.permissionForPath(from) : undefined;
	return { needs: permissionDescription(permission) };
};
