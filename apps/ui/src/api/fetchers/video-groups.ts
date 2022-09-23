import { apiFetch } from '../lib/api-fetch'

import type { CreateVideoGroupDto, UpdateVideoGroupDto, VideoGroupDto } from '../../types/videos.types'
import type { ApiDeleteRequestDto, ApiMutateRequestDto } from '../../types/api.types'

export interface VideoGroupMutationQueryArgs {
  onSuccess?: () => void
}

// export type VideoGroupQueryEndpoint = 'lists' | 'listData' | 'details' | 'detail' | 'create' | 'mutate' | 'delete'

const VIDEO_GROUPS_REST_ENDPOINT = '/video-groups' as const

// @todo refactor video group api types to shared lib

export async function fetchVideoGroups(): Promise<VideoGroupDto[]> {
  return apiFetch<VideoGroupDto[]>(VIDEO_GROUPS_REST_ENDPOINT, {
    method: 'GET',
  })
}

export async function fetchVideoGroupsFiltered(params: string): Promise<VideoGroupDto[]> {
  return apiFetch<VideoGroupDto[]>(
    `${VIDEO_GROUPS_REST_ENDPOINT}${params ? `${params}?sortFilterPaginationParams` : ''}`,
    {
      method: 'GET',
    },
  )
}

export async function fetchVideoGroup(uuid?: string): Promise<VideoGroupDto> {
  return apiFetch<VideoGroupDto>(`${VIDEO_GROUPS_REST_ENDPOINT}/${uuid}`, {
    method: 'GET',
  })
}

export async function createVideoGroup(data: CreateVideoGroupDto): Promise<VideoGroupDto> {
  return apiFetch<VideoGroupDto>(VIDEO_GROUPS_REST_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateVideoGroup({
  uuid,
  ...restData
}: ApiMutateRequestDto<UpdateVideoGroupDto>): Promise<VideoGroupDto> {
  return apiFetch<VideoGroupDto>(`${VIDEO_GROUPS_REST_ENDPOINT}/${uuid}`, {
    method: 'PATCH',
    body: JSON.stringify(restData),
  })
}

export async function deleteVideoGroup({ uuid }: ApiDeleteRequestDto): Promise<void> {
  await apiFetch<void>(`${VIDEO_GROUPS_REST_ENDPOINT}/${uuid}`, {
    method: 'DELETE',
  })
}
