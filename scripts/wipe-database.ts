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

async function wipeDatabase() {
  try {
    console.log('🗑️ Starting database wipe...');

    // Drop all tables in the correct order (respecting foreign key constraints)
    console.log('🔄 Dropping tables...');

    // Drop dependent tables first
    await db.execute(sql`DROP TABLE IF EXISTS "chunks" CASCADE;`);
    console.log('✅ Dropped chunks table');

    await db.execute(sql`DROP TABLE IF EXISTS "messages" CASCADE;`);
    console.log('✅ Dropped messages table');

    await db.execute(sql`DROP TABLE IF EXISTS "documents" CASCADE;`);
    console.log('✅ Dropped documents table');

    await db.execute(sql`DROP TABLE IF EXISTS "chats" CASCADE;`);
    console.log('✅ Dropped chats table');

    // Drop the drizzle migrations table
    await db.execute(sql`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE;`);
    console.log('✅ Dropped drizzle migrations table');

    console.log('🎉 Database wiped successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Run: npm run db:generate');
    console.log('   2. Run: npm run db:migrate');
    console.log('   3. Upload new documents with the enhanced RAG system');

  } catch (error) {
    console.error('❌ Error wiping database:', error);
    throw error;
  } finally {
    // Close the database connection
    await client.end();
  }
}

// Run the wipe if this script is called directly
if (require.main === module) {
  wipeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Database wipe failed:', error);
      process.exit(1);
    });
}

export { wipeDatabase };
