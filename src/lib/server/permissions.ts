/**
 * What a signed-in person may do, and keeping the permission and role tables in step with the code.
 *
 * - `loadAccess`: the person's role's permissions, and whether they may sign in at all. A super
 *   admin is someone holding every permission (the Administrator role).
 * - `syncAccessTables`: on boot, writes every permission in `PERMISSIONS`, creates the default roles
 *   that do not exist yet, gives the Administrator role every permission, and gives that role to
 *   accounts that have none while nobody holds it — the accounts from before roles existed — so an
 *   upgrade never locks the office out.
 */
import { and, count, eq, inArray, isNull } from 'drizzle-orm';
import { PERMISSIONS } from '$lib/access';
import { db } from '$lib/server/db';
import { permissions, rolePermissions, roles, user } from '$lib/server/db/schema';
import { ADMINISTRATOR, DEFAULT_ROLES, permissionsOf } from '$lib/server/roles';

export type AccessState = {
	permList: string[];
	isSuperAdmin: boolean;
	isActive: boolean;
	mustChangePassword: boolean;
};

const NOTHING: AccessState = {
	permList: [],
	isSuperAdmin: false,
	isActive: false,
	mustChangePassword: false
};

export async function loadAccess(userId: string): Promise<AccessState> {
	const [person] = await db
		.select({ isActive: user.isActive, mustChangePassword: user.mustChangePassword })
		.from(user)
		.where(eq(user.id, userId));
	if (!person?.isActive) return NOTHING;

	const rows = await db
		.select({ name: permissions.name })
		.from(user)
		.innerJoin(roles, eq(user.roleId, roles.id))
		.innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
		.innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
		.where(eq(user.id, userId));
	const permList = [...new Set(rows.map((r) => r.name))];
	return {
		permList,
		isSuperAdmin: await holdsEverything(permList),
		isActive: true,
		mustChangePassword: person.mustChangePassword
	};
}

async function holdsEverything(permList: string[]) {
	if (!permList.length) return false;
	const [{ total }] = await db.select({ total: count() }).from(permissions);
	// An empty table would otherwise make everyone a super admin.
	return total > 0 && permList.length >= total;
}

/** The Administrator role's id, creating the role if the tables are new. */
export async function administratorRoleId() {
	await syncAccessTables();
	const [role] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, ADMINISTRATOR));
	return role.id;
}

/** See the module comment. Returns how many permissions and roles it created. */
export async function syncAccessTables(): Promise<{ permissions: number; roles: number }> {
	let createdPermissions = 0;
	let createdRoles = 0;

	await db.transaction(async (tx) => {
		const existing = await tx.select().from(permissions);
		const byName = new Map(existing.map((p) => [p.name, p]));
		for (const p of PERMISSIONS) {
			const row = byName.get(p.name);
			if (!row) {
				await tx.insert(permissions).values(p);
				createdPermissions++;
			} else if (row.description !== p.description || row.area !== p.area) {
				await tx
					.update(permissions)
					.set({ description: p.description, area: p.area })
					.where(eq(permissions.id, row.id));
			}
		}
		// Permissions no longer in the code go, with their grants (cascade).
		const stale = existing.filter((p) => !PERMISSIONS.some((q) => q.name === p.name));
		if (stale.length) {
			await tx.delete(permissions).where(
				inArray(
					permissions.id,
					stale.map((p) => p.id)
				)
			);
		}

		const all = await tx.select().from(permissions);
		const idOf = new Map(all.map((p) => [p.name, p.id]));

		for (const def of DEFAULT_ROLES) {
			let [role] = await tx.select().from(roles).where(eq(roles.name, def.name));
			if (!role) {
				const [res] = await tx
					.insert(roles)
					.values({ name: def.name, description: def.description });
				[role] = await tx.select().from(roles).where(eq(roles.id, res.insertId));
				const ids = permissionsOf(def).flatMap((n) => (idOf.has(n) ? [idOf.get(n)!] : []));
				if (ids.length) {
					await tx
						.insert(rolePermissions)
						.values(ids.map((permissionId) => ({ roleId: role.id, permissionId })));
				}
				createdRoles++;
			}
			if (def.name === ADMINISTRATOR) {
				const held = await tx
					.select({ id: rolePermissions.permissionId })
					.from(rolePermissions)
					.where(eq(rolePermissions.roleId, role.id));
				const heldIds = new Set(held.map((h) => h.id));
				const missing = all.filter((p) => !heldIds.has(p.id));
				if (missing.length) {
					await tx
						.insert(rolePermissions)
						.values(missing.map((p) => ({ roleId: role.id, permissionId: p.id })));
				}
				// Accounts from before roles existed: while no one is an administrator, they all are.
				const [{ admins }] = await tx
					.select({ admins: count() })
					.from(user)
					.where(eq(user.roleId, role.id));
				if (!admins)
					await tx
						.update(user)
						.set({ roleId: role.id })
						.where(and(isNull(user.roleId)));
			}
		}
	});

	return { permissions: createdPermissions, roles: createdRoles };
}
