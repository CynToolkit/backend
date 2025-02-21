import { Polar } from 'npm:@polar-sh/sdk@0.26.1'

const polar = new Polar({
    server: Deno.env.get('POLAR_SERVER') ?? '',
    accessToken: Deno.env.get('POLAR_ACCESS_TOKEN') ?? '',
})

export default polar