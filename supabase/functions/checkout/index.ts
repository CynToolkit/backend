import { supabase } from "../_shared/supabase.ts";
import polar from "../_shared/polarsh.ts";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const polarServer = Deno.env.get("POLAR_SERVER")!;
  const products = [];

  if (polarServer === "sandbox") {
    products.push("a5172e5b-3c2a-4e93-8eb2-9675a9adfdcd");
    products.push("201bf8a7-efa3-42dd-970e-61a242c3c287");
  } else {
    products.push("4f3a3e6f-5195-4583-9488-e06108ac7547");
    // products.push("1505c35a-3566-4964-a57e-bbda3fa1c945")
    // products.push("133e7e09-7127-43d5-9821-5463cce9dc81")
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

  // const row = await supabase
  //   .from("polar_supabase")
  //   .select("polar_id")
  //   .eq("supabase_id", supabaseUserId)
  //   .single();

  // console.log("row", row);

  const polarCustomer = await polar.customers.getExternal({
    externalId: supabaseUserId,
  });
  const polarId = polarCustomer.id;
  if (!polarId) {
    throw new Error("Polar ID not found");
  }

  const checkout = await polar.checkouts.create({
    products: products,
    customerId: polarId,
  });

  return new Response(
    JSON.stringify({
      checkoutURL: checkout.url,
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
