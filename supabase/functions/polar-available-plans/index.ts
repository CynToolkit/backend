import { supabase } from "../_shared/supabase.ts";
import polar from "../_shared/polarsh.ts";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Fetch all active available plans from Polar
  const plansResponse = await polar.products.list({
    isArchived: false,
    isRecurring: true,
  });

  const activePlans = [];
  for await (const page of plansResponse) {
    activePlans.push(...page.result.items);
  }

  // Format the plans according to the designed data structure
  const formattedPlans = activePlans.map((plan) => ({
    ...plan,
  }));

  return new Response(
    JSON.stringify({
      success: true,
      plans: formattedPlans,
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
