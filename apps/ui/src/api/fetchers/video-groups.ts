import { apiFetch } from '../lib/api-fetch'

import type { CreateVideoGroupDto, UpdateVideoGroupDto, VideoGroupDto } from '../../types/videos.types'
import type { ApiDeleteRequestDto, ApiMutateRequestDto } from '../../types/api.types'
import type { ApiParentContext } from '../types/common.types'
import type { BoxProfileChildQueryContext } from '../../types/box-profiles.types'

// @todo refactor video group api types to shared nx lib
// const VIDEO_GROUPS_REST_ENDPOINT = '/opx/video-groups' as const

// partial is to support nuances of nextjs router with more flexibility
// the fetchers will throw (via `getVideoGroupsRestEndpoint()`) if any values are undefined

type ParentContext = ApiParentContext<BoxProfileChildQueryContext>

const VIDEO_GROUPS_REST_ENDPOINT_BASE = '/opx' as const

const getRestEndpoint = ({ boxProfileUuid }: ParentContext['parentContext']): string => {
  if (!boxProfileUuid) {
    throw new Error('API fetch requires parent context to be defined')
  }

  return `${VIDEO_GROUPS_REST_ENDPOINT_BASE}/${boxProfileUuid}/video-groups`
}

export async function fetchVideoGroups({ parentContext }: ParentContext): Promise<VideoGroupDto[]> {
  return apiFetch<VideoGroupDto[]>(getRestEndpoint(parentContext), {
    method: 'GET',
  })
}

export async function fetchVideoGroupsWithConstraints({
  parentContext,
  sortFilterPaginateParams,
}: { sortFilterPaginateParams: string } & ParentContext): Promise<VideoGroupDto[]> {
  return apiFetch<VideoGroupDto[]>(
    `${getRestEndpoint(parentContext)}${
      sortFilterPaginateParams ? `${sortFilterPaginateParams}?sortFilterPaginationParams` : ''
    }`,
    {
      method: 'GET',
    },
  )
}

export async function fetchVideoGroup({
  parentContext,
  uuid,
}: ParentContext & { uuid?: string }): Promise<VideoGroupDto> {
  return apiFetch<VideoGroupDto>(`${getRestEndpoint(parentContext)}/${uuid}`, {
    method: 'GET',
  })
}

export async function createVideoGroup({
  parentContext,
  ...data
}: CreateVideoGroupDto & ParentContext): Promise<VideoGroupDto> {
  return apiFetch<VideoGroupDto>(getRestEndpoint(parentContext), {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateVideoGroup({
  parentContext,
  uuid,
  ...data
}: ApiMutateRequestDto<UpdateVideoGroupDto> & ParentContext): Promise<VideoGroupDto> {
  return apiFetch<VideoGroupDto>(`${getRestEndpoint(parentContext)}/${uuid}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteVideoGroup({ parentContext, uuid }: ApiDeleteRequestDto & ParentContext): Promise<void> {
  await apiFetch<void>(`${getRestEndpoint(parentContext)}/${uuid}`, {
    method: 'DELETE',
  })
}
