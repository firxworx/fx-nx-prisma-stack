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
import { createQueryCacheKeys } from '../lib/cache-keys'

type ParentContext = ApiParentContext<BoxProfileChildQueryContext>

const VIDEOS_QUERY_SCOPE = 'videos' as const

const cacheKeys = createQueryCacheKeys(VIDEOS_QUERY_SCOPE)
export { cacheKeys as videoQueryCacheKeys }

export function useVideosQuery(pctx: ParentContext): Pick<UseQueryResult<VideoDto[]>, ApiQueryProps> {
  const { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch } = useQuery<
    VideoDto[]
  >(cacheKeys.list.all(), () => fetchVideos({ parentContext: pctx?.parentContext }), {
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
    cacheKeys.list.params(sortFilterPaginateParams),
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
    useQuery<VideoDto>(cacheKeys.detail.unique(uuid), () => fetchVideo({ parentContext: parentContext, uuid }), {
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
  >(fetchCreateVideo, {
    onSuccess: (data, variables, context) => {
      if (typeof options?.onSuccess === 'function') {
        options.onSuccess(data, variables, context)
      }

      // optimistic update local query cache with values
      const { uuid, ...restData } = data
      queryClient.setQueryData(cacheKeys.detail.unique(uuid), restData)
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
  >(fetchMutateVideo, {
    onSuccess: async (data, vars, context) => {
      queryClient.setQueryData(cacheKeys.detail.unique(vars.uuid), data)

      if (typeof options?.onSuccess === 'function') {
        return options.onSuccess(data, vars, context)
      }
    },
  })

  return { mutate, mutateAsync, data, reset, error, isSuccess, isLoading, isError }
}

interface VideoDeleteQueryContext {
  previous?: VideoDto[]
}

export function useVideoDeleteQuery(
  options?: UseMutationOptions<void, Error, ApiDeleteRequestDto & ParentContext, unknown>,
): Pick<
  UseMutationResult<void, Error, ApiDeleteRequestDto & ParentContext, VideoDeleteQueryContext>,
  ApiDeleteHookProps
> {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError } = useMutation<
    void,
    Error,
    ApiDeleteRequestDto & ParentContext,
    VideoDeleteQueryContext
  >(
    fetchDeleteVideo,
    // @todo experimenting with rollback type functionality -- check docs + examples in case there are other patterns
    {
      onSuccess: async (data, vars, context) => {
        if (typeof options?.onSuccess === 'function') {
          options.onSuccess(data, vars, context)
        }
      },
      onMutate: async ({ uuid }) => {
        // cancel any outstanding refetch queries to avoid overwriting optimistic update
        await queryClient.cancelQueries(cacheKeys.all())

        // snapshot previous value to enable rollback onError()
        const previous = queryClient.getQueryData<VideoDto[]>(cacheKeys.list.all())
        const removed = previous?.filter((item) => item.uuid !== uuid)

        // optimistically update to the new value
        // (note: could refactor to use updater function which receives previous data as argument)
        if (previous) {
          queryClient.setQueryData<VideoDto[]>(cacheKeys.list.all(), removed)
        }

        return { previous }
      },
      onError: (_error, _vars, context) => {
        // rollback on failure using the context returned by onMutate()
        if (context && context?.previous) {
          queryClient.setQueryData<VideoDto[]>(cacheKeys.list.all(), context.previous)
        }
      },
      // onSettled: (_data, _error, vars, _context) => {
      //   const invalidateItems = queryClient.invalidateQueries(cacheKeys.list.all())
      //   // refetch data (react-query will await before proceeding if return value is a promise)
      //   return invalidateItems
      // },
    },
  )

  return { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError }
}
