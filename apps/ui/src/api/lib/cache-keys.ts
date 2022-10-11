export type CacheApiOperation = 'list' | 'detail' | 'create' | 'mutate' | 'delete'

export type CacheKeyDictValue<S extends string> = [
  { scope: S } & { operation: CacheApiOperation } & Record<string, unknown>,
]

export interface CacheKeyDict<S extends string> {
  all: () => [{ scope: S }]
  list: {
    all: () => CacheKeyDictValue<S>
    params: (params: string | Record<string, unknown>) => CacheKeyDictValue<S>
  }
  detail: {
    all: () => CacheKeyDictValue<S>
    unique: (identifier: string | number | undefined) => CacheKeyDictValue<S>
  }
  create: {
    any: () => CacheKeyDictValue<S>
  }
  mutate: {
    any: () => CacheKeyDictValue<S>
  }
  delete: {
    any: () => CacheKeyDictValue<S>
  }
}

/**
 * Generic query keys dict factory for CRUD-related API query functions.
 *
 * Implements a design decision influenced by @tkdodo to use a single object for all react-query keys,
 * with the object specified as the lone element in the array required by react-query.
 *
 * @see {@link https://twitter.com/TkDodo/status/1448216950732169216}
 */
export const createQueryCacheKeys = <S extends string>(scope: S): CacheKeyDict<S> => {
  const all: [{ scope: S }] = [{ scope }]

  return {
    all: () => all,
    list: {
      all: () => [{ ...all[0], operation: 'list' }],
      params: (params: string | Record<string, unknown>) => [{ ...createQueryCacheKeys(scope).list.all()[0], params }],
    },
    detail: {
      all: () => [{ ...all[0], operation: 'detail' }],
      unique: (identifier: string | number | undefined) => [
        { ...createQueryCacheKeys(scope).detail.all()[0], identifier },
      ],
    },
    create: {
      any: () => [{ ...all[0], operation: 'create' }],
    },
    mutate: {
      any: () => [{ ...all[0], operation: 'mutate' }],
    },
    delete: {
      any: () => [{ ...all[0], operation: 'delete' }],
    },
  }
}
