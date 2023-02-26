import type { AnyRouter } from '@trpc/server';
import { createRecursiveProxy } from '@trpc/server/shared';
import { getArrayQueryKey } from '../../internals/getArrayQueryKey';
import { getQueryKey } from '../../internals/getQueryKey';
import type { CreateSvelteQueryHooks } from '../hooks/createHooksInternal';

/**
 * Create proxy for decorating procedures
 * @internal
 */
export function createReactProxyDecoration<
  TRouter extends AnyRouter,
  TSSRContext = unknown,
>(name: string, hooks: CreateSvelteQueryHooks<TRouter, TSSRContext>) {
  return createRecursiveProxy((opts) => {
    const args = opts.args;

    const pathCopy = [name, ...opts.path];

    // The last arg is for instance `.useMutation` or `.useQuery()`
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lastArg = pathCopy.pop()!;

    // The `path` ends up being something like `post.byId`
    const path = pathCopy.join('.');
    if (lastArg === 'useMutation') {
      return (hooks as any)[lastArg](path, ...args);
    }
    const [input, ...rest] = args;

    const queryKey = getQueryKey(path, input);

    // Expose queryKey helper
    if (lastArg === 'getQueryKey') {
      return getArrayQueryKey(queryKey, (rest[0] as any) ?? 'any');
    }

    if (lastArg.startsWith('useSuspense')) {
      const opts = rest[0] || {};
      const fn =
        lastArg === 'useSuspenseQuery' ? 'useQuery' : 'useInfiniteQuery';
      const result = (hooks as any)[fn](queryKey, {
        ...opts,
        suspense: true,
        enabled: true,
      });
      return [result.data, result];
    }
    return (hooks as any)[lastArg](queryKey, ...rest);
  });
}
