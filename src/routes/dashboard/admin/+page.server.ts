import { redirect } from '@sveltejs/kit';

/** Admin has no page of its own: the users list is where it starts. */
export const load = () => redirect(307, '/dashboard/admin/users');
