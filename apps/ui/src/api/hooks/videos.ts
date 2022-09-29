// @todo create shared lib with interfaces of api responses

import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query'

import type { VideoDto, CreateVideoDto, UpdateVideoDto } from '../../types/videos.types'
import type { ApiQueryProps } from '../types/query.types'
import type { ApiDeleteHookProps, ApiMutationProps } from '../types/mutation.types'
import type { ApiDeleteRequestDto, ApiMutateRequestDto } from '../../types/api.types'
import {
  fetchCreateVideo,
  fetchDeleteVideo,
  fetchVideo,
  fetchVideos,
  fetchMutateVideo,
  fetchVideosWithConstraints,
} from '../fetchers/videos'
import type { ApiParentContext } from '../types/common.types'
import type { BoxProfileChildQueryContext } from '../../types/box-profiles.types'

type ParentContext = ApiParentContext<BoxProfileChildQueryContext>

const VIDEOS_KEY_BASE = 'videos' as const

/**
 * Query keys for videos API query functions.
 *
 * A design decision influenced by @tkdodo is to use a single object for all react-query keys,
 * specified as the only element in the query keys array.
 *
 * @see {@link https://twitter.com/TkDodo/status/1448216950732169216}
 */
const videoQueryKeys = {
  all: [{ scope: VIDEOS_KEY_BASE }] as const,
  listItems: () => [{ ...videoQueryKeys.all[0], operation: 'listItems' }] as const,
  listItemsWithConstraints: (sortFilterPaginateParams: string) =>
    [{ ...videoQueryKeys.listItems()[0], constraints: sortFilterPaginateParams }] as const,
  details: () => [{ ...videoQueryKeys.all[0], operation: 'detail' }] as const,
  detail: (uuid: string | undefined) => [{ ...videoQueryKeys.details()[0], uuid }] as const,
  create: () => [{ ...videoQueryKeys.all[0], operation: 'create' }] as const,
  mutate: () => [{ ...videoQueryKeys.all[0], operation: 'mutate' }] as const,
  delete: () => [{ ...videoQueryKeys.all[0], operation: 'delete' }] as const,
}

export function useVideosQuery(pctx: ParentContext): Pick<UseQueryResult<VideoDto[]>, ApiQueryProps> {
  const { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch } = useQuery<
    VideoDto[]
  >(videoQueryKeys.listItems(), () => fetchVideos({ parentContext: pctx?.parentContext }), {
    enabled: !!pctx?.parentContext?.boxProfileUuid?.length,
  })
  return { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch }
}

export function useVideosDataQuery({
  parentContext,
  sortFilterPaginateParams,
}: ParentContext & { sortFilterPaginateParams: string }): Pick<UseQueryResult<VideoDto[]>, ApiQueryProps> {
  const { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch } = useQuery<
    VideoDto[]
  >(
    videoQueryKeys.listItemsWithConstraints(sortFilterPaginateParams),
    () => fetchVideosWithConstraints({ parentContext: parentContext, sortFilterPaginateParams }),
    {
      enabled: !!parentContext?.boxProfileUuid?.length,
    },
  )
  return { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch }
}

export function useVideoQuery({
  parentContext,
  uuid,
}: ParentContext & { uuid: string | undefined }): Pick<UseQueryResult<VideoDto>, ApiQueryProps> {
  const { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch } =
    useQuery<VideoDto>(videoQueryKeys.detail(uuid), () => fetchVideo({ parentContext: parentContext, uuid }), {
      enabled: !!uuid?.length && !!parentContext?.boxProfileUuid?.length,
    })

  return { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch }
}

export function useVideoCreateQuery(
  options?: UseMutationOptions<VideoDto, Error, CreateVideoDto & ParentContext>,
): Pick<UseMutationResult<VideoDto, Error, CreateVideoDto & ParentContext>, ApiMutationProps> {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, data, reset, error, isSuccess, isLoading, isError } = useMutation<
    VideoDto,
    Error,
    CreateVideoDto & ParentContext
  >(videoQueryKeys.create(), fetchCreateVideo, {
    onSuccess: (data, variables, context) => {
      if (typeof options?.onSuccess === 'function') {
        options.onSuccess(data, variables, context)
      }

      // optimistic update local query cache with values
      const { uuid, ...restData } = data
      queryClient.setQueryData(videoQueryKeys.detail(uuid), restData)
    },
  })

  return { mutate, mutateAsync, data, reset, error, isSuccess, isLoading, isError }
}

