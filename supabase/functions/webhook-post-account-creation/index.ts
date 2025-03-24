// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import polar from '../_shared/polarsh.ts'
import { supabase } from '../_shared/supabase.ts'
import { corsHeaders } from '../_shared/cors.ts'

type PolarSupabaseLinkRecord = {
    id: string; // UUID for the link record itself, auto-generated
    supabase_user_id: string; // UUID from auth.users table
    polar_customer_id: string; // Polar customer ID
    created_at?: string; // Optional, timestamp if needed, auto-generated
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const userResult = await supabase.auth.getUser(token);

    if (userResult.error) {
        console.error('Error fetching user:', userResult.error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to authenticate user.',
            error: userResult.error.message,
        }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUserId = userResult.data.user?.id;

    if (!supabaseUserId) {
        console.log('No Supabase user ID found in token');
        return new Response(JSON.stringify({
            success: false,
            message: 'No Supabase user ID found.',
        }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // // Check if a link already exists in the polar_supabase_link table
    // const existingLink = await supabase
    //     .from('polar_supabase')
    //     .select('polar_id')
    //     .eq('supabase_id', supabaseUserId)
    //     .maybeSingle(); // Use maybeSingle to handle cases where no record is found gracefully

    // if (existingLink.error) {
    //     console.error('Error checking existing link:', existingLink.error);
    //     return new Response(JSON.stringify({
    //         success: false,
    //         message: 'Error checking existing Polar link.',
    //         error: existingLink.error.message,
    //     }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    // }

    // if (existingLink.data) {
    //     const polarCustomerId = existingLink.data.polar_id;
    //     console.log(`Polar user link already exists for Supabase user ID: ${supabaseUserId}, Polar Customer ID: ${polarCustomerId}`);
    //     return new Response(JSON.stringify({
    //         success: true,
    //         message: 'Polar user already linked',
    //         polar: {
    //             id: polarCustomerId,
    //         },
    //         supabase: {
    //             id: supabaseUserId,
    //         }
    //     }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); // Changed status to 400 to indicate it's not an error but an existing link
    // }

    const email = userResult.data.user?.email;

    if (!email) {
        console.log('No email found for Supabase user ID:', supabaseUserId);
        return new Response(JSON.stringify({
            success: false,
            message: 'No email found for Supabase user.',
        }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Create a new customer in Polar
    const customerResult = await polar.customers.create({
        email: email,
        externalId: supabaseUserId,
        metadata: {
            supabaseId: supabaseUserId
        }
    });
    console.log('Polar customer created', customerResult);

    if (!customerResult.id) {
        console.error('Failed to create Polar customer. Polar API response:', customerResult);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to create Polar customer.',
            polarError: customerResult // Consider more specific error handling from polar.customers.create
        }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }


    // // Insert the link into the polar_supabase_link table
    // const insertResult = await supabase
    //     .from('polar_supabase')
    //     .insert({
    //         polar_id: customerResult.id,
    //         supabase_id: supabaseUserId,
    //     })
    //     .select('polar_id') // Optionally select polar_customer_id to return it directly
    //     .single(); // Expecting single insertion

    // if (insertResult.error) {
    //     console.error('Error inserting link into polar_supabase_link table:', insertResult.error);
    //     return new Response(JSON.stringify({
    //         success: false,
    //         message: 'Failed to link Polar and Supabase users in database.',
    //         dbError: insertResult.error.message,
    //     }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    // }

    const response = {
        success: true,
        message: 'Polar and Supabase linked successfully.',
        // polar: {
        //     id: insertResult.data.polar_id, // Use polar_customer_id from the inserted row
        // },
        supabase: {
            id: supabaseUserId,
        }
    };

    console.log('response', response);

    return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
});