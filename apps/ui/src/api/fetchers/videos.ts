// @todo create shared lib with interfaces of api responses

import { apiFetch } from '../lib/api-fetch'
import type { VideoDto, CreateVideoDto, UpdateVideoDto } from '../../types/videos.types'
import { ApiDeleteRequestDto, ApiMutateRequestDto } from '../../types/api.types'

export async function getVideos(): Promise<VideoDto[]> {
  return apiFetch<VideoDto[]>(`/videos`, {
    method: 'GET',
  })
}

export async function getVideosData(params: string): Promise<VideoDto[]> {
  return apiFetch<VideoDto[]>(`/videos${params ? `${params}?sortFilterPaginationParams` : ''}`, {
    method: 'GET',
  })
}

export async function getVideo(uuid?: string): Promise<VideoDto> {
  return apiFetch<VideoDto>(`/videos/${uuid}`, {
    method: 'GET',
  })
}

// @todo implement the videos array and refactor types to shared lib
export async function createVideo(data: CreateVideoDto): Promise<VideoDto> {
  return apiFetch<VideoDto>(`/videos`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// @todo implement the videos array and refactor types to shared lib
export async function updateVideo({ uuid, ...restData }: ApiMutateRequestDto<UpdateVideoDto>): Promise<VideoDto> {
  return apiFetch<VideoDto>(`/videos/${uuid}`, {
    method: 'PATCH',
    body: JSON.stringify(restData),
  })
}

export async function deleteVideo({ uuid }: ApiDeleteRequestDto): Promise<void> {
  await apiFetch<void>(`/videos/${uuid}`, {
    method: 'DELETE',
  })
}
