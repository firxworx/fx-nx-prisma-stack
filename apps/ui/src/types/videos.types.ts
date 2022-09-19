// @temp until refactor to shared project lib

import type { ApiObject } from './api-object.interface'
import { VideoPlatform } from './enums/videos.enums'

export interface VideoDto extends ApiObject {
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

export interface VideoGroupDto extends ApiObject {
  createdAt: Date
  updatedAt: Date // @todo handle dates response
  name: string
  description: string
  videos: VideoDto[]
}

export interface CreateVideoGroupDto extends Pick<VideoGroupDto, 'name' | 'description'> {
  videos?: VideoGroupDto['videos'][number]['uuid'][]
}

export interface UpdateVideoGroupDto extends Partial<CreateVideoGroupDto> {}
