import { createFlatProxy, createRecursiveProxy } from '@trpc/server/shared'
import type { CreateQueryOptions } from '@tanstack/svelte-query'
import type { TRPCUntypedClient } from '@trpc/client'
import type { AnyRouter } from '@trpc/server'
import { getQueryKeyInternal } from '$lib/query-key/getQueryKey'
import type { TRPCSvelteQueriesRouter } from '$lib/router-remaps/createQueries'

export function createTRPCQueriesProxy<T extends AnyRouter>(
  client: TRPCUntypedClient<T>
): TRPCSvelteQueriesRouter<T> {
  const innerProxy = createRecursiveProxy((options) => {
    const anyArgs: any = options.args

    const pathCopy = [...options.path]

    const path = pathCopy.join('.')

    const [input, ...rest] = anyArgs

    const queryOptions = {
      queryKey: getQueryKeyInternal(pathCopy, input, 'query'),
      queryFn: async (_context) =>
        await client.query(path, input, {
          ...rest?.trpc,
        }),
      ...rest,
    } satisfies CreateQueryOptions

    return queryOptions
  }) as TRPCSvelteQueriesRouter<T>

  const proxy = createFlatProxy<TRPCSvelteQueriesRouter<T>>((initialKey) => innerProxy[initialKey])

  return proxy
}
