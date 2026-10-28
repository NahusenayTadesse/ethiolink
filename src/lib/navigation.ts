import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
import Inbox from '@lucide/svelte/icons/inbox';
import ReceiptText from '@lucide/svelte/icons/receipt-text';
import BriefcaseBusiness from '@lucide/svelte/icons/briefcase-business';
import PanelsTopLeft from '@lucide/svelte/icons/panels-top-left';
import Building2 from '@lucide/svelte/icons/building-2';
import Layers from '@lucide/svelte/icons/layers';
import Users from '@lucide/svelte/icons/users';
import ChartNoAxesColumn from '@lucide/svelte/icons/chart-no-axes-column';
import Handshake from '@lucide/svelte/icons/handshake';
import Quote from '@lucide/svelte/icons/quote';
import Newspaper from '@lucide/svelte/icons/newspaper';
import Mail from '@lucide/svelte/icons/mail';
import ShieldUser from '@lucide/svelte/icons/shield-user';
import UserCog from '@lucide/svelte/icons/user-cog';
import KeyRound from '@lucide/svelte/icons/key-round';
import Earth from '@lucide/svelte/icons/earth';
import type { NavItem } from '@nahu/admin-kit/navigation';

/** The sidebar and the search palette. Each entry is shown only if `access` lets the viewer in. */
export const NAVIGATION: NavItem[] = [
	{ title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
	{ title: 'Messages', url: '/dashboard/messages', icon: Inbox },
	{ title: 'Quote requests', url: '/dashboard/quotes', icon: ReceiptText },
	{ title: 'Careers', url: '/dashboard/careers', icon: BriefcaseBusiness },
	{ title: 'Send email', url: '/dashboard/email', icon: Mail },
	{
		title: 'Website',
		url: '/dashboard/settings',
		icon: PanelsTopLeft,
		items: [
			{ title: 'Company info', url: '/dashboard/settings', icon: Building2 },
			{ title: 'News & updates', url: '/dashboard/news', icon: Newspaper },
			{ title: 'Services', url: '/dashboard/services', icon: Layers },
			{ title: 'Leadership team', url: '/dashboard/team', icon: Users },
			{ title: 'Home page figures', url: '/dashboard/stats', icon: ChartNoAxesColumn },
			{ title: 'Partners & clients', url: '/dashboard/partners', icon: Handshake },
			{ title: 'Testimonials', url: '/dashboard/testimonials', icon: Quote },
			{ title: 'Globe cities', url: '/dashboard/globe', icon: Earth }
		]
	},
	{
		title: 'Admin',
		url: '/dashboard/admin/users',
		icon: ShieldUser,
		items: [
			{ title: 'Users', url: '/dashboard/admin/users', icon: UserCog },
			{ title: 'Roles', url: '/dashboard/admin/roles', icon: KeyRound }
		]
	}
];

/** Where each kind of record's page lives, so table cells can link to it: `{ employee: '/dashboard/employees' }`. */
export const ENTITIES: Record<string, string> = {
	message: '/dashboard/messages',
	quote: '/dashboard/quotes',
	application: '/dashboard/careers/applications',
	user: '/dashboard/admin/users',
	role: '/dashboard/admin/roles'
};
