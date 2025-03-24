import { supabase } from "../_shared/supabase.ts";
import polar from "../_shared/polarsh.ts";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization")!;
  const token = authHeader.replace("Bearer ", "");
  const userResult = await supabase.auth.getUser(token);

  if (userResult.error) {
    console.error("Error fetching user:", userResult.error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to authenticate user.",
        error: userResult.error.message,
      }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const supabaseUserId = userResult.data.user?.id;

  if (!supabaseUserId) {
    console.log("No Supabase user ID found in token");
    return new Response(
      JSON.stringify({
        success: false,
        message: "No Supabase user ID found.",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const polarCustomer = await polar.customers.getExternal({
    externalId: supabaseUserId,
  });

  // const row = await supabase
  //   .from("polar_supabase")
  //   .select("polar_id")
  //   .eq("supabase_id", supabaseUserId)
  //   .single();

  // console.log("row", row);

  const polarId = polarCustomer.id;
  if (!polarId) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Polar ID not found.",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // 2.  Get the user's subscriptions (which include plan information)
  const polarPagesResponse = await polar.subscriptions.list({
    customerId: polarId,
  });

  console.log("Subscriptions:", polarPagesResponse);

  const userSubscriptions: any[] = []
  for await (const page of polarPagesResponse) {
    // Handle the page
    console.log(page);

    const subscriptions = page.result.items;

    // 3. Extract and display plan information from the subscriptions
    console.log("Current User Plans:");
    subscriptions.forEach((subscription) => {
      if (subscription.status === "active") { // Only display active subscriptions
        userSubscriptions.push(subscription)
      }
    });
  }

  return new Response(
    JSON.stringify({
      subscriptions: userSubscriptions,
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
});
