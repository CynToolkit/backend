import { Webhooks } from "jsr:@polar-sh/deno";

Deno.serve(
    Webhooks({
        webhookSecret: Deno.env.get('POLAR_WEBHOOK_SECRET') ?? '',
        onPayload: async (payload) => {
          
        },
    })
);