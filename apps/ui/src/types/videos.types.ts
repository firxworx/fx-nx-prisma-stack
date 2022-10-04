// @temp until refactor to shared project lib

import type { ApiBaseDto } from './api.types'
import { VideoPlatform } from './enums/videos.enums'

export interface VideoDto extends ApiBaseDto {
  name: string
  platform: VideoPlatform
  externalId: string
  createdAt: Date
  updatedAt: Date
  groups: VideoGroupDto[]
}

export interface CreateVideoDto extends Pick<VideoDto, 'name' | 'platform' | 'externalId'> {
  groups?: VideoDto['groups'][number]['uuid'][]
}

export interface UpdateVideoDto extends Partial<CreateVideoDto> {}

export interface VideoGroupDto extends ApiBaseDto {
  createdAt: Date
  updatedAt: Date // @todo handle dates response
  enabledAt: Date | null
  name: string
  videos: VideoDto[]
}

export interface CreateVideoGroupDto extends Pick<VideoGroupDto, 'name'> {
  enabled?: boolean
  videos?: VideoGroupDto['videos'][number]['uuid'][]
}

export interface UpdateVideoGroupDto extends Partial<CreateVideoGroupDto> {}
