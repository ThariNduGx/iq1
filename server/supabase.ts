import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase connection
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables');
}

// Create a Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);