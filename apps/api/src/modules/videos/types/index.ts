import type { Video, VideoGroup } from '@prisma/client'

import { VIDEO_DTO_FIELDS } from './type-constants/video-dto-fields'
import { VIDEO_GROUP_DTO_FIELDS } from './type-constants/video-group-dto-fields'

export type VideoModelDtoField = typeof VIDEO_DTO_FIELDS[number]
export type VideoGroupModelDtoField = typeof VIDEO_GROUP_DTO_FIELDS[number]
export type VideoModelDto = Pick<Video, VideoModelDtoField>
export type VideoGroupModelDto = Pick<VideoGroup, VideoGroupModelDtoField>

export type VideoDto = VideoModelDto & { groups: VideoGroupModelDto[] }
export type VideoGroupDto = VideoGroupModelDto & { videos: VideoModelDto[] }

export type PrismaVideoQueryResult = VideoModelDto & { groups: { videoGroup: VideoGroupModelDto }[] }
export type PrismaVideoGroupQueryResult = VideoGroupModelDto & { videos: { video: VideoModelDto }[] }
