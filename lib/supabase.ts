import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Supabase credentials from .env.local
const supabaseUrl = process.env.POSTGRES_APP_SUPABASE_URL as string;
const supabaseKey = process.env.POSTGRES_APP_SUPABASE_SERVICE_ROLE_KEY as string;

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey);
