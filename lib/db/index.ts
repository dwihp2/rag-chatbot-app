import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database connection string from environment variable
const connectionString = process.env.POSTGRES_APP_POSTGRES_URL as string;

// Create postgres client
const client = postgres(connectionString, { 
  max: 1,
  ssl: 'require',
});

// Create drizzle client with our schema
export const db = drizzle(client, { schema });
