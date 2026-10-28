/**
 * Roles: what each may do, who holds it. The Administrator role keeps its name and every
 * permission (`syncAccessTables` re-grants anything missing), so nobody can narrow the one role
 * that manages the others. A role somebody holds cannot be deleted.
 */
import { asc, count, eq } from 'drizzle-orm';
import { WriteRefused } from '@nahu/admin-kit/server/childCrud';
import { db } from '$lib/server/db';
import { permissions, rolePermissions, roles, user } from '$lib/server/db/schema';
import { ADMINISTRATOR } from '$lib/server/roles';

export async function listRoles() {
	const [rows, grants, holders, [{ total }]] = await Promise.all([
		db.select().from(roles).orderBy(asc(roles.name)),
		db
			.select({ roleId: rolePermissions.roleId, n: count() })
			.from(rolePermissions)
			.groupBy(rolePermissions.roleId),
		db.select({ roleId: user.roleId, n: count() }).from(user).groupBy(user.roleId),
		db.select({ total: count() }).from(permissions)
	]);
	const grantsOf = new Map(grants.map((g) => [g.roleId, g.n]));
	const holdersOf = new Map(holders.map((h) => [h.roleId, h.n]));
	return rows.map((r) => ({
		...r,
		permissionCount: grantsOf.get(r.id) ?? 0,
		permissionTotal: total,
		holders: holdersOf.get(r.id) ?? 0,
		locked: r.name === ADMINISTRATOR
	}));
}

export async function findRole(id: number) {
	const [role] = await db.select().from(roles).where(eq(roles.id, id));
	if (!role) return undefined;
	const [held, holders, all] = await Promise.all([
		db
			.select({ id: rolePermissions.permissionId })
			.from(rolePermissions)
			.where(eq(rolePermissions.roleId, id)),
		db
			.select({ id: user.id, name: user.name, email: user.email, isActive: user.isActive })
			.from(user)
			.where(eq(user.roleId, id))
			.orderBy(asc(user.name)),
		db.select().from(permissions).orderBy(asc(permissions.id))
	]);
	return {
		role,
		locked: role.name === ADMINISTRATOR,
		permissionIds: held.map((h) => h.id),
		holders,
		permissions: all
	};
}

async function nameTaken(name: string, exceptId?: number) {
	const [row] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, name));
	return Boolean(row && row.id !== exceptId);
}

export async function addRole(input: { name: string; description: string }) {
	const name = input.name.trim();
	if (await nameTaken(name))
		throw new WriteRefused('name', 'A role with that name already exists.');
	const [res] = await db
		.insert(roles)
		.values({ name, description: input.description.trim() || null });
	return res.insertId;
}

export async function updateRole(
	id: number,
	input: { name: string; description: string; permissionIds: number[] }
) {
	const found = await findRole(id);
	if (!found) throw new WriteRefused(null, 'That role no longer exists.');
	const name = found.locked ? found.role.name : input.name.trim();
	if (name !== found.role.name && (await nameTaken(name, id))) {
		throw new WriteRefused('name', 'A role with that name already exists.');
	}
	const valid = new Set(found.permissions.map((p) => p.id));
	const ids = [...new Set(input.permissionIds)].filter((p) => valid.has(p));

	await db.transaction(async (tx) => {
		await tx
			.update(roles)
			.set({ name, description: input.description.trim() || null })
			.where(eq(roles.id, id));
		if (found.locked) return; // Always everything; see the module comment.
		await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
		if (ids.length) {
			await tx
				.insert(rolePermissions)
				.values(ids.map((permissionId) => ({ roleId: id, permissionId })));
		}
	});
}

export async function deleteRole(id: number) {
	const found = await findRole(id);
	if (!found) throw new WriteRefused(null, 'That role no longer exists.');
	if (found.locked) throw new WriteRefused(null, 'The Administrator role cannot be deleted.');
	if (found.holders.length) {
		throw new WriteRefused(
			null,
			`${found.holders.length === 1 ? 'One person holds' : `${found.holders.length} people hold`} this role. Give them another role first.`
		);
	}
	await db.delete(roles).where(eq(roles.id, id));
}
