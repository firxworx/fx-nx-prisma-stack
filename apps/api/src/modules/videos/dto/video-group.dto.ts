import { InternalServerErrorException } from '@nestjs/common'
import type { Video, VideoGroup } from '@prisma/client'
import { Expose, Type } from 'class-transformer'
import { VIDEO_GROUP_MODEL_PUBLIC_FIELDS } from '../constants/video-group-model-public-fields.const'
import type { VideoGroupResponse } from '../types/response.types'
import { VideoDto } from './video.dto'

export const VIDEO_GROUP_MODEL_NULLABLE_FIELDS: (keyof VideoGroup)[] = ['description']

/**
 * Response DTO for VideoGroup model, compatible with NestJS' `ClassSerializerInterceptor`.
 *
 * The constructor accepts the result of a prisma query that includes nested Video's,
 * validates that required fields are set (or else throws an error to safeguard
 * against regressions that omit required response data), and maps the data to this DTO.
 */
export class VideoGroupDto implements VideoGroupResponse {
  @Expose()
  uuid!: string

  @Expose()
  createdAt!: Date

  @Expose()
  updatedAt!: Date

  @Expose()
  name!: string

  @Expose()
  description!: string | null

  @Expose()
  @Type(() => VideoDto)
  videos!: VideoDto[]

  constructor(partial: Partial<VideoGroup & { videos: { video: Partial<Video> }[] }>) {
    const videoGroupFields = VIDEO_GROUP_MODEL_PUBLIC_FIELDS.reduce((acc, fieldName) => {
      if (
        (!VIDEO_GROUP_MODEL_NULLABLE_FIELDS.includes(fieldName) && partial[fieldName] === undefined) ||
        partial[fieldName] === null
      ) {
        throw new InternalServerErrorException(
          `Invalid query result: missing expected data for required field '${fieldName}'`,
        )
      }

      return {
        ...acc,
        [fieldName]: partial[fieldName] ?? null,
      }
    }, {} as VideoGroup)

    // map prisma's overly-nested query result (due to many-to-many) to response DTO
    // the sort is because it doesn't appear currently possible to sort nested results w/ select (only via raw sql query)
    const videosField =
      partial.videos?.map((vg) => new VideoDto(vg.video)).sort((a, b) => a.name.localeCompare(b.name)) ?? []

    Object.assign(this, videoGroupFields, { videos: videosField })
  }
}
