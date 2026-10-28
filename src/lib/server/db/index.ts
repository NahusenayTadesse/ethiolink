import { drizzle } from 'drizzle-orm/mysql2';
import { env } from '$env/dynamic/private';
import { createPool } from './connection';
import * as schema from './schema';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// UTC sessions and a small pool — see `connection.ts`.
const client = createPool(env.DATABASE_URL);

export const db = drizzle(client, { schema, mode: 'default' });
