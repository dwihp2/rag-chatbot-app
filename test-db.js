require('dotenv').config({ path: '.env.local' });

console.log('Environment variables:');
console.log('POSTGRES_APP_POSTGRES_URL:', process.env.POSTGRES_APP_POSTGRES_URL ? 'Set' : 'Not set');
console.log('POSTGRES_APP_SUPABASE_URL:', process.env.POSTGRES_APP_SUPABASE_URL ? 'Set' : 'Not set');
console.log('POSTGRES_APP_SUPABASE_SERVICE_ROLE_KEY:', process.env.POSTGRES_APP_SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');
