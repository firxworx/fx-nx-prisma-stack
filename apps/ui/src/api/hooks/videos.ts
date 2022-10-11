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
import type { ApiDeleteRequestDto, ApiMutateRequestDto } from '../../types/api.types'
import {
  fetchVideo,
  fetchVideos,
  fetchVideosWithConstraints,
  fetchMutateVideoWithParentContext,
  fetchCreateVideoWithParentContext,
  fetchDeleteVideoWithParentContext,
} from '../fetchers/videos'
import type { ApiParentContext } from '../types/common.types'
import type { BoxProfileChildQueryContext } from '../../types/box-profiles.types'
import { createQueryCacheKeys } from '../lib/cache-keys'
import { useParentContext } from '../../context/ParentContextProvider'

type ParentContext = ApiParentContext<BoxProfileChildQueryContext>

const VIDEOS_QUERY_SCOPE = 'videos' as const

const cacheKeys = createQueryCacheKeys(VIDEOS_QUERY_SCOPE)
export { cacheKeys as videoQueryCacheKeys }

export function useVideosQuery(): UseQueryResult<VideoDto[]> {
  const { box } = useParentContext()

  return useQuery<VideoDto[]>(cacheKeys.list.all(), () => fetchVideos({ parentContext: box }), {
    enabled: !!box?.boxProfileUuid?.length,
  })
}

export function useVideosDataQuery({
  sortFilterPaginateParams,
}: ParentContext & { sortFilterPaginateParams: string }): UseQueryResult<VideoDto[]> {
  const { box } = useParentContext()

  return useQuery<VideoDto[]>(
    cacheKeys.list.params(sortFilterPaginateParams),
    () => fetchVideosWithConstraints({ parentContext: box, sortFilterPaginateParams }),
    {
      enabled: !!box?.boxProfileUuid?.length,
    },
  )
}

export function useVideoQuery({ uuid }: { uuid: string | undefined }): UseQueryResult<VideoDto> {
  const { box } = useParentContext()

  return useQuery<VideoDto>(cacheKeys.detail.unique(uuid), () => fetchVideo({ parentContext: box, uuid }), {
    enabled: !!uuid?.length && !!box?.boxProfileUuid?.length,
  })
}

export function useVideoCreateQuery(
  options?: UseMutationOptions<VideoDto, Error, CreateVideoDto>,
): UseMutationResult<VideoDto, Error, CreateVideoDto> {
  const { box } = useParentContext()
  const queryClient = useQueryClient()

  return useMutation<VideoDto, Error, CreateVideoDto>(fetchCreateVideoWithParentContext(box), {
    onSuccess: (data, vars, context) => {
      // update query cache with response data
      const { uuid, ...restData } = data
      queryClient.setQueryData(cacheKeys.detail.unique(uuid), restData)

      queryClient.invalidateQueries(cacheKeys.list.all())

      if (typeof options?.onSuccess === 'function') {
        options.onSuccess(data, vars, context)
      }
    },
  })
}

export function useVideoMutateQuery(
  options?: UseMutationOptions<VideoDto, Error, ApiMutateRequestDto<UpdateVideoDto>>,
): UseMutationResult<VideoDto, Error, ApiMutateRequestDto<UpdateVideoDto>> {
  const { box } = useParentContext()
  const queryClient = useQueryClient()

  return useMutation<VideoDto, Error, ApiMutateRequestDto<UpdateVideoDto>>(fetchMutateVideoWithParentContext(box), {
    onSuccess: async (data, vars, context) => {
      queryClient.setQueryData(cacheKeys.detail.unique(vars.uuid), data)
      const promise = queryClient.invalidateQueries(cacheKeys.list.all())

      if (typeof options?.onSuccess === 'function') {
        options.onSuccess(data, vars, context)
      }

      // react-query will await outcome if a promise is returned
      return promise
    },
  })
}

interface VideoDeleteQueryContext {
  previous?: VideoDto[]
}

export function useVideoDeleteQuery(
  options?: UseMutationOptions<void, Error, ApiDeleteRequestDto, VideoDeleteQueryContext>,
): UseMutationResult<void, Error, ApiDeleteRequestDto, VideoDeleteQueryContext> {
  const { box } = useParentContext()
  const queryClient = useQueryClient()

  return useMutation<void, Error, ApiDeleteRequestDto, VideoDeleteQueryContext>(
    fetchDeleteVideoWithParentContext(box),
    {
      onSuccess: async (data, vars, context) => {
        // remove deleted item's data from cache
        queryClient.removeQueries(cacheKeys.detail.unique(vars.uuid))

        if (typeof options?.onSuccess === 'function') {
          options.onSuccess(data, vars, context)
        }
      },
      onMutate: async ({ uuid }) => {
        // cancel any outstanding refetch queries to avoid overwriting optimistic update
        await queryClient.cancelQueries(cacheKeys.all())

        // snapshot previous value to enable rollback on error
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
    },
  )
}
