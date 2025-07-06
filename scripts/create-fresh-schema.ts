import { config } from 'dotenv';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Load environment variables
config({ path: '.env.local' });

// Database connection string from environment variable
const connectionString = process.env.POSTGRES_APP_POSTGRES_URL as string;

if (!connectionString) {
  console.error('❌ Database connection string not found in environment variables');
  process.exit(1);
}

// Create postgres client
const client = postgres(connectionString, {
  max: 1,
  ssl: 'require',
});

// Create drizzle client
const db = drizzle(client);

async function createFreshSchema() {
  try {
    console.log('🏗️ Creating fresh database schema...');

    // Create chats table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "chats" (
        "id" text PRIMARY KEY NOT NULL,
        "title" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('✅ Created chats table');

    // Create documents table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "documents" (
        "id" text PRIMARY KEY NOT NULL,
        "title" text NOT NULL,
        "content" text NOT NULL,
        "metadata" json,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('✅ Created documents table');

    // Create chunks table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "chunks" (
        "id" text PRIMARY KEY NOT NULL,
        "document_id" text NOT NULL,
        "content" text NOT NULL,
        "embedding" json,
        "metadata" json,
        "created_at" timestamp DEFAULT now() NOT NULL,
        FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE
      );
    `);
    console.log('✅ Created chunks table');

    // Create messages table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "messages" (
        "id" text PRIMARY KEY NOT NULL,
        "chat_id" text NOT NULL,
        "role" text NOT NULL,
        "content" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE
      );
    `);
    console.log('✅ Created messages table');

    console.log('🎉 Fresh database schema created successfully!');
    console.log('📝 Database is ready for the Enhanced RAG system');

  } catch (error) {
    console.error('❌ Error creating schema:', error);
    throw error;
  } finally {
    // Close the database connection
    await client.end();
  }
}

// Run the schema creation if this script is called directly
if (require.main === module) {
  createFreshSchema()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Schema creation failed:', error);
      process.exit(1);
    });
}

export { createFreshSchema };
