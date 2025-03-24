import { Polar } from 'npm:@polar-sh/sdk@0.32.0'

const polar = new Polar({
    server: Deno.env.get('POLAR_SERVER') ?? undefined,
    accessToken: Deno.env.get('POLAR_ACCESS_TOKEN') ?? '',
})

export default polar