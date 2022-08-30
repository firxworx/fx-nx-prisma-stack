import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './lib/api-fetch'

import type { VideoGroupDto } from '../types/videos.types'

const VIDEO_GROUPS_KEY_BASE = 'videoGroups' as const

/**
 * Query keys for video groups API query functions.
 */
const videoGroupQueryKeys = {
  all: [VIDEO_GROUPS_KEY_BASE] as const,
}

export async function getVideoGroups(): Promise<VideoGroupDto[]> {
  return apiFetch<VideoGroupDto[]>(`/video-groups`, {
    method: 'GET',
  })
}

export function useVideoGroupsQuery() {
  const { data, status, error, isLoading, isSuccess, isError } = useQuery(videoGroupQueryKeys.all, getVideoGroups)
  return { data, status, error, isLoading, isSuccess, isError }
}
