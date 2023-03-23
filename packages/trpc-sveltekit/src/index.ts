import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { FetchHandlerRequestOptions } from '@trpc/server/adapters/fetch'
import type { AnyRouter } from '@trpc/server'
import type { Handle } from '@sveltejs/kit'

/**
 * Create `handle` function for SvelteKit `hooks.server`.
 */
function createTRPCHandle<T extends AnyRouter>(options: FetchHandlerRequestOptions<T>): Handle {
  return async ({ event, resolve }) =>
    event.url.pathname.startsWith(options.endpoint) ? resolve(event) : fetchRequestHandler(options)
}

export default createTRPCHandle
