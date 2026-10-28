/**
 * The roles EthioLink starts with. Written to the database once, when no role of that name exists;
 * after that an administrator edits them in Admin › Roles and these lists are not applied again —
 * except that the Administrator role always holds every permission, so a permission added in a
 * later release reaches it without anyone ticking a box.
 */
import { PERMISSIONS } from '$lib/access';

export const ADMINISTRATOR = 'Administrator';

export type DefaultRole = {
	name: string;
	description: string;
	permissions: readonly string[] | 'all';
};

export const DEFAULT_ROLES: readonly DefaultRole[] = [
	{
		name: ADMINISTRATOR,
		description: 'Everything, including staff accounts and roles',
		permissions: 'all'
	},
	{
		name: 'Sales',
		description: 'Website messages, quote requests and emails to customers',
		permissions: ['messages.manage', 'quotes.manage', 'email.send']
	},
	{
		name: 'Content editor',
		description: 'News posts and the website’s editable content',
		permissions: ['news.manage', 'website.manage']
	},
	{
		name: 'HR',
		description: 'Job openings and applications',
		permissions: ['careers.manage', 'email.send']
	}
];

export function permissionsOf(role: DefaultRole): string[] {
	return role.permissions === 'all' ? PERMISSIONS.map((p) => p.name) : [...role.permissions];
}
