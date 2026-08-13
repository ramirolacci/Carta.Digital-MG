// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Validar si las variables están presentes y configuradas
const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'tu_supabase_url_aqui' &&
  !supabaseUrl.startsWith('VITE_SUPABASE_')
);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase no está configurado. Se utilizará LocalStorage como respaldo.'
  );
}

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export { supabase, isSupabaseConfigured };
export default supabase;
