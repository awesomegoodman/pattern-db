import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

// Transaction mode (port 6543) for Vercel serverless compatibility.
// prepare: false is required for PgBouncer transaction mode.
const client = postgres(process.env.DATABASE_URL!, { prepare: false });

export const db = drizzle(client, { schema, logger: process.env.NODE_ENV === 'development' });
