import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query'

import type { ApiDeleteRequestDto, ApiMutateRequestDto } from '../../types/api.types'
import type { CreateVideoGroupDto, UpdateVideoGroupDto, VideoGroupDto } from '../../types/videos.types'
import type { ApiDeleteHookProps, ApiMutationProps } from '../types/mutation.types'
import type { ApiQueryProps } from '../types/query.types'

import {
  createVideoGroup,
  deleteVideoGroup,
  fetchVideoGroup,
  fetchVideoGroups,
  fetchVideoGroupsWithConstraints,
  updateVideoGroup,
} from '../fetchers/video-groups'
import type { ApiParentContext } from '../types/common.types'
import type { BoxProfileChildQueryContext } from '../../types/box-profiles.types'

type ParentContext = ApiParentContext<BoxProfileChildQueryContext>

const VIDEO_GROUPS_KEY_BASE = 'videoGroups' as const

/**
 * Query keys for video groups API queries.
 */
const videoGroupQueryKeys = {
  // all query key base
  all: [{ scope: VIDEO_GROUPS_KEY_BASE }] as const,

  // operation-specific query keys
  listItems: () => [{ ...videoGroupQueryKeys.all[0], operation: 'list' }] as const,
  listItemsWithConstraints: (sortFilterPaginateParams: string) =>
    [{ ...videoGroupQueryKeys.listItems()[0], constraints: sortFilterPaginateParams }] as const,
  details: () => [{ ...videoGroupQueryKeys.all[0], operation: 'detail' }] as const,
  detail: (uuid: string | undefined) => [{ ...videoGroupQueryKeys.details()[0], uuid }] as const,
  create: () => [{ ...videoGroupQueryKeys.all[0], operation: 'create' }] as const,
  mutate: () => [{ ...videoGroupQueryKeys.all[0], operation: 'mutate' }] as const,
  delete: () => [{ ...videoGroupQueryKeys.all[0], operation: 'delete' }] as const,
}

// export type VideoGroupQueryEndpoint = 'all' | 'details' | 'detail' | 'create' | 'mutate' | 'delete'

export function useVideoGroupsQuery(pctx: ParentContext): Pick<UseQueryResult<VideoGroupDto[]>, ApiQueryProps> {
  const { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch } = useQuery(
    videoGroupQueryKeys.listItems(),
    () => fetchVideoGroups({ parentContext: pctx?.parentContext }),
    {
      enabled: !!pctx?.parentContext?.boxProfileUuid?.length,
    },
  )

  return { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch }
}

export function useVideoGroupsDataQuery({
  parentContext,
  sortFilterPaginateParams,
}: ParentContext & { sortFilterPaginateParams: string }): Pick<UseQueryResult<VideoGroupDto[]>, ApiQueryProps> {
  const { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch } = useQuery<
    VideoGroupDto[]
  >(
    videoGroupQueryKeys.listItemsWithConstraints(sortFilterPaginateParams),
    () => fetchVideoGroupsWithConstraints({ parentContext, sortFilterPaginateParams }),
    {
      enabled: !!parentContext.boxProfileUuid?.length,
    },
  )

  return { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch }
}

export function useVideoGroupQuery({
  parentContext,
  uuid,
}: ParentContext & { uuid: string | undefined }): Pick<UseQueryResult<VideoGroupDto>, ApiQueryProps> {
  const { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch } =
    useQuery<VideoGroupDto>(videoGroupQueryKeys.detail(uuid), () => fetchVideoGroup({ parentContext, uuid }), {
      enabled: !!uuid?.length && !!parentContext?.boxProfileUuid?.length,
    })

  return { data, status, error, isLoading, isFetching, isSuccess, isError, isRefetchError, refetch }
}

export function useVideoGroupCreateQuery(
  options?: UseMutationOptions<VideoGroupDto, Error, CreateVideoGroupDto & ParentContext>,
): Pick<UseMutationResult<VideoGroupDto, Error, CreateVideoGroupDto & ParentContext>, ApiMutationProps> {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, data, reset, error, isSuccess, isLoading, isError } = useMutation<
    VideoGroupDto,
    Error,
    CreateVideoGroupDto & ParentContext
  >(videoGroupQueryKeys.create(), createVideoGroup, {
    onSuccess: (data, variables, context) => {
      if (typeof options?.onSuccess === 'function') {
        options.onSuccess(data, variables, context)
      }

      // optimistic update local query cache with values
      const { uuid, ...restData } = data
      queryClient.setQueryData(videoGroupQueryKeys.detail(uuid), restData)
    },
  })

  return { mutate, mutateAsync, data, reset, error, isSuccess, isLoading, isError }
}

export function useVideoGroupMutateQuery(
  options?: UseMutationOptions<VideoGroupDto, Error, ApiMutateRequestDto<UpdateVideoGroupDto> & ParentContext>,
): Pick<
  UseMutationResult<VideoGroupDto, Error, ApiMutateRequestDto<UpdateVideoGroupDto> & ParentContext>,
  ApiMutationProps
> {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, data, reset, error, isSuccess, isLoading, isError } = useMutation<
    VideoGroupDto,
    Error,
    ApiMutateRequestDto<UpdateVideoGroupDto> & ParentContext
  >(videoGroupQueryKeys.mutate(), updateVideoGroup, {
    onSuccess: async (data, variables, context) => {
      if (typeof options?.onSuccess === 'function') {
        options.onSuccess(data, variables, context)
      }

      // @todo optimistic update with previous + changed values (merged) prior to refetch?

      const invalidateItems: Promise<void> = queryClient.invalidateQueries(videoGroupQueryKeys.all)
      const invalidateItem: Promise<void> = queryClient.invalidateQueries(videoGroupQueryKeys.detail(variables.uuid))

      // refetch data -- ensure a Promise is returned so the outcome is awaited
      return Promise.all([invalidateItems, invalidateItem])
    },
  })

  return { mutate, mutateAsync, data, reset, error, isSuccess, isLoading, isError }
}

export function useVideoGroupDeleteQuery(
  options?: UseMutationOptions<void, Error, ApiDeleteRequestDto & ParentContext, unknown>,
): Pick<UseMutationResult<void, Error, ApiDeleteRequestDto & ParentContext, unknown>, ApiDeleteHookProps> {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError } = useMutation<
    void,
    Error,
    ApiDeleteRequestDto & ParentContext,
    unknown
  >(
    videoGroupQueryKeys.delete(),
    deleteVideoGroup,
    // @todo experimenting with rollback type functionality -- check docs + examples in case there are other patterns
    {
      onSuccess: async (data, vars, context) => {
        if (typeof options?.onSuccess === 'function') {
          options.onSuccess(data, vars, context)
        }

        queryClient.removeQueries(videoGroupQueryKeys.detail(vars.uuid))

        // refetch data -- ensure a Promise is returned so the outcome is awaited
        return queryClient.invalidateQueries(videoGroupQueryKeys.listItems())
      },
    },
  )

  return { mutate, mutateAsync, reset, error, isSuccess, isLoading, isError }
}
