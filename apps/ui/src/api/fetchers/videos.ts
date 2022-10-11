// @todo create shared lib with interfaces of api responses

import { apiFetch } from '../lib/api-fetch'
import type { VideoDto, CreateVideoDto, UpdateVideoDto } from '../../types/videos.types'
import { ApiDeleteRequestDto, ApiMutateRequestDto } from '../../types/api.types'
import type { ApiParentContext } from '../types/common.types'
import type { BoxProfileChildQueryContext } from '../../types/box-profiles.types'

type ParentContext = ApiParentContext<BoxProfileChildQueryContext>

const VIDEO_GROUPS_REST_ENDPOINT_BASE = '/opx' as const

const getRestEndpoint = ({ boxProfileUuid }: ParentContext['parentContext']): string => {
  if (!boxProfileUuid) {
    throw new Error('API fetch requires parent context to be defined')
  }

  return `${VIDEO_GROUPS_REST_ENDPOINT_BASE}/${boxProfileUuid}/videos`
}

export async function fetchVideos({ parentContext }: ParentContext): Promise<VideoDto[]> {
  return apiFetch<VideoDto[]>(getRestEndpoint(parentContext), {
    method: 'GET',
  })
}

export async function fetchVideosWithConstraints({
  parentContext,
  sortFilterPaginateParams,
}: ParentContext & { sortFilterPaginateParams: string }): Promise<VideoDto[]> {
  return apiFetch<VideoDto[]>(
    `${getRestEndpoint(parentContext)}${
      sortFilterPaginateParams ? `${sortFilterPaginateParams}?sortFilterPaginationParams` : ''
    }`,
    {
      method: 'GET',
    },
  )
}

export async function fetchVideo({ parentContext, uuid }: ParentContext & { uuid?: string }): Promise<VideoDto> {
  return apiFetch<VideoDto>(`${getRestEndpoint(parentContext)}/${uuid}`, {
    method: 'GET',
  })
}

// @todo implement the videos array and refactor types to shared lib
export async function fetchCreateVideo({ parentContext, ...data }: ParentContext & CreateVideoDto): Promise<VideoDto> {
  return apiFetch<VideoDto>(getRestEndpoint(parentContext), {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function fetchCreateVideoWithParentContext(
  parentContext: ParentContext['parentContext'],
): (data: CreateVideoDto) => Promise<VideoDto> {
  return (data: CreateVideoDto) => fetchCreateVideo({ parentContext, ...data })
}

// @todo implement the videos array and refactor types to shared lib
export async function fetchMutateVideo({
  parentContext,
  uuid,
  ...data
}: ParentContext & ApiMutateRequestDto<UpdateVideoDto>): Promise<VideoDto> {
  return apiFetch<VideoDto>(`${getRestEndpoint(parentContext)}/${uuid}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function fetchMutateVideoWithParentContext(
  parentContext: ParentContext['parentContext'],
): (uuidAndData: ApiMutateRequestDto<UpdateVideoDto>) => Promise<VideoDto> {
  return (uuidAndData: ApiMutateRequestDto<UpdateVideoDto>) => fetchMutateVideo({ parentContext, ...uuidAndData })
}

export async function fetchDeleteVideo({ parentContext, uuid }: ParentContext & ApiDeleteRequestDto): Promise<void> {
  await apiFetch<void>(`${getRestEndpoint(parentContext)}/${uuid}`, {
    method: 'DELETE',
  })
}

export function fetchDeleteVideoWithParentContext(
  parentContext: ParentContext['parentContext'],
): (uuid: ApiDeleteRequestDto) => Promise<void> {
  return (uuid: ApiDeleteRequestDto) => fetchDeleteVideo({ parentContext, ...uuid })
}
