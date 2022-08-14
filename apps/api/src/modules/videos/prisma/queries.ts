import { Prisma } from '@prisma/client'
import type { VideoGroupModelDto, VideoModelDto } from '../types'
import { VIDEO_DTO_FIELDS } from '../types/type-constants/video-dto-fields'
import { VIDEO_GROUP_DTO_FIELDS } from '../types/type-constants/video-group-dto-fields'

export type VideoModelPrismaSelectFields = Record<keyof VideoModelDto, true>
export type VideoGroupModelPrismaSelectFields = Record<keyof VideoGroupModelDto, true>

export type VideoDtoPrismaSelectClause = VideoModelPrismaSelectFields & {
  groups: { select: { videoGroup: { select: VideoGroupModelPrismaSelectFields } } }
}
export type VideoGroupDtoPrismaSelectClause = VideoGroupModelPrismaSelectFields & {
  videos: { select: { video: { select: VideoModelPrismaSelectFields } } }
}

export const videoPrismaSelectFields: VideoModelPrismaSelectFields = Prisma.validator<Prisma.VideoSelect>()(
  VIDEO_DTO_FIELDS.reduce((acc, fieldName) => {
    return {
      ...acc,
      [fieldName]: true,
    }
  }, {} as VideoModelPrismaSelectFields),
)

export const videoGroupPrismaSelectFields: VideoGroupModelPrismaSelectFields =
  Prisma.validator<Prisma.VideoGroupSelect>()(
    VIDEO_GROUP_DTO_FIELDS.reduce(
      (acc, fieldName) => ({ ...acc, [fieldName]: true }),
      {} as VideoGroupModelPrismaSelectFields,
    ),
  )

export const videoDtoPrismaSelectClause: VideoDtoPrismaSelectClause = {
  ...videoPrismaSelectFields,
  groups: { select: { videoGroup: { select: videoGroupPrismaSelectFields } } },
}

export const videoGroupDtoPrismaSelectClause: VideoGroupDtoPrismaSelectClause = {
  ...videoGroupPrismaSelectFields,
  videos: { select: { video: { select: videoPrismaSelectFields } } },
}
