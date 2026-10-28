import { createAccess } from '@nahu/admin-kit/access';

/**
 * Who may open what: one rule per route prefix, first match wins, so specific prefixes go before
 * general ones. Pages under /dashboard with no rule are closed — add a rule with every new page.
 * `permission: null` means any signed-in user.
 *
 * Permission names live only in this file. Each is also a row in `permissions`, written on boot
 * from `PERMISSIONS` below, so Admin › Roles can grant it. The route gate is the floor; an action
 * that does more than its page checks `requirePermission` itself.
 */
export const access = createAccess({
	root: '/dashboard',
	rules: [
		{ prefix: '/dashboard', permission: null, exact: true },
		{ prefix: '/dashboard/change-password', permission: null },
		// Where a page the viewer may not open sends them (hooks.server.ts): it must open for all.
		{ prefix: '/dashboard/denied', permission: null },
		{ prefix: '/dashboard/files/', permission: null },

		{ prefix: '/dashboard/messages', permission: 'messages.manage' },
		{ prefix: '/dashboard/quotes', permission: 'quotes.manage' },
		{ prefix: '/dashboard/careers', permission: 'careers.manage' },
		{ prefix: '/dashboard/email', permission: 'email.send' },

		{ prefix: '/dashboard/news', permission: 'news.manage' },
		{ prefix: '/dashboard/settings', permission: 'website.manage' },
		{ prefix: '/dashboard/services', permission: 'website.manage' },
		{ prefix: '/dashboard/team', permission: 'website.manage' },
		{ prefix: '/dashboard/stats', permission: 'website.manage' },
		{ prefix: '/dashboard/partners', permission: 'website.manage' },
		{ prefix: '/dashboard/testimonials', permission: 'website.manage' },
		{ prefix: '/dashboard/globe', permission: 'website.manage' },

		{ prefix: '/dashboard/admin', permission: 'users.manage' }
	]
});

export type PermissionInfo = { name: string; description: string; area: string };

/** Every permission there is, with the sentence the roles screen shows beside it. */
export const PERMISSIONS: readonly PermissionInfo[] = [
	{
		name: 'messages.manage',
		area: 'Customers',
		description: 'Read and answer the messages sent through the website'
	},
	{
		name: 'quotes.manage',
		area: 'Customers',
		description: 'See quote requests, price them, move them through the pipeline and reply'
	},
	{
		name: 'email.send',
		area: 'Customers',
		description: "Send new emails from the dashboard in the company's name"
	},
	{
		name: 'careers.manage',
		area: 'Careers',
		description: 'Post job openings, read applications and CVs, and answer applicants'
	},
	{
		name: 'news.manage',
		area: 'Website',
		description: 'Write, publish and remove news and customs updates'
	},
	{
		name: 'website.manage',
		area: 'Website',
		description:
			'Edit company info, services, the leadership team, home page figures, partners, testimonials and the globe'
	},
	{
		name: 'users.manage',
		area: 'Administration',
		description: 'Add staff accounts, reset passwords, and decide what each role may do'
	}
];

/** The sentence describing a permission, for telling someone what they are missing. */
export function permissionDescription(name: string | null | undefined): string | null {
	return PERMISSIONS.find((p) => p.name === name)?.description ?? null;
}
