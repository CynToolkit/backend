import { createClient } from 'jsr:@supabase/supabase-js@2.53.0'
import { Database } from './database.types.ts'

const __SUPABASE_URL__ = Deno.env.get('SUPABASE_URL')
const __SUPABASE_ANON_KEY__ = Deno.env.get('SUPABASE_ANON_KEY')
const __SUPABASE_SERVICE_ROLE_KEY__ = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// ensure supabase env variables are available at build time
if (!__SUPABASE_URL__ || !__SUPABASE_ANON_KEY__ || !__SUPABASE_SERVICE_ROLE_KEY__) {
  throw new Error('Supabase environment variables are not configured.')
}

export const supabase = createClient<Database>(__SUPABASE_URL__, __SUPABASE_ANON_KEY__)

export const supabaseAdmin = createClient<Database>(__SUPABASE_URL__, __SUPABASE_SERVICE_ROLE_KEY__)

