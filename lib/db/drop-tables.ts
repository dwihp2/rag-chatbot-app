import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config({ path: '.env.local' });

// Parse the database connection string from environment variables
const connectionString = process.env.POSTGRES_APP_POSTGRES_URL as string;

async function dropTables() {
  if (!connectionString) {
    throw new Error("Database connection string not found in environment variables");
  }

  console.log("Dropping existing tables...");

  // Create a postgres client
  const client = postgres(connectionString, { max: 1, ssl: 'require' });

  try {
    // Drop tables in reverse order of dependencies
    await client`DROP TABLE IF EXISTS chunks CASCADE`;
    await client`DROP TABLE IF EXISTS messages CASCADE`;
    await client`DROP TABLE IF EXISTS documents CASCADE`;
    await client`DROP TABLE IF EXISTS chats CASCADE`;

    console.log("Tables dropped successfully!");
  } catch (error) {
    console.error("Error dropping tables:", error);
    throw error;
  } finally {
    // Close the database connection
    await client.end();
  }
}

dropTables();
