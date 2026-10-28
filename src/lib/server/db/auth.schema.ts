import { relations } from 'drizzle-orm';
import { mysqlTable, varchar, text, timestamp, boolean, index, int } from 'drizzle-orm/mysql-core';

export const user = mysqlTable('user', {
	id: varchar('id', { length: 36 }).primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	emailVerified: boolean('email_verified').default(false).notNull(),
	image: text('image'),
	// Added by hand, not by `npm run auth:schema` — keep these if the file is regenerated.
	/** What the person may do (`roles.id`). No foreign key, so this file imports nothing; the roles
	 *  screen refuses to delete a role someone holds. Empty means a dashboard with nothing in it. */
	roleId: int('role_id'),
	/** The sign-in gate. A deactivated person keeps their history and can be reactivated. */
	isActive: boolean('is_active').default(true).notNull(),
	/** An admin chose this person's password: every dashboard page sends them to change it. */
	mustChangePassword: boolean('must_change_password').default(false).notNull(),
	createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { fsp: 3 })
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull()
});

export const session = mysqlTable(
	'session',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		expiresAt: timestamp('expires_at', { fsp: 3 }).notNull(),
		token: varchar('token', { length: 255 }).notNull().unique(),
		createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { fsp: 3 })
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: varchar('user_id', { length: 36 })
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' })
	},
	(table) => [index('session_userId_idx').on(table.userId)]
);

export const account = mysqlTable(
	'account',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: varchar('user_id', { length: 36 })
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: timestamp('access_token_expires_at', { fsp: 3 }),
		refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { fsp: 3 }),
		scope: text('scope'),
		password: text('password'),
		createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { fsp: 3 })
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('account_userId_idx').on(table.userId)]
);

export const verification = mysqlTable(
	'verification',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		identifier: varchar('identifier', { length: 255 }).notNull(),
		value: text('value').notNull(),
		expiresAt: timestamp('expires_at', { fsp: 3 }).notNull(),
		createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { fsp: 3 })
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('verification_identifier_idx').on(table.identifier)]
);

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account)
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	})
}));
