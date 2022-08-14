import type { Video, VideoGroup } from '@prisma/client'

import { VIDEO_MODEL_PUBLIC_FIELDS } from '../constants/video-model-public-fields.const'
import { VIDEO_GROUP_MODEL_PUBLIC_FIELDS } from '../constants/video-group-model-public-fields.const'

export type VideoModelResponseDto = Pick<Video, typeof VIDEO_MODEL_PUBLIC_FIELDS[number]>
export type VideoGroupModelResponseDto = Pick<VideoGroup, typeof VIDEO_GROUP_MODEL_PUBLIC_FIELDS[number]>

export interface VideoResponse extends VideoModelResponseDto {
  groups: VideoGroupModelResponseDto[]
}
export interface VideoGroupResponse extends VideoGroupModelResponseDto {
  videos: VideoModelResponseDto[]
}
