// import { Polar } from 'npm:@polar-sh/sdk'

// const polar = new Polar({
//     server: Deno.env.get('POLAR_SERVER') ?? '',
//     accessToken: Deno.env.get('POLAR_ACCESS_TOKEN') ?? '',
// })

// export default polar

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Database } from './database.types.ts'

const __SUPABASE_URL__ = Deno.env.get('SUPABASE_URL')
const __SUPABASE_ANON_KEY__ = Deno.env.get('SUPABASE_ANON_KEY')

// ensure supabase env variables are available at build time
if (!__SUPABASE_URL__ || !__SUPABASE_ANON_KEY__) {
  throw new Error('Supabase environment variables are not configured.')
}

export const supabase = createClient<Database>(__SUPABASE_URL__, __SUPABASE_ANON_KEY__)