export function useVideoMutateQuery(
  options?: UseMutationOptions<VideoDto, Error, ApiMutateRequestDto<UpdateVideoDto> & ParentContext>,
): Pick<UseMutationResult<VideoDto, Error, ApiMutateRequestDto<UpdateVideoDto> & ParentContext>, ApiMutationProps> {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, data, reset, error, isSuccess, isLoading, isError } = useMutation<
    VideoDto,
    Error,
    ApiMutateRequestDto<UpdateVideoDto> & ParentContext
  >(videoQueryKeys.mutate(), fetchMutateVideo, {
    onSuccess: async (data, variables, context) => {
      if (typeof options?.onSuccess === 'function') {
        options.onSuccess(data, variables, context)
      }

      // @todo optimistic update with previous + changed values (merged) prior to refetch?

      const invalidateItems = queryClient.invalidateQueries(videoQueryKeys.all)
      const invalidateItem: Promise<unknown> = queryClient.invalidateQueries(videoQueryKeys.detail(variables.uuid))

      // refetch data -- ensure a Promise is returned so the outcome is awaited
      return Promise.all([invalidateItems, invalidateItem])
    },
  })

  return { mutate, mutateAsync, data, reset, error, isSuccess, isLoading, isError }
}

interface DeleteQueryContext {
  previous?: VideoDto[]
}

export function useVideoDeleteQuery(
  options?: UseMutationOptions<void, Error, ApiDeleteRequestDto & ParentContext, unknown>,
): Pick<UseMutationResult<void, Error, ApiDeleteRequestDto & ParentContext, DeleteQueryContext>, ApiDeleteHookProps> {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError } = useMutation<
    void,
    Error,
    ApiDeleteRequestDto & ParentContext,
    DeleteQueryContext
  >(
    videoQueryKeys.delete(),
    fetchDeleteVideo,
    // @todo experimenting with rollback type functionality -- check docs + examples in case there are other patterns
    {
      onSuccess: async (data, vars, context) => {
        if (typeof options?.onSuccess === 'function') {
          options.onSuccess(data, vars, context)
        }
      },
      onMutate: async ({ uuid }) => {
        // cancel any outgoing refetch queries to avoid overwriting optimistic update
        await queryClient.cancelQueries(videoQueryKeys.all)

        // snapshot previous value to enable rollback onError()
        const previous = queryClient.getQueryData<VideoDto[]>(videoQueryKeys.listItems())
        console.log('previous value:', JSON.stringify(previous, null, 2))
        const removed = previous?.filter((item) => item.uuid !== uuid)
        console.log('removed value', JSON.stringify(removed, null, 2))

        // optimistically update to the new value
        // (note: could refactor to use updater func which receives old datas)
        if (previous) {
          queryClient.setQueryData<VideoDto[]>(videoQueryKeys.listItems(), removed)
        }

        return { previous }
      },
      // optimistic rollback functionality experiment
      // @see https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientsetquerydata
      onError: (_error, _vars, context) => {
        // rollback on failure using the context returned by onMutate()
        // @todo revise to base query keys for sort/filter/paginated data (video api hook)
        if (context && context?.previous) {
          queryClient.setQueryData<VideoDto[]>(videoQueryKeys.listItems(), context.previous)
        }
      },
      onSettled: (_data, _error, vars, _context) => {
        const invalidateItems = queryClient.invalidateQueries(videoQueryKeys.all)
        queryClient.removeQueries(videoQueryKeys.detail(vars.uuid))

        // refetch data (react-query will await before proceeding if return value is a promise)
        return invalidateItems
      },
    },
  )

  return { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError }
}
