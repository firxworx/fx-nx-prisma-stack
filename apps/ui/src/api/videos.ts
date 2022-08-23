// @todo create shared lib with interfaces of api responses

import { useQuery } from '@tanstack/react-query'

import { apiFetch } from './lib/api-fetch'
import type { VideoGroupQueryDto, VideoQueryDto } from '../types/videos.types'

const VIDEOS_KEY_BASE = 'videos' as const
const VIDEO_GROUPS_KEY_BASE = 'videoGroups' as const

/**
 * Query keys for videos API functions.
 */
const videoQueryKeys = {
  all: [VIDEOS_KEY_BASE] as const,
  lists: () => [...videoQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...videoQueryKeys.lists(), { filters }] as const,
  details: () => [...videoQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...videoQueryKeys.details(), id] as const,
}

const videoGroupQueryKeys = {
  all: [VIDEO_GROUPS_KEY_BASE] as const,
}

export async function getVideos(): Promise<VideoQueryDto[]> {
  return apiFetch<VideoQueryDto[]>(`/videos`, {
    method: 'GET',
  })
}

export async function getVideoGroups(): Promise<VideoGroupQueryDto[]> {
  return apiFetch<VideoGroupQueryDto[]>(`/video-groups`, {
    method: 'GET',
  })
}

export function useVideosQuery() {
  const { data, status, error, isLoading, isSuccess, isError } = useQuery(videoQueryKeys.all, getVideos)
  return { data, status, error, isLoading, isSuccess, isError }
}

export function useVideoGroupsQuery() {
  const { data, status, error, isLoading, isSuccess, isError } = useQuery(videoGroupQueryKeys.all, getVideoGroups)
  return { data, status, error, isLoading, isSuccess, isError }
}
