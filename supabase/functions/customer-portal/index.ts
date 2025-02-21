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

  const row = await supabase
    .from("polar_supabase")
    .select("polar_id")
    .eq("supabase_id", supabaseUserId)
    .single();

  console.log("row", row);

  const polarId = row.data?.polar_id;
  if (!polarId) {
    throw new Error("Polar ID not found");
  }

  const result = await polar.customerSessions.create({
    customerId: polarId,
  });

  return new Response(
    JSON.stringify({
      customerPortal: result.customerPortalUrl,
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
