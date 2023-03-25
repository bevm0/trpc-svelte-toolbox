import { FetchCreateContextFnOptions, fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { FetchHandlerRequestOptions } from '@trpc/server/adapters/fetch'
import type { AnyRouter, inferRouterContext } from '@trpc/server'
import type { Handle, RequestEvent } from '@sveltejs/kit'

const defaultEndpoint = '/trpc'

/**
 * Modified `createContext` function gets the `RequestEvent` from SvelteKit 
 * and opts from the `fetchRequestHandler` callback.
 */
type CreateContext<T extends AnyRouter> = (
  event: RequestEvent,
  opts: FetchCreateContextFnOptions
) => inferRouterContext<T>

/**
 * Make the specified keys of `T` optional.
 */
type OptionalKeys<T, Keys extends keyof T> = Omit<T, Keys> & Partial<Pick<T, Keys>>

/**
 * Make some default tRPC fetch adapter options optional.
 */
type OptionalOptions<T extends AnyRouter> = OptionalKeys<
  FetchHandlerRequestOptions<T>,
  'req' | 'endpoint'
>

/**
 * Options for `createTRPCHandle`.
 */
type Options<T extends AnyRouter> = OptionalOptions<T> & {
  createContext: CreateContext<T>
}

/**
 * Create `handle` function for SvelteKit `hooks.server`.
 */
function createTRPCHandle<T extends AnyRouter>(options: Options<T>): Handle {
  const endpoint = options.endpoint ?? defaultEndpoint

  return ({ event, resolve }) =>
    !event.url.pathname.startsWith(endpoint)
      ? resolve(event)
      : fetchRequestHandler({
          ...options,
          req: event.request,
          endpoint,
          createContext: (opts) => options?.createContext(event, opts),
        })
}

export default createTRPCHandle
