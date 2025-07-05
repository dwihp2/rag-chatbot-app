import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// Load environment variables
config({ path: '.env.local' });

// Parse the database connection string from environment variables
const connectionString = process.env.POSTGRES_APP_POSTGRES_URL as string;

async function runMigrations() {
  if (!connectionString) {
    throw new Error("Database connection string not found in environment variables");
  }

  console.log("Running migrations...");

  // Create a postgres client for the migration
  const migrationClient = postgres(connectionString, { max: 1, ssl: 'require' });

  // Create a drizzle instance using the migration client
  const db = drizzle(migrationClient);

  try {
    // Run the migrations
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    // Close the database connection
    await migrationClient.end();
  }
}

runMigrations();
