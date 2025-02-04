// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import polar from '../_shared/polarsh.ts'

type Record = {
  type: "INSERT",
  table: "identities",
  record: {
    id: string,
    email: string,
    user_id: string,
    provider: "email",
    created_at: string
    updated_at: string
    provider_id: string
    identity_data: {
      sub: string
      email: string
      email_verified: false,
      phone_verified: false
    },
    last_sign_in_at: string
  },
  schema: "auth",
  old_record: null
}

Deno.serve(async (req) => {
  const data = await req.json() as Record
  console.log('data', data)

  const customerResult = await polar.customers.create({
    email: data.record.email,
    organizationId: Deno.env.get('POLAR_ORGANIZATION_ID')!,
    metadata: {
      supabaseId: data.record.id
    }
  });

  console.log('result', customerResult)

  const session = await polar.customerSessions.create({
    customerId: customerResult.id,
  });

  console.log('session', session)

  const response = {
    success: true,
    message: 'Polar user created',
    polar: {
      customerPortalURL: session.customerPortalUrl,
      id: customerResult.id
    },
    supabase: {
      id: data.record.id
    }
  }

  console.log('response', response)

  return new Response(
    JSON.stringify(response),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/webhook-post-account-creation' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
