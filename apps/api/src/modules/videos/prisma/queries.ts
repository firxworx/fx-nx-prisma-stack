import { Prisma } from '@prisma/client'
import { VIDEO_MODEL_PUBLIC_FIELDS } from '../constants/video-model-public-fields.const'
import { VIDEO_GROUP_MODEL_PUBLIC_FIELDS } from '../constants/video-group-model-public-fields.const'
import {
  VideoDtoPrismaSelectClause,
  VideoGroupDtoPrismaSelectClause,
  VideoGroupModelPrismaSelectFields,
  VideoModelPrismaSelectFields,
} from '../types/queries.types'

export const videoPrismaSelectFields: VideoModelPrismaSelectFields = Prisma.validator<Prisma.VideoSelect>()(
  VIDEO_MODEL_PUBLIC_FIELDS.reduce((acc, fieldName) => {
    return {
      ...acc,
      [fieldName]: true,
    }
  }, {} as VideoModelPrismaSelectFields),
)

export const videoGroupPrismaSelectFields: VideoGroupModelPrismaSelectFields =
  Prisma.validator<Prisma.VideoGroupSelect>()(
    VIDEO_GROUP_MODEL_PUBLIC_FIELDS.reduce(
      (acc, fieldName) => ({ ...acc, [fieldName]: true }),
      {} as VideoGroupModelPrismaSelectFields,
    ),
  )

export const videoDtoPrismaSelectClause: VideoDtoPrismaSelectClause = {
  ...videoPrismaSelectFields,
  groups: { select: { videoGroup: { select: videoGroupPrismaSelectFields } } },
}

// array e.g. groupBy: [{ name: 'asc' }] is also valid w/ prisma
export const videoDtoPrismaOrderByClause = Prisma.validator<Prisma.VideoOrderByWithRelationInput>()({ name: 'asc' })

export const videoGroupDtoPrismaSelectClause: VideoGroupDtoPrismaSelectClause = {
  ...videoGroupPrismaSelectFields,
  videos: { select: { video: { select: videoPrismaSelectFields } } },
}

export const videoGroupDtoPrismaOrderByClause = Prisma.validator<Prisma.VideoGroupOrderByWithRelationInput>()({
  name: 'asc',
})
