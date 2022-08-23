import { VideoGroupModelResponseDto, VideoModelResponseDto } from './response.types'

export type VideoModelPrismaSelectFields = Record<keyof VideoModelResponseDto, true>
export type VideoGroupModelPrismaSelectFields = Record<keyof VideoGroupModelResponseDto, true>

export type VideoDtoPrismaSelectClause = VideoModelPrismaSelectFields & {
  groups: { select: { videoGroup: { select: VideoGroupModelPrismaSelectFields } } }
}
export type VideoGroupDtoPrismaSelectClause = VideoGroupModelPrismaSelectFields & {
  videos: { select: { video: { select: VideoModelPrismaSelectFields } } }
}

export type PrismaVideoQueryResult = VideoModelResponseDto & { groups: { videoGroup: VideoGroupModelResponseDto }[] }
export type PrismaVideoGroupQueryResult = VideoGroupModelResponseDto & { videos: { video: VideoModelResponseDto }[] }
