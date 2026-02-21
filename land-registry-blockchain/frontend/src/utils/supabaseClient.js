import { createClient } from '@supabase/supabase-js';

// The user provided this key, but not the URL. We use a fallback placeholder if env is not set.
// Make sure to add VITE_SUPABASE_URL to your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_dSqbr0A0FyE0jfWJfmCyng_nCPYd3fk';

export const supabase = createClient(supabaseUrl, supabaseKey);
