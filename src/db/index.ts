import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

/**
 * Database connection initialization
 * 
 * Sets up the LibSQL client for Turso and initializes Drizzle ORM.
 * Uses environment variables for configuration.
 */

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
}

const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export type Db = typeof db;
